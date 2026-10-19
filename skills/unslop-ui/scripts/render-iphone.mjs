// Render a screen at iPhone size and scan it for AI-slop patterns.
//   node render-iphone.mjs <url> [outDir=qa] [--device=iphone|se|web] [--wait=ms]
// Writes <outDir>/shot-NN.png (one per screen of scrolling, 3x), <outDir>/sheet.png (all screens side by side,
// needs ffmpeg), <outDir>/report.json and <outDir>/report.md. Uses the installed Google Chrome headless, which
// has WebGPU, so Shaders components render for real. Serve pages over http://localhost, not file://.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadPlaywright } from './playwright.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [url, outArg] = args.filter(a => !a.startsWith('--'));
if (!url) { console.error('usage: node render-iphone.mjs <url> [outDir] [--device=iphone|se|web] [--wait=ms]'); process.exit(1); }
const DEVICES = { iphone: [393, 852, 3], se: [375, 667, 2], web: [1440, 900, 1] };
const [W, H, DPR] = DEVICES[flags.device || 'iphone'];
const OUT = path.resolve(outArg || 'qa');
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^shot-\d+\.png$/.test(f)) fs.rmSync(path.join(OUT, f));

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, isMobile: W < 768, hasTouch: W < 768 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(+(flags.wait || 2500));

