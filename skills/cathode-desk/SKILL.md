---
name: cathode-desk
description: "A 3D retro-computer portfolio: a dark studio with a CRT monitor on a desk, the camera pushes through the room on scroll while the portfolio runs inside the monitor as a 1986 OS with barrel distortion, scanlines and phosphor glow. Built with Three.js, no image or model files. Trigger: 'retro portfolio', '3D portfolio', 'CRT computer website'. / 暗房裡的一張書桌，桌上一台 3D 的映像管電腦；隨著捲動，鏡頭穿過房間推到螢幕前，整個作品集就在那塊會掃描、會閃爍的螢幕裡開窗。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/cathode-desk/
---

# 復古電腦作品集網站

請從空白專案製作完整網站。品牌使用 CATHODE DESK。這是虛構工作室範例；規格中的作品、客戶、年份、獎項與商業承諾，不能直接當成真實資料。

## 開始前準備

1. 這份 Skill 不需要素材包，也不需要任何圖檔或影片。房間、桌子、螢幕裡的畫面全部由程式畫出來。
2. 需要 Three.js。把 `three.module.min.js` 與 `three.core.min.js` 兩個檔案下載到專案的 `lib/` 資料夾自行託管，不要連外部 CDN（很多網站的安全性設定會擋掉）。
3. 換成自己的品牌時，提供工作室名稱、一句定位、六件作品的名稱／類型／年份、一段自我介紹與聯絡方式。文案沒給齊之前，先列出缺項，不要自己編。

## 製作要求

以下中文說明優先於後方英文規格中的示例資料、發布要求，以及可直接正式上線的承諾。其餘主要視覺、段落與互動均須保留。

- 使用原生 HTML、CSS、JavaScript 與 Three.js。動畫自己用 `requestAnimationFrame` 配 lerp 寫，不加入 React、Tailwind、GSAP、Lenis 或任何動畫函式庫。字型用 Google Fonts 或系統字型。
- 不串接收款、寄信、追蹤分析、帳號或外部 API。表單要有欄位驗證，成功訊息須明說尚未送出。不要編造地址、電話、社群帳號或推薦語。
- 完成導覽、七個捲動段落、互動與頁尾，不能只交付首屏。
- 提供「減少動態」的替代：偵測 `prefers-reduced-motion` 或使用者按下頁首的切換鈕時，鏡頭直接跳到該段落的定點，關掉呼吸、閃爍與灰塵，螢幕內容仍隨捲動更新。分頁隱藏時暫停算繪。WebGL 無法啟動時，頁面上的文字與表單仍然完整可用。
- 檢查 360／390／768／1440px 的版面，不可出現水平溢出；按鈕至少 44px，圖片與裝飾性元素有適當的替代文字或 `aria-hidden`。
- 實際檢查：從頭捲到尾的鏡頭路徑、螢幕內容與旁邊文案是否對得上、拖曳視角、表單空值與有效輸入、鍵盤操作、手機版、瀏覽器主控台。錄製實際操作，再從錄影擷取封面，不能以手工動畫代替網站錄影。

## 這個網站的重點

這份 Skill 的賣點是「鏡頭」與「那塊螢幕」兩件事，其他都可以簡化：

- 鏡頭沿著七個定點移動，不是淡入淡出。每個定點包含位置、注視點與視角度數，三個值一起補間，再用 lerp 讓它永遠慢半拍，鏡頭才會有重量。
- 螢幕裡跑的是一套假的 1986 作業系統，整張畫面畫在一個 4:3 的 canvas 上，再當成貼圖貼到 3D 螢幕上。它由捲動進度決定要畫什麼：開機自檢、桌面、作品清單視窗、單篇作品視窗、自我介紹、寫信。同一個捲動位置永遠畫出同一張畫面。
- 螢幕材質是自訂 shader：桶狀變形、掃描線、柵格、三原色微錯位、電源開關時畫面收成一條線、緩慢滾過的亮帶與電源漣漪。這些疊起來才像映像管，少了就只是一張貼圖。
- 房間要有一盞檯燈（投射陰影）、一扇有百葉的窗（冷光）、灰塵微粒與底片顆粒。螢幕本身也是光源，會把鍵盤和桌面照亮。
- 鏡頭推到螢幕前時，旁邊的文案會蓋在亮面上，所以那幾段的文字要有自己的深色底板，不要直接壓字。
- 直立的手機螢幕看到的寬度遠小於桌機，每個定點要依畫面比例往後退，確保同樣的東西都在框裡。

## 交付

交付 index.html、style.css、app.js、screen.js、lib/ 資料夾與驗證報告。報告列出實際檢查過的項目、修正過的問題，以及尚未完成的部分。


---

## 完整設計規格

以下規格以英文撰寫，保留精確的技術細節；若與前面的中文說明不同，以中文說明為準。

# Website Build Specification

**Role & Instructions:**
Act as a senior front-end engineer who also does real-time 3D. Build a one-page portfolio site for a fictional studio called CATHODE DESK. The subject is a desk in a dark studio with a 1986 CRT computer on it. The whole portfolio runs inside the monitor. The page is driven entirely by scroll. No image files, no video files, no 3D model files: every surface is a primitive and every pixel on the screen is drawn into a canvas at runtime.

