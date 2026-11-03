// VOIDSCAN 磁碟指揮中心：規則掃描＋Agent 深掃＋獨立複核＋經你確認才清理
// Agent 透過 OAR 驅動 Claude Code，並被 macOS 沙盒鎖成唯讀；只有這支程式能刪除。

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { defaultRuntimes, promptAndWait } from "@botiverse/oar";

const run = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = os.homedir();
const PORT = Number(process.env.PORT || 4848);
const DATA_VOLUME = "/System/Volumes/Data";
const AGENT_CWD = path.join(HERE, "agent-cwd");
fs.mkdirSync(AGENT_CWD, { recursive: true });
const INTERNAL_TOKEN = crypto.randomBytes(24).toString("hex");
const h = (p) => path.isAbsolute(p) ? p : path.join(HOME, p.replace(/^~\//, ""));

// 個人設定：要額外保護的資料夾、要在地圖上單獨顯示的資料夾、模型（見 voidscan.config.json）
let CONFIG = {};
try { CONFIG = JSON.parse(fs.readFileSync(path.join(HERE, "voidscan.config.json"), "utf8")); } catch {}
const MODEL = process.env.VOIDSCAN_MODEL || CONFIG.model || "sonnet";

// ───────────── 保護清單：不管誰建議，這些位置一律拒絕刪除 ─────────────
const PROTECTED = [
  "Documents", "Desktop", "Pictures", "Movies", "Music", "Library/Mobile Documents",
  "Library/Mail", "Library/Messages", "Library/Photos", "Library/Keychains",
  "Library/Application Support/AddressBook", "Library/Application Support/CallHistoryDB", "Library/Safari",
  ".ssh", ".gnupg", ".config", ".aws", ".kube",
  ".claude/projects", ".claude.json", ".claude/skills", ".claude/plugins", ".codex/sessions", ".ollama",
  ...(CONFIG.protect || []),
].map(h).concat(HERE);
const CLAUDE_TMP = `/private/tmp/claude-${process.getuid()}`;

function protectedReason(target) {
  const p = path.resolve(target);
  if (p === HOME) return "家目錄本身";
  if (!(p.startsWith(HOME + "/") || p.startsWith(CLAUDE_TMP + "/"))) return "不在家目錄裡";
  if (p.startsWith(HOME + "/") && p.slice(HOME.length + 1).split("/").length < 2 && !p.includes("/.")) {
    return "家目錄第一層資料夾";
  }
  for (const guard of PROTECTED) {
    if (p === guard || p.startsWith(guard + "/")) return `受保護位置（${guard.replace(HOME, "~")}）`;
    if (guard.startsWith(p + "/")) return `裡面有受保護位置（${guard.replace(HOME, "~")}）`;
  }
  if (["Library", "Library/Application Support", "Library/Caches", "Library/Containers", ".cache", ".claude", ".codex"]
    .map(h).includes(p)) return "整個系統資料夾";
  return null;
}

// ───────────── 狀態與即時推播 ─────────────
const state = {
  disk: null,
  categories: [],
  suggestions: new Map(),
  phase: "idle", // idle | quick | agent | review | clean
  lanes: { scan: "idle", review: "idle", clean: "idle" },
  confirmed: new Set(),
  lastClean: null,
  cleaning: false, // 清理和掃描分開：複核通過的項目不必等 Agent 掃完就能清
};
function setCleaning(on, stage = "clean") {
  state.cleaning = on;
  emit("cleaning", { on, stage });
}
const clients = new Set();
// 工作紀錄：Agent 每一步都留下來，重新整理網頁也看得到
const JOURNAL_TYPES = new Set(["agent", "lane", "measuring", "category", "found", "rulesDone", "scanDone", "reset"]);
state.journal = [];
function emit(type, payload = {}) {
  const msg = { type, ...payload };
  if (JOURNAL_TYPES.has(type)) {
    if (type === "reset") state.journal = [];
    state.journal.push(msg);
    if (state.journal.length > 6000) state.journal.splice(0, state.journal.length - 6000);
  }
  const line = `data: ${JSON.stringify(msg)}\n\n`;
  for (const res of clients) res.write(line);
  scheduleSave();
}

// 掃描結果存檔，重開程式不會不見
const SAVE_FILE = path.join(HERE, "data/state.json");
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data = { disk: state.disk, categories: state.categories, suggestions: [...state.suggestions.values()], lastClean: state.lastClean, journal: state.journal, lanes: state.lanes };
    fsp.mkdir(path.dirname(SAVE_FILE), { recursive: true })
      .then(() => fsp.writeFile(SAVE_FILE + ".tmp", JSON.stringify(data)))
      .then(() => fsp.rename(SAVE_FILE + ".tmp", SAVE_FILE))
      .catch(() => {});
  }, 800);
}
function loadSaved() {
  try {
    const data = JSON.parse(fs.readFileSync(SAVE_FILE, "utf8"));
    state.categories = data.categories || [];
    state.lastClean = data.lastClean || null;
    state.journal = data.journal || [];
    for (const lane of Object.keys(state.lanes)) if (data.lanes?.[lane]) state.lanes[lane] = data.lanes[lane] === "running" ? "done" : data.lanes[lane];
    for (const s of data.suggestions || []) {
      if (s.review === "reviewing") s.review = "pending";
      if (s.status === "cleaning") s.status = "ready";
      state.suggestions.set(s.id, s);
    }
  } catch {}
}
const pub = (s) => ({ ...s, inode: undefined });
const snapshot = () => ({
  disk: state.disk,
  categories: state.categories,
  suggestions: [...state.suggestions.values()].map(pub),
  phase: state.phase,
  lanes: state.lanes,
  lastClean: state.lastClean,
  cleaning: state.cleaning,
  journal: state.journal,
  home: HOME,
  model: MODEL,
});

