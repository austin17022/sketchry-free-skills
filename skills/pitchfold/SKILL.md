---
name: pitchfold
description: "A dark, editorial-feel seed pitch deck: oversized serif numbers, diagonal mask-wipe transitions, single-column storytelling and a cap table, all in one HTML file. Editable in the browser, printable as 16:9 PDF, exportable as real PPTX. Trigger: 'build a pitch deck', 'seed deck', 'fundraising presentation', 'investor deck'. / 深色編輯感的募資簡報：巨大襯線數字、斜向遮罩擦除、單欄長文與一張資本結構表，一個 HTML 檔，可在瀏覽器改字、印成 16:9 PDF，也能匯出 PPTX。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/pitchfold/
---

# 募資簡報

請從空白專案製作一份完整的簡報檔。品牌使用 PITCHFOLD。這是虛構的品牌範例；規格中的客戶、數字、獎項與商業承諾，都不能當成真實資料交付。

## 開始前準備

1. 這份 Skill 不需要素材包。版面、圖表與材質全部由程式畫出來，不需要任何圖檔，封面的紙摺質感是 CSS 漸層疊出來的。
2. 換成自己的內容時，請提供：公司名稱與一句話定位、要解決的問題、產品怎麼運作、市場規模的來源、商業模式、到目前為止的真實數據、團隊三人的職稱與經歷、本輪金額與用途
3. 文案或數字沒給齊之前，先把缺項列出來問，不要自己編造客戶名稱、獎項、推薦語或財務數字。

## 製作要求

以下中文說明優先於後方英文規格中的示例資料與發布承諾。其餘視覺、版面與互動均須保留。

- **交付一個檔案**：`deck.html`，連點兩下就能在瀏覽器打開，不需要伺服器、不需要打包、不需要安裝任何東西。CSS 與 JavaScript 全部寫在這個檔案裡。
- 使用原生 HTML、CSS、JavaScript。不要加入 React、Vue、Tailwind、GSAP、Reveal.js、Swiper 或任何簡報框架；轉場自己用 CSS transition、`@keyframes` 與 `requestAnimationFrame` 寫。
- 唯一允許的外部程式是 PPTX 匯出用的 pptxgenjs，而且要寫成兩段式載入：先試同資料夾的 `./pptxgen.bundle.js`，載不到才退到 `https://cdn.jsdelivr.net/npm/pptxgenjs@4/dist/pptxgen.bundle.js`，兩邊都載不到時，匯出按鈕改成提示「請把 pptxgen.bundle.js 放在 deck.html 旁邊」並保持可按。載入器自己寫（動態建 `<script>`、監聽 `onload` 與 `onerror`），不要讓按鈕靜靜失效。順手把那支 bundle 下載一份放在 deck.html 旁邊，整包就能離線使用。
- 字型用系統字堆疊（`-apple-system`、`Segoe UI`、`Noto Sans TC`、`Helvetica Neue`）或 Google Fonts；用 Google Fonts 時要寫完整的備援字堆疊，離線也要能看。
- 不串接分析、帳號、收款或任何外部 API。
- 偵測 `prefers-reduced-motion: reduce` 時：所有進場與轉場直接到位，視差與自動輪播停住，導覽、編輯、匯出功能全部保留。
- 檢查 1440×900、1280×720、1024×768 與直式手機的版面；字級用 `clamp()` 或 `vw` 綁住舞台寬度，縮小視窗時不可出現水平溢出或文字被切掉。

## 投影片引擎（每一份都一樣）

