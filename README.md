# 📦 MD to Figma

**Paste the template-generated DESIGN.md — and get Variables, Styles, and bindings all at once!!**

Figma plugin that reads a structured Markdown file and generates your entire token system automatically.
4 separate Variable collections, Styles bound to those Variables, and natural numeric sorting — from a single paste.

[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-blue?logo=figma)](https://www.figma.com/community/plugin/YOUR_PLUGIN_ID)
![Version](https://img.shields.io/badge/version-1.5.0-brightgreen)

![cover](./resources/cover_v2.png)

---

## 💡 Why MD to Figma

If you're using Claude or any AI with Figma MCP to build a design system, you've probably noticed how many tokens it takes to register Variables and Styles directly through MCP.

Once your AI has produced a DESIGN.md, MD to Figma handles the entire Figma registration for free — no extra API calls, no token cost.

```
AI + Figma MCP  →  DESIGN.md  →  MD to Figma  →  Figma Variables & Styles
                                  (free, instant)
```

---

## 💡 MD to Figma를 쓰는 이유

Claude 등 AI를 Figma MCP와 연결해 디자인 시스템을 구축하다 보면, Variables와 Styles를 MCP를 통해 직접 등록할 때 토큰 소모가 상당하다는 걸 느끼게 됩니다.

AI가 DESIGN.md를 만들어냈다면, 그 이후 Figma 등록은 MD to Figma로 무료로 처리하세요. 추가 API 호출도, 토큰 낭비도 없습니다.

```
AI + Figma MCP  →  DESIGN.md  →  MD to Figma  →  Figma Variables & Styles
                                  (무료, 즉시)
```

---

## ✨ What Gets Generated

### Variables — 4 Collections

| Collection | Contents |
|---|---|
| **Colors** | Primitive palette + Semantic aliases (Light & Dark mode). Semantic tokens are strictly alias-bound. |
| **Spacing** | Primitive scale + Semantic aliases |
| **Radius** | Primitive scale + Semantic aliases |
| **Typography** | fontSize / lineHeight / letterSpacing, grouped by section (Display, Body, Caption, etc.) |

### Styles — all bound to Variables

| Style | Binding |
|---|---|
| Color Styles | → Semantic Color Variables |
| Text Styles | → Typography Variables (fontSize / lineHeight / letterSpacing) |
| Effect Styles | → Spacing Variables (drop shadow blur) |
| Grid Styles | → Spacing Variables (gutter / margin) |

### Other Features

- **Selective Generation** — Checkbox per collection and style type. Update only what you need.
- **Partial Sync** — Already have Variables? Generate Styles only and auto-link to existing ones.
- **Natural Numeric Sorting** — `space-4`, `space-8`, `space-16` sorted by value, not alphabetically.
- **Font Fallback** — Auto fallback chain: requested style → Regular → Inter → Inter Regular.
- **Live Execution Log** — Real-time log panel with copy support.

---

## 📸 Screenshots

| UI | Result |
|---|---|
| ![UI](./resources/Frame2.png) | ![Complete](./resources/Frame3.png) |
| Initial screen — paste DESIGN.md and select options | Generation complete with variable & style counts |

| Log Modal | Figma Output |
|---|---|
| ![Log](./resources/Frame4.png) | ![Output](./resources/Frame5.png) |
| Execution log — copy and paste directly into AI for debugging | Variables & Styles registered in Figma |

---

## 🚀 How It Works

1. **Collect** your design system data — from a Figma file, brand guidelines, website, or any source
2. **Download** the DESIGN.md template from the plugin (or from [`resources/`](./resources/))
3. **Hand both to any AI** (Claude, ChatGPT, etc.) — the AI uses the template as a pattern reference to organize your data, infer missing values, and output a complete, structured DESIGN.md
4. **Paste** the AI-generated DESIGN.md into the plugin
5. **Select** which Variables and Styles to generate
6. **Click Generate** — done

---

## 📖 Resources

| File | Description |
|---|---|
| [DESIGN-TEMPLATE.md](./resources/DESIGN-TEMPLATE.md) | Token template with formatting rules and examples |
| [AI-PROMPT-GUIDE.md](./resources/AI-PROMPT-GUIDE.md) | Ready-to-use prompts for filling the template with AI |
| [TEMPLATED-SAMPLE.md](./resources/TEMPLATED-SAMPLE.md) | Sample DESIGN.md generated from the template (Airbnb-inspired) |

> Raw links for in-plugin download:
> - `https://raw.githubusercontent.com/YOUR_USERNAME/md-to-figma/main/resources/DESIGN-TEMPLATE.md`
> - `https://raw.githubusercontent.com/YOUR_USERNAME/md-to-figma/main/resources/AI-PROMPT-GUIDE.md`

---

## 🗂 Repository Structure

```
md-to-figma/
├── code.js                      # Plugin main logic
├── ui.html                      # Plugin UI
├── manifest.example.json        # Manifest template (rename and fill in your plugin ID)
├── .gitignore                   # manifest.json excluded
├── README.md
└── resources/
    ├── DESIGN-TEMPLATE.md       # DESIGN.md template
    ├── AI-PROMPT-GUIDE.md       # AI prompt guide
    ├── TEMPLATED-SAMPLE.md      # Sample output generated from the template
    ├── cover_v2.png             # Plugin cover image
    ├── Icon_v2.png              # Plugin icon
    ├── Frame2.png               # Screenshot: initial UI
    ├── Frame3.png               # Screenshot: generation complete
    ├── Frame4.png               # Screenshot: log modal
    └── Frame5.png               # Screenshot: Figma output
```

> `manifest.json` is excluded from version control to protect the plugin ID.

---

## 🛠 Development

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/md-to-figma.git
```

2. Copy and configure the manifest
```bash
cp manifest.example.json manifest.json
```
Then replace `YOUR_PLUGIN_ID` in `manifest.json` with your actual Figma plugin ID.

3. Open Figma Desktop → Plugins → Development → Import plugin from manifest
4. Select `manifest.json`

### Publishing

1. Edit `code.js` or `ui.html`
2. Test in Figma Desktop
3. Plugins & Widgets → MD to Figma → ··· → **Publish new version**
4. Write release notes and submit

> `manifest.json`의 `"api"` 필드는 Figma API 버전이므로 수정하지 않습니다.
> 플러그인 버전은 `code.js` 상단 주석으로 관리합니다.

---

## 📋 Changelog

### v1.5.0 (2025-05-01)
- 4 separate Variable collections: Color / Spacing / Radius / Typography
- Semantic color alias enforcement (HEX direct input blocked)
- Partial Sync: Styles-only generation with auto Variable linking
- Natural numeric sorting for all collections
- Font fallback chain (requested → Regular → Inter → Inter Regular)
- Live execution log with copy support
- Selective generation via checkboxes
- Built-in template and AI prompt guide download

---

## 📄 License

MIT