// ───────────── 測量 ─────────────
async function duKB(target) {
  try {
    const { stdout } = await run("/usr/bin/du", ["-skx", target], { maxBuffer: 1 << 20, timeout: 240000 });
    return Number(stdout.split("\t")[0]) || 0;
  } catch (error) {
    const out = String(error.stdout || "");
    return Number(out.split("\t")[0]) || 0; // 部分無權限的子資料夾略過，其餘照算
  }
}
const exists = (p) => fs.existsSync(p);

async function diskInfo() {
  const s = fs.statfsSync(DATA_VOLUME);
  const total = s.blocks * s.bsize;
  const free = s.bavail * s.bsize;
  let swap = 0;
  try {
    const { stdout } = await run("/usr/sbin/sysctl", ["-n", "vm.swapusage"]);
    const m = stdout.match(/total = ([\d.]+)M/);
    if (m) swap = Number(m[1]) * 1024 * 1024;
  } catch {}
  return { total, free, used: total - free, swap, at: Date.now() };
}

// 用量圖分類：paths 量完相加，minus 是已經算在別類的子資料夾
const CATEGORY_SPECS = [
  { id: "apps", label: "應用程式", icon: "◈", paths: ["/Applications"] },
  { id: "ai", label: "AI 對話與工具", icon: "◉", paths: [".claude", ".codex", ".claude-mem", ".grokbot", "Library/Application Support/Claude", "Library/Application Support/Codex"].map(h) },
  { id: "dev", label: "開發工具", icon: "⌘", paths: [".npm", ".cache", ".cargo", ".rustup", ".pnpm-store", "Library/pnpm", ".bun", "go", ".gradle", "Library/Developer", ".docker", ".vscode", ".local"].map(h) },
  { id: "browser", label: "瀏覽器", icon: "◎", paths: ["Library/Application Support/Google", "Library/Caches/Google"].map(h) },
  { id: "cache", label: "系統快取", icon: "≋", paths: [h("Library/Caches")], minus: [h("Library/Caches/Google")] },
  { id: "appdata", label: "其他 App 資料", icon: "▣", paths: ["Library/Application Support", "Library/Containers", "Library/Group Containers"].map(h),
    minus: ["Library/Application Support/Claude", "Library/Application Support/Codex", "Library/Application Support/Google"].map(h) },
  { id: "syspkg", label: "系統層程式與套件", icon: "⚙", paths: ["/opt/homebrew", "/usr/local", "/Library", "/Users/Shared"] },
  ...(CONFIG.categories || []).map((c, i) => ({ id: `my${i}`, label: c.label, icon: "◆", paths: c.paths.map(h) })),
  { id: "downloads", label: "下載", icon: "↓", paths: [h("Downloads")] },
  { id: "media", label: "文件與影音", icon: "▶", paths: ["Documents", "Desktop", "Movies", "Music", "Pictures"].map(h) },
];

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

