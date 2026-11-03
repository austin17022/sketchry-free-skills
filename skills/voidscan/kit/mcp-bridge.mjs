// 清理 Agent 唯一能用的刪除管道：把請求轉給 VOIDSCAN 主程式，由主程式核對「使用者確認過」才刪
// 這支程式跑在 Agent 的沙盒裡，自己刪不了任何東西。

import readline from "node:readline";

const URL_BASE = process.env.VOIDSCAN_URL;
const TOKEN = process.env.VOIDSCAN_TOKEN;

const TOOLS = [
  {
    name: "delete_item",
    description: "請 VOIDSCAN 刪除一個使用者已確認的清理項目。只接受清單裡的 id；沒經過確認的會被拒絕。",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "清理項目 id" } }, required: ["id"] },
  },
  {
    name: "measure",
    description: "重新測量磁碟可用空間。",
    inputSchema: { type: "object", properties: {} },
  },
];

async function call(name, args) {
  const endpoint = name === "delete_item" ? "delete" : "measure";
  const res = await fetch(`${URL_BASE}/api/internal/${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-voidscan-token": TOKEN },
    body: JSON.stringify(args || {}),
  });
  const data = await res.json();
  return { content: [{ type: "text", text: data.message || JSON.stringify(data) }], isError: data.ok === false };
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;
  if (id === undefined) return; // 通知不用回
  try {
    if (method === "initialize") {
      send({ jsonrpc: "2.0", id, result: {
        protocolVersion: params?.protocolVersion || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "voidscan", version: "1.0.0" },
      } });
    } else if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    } else if (method === "tools/call") {
      send({ jsonrpc: "2.0", id, result: await call(params.name, params.arguments) });
    } else if (method === "ping") {
      send({ jsonrpc: "2.0", id, result: {} });
    } else {
      send({ jsonrpc: "2.0", id, error: { code: -32601, message: `unknown method ${method}` } });
    }
  } catch (error) {
    send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `失敗：${error.message}` }], isError: true } });
  }
});
