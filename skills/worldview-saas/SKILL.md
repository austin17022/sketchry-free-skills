---
name: worldview-saas
description: "An AI SaaS product landing page with a glowing, draggable 3D Earth (Three.js) that moves across six scroll sections, a liquid-glass floating navbar and glassmorphism cards. Built with Vite, vanilla CSS, Three.js and GSAP ScrollTrigger. Trigger: 'SaaS landing page', 'product page with 3D globe', 'AI product website'. / 深空背景上一顆會發光、可拖曳的 3D 地球，隨捲動在六個段落之間移動與縮放，搭配液態玻璃導覽列與毛玻璃卡片的 SaaS 單頁。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/worldview-saas/
---

# AI 資料分析 SaaS 單頁網站

請從空白專案製作完整單頁網站。品牌使用 WorldView AI。這是虛構品牌範例；規格中的功能、方案價格、客戶與商業承諾，不能直接當成真實資料。

## 開始前準備

1. 這份 Skill 不需要素材包。地球貼圖直接使用後方規格列出的 three.js 官方範例貼圖網址；要離線或自己架站時，先把那五張圖下載到專案裡，再把網址換成本機路徑。
2. 換成自己的品牌時，提供品牌名稱、一句定位、四到六項功能說明、方案內容與聯絡方式。文案沒給齊之前，先列出缺項，不要自己編。

## 製作要求

以下中文說明優先於後方英文規格中的示例資料、發布要求，以及可直接正式上線的承諾。其餘主要視覺、數值、段落與互動均須完整保留。

- 技術堆疊依後方規格：HTML5、原生 CSS、以 Vite 打包的 ES Modules、Three.js 與 GSAP ScrollTrigger。規格裡的光源顏色與強度、材質參數、拖曳阻尼、縮放基準與六個段落的座標都是精確值，請照抄，不要自己換成相近的數字。
- 不加入 React、Tailwind 或其他 UI 框架，也不串接收款、寄信、追蹤分析、帳號或外部 API。
- 完成導覽、六個段落、行動按鈕與頁尾，不能只交付首屏。表單要有欄位驗證，成功訊息須明說尚未送出。不要編造地址、電話、社群帳號或推薦語。
- 提供「減少動態」的靜態替代：偵測 `prefers-reduced-motion` 時停掉地球自轉與捲動補間，直接把地球放在該段落的位置。分頁隱藏時暫停 `requestAnimationFrame`。WebGL 無法啟動時顯示可見的替代畫面，文字內容仍可閱讀。
- 檢查 360／390／768／1440px 的版面，不可出現水平溢出；按鈕至少 44px，手機導覽的漢堡選單可以展開、關閉，圖片與圖示有適當的替代文字或 `aria-hidden`。
- 實際檢查：捲動六個段落時地球是否停在正確位置、拖曳放開後是否平順回到自轉、手機選單、表單空值與有效輸入、鍵盤操作、瀏覽器主控台。錄製實際操作，再從錄影擷取封面，不能以手工動畫代替網站錄影。

## 這個網站的重點

地球是整個頁面的主角，而不是背景裝飾：它要同時處理自轉、滑鼠拖曳的慣性，以及捲動時在六個段落之間的位置與縮放補間，三件事互不打架。雲層用相加混合、邊緣用一張畫布產生的放射漸層 Sprite 做柔邊光暈，這兩個是整顆球看起來「會發光」的關鍵，不要省略。導覽列是懸浮的膠囊，不加邊框與陰影，只靠背景模糊。

## 交付

交付完整的 Vite 專案（`index.html`、`src/main.js`、`src/style.css`、`vite.config.js`、`package.json`）、`npm run build` 的產出，以及驗證報告。報告列出實際檢查過的項目、修正過的問題，以及尚未完成的部分。


---

## 完整設計規格

以下規格以英文撰寫，保留精確的技術細節；若與前面的中文說明不同，以中文說明為準。

You are an expert Frontend Developer and 3D WebGL Specialist. Build an ultra-premium, highly responsive single-page landing page for "WorldView AI". The website must exactly match the provided specifications, utilizing Three.js for a glowing 3D Earth and GSAP ScrollTrigger for precise scroll animations.

**Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript (ES Modules via Vite), Three.js, GSAP.

---

### 1. Root Setup & Typography
**Exact Fonts (HTML `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
```

**Exact CSS Variables (`:root`):**
```css
:root {
  --bg-color: #050510;
  --ink: #ffffff;
  --ink-muted: #b0b0c0;
  --ink-faint: #777788;
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --primary: #007bff;
  --primary-glow: #00d2ff;
}
```

### 2. Three.js Engine (`main.js`)
**Exact Lighting:**
- Ambient Light: `0x1a2642`, Intensity: `4.0`
- Edge Light (Top Left): `0x00e5ff`, Intensity: `4.0`, Position: `(-6, 4, -2)`
- Fill Light (Top Right): `0x6a8ab0`, Intensity: `4.0`, Position: `(5, 3, 4)`

**Exact Earth Textures (Use `THREE.TextureLoader`):**
- Map: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg`
- Specular: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg`
- Normal: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg`
- Emissive: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png`
- Clouds: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png`

**Earth Materials:**
- **Earth Sphere (radius 2.0):** `MeshPhongMaterial` with `emissive: 0xffffee`, `emissiveIntensity: 2.5`, `specular: 0x333333`, `shininess: 15`. (Set `colorSpace = THREE.SRGBColorSpace` on color maps).
- **Clouds (radius 2.03):** `MeshPhongMaterial` with `transparent: true`, `opacity: 0.8`, `blending: THREE.AdditiveBlending`, `depthWrite: false`, `side: THREE.DoubleSide`.
- **Soft Dissolving Edge Glow Sprite:**
Generate a radial canvas gradient (`512x512`):
- Stop `0`: `'rgba(202, 245, 255, 0.49)'`
- Stop `1`: `'rgba(0, 210, 255, 0.0)'`
- Radius gradient from 190 out to 256.
Apply to a `SpriteMaterial` (`blending: AdditiveBlending`, `opacity: 0.45`). Set `sprite.scale.set(4.8, 4.8, 1)` and `sprite.position.set(0, 0, -0.1)`. Place it as a child of the main ball group.

**Exact Drag Physics:**
```javascript
const BASE_SPEED = 0.003;
const DAMPING = 0.94;
// When user releases drag, mathematically dampen velocity and then seamlessly reset:
autoVel = { x: 0, y: BASE_SPEED };
```

### 3. GSAP ScrollTrigger Configurations
**Base Scale calculation:** `baseScale = 2.4 / (2.15 * 2)`
**Waypoints:**
```javascript
const BALL_SCALE = 2.8; 
const SECTIONS = {
  hero:      { x: 0,     y: -4.2,  z: -1,    scale: BALL_SCALE },
  product:   { x: 2.8,   y: -0.2,  z: -3,    scale: BALL_SCALE * 0.65 },
  solutions: { x: -2.8,  y: -0.2,  z: -3,    scale: BALL_SCALE * 0.65 },
  pricing:   { x: 0,     y: 0,     z: -4,    scale: BALL_SCALE * 1.5 },
  usecases:  { x: 2.8,   y: -0.2,  z: -3,    scale: BALL_SCALE * 0.65 },
  contact:   { x: 0,     y: -4.0,  z: -2,    scale: BALL_SCALE * 0.9 },
};
```
**Scroll logic:** Add `scroll-snap-type: y mandatory` to `html` and `scroll-snap-align: start` with `scroll-snap-stop: always` to `.section`. Use `ScrollTrigger` `onEnter` and `onEnterBack` to update a `targetPos` and `targetScale`. In `requestAnimationFrame`, use `ball.position.lerp(targetPos, 0.05)` and `ball.scale.lerp(targetScale, 0.05)`. For mobile (`window.innerWidth < 768`), multiply the target `X` by `0.4`.

### 4. HTML Sections & Exact CSS Layouts
All sections must have `min-height: 100vh`, `display: flex`, `flex-direction: column`, `justify-content: center`, `padding: 6rem 4rem`, `z-index: 10`. Use modern SVG icons (Lucide/Feather style) with `width="24" height="24"` or `32x32` depending on the context.

**Navbar (`.navbar`):**
Floating "liquid glass" pill layout: `position: fixed`, `top: 1.5rem`, `left: 50%`, `transform: translateX(-50%)`, `width: max-content`, `max-width: 95vw`, `padding: 0.6rem 0.8rem 0.6rem 2rem`, `gap: 12rem`, `border-radius: 999px`, `background: rgba(255, 255, 255, 0.04)`, `backdrop-filter: blur(24px)`. No borders or box-shadows.

**Hero Section Stars (`.stars-bg`):**
```css
background-image: 
  radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), transparent),
  radial-gradient(1px 1px at 140px 70px, rgba(255,255,255,0.9), transparent),
  radial-gradient(1.5px 1.5px at 90px 140px, rgba(255,255,255,0.7), transparent),
  radial-gradient(2px 2px at 160px 220px, rgba(255,255,255,0.6), transparent),
  radial-gradient(1px 1px at 320px 40px, rgba(255,255,255,0.8), transparent);
