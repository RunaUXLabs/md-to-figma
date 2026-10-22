#!/usr/bin/env node
'use strict';
// Node.js 18+. Build only new distribution files; never modify deployed inputs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'assistant');
const relativeOutput = path.relative(root, output);
if (!relativeOutput || relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) throw new Error('Build output must remain inside this repository.');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'plugin.json'), 'utf8'));
const name = manifest.name, version = manifest.version;
const marketplaceRoot = path.join(output, 'marketplace');
const pluginRoot = path.join(marketplaceRoot, 'plugins', name);
const skillRoot = path.join(pluginRoot, 'skills', 'md-to-figma');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
const json = value => JSON.stringify(value, null, 2) + '\n';

// The dedicated generated subtree can be rebuilt; refuse symlinked output paths.
for (const location of [path.join(root, 'dist'), output]) {
  if (fs.existsSync(location) && fs.lstatSync(location).isSymbolicLink()) throw new Error('Refusing symlinked build output: ' + location);
}
if (fs.existsSync(output)) fs.rmSync(output, { recursive: true });
write(path.join(pluginRoot, 'plugin.json'), json(manifest));
fs.cpSync(path.join(__dirname, 'skill'), skillRoot, { recursive: true });
fs.mkdirSync(path.join(pluginRoot, 'assets'), { recursive: true });
fs.copyFileSync(path.join(root, 'resources', 'Icon_v2.png'), path.join(pluginRoot, 'assets', 'icon.png'));
const inputs = ['code.js', 'resources/DESIGN-TEMPLATE.md', 'resources/AI-PROMPT-GUIDE.md', 'resources/FINAL-INTEGRATION-SAMPLE.md'];
for (const file of inputs.slice(1)) write(path.join(skillRoot, 'assets', path.basename(file)), fs.readFileSync(path.join(root, file)));
const runtime = read('code.js');
const start = runtime.indexOf('function parseMD(content) {');
const end = runtime.indexOf('\nasync function getOrCreateCollection', start);
if (start === -1 || end === -1) throw new Error('Importer parser boundary changed; review the extraction before building.');
const parser = runtime.slice(start, end).trim();
const localization = runtime.match(/\/\/ BEGIN I18N\r?\n([\s\S]*?)\/\/ END I18N/);
if (!localization) throw new Error('Importer message helpers are missing. Run scripts/build-i18n.cjs first.');
write(path.join(skillRoot, 'scripts', 'parser.cjs'), "'use strict';\n// Generated from the Figma runtime with its structured error helpers.\n" + localization[1] + '\n' + parser + '\nmodule.exports = { parseMD };\n');
const provenance = {
  packageVersion: version,
  compatibleImporter: '2.1.0',
  parserSHA256: sha(parser),
  sources: Object.fromEntries(inputs.map(file => [file, sha(fs.readFileSync(path.join(root, file)))]))
};
write(path.join(pluginRoot, 'compatibility.json'), json(provenance));
write(path.join(pluginRoot, 'README.md'), fs.readFileSync(path.join(__dirname, 'PACKAGE-README.md')));
write(path.join(pluginRoot, 'DATA-HANDLING.md'), fs.readFileSync(path.join(__dirname, 'DATA-HANDLING.md')));
write(path.join(marketplaceRoot, '.agents', 'plugins', 'marketplace.json'), json({
  name: 'runa-md-to-figma',
  interface: { displayName: 'MD to Figma' },
  plugins: [{ name, source: { source: 'local', path: './plugins/' + name }, policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Productivity' }]
}));

// Figma supports one Markdown file, so compile references inline and remove local-only steps.
let nativeSkill = read('integrations/skill/SKILL.md')
  .replace(/^2\. Read .*$/m, '2. Read the inline Format reference below. The Example appendix is test data only: use its field structure when relevant, never its values as user data.')
  .replace(/^5\. Check .*$/m, '5. Review the complete MD against the inline reference, including mode identities, JSON, duplicate rows, aliases and style definitions. This single-file Figma skill contains no executable validator. Explain unresolved dependencies and say the review is manual; do not claim a script was run or that Figma runtime validation passed.');
nativeSkill += '\n\n# Format reference (inline)\n\n' + read('integrations/skill/references/format.md')
  .replace('The existing integration sample', 'The Example appendix')
  .replace('The bundled preflight focuses', 'The AI plugin edition includes a preflight that focuses');
nativeSkill += '\n\n# Example appendix — explicit test data only\n\nDo not copy this example into production user output. In particular, @first is not a production preset. This appendix reproduces the existing integration sample for syntax reference.\n\n````markdown\n' + read('resources/FINAL-INTEGRATION-SAMPLE.md').trim() + '\n````\n';
const nativePath = path.join(output, 'figma', 'md-to-figma.md');
write(nativePath, nativeSkill);

// Dependency-free, deterministic ZIP (stored entries, UTF-8 paths, fixed timestamp).
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(directory, destination, prefix = '') {
  const files = [];
  function walk(dir, relative) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const next = path.join(dir, entry.name), rel = relative + entry.name;
      if (entry.isDirectory()) walk(next, rel + '/');
      else if (entry.isFile()) files.push([prefix + rel, fs.readFileSync(next)]);
      else throw new Error('Non-file in package: ' + next);
    }
  }
  walk(directory, '');
  const chunks = [], central = []; let offset = 0;
  for (const [filename, data] of files) {
    const label = Buffer.from(filename), crc = crc32(data), header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(label.length, 26);
    chunks.push(header, label, data);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20, 4); record.writeUInt16LE(20, 6); record.writeUInt16LE(0x800, 8); record.writeUInt16LE(33, 14);
    record.writeUInt32LE(crc, 16); record.writeUInt32LE(data.length, 20); record.writeUInt32LE(data.length, 24); record.writeUInt16LE(label.length, 28); record.writeUInt32LE(offset, 42);
    central.push(record, label); offset += header.length + label.length + data.length;
  }
  const end = Buffer.alloc(22), directoryData = Buffer.concat(central);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directoryData.length, 12); end.writeUInt32LE(offset, 16);
  write(destination, Buffer.concat([...chunks, directoryData, end]));
}
zip(pluginRoot, path.join(output, `${name}-${version}.zip`));
zip(skillRoot, path.join(output, `md-to-figma-skill-${version}.zip`), 'md-to-figma/');
zip(marketplaceRoot, path.join(output, `md-to-figma-marketplace-${version}.zip`));
const artifacts = fs.readdirSync(output).filter(file => file.endsWith('.zip')).map(file => [file, sha(fs.readFileSync(path.join(output, file)))]);
artifacts.push(['figma/md-to-figma.md', sha(fs.readFileSync(nativePath))]);
write(path.join(output, 'SHA256SUMS.txt'), artifacts.map(([file, digest]) => `${digest}  ${file}`).join('\n') + '\n');
console.log(`Built assistant ${version} (Figma importer 2.1.0 compatible): ${output}`);
