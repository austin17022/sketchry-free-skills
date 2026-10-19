---
name: fieldnote
description: "A field-research presentation deck styled like an open notebook: rice-paper texture, handwritten margin notes with leader lines, circled keywords and taped quote cards, all in one HTML file. Editable in the browser, printable as 16:9 PDF, exportable as real PPTX. Trigger: 'research deck', 'field notes presentation', 'research report slides'. / 田野筆記感的研究簡報：米紙底、手寫註記與引線、頁邊註腳、訪談引文大字，一個 HTML 檔，可在瀏覽器改字、印成 16:9 PDF，也能匯出 PPTX。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/fieldnote/
---

# 研究筆記簡報

請從空白專案製作一份完整的簡報檔。品牌使用 FIELDNOTE。這是虛構的品牌範例；規格中的客戶、數字、獎項與商業承諾，都不能當成真實資料交付。

## 開始前準備

1. 這份 Skill 不需要素材包。版面、圖表與材質全部由程式畫出來，不需要任何圖檔，紙紋與膠帶都是 CSS 畫的。
2. 換成自己的內容時，請提供：研究題目與時間範圍、方法與樣本數、三到五個發現與各自的證據、兩段可引用的訪談原話、限制與下一步
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

FIELDNOTE 是研究或田野調查的報告簡報，看起來像一本攤開的筆記本：主欄是結論，頁邊是註記，重要的地方被圈起來。

- **顏色**：紙 `#F6F1E4`、墨 `#1F2320`、鉛筆灰 `#6F6A60`，圈選與重點用朱紅 `#C0472B`，膠帶用半透明米黃。
- **紙紋**：底色上疊一層極細的雜訊（`repeating-conic-gradient` 或 SVG `feTurbulence` 轉成 data URI 都可以，不要外部圖檔），以及一條淺淺的裝訂線在左側 72px 處。
- **字**：標題用襯線 36／48px；正文用無襯線 18px、行高 1.7；頁邊註記用手寫感字型（Caveat、Patrick Hand 或 `cursive` 備援）15px、朱紅；引文用襯線 `clamp(28px, 4vw, 56px)` 斜體。
- **頁邊註記與引線**：右欄 180px 寬是註記區。註記用一條朱紅的手繪感曲線（行內 SVG `path`，筆畫寬 1.6、`stroke-linecap: round`）指向主欄的某一句話。曲線用 `stroke-dasharray` 搭配 `stroke-dashoffset` 在進場時「畫」出來（520ms）。
- **圈選**：需要強調的詞用一個不規則的朱紅橢圓圈起來（兩段 SVG `path` 疊成手繪感），同樣用畫線的方式出現。
- **膠帶**：引文頁與照片位的四角各一片旋轉 -3 到 4 度的半透明膠帶（純 CSS）。

**動作特徵（手寫畫入）**：前進時，整頁先做一次極短的紙張位移（往左 12px，180ms）像翻過一頁，接著主欄文字逐段揭開（`clip-path`，每段 80ms），然後註記的引線一條一條畫出來，最後圈選落下。引文頁的大字逐字升起（每字 26ms）。後退時紙張往右位移，線條以反向抹除（`stroke-dashoffset` 回到起點）。

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

# Deck Build Specification — FIELDNOTE

**Role & Instructions:**
Act as a presentation designer who writes their own front-end. Build a single-file, 11-slide HTML deck for a
fictional research team reporting field work. The deck is the deliverable: one `deck.html` that opens by double-click, navigates by keyboard and
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
`writeFile({ fileName: 'fieldnote-deck.pptx' })`, reports progress on the button and reports failure out loud.

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
`--paper: #F6F1E4`, `--ink: #1F2320`, `--pencil: #6F6A60`, `--red: #C0472B`, `--tape: rgba(226,206,150,.55)`.

### 2.2 Type
- Heading: serif 36/48 px, weight 600.
- Body: grotesque 18 px, line-height 1.7, 64-character measure.
- Margin notes: a handwriting face (Caveat, Patrick Hand, else `cursive`) at 15 px in `--red`.
- Pull quotes: serif italic `clamp(28px, 4vw, 56px)`.
- Labels and figure numbers: monospace 10 px uppercase, letter-spacing .18em.

### 2.3 Paper
A noise layer built from an inline SVG `feTurbulence` data URI at 3% opacity, a binding rule 72 px from the left
edge, and a 180 px margin column on the right reserved for notes. Four tape strips (pure CSS, rotated -3° to 4°,
`--tape` with a 1 px highlight edge) hold down quote cards and image slots.

## 3. Slides

1. **Cover** — study title, the dates, the team, a taped index card with the research question.
2. **Method** — sample size, where, how long, instruments; a margin note about what the method cannot see.
3. **Finding 1** — a claim, the evidence beneath it, a leader line to a margin note with the caveat.
4. **Quote 1** — a full-bleed pull quote, the speaker's role (never a name), the date.
5. **Finding 2** — a claim with a small chart (dot plot, 12 points) drawn in SVG.
6. **Finding 3** — a claim with a 4-row comparison table.
7. **Quote 2** — second pull quote, taped at two corners.
8. **Pattern** — a hand-drawn-feeling diagram: three circles with labelled overlaps, SVG strokes drawn in.
9. **What contradicts it** — the counter-evidence, stated plainly, in `--pencil` on paper.
10. **Limits** — four bullets, each a limit and how it was handled.
11. **Next** — three next steps with owners and dates, and the reading list.

## 4. Motion signature — drawn by hand
Forward: the whole page shifts 12 px left over 180 ms, like a sheet being turned. Body blocks then reveal with
`clip-path: inset(0 100% 0 0)` → `inset(0)`, 80 ms apart. Leader lines draw themselves with `stroke-dasharray` +
`stroke-dashoffset` over 520 ms on `ease-out`. Circling strokes land last, 240 ms each. Pull-quote slides raise type
word by word, 26 ms apart. Backward shifts the sheet right and un-draws the strokes by returning `stroke-dashoffset`
to its start. Reduced motion: no sheet shift, strokes already complete, type in place.

## 5. PPTX mapping
A paper-coloured background rectangle, serif headings, body as bulleted `addText`, the dot plot as
`addChart('scatter')`, the comparison as `addTable`, the pull quotes as a large italic text box with a tinted
rectangle behind, margin notes as small red text boxes with `addShape('line')` leaders, and the three-circle diagram
as three `addShape('ellipse')` with transparency.

## 6. Deliverables
`deck.html`, `pptxgen.bundle.js` beside it, and `REPORT.md`.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/demos/fieldnote/.
