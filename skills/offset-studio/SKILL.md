---
name: offset-studio
description: "A design studio portfolio website with geometric animations, concentric scaling circles on scroll, stacking service cards, an interactive accordion of featured work, and a video-masked text footer. Built with vanilla HTML, CSS and JavaScript, no frameworks. Trigger: 'design studio website', 'agency portfolio', 'creative studio site'. / 搭配幾何動畫、服務卡片與可展開的作品列表，介紹工作室的專長。"
license: MIT
metadata:
  author: Sketchry
  version: "2.1.0"
  homepage: https://sketchry.app/skills/offset-studio/
---

# 設計工作室作品網站

請從空白專案製作完整網站。品牌使用 OFFSET STUDIO。這是虛構品牌範例；規格中的評論、獎項、客戶、年資、認證與商業承諾，不能直接當成真實資料。

## 開始前準備

1. 選用素材包（5 支循環影片 + 5 張作品圖，放在 assets/ 裡）可免費從 Sketchry 帳號取得：https://sketchry.app/skills/offset-studio/ ；也可以用自己的檔案，放進 assets/ 並沿用相同檔名：`assets/video/loop-1.mp4`、`assets/video/loop-2.mp4`、`assets/video/loop-3.mp4`、`assets/video/loop-4.mp4`、`assets/video/loop-5.mp4`、`assets/images/work-1.webp`、`assets/images/work-2.webp`、`assets/images/work-3.webp`、`assets/images/work-4.webp`、`assets/images/work-5.webp`。
2. 換成自己的品牌時，提供品牌資料、已確認的文案，以及要替換的圖片或影片，沿用相同檔名放進 assets/。素材包無法下載時，也可以先放入自己的檔案；缺少必要媒體時先列出缺項。

## 製作要求

以下中文說明優先於後方英文規格中的框架、示例資料、發布要求，以及可直接正式上線的承諾。其餘主要視覺、段落與互動均須保留。

- 使用原生 HTML、CSS、JavaScript 與系統襯線／無襯線字型。以 IntersectionObserver、CSS sticky、原生 dialog 和捲動事件實作動畫，不加入 React、Tailwind、GSAP、Framer Motion、Lenis、Swiper 或付費 API。交付時說明這項技術調整。
- 媒體全部使用 assets/ 裡的本機檔案，網站不連到外部媒體網址，透過本機 HTTP 伺服器即可操作。影片若無法順利定位，可轉為每格都是關鍵影格的 all-intra H.264 MP4。
- 完成導覽、主要內容、互動與頁尾，不能只交付首屏。行動按鈕要連到可用段落，或有欄位驗證的草稿視窗；不串接收款、寄信、追蹤分析、帳號或外部服務。成功訊息須明說尚未送出。不要編造地址、電話、社群帳號或推薦語。
- 提供「減少動態」的靜態替代與暫停按鈕。元素離開畫面或分頁隱藏時暫停動畫；影片失敗時顯示可見的替代內容。原生 dialog 支援 Escape 與焦點回復。使用者輸入以 textContent 顯示，不直接寫入 innerHTML。
- 檢查 360／390／768／1440px 的版面，不可出現水平溢出；按鈕至少 44px，手機導覽可以展開、關閉，圖片有適當的替代文字。
- 實際檢查主要互動、表單空值與有效草稿、鍵盤操作、手機版、媒體載入及瀏覽器主控台。錄製實際操作，再從錄影擷取封面，不能以手工動畫代替網站錄影。

## 這個網站的重點

品牌使用 OFFSET STUDIO，首屏保留 B／O／X 的幾何造型，以「shape becomes a story」說明設計概念。保留四個同心圓的縮放、兩段介紹、縮小後帶圓角的首屏、三張堆疊服務卡、五件可展開的作品，以及影片填滿文字形狀的頁尾。五件作品是示意作品，標示為概念展示，不是真實客戶案例。作品列表可以點擊或用鍵盤展開，並提供可填寫的專案草稿。

## 交付

交付 index.html、styles.css、app.js、assets 資料夾與驗證報告。報告列出實際檢查過的項目、修正過的問題，以及尚未完成的部分。


---

## 完整設計規格

以下規格以英文撰寫，保留精確的技術細節；若與前面的中文說明不同，以中文說明為準。

# Website Build Specification

**Role & Instructions:**
Act as an award-winning Senior UX/UI Designer and Expert Frontend Web Developer. Your goal is to build a highly complex, visually stunning, and dynamic website with maximum accuracy. Follow the detailed specifications below to build the complete, 100% responsive, production-ready website.

---

## 1. Visual Design System

