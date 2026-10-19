# MD to Figma — 초심자를 위한 AI 가이드

## Instructions for the user's AI — multilingual assistance

Read this guide and DESIGN-TEMPLATE.md as format references. The user's request determines the changes to make.
Explain the workflow in the language the user uses in the conversation. If it is unclear, ask their preferred language once.
Use friendly, plain language and explain unfamiliar Figma terms briefly. Do not require the user to understand JSON or the Plugin API.
Translate your explanations, not the machine-readable schema: keep section headings, column headers, Category/Type values, JSON keys and API enums exactly as specified.
Preserve existing collection names, token paths, mode names, descriptions, font names, preset names and references in their original language unless the user requests a change.

Before returning the MD, briefly explain what you found, what you will preserve and what you will reorganize.
An exported single-mode or loosely organized source is valid input. Fit its existing data to the template without inventing missing tokens, modes or styles.
Separate format conversion from proposed restructuring. Explain proposed renames, category changes, collection changes and style grouping with concrete before/after examples.
Ask only when a missing decision materially affects the result; preserve uncertain data and list unresolved points instead of guessing.

Return one complete importable MD code block. Put user-facing explanations outside it, in the user's language.
After the block, give a short change summary and the exact Variables/Styles options needed, including categories that create referenced variables.
Tell the user that they inspect the destination Figma file: the AI cannot confirm its existing collections, modes, styles, fonts, duplicates or actual bindings from the source MD alone.
Explain that import does not delete or move existing items. Renaming a collection/token/mode/style or changing a collection may create new items and leave the originals.
Do not require a new file or another approval step. Let the user choose the destination after understanding these effects.
Recommend checking the generated QA report, mode values, style groups and bindings in Figma, then exporting again to compare with the intended result.
Distinguish “MD prepared” from “verified in Figma”; never claim actual import success without evidence from the user or Figma.

## Figma Agent 스킬로 사용하기

