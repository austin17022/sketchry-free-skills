---
name: smallcaps
description: "A monochrome, small-type, high-whitespace personal portfolio where the craft is in the interactions: a pointer-chasing thumbnail that tilts with speed, magnetic buttons, word-by-word reveal, a fuzzy-search command menu (Cmd+K), and a light/dark toggle. No images, no frameworks. Trigger: 'minimal portfolio', 'interaction-craft portfolio', 'personal website'. / 單色、小字、留白很多的個人網站，所有力氣都花在手感上：游標、會追著滑鼠跑並隨速度傾斜的作品縮圖、會被吸過去的按鈕、逐字升起的標題，以及一個 ⌘K 指令選單。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/smallcaps/
---

# 極簡個人作品集網站

請從空白專案製作完整網站。品牌使用 SMALLCAPS。這是虛構個人品牌範例；規格中的作品、客戶、年份與商業承諾，不能直接當成真實資料。

## 開始前準備

1. 這份 Skill 不需要素材包，也不需要任何圖檔。六件作品的縮圖全部由 canvas 當場畫出來。
2. 換成自己的品牌時，提供名字、一句定位、六件作品的名稱／類型／年份、兩段自我介紹、四項基本資料與聯絡方式。文案沒給齊之前，先列出缺項，不要自己編。

## 製作要求

以下中文說明優先於後方英文規格中的示例資料、發布要求，以及可直接正式上線的承諾。其餘主要視覺、段落與互動均須保留。

- 使用原生 HTML、CSS、JavaScript。動畫自己用 `requestAnimationFrame` 配彈簧或 lerp 寫，不加入 React、Tailwind、GSAP、Framer Motion、Lenis 或任何動畫函式庫。指令選單用原生 `dialog`。
- 整站不使用圖檔。縮圖用 canvas 畫，圖示用行內 SVG 或文字。
- 不串接收款、寄信、追蹤分析、帳號或外部 API。表單要有欄位驗證，成功訊息須明說尚未送出。不要編造地址、電話、社群帳號或推薦語。
- 完成頁首、四個段落、指令選單與頁尾，不能只交付首屏。
- 自訂游標只在有精準指標的裝置上出現（`hover: hover` 且 `pointer: fine`），觸控裝置一律用系統游標，磁吸與追游標的縮圖也一併關掉。
- 偵測 `prefers-reduced-motion` 時：文字直接就位、跑馬燈停住、縮圖不跟隨、選單不做進場動畫，功能全部保留。
- 檢查 360／390／768／1440px 的版面，不可出現水平溢出；按鈕至少 44px，輸入框在 iOS 上字級至少 16px 以免自動放大，所有互動元素都能用鍵盤操作且看得到焦點。
- 實際檢查：指令選單的搜尋、上下鍵與 Enter、Esc 關閉、深淺色切換後 canvas 重畫、表單空值與有效輸入、手機版、瀏覽器主控台。錄製實際操作，再從錄影擷取封面，不能以手工動畫代替網站錄影。

## 這個網站的重點

這份 Skill 賣的是「手感」，版面本身要刻意樸素：單欄、細線分隔、大量留白、只有黑與白。力氣花在這六件事：

- **追游標的縮圖**：滑過作品列時，一張縮圖以彈簧跟在游標右側，並依照水平速度傾斜（上限約 12 度），停下來就自己擺正。
- **索引的集中與散開**：游標進到作品列時，其餘幾列降到 30% 不透明度，當下那列推進 14px，底下一條細線由左往右畫出來。
- **磁吸**：按鈕與標誌在游標靠近時朝它偏移，距離越近偏移越多，離開就彈回。
- **逐字升起**：每段文字拆成一個一個單字，各自包在一個裁切框裡，進入畫面時以 32ms 間隔依序升起。
- **指令選單**：⌘K 或 Ctrl+K 開啟，模糊搜尋（打的字母依序出現即可，不必相連），上下鍵移動、Enter 執行、Esc 關閉，指令包含跳段落、切換深淺色、複製 Email，以及每一件作品。
- **深淺色互換**：整站只有兩個顏色變數，切換時用同一條曲線過渡，canvas 縮圖要跟著重畫。

## 交付

交付 index.html、style.css、app.js 與驗證報告。報告列出實際檢查過的項目、修正過的問題，以及尚未完成的部分。


---

## 完整設計規格

以下規格以英文撰寫，保留精確的技術細節；若與前面的中文說明不同，以中文說明為準。

# Website Build Specification

**Role & Instructions:**
Act as an interaction designer who writes their own front-end. Build a one-page personal portfolio for a fictional designer working under the name SMALLCAPS. The layout is deliberately plain — one column, hairline rules, a lot of air, two colours. Everything that makes the page worth visiting is in how it responds to the pointer and the keyboard. No frameworks, no animation libraries, no image files.

---

## 1. Visual design system

### 1.1 Colour
Two themes, one set of custom properties, swapped by a `dark` class on `<html>`:

- Light: `--paper: #f4f2ee`, `--ink: #16161a`.
- Dark: `--paper: #0e0e11`, `--ink: #eceae4`.
- Derived: `--ink-60`, `--ink-35`, `--ink-12`, `--rule` (the same ink at .14 / .16 alpha).
- `--swap: 420ms cubic-bezier(.2, .8, .2, 1)` on `background` and `color`, so inverting the page is one movement.