async function quickScan() {
  state.phase = "quick";
  emit("phase", { phase: "quick" });
  await measureCategories();
  await ruleScan();
}

async function measureCategories() {
  state.disk = await diskInfo();
  emit("disk", { disk: state.disk });
  const cats = [];
  // 整個家目錄另外量一次，沒歸類的部分算「專案與其他檔案」
  const homeTotal = duKB(HOME);
  await pool(CATEGORY_SPECS, 3, async (spec) => {
    emit("measuring", { id: spec.id, label: spec.label });
    let kb = 0;
    for (const p of spec.paths) if (exists(p)) kb += await duKB(p);
    for (const p of spec.minus || []) if (exists(p)) kb -= await duKB(p);
    const cat = { id: spec.id, label: spec.label, icon: spec.icon, bytes: Math.max(0, kb) * 1024, paths: spec.paths };
    cats.push(cat);
    emit("category", { category: cat });
  });
  emit("measuring", { id: "projects", label: "整個家目錄" });
  const homeBytes = (await homeTotal) * 1024;
  const inHome = cats.filter((c) => c.paths.some((p) => p.startsWith(HOME + "/"))).reduce((a, c) => a + c.bytes, 0);
  const projects = { id: "projects", label: "專案與其他檔案", icon: "⌂", bytes: Math.max(0, homeBytes - inHome), paths: [HOME], note: "家目錄裡的專案資料夾與零散檔案" };
  cats.push(projects);
  emit("category", { category: projects });
  const measured = cats.reduce((a, c) => a + c.bytes, 0);
  const swap = state.disk.swap;
  cats.push({ id: "swap", label: "備用記憶體", icon: "⟲", bytes: swap, note: "重開機才會歸還" });
  cats.push({ id: "system", label: "系統與受保護區域", icon: "⬡", bytes: Math.max(0, state.disk.used - measured - swap), note: "macOS 本身、快照與沒有完整磁碟取用權限看不到的位置" });
  cats.push({ id: "free", label: "可用", icon: "○", bytes: state.disk.free });
  state.categories = cats.sort((a, b) => b.bytes - a.bytes);
  emit("categories", { categories: state.categories });
}

// ───────────── 規則：固定位置的可重建暫存 ─────────────
const RULES = [
  { title: "動態桌布影片", glob: "Library/Application Support/com.apple.wallpaper/aerials/videos", what: "macOS 動態桌布下載的 4K 影片", recover: "可自動重建", reason: "系統會在需要時重新下載", app: null },
  { title: "Chrome 網頁暫存", glob: "Library/Caches/Google/Chrome/*/Cache", what: "Chrome 存的網頁圖片與檔案副本", recover: "可自動重建", reason: "不含登入狀態與書籤，瀏覽時會重新下載", app: "Google Chrome" },
  { title: "Chrome 程式碼暫存", glob: "Library/Caches/Google/Chrome/*/Code Cache", what: "網頁 JavaScript 編譯後的暫存", recover: "可自動重建", reason: "開網頁時自動重建", app: "Google Chrome" },
  { title: "Chrome 擴充更新暫存", glob: "Library/Application Support/Google/GoogleUpdater/crx_cache", what: "Chrome 更新程式下載的安裝包", recover: "可自動重建", reason: "安裝完就不再需要", app: null },
  { title: "npm 下載暫存", glob: ".npm/_cacache", what: "npm 下載過的套件壓縮檔", recover: "可重新下載", reason: "下次安裝套件時重新下載", app: null },
  { title: "pnpm 下載暫存", glob: "Library/Caches/pnpm", what: "pnpm 套件暫存", recover: "可重新下載", reason: "下次安裝時重新下載", app: null },
  { title: "pip 下載暫存", glob: "Library/Caches/pip", what: "Python 套件下載暫存", recover: "可重新下載", reason: "下次安裝時重新下載", app: null },
  { title: "Homebrew 安裝包暫存", glob: "Library/Caches/Homebrew", what: "brew 下載過的安裝包", recover: "可重新下載", reason: "已安裝的程式不受影響", app: null },
  { title: "Xcode 編譯暫存", glob: "Library/Developer/Xcode/DerivedData", what: "Xcode 編譯中間檔", recover: "可自動重建", reason: "下次編譯時重建", app: "Xcode" },
  { title: "Playwright 測試瀏覽器", glob: "Library/Caches/ms-playwright", what: "自動化測試用的瀏覽器", recover: "可重新下載", reason: "需要時執行 playwright install 重新下載", app: null },
  { title: "Codex 暫存", glob: "Library/Caches/com.openai.codex", what: "Codex App 的暫存", recover: "可自動重建", reason: "App 會自己重建", app: "Codex" },
];

