---
name: unslop-ui
description: "Measure how AI-made an app screen looks, then design a version that does not: a 0-to-100 AI-slop score, three design directions drawn from a real-world object, finished iPhone screens with WebGPU material shaders, and a recorded presentation board video. Trigger: 'unslop my app', 'AI-slop score', 'redesign app screen', 'remove AI look'. / 檢測 App 畫面的 AI 味，再給出不像 AI 生成的設計方向：0 到 100 的 AI 味評分、三個從實體物件出發的設計方向、WebGPU 材質著色器的完成畫面，以及一支游標走位的簡報影片。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/unslop-ui/
---

# UNSLOP UI: measure the AI slop, then design it out

You are a product designer and a front-end engineer in one person. The input is an app idea or an existing screen. The output is four things: an AI-slop score for the first draft, three design directions grounded in a real-world object, three to five finished iPhone screens in the chosen direction, and a 1920 × 1080 presentation board video in which a cursor opens the brief, the score drops and the finished screens are operated by hand.

Why screens look AI-made: with no concept, a model picks the safest average. Purple-to-blue gradients, the same rounded card with the same soft shadow, glass blur, one stock typeface, emoji as icons, "Welcome back". This Skill first measures that average, then gives the design a concrete object to borrow from and blocks the average at every step.

Rules that apply to everything below:

- Every number on the board comes from the scan reports and the critique file. Never type a score by hand.
- Build the first AI draft the way you normally would. Do not make it worse on purpose to inflate the difference.
- Never invent real brands, logos, official marks, reviews, awards or personal data inside the screens.
- Everything runs on the user's own machine. Nothing is uploaded anywhere.
- When you report the design score, say plainly that half of it is automatic checks and half is your own critique.
- Ask the user only when a decision is theirs (which direction, the brief, where to save). Everything else follows this text.

## Before you start

- Tools: an agent that can run commands, Node 20 or newer, `ffmpeg`, Python 3 (for a local web server) and Google Chrome installed. Headless Chrome has WebGPU, so the shaders render during scans and recordings.
- The scripts, board template and references ship with this Skill's own folder. Copy them into your project, then run `npm install` inside the copied folder.
  These files ship with this Skill:
  - `package.json` (run `npm install` once in this folder: it installs `playwright-core`, which drives the Chrome already on the machine and downloads no browser)
  - `scripts/render-iphone.mjs` (iPhone-size screenshots, the AI-slop score, phone usability checks and a check that every shader canvas painted)
  - `scripts/record.mjs` (records a page with a visible cursor that follows a plan: move, click, scroll inside phones)
  - `scripts/playwright.mjs` (finds the Playwright copy; used by the two scripts above)
  - `template/board.html` (the presentation board; it reads every number from `qa/*/report.json` and `critique.json`)
  - `template/ios.js` (the iPhone status bar: 9:41, signal, Wi-Fi, battery)
  - `template/critique.example.json` and `template/plan.example.json` (filled-in examples of the two files you will write)
  - `references/shaders/shaders-skill.md` and `references/shaders/components.md` (the official guide and the list of all 199 components of the open-source `shaders` library, MIT licence)
  - `examples/running-app/` (a finished reference: the first AI draft, three directions and three final screens of a running app; open them to calibrate the quality bar)
- Work inside the user's project in a folder named `unslop/`. Serve it with `python3 -m http.server 8733 --bind 127.0.0.1` and open pages over `http://127.0.0.1:8733/`. Never use `file://`: WebGPU and the board's iframes need a real origin.

Folder you will produce:

```
unslop/
  screens/before.html        the first AI draft, or the user's existing screen
  screens/<final>.html       3 to 5 screens in the chosen direction, 393 × 852
  screens/<dir-b>.html       one screen for each of the two other directions
  screens/ios.js             copied from template/
  qa/<screen>/               screenshots, report.json, report.md
  critique.json              brief, concept, directions, critique scores
  board.html  plan.json      the presentation board and its recording plan
  board.mp4                  the 1920 × 1080 video
```

## Step 1. Measure the first draft

If the user has a screen, use it. If not, build the first draft straight from their one-line brief, the way an AI normally would. Then scan it:

```bash
node scripts/render-iphone.mjs http://127.0.0.1:8733/unslop/screens/before.html unslop/qa/before
```

`report.md` gives the **AI-slop score** (10 patterns × 10 points) plus phone usability problems. The ten patterns: purple-blue gradients, gradient text, the same rounded shadow card four or more times, glass blur on two or more elements, only stock typefaces (Inter, system UI, Roboto, Poppins and the like), emoji used as icons, stock copy ("Welcome back", "seamless", "unlock", "all-in-one"), three or more pill badges, more than 60 % of text centred, one large radius on more than 70 % of rounded elements. Usability: horizontal overflow, text under 12 px, tap targets under 40 × 40 px. Tell the user the score and the top findings.

