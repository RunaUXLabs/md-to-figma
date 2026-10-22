'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'dist/assistant');
const plugin = path.join(out, 'marketplace/plugins/md-to-figma-assistant');
const skill = path.join(plugin, 'skills/md-to-figma');
const { validate } = require(path.join(skill, 'scripts/validate-md.cjs'));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const header = '# Test\n\n## Variable Modes\n\n| Category | Collection | Token | Type | Mode | Value | Description |\n|---|---|---|---|---|---|---|\n';
const row = '| spacing | "Layout" | "gap" | FLOAT | "작은 화면" | 12 | "Gap" |\n';

test('existing integration sample and template parse with the deployed parser', () => {
  const sample = validate(fs.readFileSync(path.join(root, 'resources/FINAL-INTEGRATION-SAMPLE.md'), 'utf8'));
  assert.equal(sample.ok, true, JSON.stringify(sample.errors));
  assert.equal(sample.summary.variableRows, 42);
  assert.equal(sample.summary.variables, 21);
  assert.deepEqual(sample.summary.styles, { colorCandidates: 3, text: 2, effect: 9, grid: 4, motion: 1 });
  assert.ok(sample.warnings.some(w => w.includes('@first')));
  const template = validate(fs.readFileSync(path.join(root, 'resources/DESIGN-TEMPLATE.md'), 'utf8'));
  assert.equal(template.ok, true, JSON.stringify(template.errors));
});

test('arbitrary modes and same-named tokens in different collections remain distinct', () => {
  const report = validate(header + row + row.replace('작은 화면', '夜間').replace('12', '24') + row.replace('Layout', 'Other'));
  assert.equal(report.ok, true, JSON.stringify(report.errors));
  assert.equal(report.summary.variables, 2);
  assert.equal(report.summary.variableRows, 3);
});

test('bad identities, values and JSON are errors, not successful imports', () => {
  for (const source of [header + row + row, header + row.replace('12', '"12px"'), header + row.replace('"Layout"', 'Layout'), header + row.replace('spacing', 'invented'), header + row.replace('FLOAT', 'STRING'), '```markdown\n' + header + row + '```']) {
    assert.equal(validate(source).ok, false, source);
  }
  assert.equal(validate(header + row + row.replace('FLOAT', 'STRING').replace('12', '"Inter"').replace('작은 화면', 'Other')).ok, false);
});

test('packaged parser reports actionable errors with all runtime helpers included', () => {
  const { parseMD } = require(path.join(skill, 'scripts/parser.cjs'));
  assert.throws(() => parseMD('## Variable Modes\n| bad | row |'), /expected 7 columns/);
  assert.throws(() => parseMD(header + row.replace('"Layout"', 'Layout')), /invalid JSON cell/);
  assert.throws(() => parseMD('## Motion Styles\n| bad | row | extra |'), /Token \/ Entries/);
});

test('aliases preserve external dependencies and reject wrong types or cycles', () => {
  const aliasRow = row.replace('"gap"', '"linked"').replace('12', '{"alias":{"collection":"Layout","token":"gap"}}');
  assert.equal(validate(header + row + aliasRow).ok, true);
  const missing = validate(header + aliasRow);
  assert.equal(missing.ok, true);
  assert.deepEqual(missing.externalDependencies, [{ collection: 'Layout', token: 'gap' }]);
  assert.equal(validate(header + row.replace('FLOAT', 'STRING').replace('12', '"Regular"') + aliasRow).ok, false);
  assert.ok(validate(header + row.replace('12', '{"alias":{"collection":"Layout","token":"gap"}}')).errors.some(e => e.includes('cyclic')));
});

test('style-only documents work; noise validation and grid bindings are reviewed', () => {
  const document = '# Styles\n\n## Grid\n\n| Token | Type | Settings |\n|---|---|---|\n| square | grid | {"sectionSize":12,"boundVariables":{"sectionSize":{"alias":{"collection":"Layout","token":"gap"}}}} |\n';
  const result = validate(document);
  assert.equal(result.ok, true);
  assert.equal(result.externalDependencies.length, 1);
  const noise = '# Effects\n\n## Effects\n\n| Token | Type | Settings |\n|---|---|---|\n| grain | noise | {"blendMode":"NORMAL"} |\n';
  assert.ok(validate(noise).errors.some(e => e.includes('blendMode')));
  assert.equal(validate('# Empty').ok, false);
});

test('packaged references are exact copies; Figma skill is self contained', () => {
  const provenance = JSON.parse(fs.readFileSync(path.join(plugin, 'compatibility.json')));
  for (const [filename, digest] of Object.entries(provenance.sources)) {
    assert.equal(hash(fs.readFileSync(path.join(root, filename))), digest);
    if (filename.startsWith('resources/')) assert.equal(hash(fs.readFileSync(path.join(skill, 'assets', path.basename(filename)))), digest);
  }
  const native = fs.readFileSync(path.join(out, 'figma/md-to-figma.md'), 'utf8');
  assert.match(native, /^---\nname: md-to-figma\n/);
  assert.doesNotMatch(native, /\]\((?:assets|references|scripts)\//);
  assert.doesNotMatch(native, /<skill-directory>/);
  assert.match(native, /no executable validator/);
  assert.match(native, /Example appendix/);
  const marketplace = JSON.parse(fs.readFileSync(path.join(out, 'marketplace/.agents/plugins/marketplace.json')));
  assert.equal(fs.existsSync(path.join(out, 'marketplace', marketplace.plugins[0].source.path, 'plugin.json')), true);
});

test('manifest local assets exist and ZIPs contain only the intended distribution', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(plugin, 'plugin.json')));
  for (const key of ['composerIcon', 'logo']) assert.ok(fs.existsSync(path.join(plugin, manifest.extensions['com.openai'].interface[key])));
  for (const filename of fs.readdirSync(out).filter(f => f.endsWith('.zip'))) {
    const buffer = fs.readFileSync(path.join(out, filename));
    assert.equal(buffer.readUInt32LE(), 0x04034b50);
    assert.equal(buffer.readUInt32LE(buffer.length - 22), 0x06054b50);
    const names = [];
    let offset = 0;
    while (buffer.readUInt32LE(offset) === 0x04034b50) {
      const size = buffer.readUInt32LE(offset + 18), length = buffer.readUInt16LE(offset + 26);
      names.push(buffer.subarray(offset + 30, offset + 30 + length).toString());
      offset += 30 + length + size;
    }
    assert.ok(names.some(n => n.endsWith('SKILL.md')));
    assert.ok(!names.some(n => /(^|\/)(manifest\.json|\.git|ui\.html|code\.js)$/.test(n)));
    if (filename.startsWith('md-to-figma-assistant-')) assert.ok(names.includes('plugin.json'));
    if (filename.includes('marketplace')) assert.ok(names.includes('.agents/plugins/marketplace.json'));
  }
});