---

## 1. Stack and files

- Plain HTML, CSS and JavaScript (ES modules). Three.js only, self-hosted in `lib/`.
- `index.html` — markup and the seven scroll beats.
- `style.css` — page chrome, type, the copy plates.
- `app.js` — scene, camera rig, lights, scroll, pointer, form.
- `screen.js` — the canvas "operating system": `makeScreen()` and `draw(ctx, p, t)`.
- Fonts: one grotesque for the page (Inter or similar) and one monospace (IBM Plex Mono or similar) used for every label, kicker and the canvas UI.

## 2. Visual design system

- `--ink: #f2efe6`, `--ink-dim: #9b968c`, `--ink-faint: #5d5a54`, `--amber: #ffb23f`, `--bg: #0b0b0e`.
- Headline: weight 300, `clamp(3rem, 9vw, 7.5rem)`, line-height .92, letter-spacing -.045em. One word in amber.
- Every label, kicker, nav item and button: monospace, 10 px, letter-spacing .28em to .4em, uppercase.
- A fixed film-grain layer (four tiny radial gradients tiled at 120 px, animated with `steps(6)`) and a fixed radial vignette over the whole render.
- The header uses `mix-blend-mode: difference` so it stays legible over both the dark room and the lit screen.

## 3. The room

All sizes in metres. Floor at y = 0, back wall at z = -2.6, side wall at x = -4.2.

- **Desk**: top board 3.3 × 0.06 × 1.5 at y = 0.76, two slab legs at x = ±1.5, a drawer stack 0.82 × 0.66 × 1.3 at x = 1.05 with three drawer faces and metal pulls.
- **Window** on the side wall at z = -1.9: a flat cool pane (`0x2c3e5c`), sixteen blind slats of `0x9fc4e8` at 0.5 opacity spaced 0.1 apart, and four frame bars around them. Order matters: pane behind, slats in front of the pane, frame bars in front of the slats.
- **Three framed prints** on the back wall, each a thin box with a flat inner plate.
- **Desk lamp**: a disc base, a `TubeGeometry` stalk along a `CatmullRomCurve3`, an open cone shade, and a small emissive sphere parented to the shade so the bulb can never drift out of it. A `SpotLight` (`0xffcf96`, angle .78, penumbra .55) sits at the shade and casts shadows.
- **Tower** under the desk (0.42 × 0.56 × 0.9) with a drive slot and an LED that blinks on `sin(t*7.3) + sin(t*2.1) > 1.2`.
- **Props**: keyboard slab with ~60 instanced keys and one wide space bar, a squashed-sphere mouse on a mat, a mug with a torus handle and a camera-facing steam card, four fanned floppy disks, one sagging `TubeGeometry` cable.
- **Dust**: ~420 `Points`, size .009, opacity .32, drifting up and recycling at y = 2.9.
- **Lights**: `HemisphereLight(0x6d7ea0, 0x1a1620, .95)`, a cold `DirectionalLight(0x8fb4dc)` from the window with shadows, a warm `DirectionalLight(0xffb070, .3)` rim from behind right.
- Renderer: antialias on, `PCFSoftShadowMap`, `ACESFilmicToneMapping`, exposure 1.15, `SRGBColorSpace`, pixel ratio capped at 2. `Fog(0x07070a, 6, 20)`.

## 4. The monitor

Group at (-0.08, 0.79, -0.3). Local coordinates below.

- **Shell**: `CylinderGeometry(0.327, 0.2, 0.46, 4, 1, true)` — a four-sided tapered tube. Apply `rotateY(PI/4)`, `scale(1, 1, 0.75)`, `rotateX(PI/2)` to the geometry, then place it at (0, 0.275, -0.2). It **must** be open-ended: a capped cylinder puts a square plate in front of the glass. Close the back with a separate plate.
- **Bezel**: an `ExtrudeGeometry` from a rounded-rect `Shape` (half size 0.272 × 0.21, radius .032) with a rounded-rect hole (half size 0.236 × 0.177). Depth .022, bevel size .012. Keep the extrusion shallow: a deep hole wall hides the edges of the glass from any off-axis angle.
- **Cavity**: a flat black plane behind the glass so the gap around it is never see-through.
- **Glass**: `PlaneGeometry(0.455, 0.341, 48, 36)` with every vertex pushed forward by `0.022 * (1 - u²·0.92) * (1 - v²·0.92)`, normals recomputed. Sits at z = .016.
- **Details**: a brand plate, nine vent slots along the top, a power lamp that turns from `0x5a2a00` to `0xff8a3c`, a control knob, a swivel base and a short neck. The tube has to stand on its base, not float above it.
- **Spill**: an additive card in front of the glass at low opacity, plus a `PointLight` set back from the screen so the picture lights the desk without blowing out the bezel.

## 5. The screen shader

`ShaderMaterial` with uniforms `map` (the canvas texture), `time`, `power`, `tint`.