function expandGlob(pattern) {
  const parts = pattern.split("/");
  let paths = [HOME];
  for (const part of parts) {
    const next = [];
    for (const base of paths) {
      if (part === "*") {
        try { for (const d of fs.readdirSync(base, { withFileTypes: true })) if (d.isDirectory()) next.push(path.join(base, d.name)); } catch {}
      } else if (exists(path.join(base, part))) next.push(path.join(base, part));
    }
    paths = next;
  }
  return paths;
}

const sid = (p) => crypto.createHash("sha1").update(p).digest("hex").slice(0, 10);
const shq = (p) => `'${p.replace(/'/g, `'\\''`)}'`;

function addSuggestion(s) {
  const st = fs.lstatSync(s.path);
  const item = {
    id: sid(s.path), source: s.source, title: s.title, path: s.path, display: s.path.replace(HOME, "~"),
    what: s.what, reason: s.reason, recover: s.recover, app: s.app || null, bytes: s.bytes,
    command: `rm -rf -- ${shq(s.path)}`, advice: s.advice || "建議清理",
    review: s.advice === "不建議清理" ? "withdrawn" : "pending", reviewNote: s.advice === "不建議清理" ? s.reason : "",
    inode: st.ino, status: "ready",
  };
  state.suggestions.set(item.id, item);
  emit("suggestion", { suggestion: pub(item) });
  emit("found", { source: item.source, title: item.title, bytes: item.bytes });
  return item;
}

async function ruleScan() {
  for (const rule of RULES) {
    for (const p of expandGlob(rule.glob)) {
      if (protectedReason(p) || fs.lstatSync(p).isSymbolicLink()) continue;
      const bytes = (await duKB(p)) * 1024;
      if (bytes < 20 * 1024 * 1024) continue;
      addSuggestion({ ...rule, path: p, bytes, source: "rule" });
    }
  }
  // Claude 暫存區：單一失控大檔
  try {
    const { stdout } = await run("/usr/bin/find", [CLAUDE_TMP, "-type", "f", "-size", "+500M", "-mmin", "+60"], { timeout: 60000 });
    for (const p of stdout.split("\n").filter(Boolean)) {
      addSuggestion({ title: "Claude 背景指令輸出", path: p, bytes: fs.statSync(p).size, source: "rule", what: "Claude 背景工作的輸出紀錄", recover: "無法找回", reason: "一小時沒有寫入的超大輸出紀錄，通常是失控的重複輸出", app: null });
    }
  } catch {}
  state.phase = "idle";
  emit("phase", { phase: "idle" });
  emit("rulesDone", { count: [...state.suggestions.values()].filter((s) => s.source === "rule").length });
}

// ───────────── Agent（OAR × Claude Code，沙盒唯讀） ─────────────
const INSTALLATION = { kind: "available", via: "executable", command: path.join(HERE, "sandbox/claude-sandboxed.sh") };
const sessions = { scan: null, review: null, clean: null };

function trimText(s, n) { return s.length > n ? s.slice(0, n) + "…" : s; }

async function runAgent(lane, prompt, { mcp = false, timeoutMs = 12 * 60 * 1000 } = {}) {
  const claude = defaultRuntimes.require("claude");
  state.lanes[lane] = "running";
  emit("lane", { lane, status: "running", model: MODEL });
  const options = {
    cwd: AGENT_CWD, model: MODEL, userConfiguration: "exclude",
    disallowedTools: ["Write", "Edit", "NotebookEdit", "WebFetch", "WebSearch", "Agent", "Task"],
    appendSystemPrompt: "你在 macOS 沙盒裡，只能讀取，任何寫入或刪除都會被系統拒絕。一律用繁體中文思考與回答。",
  };
  if (mcp) {
    options.mcpServers = [{
      name: "voidscan", command: process.execPath, args: [path.join(HERE, "mcp-bridge.mjs")],
      env: { VOIDSCAN_URL: `http://127.0.0.1:${PORT}`, VOIDSCAN_TOKEN: INTERNAL_TOKEN },
    }];
  }
  const session = await claude.session(INSTALLATION, options);
  sessions[lane] = session;
  const started = Date.now();
  const toolNames = new Map(); // 工具名稱只在開始時出現，先記住
  session.events((e) => {
    if (e.agentPath?.length) return;
    switch (e.kind) {
      case "tool_call_started": toolNames.set(e.callId, e.tool); break;
      case "text_delta": emit("agent", { lane, k: "text", text: e.text }); break;
      case "reasoning": if (e.content?.kind === "text") emit("agent", { lane, k: "think", text: e.content.text }); break;
      case "tool_call_input": {
        let input = {};
        try { input = JSON.parse(e.input); } catch {}
        const cmd = input.command || input.pattern || input.file_path || input.path || JSON.stringify(input);
        emit("agent", { lane, k: "tool", tool: (e.tool || toolNames.get(e.callId) || "").replace(/^mcp__voidscan__/, "VOIDSCAN·"), callId: e.callId, text: trimText(String(cmd), 400), desc: input.description || "" });
        break;
      }
      case "tool_call_ended": {
        const text = (e.content || []).map((c) => c.text || "").join("\n");
        emit("agent", { lane, k: "result", callId: e.callId, ok: e.result === "ok", text: trimText(text, 600) });
        break;
      }
      case "usage": {
        const t = e.usage?.total || e.usage?.tokens;
        if (t) emit("usage", { lane, tokens: t });
        break;
      }
    }
  });
  try {
    const result = await promptAndWait(session, prompt, { timeoutMs });
    return result.text || "";
  } finally {
    sessions[lane] = null;
    state.lanes[lane] = "done";
    emit("lane", { lane, status: "done", seconds: Math.round((Date.now() - started) / 1000) });
    session.dispose().catch(() => {});
  }
}