background-size: 400px 400px;
```

**Glassmorphism Cards (Used in Features, Solutions, Use Cases):**
`background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur(10px)`, `border-radius: 12px` to `16px`. Hover state applies `transform: translateY(-5px)` (where applicable like solutions grid).

**Card Specific Layouts:**
- **Feature Cards**: Horizontal flex layout. `.feature-icon-wrapper` has `background: rgba(0, 210, 255, 0.1)`, `padding: 0.8rem`, `border-radius: 12px`, `color: var(--primary-glow)`. Wraps the SVG. `<strong>` tags for title, `<p>` for description.
- **Solution Cards**: `.card-icon` (`color: var(--primary-glow)`) with `margin-bottom: 1.2rem`.
- **Use Case Cards**: `.usecase-item` is a horizontal flex container. `.usecase-icon-wrapper` has `background: rgba(0, 210, 255, 0.1)`, `padding: 0.8rem`, `border-radius: 12px`, `color: var(--primary-glow)`.
- **Pricing Grid**:
  - Base Card: `background: rgba(10, 15, 30, 0.6)`. `.pricing-header` with `display: flex`, `align-items: center`, `gap: 0.8rem` containing a `.pricing-icon` and `<h3>`.
  - Featured Card (Enterprise): `background: rgba(0, 119, 255, 0.1)`, `border: 1px solid rgba(0, 210, 255, 0.4)`, `box-shadow: 0 0 30px rgba(0, 210, 255, 0.1)`.

**Exact Layouts per Section:**
- **Product** (`id="product"`): Align text to the Left (Earth is on the right). Uses `.feature-list` and `.feature-icon`.
- **Solutions** (`id="solutions"`): Align text to the Right (Earth is on the left). `display: grid` with `minmax(240px, 1fr)`. Uses `.solution-card` and `.card-icon`.
- **Pricing** (`id="pricing"`): Center-aligned flex layout.
- **Use Cases** (`id="use-cases"`): Align text to the Left. Uses `.usecase-list`, `.usecase-item`, `.usecase-icon-wrapper`.
- **Contact** (`id="contact"`): Centered text, input forms use `background: rgba(255,255,255,0.03)`, focus states trigger `border-color: var(--primary-glow)`.

**Mobile Responsiveness (`< 768px`):**
- Hide desktop nav links (`.nav-btn-outline`), show Hamburger SVG.
- Build an expanding pill dropdown menu: `.navbar` uses `flex-wrap: wrap`, `max-height: 56px`, `overflow: hidden`, and `transition: max-height 0.5s`. When `.nav-active` is toggled via Javascript on `.navbar`, the `max-height` expands to `400px` to reveal the `.nav-links` (which are stacked in a column below the logo/hamburger).
- Override side-alignments to center-align all text blocks.
- Collapse grids to `grid-template-columns: 1fr`.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/demos/worldview-saas/.
