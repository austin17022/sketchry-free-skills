---
name: vellary-reading-room
version: 1.0.0
description: A walnut bookcase in real-time 3D. Drag along the shelf, hook a book out by its top, turn it round to see the cover, then open it and watch the pages turn to a printed note about the book.
---

# VELLARY: a 3D bookcase site for a reading list, a library or a collection

Build a complete website from an empty project. The brand is VELLARY, a fictional reading room used as sample content. Replace the name, the copy and the book list with the owner's own before anything goes live.

## Before you start

1. This Skill needs no asset pack and no image, video or 3D model files. The bookcase, every spine, every cover, the bookplate and the paper are drawn in code at runtime.
2. Three.js is required. Download `three.module.min.js` and `three.core.min.js` (r170 or later) into the project's `lib/` folder and self-host them. Do not load Three.js from a CDN, and do not use any Three.js addons: the environment map and the shelf light below are built by hand.
3. To make it the owner's own, ask for: the site name, one line of positioning, and for every book its title, author, year, shelf (category), a cloth colour if they care, a two to three sentence note and three short takeaways. Until the list is complete, list what is missing and keep the sample data. Never invent quotes, ratings, reviews, awards or reading dates.
4. Covers: by default draw typographic covers in code, as specified below. Real cover artwork belongs to the publishers. Use cover images only if the owner says they have the rights, load them lazily from `covers/NN.jpg`, and keep the drawn cover as the fallback when a file is missing.

## Requirements

These rules override any sample data or launch promise in the full spec below. Every visual, layout and interaction in the spec must still be built.

- Plain HTML, CSS and JavaScript (ES modules) with Three.js. Write the motion yourself with `requestAnimationFrame` and eased tweens; no React, no Tailwind, no GSAP, Lenis or any other animation library. Google Fonts or system fonts only.
- No payments, email, analytics, accounts or external APIs. Do not invent addresses, phone numbers, social accounts or testimonials.
- Deliver the whole experience: header with shelf tabs, the infinite shelf, pulling a book out, the caption, opening the book, the printed page, previous / next / close, putting the book back, and the fine print. Not a hero screen only.
- Respect `prefers-reduced-motion`: every tween collapses to a near-instant step and the idle float stops. When WebGL cannot start, show the full book list as plain HTML instead of an error.
- Keyboard: arrow keys browse the shelf and step between books, Enter takes out the book nearest the centre or opens the one in hand, Escape closes or puts back. All buttons are real `<button>` elements with visible focus.
- Check the layout at 360, 390, 768, 1024 and 1440 px. On phones the header stacks, so the camera must lower the shelf until the top board clears the header and the fine print. No horizontal overflow, no text sitting on top of the books.
- Test for real before handover: drag and wheel on the shelf, every tab, pull out, open, previous / next while open, close, put back, resize while a book is open, reduced motion, a browser with WebGL disabled, and the console. Record an actual walkthrough and take the poster frame from that recording; never a hand-made animation.

## What makes this site

Only two things carry it. Get them right and everything else can be plain.

- **The books are objects, not cards.** Each book is a front board on a hinge, a back board, a block of pages with ruled edges and a rounded spine. Taking one out is three moves: a finger hooks the top so the book tips forward on its bottom edge, it slides out of the row, then it lifts towards you along a curve and turns so the cover faces you, overshooting a touch and settling. Putting it back plays the same path in reverse and the cover closes on the way.
- **Opening it is physical.** The cover swings through 180 degrees, then six thin leaves curl over one after another, each bending along its width instead of rotating flat. The last leaf shows a printed title page; the right-hand page carries the HTML note, positioned every frame so it sits exactly on the 3D paper and blends into it.
- The room is a built-in walnut bookcase: a fluted back panel, two walnut boards with a brass inlay, a warm light strip under the upper board, cabinet doors below. When you drag, the wood grain scrolls with the books, so the shelf feels endless instead of the books sliding over a still picture.
- Spines are the whole first impression. Every spine is a canvas with the title running top to bottom, the author at the foot, gilt rules or a coloured label at the head, and a shelf number. Thickness and height vary per book.

## Handover

Deliver `index.html`, `style.css`, `app.js`, `books.js`, the `lib/` folder and a verification report. The report lists what was actually checked, what was fixed, and anything left unfinished.

---

## Full design spec

# Website Build Specification

**Role:** Act as a senior front-end engineer who also does real-time 3D. Build a one-page site for a fictional reading room called VELLARY: a walnut bookcase holding a shelf of public-domain classics. Everything is drawn at runtime. Units below are centimetres; the shelf floor is y = 0 and the spines face +z.

## 1. Files

