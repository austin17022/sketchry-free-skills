---
name: shadowplay
description: "Chinese shadow theatre in motion, drawn entirely in code: carved dyed-hide puppets glowing on a lamplit cotton screen, hand tremor, visible rods and operatic freezes, with an original gong, drum and fiddle score synthesised in Python. Renders an MP4, a poster and a contact sheet. Trigger: 'shadow puppet video', 'shadow play animation', '皮影戲影片'. / 用程式逐格畫出中國皮影戲質感的動態影片：雕刻染色的皮偶透過暖色棉布幕發光，配上程式合成的鑼鼓與胡琴，輸出 MP4、封面圖與抽格總覽。"
license: MIT
metadata:
  author: Sketchry
  version: "1.0.0"
  homepage: https://sketchry.app/skills/shadowplay/
---

# SHADOWPLAY | Shadow puppetry

Act as director, motion designer and front-end engineer. The input is a message or topic from the user (a product, an idea, a process, a small story). The output is a 10 to 60 second MP4 with an original score and foley, a poster, a contact sheet and a storyboard. Pictures are drawn in code in a web page, captured frame by frame in headless Chrome and encoded with FFmpeg; sound is synthesised in Python.

- Every frame is a pure function of time t (`render(t)`); seeded randomness only; no `Date.now()`, no CSS animations, no `requestAnimationFrame` loops. Anything that depends on the past (wheel angles, swinging parts) is pre-simulated at a fixed rate at load.
- Copy, facts and numbers come from the user; never invent figures, quotes, awards, clients or prices. A film that states facts keeps a `FACTS.md` with a source per claim.
- Only three kinds of material: the user's files, graphics drawn in code, OFL fonts. No real brands, logos, screenshots, existing characters or copied shots.
- Ask only what is the user's to decide (topic facts, names or logos that must appear, length and aspect ratio, language, their own audio). Decide the rest.

## Before you start

- Tools: Node 20+, FFmpeg, Python 3.11+, Chrome or Chromium.
- In the project folder: `npm init -y && npm i playwright-core` (or `puppeteer-core`); `python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile`.
- Fonts (SIL OFL) in `fonts/`:
  - Noto Serif TC 900 for title letters and the main caption line, 700 for the second line: `curl -L -o fonts/NotoSerifTC.ttf "https://github.com/google/fonts/raw/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf"` (17 MB). For a small file, request `https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700;900&text=<URL-encoded characters>` with a desktop browser User-Agent and download the woff2 files it lists.
  - Cormorant Garamond 600/700 for Latin titles and captions: `curl -L -o fonts/CormorantGaramond.ttf "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"`.
- Project tree:

```
film/  brief.md TREATMENT.md FACTS.md storyboard.md
       index.html main.js carve.js gl.js timeline.js
       score.py mix.py render.mjs build.sh  fonts/ stills/ out/
```

- Preview with `python3 -m http.server 8765`; `file://` blocks modules and fonts.

## Style rules

**What it is.** A white cotton screen with flat puppets of translucent dyed hide behind it, lit by oil lamps. Colour arrives by transmitted light: dyes glow like stained glass, carved holes are the brightest value, overlapping pieces go darker. It is live theatre: light flickers, puppets tremble in the hand, rods show as soft dark lines. Not a black silhouette film, not paper cut (light passes through, not around), not flat vector cut-out.

**Palette.** 3 to 5 saturated dyes plus raw hide and ink. One set per film:

| Set | Dyes | Hide and ink |
|---|---|---|
| Court | vermilion #B8211A, ochre #DC9D1E, malachite #236E3A | #E2BD80, #1A100A |
| River | indigo #22647E, jade #2F8A5C, ochre #DC9D1E | #CF9F5E, #1A100A |
| Harvest | flame #D9541C, gold #C98A26, green #236E3A | #E2BD80, #1A100A |

Lamp colour `(1, .77, .46)`. Nothing is brighter than the lamp; every hue leans warm. Night means fewer lamps, never added blue. Thin things that must read (rods, arrow shafts, small text) are dark.

**Materials and line.** Each piece gets a tileable hide texture (mottling, fibres, specks). Carving is density: cut most of the area away and leave thin strips. Cut vocabulary: crescent rows, diamond lattice, coin holes, cloud scrolls, tapered slits, bead rows, meander bands. A dark outline of 1.5 to 2.4 px on every region. Joints are round lobes with a rivet. The cloth has a fine weave, fibre speckle, slow blotches and darker edges.

**Scenery.** Mostly empty lit cloth: one lace piece per element, a narrow carved ground strip, a few clouds. Fire, smoke, water and gas are carved pieces swapped at 12 fps, never particles.