function extractJson(text) {
  const fenced = [...text.matchAll(/```json\s*([\s\S]*?)```/g)].pop();
  const raw = fenced ? fenced[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try { return JSON.parse(raw); } catch { return null; }
}

const PROTECTED_TEXT = PROTECTED.map((p) => p.replace(HOME, "~")).join("、");

async function agentScan() {
  const known = [...state.suggestions.values()].map((s) => `- [${s.id}] ${s.display}（${gb(s.bytes)}）${s.title}`).join("\n");
  const cats = state.categories.map((c) => `${c.label} ${gb(c.bytes)}`).join("、");
  const prompt = `你是磁碟清理工具 VOIDSCAN 的掃描 Agent。這台 Mac 的家目錄是 ${HOME}。
規則已經量完常見位置：${cats}。
規則已經找到這些可清理項目：
${known || "（無）"}

你的任務：查看規則列不全的部分，找出可以安全釋放的空間。重點：
1. 舊專案的相依套件：一個月以上沒動的專案裡的 node_modules、.venv、venv、.next、target、build 快取
2. 創作與開發軟體的快取（例如 ~/Library/Caches 裡較大的 App 快取、模型下載暫存）
3. 已解除安裝的 App 留下的資料：比對 ~/Library/Application Support、~/Library/Containers、~/Library/Caches 的名稱和 /Applications 裡的 App
4. 檢查規則找到的項目，若規則判斷錯了（例如名稱是 Cache、裡面卻是聊天原圖或使用者檔案），在 corrections 標示不建議清理

方法：只用唯讀指令（du、ls、find、stat、mdls、pgrep、file、head）。先用 du -sh 看大小再深入，控制在 40 個指令以內、8 分鐘內完成。邊做邊用一句話說明你在查什麼。
不可以建議這些受保護位置：${PROTECTED_TEXT}，也不要建議 /Volumes 底下的東西或捷徑。
每一項都要弄清楚是什麼、刪除後能不能找回；不確定就標「不建議清理」。只列 50MB 以上的項目。

最後輸出一個 json 程式碼區塊：
\`\`\`json
{"suggestions":[{"path":"絕對路徑","title":"簡短名稱","what":"這是什麼","reason":"為什麼可以（或不建議）清","recover":"可自動重建|可重新下載|無法找回","advice":"建議清理|不建議清理","app":"相關 App 名稱或 null"}],
 "corrections":[{"id":"規則項目 id","reason":"為什麼規則判斷錯了"}]}
\`\`\``;
  const text = await runAgent("scan", prompt);
  const data = extractJson(text) || {};
  let added = 0;
  for (const s of data.suggestions || []) {
    const p = typeof s.path === "string" ? path.resolve(s.path.replace(/^~(?=\/)/, HOME)) : "";
    if (!p || !exists(p) || state.suggestions.has(sid(p))) continue;
    const blocked = protectedReason(p);
    if (blocked || fs.lstatSync(p).isSymbolicLink()) {
      emit("agent", { lane: "scan", k: "guard", text: `已拒絕 ${p.replace(HOME, "~")}：${blocked || "捷徑"}` });
      continue;
    }
    const bytes = (await duKB(p)) * 1024;
    addSuggestion({ ...s, path: p, bytes, source: "agent", recover: s.recover || "無法找回" });
    added++;
  }
  for (const c of data.corrections || []) {
    const item = state.suggestions.get(c.id);
    if (!item) continue;
    item.advice = "不建議清理"; item.review = "withdrawn"; item.reviewNote = `掃描 Agent 更正：${c.reason}`;
    emit("suggestion", { suggestion: pub(item) });
  }
  emit("scanDone", { added });
}

async function review(ids) {
  const items = ids.map((id) => state.suggestions.get(id)).filter((s) => s && s.review === "pending");
  if (!items.length) return;
  for (const s of items) { s.review = "reviewing"; emit("suggestion", { suggestion: pub(s) }); }
  const list = items.map((s) => `- id=${s.id}｜${s.path}｜${gb(s.bytes)}｜${s.title}｜理由：${s.reason}｜可找回：${s.recover}`).join("\n");
  const prompt = `你是磁碟清理工具 VOIDSCAN 的複核 Agent，和掃描 Agent 互相獨立。請逐條檢查下面每一條清理建議：
${list}

每一條都要自己確認：路徑存在、內容真的是建議說的東西（用 ls、du、find、file 抽查裡面，特別注意名稱叫 Cache 但裡面其實是照片、聊天原圖、文件或專案的情況）、刪掉後能不能自動重建或重新下載、相關 App 刪除時會不會壞掉。
無法確認安全的一律撤回。只用唯讀指令，控制在 30 個指令以內。邊做邊用一句話說明你在檢查什麼。
最後輸出一個 json 程式碼區塊：
\`\`\`json
{"verdicts":[{"id":"項目 id","keep":true,"note":"一句話結論"}]}
\`\`\``;
  let data = null;
  try { data = extractJson(await runAgent("review", prompt)); } catch (error) { emit("error", { message: `複核失敗：${error.message}` }); }
  const verdicts = new Map((data?.verdicts || []).map((v) => [v.id, v]));
  for (const s of items) {
    const v = verdicts.get(s.id);
    if (v && v.keep === true) { s.review = "approved"; s.reviewNote = v.note || "複核通過"; }
    else { s.review = "withdrawn"; s.reviewNote = v?.note || "複核 Agent 無法確認安全，已撤回"; }
    emit("suggestion", { suggestion: pub(s) });
  }
}

// ───────────── 執行刪除：只有這裡能刪，而且要經過你確認 ─────────────
function verifyUnchanged(s) {
  if (!exists(s.path)) return "路徑已經不存在";
  const blocked = protectedReason(s.path);
  if (blocked) return blocked;
  const st = fs.lstatSync(s.path);
  if (st.isSymbolicLink()) return "變成了捷徑";
  if (st.ino !== s.inode) return "路徑內容和複核時不一樣";
  return null;
}

async function deleteItem(s) {
  const problem = verifyUnchanged(s);
  if (problem) { s.status = "skipped"; s.result = problem; emit("suggestion", { suggestion: pub(s) }); return 0; }
  s.status = "cleaning"; emit("suggestion", { suggestion: pub(s) });
  const before = (await duKB(s.path)) * 1024;
  await fsp.rm(s.path, { recursive: true, force: true });
  s.status = "cleaned"; s.result = `已釋放 ${gb(before)}`; s.freed = before;
  emit("suggestion", { suggestion: pub(s) });
  return before;
}

async function cleanDirect(ids) {
  const before = await diskInfo();
  setCleaning(true);
  const done = [], skipped = [];
  for (const id of ids) {
    const s = state.suggestions.get(id);
    if (!s || s.review !== "approved" || s.status !== "ready") continue;
    await deleteItem(s);
    (s.status === "cleaned" ? done : skipped).push(s.id);
  }
  await finishClean(before, done, skipped, "direct");
}

async function cleanWithAgent(ids) {
  const items = ids.map((id) => state.suggestions.get(id)).filter((s) => s && s.review === "approved" && s.status === "ready");
  if (!items.length) return;
  const before = await diskInfo();
  setCleaning(true);
  state.confirmed = new Set(items.map((s) => s.id));
  const list = items.map((s) => `- id=${s.id}｜${s.path}｜${gb(s.bytes)}｜相關 App：${s.app || "無"}`).join("\n");
  const prompt = `你是 VOIDSCAN 的清理 Agent。使用者已經確認要清理下面這些項目：
${list}

對每一項依序做：
1. 用 ls -ld 和 du -sh 確認路徑還在、和預期一致
2. 有相關 App 的，用 pgrep -x 確認 App 沒有在執行；正在執行就跳過並說明
3. 確認沒問題才呼叫 voidscan 工具的 delete_item（傳入 id）。你自己不能刪除任何東西，只能透過這個工具
全部處理完後呼叫 measure 重新測量，最後用三到五句話告訴使用者：實際釋放了多少、哪些沒有動到、為什麼。`;
  try { await runAgent("clean", prompt, { mcp: true }); } catch (error) { emit("error", { message: `清理 Agent 失敗：${error.message}` }); }
  state.confirmed = new Set();
  const done = items.filter((s) => s.status === "cleaned").map((s) => s.id);
  const skipped = items.filter((s) => s.status !== "cleaned").map((s) => s.id);
  for (const s of items) if (s.status === "ready") { s.result = "Agent 沒有動它"; emit("suggestion", { suggestion: pub(s) }); }
  await finishClean(before, done, skipped, "agent");
}

async function finishClean(before, done, skipped, mode) {
  setCleaning(true, "measure");
  await measureCategories();
  const after = state.disk;
  const freedItems = done.reduce((a, id) => a + (state.suggestions.get(id)?.freed || 0), 0);
  state.lastClean = { mode, before: before.free, after: after.free, freed: Math.max(after.free - before.free, 0), freedItems, done, skipped, at: Date.now() };
  setCleaning(false);
  emit("cleanDone", { result: state.lastClean });
}

// ───────────── 工具 ─────────────
function gb(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}
async function body(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}
function json(res, code, data) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}
function busy() { return state.phase !== "idle" || state.cleaning || Object.values(sessions).some(Boolean); }

