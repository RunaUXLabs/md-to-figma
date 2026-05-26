## Colors

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| brand/rausch | #ff385c | 메인 브랜드 (Rausch) |
| brand/rausch-active | #e00b41 | Rausch Active 상태 |
| brand/rausch-disabled | #ffd1da | Rausch Disabled 상태 |
| brand/luxe | #460479 | Luxe 서브브랜드 악센트 |
| brand/plus | #92174d | Plus 서브브랜드 악센트 |
| neutral/white | #ffffff | 캔버스 기본 표면 |
| neutral/gray-50 | #f7f7f7 | 부드러운 표면 |
| neutral/gray-100 | #f2f2f2 | 짙은 표면 (아이콘 버튼) |
| neutral/gray-200 | #ebebeb | 연한 구분선 |
| neutral/gray-300 | #dddddd | 기본 구분선 |
| neutral/gray-400 | #c1c1c1 | 강한 테두리 (포커스) |
| neutral/gray-500 | #929292 | 연한 비활성 텍스트 |
| neutral/gray-600 | #6a6a6a | 보조 텍스트 (Muted) |
| neutral/gray-700 | #3f3f3f | 본문 텍스트 (Body) |
| neutral/gray-800 | #222222 | 주요 텍스트 (Ink) |
| feedback/error | #c13515 | 에러 텍스트 |
| feedback/error-hover | #b32505 | 에러 텍스트 호버 |
| feedback/legal | #428bff | 법적 고지 링크 |
| transparent/scrim | rgba(0,0,0,0.50) | 모달 배경 |

### Semantic

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| brand/primary | brand/rausch | brand/rausch | 프라이머리 CTA |
| brand/primary-active | brand/rausch-active | brand/rausch-active | 프라이머리 CTA (Active) |
| brand/primary-disabled | brand/rausch-disabled | brand/rausch-disabled | 프라이머리 CTA (Disabled) |
| brand/luxe | brand/luxe | brand/luxe | Luxe 액센트 |
| brand/plus | brand/plus | brand/plus | Plus 액센트 |
| surface/canvas | neutral/white | neutral/gray-800 | 기본 페이지 배경 |
| surface/soft | neutral/gray-50 | neutral/gray-700 | 비활성 및 호버 배경 |
| surface/strong | neutral/gray-100 | neutral/gray-600 | 아이콘 버튼 표면 |
| border/hairline | neutral/gray-300 | neutral/gray-500 | 기본 1px 테두리 |
| border/hairline-soft | neutral/gray-200 | neutral/gray-600 | 연한 본문 구분선 |
| border/strong | neutral/gray-400 | neutral/gray-400 | 포커스 및 비활성 테두리 |
| text/ink | neutral/gray-800 | neutral/white | 헤드라인 및 주요 텍스트 |
| text/body | neutral/gray-700 | neutral/gray-200 | 보조 본문 텍스트 |
| text/muted | neutral/gray-600 | neutral/gray-400 | 서브타이틀 및 비활성 탭 |
| text/muted-soft | neutral/gray-500 | neutral/gray-500 | 비활성 링크 텍스트 |
| text/on-primary | neutral/white | neutral/white | 프라이머리 위 텍스트 |
| text/star-rating | neutral/gray-800 | neutral/white | 별점 아이콘 및 숫자 |
| feedback/error | feedback/error | feedback/error | 인라인 에러 텍스트 |
| feedback/error-hover | feedback/error-hover | feedback/error-hover | 에러 텍스트 호버 |
| text/legal-link | feedback/legal | feedback/legal | 법적 문구 링크 |
| effect/scrim | transparent/scrim | transparent/scrim | 모달 배경색 |


