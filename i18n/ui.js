var activeLanguage = 'en';
var languageTouched = false;
var languagePreference = 'auto';
var reportEntries = [];
var runState = 'running';
var reportTitle = 'report';
var busy = false;
var toastTimer;
var STATUS_ICONS = {
      running: '<svg class="ic spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
      success: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" opacity="0.8"/><path d="m9 12 2 2 4-4"/></svg>',
      error: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><g opacity="0.8"><path d="M12 9v4"/><path d="M12 17h.01"/></g></svg>'
    };
function t(key, params) { return formatMessage(localizedMessage(key, params), activeLanguage); }
function el(id) { return document.getElementById(id); }
function post(value) { parent.postMessage({ pluginMessage: value }, '*'); }

function buildRegistrationSummary(results) {
  var summary = '\n--- [' + t('summary') + '] ---\n';
  var variables = results.variables;
  var scanned = variables.scanned || {};
  var variableItems = [];
  ['colors', 'spacing', 'radius', 'typography', 'motion'].forEach(function (key) {
    var applied = variables[key] || 0;
    var total = scanned[key];
    if (applied > 0 || total > 0) variableItems.push(t(key) + '(' + applied + (total === undefined ? '' : '/' + total) + ')');
  });
  var styles = results.styles;
  var styleItems = [];
  ['color', 'text', 'effect', 'grid', 'motion'].forEach(function (key) {
    var total = styles[key] || 0;
    var created = styles[key + 'New'];
    if (total > 0) styleItems.push(t(key) + '(' + (created === undefined ? '' : created + '/') + total + ')');
  });
  if (variableItems.length) summary += '• ' + t('varCounts') + ': ' + variableItems.join(', ') + '\n  ' + t('varNote') + '\n';
  if (styleItems.length) summary += '• ' + t('styleCounts') + ': ' + styleItems.join(', ') + '\n  ' + t('styleNote') + '\n';
  if (!variableItems.length && !styleItems.length) summary += t('noItems') + '\n';
  return summary;
}

