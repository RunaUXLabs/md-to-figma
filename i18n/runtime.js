// Plain JavaScript: embedded into code.js and ui.html by scripts/build-i18n.cjs.
var I18N_LANGUAGES = ['ko', 'en', 'ja', 'zh-CN', 'es'];
function localizedMessage(key, params) { return { key: key, params: params || [] }; }
function formatMessage(value, language) {
  if (!value || typeof value !== 'object' || typeof value.key !== 'string') return String(value == null ? '' : value);
  var row = I18N_MESSAGES[value.key];
  var index = I18N_LANGUAGES.indexOf(language);
  var template = row ? (row[index] || row[1]) : value.key;
  return template.replace(/\{(\d+)\}/g, function (_, n) {
    return formatMessage((value.params || [])[Number(n)], language);
  });
}
function messageError(key, params) {
  var error = new Error(formatMessage(localizedMessage(key, params), 'en'));
  error.localized = localizedMessage(key, params);
  return error;
}
function errorDetail(error) {
  return error && error.localized ? error.localized : String(error && error.message !== undefined ? error.message : error);
}
function detectLanguage(languages) {
  for (var i = 0; i < languages.length; i++) {
    var tag = String(languages[i]).toLowerCase().replace(/_/g, '-');
    var base = tag.split('-')[0];
    // Traditional Chinese is not shipped yet; continue to the next preferred language.
    if (base === 'zh') {
      if (tag.indexOf('hant') !== -1 || /-(tw|hk|mo)(-|$)/.test(tag)) continue;
      return 'zh-CN';
    }
    if (I18N_LANGUAGES.indexOf(base) !== -1) return base;
  }
  return 'en';
}