### 1.1 Color Palette
The website relies heavily on a custom, warm, premium color palette combined with dark mode aesthetics.
- **Brand Orange (Primary Accent):** `#f24d29`
- **Brand Dark:** `#c63d25`
- **Brand Darker (Global Background):** `#963222`
- **Brand Darkest (Footer/Overlays):** `#691c10`
- **Neutrals:**
  - Dark Backgrounds: `#111111`, `#000000`, `slate-800`, `slate-700`
  - Text: `#ffffff` (White), `slate-200`, `slate-400`, `white/90`, `white/80`, `white/70`

### 1.2 Typography
- **Primary Font Family:** Inter (sans-serif)
- **Hierarchy & Styling:**
  - **Super-sized Display (Hero/Footer):** `text-[30vmin]` for Hero letters, `text-[12vw]` for Footer text. Weight: `font-black`, `tracking-tighter`, `leading-none`.
  - **Headings (H1/H2):** `text-6xl md:text-8xl` (H1), `text-4xl md:text-6xl` (H2). Weight: `font-black` or `font-bold`. Line height: `leading-tight`.
  - **Subtitles/Labels:** `text-sm md:text-lg`. Weight: `font-semibold` or `font-bold`. Styling: `uppercase`, `tracking-[0.3em]` or `tracking-widest`.
  - **Body Text:** `text-lg`, `text-slate-200` or `text-slate-400`.

---

## 2. Global Layout & Architecture
- **Framework:** React + Tailwind CSS + Framer Motion.
- **Responsiveness:** Mobile-first approach using Tailwind's `md:` and `lg:` breakpoints. 100% responsive across all devices.
- **Grid Pattern:** A global fixed background grid pattern overlay (`opacity-10`, `pointer-events-none`) is applied to give a subtle technical texture.
- **Z-Index Strategy:** Layers are strictly controlled to allow sections to overlap, scroll over each other, or stay sticky (`z-10`, `z-40`, `z-50`, `z-[100]`).

---

## 3. Section-by-Section Specifications

### 3.1 Responsive Navigation Bar (Navbar)
- **Container:** Fixed to top (`top-4 md:top-6`), centered, floating pill (`w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl`), `z-50`.
- **Layout:** Flex row, items centered. The logo (left) has `mr-auto` to push everything else to the right. The navigation links (`mr-8`) sit directly to the left of the hamburger icon.
- **Scroll State Transition:**
  - Unscrolled: Transparent border, drop shadow.
  - Scrolled (>50px): `bg-white/10`, `backdrop-blur-xl`, `border-white/20`.
- **Elements:**
  - Logo: `text-2xl md:text-3xl font-black`. "OFFSET" (solid white) + "STUDIO" (`text-white/70`).
  - Desktop Links: Hidden on mobile (`hidden lg:flex`), uppercase, widely tracked, hover color `text-brand-orange`.
  - Mobile Menu Button: Lucide React `<Menu />` icon, no text.
- **Mobile Overlay Menu:** Framer Motion `AnimatePresence`. Full-screen dark container (`bg-brand-darkest`). Menu items slide in vertically (`y: "-100%"` to `y: 0`), text size `text-4xl md:text-6xl`, hover scale effect.

### 3.2 Hero Section (Scroll-Driven Interactive Masterpiece)
- **Container:** Total height `400vh` to allow for extensive scroll-scrubbing animations via Framer Motion's `useScroll` and `useTransform`. The visible content sits in a `sticky top-0 h-screen` wrapper.
- **Global Background Element:** The entire sticky wrapper has `scale`, `y` translation, `borderRadius`, and `opacity` tied to the final 25% of the scroll progress (it shrinks to `scale: 0.7`, gets `border-radius: 60px`, and fades out).
- **Background Video:** Absolute full-coverage looping video (`opacity-20`, `object-cover`). 
  - URL: `assets/video/loop-1.mp4`
- **Concentric Scaling Circles:** 
  - Centered in the screen, four circles scale up as the user scrolls.
  - Circle 1 (Outermost): `bg-brand-orange`, scales from `0.5` to `5`. Contains an embedded, masked background video (`mix-blend-overlay`, `opacity-50`, `overflow-hidden` container).
    - URL: `assets/video/loop-4.mp4`
  - Circles 2, 3, 4: Hex colors `#c93a1c`, `#8c2510`, `#521307` respectively, scaling up consecutively after the first. They fade out (`opacity: 0`) midway through the scroll.
