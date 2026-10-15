# Design System

<!--
MD to Figma 입력 템플릿 — 아래 데이터는 형식을 보여주는 예시입니다.

[AI conversion rules]
Convert the user's data to this schema and follow their requested changes.
Do not copy example data or invent missing items. Preserve existing names, modes, types, categories, values and references unless asked to change them.
Keep schema headings, column headers, JSON keys and enums unchanged.
Return one complete importable MD block; explain changes and unresolved points outside it in the user's language.
Detailed prompts and workflow: AI-PROMPT-GUIDE.md.
-->

이 파일은 데이터 형식과 필드 설명을 담은 참고 템플릿입니다. 필요한 섹션만 사용하세요.
기존 자료와 함께 AI에 전달할 수 있으며, 상세 요청 예시는 AI-PROMPT-GUIDE.md를 참고하세요.


## Variable Modes

<!--
[변수 형식 선택]
1. Variable Modes 표가 있으면 그 표만 변수 생성·수정의 기준으로 사용한다.
   아래 Colors/Spacing/Radius/Motion 요약 표를 수정해도 변수 변경에 사용되지 않는다.
2. 사용자 지정 모드와 모든 변수 타입은 Variable Modes로 작성하는 것을 권장한다.
3. 구버전 표도 지원한다. 기존 Colors의 Primitive(Value)/Semantic(Light, Dark),
   Spacing·Radius의 Primitive(Value)/Semantic(Alias), Typography 표 형식을 유지할 수 있다.
   자유로운 모드가 필요하면 Variable Modes로 변환하고 모든 모드별 값을 명시한다.
4. Variable Modes를 선택했다면 Typography 표는 텍스트 스타일 정의로만 사용한다.
   이 표에만 있는 폰트 크기·행간·자간은 자동으로 모드별 변수로 생성되지 않는다.
5. 필요하지 않은 섹션과 행은 제거해도 된다. 모든 카테고리를 채울 필요가 없다.
   선택돼 있어도 정의가 없는 항목은 처리하지 않는다.

[Variable Modes의 7개 열]
열 이름과 순서: Category, Collection, Token, Type, Mode, Value, Description.
Category: colors / spacing / radius / typography / motion. 선택 체크박스와 연결된다.
Collection, Token, Mode, Description: JSON 문자열. 큰따옴표를 반드시 포함한다.
Type과 Value:
- COLOR: 0~1 범위 RGBA 객체. 예: {"r":1,"g":1,"b":1,"a":1}. HEX 문자열을 쓰지 않는다.
- FLOAT: 단위 없는 숫자. 16px가 아니라 16.
- STRING: "Inter", "Regular" 같은 JSON 문자열.
- BOOLEAN: true 또는 false.
- TIMING: 초 단위 숫자. 150ms는 0.15.
- EASING: MotionEasing 객체. 예: {"type":"EASE_OUT"}.
- 변수 참조: {"alias":{"collection":"Color","token":"primitive/canvas"}}.
  참조 대상의 타입은 같아야 한다. 대상은 MD에 포함하거나 Figma 파일에 이미 있어야 한다.
한 행은 변수 하나의 모드 하나다. Collection + Token + Mode 조합은 중복하지 않는다.
한 변수의 Type과 Description은 모든 모드 행에서 같게 작성한다.
모드 이름은 한글·영문·사용자 지정 이름을 그대로 보존한다. 순서로 Light/Dark를 추정하지 않는다.
새 컬렉션은 첫 번째로 작성된 모드가 기본 모드이며 기존 컬렉션의 기본 모드는 유지한다.
MD에 없는 기존 모드와 변수는 삭제하지 않는다. 이름 변경은 새 항목으로 취급될 수 있다.
기존 데이터 변경은 원래 이름을 유지한다. 명시적 이름 변경은 Figma에서 수행한 뒤 Export를 권장한다.
Value에 빈 값이나 -를 넣지 않는다. 빈 설명은 ""이다. 빈 셀 때문에 열을 이동시키지 않는다.
JSON 문자열의 따옴표와 줄바꿈은 JSON 이스케이프를 쓰며, 표 안 파이프 문자는 &#124;로 쓴다.
-->

