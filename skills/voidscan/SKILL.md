---
name: voidscan
version: 1.0.0
description: A disk cleaner for macOS that maps your drive like a floor plan, lets read-only AI agents find and double-check what can go, and deletes nothing until you confirm.
---

# VOIDSCAN: a disk command center for your Mac

You are setting up VOIDSCAN on the user's Mac. The app is finished and ships in the asset pack, so it looks and behaves the same for everyone. Your job is to install it, tailor what it must never touch, prove the safety sandbox works on this machine, run the first scan with the user, and explain how to use it. You never pick items for the user and you never delete anything yourself.

How it works, in one paragraph you can repeat to the user: rules measure the usual places in about a minute and draw the whole drive as a map of glass blocks. A scan agent then looks where rules cannot (old project dependencies, creative-app caches, data left by apps that were uninstalled) and explains what each item is and whether it can come back. A separate review agent checks every suggestion on its own and withdraws anything it cannot confirm. Both agents run inside a macOS sandbox that refuses every write and delete at the kernel level. Only the VOIDSCAN app itself can delete, only items the user ticked and confirmed, and it refuses protected locations whatever anyone suggests.

## Before you start

- The files ship in this Skill's own `kit/` folder. Copy that folder's contents into a new folder: `mkdir -p ~/voidscan && cp -R <this skill>/kit/. ~/voidscan/`
- In `~/voidscan` you will have:
  - `server.mjs`: the app (measuring, rules, agents, the only code that deletes)
  - `public/index.html`: the interface (map, panel, work log drawer, dialogs)
  - `mcp-bridge.mjs`: the one tool the cleaning agent gets; it asks the app to delete a confirmed item
  - `sandbox/readonly.sb`, `sandbox/claude-sandboxed.sh`: the read-only sandbox for the agents
  - `voidscan.config.json`: the user's settings (extra protected folders, extra map blocks, model)
  - `start.command`: double-click to start and open the app
  - `package.json`, `package-lock.json`, `agent-cwd/README.txt` (the agents' empty working folder)
- Do not rewrite `server.mjs`, `public/index.html` or the sandbox files unless the user asks for a change. Settings go in `voidscan.config.json`.

## What the user needs

- A Mac (macOS 13 or later). VOIDSCAN does not run on Windows or Linux.
- Node 24 or later. Check with `node -v`. If it is older, install it (`brew install node@24` with Homebrew, or the installer from nodejs.org) after the user agrees.
- Claude Code installed and signed in (`claude --version`). The agents run on Claude Code with the user's own Claude plan, even when you are Codex or Cursor. Without Claude Code the app still works in rules-only mode.

## Requirements

- Never delete, move or empty anything yourself, and never call the app's clean endpoints. Cleaning happens only when the user ticks items in the app and confirms.
- Never pre-select items, and never tell the user something is safe that the app has not reviewed. Repeat the app's own reasons and recovery labels.
- Never loosen the sandbox: no extra allow rules for the home folder, no running the agents without `claude-sandboxed.sh`.
- Keep it local. The server listens on 127.0.0.1 only. Do not add analytics, accounts or any network call. The only outside traffic is Claude Code talking to Anthropic.
- Never invent sizes or findings. Every number on screen comes from `du`, `statfs` and `sysctl` on this Mac.
- Do not change macOS security settings for the user (Full Disk Access included). Explain them and let the user decide.
- Respect `prefers-reduced-motion`; the interface already does. Check the page at 1440 px wide and at 390 px (it stacks into one column on narrow windows).

## Step 1: interview

Send one short message with these questions and offer defaults:

1. Language of the interface: it ships in Traditional Chinese. Keep it, or translate it into the user's language (see Step 3).
2. Folders that must never be touched beyond the built-in list: notes vaults, client work, family documents, anything synced or irreplaceable. Paths can start with `~/`.
3. Large personal folders that deserve their own block on the map (for example an Obsidian vault or a footage drive folder in the home folder), with a short label each.
4. Model for the agents: `sonnet` (default, best balance), `haiku` (cheaper, shallower), or `opus` (most thorough).

Built-in protection already covers Documents, Desktop, Pictures, Movies, Music, iCloud Drive, Mail, Messages, Photos, Keychains, Contacts, call history, Safari, `.ssh`, `.gnupg`, `.config`, `.aws`, `.kube`, Claude Code and Codex conversation history, skills and plugins, `.ollama`, the VOIDSCAN folder itself, the top level of the home folder, and anything outside the home folder.

## Step 2: install and configure

```bash
cd ~/voidscan && chmod +x start.command sandbox/claude-sandboxed.sh && npm install
```

Write `voidscan.config.json` from the answers:

```json
{
  "model": "sonnet",
  "protect": ["~/Notes", "~/Clients"],
  "categories": [{ "label": "Notes vault", "paths": ["~/Notes"] }]
}
```

- `protect` adds to the built-in list; the app refuses these paths and everything inside them.
- `categories` adds blocks to the map. A folder in `categories` is not protected unless it is also in `protect`, so put irreplaceable folders in both.

## Step 3: language (only if the user wants another language)

Translate every user-facing string, and nothing else:
- `public/index.html`: visible text, button labels, dialog text, status lines, tooltips.
- `server.mjs`: category labels and notes, rule titles and reasons, the recovery labels, refusal messages, and the agent prompts including `appendSystemPrompt`, so the agents think and answer in the user's language.
- The recovery labels are compared in code. In `public/index.html` the set `SAFE` lists the two labels that mean "comes back by itself" and "can be downloaded again"; translate those labels identically in both files, or items will land in the wrong group.

## Step 4: prove the sandbox on this Mac

Run these from `~/voidscan` and show the user the output:

```bash
cd ~/voidscan/agent-cwd && ../sandbox/claude-sandboxed.sh -p "Run with Bash and report the raw output: 1) ls ~ | head -3  2) touch ~/voidscan-sandbox-probe" --model haiku --allowedTools Bash
ls ~/voidscan-sandbox-probe
```

Expected: the listing succeeds, `touch` fails with `Operation not permitted`, and the final `ls` says the file does not exist. If the probe file exists, stop, tell the user the sandbox is not working on this Mac, and do not start the agents. If Claude Code cannot be found, set `VOIDSCAN_CLAUDE` to its full path.

## Step 5: first run

- Start it: double-click `start.command`, or `cd ~/voidscan && npm start` and open http://localhost:4848 (set `PORT` to change it).
- Ask the user to press 只跑規則 (rules only) first. It takes about a minute and draws the map. Walk them through it:
  - The big number top left is free space now, and turns into "free after cleaning" when items are ticked.
  - 可安全清理 holds reviewed items that come back by themselves or can be downloaded again. 確認後清理 holds reviewed items that cannot be recovered once deleted.
  - Each row opens to show the path, what it is, the reason, the review note and the exact command that will run.
  - The block 系統與受保護區域 is macOS, snapshots and places the app cannot read. Without Full Disk Access some Library folders are unreadable and end up there. Granting it is the user's choice (System Settings, Privacy & Security, Full Disk Access, add Terminal or the app that runs the server).
- Then press 開始掃描 (full scan). The work log drawer opens and shows the agents thinking, the commands they run and the results. A full scan usually takes 3 to 10 minutes and uses the user's Claude plan.

## Step 6: cleaning, explained

- 直接清理 runs exactly the reviewed commands. Before each one the app checks the path still exists, is not protected, is not a shortcut and is the same folder that was reviewed.
- 讓 Agent 清理 hands the ticked items to a cleaning agent. It checks each path still matches, checks the related app is not running (skips it if it is), asks the app to delete through its single tool, measures again and reports what was freed and what it left alone.
- Either way a result window shows the space actually freed and before and after bars. Freed space can be smaller than the listed sizes while other apps keep writing.

## Handover

Tell the user, in their language:
- where the app lives and how to start it
- that nothing is deleted until they tick and confirm, and agents can only read
- how to add a protected folder later (edit `voidscan.config.json`, restart)
- that scan results are kept in `data/state.json` and survive a restart; rescan any time with 重新掃描

---

## Design reference (already built, for design-change requests)

- The window is one weighted Voronoi map: each block's area matches its size. Sites start from a squarified treemap, then 260 iterations of power-diagram relaxation (move to centroid, scale weight toward the target area, clamp so no cell vanishes). Later renders warm-start from the previous layout so blocks do not jump.
- A phantom cell reserves the top-left panel; cells that overlap it are clipped to the right or below. Cells are inset 5 px for gaps and rounded with quadratic corners.
- Suggestions are their own blocks (the 12 largest; the rest merge into one). Free space shows contour rings with light flowing along them; ticked items get three rings. Tiny blocks show only a marker: filled for safe, half for confirm first, hollow for pending.
- Glass: dark translucent panels with 24 px backdrop blur, a conic gradient border that slowly rotates, aurora blobs, a drifting grid and passing light beams in the background. Light travels along every block edge with an animated dash.
- Live updates come over Server-Sent Events; the work log replays after a reload.

VOIDSCAN drives Claude Code through OAR (`@botiverse/oar`, Apache-2.0).
