# 최종 통합 테스트 — 모든 변수와 스타일

Variables 5개 항목과 Styles 5개 항목을 모두 선택하여 새 Figma 파일에서 등록합니다.
Motion Styles는 기본 선택이 꺼져 있으므로 직접 선택합니다.
각 컬렉션은 Standard / Compact 2개 모드를 사용합니다.
이 파일은 검증용 예시이며 실제 프로젝트의 값으로 사용하기 전 수정해야 합니다.

예상 변수: 컬렉션 5개, 변수 21개, 모드별 값 42행.
Category별 변수: Color 3, Spacing 3, Radius 2, Typography 9, Motion 4.
Typography에는 BOOLEAN 저장·왕복 확인용 feature/readable도 포함합니다. 폰트에는 바인딩하지 않습니다.
예상 스타일: Color 3, Text 2, Effect 9, Grid 4, Motion 1 — 총 19개.
Noise 등 베타 기능이 지원되지 않으면 해당 스타일 수는 줄고 QA에 이유가 표시될 수 있습니다.

확인 순서:
1. 첫 등록 후 모드별 값과 스타일 수, 폰트명·두께·크기 바인딩을 확인합니다.
2. 같은 MD를 재등록합니다. 변수 적용 수와 스타일 신규 수는 0이어야 합니다.
3. Export MD를 같은 파일에 재등록합니다. 신규 항목이 생기지 않아야 합니다.
4. Export MD를 새 파일에 등록합니다. 모드 이름, 그룹, 값, 참조가 유지되어야 합니다.
5. linked 효과의 Radius, columns/linked와 rows/linked의 Margin/Gutter,
   grid/linked의 Size를 확인합니다. static 항목은 변수에 연결되지 않아야 합니다.
6. body는 그룹 없이, Body/md는 Body 그룹에 등록되어야 합니다.
7. Motion 시간은 초 단위입니다. @first는 첫 사용 가능 프리셋을 사용하는 API 테스트 값이며
   특정 동작을 보장하지 않습니다. 레이어에는 자동 적용하지 않습니다.

## Variable Modes

| Category | Collection | Token | Type | Mode | Value | Description |
|---|---|---|---|---|---|---|
| colors | "Final Color" | "primitive/canvas" | COLOR | "Standard" | {"r":1,"g":1,"b":1,"a":1} | "Canvas" |
| colors | "Final Color" | "primitive/canvas" | COLOR | "Compact" | {"r":0.08,"g":0.1,"b":0.14,"a":1} | "Canvas" |
| colors | "Final Color" | "semantic/surface" | COLOR | "Standard" | {"alias":{"collection":"Final Color","token":"primitive/canvas"}} | "Surface" |
| colors | "Final Color" | "semantic/surface" | COLOR | "Compact" | {"alias":{"collection":"Final Color","token":"primitive/canvas"}} | "Surface" |
| colors | "Final Color" | "overlay" | COLOR | "Standard" | {"r":0,"g":0,"b":0,"a":0.25} | "Overlay" |
| colors | "Final Color" | "overlay" | COLOR | "Compact" | {"r":0,"g":0,"b":0,"a":0.6} | "Overlay" |
| spacing | "Final Spacing" | "space/12" | FLOAT | "Standard" | 12 | "Shared style metric" |
| spacing | "Final Spacing" | "space/12" | FLOAT | "Compact" | 8 | "Shared style metric" |
| spacing | "Final Spacing" | "layout/margin" | FLOAT | "Standard" | 48 | "Margin" |
| spacing | "Final Spacing" | "layout/margin" | FLOAT | "Compact" | 24 | "Margin" |
| spacing | "Final Spacing" | "layout/gap" | FLOAT | "Standard" | {"alias":{"collection":"Final Spacing","token":"space/12"}} | "Alias and static" |
| spacing | "Final Spacing" | "layout/gap" | FLOAT | "Compact" | 6 | "Alias and static" |
| radius | "Final Radius" | "corner/base" | FLOAT | "Standard" | 8 | "Corner" |
| radius | "Final Radius" | "corner/base" | FLOAT | "Compact" | 4 | "Corner" |
| radius | "Final Radius" | "corner/card" | FLOAT | "Standard" | {"alias":{"collection":"Final Radius","token":"corner/base"}} | "Corner alias" |
| radius | "Final Radius" | "corner/card" | FLOAT | "Compact" | {"alias":{"collection":"Final Radius","token":"corner/base"}} | "Corner alias" |
| typography | "Final Typography" | "body/Size" | FLOAT | "Standard" | 16 | "Body size" |
| typography | "Final Typography" | "body/Size" | FLOAT | "Compact" | 14 | "Body size" |
| typography | "Final Typography" | "Body/md/Size" | FLOAT | "Standard" | 18 | "Grouped size" |
| typography | "Final Typography" | "Body/md/Size" | FLOAT | "Compact" | 16 | "Grouped size" |
| typography | "Final Typography" | "Body/md/LineHeight" | FLOAT | "Standard" | 24 | "Pixel line height" |
| typography | "Final Typography" | "Body/md/LineHeight" | FLOAT | "Compact" | 20 | "Pixel line height" |
| typography | "Final Typography" | "Body/md/LetterSpacing" | FLOAT | "Standard" | 0.5 | "Letter spacing" |
| typography | "Final Typography" | "Body/md/LetterSpacing" | FLOAT | "Compact" | 0 | "Letter spacing" |
| typography | "Final Typography" | "fontFamily/primary" | STRING | "Standard" | "Inter" | "Font" |
| typography | "Final Typography" | "fontFamily/primary" | STRING | "Compact" | "Inter" | "Font" |
| typography | "Final Typography" | "fontFamily/secondary" | STRING | "Standard" | "Inter" | "Fallback" |
| typography | "Final Typography" | "fontFamily/secondary" | STRING | "Compact" | "Inter" | "Fallback" |
| typography | "Final Typography" | "fontWeight/400" | STRING | "Standard" | "Regular" | "Regular" |
| typography | "Final Typography" | "fontWeight/400" | STRING | "Compact" | "Regular" | "Regular" |
| typography | "Final Typography" | "fontWeight/700" | STRING | "Standard" | "Bold" | "Bold" |
| typography | "Final Typography" | "fontWeight/700" | STRING | "Compact" | "Bold" | "Bold" |
| typography | "Final Typography" | "feature/readable" | BOOLEAN | "Standard" | true | "BOOLEAN round-trip test; not font-bound" |
| typography | "Final Typography" | "feature/readable" | BOOLEAN | "Compact" | false | "BOOLEAN round-trip test; not font-bound" |
| motion | "Final Motion" | "duration/fast" | TIMING | "Standard" | 0.15 | "Seconds" |
| motion | "Final Motion" | "duration/fast" | TIMING | "Compact" | 0.1 | "Seconds" |
| motion | "Final Motion" | "duration/enter" | TIMING | "Standard" | {"alias":{"collection":"Final Motion","token":"duration/fast"}} | "Timing alias" |
| motion | "Final Motion" | "duration/enter" | TIMING | "Compact" | 0.2 | "Timing alias" |
| motion | "Final Motion" | "easing/out" | EASING | "Standard" | {"type":"EASE_OUT"} | "Easing" |
| motion | "Final Motion" | "easing/out" | EASING | "Compact" | {"type":"LINEAR"} | "Easing" |
| motion | "Final Motion" | "easing/enter" | EASING | "Standard" | {"alias":{"collection":"Final Motion","token":"easing/out"}} | "Easing alias" |
| motion | "Final Motion" | "easing/enter" | EASING | "Compact" | {"type":"CUSTOM_CUBIC_BEZIER","easingFunctionCubicBezier":{"x1":0.2,"y1":0,"x2":0,"y2":1}} | "Easing alias" |

