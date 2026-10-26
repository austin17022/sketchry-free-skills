---
name: vitrelle
version: 1.0.0
description: A glass dashboard wallpaper for your own desktop. Pick 4 to 8 cards, fill them with your real schedule, inbox, sleep, weather, money and habits, and keep it current by talking to your AI.
---

# VITRELLE: a glass dashboard that lives on your desktop

You are setting up a personal dashboard wallpaper for the user. The design and code are finished and ship in the asset pack, so the result looks the same for everyone. Your job is to interview the user, choose their cards, fill `data.js` with their real information, check the result, and help them set it as their wallpaper. Afterwards you keep `data.js` current whenever they ask.

## Before you start

- The files ship in this Skill's own `kit/` folder. Copy that folder's contents into a new folder, for example `mkdir -p ~/vitrelle-desk && cp -R <this skill>/kit/. ~/vitrelle-desk/`
- In `~/vitrelle-desk` you will have:
  - `index.html`: the page
  - `desk.css`, `desk.js`: design and behavior, finished
  - `data.js`: every piece of personal content, prefilled with a fictional sample person
  - `assets/`: holds an optional background photo (see the README inside)
- All personal content goes in `data.js`. Do not rewrite `desk.js` or `desk.css` unless the user asks for a design change.

## Requirements

- Never invent the user's data. Events, emails, sleep, money, prices and habits come only from what the user tells you or from tools they have connected. If you have nothing for a card, leave its list empty; the card shows a calm empty state.
- Delete the sample person's content from every card you keep, and delete the blocks of cards the user did not choose.
- Keep everything local. The only network requests are weather (Open-Meteo, sends the city coordinates) and crypto prices (CoinGecko, sends coin ids). No accounts, no keys, no trackers.
- The design respects `prefers-reduced-motion`, fits any desktop screen by scaling, and turns into a scrolling page on phones. Keep it that way.

## Step 1: interview

Send one short message with these questions and offer defaults, so the user can answer "defaults are fine":

1. Name for the greeting, and language: Traditional Chinese (`zh`) or English (`en`).
2. Which 4 to 8 cards (show the menu below). An even number of slots fills the grid best; `schedule` takes two slots.
3. For each chosen card, where the data comes from: they tell you, a tool you can read (calendar, mail), or live (weather, crypto).
4. Look: dark or light, accent color (default `#ff5a3c`), moving light background or their own photo, and whether money should be hidden by default.
5. City, if they chose weather.

Card menu:

| id | Shows | Data from |
|---|---|---|
| `schedule` | Today with live status (done, now with progress, next with countdown), tomorrow below. Reminds 10 minutes before each event | User or calendar tool |
| `todo` | Checklist with progress bar. Ticks are saved on that computer | User |
| `mail` | Emails waiting for a reply, with a one-line note on what to do | User or mail tool |
| `sleep` | Duration, stages, a 0 to 100 score with a short label, vitals | User (from their watch app) |
| `weather` | Live temperature, conditions, three-day forecast | Live, needs latitude and longitude |
| `markets` | Prices with change and a small chart | Crypto live via CoinGecko ids; stocks and ETFs written by you |
| `income` | Month total, split bar, sources | User |
| `habits` | Seven-day grid; today is tapped on the desk | User |
| `focus` | 25-minute timer ring with start and pause | Nothing to fill |
| `countdown` | Days until the next dates that matter | User |
| `goals` | Progress bars toward targets | User |
| `note` | One line to keep in view | User |

## Step 2: fill data.js

The header comment in `data.js` documents every field. Rules:

