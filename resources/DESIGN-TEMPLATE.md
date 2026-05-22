# Design System

<!--
📌 작성 규칙

[형식]
- 컬러: HEX 6자리 (#ffffff) 또는 rgba(0,0,0,0.1)
- 크기: 숫자+px 필수 (16px, -1.5px)
- LineHeight: 소수점 (1.5) 또는 퍼센트 (150%)
- Weight: 숫자(400, 700) 또는 이름(Regular, Bold, SemiBold). 피그마 스타일명과 일치 권장.
- 빈 값: - 로 표기

[토큰 구조]
- Primitive: 기본 색상 팔레트 (원시값, 모드 무관)
- Semantic: 용도별 색상 (Light/Dark 모드별 Alias 지정)

[다크모드 규칙]
⚠️ 중요: Primitive에 Light/Dark 모두에서 사용할 모든 원시 컬러를 먼저 정의

1. Primitive 정의 (원시값)
   - Light 모드에서 사용할 컬러 정의
   - Dark 모드에서 사용할 컬러도 함께 정의

2. Semantic 정의 (Alias)
   - Light 컬럼: Light 모드에서 사용할 Primitive 토큰명
   - Dark 컬럼: Dark 모드에서 사용할 Primitive 토큰명
   - ⚠️ HEX 직접 입력 금지 — 반드시 Primitive 토큰명(Alias) 사용

[다크모드 추론 가이드]
원본에 다크모드가 없으면 아래 패턴으로 추론:
- surface/canvas: Light=white → Dark=gray-900
- surface/card: Light=white → Dark=gray-800
- surface/elevated: Light=gray-50 → Dark=gray-700
- text/default: Light=gray-900 → Dark=gray-50
- text/muted: Light=gray-500 → Dark=gray-400
- border/default: Light=gray-200 → Dark=gray-700
- brand/primary: 보통 동일하게 유지
- feedback/*: 동일하거나 밝기 +10~20%

[네이밍]
- 허용: 영문, 숫자, /, -, _
- 금지: 공백, 괄호, 특수문자
- ⚠️ 숫자로 시작 금지
- 경로 구분: / 사용 (group/token)

[Typography 그룹핑]
- ### 그룹명 으로 그룹 구분 (예: ### Display)
- 예: ### Display 아래 xl → display/xl
-->


## Colors

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| coral/500 | #cc785c | 코랄 기본 |
| coral/600 | #a9583e | 코랄 어두움 |
| coral/300 | #e8a990 | 코랄 밝음 |
| navy/900 | #181715 | 네이비 가장 어두움 |
| navy/800 | #2a2825 | 네이비 어두움 |
| cream/50 | #fffcf7 | 크림 가장 밝음 |
| cream/100 | #faf6f0 | 크림 밝음 |
| cream/200 | #f0e9df | 크림 중간 |
| neutral/white | #ffffff | 화이트 |
| neutral/black | #000000 | 블랙 |
| neutral/gray-50 | #fafafa | 그레이 가장 밝음 |
| neutral/gray-100 | #f5f5f5 | 그레이 밝음 |
| neutral/gray-200 | #e5e5e5 | 그레이 |
| neutral/gray-300 | #d4d4d4 | 그레이 중간 |
| neutral/gray-400 | #a3a3a3 | 그레이 어두움 |
| neutral/gray-500 | #737373 | 그레이 더 어두움 |
| neutral/gray-600 | #525252 | 그레이 매우 어두움 |
| neutral/gray-700 | #404040 | 다크 그레이 |
| neutral/gray-800 | #262626 | 다크 그레이 어두움 |
| neutral/gray-900 | #171717 | 다크 그레이 가장 어두움 |
| green/500 | #22c55e | 그린 |
| green/400 | #4ade80 | 그린 밝음 |
| amber/500 | #f59e0b | 앰버 |
| amber/400 | #fbbf24 | 앰버 밝음 |
| red/500 | #ef4444 | 레드 |
| red/400 | #f87171 | 레드 밝음 |

### Semantic

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| brand/primary | coral/500 | coral/500 | 메인 브랜드 |
| brand/primary-active | coral/600 | coral/600 | 버튼 눌림 |
| brand/primary-disabled | coral/300 | coral/300 | 비활성화 |
| surface/canvas | neutral/white | neutral/gray-900 | 기본 배경 |
| surface/card | neutral/white | neutral/gray-800 | 카드 배경 |
| surface/elevated | neutral/gray-50 | neutral/gray-700 | 부유 요소 배경 |
| surface/muted | neutral/gray-100 | neutral/gray-800 | 비활성 배경 |
| text/default | neutral/gray-900 | neutral/gray-50 | 기본 텍스트 |
| text/muted | neutral/gray-500 | neutral/gray-400 | 보조 텍스트 |
| text/disabled | neutral/gray-300 | neutral/gray-600 | 비활성 텍스트 |
| text/on-primary | neutral/white | neutral/white | primary 위 텍스트 |
| text/on-dark | cream/50 | cream/50 | 다크 위 텍스트 |
| border/default | neutral/gray-200 | neutral/gray-700 | 기본 테두리 |
| border/strong | neutral/gray-300 | neutral/gray-600 | 강조 테두리 |
| border/focus | coral/500 | coral/500 | 포커스 테두리 |
| feedback/success | green/500 | green/400 | 성공 |
| feedback/warning | amber/500 | amber/400 | 경고 |
| feedback/error | red/500 | red/400 | 에러 |


## Spacing

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| space-2 | 2px | 최소 단위 |
| space-4 | 4px | - |
| space-8 | 8px | - |
| space-12 | 12px | - |
| space-16 | 16px | 기본 단위 |
| space-24 | 24px | - |
| space-32 | 32px | - |
| space-48 | 48px | - |
| space-64 | 64px | - |
| space-96 | 96px | 섹션 단위 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| xxs | space-2 | 가장 작은 |
| xs | space-4 | 아주 작은 |
| sm | space-8 | 작은 |
| md | space-16 | 중간 |
| lg | space-24 | 큰 |
| xl | space-32 | 아주 큰 |
| xxl | space-48 | 매우 큰 |
| section | space-96 | 섹션 간격 |


## Radius

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| radius-0 | 0px | 각진 |
| radius-4 | 4px | - |
| radius-6 | 6px | - |
| radius-8 | 8px | - |
| radius-12 | 12px | - |
| radius-16 | 16px | - |
| radius-24 | 24px | - |
| radius-full | 9999px | 완전 둥글게 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| none | radius-0 | 각진 |
| sm | radius-4 | 작은 |
| md | radius-8 | 중간 |
| lg | radius-12 | 큰 |
| xl | radius-16 | 아주 큰 |
| xxl | radius-24 | 매우 큰 |
| pill | radius-full | 알약 형태 |
| full | radius-full | 원형 |


## Typography

### Display

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| xl | Inter | 64px | 700 | 105% | -1.5px |
| lg | Inter | 48px | 700 | 110% | -1px |
| md | Inter | 36px | 700 | 115% | -0.5px |
| sm | Inter | 28px | 600 | 120% | -0.3px |

### Title

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| lg | Inter | 22px | 600 | 130% | 0px |
| md | Inter | 18px | 600 | 140% | 0px |
| sm | Inter | 16px | 600 | 140% | 0px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| lg | Inter | 18px | 400 | 160% | 0px |
| md | Inter | 16px | 400 | 155% | 0px |
| sm | Inter | 14px | 400 | 155% | 0px |

### Caption

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Inter | 13px | 500 | 140% | 0px |
| sm | Inter | 12px | 500 | 140% | 0.2px |
| uppercase | Inter | 11px | 600 | 140% | 1.5px |

### Code

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | JetBrains Mono | 14px | 400 | 160% | 0px |
| sm | JetBrains Mono | 12px | 400 | 160% | 0px |

### UI

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| button | Inter | 14px | 600 | 100% | 0px |
| label | Inter | 12px | 500 | 100% | 0.2px |
| input | Inter | 14px | 400 | 140% | 0px |


## Effects

| Token | Type | Color | X | Y | Blur | Spread |
|-------|------|-------|---|---|------|--------|
| shadow-sm | drop-shadow | rgba(0,0,0,0.08) | 0 | 1px | 2px | 0 |
| shadow-md | drop-shadow | rgba(0,0,0,0.12) | 0 | 4px | 8px | 0 |
| shadow-lg | drop-shadow | rgba(0,0,0,0.16) | 0 | 8px | 24px | 0 |
| shadow-xl | drop-shadow | rgba(0,0,0,0.20) | 0 | 16px | 48px | 0 |


## Grid

| Token | Type | Count | Width | Gutter | Margin | Alignment |
|-------|------|-------|-------|--------|--------|-----------|
| columns-2 | columns | 2 | auto | 24px | 48px | stretch |
| columns-3 | columns | 3 | auto | 24px | 48px | stretch |
| columns-4 | columns | 4 | auto | 24px | 48px | stretch |
| columns-6 | columns | 6 | auto | 24px | 48px | stretch |
| columns-12 | columns | 12 | auto | 24px | 48px | stretch |
| rows-2 | rows | 2 | auto | 16px | 8px | stretch |
| rows-3 | rows | 3 | auto | 16px | 8px | stretch |
| rows-4 | rows | 4 | auto | 16px | 8px | stretch |
| grid-4 | grid | 4px | - | - | - | - |
| grid-8 | grid | 8px | - | - | - | - |