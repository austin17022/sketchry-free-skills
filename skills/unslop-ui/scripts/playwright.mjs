// Find Playwright: the copy installed next to this skill (npm install in the skill folder), then the project's own,
// then a global one. Only the core package is needed: it drives the installed Google Chrome, no browser download.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function loadPlaywright() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.join(here, '..', 'node_modules', 'playwright-core', 'index.mjs')];
  for (const name of ['playwright-core', 'playwright']) {
    try { candidates.push(createRequire(path.join(process.cwd(), 'x.js')).resolve(name)); } catch {}
  }
  try { const g = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(); candidates.push(path.join(g, 'playwright', 'index.mjs'), path.join(g, 'playwright-core', 'index.mjs')); } catch {}
  for (const c of candidates) if (c && fs.existsSync(c)) return import(pathToFileURL(c).href);
  console.error(`Playwright not found. Run once in the skill folder: cd "${path.join(here, '..')}" && npm install`);
  process.exit(1);
}
