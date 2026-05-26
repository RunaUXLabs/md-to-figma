# Design System

<!--
📌 작성 규칙 (v2.2.1)

[형식]
- 컬러: HEX 6자리 (#ffffff) 또는 rgba(0,0,0,0.1)
- 크기: 숫자+px 필수 (16px, -1.5px)
- LineHeight (중요): 
  1. % 또는 소수점(1.5 등): 피그마 스타일에 %로 직접 입력됨 (바인딩 해제, 퍼센트 값 보존)
  2. px 명시 (24px 등): 피그마 배리어블과 스타일이 바인딩됨 (시스템 일관성 유지)
- Weight: 숫자(400, 700) 또는 이름(Regular, Bold). 피그마 스타일명과 일치 권장.
- 빈 값: - 로 표기

[폰트 폴백 규칙]
- 지정한 폰트가 시스템에 없을 경우, 플러그인이 'Inter Regular'를 자동으로 불러와 대체합니다.
- 이때 'fontFamily/Inter' 배리어블을 생성하여 스타일에 자동으로 바인딩하므로 취소선 없이 깨끗한 상태가 유지됩니다.

[토큰 구조]
- Primitive: 기본 색상 팔레트 (원시값, 모드 무관)
- Semantic: 용도별 색상 (Light/Dark 모드별 Alias 지정)

[다크모드 규칙]
⚠️ 중요: Primitive에 Light/Dark 모두에서 사용할 모든 원시 컬러를 먼저 정의
1. Primitive 정의 (원시값): 모든 모드에서 쓰일 컬러 나열
2. Semantic 정의 (Alias): Light/Dark 컬럼에 Primitive 토큰명 기재 (HEX 직접 입력 금지)

[Typography 그룹핑]
- ### 그룹명 으로 그룹 구분 (예: ### Display)
- 예: ### Display 아래 xl -> display/xl
-->


## Colors

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| coral/500 | #cc785c | 코랄 기본 |
| coral/600 | #a9583e | 코랄 어두움 |
| coral/300 | #e8a990 | 코랄 밝음 |
| navy/900 | #181715 | 네이비 가장 어두움 |
| neutral/white | #ffffff | 화이트 |
| neutral/gray-900 | #171717 | 다크 그레이 가장 어두움 |

### Semantic

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| brand/primary | coral/500 | coral/500 | 메인 브랜드 |
| surface/canvas | neutral/white | neutral/gray-900 | 기본 배경 |
| text/default | navy/900 | neutral/white | 기본 텍스트 |


## Spacing

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| space-16 | 16px | 기본 단위 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| md | space-16 | 중간 |


## Radius

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| radius-8 | 8px | 기본 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| md | radius-8 | 중간 |


## Typography

### Display

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| xl | Inter | 64px | 700 | 110% | -1px |
| lg | Inter | 48px | 700 | 1.2 | -0.5px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Inter | 16px | 400 | 150% | 0px |
| sm | Inter | 14px | 400 | 24px | 0px |


## Effects

| Token | Type | Color | X | Y | Blur | Spread |
|-------|------|-------|---|---|------|--------|
| shadow-md | drop-shadow | rgba(0,0,0,0.12) | 0 | 4px | 8px | 0 |


## Grid

| Token | Type | Count | Width | Gutter | Margin | Alignment |
|-------|------|-------|-------|--------|--------|-----------|
| columns-12 | columns | 12 | auto | 24px | 48px | stretch |