async function drill(id) {
  const cat = state.categories.find((c) => c.id === id);
  if (!cat?.paths) return [];
  const rows = [];
  for (const base of cat.paths) {
    if (!exists(base)) continue;
    try {
      const { stdout } = await run("/usr/bin/du", ["-skx", "-d", "1", base], { maxBuffer: 8 << 20, timeout: 120000 }).catch((e) => ({ stdout: e.stdout || "" }));
      for (const line of stdout.split("\n")) {
        const [kb, p] = line.split("\t");
        if (p && p !== base) rows.push({ path: p.replace(HOME, "~"), bytes: Number(kb) * 1024 });
      }
      if (cat.paths.length > 1) rows.push({ path: base.replace(HOME, "~"), bytes: (await duKB(base)) * 1024, group: true });
    } catch {}
  }
  return rows.filter((r) => cat.paths.length === 1 || !r.group).sort((a, b) => b.bytes - a.bytes).slice(0, 14);
}

// ───────────── HTTP ─────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(await fsp.readFile(path.join(HERE, "public/index.html")));
    }
    if (req.method === "GET" && url.pathname === "/api/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write(`data: ${JSON.stringify({ type: "snapshot", state: snapshot() })}\n\n`);
      clients.add(res);
      const ping = setInterval(() => res.write(": ping\n\n"), 15000);
      req.on("close", () => { clients.delete(res); clearInterval(ping); });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/drill") return json(res, 200, { rows: await drill(url.searchParams.get("id")) });

    if (req.method === "POST" && url.pathname === "/api/scan") {
      if (busy()) return json(res, 409, { error: "正在執行中" });
      const { agent = true } = await body(req);
      state.suggestions.clear(); state.lastClean = null;
      state.lanes = { scan: "idle", review: "idle", clean: "idle" };
      emit("reset", {});
      json(res, 202, { ok: true });
      (async () => {
        await quickScan();
        if (!agent) return;
        state.phase = "agent"; emit("phase", { phase: "agent" });
        const ruleIds = [...state.suggestions.keys()];
        // 規則項目先複核，不必等 Agent 掃完
        const reviewRules = review(ruleIds);
        await agentScan().catch((e) => emit("error", { message: `掃描 Agent 失敗：${e.message}` }));
        await reviewRules;
        const agentIds = [...state.suggestions.values()].filter((s) => s.source === "agent" && s.review === "pending").map((s) => s.id);
        state.phase = "review"; emit("phase", { phase: "review" });
        await review(agentIds);
        state.phase = "idle"; emit("phase", { phase: "idle" }); emit("pipelineDone", {});
      })().catch((e) => { state.phase = "idle"; emit("error", { message: e.message }); emit("phase", { phase: "idle" }); });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/clean") {
      if (state.cleaning || state.phase === "quick") return json(res, 409, { error: "正在測量或清理中，請稍等" });
      const { ids = [], mode = "direct" } = await body(req);
      json(res, 202, { ok: true });
      (mode === "agent" ? cleanWithAgent(ids) : cleanDirect(ids))
        .catch((e) => { setCleaning(false); emit("error", { message: e.message }); });
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/stop") {
      for (const s of Object.values(sessions)) s?.abort().catch(() => {});
      return json(res, 200, { ok: true });
    }
    // 清理 Agent 的工具橋接：只接受使用者確認過的項目
    if (req.method === "POST" && url.pathname.startsWith("/api/internal/")) {
      if (req.headers["x-voidscan-token"] !== INTERNAL_TOKEN) return json(res, 403, { error: "forbidden" });
      const data = await body(req);
      if (url.pathname === "/api/internal/delete") {
        const s = state.suggestions.get(data.id);
        if (!s || !state.confirmed.has(s.id)) return json(res, 200, { ok: false, message: "這個項目沒有經過使用者確認，拒絕刪除" });
        if (s.status === "cleaned") return json(res, 200, { ok: true, message: "已經清過了" });
        const freed = await deleteItem(s);
        return json(res, 200, { ok: s.status === "cleaned", message: s.status === "cleaned" ? `已刪除 ${s.display}，釋放 ${gb(freed)}` : `沒有刪除：${s.result}` });
      }
      if (url.pathname === "/api/internal/measure") {
        const d = await diskInfo();
        state.disk = d; emit("disk", { disk: d });
        return json(res, 200, { ok: true, message: `目前可用 ${gb(d.free)}，總容量 ${gb(d.total)}` });
      }
    }
    json(res, 404, { error: "not found" });
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

loadSaved();
server.listen(PORT, "127.0.0.1", async () => {
  state.disk = await diskInfo();
  console.log(`VOIDSCAN 已啟動：http://localhost:${PORT}`);
});
