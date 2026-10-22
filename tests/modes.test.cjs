const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function runtime() {
  let id = 0;
  const collections = [], variables = [], logs = [], paintStyles = [];
  const textStyles = [], effectStyles = [], gridStyles = [];
  const motionStyles = [];
  const figma = {
    motion: { figmaAnimationStyles() { return [{ styleId: 'preset-opacity', name: 'Opacity' }]; } },
    async getLocalCustomAnimationStylesAsync() { return motionStyles.slice(); },
    createCustomAnimationStyle() {
      const s = { id: 's' + ++id, name: '', animationEntries: [],
        async addAnimationEntryAsync(styleId, props) { const entry = { id: 'entry' + ++id, styleId, name: 'Opacity', props }; this.animationEntries.push(entry); return entry; },
        removeAnimationEntry(eid) { this.animationEntries = this.animationEntries.filter(e => e.id !== eid); },
        remove() { motionStyles.splice(motionStyles.indexOf(this), 1); }
      }; motionStyles.push(s); return s;
    },
    showUI() {}, ui: { postMessage(m) { logs.push(m); } },
    variables: {
      setBoundVariableForPaint(paint, field, variable) { return Object.assign({}, paint, { boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: variable.id } } }); },
      async getLocalVariablesAsync() { return variables.slice(); },
      async getLocalVariableCollectionsAsync() { return collections.slice(); },
      createVariableCollection(name) {
        const modeId = 'm' + ++id;
        const col = { id: 'c' + ++id, name, defaultModeId: modeId, modes: [{ modeId, name: 'Mode 1' }],
          renameMode(mid, n) { this.modes.find(m => m.modeId === mid).name = n; },
          addMode(n) { if (this.limit) throw Error('mode limit'); const mid = 'm' + ++id; this.modes.push({ modeId: mid, name: n }); return mid; }
        };
        collections.push(col); return col;
      },
      createVariable(name, col, type) {
        const v = { id: 'v' + ++id, name, variableCollectionId: col.id, resolvedType: type, description: '', valuesByMode: {},
          pluginData: {}, setPluginData(key, value) { this.pluginData[key] = value; }, getPluginData(key) { return this.pluginData[key] || ''; },
          setValueForMode(mid, value) { this.valuesByMode[mid] = value; }
        };
        variables.push(v); return v;
      }
    },
    util: { solidPaint() { return { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }; } },
    createPaintStyle() { const style = { id: 's' + ++id, remove() { paintStyles.splice(paintStyles.indexOf(this), 1); } }; paintStyles.push(style); return style; },
    async loadFontAsync() {},
    createTextStyle() { const s = { id: 's' + ++id, boundVariables: {}, setBoundVariable(field, v) { this.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: v.id }; } }; textStyles.push(s); return s; },
    createEffectStyle() { const s = { id: 's' + ++id, remove() { effectStyles.splice(effectStyles.indexOf(this), 1); } }; effectStyles.push(s); return s; },
    createGridStyle() { const s = { id: 's' + ++id }; gridStyles.push(s); return s; },
    async getLocalTextStylesAsync() { return textStyles.slice(); }, async getLocalPaintStylesAsync() { return paintStyles.slice(); },
    async getLocalEffectStylesAsync() { return effectStyles.slice(); }, async getLocalGridStylesAsync() { return gridStyles.slice(); }
  };
  const ctx = vm.createContext({ figma, __html__: '' });
  vm.runInContext(fs.readFileSync('code.js', 'utf8'), ctx);
  return { ctx, figma, collections, variables, logs, paintStyles, textStyles, effectStyles, gridStyles, motionStyles };
}
const options = { colors: true, spacing: true, radius: true, typography: true, motion: true };
test('Noise beta compatibility retries NORMAL blendMode only, preserving unsupported custom blending', async () => {
  const rt = runtime();
  const create = rt.figma.createEffectStyle;
  rt.figma.createEffectStyle = () => {
    const s = create(); let stored;
    Object.defineProperty(s, 'effects', { get() { return stored; }, set(effects) {
      if (effects.some(e => e.type === 'NOISE' && e.blendMode !== undefined)) throw Error('Unrecognized key(s) in object: blendMode at index 0');
      stored = effects;
    } });
    return s;
  };
  const parsed = rt.ctx.parseMD('## Effects\n| Token | Type | Settings |\n| grain | noise | {"noiseType":"MONOTONE","noiseSize":1,"density":0.5,"color":{"r":0,"g":0,"b":0,"a":0.2},"visible":true,"blendMode":"NORMAL"} |');
  assert.equal((await rt.ctx.createStyles(parsed, { effect: true })).effectNew, 1);
  assert.equal(rt.effectStyles[0].effects[0].blendMode, undefined);
  parsed.effects[0].settings.blendMode = 'MULTIPLY';
  assert.equal((await rt.ctx.createStyles(parsed, { effect: true })).effect, 0);
  assert.equal(rt.effectStyles[0].effects[0].density, 0.5);
});
test('Noise clients requiring blendMode receive NORMAL when omitted', async () => {
  const rt = runtime(); const create = rt.figma.createEffectStyle;
  rt.figma.createEffectStyle = () => {
    const s = create(); let stored;
    Object.defineProperty(s, 'effects', { get() { return stored; }, set(effects) {
      if (effects.some(e => e.type === 'NOISE' && e.blendMode === undefined)) throw Error('blendMode: Required'); stored = effects;
    } }); return s;
  };
  const parsed = rt.ctx.parseMD(fs.readFileSync('resources/FINAL-INTEGRATION-SAMPLE.md', 'utf8'));
  await rt.ctx.createAllVariables(parsed, options);
  assert.equal((await rt.ctx.createStyles(parsed, { effect: true })).effectNew, 9);
  assert.equal(rt.effectStyles.find(s => s.name === 'noise/grain').effects[0].blendMode, 'NORMAL');
  const md = (await rt.ctx.generateExportMD()).mdContent;
  const spacing = md.slice(md.indexOf('## Spacing'), md.indexOf('## Radius'));
  assert.ok(!spacing.includes('LetterSpacing'));
});
test('final integration sample registers all categories and reimports exported styles without duplicates', async () => {
  const rt = runtime();
  const parsed = rt.ctx.parseMD(fs.readFileSync('resources/FINAL-INTEGRATION-SAMPLE.md', 'utf8'));
  assert.equal(parsed.variableModes.length, 42);
  const vars = await rt.ctx.createAllVariables(parsed, options);
  assert.equal(rt.variables.length, 21); assert.equal(rt.collections.length, 5);
  assert.equal(vars.colors, 3); assert.equal(vars.spacing, 3); assert.equal(vars.radius, 2);
  assert.equal(vars.typography, 9); assert.equal(vars.motion, 4);
  const settings = { color: true, text: true, effect: true, grid: true, motion: true };
  const styles = await rt.ctx.createStyles(parsed, settings);
  assert.equal(styles.colorNew, 3); assert.equal(styles.textNew, 2); assert.equal(styles.effectNew, 9);
  assert.equal(styles.gridNew, 4); assert.equal(styles.motionNew, 1);
  const repeated = await rt.ctx.createAllVariables(parsed, options);
  assert.equal(repeated.colors + repeated.spacing + repeated.radius + repeated.typography + repeated.motion, 0);
  const md = (await rt.ctx.generateExportMD()).mdContent;
  const imported = rt.ctx.parseMD(md);
  await rt.ctx.createAllVariables(imported, options);
  const reimport = await rt.ctx.createStyles(imported, settings);
  assert.equal(reimport.colorNew + reimport.textNew + reimport.effectNew + reimport.gridNew + reimport.motionNew, 0);
  const dst = runtime();
  dst.figma.variables.createVariableCollection('Unrelated');
  const fresh = dst.ctx.parseMD(md);
  await dst.ctx.createAllVariables(fresh, options);
  const recreated = await dst.ctx.createStyles(fresh, settings);
  assert.equal(recreated.colorNew, 3); assert.equal(recreated.textNew, 2); assert.equal(recreated.effectNew, 9);
  assert.equal(recreated.gridNew, 4); assert.equal(recreated.motionNew, 1);
});
test('downloaded template matches resource and registers only defined variables and styles', async () => {
  const ui = fs.readFileSync('ui.html', 'utf8');
  const match = ui.match(/var TEMPLATE_MD = ("[^\n]*");/);
  assert.ok(match);
  const template = fs.readFileSync('resources/DESIGN-TEMPLATE.md', 'utf8');
  assert.equal(JSON.parse(match[1]), template);
  const rt = runtime();
  const parsed = rt.ctx.parseMD(template);
  assert.equal(parsed.variableModes.length, 10);
  assert.equal(parsed.motionStyles.length, 0);
  await rt.ctx.createAllVariables(parsed, options);
  assert.equal(rt.variables.length, 8);
  const styles = await rt.ctx.createStyles(parsed, { color: true, text: true, effect: true, grid: true, motion: true });
  assert.equal(styles.colorNew, 2); assert.equal(styles.textNew, 1);
  assert.equal(styles.effectNew, 2); assert.equal(styles.gridNew, 3);
  assert.equal(styles.motion, 0);
  assert.equal(rt.textStyles[0].name, 'body');
  assert.ok(rt.textStyles[0].boundVariables.fontFamily);
  assert.ok(rt.textStyles[0].boundVariables.fontStyle);
  assert.ok(rt.effectStyles[0].effects[0].boundVariables.radius);
  assert.ok(rt.gridStyles[0].layoutGrids[0].boundVariables.gutterSize);
});
test('summary shows processed categories, unchanged checks and empty result accurately', () => {
  const script = fs.readFileSync('ui.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  const ctx = vm.createContext({});
  vm.runInContext(script.slice(0, script.indexOf('    var TEMPLATE_MD')), ctx);
  const uiRuntime = fs.readFileSync('i18n/ui.js', 'utf8');
  vm.runInContext(uiRuntime.slice(0, uiRuntime.indexOf('function applyLanguage')), ctx);
  ctx.activeLanguage = 'en';
  const results = { variables: { colors: 3, scanned: { colors: 3 } }, styles: { text: 0, effect: 0, grid: 0, color: 0 } };
  const first = ctx.buildRegistrationSummary(results);
  assert.match(first, /Colors\(3\/3\)/);
  assert.doesNotMatch(first, /스타일|Motion|Spacing|Radius|Typography/);
  results.variables.colors = 0;
  assert.match(ctx.buildRegistrationSummary(results), /Colors\(0\/3\)/);
  results.variables.scanned.colors = 0;
  assert.match(ctx.buildRegistrationSummary(results), /No items processed/);
  results.styles.text = 2; results.styles.textNew = 0;
  const styles = ctx.buildRegistrationSummary(results);
  assert.match(styles, /Text\(0\/2\)/);
  assert.doesNotMatch(styles, /배리어블|Effect|Grid/);
});
test('explicit typography groups preserve case; optional binding failures do not block fonts', async () => {
  const rt = runtime();
  const parsed = rt.ctx.parseMD('## Typography\n### Body\n| Token | Font | Size | Weight | LineHeight | LetterSpacing |\n| md | Inter | 16px | 700 | 24px | 1px |');
  await rt.ctx.createAllVariables(parsed, options);
  const create = rt.figma.createTextStyle;
  rt.figma.createTextStyle = () => {
    const s = create(); const bind = s.setBoundVariable;
    s.setBoundVariable = function(field, variable) { if (field === 'lineHeight') throw Error('unsupported'); bind.call(this, field, variable); };
    return s;
  };
  await rt.ctx.createStyles(parsed, { text: true });
  const style = rt.textStyles[0];
  assert.equal(style.name, 'Body/md');
  assert.ok(style.boundVariables.fontFamily);
  assert.ok(style.boundVariables.fontStyle);
  assert.ok(style.boundVariables.fontSize);
  assert.ok(style.boundVariables.letterSpacing);
});
test('all modes, exact names, alpha, forward/cross-collection aliases round trip', async () => {
  const src = runtime();
  for (const name of ['Color', 'Spacing', 'Typography']) {
    const col = src.figma.variables.createVariableCollection(name);
    col.renameMode(col.defaultModeId, 'Dark'); col.addMode('Light'); col.addMode('High contrast');
    const type = name === 'Color' ? 'COLOR' : name === 'Spacing' ? 'FLOAT' : 'STRING';
    const v = src.figma.variables.createVariable('same/token', col, type);
    v.description = 'quote " pipe | newline\n';
    col.modes.forEach((m, i) => v.setValueForMode(m.modeId, type === 'COLOR' ? { r: 0.12345, g: i / 3, b: 0.6, a: 0.25 } : type === 'FLOAT' ? i + 0.125 : 'Font ' + i));
  }
  const alias = src.figma.variables.createVariable('semantic/forward', src.collections[0], 'COLOR');
  src.collections[0].modes.forEach(m => alias.setValueForMode(m.modeId, { type: 'VARIABLE_ALIAS', id: src.variables[0].id }));
  const exported = await src.ctx.generateExportMD();
  const dst = runtime();
  await dst.ctx.createAllVariables(dst.ctx.parseMD(exported.mdContent), options);
  assert.equal((await dst.ctx.generateExportMD()).mdContent, exported.mdContent);
  const repeat = await dst.ctx.createAllVariables(dst.ctx.parseMD(exported.mdContent), options);
  assert.equal(repeat.colors + repeat.spacing + repeat.typography, 0);
  assert.equal(dst.variables.length, 4);
});
test('named mode matching preserves unlisted modes and mode limits never overwrite', async () => {
  const rt = runtime(); const col = rt.figma.variables.createVariableCollection('Spacing');
  col.renameMode(col.defaultModeId, 'Desktop'); col.addMode('Mobile');
  const v = rt.figma.variables.createVariable('gap', col, 'FLOAT');
  v.setValueForMode(col.defaultModeId, 24); v.setValueForMode(col.modes[1].modeId, 8);
  col.limit = true;
  await rt.ctx.syncVariableModes([
    { category: 'spacing', collection: 'Spacing', token: 'gap', type: 'FLOAT', mode: 'Mobile', value: 12, description: '' },
    { category: 'spacing', collection: 'Spacing', token: 'gap', type: 'FLOAT', mode: 'Tablet', value: 16, description: '' }
  ], options);
  assert.equal(v.valuesByMode[col.defaultModeId], 24);
  assert.equal(v.valuesByMode[col.modes[1].modeId], 12);
  assert.ok(rt.logs.some(m => /mode limit/.test(m.message)));
});
test('legacy Light/Dark follows names instead of order; primitive does not flatten modes', async () => {
  const rt = runtime(); const col = rt.figma.variables.createVariableCollection('Color');
  col.renameMode(col.defaultModeId, 'Dark'); col.addMode('Light'); col.addMode('Other');
  const v = rt.figma.variables.createVariable('primitive/red', col, 'COLOR');
  v.setValueForMode(col.modes[2].modeId, { r: 0.5, g: 0, b: 0 });
  const parsed = rt.ctx.parseMD('## Colors\n### Primitive\n| Token | Value | Description |\n| red | #ff0000 | red |\n### Semantic\n| Token | Light | Dark | Description |\n| surface | #ffffff | #000000 | x |');
  await rt.ctx.createAllVariables(parsed, options);
  const surface = rt.variables.find(v => v.name === 'semantic/surface');
  assert.equal(surface.valuesByMode[col.defaultModeId].r, 0);
  assert.equal(surface.valuesByMode[col.modes[1].modeId].r, 1);
  assert.equal(v.valuesByMode[col.modes[2].modeId].r, 0.5);
});
