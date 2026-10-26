# Sketchry Free Skills

Free Claude Code / Codex / Cursor Skills that build finished websites, pitch decks and motion videos, by [Sketchry](https://sketchry.app).

## Skills

| Skill | What it builds | Demo / Page | Type |
|---|---|---|---|
| **pitchfold** | Dark editorial seed pitch deck (HTML, PDF, PPTX) | [Live demo](https://sketchry.app/demos/pitchfold/) | Deck |
| **fieldnote** | Field-research notebook deck (HTML, PDF, PPTX) | [Live demo](https://sketchry.app/demos/fieldnote/) | Deck |
| **worldview-saas** | AI SaaS landing page with 3D Earth | [Live demo](https://sketchry.app/demos/worldview-saas/) | Website |
| **cathode-desk** | 3D retro-computer portfolio | [Live demo](https://sketchry.app/demos/cathode-desk/) | Website |
| **smallcaps** | Minimal interaction-craft portfolio | [Live demo](https://sketchry.app/demos/smallcaps/) | Website |
| **unslop-ui** | AI-slop score + redesigned app screens | [Skill page](https://sketchry.app/skills/unslop-ui/) | App design |
| **vitrelle** | Glass dashboard wallpaper filled with your own day | [Skill page](https://sketchry.app/skills/vitrelle/) | App design |
| **inkframe** | Chinese motion video (MP4) from code | [Skill page](https://sketchry.app/skills/inkframe/) | Video |
| **shadowplay** | Shadow-puppet theatre motion video (MP4) from code | [Skill page](https://sketchry.app/skills/shadowplay/) | Video |
| **offset-studio** | Design studio portfolio | [Skill page](https://sketchry.app/skills/offset-studio/) | Website |

## Install

### npx skills

```bash
npx skills add austin17022/sketchry-free-skills
# or a single skill:
npx skills add austin17022/sketchry-free-skills --skill pitchfold
```

### Claude Code plugin

```
/plugin marketplace add austin17022/sketchry-free-skills
/plugin install sketchry-free-skills@sketchry
```

### Manual

```bash
git clone https://github.com/austin17022/sketchry-free-skills.git
cp -r sketchry-free-skills/skills/pitchfold ~/.claude/skills/
# or into a project: cp -r sketchry-free-skills/skills/pitchfold .claude/skills/
```

Codex and Cursor users can paste the contents of any `SKILL.md` into their tool's skill or prompt configuration.

## Usage

Open your AI tool in an empty folder and ask, for example:

- "Use the pitchfold skill to build a seed deck for Acme Robotics"
- "Use the worldview-saas skill to build a landing page for DataNova AI"
- "Use the unslop-ui skill to redesign this fitness app screen"

The brands, figures and projects in demos are fictional. Replace them with your own.

## Want more?

[Sketchry](https://sketchry.app/skills/) has the full library of website, deck, video and app-design Skills.

## License

MIT (see [LICENSE](LICENSE)). Refer to [NOTICE.md](NOTICE.md) for third-party attribution. The offset-studio media files (videos and images) are not included in this repo; they are available to Sketchry account holders at the skill page.

---

## 繁體中文

Sketchry 免費 Skills：9 個可以直接用在 Claude Code、Codex 或 Cursor 的 Skill，一句話就能做出完整的網站、簡報或動態影片。

安裝方式：

```bash
npx skills add austin17022/sketchry-free-skills
```

或手動複製到 `~/.claude/skills/`：

```bash
cp -r skills/pitchfold ~/.claude/skills/
```

用法：在空資料夾裡打開 AI 工具，說「用 pitchfold skill 幫我做一份募資簡報」就好了。

更多 Skill 請看 [Sketchry](https://sketchry.app/skills/)。