## Spacing

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| space-2 | 2px | 마이크로 스텝 |
| space-4 | 4px | 베이스 유닛 |
| space-8 | 8px | - |
| space-12 | 12px | - |
| space-16 | 16px | 베이스 간격 |
| space-24 | 24px | - |
| space-32 | 32px | - |
| space-48 | 48px | - |
| space-64 | 64px | 섹션 간격 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| xxs | space-2 | 가장 좁은 |
| xs | space-4 | 아주 좁은 |
| sm | space-8 | 캡션/데이트 로우 거터 |
| md | space-12 | 중간 간격 |
| base | space-16 | 카드 간격 및 기본 |
| lg | space-24 | 카드 내부 패딩 및 거터 |
| xl | space-32 | 큰 간격 |
| xxl | space-48 | 매우 큰 간격 |
| section | space-64 | 메이저 섹션 밴드 |


## Radius

### Primitive

| Token | Value | Description |
|-------|-------|-------------|
| radius-8 | 8px | 버튼 반경 |
| radius-14 | 14px | 프로퍼티 카드 반경 |
| radius-32 | 32px | 카테고리 스트립 반경 |
| radius-full | 9999px | 완벽한 원형 |

### Semantic

| Token | Alias | Description |
|-------|-------|-------------|
| sm | radius-8 | 버튼용 둥근 모서리 |
| md | radius-14 | 카드용 둥근 모서리 |
| xl | radius-32 | 카테고리 띠 둥근 모서리 |
| full | radius-full | 알약 형태 및 원형 |


## Typography

### Display

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| rating | Airbnb Cereal VF | 64px | 700 | 1.1 | -1px |
| xl | Airbnb Cereal VF | 28px | 700 | 1.43 | 0px |
| lg | Airbnb Cereal VF | 22px | 500 | 1.18 | -0.44px |
| md | Airbnb Cereal VF | 21px | 700 | 1.43 | 0px |
| sm | Airbnb Cereal VF | 20px | 600 | 1.20 | -0.18px |

### Title

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Airbnb Cereal VF | 16px | 600 | 1.25 | 0px |
| sm | Airbnb Cereal VF | 16px | 500 | 1.25 | 0px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| md | Airbnb Cereal VF | 16px | 400 | 1.5 | 0px |
| sm | Airbnb Cereal VF | 14px | 400 | 1.43 | 0px |

### Caption

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| default | Airbnb Cereal VF | 14px | 500 | 1.29 | 0px |
| sm | Airbnb Cereal VF | 13px | 400 | 1.23 | 0px |

### UI

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|-------|------|------|--------|------------|---------------|
| badge | Airbnb Cereal VF | 11px | 600 | 1.18 | 0px |
| micro-label | Airbnb Cereal VF | 12px | 700 | 1.33 | 0px |
| uppercase-tag | Airbnb Cereal VF | 8px | 700 | 1.25 | 0.32px |
| button-md | Airbnb Cereal VF | 16px | 500 | 1.25 | 0px |
| button-sm | Airbnb Cereal VF | 14px | 500 | 1.29 | 0px |
| link | Airbnb Cereal VF | 14px | 400 | 1.43 | 0px |
| nav-link | Airbnb Cereal VF | 16px | 600 | 1.25 | 0px |


## Effects

| Token | Type | Color | X | Y | Blur | Spread |
|-------|------|-------|---|---|------|--------|
| shadow-tier-1 | drop-shadow | rgba(0,0,0,0.02) | 0 | 0 | 0 | 1px |
| shadow-tier-2 | drop-shadow | rgba(0,0,0,0.04) | 0 | 2px | 6px | 0 |
| shadow-tier-3 | drop-shadow | rgba(0,0,0,0.10) | 0 | 4px | 8px | 0 |


## Grid

| Token | Type | Count | Width | Gutter | Margin | Alignment |
|-------|------|-------|-------|--------|--------|-----------|
| columns-12 | columns | 12 | auto | 24px | auto | stretch |
| columns-6 | columns | 6 | auto | 16px | auto | stretch |
| columns-4 | columns | 4 | auto | 16px | auto | stretch |
| columns-2 | columns | 2 | auto | 16px | auto | stretch |
| grid-8 | grid | 8px | - | - | - | - |
| grid-4 | grid | 4px | - | - | - | - |