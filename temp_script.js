
    var TEMPLATE_MD = `# Design System

<!--
📌 작성 규칙 (v2.3.1)

[형식]
- 컬러: HEX 6자리 (#ffffff) 또는 rgba(0,0,0,0.1)
- 크기: 숫자+px 필수 (16px, -1.5px)
- LineHeight (중요): 
  1. % 또는 소수점(1.5 등): 피그마 스타일에 %로 직접 입력됨 (바인딩 해제, 퍼센트 값 보존)
  2. px 명시 (24px 등): 피그마 배리어블과 스타일이 바인딩됨 (시스템 일관성 유지)
- Weight: 숫자(400, 700) 또는 이름(Regular, Bold). 피그마 스타일명과 일치 권장.
- 빈 값: - 로 표기

[시멘틱 타이포그래피 규칙]
- FontFamily 배리어블은 'fontFamily/primary', 'fontFamily/secondary' 이름으로 자동 생성됩니다.
- FontWeight 배리어블은 'fontWeight/400', 'fontWeight/700' 처럼 입력된 값을 이름으로 생성하며 스타일명이 값으로 할당됩니다.
- MD에 적힌 폰트명이 이 변수의 '값'으로 할당됩니다.
- 폰트가 시스템에 없을 경우 변수의 '값'만 'Inter'로 자동 업데이트되어 일괄 반영됩니다.

[토큰 구조]
- Primitive: 기본 색상 팔레트 (원시값, 모드 무관)
- Semantic: 용도별 색상 (Light/Dark 모드별 Alias 지정)

[Typography 그룹핑]
- ### 그룹명 으로 그룹 구분 (예: ### Display)
- 예: ### Display 아래 xl -> display/xl
-->

## Colors
### Primitive
| Token | Value | Description |
|---|---|---|
| coral/500 | #cc785c | 메인 컬러 |
| navy/900 | #181715 | 기본 텍스트 |

### Semantic
| Token | Light | Dark | Description |
|---|---|---|---|
| brand/primary | coral/500 | coral/500 | 메인 버튼 |
| surface/canvas | #ffffff | navy/900 | 배경 |

## Typography
### Display
| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| xl | Inter | 64px | 700 | 110% | -1px |`;

    var AI_PROMPT_GUIDE = `# 🚀 MD to Figma: Global AI Prompt Guide (v2.3.1)

Register your entire design system into Figma Variables & Styles in seconds.

---

## 🤖 The Master Prompt

> "Analyze my design data and restructure it into the provided DESIGN-TEMPLATE.md format.
> 
> **CRITICAL COMPLIANCE RULES:**
> 1. **Color Aliasing**: Semantic tables MUST reference Primitive token names. No HEX codes in Semantic.
> 2. **LineHeight Smart Units**: Use \`%\` for raw style input (preserves precision), use \`px\` for Variable Binding.
> 3. **Typography Safety**: Specify your font; the plugin will handle fallback to 'Inter' by updating the semantic 'fontFamily/primary' variable automatically.
> 
> Output as a single Markdown code block."`;

    var mdContent = document.getElementById('mdContent');
    var modalOverlay = document.getElementById('modalOverlay');
    var contentError = document.getElementById('contentError');
    var contentQA = document.getElementById('contentQA');
    var badgeError = document.getElementById('badgeError');
    var badgeQA = document.getElementById('badgeQA');
    var copyErrorBtn = document.getElementById('copyErrorBtn');
    var copyQABtn = document.getElementById('copyQABtn');
    var closeModalBtn = document.getElementById('closeModalBtn');
    var statusBadge = document.getElementById('statusBadge');
    var toast = document.getElementById('toast');

    var errorLogs = [];
    var qaLogs = [];

    document.getElementById('downloadTemplateBtn').onclick = () => downloadFile('DESIGN-TEMPLATE.md', TEMPLATE_MD);
    document.getElementById('downloadGuideBtn').onclick = () => downloadFile('AI-PROMPT-GUIDE.md', AI_PROMPT_GUIDE);

    function downloadFile(filename, content) {
      var blob = new Blob([content], { type: 'text/markdown' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); showToast('📥 다운로드 완료!');
    }

    document.getElementById('generateBtn').onclick = function () {
      var content = mdContent.value.trim();
      if (!content) { showToast('⚠️ 내용을 붙여넣으세요'); return; }
      openModal('등록 중...');
      var options = {
        variables: {
          colors: document.getElementById('optVarColors').checked,
          spacing: document.getElementById('optVarSpacing').checked,
          radius: document.getElementById('optVarRadius').checked,
          typography: document.getElementById('optVarTypography').checked
        },
        styles: {
          color: document.getElementById('optColorStyles').checked,
          text: document.getElementById('optTextStyles').checked,
          effect: document.getElementById('optEffectStyles').checked,
          grid: document.getElementById('optGridStyles').checked
        }
      };
      parent.postMessage({ pluginMessage: { type: 'generate', content: content, options: options } }, '*');
    };

    document.getElementById('exportBtn').onclick = function () {
      openModal('데이터 추출 중...');
      parent.postMessage({ pluginMessage: { type: 'export' } }, '*');
    };

    function openModal(title) {
      document.getElementById('modalTitle').textContent = title;
      errorLogs = []; qaLogs = [];
      contentError.innerHTML = ''; contentQA.innerHTML = '';
      updateBadges();
      closeModalBtn.disabled = true;
      statusBadge.className = 'status-badge running';
      statusBadge.innerHTML = '<span class="spinner"></span>진행 중';
      modalOverlay.classList.add('show');
      switchTab('qa');
    }

    function switchTab(tabId) {
      document.getElementById('tabError').classList.remove('active');
      document.getElementById('tabQA').classList.remove('active');
      contentError.classList.remove('active');
      contentQA.classList.remove('active');
      if (tabId === 'error') {
        document.getElementById('tabError').classList.add('active');
        contentError.classList.add('active');
      } else {
        document.getElementById('tabQA').classList.add('active');
        contentQA.classList.add('active');
      }
    }

    function updateBadges() {
      badgeError.textContent = errorLogs.length;
      badgeQA.textContent = qaLogs.length;
      if (errorLogs.length > 0) switchTab('error');
    }

    copyErrorBtn.onclick = function () {
      var prompt = "--- [에러 리포트] ---\n" + errorLogs.join('\n');
      copyToClipboard(prompt, '🔴 에러 브리핑 복사 완료!');
    };

    copyQABtn.onclick = function () {
      var prompt = "--- [디자인 시스템 실행 리포트] ---\n" + qaLogs.join('\n');
      copyToClipboard(prompt, '🔵 리포트 복사 완료!');
    };

    function copyToClipboard(text, successMsg) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) showToast(successMsg);
        else showToast('❌ 복사에 실패했습니다.');
      } catch (err) {
        showToast('❌ 복사 권한 에러');
      }
      document.body.removeChild(textarea);
    }

    function showToast(message) {
      toast.textContent = message; toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 2500);
    }

    closeModalBtn.onclick = function () { modalOverlay.classList.remove('show'); };

    window.onmessage = function (event) {
      var msg = event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === 'log') {
        qaLogs.push(msg.message);
        var entry = document.createElement('div');
        entry.className = 'log-entry info';
        entry.textContent = msg.message;
        contentQA.appendChild(entry);
        contentQA.scrollTop = contentQA.scrollHeight;
        updateBadges();
      }
      else if (msg.type === 'qa_log') {
        qaLogs.push("QA: " + msg.message);
        var entry = document.createElement('div');
        entry.className = 'log-entry qa';
        entry.textContent = "ℹ️ " + msg.message;
        contentQA.appendChild(entry);
        contentQA.scrollTop = contentQA.scrollHeight;
        updateBadges();
      }
      else if (msg.type === 'error') {
        var fullError = msg.message + (msg.detail ? "\n상세: " + msg.detail : "");
        errorLogs.push(fullError);
        var entry = document.createElement('div');
        entry.className = 'log-entry error';
        entry.textContent = "❌ " + fullError;
        contentError.appendChild(entry);
        contentError.scrollTop = contentError.scrollHeight;
        updateBadges();

        // 에러 발생 시 즉시 조치
        closeModalBtn.disabled = false;
        statusBadge.className = 'status-badge error';
        statusBadge.innerHTML = '⚠️ 에러 발생';
        copyErrorBtn.style.display = 'block';
        copyQABtn.style.display = 'block';
      }
      else if (msg.type === 'complete' || msg.type === 'export_complete') {
        closeModalBtn.disabled = false;
        statusBadge.className = errorLogs.length === 0 ? 'status-badge success' : 'status-badge error';
        statusBadge.innerHTML = errorLogs.length === 0 ? '✅ 완료' : '⚠️ 에러 있음';

        if (msg.type === 'export_complete') {
          document.getElementById('modalTitle').textContent = '✅ 추출 완료';
          downloadFile('EXPORTED-DESIGN.md', msg.mdContent);
          var entry = document.createElement('div');
          entry.className = 'log-entry success';
          entry.textContent = "\n✅ 디자인 시스템 데이터 추출 및 다운로드가 완료되었습니다.";
          contentQA.appendChild(entry);
          copyQABtn.style.display = 'block';
        } else if (msg.type === 'complete') {
          document.getElementById('modalTitle').textContent = '🎉 등록 완료';
          var summary = `\n--- [등록 요약] ---\n`;
          summary += `• 배리어블: Color(${msg.results.variables.colors}), Spacing(${msg.results.variables.spacing}), Radius(${msg.results.variables.radius}), Typography(${msg.results.variables.typography})\n`;
          summary += `• 스타일: Color(${msg.results.styles.color}), Text(${msg.results.styles.text}), Effect(${msg.results.styles.effect}), Grid(${msg.results.styles.grid})\n`;

          qaLogs.push(summary);
          var entry = document.createElement('div');
          entry.className = 'log-entry success';
          entry.textContent = summary + "\n🎉 모든 시스템이 성공적으로 이식되었습니다!";
          contentQA.appendChild(entry);
          contentQA.scrollTop = contentQA.scrollHeight;
          copyErrorBtn.style.display = 'block';
          copyQABtn.style.display = 'block';
        }
      }
    };
  