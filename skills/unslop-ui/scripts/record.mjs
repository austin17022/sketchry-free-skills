// Record a web page with a visible mouse cursor that follows a script (move, click, scroll, wait).
//   node record.mjs <url> <plan.json> [out.mp4=board.mp4] [--size=1920x1080] [--fps=30] [--scale=1]
// The viewport is size / scale with deviceScaleFactor = scale (use --size=1080x1920 --scale=2 for vertical).
// plan.json: { "lead": 0.6, "tail": 1.2, "steps": [ ...actions ] }
//   {"wait": ms}
//   {"move": target, "ms": 900}            target = [x, y] | "#css" | {"frame": "#iframe-css", "sel": "#css-inside"}
//   {"click": target?, "ms": 700}          moves there first when a target is given, then presses
//   {"scroll": 400, "at": target?, "ms": 900}   wheel scroll (inside an iframe when the cursor is over it)
//   {"eval": "js expression"}              run something in the page (e.g. start an animation)
//   {"hide": true} | {"show": true}        hide / show the cursor
// The page may set window.__ready = true when it has finished loading (waits 10 s max).
// Uses the installed Google Chrome headless (WebGPU works) and Chrome's own screencast; needs ffmpeg.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadPlaywright } from './playwright.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [url, planFile, outArg] = args.filter(a => !a.startsWith('--'));
if (!url || !planFile) { console.error('usage: node record.mjs <url> <plan.json> [out.mp4] [--size=1920x1080] [--fps=30] [--scale=1]'); process.exit(1); }
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const [OW, OH] = (flags.size || '1920x1080').split('x').map(Number);
const SCALE = +(flags.scale || 1), FPS = +(flags.fps || 30);
const OUT = path.resolve(outArg || 'board.mp4');
const RAW = fs.mkdtempSync(path.join(os.tmpdir(), 'unslop-rec-'));

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: OW / SCALE, height: OH / SCALE }, deviceScaleFactor: SCALE });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === undefined || window.__ready === true, null, { timeout: 10000 }).catch(() => console.warn('window.__ready never came, recording anyway'));

// A macOS-style arrow drawn on top of everything, iframes included. It never takes clicks.
await page.evaluate(() => {
  const c = document.createElement('div');
  c.id = '__cursor';
  c.innerHTML = '<svg width="26" height="34" viewBox="0 0 26 34"><path d="M2 2 L2 27 L8.5 21 L13 31.5 L17.5 29.5 L13 19.5 L22 19.5 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg><i></i>';
  Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-100px,-100px)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))', transition: 'opacity .2s' });
  const ring = c.querySelector('i');
  Object.assign(ring.style, { position: 'absolute', left: '-14px', top: '-14px', width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(255,255,255,.95)', boxShadow: '0 0 0 2px rgba(0,0,0,.25)', opacity: '0', transform: 'scale(.4)' });
  document.documentElement.append(c);
  window.__cursorTo = (x, y) => { c.style.transform = `translate(${x - 2}px,${y - 2}px)`; };
  window.__cursorPress = () => { c.querySelector('svg').animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: 220 }); ring.animate([{ opacity: 1, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 450, easing: 'ease-out' }); };
});

async function resolve(target) {
  if (Array.isArray(target)) return { x: target[0], y: target[1] };
  if (typeof target === 'string') {
    const b = await page.locator(target).first().boundingBox();
    if (!b) throw new Error('element not found: ' + target);
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }
  // Inside an iframe that may be scaled by CSS: map the inner box through the frame's on-screen box.
  const frameEl = page.locator(target.frame).first();
  const fb = await frameEl.boundingBox();
  const inner = await frameEl.evaluate((f, sel) => { const r = f.contentDocument.querySelector(sel).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, fw: f.clientWidth }; }, target.sel);
  const k = fb.width / inner.fw;
  return { x: fb.x + (inner.x + inner.w / 2) * k + (target.dx || 0), y: fb.y + (inner.y + inner.h / 2) * k + (target.dy || 0) };
}
let cur = { x: OW / SCALE * 0.82, y: OH / SCALE * 1.05 };
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
async function moveTo(p, ms = 900) {
  const from = { ...cur }, n = Math.max(1, Math.round(ms / 16)), t0 = Date.now();
  for (let i = 1; i <= n; i++) {
    const k = ease(i / n), x = from.x + (p.x - from.x) * k, y = from.y + (p.y - from.y) * k;
    await page.mouse.move(x, y);
    await page.evaluate(([x, y]) => window.__cursorTo(x, y), [x, y]);
    const wait = t0 + (ms * i) / n - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
  }
  cur = { ...p };
}
await page.evaluate(([x, y]) => window.__cursorTo(x, y), [cur.x, cur.y]);

const cdp = await context.newCDPSession(page);
const frames = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  const file = path.join(RAW, 'f' + String(frames.length).padStart(6, '0') + '.jpg');
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  frames.push({ t: metadata.timestamp, file });
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: OW, maxHeight: OH, everyNthFrame: 1 });
const start = Date.now();
await page.waitForTimeout((plan.lead ?? 0.6) * 1000);
for (const s of plan.steps) {
  if (s.wait) await page.waitForTimeout(s.wait);
  else if (s.eval) await page.evaluate(s.eval);
  else if (s.hide || s.show) await page.evaluate(v => { document.getElementById('__cursor').style.opacity = v; }, s.hide ? '0' : '1');
  else if ('move' in s) await moveTo(await resolve(s.move), s.ms);
  else if ('click' in s) {
    if (s.click !== true) await moveTo(await resolve(s.click), s.ms);
    await page.evaluate(() => window.__cursorPress());
    await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    await page.waitForTimeout(s.after ?? 250);
  } else if ('scroll' in s) {
    if (s.at) await moveTo(await resolve(s.at), s.moveMs ?? 600);
    const n = Math.max(1, Math.round((s.ms ?? 900) / 16));
    for (let i = 0; i < n; i++) { await page.mouse.wheel(0, s.scroll / n); await page.waitForTimeout(16); }
  }
}
await page.waitForTimeout((plan.tail ?? 1.2) * 1000);
const seconds = (Date.now() - start) / 1000;
await cdp.send('Page.stopScreencast');
await browser.close();

// Rebuild the take at real speed (each frame held until the next arrived), then resample to a fixed fps.
if (frames.length < 10) { console.error(`only ${frames.length} frames captured: the page did not repaint or failed to load`, errors); process.exit(1); }
const end = frames[0].t + seconds;
const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.max(0.001, (frames[i + 1]?.t ?? end) - f.t).toFixed(4)}`).join('\n') + `\nfile '${frames.at(-1).file}'\n`;
fs.writeFileSync(path.join(RAW, 'list.txt'), list);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(RAW, 'list.txt'),
  '-t', seconds.toFixed(2), '-vf', `fps=${FPS},scale=${OW}:${OH}:flags=lanczos,format=yuv420p`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-movflags', '+faststart', '-an', OUT]);
fs.rmSync(RAW, { recursive: true, force: true });
console.log(`done: ${OUT} (${OW}x${OH}, ${seconds.toFixed(1)} s, ${frames.length} frames, ${(frames.length / seconds).toFixed(1)} fps average)`);
if (errors.length) console.warn('page errors:\n' + errors.slice(0, 5).join('\n'));