- `index.html`: canvas, header (eyebrow, h1, tab list), caption section, page overlay, bottom nav, fine print, loader, no-WebGL fallback list, `<noscript>` line and one `<script type="module" src="app.js">`. No inline scripts and no import map, so the page works under a `script-src 'self'` policy; `app.js` imports `./lib/three.module.min.js` directly.
- `style.css`: tokens, overlays, responsive rules.
- `books.js`: `export const BOOKS = [{ t, a, s, y, c, r, d, e, b, k }]` with title, author, spine name (uppercase surname), year, shelf, cover width / height ratio (0.62 to 0.68), thickness in cm (0.9 to 4.6), cloth colour, a note of about 40 words and three takeaways of under 40 characters.
- `app.js`: renderer, room, books, poses, tweens, input, overlays, loop.

## 2. Look

- Tokens: `--bg #13100e`, `--ink #f2ece1`, `--muted #b0a696`, `--gold #d6a75e`, `--paper-ink #29231c`, `--paper-muted #74695b`.
- Type: a high-contrast display serif (Fraunces 600) for titles and covers, a book serif (EB Garamond) for body, an italic serif (Cormorant Garamond italic) for authors, IBM Plex Mono for every eyebrow, number and label (11 px, letter-spacing .24em to .28em, uppercase).
- A fixed radial vignette over the canvas. No film grain that moves.
- Header: gold mono eyebrow, h1 "The Classics Shelf" with "public domain" in muted italic beside it (never wrapping inside itself), shelf tabs on the right as text with a superscript count and a 1 px underline that grows from the left on the selected tab. No pill buttons.
- Fine print bottom left, mono 10.5 px at 50% ink: says the site is fictional, every title is public domain and every cover is drawn in code. It fades out whenever a book is in hand.

## 3. Renderer and light

- `WebGLRenderer` antialias, pixel ratio capped at 2, `SRGBColorSpace`, `NeutralToneMapping`, exposure 1.05, `PCFSoftShadowMap`. Background `#13100e`. Camera FOV 28.
- Environment: build a tiny room scene (a back-faced box of `#2b2119` and four bright `MeshBasicMaterial` panels with colours multiplied above 1: a warm softbox overhead, a warm window left, a cool panel right, a soft panel in front), run it through `PMREMGenerator.fromScene(scene, 0.04)`, set `scene.environmentIntensity = 0.32`.
- Lights: `HemisphereLight(#fff0da, #2a1f17, 0.5)`; key `DirectionalLight(#ffe0b8, 2.7)` from (-30, 48, 52) with a 2048 shadow map covering x -75..75; fill `DirectionalLight(#d5e3ff, 0.55)` from (45, 18, 70).
- Shelf light: an emissive strip (0.12 x 0.8 cm, `#ffe4bc`) under the upper board and three `SpotLight(#ffcf94, 7, 0, 1.2 rad, penumbra 1, decay 0)` along it aimed down and slightly back, plus an additive gradient card on the back panel just below the strip.

## 4. The bookcase

All parts live in one `shelf` group so the whole case can recede when a book is taken out.

- Back panel at z = -11, 420 wide, 150 tall, centred at y = 35: a canvas of dark walnut streaks with 20 rounded flutes per 44 cm tile (dark edge, faint warm highlight, dark edge), a matching bump map, darkened above the upper board and below the shelf floor.
- Boards: shelf floor 2.6 thick from z = -36.5 to 7.5; upper board 2.2 thick at y = 26.3 from z = -11 to 7.5. Walnut grain canvas (2048 x 256), roughness .46 on the top face, .42 on the front edge, and a brass inlay (`metalness 1`, roughness .28) 0.16 tall along each front edge.
- Cabinet doors below the floor: walnut, a dark gap every 45 cm, a slim brass pull near the top of each door.
- Every wood texture is registered with its horizontal repeat; each frame set `offset.x = scroll / 420 * repeat` so the grain travels with the books.

## 5. Books

- Height 19.6 to 22.4 (hashed per index), width = height x ratio, depth = thickness.
- Parts: back board and front board (0.22 thick) with the front board on a pivot at the spine edge; page block (width - 0.4, height - 0.6) with ruled fore-edge and top textures; a half cylinder spine (radius depth / 2, scaled 0.42 in x); six leaves, each a `PlaneGeometry` with 28 segments across, hidden until the book opens.
- Materials: covers `MeshPhysicalMaterial` (roughness .5, clearcoat .35) with a paper-grain bump; endpapers a muted version of the cloth colour; text ink dark on cloths with luminance above .5, light otherwise; accent gold on dark cloths, oxblood on light ones.
- Spine canvas: 1024 px tall, width from the arc length. Three variants by index: gilt double rules near head and foot; a coloured label at the head with the shelf number in it; single faint rules. Title in the display serif, rotated 90 degrees so it reads top to bottom, font size min(depth x .4, 1.35 cm) shrunk to fit; spine name in mono at the foot; number at the very bottom.
- Cover canvas (768 wide), drawn on first pull and kept for the last 12 books: a faint linen cross-hatch and noise, then one of six layouts by index: double-ruled frame with a diamond ornament; a cream title band between two accent rules; a large accent disc with fine rings and the title below; three vertical accent stripes with the title set left; a dot grid with a pasted label; an arched window with the title below. Each carries the author and a small spaced "VELLARY" mark. Titles wrap and shrink to fit their box.
- Inside the front board: a bookplate on the endpaper (EX LIBRIS, the reading room name in large italic, a short line, "No.07 / 34"). The last leaf's back is a printed title page (title, author, rule, year, the reading room name at the foot), mirrored because it is seen from behind.

