const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function runtime(storage) {
  const sent = [];
  const ctx = vm.createContext({ figma: { showUI() {}, ui: { postMessage(value) { sent.push(value); } }, clientStorage: storage || { async getAsync() { return 'ja'; }, async setAsync() {} } }, __html__: '' });
  vm.runInContext(fs.readFileSync('code.js', 'utf8'), ctx);
  return { ctx, sent };
}
test('all five catalogs preserve placeholders and embedded sources are current', () => {
  const catalog = JSON.parse(fs.readFileSync('i18n/messages.json', 'utf8'));
  for (const row of Object.values(catalog)) {
    assert.equal(row.length, 5);
    const slots = s => (s.match(/\{\d+\}/g) || []).sort();
    row.forEach(s => { assert.ok(s); assert.deepEqual(slots(s), slots(row[1])); });
  }
  const common = 'var I18N_MESSAGES = ' + JSON.stringify(catalog) + ';\n' + fs.readFileSync('i18n/runtime.js', 'utf8').trimEnd();
  for (const filename of ['code.js', 'ui.html']) assert.ok(fs.readFileSync(filename, 'utf8').includes(common));
  assert.ok(fs.readFileSync('ui.html', 'utf8').includes(fs.readFileSync('i18n/ui.js', 'utf8').trimEnd()));
});
test('language detection handles regional locales, preference order and unsupported scripts', () => {
  const { ctx } = runtime();
  for (const [input, expected] of [[['ko-KR'],'ko'],[['ja-JP'],'ja'],[['es-MX'],'es'],[['zh-Hans-SG'],'zh-CN'],[['zh'],'zh-CN'],[['fr-FR','es-ES'],'es'],[['zh-TW','ja'],'ja'],[['zh-Hant-CN'],'en'],[[],'en']]) assert.equal(ctx.detectLanguage(input), expected);
});
test('nested known errors localize while raw errors and user names stay byte-for-byte intact', () => {
  const { ctx } = runtime();
  const token = '<script>名前/{0}/토큰</script>';
  const raw = 'Unexpected property: blendMode at index 0';
  const value = ctx.localizedMessage('styleSkip', [ctx.localizedMessage('effect'), token, ctx.errorDetail(Error(raw))]);
  for (const lang of ['ko','en','ja','zh-CN','es']) {
    const output = ctx.formatMessage(value, lang);
    assert.ok(output.includes(token)); assert.ok(output.includes(raw));
    assert.notEqual(ctx.formatMessage(ctx.errorDetail(ctx.messageError('columns')), lang), 'columns');
  }
  assert.equal(ctx.formatMessage(ctx.localizedMessage('created', ['A', 0]), 'en'), 'Created 0 tokens in collection A.');
});
test('language storage loads, saves valid choices and reports failures without throwing', async () => {
  const fresh = runtime({ async getAsync() { return undefined; } });
  await fresh.ctx.figma.ui.onmessage({ type:'get_language' });
  assert.equal(fresh.sent[0].language, 'auto');
  let saved;
  const { ctx, sent } = runtime({ async getAsync() { return 'es'; }, async setAsync(key, value) { saved = [key,value]; } });
  await ctx.figma.ui.onmessage({ type:'get_language' });
  assert.equal(sent[0].language, 'es');
  await ctx.figma.ui.onmessage({ type:'set_language', language:'zh-CN' });
  assert.deepEqual(saved,['ui-language','zh-CN']);
  await ctx.figma.ui.onmessage({ type:'set_language', language:'invalid' });
  assert.deepEqual(saved,['ui-language','zh-CN']);
  const failed = runtime({ async getAsync() { throw Error('denied'); }, async setAsync() { throw Error('denied'); } });
  await failed.ctx.figma.ui.onmessage({ type:'get_language' });
  await failed.ctx.figma.ui.onmessage({ type:'set_language', language:'ja' });
  assert.equal(failed.sent[0].language,'auto');
  assert.equal(failed.sent[1].type,'language_save_failed');
});
test('parser failures carry a localizable reason through the plugin bridge', async () => {
  const { ctx, sent } = runtime();
  await ctx.figma.ui.onmessage({ type:'generate', content:'## Variable Modes\n| wrong | row |', options:{} });
  const failure = sent.find(m => m.type === 'error');
  assert.equal(failure.localized.key,'syncFailed');
  assert.equal(failure.detail.key,'columns');
  assert.match(ctx.formatMessage(failure.detail,'es'),/7 columnas/);
});
test('rapid language changes persist in order even when the first write is slow', async () => {
  const writes = [];
  let release;
  const { ctx } = runtime({ async setAsync(key, value) {
    if (value === 'ja') await new Promise(resolve => { release = resolve; });
    writes.push(value);
  } });
  const first = ctx.figma.ui.onmessage({ type:'set_language', language:'ja' });
  const second = ctx.figma.ui.onmessage({ type:'set_language', language:'es' });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(writes, []);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(writes, ['ja', 'es']);
});