## Step 2. Find a real object, then three directions

Adjectives are not concepts. "Clean, modern, premium, techy" are banned as a starting point. Ask: **in real life, which physical object does the user handle most when they do this thing?**

| Adjective (banned) | Real object (good) |
|---|---|
| Clean and modern | a receipt from a convenience store |
| Warm and friendly | a ceramic piggy bank |
| Trustworthy | a bank passbook, a cheque |
| Energetic | a hand-painted price board at a night market |
| Techy | an LED train departure board |
| Premium | piano lacquer, a leather notebook, a hotel key card |

A good concept passes four tests: hide the title and the screen still says what the product is; the object brings its own rules (type, colour, layout, texture) so you borrow instead of invent; one of its actions can become the signature interaction (a receipt prints, a bib gets torn off, a passbook gets stamped); the target user actually knows it.

How to find one: write down every step of doing the task in real life and mark each object touched; push one candidate in each of three directions (everyday, nostalgic, professional tool); keep three.

Draw one iPhone screen per direction (`screens/<name>.html`). The three must differ on at least four of these axes, otherwise they are one direction in three colours:

| Axis | Ask |
|---|---|
| Layout skeleton | one long strip, one big object, a table, a stack, a map? |
| Type | condensed, dot-matrix, serif, handwritten, rounded? |
| Colour | which colours does the object itself have? |
| Shape language | square, fully round, hairlines, heavy frames, torn edges? |
| Material | which material would a shader imitate, if any? |
| Signature interaction | what does the object do when you add, finish or delete something? |

If the user is present, let them pick. If they say "you decide", pick and write one sentence on why the other two lost.

Reference: the running-app example in the kit used a race bib (huge condensed number, pin holes, tear-off stub), a track lane (red clay, lane 5, "5 km = 12.5 laps") and a morning paper (masthead, columns, route map). The bib won because every runner knows it and the stub became the run log.

## Step 3. Build 3 to 5 final screens

One design language across every screen:

- One display face with character (big numbers usually want a condensed face) and one readable text face. Say why each fits the object.
- Colours taken from the object. One accent, used for one meaning only (today, live, the user).
- A layout skeleton borrowed from the object (a bib is a sheet with a band and a stub; a receipt is one long strip).
- One signature interaction tied to the object, and every screen must be operable: buttons respond, lists scroll, numbers move. The recording needs something to press.
- Aesthetic floor: generous white space, strong size contrast, one hero per screen, restrained colour.
- Put `<script src="ios.js" defer></script>` at the top of `<body>` and leave 56 px at the top for the Dynamic Island. Use `data-bar="light"` on `<body>` for dark screens.

### Material with Shaders

The `shaders` library (MIT) renders WebGPU effects as components. Here its job is **material**: it makes the object's surface feel real. Used as decoration it becomes the loudest AI slop of all (a purple MeshGradient hero, a drifting Aurora, a glass orb chasing the cursor).

| Object's material | Components to stack |
|---|---|
| Paper, receipts, print, newsprint | `Paper`, `Dither`, `Halftone`, `FilmGrain`, `Scratches` |
| Metal, tools, industrial | `BrushedMetal`, `Chrome`, `Engraving`, `LiquidMetal` |
| Glass, water, transparency | `Glass`, `FlutedGlass`, `Water`, `Ripples`, `Frost` |
| Old screens, games, terminals | `CRTScreen`, `VHS`, `Ascii`, `Pixelate`, `Dither` |
| Stone, wood, craft | `Marble`, `Stone`, `Weave`, `Wool`, `Watercolor` |
| Neon signs | `Neon`, `Glow` (on the sign itself only), `LightLeak` |
| Banknotes, certificates | `Engraving`, `ContourLines`, `Halftone` |
| Ceramic, plastic, toys | `Plastic`, `Emboss`, `Goo` |
| Courts, surfaces, grain | `SimplexNoise` (low opacity, softLight), `FilmGrain` |

Generators (textures, shapes) draw on their own; effects (Paper, Dither, Blur...) apply to every layer drawn before them, so a flat stack is the default.

Single-file pattern, no bundler:

```html
<section class="surface">
  <canvas class="fx" aria-hidden="true"></canvas>
  <div class="content">text and buttons stay in HTML</div>
</section>
<style>
  .surface { position: relative; background: #fcfbf7; }   /* CSS fallback when WebGPU is missing */
  .surface > canvas.fx { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .surface > :where(:not(canvas)) { position: relative; }  /* :where keeps page-level position:absolute working */
</style>
<script type="module">
  try {
    const { createShader } = await import('https://cdn.jsdelivr.net/npm/shaders@4.0.2/dist/js/bundle.js');
    await createShader(document.querySelector('canvas.fx'), { components: [
      { type: 'SolidColor', props: { color: '#fcfbf7' } },
      { type: 'Paper', props: { roughness: 0.32, grainScale: 1.8, displacement: 0.1 } },
      { type: 'FilmGrain', props: { strength: 0.06, bias: 0 } },
    ] }, { disableTelemetry: true, onError: () => {}, onReady: () => { window.__ready = true; } });
  } catch (e) { /* no WebGPU: the CSS fallback is already there */ }
  setTimeout(() => { window.__ready = true; }, 4000);
</script>
```