- `open = smoothstep(0.0, 0.55, power)`; divide `uv.y` by `open` so the picture collapses to a line when the set is cold.
- Barrel: `uv *= 1.0 + 0.085 * dot(uv, uv)` around the centre.
- Sample red and blue with a ±.0004 horizontal offset against green.
- Scanlines `0.88 + 0.12 * sin(uv.y * 1250.0)`, grille `0.94 + 0.06 * sin(uv.x * 1900.0)`.
- One bright band rolling down at `time * 0.07`.
- Mains flicker `0.97 + 0.03 * sin(time * 47.0)` plus hash noise.
- Multiply by `tint * 1.45` (tone mapping eats a lot of the canvas brightness), add a view-dependent sheen, darken the corners with a vignette, and multiply the whole thing by `power`.

## 6. The canvas operating system (`screen.js`)

One 1600 × 1200 canvas, `textBaseline = 'top'`. `draw(ctx, p, t)` is a pure function of the scroll position `p`, apart from a blinking caret and a clock that use `t`.

- **Palette**: paper `#d9d4c4`, ink `#1b1a18`, desktop `#5e5970`, amber `#ff9f2e`. Every shaded area is a 2 × 2 ordered dither — no gradients anywhere on this desktop.
- **p < 0.04** — black. The tube is cold.
- **0.04 → 0.28** — a white scan line widens into the frame, then seven BIOS lines type themselves in, with a block caret.
- **0.28 → 0.35** — the desktop fades up: a menu bar (title, FILE / VIEW / SPECIAL, a clock), the dithered desktop with a scanline every four rows, three icons down the right edge.
- **0.44 → 0.56** — a WORK window slides open: a title bar of pinstripes with the title knocked out of it, a close box, a column header and six project rows. Each row has a small drawing, a name, a kind and a year.
- **0.60 → 0.68** — a case-study window scales out of the selected row, which turns amber. Inside: a drawing, a line of specification type and two lines of description. Draw the body copy only once the window has reached full size, or it will be clipped mid-word.
- **0.76 → 0.86** — an ABOUT window unrolls downward with a portrait plate and five lines.
- **0.88 → 0.97** — a NEW NOTE window with a to-line, a subject and a sentence that types itself, with a blinking caret.
- **The cursor** walks between six stops across the whole sequence, easing between them, and draws three click ripples at the ends of each leg.
- **Six project drawings**, each built only from rectangles and arcs: a bar field, a disc with a dithered half, stacked rules, a sine trace, a dot matrix, nested rectangles.
- Keep the type large. A 13 px label is unreadable once the canvas is a texture a metre away; 17 px for body, 22 to 24 px for titles.

## 7. Scroll and camera

Seven `<section class="beat">` blocks of 100 vh plus a closing footer of 86 vh.

`progress = scrollY / (scrollHeight - innerHeight)`, mapped along eight camera poses, each `{ position, aim, fov, fit }`:

| # | position | aim | fov | fit |
|---|---|---|---|---|
| 0 | 3.4, 1.85, 3.3 | -0.05, 0.98, -0.25 | 44 | — |
| 1 | -2.1, 1.38, 2.2 | -0.08, 1.0, -0.26 | 38 | — |
| 2 | 0.9, 1.26, 1.34 | -0.08, 1.06, -0.26 | 32 | — |
| 3 | -0.08, 1.07, 0.88 | -0.08, 1.065, -0.26 | 25 | 1 |
| 4 | -0.08, 1.07, 0.8 | -0.08, 1.065, -0.26 | 23 | 1 |
| 5 | 0.06, 1.085, 0.84 | -0.08, 1.065, -0.26 | 24 | 1 |
| 6 | 2.65, 2.1, 3.6 | -0.08, 0.92, -0.3 | 46 | — |
| 7 | 1.5, 2.5, 4.6 | -0.08, 0.9, -0.4 | 44 | — |

- Smoothstep between neighbouring poses, then lerp the live rig toward the target with `1 - 0.001^dt` so the camera always arrives late.
- **Viewport fit**: `k = min(3, 1 + (max(1, 1.6 / aspect) - 1) * fit)`, with `fit` defaulting to 0.14. Push the camera along the aim-to-camera vector by `k`. On a portrait phone also lower the aim by `0.07 * fit`, so the copy plate at the bottom does not sit on top of the tube.
- The pointer adds a small parallax offset; dragging adds a clamped orbit offset with damping. A slow sine on the camera's y is the room breathing.
- `power` ramps over progress 0.10 → 0.17 and drops again at the very end. The lamp is already at half when the page loads and reaches full by 0.16, with a two-frequency flicker.
- Each beat's copy is split into words wrapped in overflow-hidden spans and lifted into place with a 32 ms stagger when its beat becomes the live one.

## 8. Accessibility and fallbacks

- A REDUCE MOTION button in the header, plus `prefers-reduced-motion`: the camera snaps to the pose, flicker and dust stop, the screen still redraws with scroll.
- Semantic `<header>`, `<main>`, `<section>`, `<footer>`, one `<h1>`, real `<h2>`s per beat.
- The canvas is `aria-hidden`; every word of the story is in the DOM.
- The contact form validates on submit and says in plain words that nothing was sent.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/demos/cathode-desk/.
