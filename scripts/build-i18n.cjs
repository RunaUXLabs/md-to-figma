const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'i18n/messages.json'), 'utf8'));
for (const [key, row] of Object.entries(catalog)) {
  if (row.length !== 5 || row.some(text => typeof text !== 'string' || !text)) throw Error('Missing translation: ' + key);
  const slots = text => JSON.stringify((text.match(/\{\d+\}/g) || []).sort());
  if (row.some(text => slots(text) !== slots(row[1]))) throw Error('Placeholder mismatch: ' + key);
}
const common = 'var I18N_MESSAGES = ' + JSON.stringify(catalog) + ';\n' + fs.readFileSync(path.join(root, 'i18n/runtime.js'), 'utf8');
for (const name of ['code.js', 'ui.html']) {
  const filename = path.join(root, name);
  let source = fs.readFileSync(filename, 'utf8');
  const replace = (label, content) => {
    const pattern = new RegExp('// BEGIN ' + label + '[\\s\\S]*?// END ' + label);
    if (!pattern.test(source)) throw Error('Missing block: ' + name + ' / ' + label);
    source = source.replace(pattern, () => '// BEGIN ' + label + '\n' + content.trimEnd() + '\n// END ' + label);
  };
  replace('I18N', common);
  if (name === 'ui.html') replace('UI RUNTIME', fs.readFileSync(path.join(root, 'i18n/ui.js'), 'utf8'));
  fs.writeFileSync(filename, source);
}
console.log('Embedded five-language catalog and UI runtime.');