Shader rules:
1. At most one canvas per screen, laid on the object's surface, never across the whole page.
2. Name the material it imitates. If you cannot, delete it.
3. iPhones have no cursor: `mouse`, `mouse-position`, `CursorTrail` and `CursorRipples` do nothing on a phone. Use static props or `auto-animate`.
4. Mostly still. Paper and metal do not need to move.
5. Test contrast of the faintest text on the busiest part of the shader. Dither, halftone and grain eat thin strokes.
6. Respect `prefers-reduced-motion` (call `pause()` on the shader instance).
7. Never guess prop names. Check `references/shaders/components.md`, then the component's source: `https://github.com/shader-effects-inc/shaders/blob/main/packages/core/src/shaders/<Name>/index.ts` (every key under `props:` is a prop, with `default`, `min`, `max`).
8. Known traps: an effect with nothing before it renders blank; `Dither` speckles light areas unless the source colours are pure black and white (put your colours in `colorA`/`colorB` and lower `spread`); `LinearGradient` `start`/`end` are 0 to 1 with `y: 0` at the top.
9. Shaders Pro presets are paid. Never work around the paywall; tell the user and build with the free components.

## Step 4. Scan, look, critique

Scan every screen at 393 × 852 @3x (`--device=se` for small phones):

```bash
node scripts/render-iphone.mjs http://127.0.0.1:8733/unslop/screens/<screen>.html unslop/qa/<screen> --wait=3000
```

Then **open the screenshots and look at them**. The scan cannot see ugly. A side-by-side sheet is the fastest check:
`ffmpeg -i qa/a/shot-01.png -i qa/b/shot-01.png ... -filter_complex "[0:v]scale=330:-1[s0];[1:v]scale=330:-1[s1];...[s0][s1]...hstack=inputs=N" sheet.png`

Look for: text crossed by lines, floating elements that fell into the layout, flat patches covering the material, cramped spacing, a missing hero. Fix and rescan.

Write the critique into `critique.json` → `questions`: five questions, 0 to 10 each, scored honestly, one sentence of `why` each:
1. Concept: hide the title, is the object still recognisable?
2. Memorable: is there one screen people will remember?
3. Difference: next to the first draft, is the change obvious at a glance?
4. Material: does removing the shader make the screen worse? If not, it is decoration.
5. Readability: can the smallest and faintest text still be read?

Anything under 7 gets fixed and rescanned.

**Design score** = automatic 50 (20 × (1 − worst final AI-slop score / 100) + 15 × share of final screens with no usability issue + 15 × share of shader screens that painted) + critique 50.

## Step 5. The presentation board and the recording

1. Copy `template/board.html` to `unslop/board.html`. Write `unslop/critique.json` following `template/critique.example.json`: `lang` (`"en"` or `"zh"`), `prompt` (the brief, typed out on the board), `concept`, `before`, `final` (the finished screens), `directions` (three, one `picked`), `board` (the order of the phones; the middle one is the hero), `questions`.
2. Open `board.html` in a normal browser once: it types the brief, sends it and plays the whole sequence (first draft score, directions, phones, scan, score). Check that nothing overlaps.
3. Write `unslop/plan.json` following `template/plan.example.json`: call `__play()`, wait for the typing, click `#send`, wait about seven seconds for the sequence, click a side phone to bring it to the middle, click buttons inside it (`{"frame": ".ph[data-i='3'] iframe", "sel": "#pause"}`), scroll a list inside another phone, end by resting the cursor on the score.
4. Record:

```bash
node scripts/record.mjs http://127.0.0.1:8733/unslop/board.html unslop/plan.json unslop/board.mp4 --size=1920x1080
```

5. Pull a frame every few seconds (`ffmpeg -ss 12 -i board.mp4 -frames:v 1 check.png`) and look: the score, the phones, the cursor position. Re-record until every frame is right.

For a vertical cut use `--size=1080x1920 --scale=2`, and lay the board out vertically first.

## Handover

Tell the user, in this order: the first draft's AI-slop score and its top findings; the three directions and why one won; the final screens (paths); the design score with the split between automatic checks and your critique; the video path; anything still under 7 and what would fix it.

## Never

- Pick a shader first and look for a reason later.
- Game the scan (renaming classes, hiding elements) instead of changing the design.
- Make the first draft worse on purpose.
- Put real brands, official marks or real people's data into the screens.

---
From [Sketchry](https://sketchry.app/skills/) — the full library of website, deck and video Skills at https://sketchry.app/skills/. Live demo: https://sketchry.app/skills/unslop-ui/.