## 6. The infinite shelf

- Filtered list laid out left to right with 0.16 cm gaps; repeat the cycle until it covers 1.35 x the visible width + 30, cloning book meshes per repeat.
- `wrapX(base) = ((base - scroll + LOOP/2) mod LOOP) - LOOP/2`. Books outside the view are hidden.
- `scroll` eases toward `scrollT` with `1 - 0.86^(dt*60)`. Drag moves `scrollT` by pixels x world-per-pixel; release adds 14 x the last delta as a fling. Wheel uses whichever axis moved more.
- Hover (mouse only): the book tips forward 0.075 rad on its bottom edge and comes out 0.6.
- On load the shelf slides in from -0.9 x the visible width over 2.8 s with a quartic ease-out.
- Tab change: visible books drop 27 cm out of view left to right (0.5 s, stagger 12 ms), the new set rises in (0.9 s, stagger 25 ms).

## 7. Camera and poses

- Desktop: distance `21.5 / tan(14 deg)`, look at 0.38 x the view height, camera raised by 5.5% of the distance.
- Phone or portrait (width < 760 or aspect < 0.8): distance from the larger of 24 cm of visible width and 50 cm of visible height; then, measuring the header bottom and the fine-print top, push the distance out if the bay (top board + 4 cm) would not fit between them and lift the look-at point so the top board sits just under the header.
- Present pose: desktop, book height at 64% of the view, 30% right of centre, caption on the left. Phone, centred between the header line and the caption, width at most 64% of the view.
- Open pose: desktop, both pages centred, height at 84%; phone, only the right-hand page, filling 92% of the width.

## 8. Motion

Write a single tween clock: `tween(duration, fn, {delay, key})` returns a promise, `fn` receives linear progress and applies its own easing, a keyed tween replaces any running tween with the same key. Easings needed: cubic out / in / in-out, quartic out / in-out, back out (1.7). Multiply every duration by a speed factor that is 0.02 under reduced motion.

- Pull out (about 2.1 s): tip forward 0.2 rad over 0.34 s; slide out by 0.86 x width while easing the tilt back over 0.62 s; then 1.1 s along a quadratic curve (control point between, raised 3.5 and forward 3) to the present pose, rotating through a slight extra turn and finishing with back-out. Meanwhile the shelf group recedes in z and drops 2.5, and a near-black veil parented to the camera fades to 84%.
- Present: the book floats (0.12 cm sine) and leans toward the pointer. Clicking it or "Open the book" opens it; clicking elsewhere, dragging sideways or wheeling puts it back.
- Open (about 3 s): over 1.25 s move to the open pose while the front board swings to -180 degrees; then leaf j turns from 0 to 180 degrees with a 0.17 s stagger and 0.9 s each. A leaf bends as a chain of 28 segments whose angle is `phi - 1.05 sin(phi) * s^1.7` along its width, and lifts toward the left stack as it lands.
- Close: leaves return with a short stagger, the board closes, back to the present pose. Previous / next while open: the current book returns to its slot while the neighbour comes out and opens.
- The page overlay is an HTML article sized every frame to the projected corners of the right-hand page, `container-type: size`, all type in `cqw`, `mix-blend-mode: multiply` so it prints onto the paper. Content: number, shelf and year in mono; on phones also title and author; "About this book" in the display serif, a short rule, the note justified, "THREE TAKEAWAYS" and three numbered rows (i, ii, iii in italic oxblood), page number at the foot. Children fade in from a 6 px blur with a staggered delay.
- Bottom nav while open: a blurred pill with "Previous", "Close the book", "Next".

## 9. Accessibility and fallbacks

- The canvas has `tabindex="0"` and an aria-label that explains drag, arrows and Enter. The caption and page are `aria-live="polite"`.
- If the renderer throws, or boot fails, hide the canvas and header and show the plain list: eyebrow, title, a sentence saying the browser cannot draw the bookcase, every book as title plus author and year, and the fine print.
- Pause nothing important on hidden tabs, but never let a tween depend on frame count: progress comes from `performance.now()`.