- **舞台**：固定 16:9 的舞台（`aspect-ratio: 16 / 9`），置中在深色或淺色的底板上，依視窗等比縮放，絕不裁切。每一張投影片是一個 `<section class="slide">`，帶 `id` 與 `data-title`。
- **導覽**：→／空白鍵／PageDown／`j` 下一張；←／PageUp／`k` 上一張；Home 第一張、End 最後一張；輸入數字再按 Enter 直接跳；點畫面右側 65% 下一張、左側 35% 上一張；觸控左右滑動；`o` 打開縮圖總覽（九宮格，點縮圖跳頁），`?` 打開快捷鍵說明，Esc 關閉浮層。網址的 `#3` 或 `?s=3` 可以直接開在第幾張，換頁時同步更新。
- **進度**：底部一條進度列加上「目前／總數」的計數器，計數器用等寬數字（`font-variant-numeric: tabular-nums`）。
- **瀏覽器直接改字**：所有文字元素加 `contenteditable="true" spellcheck="false"`，游標停在文字上時顯示可編輯的底線提示。改過的內容即時寫進 `localStorage`（鍵名用投影片 id 加元素 index），重開還在；按 `⌘S`／`Ctrl+S` 把改好的整份 deck 另存成新的 HTML 檔下載；按 `r` 清掉所有修改回到原稿（要先確認）。🔴 焦點在可編輯元素裡時，鍵盤導覽與快捷鍵一律不作用，空白鍵與方向鍵要能正常打字。
- **匯出 PDF**：工具列一個 PDF 按鈕呼叫 `window.print()`。列印樣式 `@page { size: 1280px 720px; margin: 0 }`，一張投影片一頁（`break-after: page`），所有投影片同時顯示、位置歸零、動畫全部關掉、`print-color-adjust: exact` 讓底色與圖表照樣印出來，工具列與浮層 `display: none`。
- **匯出 PPTX**：工具列一個 PPTX 按鈕，用 pptxgenjs 以 `LAYOUT_16x9` 建立簡報，一張投影片對一頁，標題、副標、條列、表格、數字與圖表都要落成真正的 PowerPoint 物件（`addText`、`addTable`、`addChart`、`addShape`），不是整頁截圖。顏色與字型用這份 deck 的色票，底圖用色塊或漸層重畫。匯出完用 `writeFile({ fileName: '<brand>-deck.pptx' })`，過程中按鈕顯示「匯出中…」，完成或失敗都要回報。
- **轉場要有動作**：每一張投影片的進場都是多個元素依序出場（間隔 60～90ms），不可以只做整頁淡入。至少要用到遮罩擦除、裁切路徑、軸向位移、縮放與視差裡的三種以上，而且前進與後退的方向要相反。
- **無障礙**：舞台用 `aria-roledescription="slide"`，換頁時以 `aria-live="polite"` 播報「第 N 張，共 M 張：標題」；焦點切到新投影片的標題；所有按鈕 44px 以上、看得到焦點框；正文對比度至少 4.5:1。

## 這份簡報的風格

PITCHFOLD 是一份給投資人看的募資簡報，氣質接近一本深色的設計年鑑：文字很大、留白很多、一張投影片只有一個論點。

- **顏色**：底 `#0C0D10`、紙 `#F2EFE8`、墨 `#14151A`，強調色只有一個琥珀 `#D8A24A`。沒有第二個強調色，也沒有漸層填色的卡片。
- **字**：標題用襯線（Playfair Display、Source Serif 或系統襯線），字級 `clamp(44px, 6.2vw, 104px)`、字距 -0.03em；正文用無襯線 20／24px、行高 1.55；標籤與頁碼用等寬小字、字距 0.22em、全大寫。
- **巨大數字**：市場規模、成長倍數、募資金額各有一張只放一個數字的投影片，數字用襯線 `clamp(96px, 18vw, 280px)`，下面一行說明它是什麼、哪裡來的。
- **紙摺**：每一張投影片的背景有一道由左上到右下的斜向明暗分界（兩層 `linear-gradient` 疊出來，角度 18 度），換頁時這道摺痕先掃過去，才把內容帶進來。
- **資本結構表**：一張真正的表格，欄位是輪次、金額、股權比例、投後估值，數字右對齊、等寬，合計列加粗並在上方畫一條琥珀細線。

**動作特徵（斜向摺疊）**：前進時，一塊 18 度傾斜的紙色遮罩從右下往左上掃過整個舞台，掃過之後新的內容才一層層出現：標籤 → 標題 → 正文 → 數字，間隔 70ms；巨大數字從 0 滾到目標值（`requestAnimationFrame`，600ms，`easeOutExpo`），滾動時千分位要正確。後退時遮罩從左上往右下掃。標題本身用 `clip-path: inset(0 0 100% 0)` 由下往上揭開，不是淡入。

## 內容規則