**Type.** Titles are puppets: a dark hide plaque with letters cut through so they glow, carved border, two rods. Captions sit on a storyteller placard: narrow dark lacquer, thin gold inner line, small red seal (#B3261B) on the left that can hold a step number. Main line Noto Serif TC 900 at 60 to 70 px, second line 700 at 40 to 44 px, Latin in Cormorant Garamond 600 at 44 to 50 px. Cream #F5E6C6 on dark, in a bottom band, action above it.

**Composition and motion.** Puppets in profile; at key moments the subject fills at least a third of the frame height. 24 fps for puppets and camera, 12 fps only for swapped effect pieces. Hand tremor on every puppet (3 to 4 px, about 0.02 rad, low frequency noise), 1.5 to 2 times stronger under tension. Operatic phrasing: run, hop, freeze pose on an accent for about a second, turn. Nothing morphs: pieces rotate on rivets, slide on rods or are swapped. The cloth and stage frame never move.

**Camera grammar.** Audience seat (whole stage, blurred heads below) says "this is a show"; follow a puppet; crash zoom of 5 frames on a hit; whip pan from cause to effect; locked wide to count steps; close on a carved detail; pull back into the dark room to end. Clamp the camera to the cloth when zoomed in. Transitions are made of the medium: lamps dipping, a piece lifting off, a flash to warm white. No generic crossfades.

## Sound palette

Synthesise in numpy at 48 kHz:

- Clapper drum: damped sines near 1.1, 2.3 and 3.4 kHz plus a 2 ms noise click.
- Barrel drum: sine falling 120 to 70 Hz over 0.15 s plus low noise, with 2nd and 3rd harmonics for small speakers.
- Cymbals: band-passed noise 3 to 12 kHz with inharmonic partials.
- Small gong: partials near 600 to 900 Hz rising about 1.8 semitones in 0.12 s. Big gong: partials 90 to 400 Hz falling 3 semitones over 0.45 s, once per decisive hit.
- Nasal fiddle: band-limited saw, formant band-passes at 950 to 1450 and 2300 to 3300 Hz, soft saturation, slides and late vibrato. Pentatonic D E F# A B for brightness; raised 4th, slightly flat, for tension. Plucked lute by Karplus-Strong.
- Patterns: accelerating clapper roll into an entrance, one hit per visual step, heartbeat drum under suspense, hard stops of 25 ms with tails cut too.

Foley follows materials: wooden clapper on a table, rod taps, leather flaps on lift-off, soft thwacks on press-on, hide creaks, cloth whooshes on whip pans, lamp fwoomp on a flare and a hiss on a snuff, quiet room tone with wick crackle. Every visible action gets a sound on its frame.

At least one true silence before the turn, at most one sound inside it. Keep music about 4 dB under foley at key actions; voice only if the user supplies or licenses it. Master at −14 LUFS, true peak −1.5 dB or below.

## Step 1. Clarify the brief

Write `brief.md`: the message in one sentence, audience, what the viewer knows at the end, length, aspect ratio, language, exact on-screen lines, the user's logos or audio. Put each fact with its source in `FACTS.md`. Ask once, then decide.

## Step 2. Treatment and storyboard

In `TREATMENT.md` write three candidate structures (one show then a freeze and breakdown; a procession where each figure adds a dye; backstage first, then the front), pick one and say why. Then a logline, one native move at the peak (a piece lifting off, light as the world, holes as an x-ray), a shot list (framing, move, length, reason), a beat sheet per second, a cue map on a tempo grid and a sound table per section. Copy the shot list into `storyboard.md` with a still per shot after Step 5.

## Step 3. Build the stage

`index.html` holds one full-size canvas. `main.js` exposes:

```js
window.DUR = 20.0;
window.render = t => { /* draws frame t */ };
window.READY = true;            // after fonts load and pieces are built
window.EV = [{t, type}];        // sound events
window.TEXTS = t => [{id, text, x0, y0, x1, y1}];  // texts on screen at t
```

Build pieces once at load, after `document.fonts.load`. Draw the world through one camera matrix `[z,0,0,z, W/2 − cx·z, H/2 − cy·z]` and lay out from `innerWidth × innerHeight`.

## Step 4. Timeline and score

`timeline.js` holds the tempo (for example 96 BPM), section starts, every hit and every caption. The page, `score.py`, `mix.py` and the SRT export all read it, so one edit moves picture and sound together. The capture script dumps `window.EV` to `events.json`; `score.py` writes `out/score.wav`; `mix.py` adds foley and writes `out/mix.wav`.

## Recipes

1. **Transmission canvas.** Fill a 2D canvas white each frame and draw every piece with `multiply`. Holes stay white and glow, overlaps darken by themselves.
2. **Lamp compositor.** A WebGL2 pass computes `1 − exp(−L × T × cloth × expo)`. L sums lamps, each a broad Gaussian (sigma a quarter of the cloth width) plus a hotspot 6 times narrower, flickering ±6 % at 7 Hz. Exposure ∝ 1/√(lamps lit), then warm bloom, saturation 1.1 and a brown vignette. Keep the brightest cloth near 0.9 so dark lines stay dark.
3. **Carved piece sprite.** Each piece is an offscreen canvas: fill the dye, cut holes with `destination-out`, stroke ink outlines as open paths, multiply the hide texture, restore alpha with `destination-in`.
4. **Flat-puppet roll.** Scale local y by cos(roll) about the centre, keep |cos| at least 0.2 so the side flips in one frame, and blur as it turns edge-on. Starting upside down, 1.5 turns land it upright.
5. **Panel lift-off cutaway.** Make an outer panel its own piece. Lift it toward the lamp over 0.8 s (scale to 2.1×, rise, blur to 34 px, alpha `1 − u³`) while the inner piece fades in. Press it back in 0.35 s.
6. **Press on, lift off.** Arrivals scale 2.6 → 1 and blur 34 → 0 px in about 0.5 s; exits grow ×1.9, blur and fade in 0.5 to 0.9 s. Moves a puppet across the stage without a cut.
7. **Clapper freeze.** On a clapper hit, stop motion, halve the tremor, dim every lamp but the one behind the subject, hard-stop the music and crash-push in 5 frames with a small overshoot. The storyteller takes over.
8. **Arrows on rods.** Carved arrow pieces ride with the puppet: one dye for what goes out, another for the result. Each presses on with its own drum hit.
9. **Pressed-on trail.** Small dark hide dots with a hole, pressed on one by one behind a moving puppet, show the true length of a path.
10. **Lit title plaque.** Over busy scenery, draw the title in a front layer after the cloth: a warm radial gradient behind the cut letters, the plaque on top. It glows like lamplight and stays readable.

## Pacing

- Hook in 3 s: motion from frame one, the title plaque pressed on within the first second.
- Vary the rhythm: fast stunt, frozen breakdown, driving middle, held breath, full ending.
- At least one true silence.
- Hold each caption at least Chinese characters ÷ 4.5 + 1.5 s, or English letters ÷ 15 + 1.5 s, never under 1.8 s. Swap step captions instantly on a rod tap.
- End on a held frame of at least 1.5 s.

## Step 5. Still checks

- `render.mjs` loads the page at output size, waits for `READY`, calls `render(t)` and screenshots. It also samples `TEXTS(t)` every 0.04 s: each text stays inside the frame and unchanged for its hold time.
- Contact sheet: one frame per second, tiled 5 across (`ffmpeg -vf "fps=1,scale=384:-1,tile=5x4"` or Pillow).
- 0.2 s strips on key actions: the roll, landings, lift-offs, the freeze.
- Compare with the Style rules: holes glow, overlaps darken, outlines everywhere, warm corners, dark thin lines readable, subject large at key moments, captions clear of it, no empty transition frames.

## Step 6. Render and export

1. Launch Chrome with playwright-core or puppeteer-core, headless, `--use-angle=metal` on macOS or `--use-gl=angle` elsewhere so WebGL2 runs, viewport at output size, device scale 1.
2. For frame i call `render(i / 24)`, screenshot as JPEG quality 92 and pipe to `ffmpeg -y -f image2pipe -framerate 24 -i - -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart out/video.mp4`. Several browsers can each render a slice.
3. Sizes: 1920×1080, 1080×1920, 1080×1080, 1920×1200. Lay out for each; do not crop.
4. Pre-limit the mix (compress drums, limit at −2.5 dBFS). Two-pass loudnorm: measure with `loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, apply with the measured values and `linear=true`, mux with `-c:a aac -b:a 192k -shortest`. Verify with `ebur128=peak=true`.
5. Poster: `ffmpeg -ss <t> -i out/<name>.mp4 -frames:v 1 -q:v 2 poster.jpg` on the strongest frame.

## Checklist

- `ffprobe`: H.264, yuv420p, 24 fps, right size, duration equals DUR.
- Loudness −14 LUFS ±0.5, true peak at or below −1.5 dB.
- `blackdetect` finds no blank frames.
- Every caption passes the hold rule in `TEXTS` and stays off the subject.
- Every on-screen fact is in `FACTS.md` with a source.
- No real brand, badge or logo unless the user owns it.
- The same t rendered twice gives identical screenshots.
- Every row of the sound table is audible; the silence is silent.
- Holes glow and overlaps darken in every scene.
- The browser console shows no errors.

## Handover

Deliver `<name>.mp4`, `poster.jpg`, `contact.jpg`, `<name>.srt`, `TREATMENT.md`, `storyboard.md`, `CREDITS` (fonts with OFL notices, user audio) and the source with a one-command `build.sh`. Tell the user the file locations, measured length and loudness, recipes used, what was checked and what was not, and any line or fact to confirm. Remind them they are responsible for material they add.

## Credits

Style notes adapted from the Lemo-Opuscar style library by LemoLab (https://github.com/lemomo-ai/lemo-opuscar), used under the MIT License:

Copyright (c) 2026 LemoLab. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