| Category | Collection | Token | Type | Mode | Value | Description |
|---|---|---|---|---|---|---|
| colors | "Color" | "primitive/canvas" | COLOR | "주간" | {"r":1,"g":1,"b":1,"a":1} | "원시 배경" |
| colors | "Color" | "primitive/canvas" | COLOR | "야간" | {"r":0.08,"g":0.1,"b":0.14,"a":1} | "원시 배경" |
| colors | "Color" | "semantic/surface" | COLOR | "주간" | {"alias":{"collection":"Color","token":"primitive/canvas"}} | "화면 배경" |
| colors | "Color" | "semantic/surface" | COLOR | "야간" | {"alias":{"collection":"Color","token":"primitive/canvas"}} | "화면 배경" |
| spacing | "Spacing" | "space/12" | FLOAT | "기본" | 12 | "기본 간격" |
| radius | "Radius" | "corner/md" | FLOAT | "기본" | 8 | "기본 곡률" |
| typography | "Typography" | "body/Size" | FLOAT | "기본" | 16 | "본문 크기" |
| typography | "Typography" | "fontFamily/primary" | STRING | "기본" | "Inter" | "의도한 폰트" |
| typography | "Typography" | "fontFamily/secondary" | STRING | "기본" | "Inter" | "폴백 폰트" |
| typography | "Typography" | "fontWeight/400" | STRING | "기본" | "Regular" | "본문 두께" |

## Typography

<!--
[스타일과 그룹]
Color Styles: Variable Modes의 COLOR 변수마다 변수에 바인딩된 스타일을 만든다.
  스타일 이름은 Token 경로를 따른다. 컬렉션 이름을 자동 그룹으로 추가하지 않는다.
  다른 변수의 동일 이름 스타일과 충돌하면 자동으로 합치지 말고 사용자에게 확인한다.
Text Styles: Typography 표로 정의한다. 그룹 없는 body는 최상위 body 스타일이다.
  그룹 Body 아래 md는 Body/md가 되며 대소문자를 보존한다.
  Token에 Body/md를 직접 쓰는 방법도 가능하지만 그룹 Body와 중복하지 않는다.
  크기 변수는 스타일이름/Size, 행간은 스타일이름/LineHeight, 자간은 스타일이름/LetterSpacing.
  폰트명은 fontFamily/primary 또는 폴백용 fontFamily/secondary, 두께는 fontWeight/400 같은 STRING 변수.
  두께 값은 Regular/Bold 등 Figma 폰트 스타일 이름이다. 폰트 변수는 없을 때 보완하고 바인딩한다.
  폰트명·두께·크기의 바인딩을 우선한다. 행간·자간 연결 실패는 다른 바인딩을 중단하지 않는다.
  LineHeight는 150% 또는 24px처럼 명시한다. %는 정적 스타일 값, px는 변수 바인딩 가능.
  모드별 변수와 모드마다 별도로 생성되는 텍스트 스타일을 혼동하지 않는다.
-->

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| body | Inter | 16px | 400 | 150% | 0px |

## Effects

<!--
Effect Styles: drop-shadow / inner-shadow / layer-blur / background-blur / noise / texture / glass.
  종류별 상위 그룹을 붙인다. 예: card → drop-shadow/card.
  이미 같은 종류 접두어가 있으면 중복해서 붙이지 않는다. 기존 하위 경로는 유지한다.
  Shader는 이번 버전에서 제외한다. Beta 효과는 환경에 따라 QA 안내 후 건너뛸 수 있다.