## Typography

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| body | Inter | 16px | 400 | 150% | 0px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| md | Inter | 18px | 700 | 24px | 0.5px |

## Effects

| Token | Type | Settings |
|---|---|---|
| card | drop-shadow | {"color":{"r":0,"g":0,"b":0,"a":0.15},"offset":{"x":0,"y":4},"radius":12,"spread":0,"visible":true,"blendMode":"NORMAL"} |
| inset | inner-shadow | {"color":{"r":0,"g":0,"b":0,"a":0.2},"offset":{"x":0,"y":2},"radius":4,"spread":0,"visible":true,"blendMode":"NORMAL"} |
| soft | layer-blur | {"radius":8,"visible":true,"blurType":"NORMAL"} |
| frosted | background-blur | {"radius":16,"visible":true,"blurType":"NORMAL"} |
| grain | noise | {"noiseType":"MONOTONE","color":{"r":0,"g":0,"b":0,"a":0.2},"noiseSize":1,"density":0.5,"visible":true} |
| paper | texture | {"noiseSize":20,"radius":2,"clipToShape":true,"visible":true} |
| clear | glass | {"lightIntensity":0.5,"lightAngle":45,"refraction":0.2,"depth":10,"dispersion":0.1,"radius":2,"visible":true} |

| linked | layer-blur | {"radius":12,"visible":true,"blurType":"NORMAL","boundVariables":{"radius":{"alias":{"collection":"Final Spacing","token":"space/12"}}}} |
| static | layer-blur | {"radius":12,"visible":true,"blurType":"NORMAL"} |

## Grid

| Token | Type | Settings |
|---|---|---|
| linked | columns | {"count":12,"alignment":"STRETCH","offset":12,"gutterSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"offset":{"alias":{"collection":"Final Spacing","token":"space/12"}},"gutterSize":{"alias":{"collection":"Final Spacing","token":"space/12"}}}} |
| static | columns | {"count":12,"alignment":"STRETCH","offset":48,"gutterSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1}} |
| linked | rows | {"count":8,"alignment":"STRETCH","offset":12,"gutterSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"offset":{"alias":{"collection":"Final Spacing","token":"space/12"}},"gutterSize":{"alias":{"collection":"Final Spacing","token":"space/12"}}}} |
| linked | grid | {"sectionSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"sectionSize":{"alias":{"collection":"Final Spacing","token":"space/12"}}}} |

## Motion Styles

| Token | Entries |
|---|---|
| motion/final-preset | [{"preset":"@first","props":{}}] |