- `profile`: `name`, `lang`, `theme` (`dark` or `light`), `accent`, `background` (`aurora` or a path such as `assets/bg.jpg`), `privacy` (true hides money as ＊＊＊＊＊), `upIsRed` (true for markets where rising prices are red, such as Taiwan and Japan), `chips` (one or two short status labels, or none), `reloadMinutes` (how often the page re-reads data.js, default 10).
- `layout`: the chosen card ids in reading order. Columns fill top to bottom. Put `schedule` first if chosen.
- Times are 24-hour `"HH:MM"`, dates are `"YYYY-MM-DD"`.
- Set `updated` (for example `"08:10"`) on every card you write, so the user can see how fresh it is.
- `weather`: look up latitude and longitude to three decimals. Leave `temp` out; it loads live.
- `markets`: for crypto, use the exact CoinGecko id (`bitcoin`, `ethereum`, `solana`). For stocks and ETFs, write `price`, `change` (percent) and optionally `spark` (the last 5 to 10 closes), and tell the user these update only when you update them.
- `income` and `goals` with `money: true` are masked while privacy is on. The total is calculated from the items; do not add a total field.
- Any card accepts `title` to rename it and `size: "tall"` to span both rows.
- Rows that do not fit are hidden automatically (finished events first). If something important gets hidden, shorten the text or make that card tall.

## Step 3: check before handover

- Open the page: `open index.html` (macOS) or `start index.html` (Windows).
- If you can take screenshots, check at the user's screen size and at 1440×900: greeting and date correct, no text cut off, weather loaded, the masked amounts show ＊＊＊＊＊ when privacy is on.
- If you cannot take screenshots, ask the user for one and check it.

## Step 4: set it as the wallpaper

- **macOS**: install Plash (free, Mac App Store). Add a website, choose the local website option and point it at the `vitrelle-desk` folder (or `index.html` inside it). Plash shows the page behind the desktop icons. Turn on Browsing Mode in Plash when they want to tick to-dos or habits or start the focus timer; turn it off to click through to the desktop again.
- If Plash on their macOS version does not accept a local folder, serve the folder instead: `cd ~/vitrelle-desk && python3 -m http.server 4900`, add `http://localhost:4900` in Plash, and offer to keep that server running at login only if they want it.
- **Windows**: install Lively Wallpaper (free, Microsoft Store). Add wallpaper, choose `index.html`.
- **Without an app**: open `index.html` in a full-screen browser window, or set it as the browser start page.
- Ticks and the privacy toggle are saved per app. A tick made in a browser tab does not show inside Plash or Lively, and the other way round. Tell the user to use one place for ticking.

## Step 5: keep it current

The user will say things like "update my desk", "add the dentist tomorrow at 10:00", "I slept 6 hours 20" or "move habits next to schedule".

- Edit only the card blocks that change, and refresh their `updated` time. The page picks up the new file on its next reload.
- On a new day, move `tomorrow` events into `today`, clear finished one-off to-dos the user confirms, and shift the habit days.
- With a calendar tool: read today and tomorrow, keep titles short, skip private details the user would not want on screen.
- With a mail tool: list threads waiting for the user's reply (at most six) with sender, subject and a one-line next step. Never copy email bodies, codes, account numbers or addresses into `data.js`.
- If the user wants this every morning and their setup supports scheduled runs, offer a daily refresh at the time they choose. Set it up only when they say yes.

## Handover

Tell the user, in their language:
- where the folder is
- how to update it ("just tell me what changed")
- that P or the eye chip hides and shows money
- how to change cards or colors later

---

## Design reference (already built, for design-change requests)

- Canvas 1600×980 scaled to the screen; wide screens widen to 2100. Below 760 px wide it becomes a scrolling column.
- Two rows, up to four columns; tall cards span both rows; an odd slot count promotes the list card with the most rows to tall.
- Glass cards: 28 px radius, 30 px backdrop blur with 175% saturation, 1 px light border, inner top highlight, a soft light sweep every 11 seconds.
- Accent is used only for title bars, the current event, progress, rings and the top notification pill.
- Top center pill expands for event reminders and the end of a focus session.
- Fonts are the system UI fonts; numbers use tabular figures.