// Runs inside the page. Every finding names the element so the fix can find it.
const SCAN = () => {
  const out = [];
  const add = (id, label, detail, els = []) => out.push({ id, label, detail, where: els.slice(0, 4).map(name) });
  function name(el) {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + (t ? ` "${t}"` : '');
  }
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const all = [...document.body.querySelectorAll('*')].filter(visible);
  const hue = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.12) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
  const colorsIn = s => [...s.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].map(m => hue(+m[1], +m[2], +m[3])).filter(h => h !== null);

  // 1. Purple / indigo / violet gradients, the most recognisable AI default.
  const purple = all.filter(el => { const bg = getComputedStyle(el).backgroundImage; return /gradient/.test(bg) && colorsIn(bg).some(h => h >= 235 && h <= 300); });
  if (purple.length) add('purple-gradient', '紫藍漸層', `${purple.length} 個元素用了紫／靛／藍紫漸層`, purple);
  // 2. Gradient text.
  const gtext = all.filter(el => { const cs = getComputedStyle(el); return /text/.test(cs.webkitBackgroundClip || cs.backgroundClip) && /gradient/.test(cs.backgroundImage); });
  if (gtext.length) add('gradient-text', '漸層文字', `${gtext.length} 段文字填了漸層`, gtext);
  // 3. The same rounded, shadowed card repeated.
  const cards = all.filter(el => { const cs = getComputedStyle(el); const r = parseFloat(cs.borderTopLeftRadius); return r >= 10 && cs.boxShadow !== 'none' && el.getBoundingClientRect().width > 80 && el.children.length > 0; });
  const sig = {}; for (const c of cards) { const cs = getComputedStyle(c); const k = cs.borderTopLeftRadius + '|' + cs.boxShadow; (sig[k] ||= []).push(c); }
  const repeated = Object.values(sig).filter(g => g.length >= 4).flat();
  if (repeated.length) add('same-cards', '一樣的圓角陰影卡片', `${repeated.length} 張卡片圓角＋陰影完全相同`, repeated);
  // 4. Glassmorphism everywhere.
  const glass = all.filter(el => /blur/.test(getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter || ''));
  if (glass.length >= 2) add('glass', '到處都是毛玻璃', `${glass.length} 個元素用了 backdrop-filter blur`, glass);
  // 5. Default type: one family, and it is a stock UI face.
  const fams = new Set(all.filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(el => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase()));
  const stock = ['inter', 'system-ui', '-apple-system', 'roboto', 'poppins', 'sf pro', 'sf pro display', 'helvetica neue', 'arial', 'noto sans tc', 'pingfang tc', 'montserrat', 'open sans', 'segoe ui'];
  if ([...fams].every(f => stock.includes(f))) add('stock-type', '預設字體、沒有字體個性', `只用了 ${[...fams].join(', ')}`);
  // 6. Emoji used as icons in headings, buttons, tabs and labels.
  const emojiRe = /\p{Extended_Pictographic}/u;
  const emoji = all.filter(el => el.children.length === 0 && emojiRe.test(el.textContent || ''));
  if (emoji.length >= 2) add('emoji-icons', '用 emoji 當圖示', `${emoji.length} 處 emoji`, emoji);
  // 7. Stock copy.
  const copyRe = /(welcome back|unlock|seamless|supercharge|elevate|effortless|all-in-one|next[- ]gen|歡迎回來|輕鬆管理|一站式|全方位|賦能|智慧分析|開啟.*旅程|讓.*更簡單|AI 驅動)/i;
  const copy = all.filter(el => el.children.length === 0 && copyRe.test(el.textContent || ''));
  if (copy.length) add('stock-copy', '套話文案', copy.slice(0, 3).map(e => '「' + e.textContent.trim().slice(0, 18) + '」').join('、'), copy);
  // 8. Pill badges and sparkles sprinkled on.
  const pills = all.filter(el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return parseFloat(cs.borderTopLeftRadius) >= r.height / 2 - 1 && r.height < 32 && r.width > r.height * 1.6 && (el.textContent || '').trim(); });
  if (pills.length >= 3) add('pills', '膠囊標籤太多', `${pills.length} 個膠囊標籤`, pills);
  // 9. Everything centred.
  const blocks = all.filter(el => el.children.length === 0 && (el.textContent || '').trim().length > 8);
  const centred = blocks.filter(el => getComputedStyle(el).textAlign === 'center');
  if (blocks.length >= 6 && centred.length / blocks.length > 0.6) add('all-centred', '全部置中', `${Math.round(centred.length / blocks.length * 100)}% 的文字置中`);
  // 10. One radius for everything.
  // 正圓（頭像、球、圓點）不算，圓角要看的是卡片、按鈕這類方塊
  const radii = all.filter(el => { const r = el.getBoundingClientRect(); return parseFloat(getComputedStyle(el).borderTopLeftRadius) < Math.min(r.width, r.height) / 2 - 1; }).map(el => parseFloat(getComputedStyle(el).borderTopLeftRadius)).filter(r => r > 0);
  const top = radii.length ? Object.entries(radii.reduce((m, r) => (m[r] = (m[r] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1])[0] : null;
  if (top && radii.length >= 8 && top[1] / radii.length > 0.7 && +top[0] >= 12) add('one-radius', '圓角一律同一個大數字', `${Math.round(top[1] / radii.length * 100)}% 的圓角都是 ${top[0]}px`);

  // Basic usability on a phone.
  const vw = document.documentElement.clientWidth;
  const usability = [];
  if (document.documentElement.scrollWidth > vw + 1) usability.push({ id: 'overflow-x', label: '橫向溢出', detail: `頁面寬 ${document.documentElement.scrollWidth}px，螢幕 ${vw}px` });
  const tiny = blocks.filter(el => parseFloat(getComputedStyle(el).fontSize) < 12);
  if (tiny.length) usability.push({ id: 'tiny-text', label: '字太小', detail: `${tiny.length} 段字小於 12px`, where: tiny.slice(0, 4).map(name) });
  const taps = [...document.querySelectorAll('a,button,[role=button],input,select')].filter(visible).filter(el => { const r = el.getBoundingClientRect(); return r.width < 40 || r.height < 40; });
  if (taps.length) usability.push({ id: 'small-tap', label: '按鈕太小', detail: `${taps.length} 個可點元素小於 40×40`, where: taps.slice(0, 4).map(name) });
  const canvases = [...document.querySelectorAll('canvas')].filter(visible).map(c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; });
  return { slop: out, usability, canvases, fonts: [...fams], height: document.documentElement.scrollHeight };
};
const scan = await page.evaluate(SCAN);
// English names for every finding, so the report and the board work for both languages
const EN = { 'purple-gradient': 'Purple-blue gradients', 'gradient-text': 'Gradient text', 'same-cards': 'The same rounded shadow card', glass: 'Glass blur everywhere',
  'stock-type': 'Stock typeface only', 'emoji-icons': 'Emoji as icons', 'stock-copy': 'Stock copy', pills: 'Too many pill badges', 'all-centred': 'Everything centred',
  'one-radius': 'One big radius everywhere', 'overflow-x': 'Horizontal overflow', 'tiny-text': 'Text under 12 px', 'small-tap': 'Tap targets under 40 px' };