- 一份 11 張。每一張只講一件事，標題是一句結論，不是標籤。
- 數字需要有來源。沒有真實數字時，用明顯的示範值並在頁面上標「示範資料」，不要寫成真的。
- 不編造客戶名稱、獎項、推薦語、媒體報導或財務預測。範例內容全部是虛構品牌，交付前要換掉。
- 不使用 emoji 當圖示。需要圖示時用行內 SVG 線條圖。
- 英文與數字用等寬數字，避免表格裡的數字跳動。

## 自我檢查（交付前實際做一次）

1. 從第一張按到最後一張，再按回來，轉場方向正確、沒有卡住或跳過。
2. 點畫面左右兩側換頁；`o` 的總覽能跳頁；`?` 的說明能關；網址帶 `#5` 能直接開到第五張。
3. 在三個不同的文字上改字，重新整理後還在；`⌘S` 下載的檔案打開後是改過的版本；`r` 能回到原稿。
4. 按 PDF 按鈕，在列印預覽裡確認是 11 頁、每頁一張 16:9、底色與圖表都有、沒有工具列。
5. 按 PPTX 按鈕，確認真的下載出一個 `.pptx`，打開後頁數正確、文字可以選取編輯、圖表是真的圖表。
6. 打開系統的「減少動態效果」再走一遍，畫面直接到位且全部功能正常。
7. 把視窗縮到 1024 寬與手機直式，確認沒有水平溢出。
8. 看瀏覽器主控台，不能有錯誤。

## 交付

交付 `deck.html` 與一份驗證報告。報告列出上面八項實際檢查的結果、PPTX 與 PDF 的檔名與頁數、修正過的問題，以及尚未完成的部分。


---

## Full build specification

The specification below is written in English and keeps the precise technical detail. Where it differs from the
Chinese instructions above, the Chinese instructions win.

# Deck Build Specification — PITCHFOLD

**Role & Instructions:**
Act as a presentation designer who writes their own front-end. Build a single-file, 11-slide HTML deck for a
fictional seed-stage company raising a round. The deck is the deliverable: one `deck.html` that opens by double-click, navigates by keyboard and
click, lets anyone retype the copy in the browser, prints to a 16:9 PDF and exports a real `.pptx`. No frameworks, no
build step, no server.

---

## 1. Engine contract

### 1.1 Stage
A fixed 16:9 stage, centred on the backdrop, scaled to the viewport with `aspect-ratio: 16 / 9` and
`clamp()`-driven type so nothing is ever cropped. One `<section class="slide">` per slide, each with an `id` and a
`data-title`.

### 1.2 Navigation
`ArrowRight` / `Space` / `PageDown` / `j` advance. `ArrowLeft` / `PageUp` / `k` go back. `Home` and `End` jump to the
ends. Typing digits then `Enter` jumps to that slide. A click in the right 65% of the stage advances, the left 35% goes
back. Touch swipes left and right. `o` opens a nine-up thumbnail overview, `?` opens the shortcut sheet, `Escape`
closes either. `#n` or `?s=n` in the URL opens on that slide and the URL stays in sync.

### 1.3 Progress
A hairline progress bar across the bottom plus a `current / total` counter in tabular figures.

### 1.4 Editing in the browser
Every text node is `contenteditable="true" spellcheck="false"` and shows an edit affordance on hover. Changes are
written to `localStorage` under `<slide-id>:<index>` on `input`, restored on load, saved to a fresh HTML file with
`⌘S` / `Ctrl+S`, and cleared by `r` after a confirm. **Keyboard navigation is suppressed whenever the event target is
editable**, so Space and the arrow keys type normally.

### 1.5 PDF
A `PDF` button calls `window.print()`. Print styles: `@page { size: 1280px 720px; margin: 0 }`, every slide visible
and un-transformed, `break-after: page`, animations disabled, `print-color-adjust: exact`, chrome hidden.

### 1.6 PPTX
pptxgenjs loads in two stages: a dynamically inserted `<script>` for `./pptxgen.bundle.js` first, the
jsDelivr copy (`https://cdn.jsdelivr.net/npm/pptxgenjs@4/dist/pptxgen.bundle.js`) as the fallback, and a spoken
"put pptxgen.bundle.js next to deck.html" message if neither resolves. Ship a copy of that bundle beside the deck so
the folder works offline. A `PPTX` button builds the deck with pptxgenjs at `LAYOUT_16x9`, one PowerPoint slide per deck slide. Headings,
sub-heads, bullets, tables, figures and charts become real `addText` / `addTable` / `addChart` / `addShape` objects in
this deck's palette and fonts, never a screenshot. It finishes with
`writeFile({ fileName: 'pitchfold-deck.pptx' })`, reports progress on the button and reports failure out loud.

