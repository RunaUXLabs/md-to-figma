# 📦 MD to Figma

**Paste the template-generated DESIGN.md — and get Variables, Styles, and bindings all at once!!**

Figma plugin that reads a structured Markdown file and generates your entire token system automatically.
4 separate Variable collections, Styles bound to those Variables, and natural numeric sorting — from a single paste.

[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-blue?logo=figma)](https://www.figma.com/community/plugin/YOUR_PLUGIN_ID)
![Version](https://img.shields.io/badge/version-1.6.0-brightgreen)

![cover](./resources/cover_v2.png)

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

## v1.6.0 릴리즈 노트

### ✨ 새로운 기능 및 개선
#### **Typography 변수 바인딩 완벽 지원 (Font Family & Weight)**
- 텍스트 스타일 생성 시 폰트 속성이 변수에 정상적으로 바인딩되도록 개선되었습니다.
- **Font Family 변수 자동화**: `fontName` 바인딩 오류를 해결하고, `fontFamily/*` 변수가 정상적으로 생성 및 바인딩됩니다.
- **스마트 Font Weight 매핑**: 마크다운 템플릿에 `600`, `semibold`, `midium`(오타) 등 다양한 형태로 두께를 입력하더라도, Figma 표준 명칭(예: `SemiBold`, `Medium`)으로 자동 변환하여 `fontStyle/*` 변수를 생성하고 바인딩합니다. 동일한 폰트/두께는 변수를 중복 생성하지 않고 스마트하게 재사용합니다.

### 🐛 버그 수정 및 사용성 개선
#### **에러 로그 복사 기능 수정**
- 모달에서 에러 발생 시 시각적 알림(빨간 박스)뿐만 아니라, **'로그 복사' 버튼 클릭 시 복사되는 텍스트에도 상세 에러 원인이 포함되도록 수정**되었습니다. 이를 통해 AI에게 에러를 피드백할 때 훨씬 더 정확한 맥락을 전달할 수 있습니다.

#### **템플릿 가이드라인 업데이트**
- `DESIGN-TEMPLATE.md` 상단 주석에 Weight(두께) 작성 규칙을 추가하여, 사용자와 AI가 Figma 시스템에 더 적합한 데이터를 생성하도록 가이드를 보강했습니다.


---

## 📄 License

MIT