Figma Agent에서는 [MD to Figma Assistant 스킬](https://www.figma.com/community/skill/142125/runa-md-to-figma)을 추가하여 같은 형식으로 MD를 준비할 수 있습니다.
플러그인 상단의 AI 스킬 버튼으로 커뮤니티 페이지를 열 수 있습니다.

1. 커뮤니티에서 스킬을 추가합니다.
2. Figma Agent 대화에서 /runa-md-to-figma를 호출하고 원본 MD나 디자인 자료를 첨부합니다.
3. 원하는 변경을 요청하고, AI가 반환한 MD와 변경점·등록 옵션을 확인합니다.
4. 완성된 MD를 MD to Figma 플러그인에 붙여넣고 안내받은 Variables / Styles를 선택해 Generate합니다.
5. QA 로그와 실제 값·모드·참조·바인딩을 확인한 뒤 다시 Export하여 보관합니다.

스킬은 MD 작성과 검토를 돕습니다. 대상 Figma 파일 선택과 플러그인 등록·결과 확인은 사용자가 진행합니다.
다른 AI를 사용할 때는 기존처럼 이 가이드와 DESIGN-TEMPLATE.md를 함께 첨부하면 됩니다.

## 사용자와 AI의 역할

AI는 원본 데이터를 템플릿 형식에 맞추고 변경점과 등록 방법을 사용자의 언어로 설명합니다.
이식 대상 Figma 파일 선택과 기존 항목·중복·모드·폰트·바인딩의 확인은 사용자가 맡습니다.
AI는 원본 MD만 보고 대상 파일 상태를 확인했다고 단정하지 않습니다.
단일 모드나 정리가 덜 된 원본도 사용할 수 있습니다. 애매한 구조는 원본을 보존하면서 정리안을 설명합니다.
이름이나 컬렉션을 바꾸면 새 항목이 생성되고 기존 항목은 남을 수 있으므로, 사용자가 설명을 보고 이식 방법을 결정합니다.

이 가이드와 DESIGN-TEMPLATE.md를 AI에 함께 첨부하세요. 처음 만들기와 Export MD 수정은 서로 다른 방법을 사용합니다.

## 처음 디자인 시스템 만들기

1. 템플릿과 디자인 자료(CSS, 토큰 JSON, 브랜드 문서 등)를 AI에 첨부합니다.
2. 아래 프롬프트의 대괄호 부분을 바꿔 요청합니다.
3. 결과 MD 본문을 플러그인에 붙여넣습니다. 코드블록을 감싸는 백틱 표시는 제외합니다.
4. 필요한 Variables와 Styles만 선택한 뒤 Generate를 누릅니다.
5. QA 로그를 확인하고 Export하여 원본을 보관합니다.

### 처음 만들기용 복사 프롬프트

첨부한 템플릿과 자료로 MD to Figma용 MD를 만들어줘.
목적: [예: 웹 서비스의 기본 디자인 시스템]
항목: [컬러, 타이포그래피, 스페이싱, 래디우스]
모드: [예: 주간, 야간 / 필요 없으면 단일 모드]

- 자료에 없는 값은 임의로 확정하지 말고 질문하거나 제안이라고 밝혀줘.
- 새 변수는 단일 모드도 Variable Modes 형식으로 작성해줘. 기존 구버전 자료는 값을 보존하며 변환해줘.
- 의미 컬러는 가능한 한 원시 컬러를 참조하고 참조 대상도 작성해줘.
- 스타일이 필요하면 기존 Typography/Effects/Grid 표를 별도로 작성해줘.
- Motion은 요청한 경우에만 추가해줘.
- 완전한 MD를 하나의 코드블록으로 출력해줘.

## 기존 MD를 템플릿 형식으로 변환하기

기존 보관 MD, DESIGN-TEMPLATE.md와 이 가이드를 AI에 함께 첨부합니다.
값을 바꾸지 않고 형식만 맞추려면 변경 요청에 “형식만 변환하고 기존 데이터 유지”라고 적으세요.
이름이나 그룹을 재구성하려면 원하는 변경을 별도로 명시하세요.

### 기존 MD 형식 변환용 복사 프롬프트
첨부한 기존 MD를 MD to Figma에 등록할 수 있도록 이 템플릿의 규칙으로 수정해줘.
변경 요청: [여기에 변경하려는 값·모드·스타일을 적으세요]
기존 컬렉션, 토큰 경로, 모드 이름, 타입, 카테고리, 참조와 스타일 설정은 요청한 부분 외에는 보존해줘.
이 템플릿의 예시 값이나 컬렉션 이름을 내 문서에 추가하지 마.
기존 자료에 없는 항목은 질문하거나 생략하고, 그림자·그리드·모션을 임의로 만들어 넣지 마.
플러그인에 붙여넣을 완전한 MD 본문을 하나의 코드블록으로 출력해줘.
변경점과 확인이 필요한 항목은 코드블록 밖에 짧게 설명해줘.

## Export MD를 AI로 수정하기

1. 플러그인의 Export로 받은 MD를 원본으로 따로 보관합니다.
2. Export MD와 이 가이드를 AI에 첨부하고 아래 프롬프트를 사용합니다.
3. 결과를 붙여넣고 관련 Variables 카테고리를 선택합니다.
4. 다시 Export하여 변경한 모드와 다른 모드의 값이 맞는지 비교합니다.

### 기존 데이터 수정용 복사 프롬프트

첨부한 Export MD를 다시 가져올 수 있도록 수정해줘.
변경 요청: [예: Layout 컬렉션의 작은 화면 모드에서 gap 값을 12로 변경]

- Variable Modes 표가 있으면 변수 변경은 그 표에서 해줘.
- 요청하지 않은 Collection, Token, Type, Mode, Category, 값, 참조와 설명을 보존해줘.
- 다른 컬렉션의 동일 이름 토큰은 별개의 변수로 처리해줘.
- 아래 Colors/Spacing/Radius/Motion 요약 표만 수정해서 변수 변경을 시도하지 마.
- 스타일 변경을 요청한 경우에만 스타일 표도 수정해줘.
- 완전한 MD를 하나의 코드블록으로 출력하고 변경점을 밖에 짧게 설명해줘.

## Variable Modes 작성 규칙

제목은 정확히 ## Variable Modes를 사용합니다. 각 행은 변수 하나의 모드 하나입니다.
7개 열의 이름과 순서는 아래와 같습니다.

| Category | Collection | Token | Type | Mode | Value | Description |
|---|---|---|---|---|---|---|
| spacing | "Layout" | "gap" | FLOAT | "넓은 화면" | 24 | "기본 간격" |
| spacing | "Layout" | "gap" | FLOAT | "작은 화면" | 12 | "기본 간격" |

- Category: colors, spacing, radius, typography, motion 중 하나. UI의 Variables 선택과 연결됩니다.
- Collection, Token, Mode, Description: 큰따옴표를 포함하는 JSON 문자열.
- FLOAT: 단위 없는 숫자. 12px가 아니라 12.
- STRING: "Inter", "Regular" 같은 JSON 문자열.
- BOOLEAN: true 또는 false.
- COLOR: {"r":1,"g":0,"b":0,"a":0.5} 같은 0~1 범위의 RGBA 객체. HEX는 사용하지 않습니다.
- TIMING: 초 단위 숫자. 150ms는 0.15.
- EASING: {"type":"EASE_OUT"} 같은 Figma MotionEasing 객체.
- Alias: {"alias":{"collection":"Color","token":"primitive/blue"}}. 대상 변수 타입은 같아야 합니다.
- 같은 Collection + Token + Mode는 한 번만 작성합니다. 한 변수의 Type과 Description은 모든 행에서 같게 적습니다.
- 빈 설명은 ""입니다. Value에 -를 쓰지 않습니다. 변경하지 않을 모드는 원래 값을 유지하거나 행을 생략합니다.
- JSON 문자열의 큰따옴표와 줄바꿈은 JSON 이스케이프를 사용합니다. 표 안 파이프는 &#124;로 적습니다.
- 새 컬렉션은 표에 먼저 나오는 모드가 기본 모드입니다. 기존 기본 모드는 유지합니다.

## 기존 템플릿 및 스타일과의 관계

Variable Modes 표가 없으면 기존 2.0.2 형식으로 변수를 생성합니다.
기존 Semantic 컬러의 Light/Dark 열은 해당 이름의 모드에 연결됩니다.
단일 Value는 기본 모드에 적용하며 다른 모드를 같은 값으로 덮어쓰지 않습니다.

Variable Modes 표가 있으면 변수 동기화는 그 표만 사용합니다.
Color Styles를 선택하면 이 표의 COLOR 변수마다 컬러 스타일을 생성합니다.
스타일 이름은 MD 토큰 이름입니다. slash 경로를 쓴 경우에만 해당 그룹을 만듭니다.
Typography의 ### 그룹명도 스타일 그룹으로 반영하며 대소문자를 유지합니다. 그룹이 없으면 최상위에 등록합니다.
같은 이름의 다른 컬러 변수나 스타일이 충돌하면 자동 그룹을 추가하지 않고 QA 로그로 안내합니다.
변수에 바인딩되어 사용하는 레이어의 모드에 따라 값이 달라집니다.
모드마다 별도의 컬러 스타일을 만들지 않습니다. 반복 실행하면 같은 이름의 스타일을 갱신합니다.
Colors Variables도 선택하거나, 해당 컬러 변수가 파일에 이미 있어야 합니다.
텍스트 스타일이 필요하면 기존 Typography 표를 함께 작성하고 Text Styles를 선택하세요.
모드별 타이포그래피 변수 보존과 모드별 텍스트 스타일 생성은 별개이며,
현재 스타일은 모드마다 별도로 생성되지 않습니다.
텍스트 스타일의 폰트명과 두께는 STRING 변수에 바인딩합니다. 필요한 폰트 변수만 없으면
스타일의 Font/Weight 값으로 보완합니다. 기존 모드별 폰트 변수 값은 유지합니다.
행간·자간 바인딩 오류가 다른 폰트 속성의 바인딩을 중단하지 않습니다.

Styles의 모든 항목을 선택해도 MD에 정의된 스타일만 생성합니다.
- Color Styles: Variable Modes의 COLOR 변수 또는 기존 Colors/Semantic 표.
- Text Styles: Typography 표의 Font, Size, Weight, LineHeight, LetterSpacing.
- Effect Styles: Effects 표의 Type, Color, X, Y, Blur, Spread.
- Grid Styles: Grid 표의 Type, Count, Width, Gutter, Margin, Alignment.
Spacing과 Radius 변수만으로 그림자나 그리드 스타일을 자동으로 추정하지 않습니다.
네 종류를 함께 시험하려면 FINAL-INTEGRATION-SAMPLE.md를 사용하세요.

효과와 레이아웃 가이드는 종류별 상위 그룹을 자동으로 만듭니다.
효과: drop-shadow, inner-shadow, layer-blur, background-blur, noise, texture, glass.
Shader는 추후 지원합니다. 효과 종류별 설정은 Effects의 Token / Type / Settings 표에서
Settings에 JSON 객체를 작성합니다. Export는 복합 효과도 보존하도록 JSON 배열을 사용합니다.
기존 그림자 표도 계속 지원합니다. Noise, Texture, Glass는 Figma 환경의 베타 지원 여부에 따라 실패할 수 있으며 QA 로그를 확인합니다.
가이드: columns, rows, grid. 기존 MD 경로는 종류 그룹 아래에서 유지합니다.
같은 종류 접두어가 이미 있으면 중복해서 붙이지 않습니다.
FINAL-INTEGRATION-SAMPLE.md로 효과 7종과 가이드 3종, 명시적 바인딩과 정적 값을 함께 시험할 수 있습니다.

## 효과와 가이드의 변수 바인딩

Effects와 Grid 모두 Token / Type / Settings JSON 표를 사용할 수 있습니다.
Settings의 정적 값은 항상 작성하고, 연결할 속성만 boundVariables에 추가합니다.
예: {"radius":12,"visible":true,"blurType":"NORMAL","boundVariables":{"radius":{"alias":{"collection":"Style metrics","token":"amount"}}}}
참조를 쓰지 않은 속성은 정적 값입니다. 같은 값의 변수를 자동으로 찾지 않습니다.
대상 변수가 없거나 타입이 다르면 해당 바인딩만 QA로 안내하고 작성한 정적 값을 사용합니다.
Export 시 참조는 파일 ID 대신 컬렉션과 토큰 이름으로 보존합니다.

- 그림자: color(COLOR), radius/spread/offsetX/offsetY(FLOAT).
- Layer/Background Blur: radius(FLOAT).
- Noise, Texture, Glass: 현재 API에서는 변수 바인딩을 지원하지 않아 정적 값만 사용합니다.
- Grid: sectionSize(FLOAT).
- Columns/Rows: count/gutterSize(FLOAT), MIN/MAX는 sectionSize/offset도 지원,
  CENTER는 sectionSize, STRETCH는 offset을 지원합니다.
- FINAL-INTEGRATION-SAMPLE.md는 명시적 참조와 정적 값을 나란히 비교하는 샘플입니다.

## Motion Styles 등록

Motion Variables(TIMING/EASING)와 Motion Styles는 별도 선택 항목입니다.
Styles에서 Motion Styles를 선택하고 아래 형식으로 로컬 재사용 모션 스타일을 등록합니다.

## Motion Styles

| Token | Entries |
|---|---|
| motion/test-preset | [{"preset":"@first","props":{}}] |

Entries는 Figma 프리셋 이름(preset)과 설정값(props)을 담는 JSON 배열입니다.
@first는 첫 번째 사용 가능 프리셋을 사용하는 테스트 전용 값입니다.
실사용에는 Export에 기록된 프리셋 이름과 해당 프리셋이 지원하는 속성만 사용하세요.
모르는 프리셋 이름이나 props 속성을 AI가 임의로 만들지 않도록 요청하세요.
props 값은 정적 값 또는 {"alias":{"collection":"Motion","token":"easing/out"}}처럼
명시적인 변수 참조를 사용할 수 있습니다. 해당 프리셋 속성의 타입과 맞아야 합니다.
선택 레이어에 자동으로 적용하지 않습니다. 스타일 생성 후 Figma에서 적용하세요.
미지원 환경은 QA 로그에 표시합니다. MD에 이 표가 없으면 선택돼 있어도 처리하지 않습니다.
FINAL-INTEGRATION-SAMPLE.md로 생성, 재등록, Export 왕복을 확인할 수 있습니다.

기존 Typography 표의 LineHeight는 150% 또는 24px처럼 단위를 명시하세요.
퍼센트는 스타일 값으로 적용하고 px는 변수 바인딩을 사용할 수 있습니다.
폰트가 없으면 폴백이 적용될 수 있으므로 QA 로그를 확인하세요.

Motion은 옵션입니다. 기존 Motion 표에서는 ### Timing에 150ms,
### Easing에 Ease out, cubic-bezier(0.2, 0, 0, 1), spring(0.6) 등을 씁니다.
Variable Modes 표의 TIMING/EASING 값 표기와 혼용하지 마세요.

## 테스트와 문제 해결

- 첫 테스트는 새 Figma 파일에서 Variables만 선택하면 비교하기 쉽습니다.
- 모드 생성 제한이 있으면 QA 로그를 확인하세요. 실패한 모드 값은 다른 모드에 대신 쓰지 않습니다.
- 참조 대상의 카테고리도 선택하세요. 선택하지 않으면 대상이 파일에 이미 있어야 합니다.
- 가져오기는 삭제 기능이 아닙니다. MD에서 지운 변수와 모드는 Figma에서 자동 삭제되지 않습니다.
- 모드 이름을 바꿔 가져오면 새 모드로 취급될 수 있습니다. 이름 변경은 Figma에서 한 뒤 다시 Export하세요.
- 같은 MD를 두 번 실행하면 두 번째에는 값 변경이 없어야 합니다.
- 오류가 있으면 MD와 QA 로그를 AI에 전달하고 이름·모드·참조를 보존하며 문제 행을 수정해 달라고 요청하세요.