function applyLanguage(preference) {
  languagePreference = preference === 'auto' || I18N_LANGUAGES.indexOf(preference) !== -1 ? preference : 'auto';
  activeLanguage = languagePreference === 'auto' ? detectLanguage(navigator.languages || [navigator.language || 'en']) : languagePreference;
  document.documentElement.lang = activeLanguage;
  Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (node) { node.textContent = t(node.getAttribute('data-i18n')); });
  el('openSkillBtn').title = t('skillTitle');
  el('mdContent').setAttribute('aria-label', 'DESIGN.md');
  el('languageSelect').value = languagePreference;
  el('reportLanguageSelect').value = languagePreference;
  hideOptionHelp();
  renderReport();
}
function selectLanguage(event) {
  languageTouched = true;
  applyLanguage(event.target.value);
  post({ type: 'set_language', language: languagePreference });
}
function entryText(entry) {
  if (entry.results) return buildRegistrationSummary(entry.results);
  var text = formatMessage(entry.localized || entry.message, activeLanguage);
  if (entry.detail) text += '\n' + t('detail') + ': ' + formatMessage(entry.detail, activeLanguage);
  return text;
}
function renderReport() {
  el('contentQA').textContent = '';
  el('contentError').textContent = '';
  var errors = 0;
  var qa = 0;
  reportEntries.forEach(function (entry) {
    var node = document.createElement('div');
    var isError = entry.type === 'error';
    node.className = 'log-entry ' + (isError ? 'error' : entry.type === 'qa_log' ? 'qa' : entry.results || entry.logType === 'success' ? 'success' : 'info');
    node.textContent = entryText(entry);
    el(isError ? 'contentError' : 'contentQA').appendChild(node);
    if (isError) errors++; else qa++;
  });
  el('badgeQA').textContent = qa;
  el('badgeError').textContent = errors;
  el('modalTitle').textContent = t(reportTitle);
  var status = runState === 'running' ? 'running' : errors ? 'error' : 'success';
  el('statusBadge').className = 'status-badge ' + status;
  el('statusBadge').innerHTML = STATUS_ICONS[status];
  var statusText = document.createElement('span');
  statusText.textContent = t(runState === 'running' ? 'running' : errors ? 'hasErrors' : 'done');
  el('statusBadge').appendChild(statusText);
  el('closeModalBtn').disabled = busy;
  el('copyErrorBtn').style.display = errors ? 'block' : 'none';
  el('copyQABtn').style.display = qa ? 'block' : 'none';
}
function switchTab(tabId) {
  ['QA', 'Error'].forEach(function (name) {
    el('tab' + name).classList.toggle('active', name.toLowerCase() === tabId);
    el('content' + name).classList.toggle('active', name.toLowerCase() === tabId);
  });
}
function openModal(title) {
  hideOptionHelp();
  reportTitle = title;
  reportEntries = [];
  runState = 'running';
  busy = true;
  el('generateBtn').disabled = true;
  el('exportBtn').disabled = true;
  renderReport();
  switchTab('qa');
  el('modalOverlay').classList.add('show');
}
function finishRun() {
  busy = false;
  runState = 'done';
  el('generateBtn').disabled = false;
  el('exportBtn').disabled = false;
}
function showToast(key) {
  clearTimeout(toastTimer);
  el('toast').textContent = t(key);
  el('toast').classList.add('show');
  toastTimer = setTimeout(function () { el('toast').classList.remove('show'); }, 2500);
}
function downloadFile(filename, content) {
  var url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }));
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  showToast('downloaded');
}
function copyReport(errors) {
  var text = '--- [' + t(errors ? 'errorReport' : 'report') + '] ---\n' + reportEntries.filter(function (entry) { return (entry.type === 'error') === errors; }).map(entryText).join('\n');
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try { showToast(document.execCommand('copy') ? 'copied' : 'copyFailed'); }
  catch (error) { showToast('copyFailed'); }
  document.body.removeChild(textarea);
}
// The report has its own selector so language can be changed without closing it.
var reportLanguageRow = document.createElement('div');
reportLanguageRow.className = 'language-row';
var reportLanguageLabel = document.createElement('label');
reportLanguageLabel.htmlFor = 'reportLanguageSelect';
reportLanguageLabel.setAttribute('data-i18n', 'language');
var reportLanguageSelect = el('languageSelect').cloneNode(true);
reportLanguageSelect.id = 'reportLanguageSelect';
reportLanguageRow.appendChild(reportLanguageLabel);
reportLanguageRow.appendChild(reportLanguageSelect);
document.querySelector('.modal-header').appendChild(reportLanguageRow);
el('languageSelect').onchange = selectLanguage;
reportLanguageSelect.onchange = selectLanguage;
el('downloadTemplateBtn').onclick = function () { downloadFile('DESIGN-TEMPLATE.md', TEMPLATE_MD); };
el('downloadGuideBtn').onclick = function () { downloadFile('AI-PROMPT-GUIDE.md', AI_PROMPT_GUIDE); };
el('openSkillBtn').onclick = function () { post({ type: 'open_skill' }); };
el('copyErrorBtn').onclick = function () { copyReport(true); };
el('copyQABtn').onclick = function () { copyReport(false); };
el('closeModalBtn').onclick = function () { el('modalOverlay').classList.remove('show'); };
el('generateBtn').onclick = function () {
  if (busy) return;
  var content = el('mdContent').value.trim();
  if (!content) { showToast('empty'); return; }
  var options = { variables: {}, styles: {} };
  ['Colors', 'Spacing', 'Radius', 'Typography', 'Motion'].forEach(function (name) { options.variables[name.toLowerCase()] = el('optVar' + name).checked; });
  ['Color', 'Text', 'Effect', 'Grid', 'Motion'].forEach(function (name) { options.styles[name.toLowerCase()] = el('opt' + name + 'Styles').checked; });
  openModal('generating');
  post({ type: 'generate', content: content, options: options });
};
el('exportBtn').onclick = function () {
  if (busy) return;
  openModal('exporting');
  post({ type: 'export' });
};
window.onmessage = function (event) {
  var msg = event.data && event.data.pluginMessage;
  if (!msg) return;
  if (msg.type === 'language') { if (!languageTouched) applyLanguage(msg.language); return; }
  if (msg.type === 'language_save_failed') { showToast('saveFailed'); return; }
  if (msg.type === 'log' || msg.type === 'qa_log' || msg.type === 'error') {
    reportEntries.push(msg);
    if (msg.type === 'error') { finishRun(); reportTitle = 'errorReport'; switchTab('error'); }
  } else if (msg.type === 'complete' || msg.type === 'export_complete') {
    finishRun();
    reportTitle = msg.type === 'complete' ? 'generated' : 'exported';
    if (msg.type === 'complete') reportEntries.push({ type: 'log', results: msg.results });
    else {
      reportEntries.push({ type: 'log', logType: 'success', localized: localizedMessage('exportDone') });
      downloadFile('EXPORTED-DESIGN.md', msg.mdContent);
    }
  } else return;
  renderReport();
  el('contentQA').scrollTop = el('contentQA').scrollHeight;
  el('contentError').scrollTop = el('contentError').scrollHeight;
};
// Labels stay in English; descriptions follow the selected UI language.
var helpTimer;
var visibleHelp;
function hideOptionHelp() {
  clearTimeout(helpTimer);
  if (visibleHelp) visibleHelp.hidden = true;
  visibleHelp = null;
}
function scheduleHideHelp() { helpTimer = setTimeout(hideOptionHelp, 120); }
Array.prototype.forEach.call(document.querySelectorAll('.option-item'), function (item) {
  var input = item.querySelector('input');
  var label = item.querySelector('label');
  var key = 'help' + input.id.slice(3);
  var help = document.createElement('div');
  help.id = input.id + 'Help';
  help.className = 'option-help';
  help.setAttribute('role', 'tooltip');
  help.setAttribute('data-i18n', key);
  help.hidden = true;
  document.body.appendChild(help);
  input.setAttribute('aria-describedby', help.id);
  function showHelp() {
    hideOptionHelp();
    visibleHelp = help;
    help.hidden = false;
    var rect = label.getBoundingClientRect();
    var width = help.offsetWidth;
    var height = help.offsetHeight;
    help.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + 'px';
    help.style.top = (rect.top >= height + 16 ? rect.top - height - 8 : Math.min(rect.bottom + 8, window.innerHeight - height - 8)) + 'px';
  }
  label.addEventListener('mouseenter', showHelp);
  label.addEventListener('mouseleave', scheduleHideHelp);
  input.addEventListener('focus', showHelp);
  input.addEventListener('blur', hideOptionHelp);
  help.addEventListener('mouseenter', function () { clearTimeout(helpTimer); });
  help.addEventListener('mouseleave', scheduleHideHelp);
});
document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hideOptionHelp(); });
window.addEventListener('resize', hideOptionHelp);
applyLanguage('auto');
post({ type: 'get_language' });