for (const f of [...scan.slop, ...scan.usability]) f.label_en = EN[f.id] || f.id;

// One screenshot per screen of scrolling (max 6). Check that every shader canvas actually painted something.
const steps = Math.min(6, Math.max(1, Math.ceil(scan.height / H)));
const shots = [];
for (let i = 0; i < steps; i++) {
  await page.evaluate(y => window.scrollTo(0, y), i * H);
  await page.waitForTimeout(500);
  const file = path.join(OUT, `shot-${String(i + 1).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  shots.push(file);
}
await page.evaluate(() => window.scrollTo(0, 0));
const shader = [];
for (const [i, c] of scan.canvases.entries()) {
  const blank = await page.evaluate(({ x, y, w, h }) => new Promise(res => {
    // Read the canvas through a screenshot-free path: draw it into a 2D canvas and measure the variance.
    const src = [...document.querySelectorAll('canvas')].find(el => { const r = el.getBoundingClientRect(); return Math.abs(r.left - x) < 1 && Math.abs(r.top + scrollY - y) < 1; });
    if (!src) return res(null);
    requestAnimationFrame(() => {
      try {
        const t = document.createElement('canvas'); t.width = 64; t.height = 64;
        const g = t.getContext('2d'); g.drawImage(src, 0, 0, 64, 64);
        const d = g.getImageData(0, 0, 64, 64).data; let sum = 0, sq = 0, alpha = 0;
        for (let k = 0; k < d.length; k += 4) { const l = (d[k] + d[k + 1] + d[k + 2]) / 3; sum += l; sq += l * l; alpha += d[k + 3]; }
        const n = d.length / 4, mean = sum / n;
        res({ alpha: alpha / n, std: Math.sqrt(sq / n - mean * mean) });
      } catch (e) { res({ error: String(e) }); }
    });
  }), c);
  shader.push({ canvas: i + 1, size: `${Math.round(c.w)}×${Math.round(c.h)}`, ...blank, painted: !!blank && blank.alpha > 5 });
}
await browser.close();

let sheet = null;
if (shots.length > 1) {
  try {
    sheet = path.join(OUT, 'sheet.png');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...shots.flatMap(f => ['-i', f]), '-filter_complex', `${shots.map((_, i) => `[${i}:v]scale=393:-1[s${i}]`).join(';')};${shots.map((_, i) => `[s${i}]`).join('')}hstack=inputs=${shots.length}`, sheet]);
  } catch { sheet = null; }
}

// AI 味指數：10 種樣式各占 10 分，0 到 100，越高越像 AI 做的
const aiScore = Math.min(100, scan.slop.length * 10);
const report = { url, device: `${W}×${H} @${DPR}x`, at: new Date().toISOString(), aiScore, slopScore: scan.slop.length, slop: scan.slop, usability: scan.usability, shader, fonts: scan.fonts, errors, shots: shots.map(f => path.basename(f)), sheet: sheet && path.basename(sheet) };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const md = [
  `# AI 味掃描報告 / AI-slop scan`, ``, `- URL: ${url}`, `- Device: ${report.device}`, `- AI 味指數 / AI-slop score: **${aiScore}/100** (${scan.slop.length} of 10 patterns; 0 does not prove the screen is good, look at the screenshots)`, ``,
  `## AI 味 / Slop patterns`, ...(scan.slop.length ? scan.slop.map(s => `- **${s.label} / ${s.label_en}**：${s.detail}${s.where?.length ? `（${s.where.join('、')}）` : ''}`) : ['- none 沒抓到']), ``,
  `## 手機可用性 / Phone usability`, ...(scan.usability.length ? scan.usability.map(s => `- **${s.label} / ${s.label_en}**：${s.detail}`) : ['- no issues 沒問題']), ``,
  `## Shader 畫布 / Shader canvases`, ...(shader.length ? shader.map(s => `- #${s.canvas} (${s.size}): ${s.painted ? 'painted 有畫出來' : '⚠️ blank 空白: WebGPU did not start or a component name/prop is wrong'}`) : ['- no canvas 頁面沒有 canvas']), ``,
  `## 頁面錯誤 / Page errors`, ...(errors.length ? errors.slice(0, 8).map(e => `- ${e.slice(0, 200)}`) : ['- none 沒有']),
].join('\n');
fs.writeFileSync(path.join(OUT, 'report.md'), md + '\n');
console.log(md);