[Effects / Grid의 Settings]
Token, Type, Settings 3개 열을 사용한다. Settings는 JSON 객체 또는 Export의 JSON 배열이다.
단일 객체의 type/pattern은 Type 열에서 정한다. 배열은 각 항목에 type/pattern을 유지한다.
복합 스타일은 배열의 모든 항목과 순서를 보존한다. 한 스타일의 그룹은 첫 항목 종류를 따른다.
정적 속성값은 항상 작성한다. 연결할 속성만 boundVariables에 명시한다.
예: "boundVariables":{"radius":{"alias":{"collection":"Spacing","token":"space/12"}}}
참조가 없으면 정적 값. 값이 같은 변수에 자동 연결하지 않는다.
참조 누락·타입 불일치는 해당 바인딩만 QA로 안내하고 정적 값을 사용한다.
Export 참조는 파일 내부 ID 대신 Collection과 Token 이름으로 관리한다.
지원 바인딩:
- 그림자 color(COLOR), radius/spread/offsetX/offsetY(FLOAT).
- Layer Blur·Background Blur radius(FLOAT).
- Noise·Texture·Glass는 현재 정적 값만 지원.
- Grid Size는 sectionSize(FLOAT).
- Columns·Rows Gutter는 gutterSize(FLOAT), Margin은 offset(FLOAT).
  STRETCH에서 count/offset/gutterSize, MIN/MAX에서 sectionSize/count/offset/gutterSize,
  CENTER에서 sectionSize/count/gutterSize를 지원한다.
-->

| Token | Type | Settings |
|---|---|---|
| card | drop-shadow | {"color":{"r":0,"g":0,"b":0,"a":0.12},"offset":{"x":0,"y":4},"radius":12,"spread":0,"visible":true,"blendMode":"NORMAL","boundVariables":{"radius":{"alias":{"collection":"Spacing","token":"space/12"}}}} |
| soft | layer-blur | {"radius":8,"visible":true,"blurType":"NORMAL"} |

## Grid

<!--
Grid Styles: columns / rows / grid 3종. 종류별 상위 그룹을 같은 방식으로 붙인다.
Settings의 JSON 형식과 속성별 바인딩 규칙은 위 Effects 설명을 함께 참고합니다.
-->

| Token | Type | Settings |
|---|---|---|
| desktop | columns | {"count":12,"alignment":"STRETCH","offset":48,"gutterSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"gutterSize":{"alias":{"collection":"Spacing","token":"space/12"}}}} |
| baseline | rows | {"count":8,"alignment":"STRETCH","offset":12,"gutterSize":8,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"offset":{"alias":{"collection":"Spacing","token":"space/12"}}}} |
| square | grid | {"sectionSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"sectionSize":{"alias":{"collection":"Spacing","token":"space/12"}}}} |

<!-- Motion은 옵션입니다. 아래 빈 표는 필요 없으면 삭제하고, 필요한 경우 기존 Export의 내용을 보완합니다. -->
## Motion Styles

<!--
[Motion Styles]
열은 Token, Entries. Entries는 Figma 프리셋을 조합하는 JSON 배열이다.
각 항목은 {"preset":"기존 Export의 정확한 프리셋 이름","props":{...}} 형태.
Export의 styleId가 있으면 보존하되 다른 파일에서는 프리셋 이름으로 다시 찾는다.
props는 해당 프리셋이 지원하는 속성만 사용한다. 명시적 변수 참조도 사용할 수 있다.
프리셋 이름과 props 키를 추측하지 않는다. 모르는 경우 기존 Motion Style을 Export하도록 안내한다.
@first는 API 확인용 테스트 값이다. 사용자 실사용 문서에 임의로 넣지 않는다.
모션 스타일은 로컬 스타일로만 등록하며 선택 레이어에 자동 적용하지 않는다.
TIMING 변수의 단위는 초. 구버전 Motion/Timing 표의 150ms 표기와 혼용하지 않는다.
-->

| Token | Entries |
|---|---|
