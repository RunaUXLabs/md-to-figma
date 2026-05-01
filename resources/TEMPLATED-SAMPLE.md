# Design System

## Colors

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| rausch/500 | #ff385c | Rausch 기본 (브랜드 레드) |
| rausch/600 | #e00b41 | Rausch 어두움 (눌림 상태) |
| rausch/100 | #ffd1da | Rausch 밝음 (비활성화) |
| luxe/900 | #460479 | Luxe 퍼플 (서브 브랜드) |
| plus/800 | #92174d | Plus 마젠타 (서브 브랜드) |
| ink/900 | #222222 | 잉크 기본 (주요 텍스트) |
| ink/700 | #3f3f3f | 잉크 보조 (본문 텍스트) |
| ink/500 | #6a6a6a | 잉크 음소거 |
| ink/400 | #929292 | 잉크 소프트 (비활성 링크) |
| surface/soft | #f7f7f7 | 서피스 소프트 |
| surface/strong | #f2f2f2 | 서피스 스트롱 |
| hairline/default | #dddddd | 기본 구분선 |
| hairline/soft | #ebebeb | 소프트 구분선 |
| hairline/strong | #c1c1c1 | 강조 테두리 |
| blue/500 | #428bff | 법적 링크 블루 |
| red/700 | #c13515 | 에러 텍스트 |
| red/800 | #b32505 | 에러 텍스트 호버 |
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

### Semantic

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| brand/primary | rausch/500 | rausch/500 | 메인 브랜드 (Rausch) |
| brand/primary-active | rausch/600 | rausch/600 | 버튼 눌림 상태 |
| brand/primary-disabled | rausch/100 | rausch/100 | 비활성화 |
| brand/luxe | luxe/900 | luxe/900 | Luxe 서브 브랜드 |
| brand/plus | plus/800 | plus/800 | Plus 서브 브랜드 |
| surface/canvas | neutral/white | neutral/gray-900 | 기본 페이지 배경 |
| surface/card | neutral/white | neutral/gray-800 | 카드 배경 |
| surface/elevated | surface/soft | neutral/gray-700 | 부유 요소 배경 |
| surface/muted | surface/strong | neutral/gray-800 | 비활성 영역 배경 |
| text/default | ink/900 | neutral/gray-50 | 기본 텍스트 (헤드라인·본문) |
| text/secondary | ink/700 | neutral/gray-200 | 보조 본문 텍스트 |
| text/muted | ink/500 | neutral/gray-400 | 음소거 텍스트 |
| text/disabled | ink/400 | neutral/gray-600 | 비활성 텍스트 |
| text/on-primary | neutral/white | neutral/white | Primary 위 텍스트 |
| text/on-dark | neutral/white | neutral/white | 다크 표면 위 텍스트 |
| border/default | hairline/default | neutral/gray-700 | 기본 구분선·테두리 |
| border/soft | hairline/soft | neutral/gray-800 | 소프트 구분선 |
| border/strong | hairline/strong | neutral/gray-600 | 강조 테두리 |
| border/focus | ink/900 | neutral/gray-50 | 포커스 테두리 |
| feedback/error | red/700 | red/700 | 에러 텍스트 |
| feedback/error-hover | red/800 | red/800 | 에러 텍스트 호버 |
| utility/link | blue/500 | blue/500 | 법적 인라인 링크 |
| utility/scrim | neutral/black | neutral/black | 모달 스크림 (50% 불투명도 렌더) |


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
| space-64 | 64px | 섹션 단위 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| xxs | space-2 | 최소 (마이크로 스텝) |
| xs | space-4 | 카테고리 스트립 구분 |
| sm | space-8 | 캡션·날짜 행 거터 |
| md | space-12 | 편의시설 행 내부 패딩 |
| base | space-16 | 카드 메타 블록·카드 간 거터 |
| lg | space-24 | 호스트·예약 카드 패딩·푸터 거터 |
| xl | space-32 | - |
| xxl | space-48 | 푸터 수직 패딩 |
| section | space-64 | 주요 페이지 밴드 수직 간격 |


## Radius

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| radius-0 | 0px | 각진 |
| radius-4 | 4px | - |
| radius-8 | 8px | - |
| radius-14 | 14px | - |
| radius-20 | 20px | - |
| radius-32 | 32px | - |
| radius-full | 9999px | 완전 둥글게 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| none | radius-0 | 각진 (그리드 바디) |
| xs | radius-4 | 아주 작은 |
| sm | radius-8 | 버튼·입력 필드 |
| md | radius-14 | 프로퍼티 카드·호스트 카드 |
| lg | radius-20 | 큰 카드 |
| xl | radius-32 | 카테고리 스트립 |
| pill | radius-full | 검색바·알약 버튼 |
| full | radius-full | 검색 오브·하트 버튼·날짜 셀 |


## Typography

### Display

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| rating | Airbnb Cereal VF | 64px | 700 | 110% | -1px |
| xl | Airbnb Cereal VF | 28px | 700 | 143% | 0px |
| lg | Airbnb Cereal VF | 22px | 500 | 118% | -0.44px |
| md | Airbnb Cereal VF | 21px | 700 | 143% | 0px |
| sm | Airbnb Cereal VF | 20px | 600 | 120% | -0.18px |

### Title

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Airbnb Cereal VF | 16px | 600 | 125% | 0px |
| sm | Airbnb Cereal VF | 16px | 500 | 125% | 0px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Airbnb Cereal VF | 16px | 400 | 150% | 0px |
| sm | Airbnb Cereal VF | 14px | 400 | 143% | 0px |

### Caption

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Airbnb Cereal VF | 14px | 500 | 129% | 0px |
| sm | Airbnb Cereal VF | 13px | 400 | 123% | 0px |
| badge | Airbnb Cereal VF | 11px | 600 | 118% | 0px |
| micro-label | Airbnb Cereal VF | 12px | 700 | 133% | 0px |
| uppercase-tag | Airbnb Cereal VF | 8px | 700 | 125% | 0.32px |

### UI

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| button-md | Airbnb Cereal VF | 16px | 500 | 125% | 0px |
| button-sm | Airbnb Cereal VF | 14px | 500 | 129% | 0px |
| link | Airbnb Cereal VF | 14px | 400 | 143% | 0px |
| nav-link | Airbnb Cereal VF | 16px | 600 | 125% | 0px |


## Effects

| Token | Type | Color | X | Y | Blur | Spread |
|-------|------|-------|---|---|------|--------|
| shadow-card-ring | drop-shadow | rgba(0,0,0,0.02) | 0 | 0 | 0 | 1px |
| shadow-card-base | drop-shadow | rgba(0,0,0,0.04) | 0 | 2px | 6px | 0 |
| shadow-card-depth | drop-shadow | rgba(0,0,0,0.10) | 0 | 4px | 8px | 0 |


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