#!/usr/bin/env node
'use strict';
// Offline preflight only. The bundled parser is extracted from the deployed importer.
const fs = require('node:fs');
const { parseMD } = require('./parser.cjs');
const categories = new Set(['colors', 'spacing', 'radius', 'typography', 'motion']);
const types = new Set(['COLOR', 'FLOAT', 'STRING', 'BOOLEAN', 'TIMING', 'EASING']);
const identity = (collection, token) => JSON.stringify([collection, token]);
const rowIdentity = r => JSON.stringify([r.collection, r.token, r.mode]);
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const alias = v => object(v) && Object.hasOwn(v, 'alias');
const color = v => object(v) && ['r', 'g', 'b', 'a'].every(k => Number.isFinite(v[k]) && v[k] >= 0 && v[k] <= 1);

function validate(content) {
  const errors = [], warnings = [], dependencies = new Map();
  const warn = message => { if (!warnings.includes(message)) warnings.push(message); };
  let parsed;
  try { parsed = parseMD(content); }
  catch (e) { return { ok: false, errors: ['Importer parse: ' + e.message], warnings, summary: null }; }
  if (/^\s*```/m.test(content)) errors.push('Remove code fences from the importable MD body.');
  // Validate rows the importer might otherwise silently skip or reinterpret.
  const headers = {
    'variable modes': ['Category', 'Collection', 'Token', 'Type', 'Mode', 'Value', 'Description'],
    typography: ['Token', 'Font', 'Size', 'Weight', 'LineHeight', 'LetterSpacing'],
    'motion styles': ['Token', 'Entries']
  };
  let section = '';
  content.split(/\r?\n/).forEach((line, i) => {
    const text = line.trim();
    if (text.startsWith('## ')) section = text.slice(3).toLowerCase();
    if (!text.startsWith('|') || /^\|\s*:?-/.test(text)) return;
    const cells = text.split('|').slice(1, -1).map(x => x.trim());
    if (!text.endsWith('|')) errors.push(`Line ${i + 1}: table needs a trailing pipe.`);
    if (cells.some(c => !c)) errors.push(`Line ${i + 1}: empty cells collapse in the importer; write an explicit value.`);
    const expected = headers[section];
    if (expected && cells.length !== expected.length) errors.push(`Line ${i + 1}: ${section} requires ${expected.length} columns.`);
    if (expected && /^(Token|Category)$/i.test(cells[0]) && cells.join('|') !== expected.join('|')) errors.push(`Line ${i + 1}: use exact ${section} header names and order.`);
    if (section !== 'variable modes' && text.includes('---')) errors.push(`Line ${i + 1}: data containing --- is skipped by this importer.`);
  });
  const rows = parsed.variableModes || [], variables = new Map(), seen = new Set(), byRow = new Map();
  for (const r of rows) {
    const label = `${r.collection}/${r.token} [${r.mode}]`;
    if (!categories.has(r.category)) errors.push(`${label}: unknown Category ${r.category}.`);
    if (!types.has(r.type)) errors.push(`${label}: unsupported Type ${r.type}.`);
    if (!['collection', 'token', 'mode'].every(k => typeof r[k] === 'string' && r[k].trim()) || typeof r.description !== 'string') errors.push(`${label}: invalid identity or description.`);
    const key = identity(r.collection, r.token), rk = rowIdentity(r);
    if (seen.has(rk)) errors.push(`${label}: duplicate mode row.`);
    seen.add(rk); byRow.set(rk, r);
    const previous = variables.get(key);
    if (previous && ['type', 'category', 'description'].some(k => previous[k] !== r[k])) errors.push(`${label}: inconsistent type, category or description across modes.`);
    variables.set(key, r);
    if (alias(r.value)) continue;
    const valid = r.type === 'COLOR' ? color(r.value)
      : r.type === 'FLOAT' ? Number.isFinite(r.value)
      : r.type === 'TIMING' ? Number.isFinite(r.value) && r.value >= 0
      : r.type === 'STRING' ? typeof r.value === 'string'
      : r.type === 'BOOLEAN' ? typeof r.value === 'boolean'
      : r.type === 'EASING' ? object(r.value) && typeof r.value.type === 'string' : false;
    if (!valid) errors.push(`${label}: invalid ${r.type} value.`);
  }
  function checkAlias(value, expected, label) {
    if (!alias(value)) return;
    const a = value.alias;
    if (!object(a) || !['collection', 'token'].every(k => typeof a[k] === 'string' && a[k].trim())) {
      errors.push(`${label}: malformed alias.`); return;
    }
    const key = identity(a.collection, a.token), target = variables.get(key);
    if (!target) {
      dependencies.set(key, a);
      warn(`${label}: external dependency ${a.collection}/${a.token}; verify it exists and its category is selected if supplied separately.`);
    } else if (expected && target.type !== expected) errors.push(`${label}: alias target is ${target.type}, expected ${expected}.`);
  }
  rows.forEach(r => checkAlias(r.value, r.type, `${r.collection}/${r.token} [${r.mode}]`));
  // Detect cycles where the exact target mode can be established from this document.
  const visiting = new Set(), done = new Set();
  function visit(r) {
    const key = rowIdentity(r);
    if (visiting.has(key)) { errors.push(`${r.collection}/${r.token} [${r.mode}]: cyclic alias.`); return; }
    if (done.has(key)) return;
    visiting.add(key);
    if (alias(r.value) && object(r.value.alias)) {
      const target = byRow.get(JSON.stringify([r.value.alias.collection, r.value.alias.token, r.mode]));
      if (target) visit(target);
    }
    visiting.delete(key); done.add(key);
  }
  rows.forEach(visit);
  function checkBindings(settings, kind, label) {
    if (!object(settings.boundVariables)) return;
    const permitted = kind === 'DROP_SHADOW' || kind === 'INNER_SHADOW' ? ['color', 'radius', 'spread', 'offsetX', 'offsetY']
      : kind === 'LAYER_BLUR' || kind === 'BACKGROUND_BLUR' ? ['radius']
      : kind === 'GRID' ? ['sectionSize']
      : kind === 'COLUMNS' || kind === 'ROWS' ? (settings.alignment === 'STRETCH' ? ['count', 'offset', 'gutterSize'] : settings.alignment === 'CENTER' ? ['count', 'sectionSize', 'gutterSize'] : ['count', 'sectionSize', 'offset', 'gutterSize']) : [];
    for (const [field, ref] of Object.entries(settings.boundVariables)) {
      if (!permitted.includes(field)) warn(`${label}: ${kind}.${field} binding is not supported by this package's documented importer path.`);
      if (!alias(ref)) errors.push(`${label}: boundVariables.${field} must contain a named alias.`);
      checkAlias(ref, field === 'color' ? 'COLOR' : 'FLOAT', `${label}.${field}`);
    }
  }
  const effectTypes = new Set(['DROP_SHADOW', 'INNER_SHADOW', 'LAYER_BLUR', 'BACKGROUND_BLUR', 'NOISE', 'TEXTURE', 'GLASS']);
  const gridTypes = new Set(['COLUMNS', 'ROWS', 'GRID']);
  for (const [kind, items, allowed] of [['effect', parsed.effects, effectTypes], ['grid', parsed.grid, gridTypes]]) {
    const names = new Set();
    for (const item of items) {
      const type = item.type.toUpperCase().replace(/-/g, '_');
      if (!allowed.has(type)) errors.push(`${kind} ${item.token}: unsupported Type ${item.type}.`);
      const group = item.type.toLowerCase().replace(/_/g, '-');
      const name = item.token.startsWith(group + '/') ? item.token : group + '/' + item.token;
      if (names.has(name)) errors.push(`${kind}: duplicate style name ${name}.`);
      names.add(name);
      if (!item.settings) { warn(`${kind} ${item.token}: legacy fields parsed; detailed settings are not checked.`); continue; }
      const entries = Array.isArray(item.settings) ? item.settings : [item.settings];
      if (!entries.length) errors.push(`${kind} ${item.token}: empty settings array.`);
      for (const entry of entries) {
        if (!object(entry)) { errors.push(`${kind} ${item.token}: settings must be an object or array of objects.`); continue; }
        const actualType = (kind === 'effect' ? entry.type : entry.pattern) || type;
        if (!allowed.has(actualType)) errors.push(`${kind} ${item.token}: unknown entry type ${actualType}.`);
        if (actualType === 'NOISE' && Object.hasOwn(entry, 'blendMode')) errors.push(`${item.token}: Noise must omit blendMode.`);
        checkBindings(entry, actualType, `${kind} ${item.token}`);
      }
    }
  }
  const textNames = new Set();
  for (const t of parsed.typography) {
    const name = t.group ? `${t.group}/${t.token}` : t.token;
    if (textNames.has(name)) errors.push(`Text: duplicate style name ${name}.`);
    textNames.add(name);
    if (/%$/.test(t.ls)) warn(`Text ${name}: percentage LetterSpacing is not reliably preserved; provide pixels.`);
  }
  const colorNames = new Map();
  for (const r of variables.values()) if (r.type === 'COLOR') {
    if (colorNames.has(r.token) && colorNames.get(r.token) !== r.collection) warn(`Color style ${r.token}: name collision across collections; review Color Styles selection.`);
    colorNames.set(r.token, r.collection);
  }
  const motionNames = new Set();
  for (const style of parsed.motionStyles) {
    if (motionNames.has(style.token)) errors.push(`Motion: duplicate style name ${style.token}.`);
    motionNames.add(style.token);
    if (!Array.isArray(style.entries) || !style.entries.length) { errors.push(`Motion ${style.token}: Entries must be a nonempty array.`); continue; }
    for (const e of style.entries) {
      if (!object(e) || typeof e.preset !== 'string' || !e.preset || !object(e.props)) { errors.push(`Motion ${style.token}: each entry needs preset and props.`); continue; }
      if (e.preset === '@first') warn(`Motion ${style.token}: @first is a test-only preset; replace it with an exported preset for production.`);
      Object.entries(e.props).forEach(([field, value]) => checkAlias(value, null, `Motion ${style.token}.${field}`));
    }
  }
  const legacyCount = ['colors', 'spacing', 'radius'].reduce((n, k) => n + parsed[k].primitive.length + parsed[k].semantic.length, 0) + parsed.motion.timing.length + parsed.motion.easing.length;
  if (parsed.variableModes === null) warn('No Variable Modes table: legacy variable semantics are not fully checked.');
  if (!rows.length && !legacyCount && !parsed.typography.length && !parsed.effects.length && !parsed.grid.length && !parsed.motionStyles.length) errors.push('No importable data detected.');
  return {
    ok: errors.length === 0, errors, warnings, externalDependencies: [...dependencies.values()],
    summary: { variableRows: rows.length, variables: variables.size, categories: [...new Set(rows.map(r => r.category))], styles: { colorCandidates: colorNames.size, text: parsed.typography.length, effect: parsed.effects.length, grid: parsed.grid.length, motion: parsed.motionStyles.length } },
    scope: 'MD syntax, unified variable identities/types/aliases and selected style structure. Fonts, complete Figma settings validation, preset availability, destination state and actual bindings require Figma verification.'
  };
}

if (require.main === module) {
  const filename = process.argv[2];
  if (!filename) { process.stderr.write('Usage: node validate-md.cjs <design.md>\n'); process.exitCode = 2; }
  else {
    try { const result = validate(fs.readFileSync(filename, 'utf8')); process.stdout.write(JSON.stringify(result, null, 2) + '\n'); process.exitCode = result.ok ? 0 : 1; }
    catch (e) { process.stderr.write(e.message + '\n'); process.exitCode = 2; }
  }
}
module.exports = { validate };
