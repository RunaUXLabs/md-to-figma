# MD to Figma Assistant

디자인 토큰과 기존 Export MD를 MD to Figma v2.1.0이 읽을 수 있는 문서로 정리하는 AI 스킬 패키지입니다. 패키지 버전은 0.1.1이며 Figma 플러그인 버전과 별도로 관리합니다.

## 사용하기

설치한 AI에서 `md-to-figma` 스킬을 선택하고 원본 자료를 첨부합니다. Codex에서는 `$md-to-figma`로 호출할 수 있습니다. 설명은 대화 중 사용하는 언어로 제공하며, MD의 필드 이름은 유지합니다.

예시 요청:

> 이 Export MD를 MD to Figma 형식으로 정리해줘. 컬렉션·토큰·모드 이름과 참조는 그대로 두고, 변경점과 필요한 등록 옵션을 한국어로 설명해줘.

결과 MD를 기존 Figma 플러그인에 붙여넣고 안내받은 Variables / Styles를 선택해 Generate합니다. 대상 파일의 기존 항목, 사용 가능한 폰트, 모드 값, 스타일 그룹과 바인딩은 사용자가 확인합니다. QA 로그에 문제가 있으면 결과 MD와 함께 AI에 전달합니다. 마지막으로 Export하여 변경 결과를 비교합니다.

## 포함된 도구

- 스킬: `skills/md-to-figma/SKILL.md`
- 형식 설명: `skills/md-to-figma/references/format.md`
- 기존 템플릿·가이드·통합 샘플: `skills/md-to-figma/assets/`
- 로컬 사전 검사: `node skills/md-to-figma/scripts/validate-md.cjs <design.md>` (Node.js 18 이상)
- 호환성 및 원본 해시: `compatibility.json`

검사기는 문법, 모드 행 중복, 기본 타입, 명시적 참조와 일부 스타일 구조를 검사합니다. 외부 변수 참조는 의존성 경고로 표시합니다. 폰트와 전체 API 설정, 모션 프리셋, 실제 바인딩, 대상 파일 상태는 Figma에서 확인해야 합니다. 구형 표의 세부 의미는 검사 범위에 포함되지 않습니다.

이 패키지는 Figma를 자동 변경하지 않으며 별도 서버, API 키, OAuth 또는 MCP 연결을 요구하지 않습니다. 호스트 AI의 파일 접근·실행 기능에 따라 로컬 검사를 사용할 수 있습니다. 자세한 데이터 처리는 DATA-HANDLING.md를 참고하세요.
