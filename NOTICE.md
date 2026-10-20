# NOTICE

## Skill texts and bundled code

MIT License. See [LICENSE](LICENSE).

## skills/unslop-ui/references/shaders/

Derived from the `shaders` project, MIT License. Copyright (c) 2026 Shader Effects Inc. See `skills/unslop-ui/references/shaders/LICENSE-shaders.txt`.

## skills/shadowplay/

Style notes adapted from the Lemo-Opuscar style library by LemoLab (https://github.com/lemomo-ai/lemo-opuscar), MIT License, Copyright (c) 2026 LemoLab. The full notice is in the Credits section at the end of `skills/shadowplay/SKILL.md`.

## Third-party resources fetched at build time

The Skills instruct the AI to fetch the following resources when building a project. These resources are **not redistributed** in this repository and remain under their own licenses:

- **Google Fonts** (SIL Open Font License): Inter, Playfair Display, Source Serif, Noto Sans TC, Noto Serif TC, Archivo, Caveat, Patrick Hand, IBM Plex Mono. Loaded via `https://fonts.googleapis.com`.
- **pptxgenjs** (MIT): PowerPoint export library. Loaded via jsDelivr CDN (`https://cdn.jsdelivr.net/npm/pptxgenjs@4/dist/pptxgen.bundle.js`). Used by pitchfold and fieldnote.
- **Three.js** (MIT): 3D library. Self-hosted in `lib/` by the generated project. Used by worldview-saas and cathode-desk. Earth textures loaded from the three.js repository on GitHub (`https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/`).
- **GSAP** (free license, formerly GreenSock): Animation library. Used by worldview-saas (ScrollTrigger) and inkframe (timeline, SplitText). Installed via npm (`gsap`).
- **shaders** npm package (MIT, free tier; Pro presets require a subscription): WebGPU shader components. Loaded via jsDelivr CDN (`https://cdn.jsdelivr.net/npm/shaders@4.0.2/dist/js/bundle.js`). Used by unslop-ui.
- **playwright-core** (Apache-2.0): Browser automation. Installed via npm. Used by unslop-ui scripts for screenshots and recording.
- **puppeteer-core**: Browser automation. Installed via npm. Used by inkframe for frame-by-frame rendering.
- **FFmpeg**: Video encoding. System dependency. Used by inkframe, shadowplay and unslop-ui.
- **Noto Serif TC, Cormorant Garamond** (SIL Open Font License): downloaded from the Google Fonts repository on GitHub by shadowplay.
- **playwright-core** or **puppeteer-core**, and **numpy, scipy, soundfile** (BSD-3-Clause): frame capture and audio synthesis in shadowplay. Installed via npm and pip.

## offset-studio media

The offset-studio Skill references 5 looping videos (`assets/video/loop-1.mp4` to `loop-5.mp4`) and 5 project images (`assets/images/work-1.webp` to `work-5.webp`). These are **not included** in this repository. They are from a commercial-license template and available to Sketchry account holders at https://sketchry.app/skills/offset-studio/.

## Demo content

All brands, figures, client names and projects used in demos and Skill examples are fictional.