- **"B [O] X" Giant Typography:**
  - The "O" is visually formed by the scaling orange circle. 
  - The "B" is positioned `right-[50%] mr-[14vmin]`.
  - The "X" is positioned `left-[50%] ml-[11vmin]`. (These specific margins account for font side-bearings to ensure perfect touching of the circle).
  - This layer fades out (`opacity: 0`) in the first 5% of scroll.
- **Content Reveal Sequences:**
  - Content 1 ("Think outside the box."): Fades in, slides up from `y: 50` to `0`, then slides to `y: -50` and fades out between scroll progress `0.15` and `0.45`.
  - Content 2 ("Elevating Brands. Defining Futures."): Fades in and slides up starting at `0.45` and remains visible. Contains a "Let's Talk" CTA button with an arrow hover micro-interaction.

### 3.3 Services Section (Stacking Cards)
- **Container:** `h-[300vh]`, `-mt-[100vh]` to overlap the shrinking hero.
- **Layout:** `flex-col md:flex-row`. Left side is a static text column ("Our Core Expertise."). Right side is an absolute positioning wrapper (`h-[60vh]`) for stacking cards.
- **Cards (3 total):**
  - Card 1: Brand Identity (`bg-slate-800`), Video: `assets/video/loop-5.mp4`
  - Card 2: Digital Marketing (`bg-slate-700`), Video: `assets/video/loop-2.mp4`
  - Card 3: Web Experience (`bg-brand-orange`), Video: `assets/video/loop-3.mp4`
  - **Effect:** As the user scrolls, cards slide up (`y: 100%` to `0%`). The underlying cards dynamically scale down (e.g., `scale: 0.95`, `0.90`) to create a 3D stacking depth effect. Cards have a top offset (`top: i * 40px`) to remain partially visible when stacked. Videos inside cards have `opacity-20`, `object-cover`.

### 3.4 Portfolio Section / Featured Work (Interactive Accordion)
- **Container:** Standard `min-h-screen`, `bg-[#111]`.
- **Layout:** Flex container (`h-[75vh] md:h-[60vh]`), fully responsive (`flex-col md:flex-row`). Stacks vertically on mobile, horizontally on desktop.
- **Accordion Behavior (Hover state):**
  - By default or when hovered, the active item expands (`flex-[4] md:flex-[5]`, `opacity-100`, `blur-none`).
  - Inactive items shrink (`flex-[1]`), get a dark overlay, and the image becomes blurred and dimmed (`opacity-50`, `blur-sm`).
  - Smooth animation (`transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]`).
- **Images & Content:**
  - Eco Platform: `assets/images/work-1.webp`
  - Island Travel: `assets/images/work-2.webp`
  - Wellness App: `assets/images/work-3.webp`
  - Outdoor Brand: `assets/images/work-4.webp`
  - Natural Skincare: `assets/images/work-5.webp`
  - Text overlays wrap properly on mobile (`whitespace-normal md:whitespace-nowrap`).

### 3.5 Footer Section (Video Text Mask)
- **Container:** `h-screen bg-brand-darkest`, flex column.
- **Video Mask Effect (Knockout Text):**
  - Wrapper: `mix-blend-screen`.
  - Background Video: `absolute inset-0 object-cover` (URL: `assets/video/loop-1.mp4`).
  - Text Overlay: `bg-black mix-blend-multiply text-white`. The text is "LET'S TALK." (`text-[12vw] font-black`).
  - Result: The video only plays *inside* the text letters. Hovering the text changes its color to `text-brand-orange` with a smooth 500ms transition.
- **Bottom Links:** Fully responsive row (`flex-col md:flex-row`, `gap-4`).

---

## 4. Technical Requirements & Implementation Details
- **Framer Motion Integration:** All scroll animations must use `useScroll` tied to a specific `target` reference (`containerRef`) and mapping via `useTransform`.
- **CSS Blend Modes:** Accurate usage of `mix-blend-overlay`, `mix-blend-screen`, and `mix-blend-multiply` is critical to the visual identity (specifically in the Hero and Footer).
- **Video Optimization:** All background `<video>` elements must include `autoPlay loop muted playsInline` to function properly on mobile devices.
- **Performance:** Use `will-change-transform` on heavily animated elements (like the scaling circles). Ensure pointer events are disabled (`pointer-events-none`) on overlay textures and videos to prevent blocking interactions.
- **Accessibility & SEO:** 
  - Ensure contrast ratios are sufficient in text overlays.
  - Implement semantic HTML (`<nav>`, `<section>`, `<footer>`, `<h1>`).
  - Ensure interactive elements are keyboard accessible (though hover effects drive the accordion, fallback clicks should be considered if necessary).

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/skills/offset-studio/.