### 1.2 Type
- Body: a grotesque (Inter or similar) at **13 px**, line-height 1.6. Prose blocks step up to 15 px.
- Structure: a monospace (IBM Plex Mono or similar) at **10 px**, letter-spacing .22em, uppercase. Everything structural uses it: the eyebrow, the section headings, the row numbers, the kinds, the years, field labels, the ticker, the fine print.
- One big line only: the h1 at `clamp(2.1rem, 5.4vw, 4.6rem)`, weight 400, line-height 1.02, letter-spacing -.035em.

## 2. Page structure

Fixed header, four sections, footer, one `<dialog>`.

- **Header**: the signature on the left, a section readout in the middle that updates as you scroll (INDEX / WORK / ABOUT / CONTACT), MENU with a ⌘K key cap and INVERT on the right. Background is `linear-gradient(to bottom, var(--paper) 0 72%, transparent)` so copy does not show through it. Each tool button has an underline that wipes in from the left and out to the right.
- **Hero**: eyebrow, the one big line, a paragraph, and a live clock pinned right.
- **Work**: a rail (heading + "06 PROJECTS"), then six rows in a `grid-template-columns: 44px 1fr 13em 4em` — number, title at 20 px, kind, year.
- **About**: two paragraphs and a four-row definition list drawn as a one-pixel grid.
- **Contact**: one large line, then a two-field form with underline inputs and a pill submit whose arrow slides on hover.
- **Footer**: a hairline rule, a slow ticker of small caps, and one line of fine print saying the site is a demonstration.
- **Dialog**: the command menu.

## 3. The interactions

### 3.1 Custom cursor
A 5 px dot that tracks the pointer exactly and a 30 px ring that follows with a lerp of `1 - 0.0001^dt` scaled by .45. On pointer-down the ring grows to 56 px and takes full ink. Hidden entirely under `(hover: none), (pointer: coarse)`.

### 3.2 Magnetic elements
Everything marked `data-magnet`. Each frame, measure the element's centre, take `pull = 1 - distance / reach` where `reach = max(width, height) * 1.4 + 40`, and set the target offset to `delta * pull * 0.34`. Spring the live offset toward it and clear the transform entirely when it falls below .05 px, so idle elements keep their own layout.

### 3.3 The chasing thumbnail
A fixed 208 × 260 figure holding a 520 × 650 canvas.

- `pointerenter` on a row: draw that project's plate, add `held` to the list (every row drops to opacity .3), mark the row `on` (opacity 1, 14 px of indent, and a hairline that scales in from the left), and fade the figure in.
- `pointerleave` on the list: release everything.
- Each frame: lerp the figure toward `pointer.x + 150, pointer.y`, take the horizontal velocity, clamp it to ±12 and spring the rotation toward it. Compose as `translate3d(x, y, 0) translate(-50%, -50%) rotate(tilt) scale(...)`.
- Six plates, all drawn from rules, arcs and dots in the current ink colour: a field of weighted rules, a bar chart, concentric arcs, a dot matrix, a modulated sine, nested rectangles. Redraw on theme change.

### 3.4 Word reveal
Every `[data-split]` element is rebuilt at load: each word goes into `span.w` (inline-block, overflow hidden) around an `<i>` translated down 105 %, with `transition-delay: i * 32ms` and `transition: transform .75s cubic-bezier(.19, 1, .22, 1)`. An `IntersectionObserver` with `rootMargin: 0px 0px -12% 0px` adds `in` once and unobserves.

### 3.5 Command menu
A native `<dialog>`, `showModal()` on ⌘K / Ctrl+K or the MENU button.

- Entrance: `pop .3s cubic-bezier(.2, .9, .2, 1)` from `translateY(-10px) scale(.97)`; the backdrop fades and blurs 3 px.
- Commands: jump to each section, back to top, invert the page, copy the email address, and open each of the six projects (scroll it into view and flash its row state for 1.4 s).
- Filter: subsequence match — the letters typed have to appear in order, not adjacent.
- Keyboard: ↑ / ↓ move the selection, Enter runs it, Esc closes; the selection follows the mouse too, and the selected row is scrolled into view with `block: 'nearest'`.
- An empty result shows one unselectable "Nothing matches that." row.
- A footer strip of key caps explains the three keys.

### 3.6 Smaller moves
- A one-pixel scroll-progress rule across the top of the page.
- The section readout in the header, computed from each section's position against 45 % of the viewport.
- A ticker in the footer translated by `-34 px/s` and reset by modulo, never by a CSS animation, so reduced motion can stop it cleanly.
- A seconds clock in the hero.

## 4. Accessibility

- Semantic landmarks, one `<h1>`, real `<h2>` per section, `aria-labelledby` on each.
- The cursor, the progress rule and the thumbnail are all `aria-hidden`; nothing in them carries meaning.
- The command list uses `role="listbox"` / `role="option"` with `aria-selected`.
- The theme button carries `aria-pressed` and changes its label between INVERT and REVERT.
- The form validates the email with a simple pattern, requires a few words of message, and writes the result into a `role="status"` line that states plainly that nothing was sent.
- Full `prefers-reduced-motion` path: no custom cursor, no magnet, no chase, no ticker, no dialog animation, words already in place.

## 5. Responsive

Below 760 px: 18 px gutters, the section readout and the key cap hide, rows collapse to two columns with the kind and the year stacked under the title, the hero gets more top padding and the clock drops to the left.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/demos/smallcaps/.
