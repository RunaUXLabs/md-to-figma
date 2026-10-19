# MD to Figma 스킬 · AI 플러그인 배포

Figma 플러그인 **v2.1.1**의 기존 템플릿 다운로드와 v2.1.0 MD 형식을 유지하면서, 같은 규칙을 사용하는 AI 배포물을 별도로 만듭니다. AI 패키지의 초기 버전은 **0.1.0**입니다. 이 버전은 Figma 플러그인의 업데이트 번호가 아닙니다.

## 배포물

저장소 루트에서 `node integrations/build.cjs`를 실행하면 `dist/assistant/`에 다음 파일을 생성합니다. Node.js 18 이상이 필요하며 추가 패키지 설치는 필요 없습니다. 이 전용 출력 폴더는 다시 빌드할 때 재생성됩니다.

| 파일 | 용도 |
|---|---|
| `figma/runa-md-to-figma.md` | Figma에 업로드하는 단일 파일 스킬. 규칙과 예시를 파일 안에 포함 |
| `md-to-figma-assistant-0.1.0.zip` | OpenAI portable plugin. ZIP 루트에 plugin.json 포함 |
| `runa-md-to-figma-skill-0.1.0.zip` | Agent Skills 폴더를 지원하는 AI에 설치할 독립 스킬 |
| `runa-md-to-figma-marketplace-0.1.0.zip` | 로컬 설치 테스트용 카탈로그와 플러그인을 함께 포함 |
| `SHA256SUMS.txt` | 배포 파일의 SHA-256 해시 |

소스는 이 integrations 폴더에서 관리합니다. 기존 `code.js`, `ui.html`, Figma manifest, 템플릿, AI 가이드 및 통합 샘플은 수정하지 않습니다. 빌드가 현재 템플릿·가이드·샘플을 그대로 복사하므로 별도 사본을 수작업으로 갱신할 필요가 없습니다. 검사기에 필요한 MD 파서만 현재 code.js에서 추출하며, Figma 실행 코드는 패키지에 넣지 않습니다. compatibility.json에 원본 파일과 파서의 해시를 기록합니다. 기존 런타임이나 형식이 바뀌면 참조 문서와 호환 버전을 검토하고 다시 빌드하세요.

## Figma에서 사용하기

공개된 스킬은 [Figma Community의 MD to Figma Assistant](https://www.figma.com/community/skill/142125/runa-md-to-figma)에서 추가할 수 있습니다. 아래 직접 업로드 절차는 로컬 수정본을 테스트할 때 사용합니다.

1. Figma의 AI 대화 입력창에서 Skills → Add skill → Upload a file을 엽니다.
2. 생성된 `figma/runa-md-to-figma.md`를 업로드하고 내용 확인 후 Add를 누릅니다. ZIP 파일을 업로드하지 않습니다.
3. `/runa-md-to-figma`를 호출하고 원본 MD나 디자인 자료를 첨부합니다.
4. 결과 MD를 기존 MD to Figma 플러그인에 붙여넣고 AI가 안내한 Variables / Styles를 선택해 등록합니다.

Figma 스킬은 단일 MD만 사용하므로 로컬 Node 검사기를 실행한다고 주장하지 않습니다. 규칙에 따라 문서를 검토하며, 대상 파일의 실제 등록 결과는 사용자가 확인합니다.

공개 배포는 Manage skills에서 해당 스킬을 선택한 뒤 More actions → Publish → Community로 진행합니다. 제목·태그라인·상세설명은 [게시용 문구](LISTING.md)를 사용할 수 있습니다. 커버는 스킬 동작을 보여주는 이미지로 별도 준비하세요. 기존 플러그인의 Community 페이지와 별개의 리소스입니다. [Figma 공식 스킬 안내](https://help.figma.com/hc/en-us/articles/40283639496599-Create-and-manage-custom-skills-in-Figma)를 기준으로 구성했습니다.

## AI 플러그인으로 사용하기

패키지는 root plugin.json과 skills 폴더를 사용하는 OpenAI의 portable 형식입니다. 별도 서버나 MCP, API 키를 요구하지 않습니다. 설치와 로컬 스크립트 실행 가능 여부는 호스트 AI 환경에 따라 다릅니다. 모든 AI의 플러그인 스토어에서 동일한 ZIP을 지원한다고 가정하지 않습니다. [공식 패키징 안내](https://developers.openai.com/plugins/build/plugins)를 기준으로 구성했습니다.

로컬 테스트용 marketplace ZIP을 원하는 폴더에 풀고, Codex CLI가 설치된 환경에서 압축을 푼 **루트 폴더**를 등록합니다. 현재 작업 폴더에서 빌드한 결과를 바로 사용할 때는 다음과 같습니다.

```powershell
codex plugin marketplace add ./dist/assistant/marketplace
```

앱을 다시 시작한 뒤 Plugins에서 `runa-md-to-figma` 카탈로그의 **MD to Figma Assistant**를 설치합니다. 설치한 AI에서 스킬을 선택하거나 Codex에서 `$runa-md-to-figma`로 호출합니다. 카탈로그 등록은 설치·공개 게시와 별개입니다. 이 작업은 빌드 스크립트가 자동 수행하지 않습니다.

개별 스킬을 설치하려면 skill ZIP을 풀어 생성된 `runa-md-to-figma` 폴더 전체를 사용하는 AI의 스킬 경로에 놓습니다. SKILL.md만 복사하면 참고 파일과 검사기가 빠집니다. Codex 개인 스킬 경로의 기본값은 `~/.codex/skills/`입니다.

OpenAI 공개 디렉터리 제출에는 plugin ZIP을 사용합니다. 제출 시점의 공식 대시보드 요구사항과 개발자 인증을 확인하고, 설치 테스트 후 제출합니다. 데이터 처리 설명은 [DATA-HANDLING.md](DATA-HANDLING.md)에 있습니다. 공개 정책 URL이나 제출 계정을 임의로 만들지 않았으며, 현재 패키지는 로컬 빌드 결과입니다. 다른 플랫폼은 독립 스킬 또는 해당 플랫폼 형식으로의 추가 포장이 필요할 수 있습니다.

## 검증

```powershell
node integrations/build.cjs
node --test integrations/tests/package.test.cjs
node dist/assistant/marketplace/plugins/md-to-figma-assistant/skills/runa-md-to-figma/scripts/validate-md.cjs resources/FINAL-INTEGRATION-SAMPLE.md
```

사전 검사 성공은 MD 구조에 대한 결과입니다. 외부 참조는 대상 파일에 있을 수 있어 경고로 남깁니다. 실제 폰트·API·모션 프리셋·바인딩과 대상 파일 상태는 검증하지 않습니다. 기존 통합 샘플의 `@first` 경고는 의도한 테스트 전용 프리셋 안내입니다.

게시 전에는 각 호스트에서 원본을 첨부하고 다음 작업을 확인합니다.

- 단일 모드 및 자유로운 모드 이름을 유지한 문서 변환
- 특정 모드 값 하나 수정 시 다른 모드와 컬렉션 보존
- 원본에 없는 스타일·모션·예시 토큰을 추가하지 않는지 확인
- 외부 참조와 이름 변경의 영향을 사용자 언어로 안내하는지 확인
- QA 로그의 오류 행 수정 후 새 Figma 파일 등록, 재등록, Export 비교

기존 통합 샘플의 기대 결과는 변수 21개·42행, 스타일 19개입니다. 첫 등록과 같은 MD 재등록 결과를 구분합니다. 이 패키징 작업 자체로 호스트 AI 설치나 Figma 실행 테스트까지 완료되는 것은 아닙니다.
