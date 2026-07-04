# 🧩 Component Specifications: MD to Figma (v2.0.2)

> **Description:** MD to Figma 플러그인의 UI를 구성하는 11개의 핵심 컴포넌트 명세입니다.
> **적용 범위 (Scope):** 플러그인 메인 패널, 실행 모달, 시스템 알림.

---

## 🧱 1. Base Components (Atoms)

### 🧩 Component: ActionButton (액션 버튼)
> **Description:** 사용자의 클릭 동작을 유도하는 범용 버튼 컴포넌트입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `string` | `primary`, `export`, `template` | `primary` | 시각적 스타일 및 용도 구분 |
| `icon` | `node` | `Icon` | `-` | 텍스트 좌측에 배치될 아이콘 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `btn-text` | `{children}` | `string` | ✅ |
| `ico` | `<ActionButton.Icon>` | `Icon` | ❌ |

---

### 🧩 Component: Checkbox (체크박스)
> **Description:** 옵션의 활성/비활성 상태를 제어하는 컨트롤입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `checked` | `boolean` | `true`, `false` | `false` | 선택 활성화 상태 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `option-item` | `{children}` | `string` | ✅ |

---

### 🧩 Component: TextArea (텍스트 영역)
> **Description:** 대량의 마크다운 텍스트를 입력받는 멀티라인 입력 필드입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `placeholder` | `string` | `-` | `-` | 입력 가이드 텍스트 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `textarea-label` | `<TextArea.Label>` | `string` | ✅ |
| `textarea` | `{children}` | `string` (value) | ✅ |

---

### 🧩 Component: StatusBadge (상태 뱃지)
> **Description:** 현재 작업의 진행 상태를 색상과 아이콘으로 나타냅니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `status` | `string` | `running`, `success`, `error` | `running` | 작업 상태에 따른 테마 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `ic` | `<StatusBadge.Icon>` | `Icon` | ✅ |
| `span` | `{children}` | `string` | ✅ |

---

### 🧩 Component: TabItem (탭 아이템)
> **Description:** 모달 내에서 로그 카테고리를 전환하는 탭 버튼입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `active` | `boolean` | `true`, `false` | `false` | 현재 활성화 여부 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `tab-text` | `{children}` | `string` | ✅ |
| `tab-badge` | `<TabItem.Badge>` | `number` | ✅ |
| `ico` | `<TabItem.Icon>` | `Icon (Dot)` | ✅ |

---

### 🧩 Component: LogEntry (로그 항목)
> **Description:** 콘솔 영역에 출력되는 개별 로그 라인입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `type` | `string` | `info`, `qa`, `error`, `success` | `info` | 로그 중요도 및 유형 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `log-entry` | `{children}` | `string` | ✅ |

---

### 🧩 Component: Icon (시스템 아이콘)
> **Description:** Duotone 스타일의 SVG 시스템 에셋입니다.

| Property / Variant | Type | Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | `rocket`, `download`, `book`, etc. | `-` | 아이콘 에셋 이름 |

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `svg` | `-` | `-` | ✅ |

---

## 🏗️ 2. Compound Components (Molecules/Organisms)

### 🧩 Component: Modal (실행 모달)
> **Description:** 작업 프로세스와 결과 리포트를 보여주는 최상위 오버레이 컨테이너입니다.

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `modal-header` | `<Modal.Header>` | `Title, StatusBadge, Tabs` | ✅ |
| `tab-content` | `<Modal.Content>` | `LogEntry[]` | ✅ |
| `modal-footer` | `<Modal.Footer>` | `ActionButton[]` | ✅ |

---

### 🧩 Component: OptionCard (설정 패널)
> **Description:** 변수 및 스타일 생성 옵션을 그룹화하여 보여주는 카드 영역입니다.

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `options-title` | `<OptionCard.Header>` | `Icon, string` | ✅ |
| `options-grid` | `<OptionCard.Body>` | `Checkbox[]` | ✅ |

---

### 🧩 Component: ActionBar (하단 액션바)
> **Description:** 플러그인 최하단에 고정된 주요 액션 버튼 그룹입니다.

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `button-section` | `{children}` | `ActionButton[]` | ✅ |

---

### 🧩 Component: Toast (토스트 알림)
> **Description:** 작업 완료 또는 경고 메시지를 일시적으로 띄우는 플로팅 컴포넌트입니다.

| Original Figma Layer | Standard React Slot | Allowed Types (Children) | Required |
| :--- | :--- | :--- | :--- |
| `toast` | `{children}` | `string` | ✅ |