### 1.7 Motion
Each slide enters as a sequence of elements, 60-90 ms apart, using at least three of: mask wipe, `clip-path` reveal,
axis translation, scale, parallax. Forward and backward motion run in opposite directions. `prefers-reduced-motion:
reduce` snaps everything into place and stops the parallax, with every feature still working.

### 1.8 Accessibility
`aria-roledescription="slide"` on the stage, an `aria-live="polite"` announcement of "Slide N of M: title" on every
change, focus moved to the new slide's heading, 44 px minimum targets, visible focus rings, and body text at 4.5:1 or
better.

---

## 2. Visual system

### 2.1 Colour
`--bg: #0C0D10`, `--paper: #F2EFE8`, `--ink: #14151A`, `--amber: #D8A24A`, plus `--ink-60` and `--paper-50` derived
with `color-mix()`. One accent only. No gradient-filled cards, no glass blur.

### 2.2 Type
- Display: a serif (Playfair Display, Source Serif 4 or `Georgia, 'Times New Roman', serif`) at
  `clamp(44px, 6.2vw, 104px)`, weight 500, line-height 1.02, letter-spacing -.03em.
- Body: a grotesque at 20 px (24 px on the single-column slides), line-height 1.55, max 62 characters a line.
- Structural: monospace at 11 px, uppercase, letter-spacing .22em — the eyebrow, the slide number, table headers,
  the source lines.
- Figures: the serif at `clamp(96px, 18vw, 280px)` with `font-variant-numeric: tabular-nums lining-nums`.

### 2.3 Texture
Every slide carries a fold: two stacked `linear-gradient(108deg, …)` layers that put a 4% lighter wedge above an
18° diagonal and a 6% darker wedge below it. The fold is a real element (`.fold`) so the transition can sweep it.

## 3. Slides

1. **Cover** — wordmark, the one-line positioning, round name and date. The fold sits dead centre.
2. **Problem** — one sentence at display size, three supporting lines in the left column, a source line under each.
3. **Why now** — a three-step horizontal timeline drawn with hairlines and amber dots.
4. **Figure: market** — one number, its unit, and the method line underneath ("bottom-up, 2026, source").
5. **Product** — a three-panel diagram (input → engine → output) drawn in inline SVG, panels entering left to right.
6. **How it works** — four numbered rows, each a step title plus one sentence.
7. **Figure: traction** — one number with a six-point sparkline drawn in SVG under it.
8. **Business model** — a two-column table: what the customer pays, what it costs to serve.
9. **Competition** — a 2 × 2 positioning field with hairline axes and five labelled dots; ours in amber.
10. **Team** — three people as name, role and one line of relevant history. No photos.
11. **The ask** — the round size as a figure, a use-of-funds table (cap table layout), and the contact line.

## 4. Motion signature — diagonal fold
Forward: a paper-coloured mask skewed 18° sweeps bottom-right to top-left across the stage in 520 ms
(`cubic-bezier(.76,0,.24,1)`); as it clears, the eyebrow, heading, body and figure arrive 70 ms apart. Headings reveal
with `clip-path: inset(0 0 100% 0)` → `inset(0)`, rising 18 px as they open. Figures count from 0 to their value over
600 ms on an `easeOutExpo`, thousands separators intact. Backward runs the mask top-left to bottom-right and the
reveals downward. Reduced motion: no mask, no count-up, everything already in place.

## 5. PPTX mapping
Dark `#0C0D10` background rectangles, the serif mapped to `Playfair Display` with `Georgia` as the PowerPoint
fallback, figures as 200 pt text, the cap table and the model table as `addTable` with an amber top border on the
total row, the 2 × 2 as `addShape` lines plus labelled ovals, and the sparkline as `addChart('line')`.

## 6. Deliverables
`deck.html`, `pptxgen.bundle.js` beside it, and `REPORT.md` with the eight checks, the exported file names and
anything unfinished.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/demos/pitchfold/.
