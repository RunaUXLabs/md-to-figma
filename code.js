/**
 * MD to Figma - v2.2.1 Stable Engine
 */

figma.showUI(__html__, { width: 500, height: 650 });

// ============================================
// [1] Helpers & Utilities
// ============================================

const sendLog = (type, message) => figma.ui.postMessage({ type: 'log', logType: type, message: message });
const sendQA = (message) => figma.ui.postMessage({ type: 'qa_log', message: message });
const sendError = (message, detail) => figma.ui.postMessage({ type: 'error', message: message, detail: detail || '' });

const rgbToHex = (color) => {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 0, g: 0, b: 0 };
};

const rgbaToString = (color) => `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${(color.a || 1).toFixed(2)})`;

const parseRgbaColor = (str) => {
  const m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  return m ? { r: parseInt(m[1])/255, g: parseInt(m[2])/255, b: parseInt(m[3])/255, a: m[4] ? parseFloat(m[4]) : 1 } : null;
};

const parseLineHeightValue = (value) => {
  const raw = String(value || '').trim();
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return 100;
  if (raw.endsWith('%')) return num;
  return num <= 10 ? num * 100 : num;
};

const parseLineHeightObj = (v) => {
  const raw = String(v || '').trim();
  const num = parseFloat(raw);
  if (isNaN(num)) return { value: 100, unit: 'PERCENT' };
  if (raw.endsWith('%')) return { value: num, unit: 'PERCENT' };
  if (raw.endsWith('px')) return { value: num, unit: 'PIXELS' };
  return num <= 10 ? { value: num * 100, unit: 'PERCENT' } : { value: num, unit: 'PIXELS' };
};

const weightMap = {
  '100': 'Thin', 'thin': 'Thin',
  '200': 'ExtraLight', 'extralight': 'ExtraLight', 'extra-light': 'ExtraLight',
  '300': 'Light', 'light': 'Light',
  '400': 'Regular', 'regular': 'Regular', 'normal': 'Regular',
  '500': 'Medium', 'medium': 'Medium', 'midium': 'Medium',
  '600': 'SemiBold', 'semibold': 'SemiBold', 'semi-bold': 'SemiBold',
  '700': 'Bold', 'bold': 'Bold',
  '800': 'ExtraBold', 'extrabold': 'ExtraBold', 'extra-bold': 'ExtraBold',
  '900': 'Black', 'black': 'Black', 'heavy': 'Black'
};
const resolveFontStyle = (w) => weightMap[String(w || '').trim().toLowerCase()] || 'Regular';

// ============================================
// [2] MD Parser
// ============================================

function parseMD(content) {
  const res = { colors: { primitive: [], semantic: [] }, spacing: { primitive: [], semantic: [] }, radius: { primitive: [], semantic: [] }, typography: [], effects: [], grid: [] };
  const lines = content.split('\n');
  let sec = '', sub = '', typoGroup = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) { sec = line.replace('## ', '').toLowerCase(); sub = ''; typoGroup = ''; continue; }
    if (line.startsWith('### ')) { 
      const name = line.replace('### ', '');
      if (sec === 'typography') typoGroup = name.toLowerCase();
      else sub = name.toLowerCase();
      continue;
    }
    if (line.startsWith('|') && !line.includes('---')) {
      const c = line.split('|').map(x => x.trim()).filter(x => x !== '');
      if (c.length < 2 || c[0].toLowerCase() === 'token') continue;
      
      if (sec === 'colors') {
        if (sub === 'primitive') res.colors.primitive.push({ token: c[0], value: c[1] || '#000000', desc: c[2] || '' });
        else if (sub === 'semantic') res.colors.semantic.push({ token: c[0], light: c[1] || '', dark: c[2] || c[1] || '', desc: c[3] || '' });
      } else if (sec === 'spacing' || sec === 'radius') {
        const target = res[sec][sub];
        if (target) {
          if (sub === 'primitive') target.push({ token: c[0], value: c[1] || '0px', desc: c[2] || '' });
          else if (sub === 'semantic') target.push({ token: c[0], alias: c[1] || '', desc: c[2] || '' });
        }
      } else if (sec === 'typography') {
        res.typography.push({ token: c[0], font: c[1] || 'Inter', size: c[2] || '16px', weight: c[3] || 'Regular', lineHeight: c[4] || '100%', ls: c[5] || '0', group: typoGroup });
      } else if (sec === 'effects') {
        res.effects.push({ token: c[0], type: c[1] || 'drop-shadow', color: c[2] || 'rgba(0,0,0,0.1)', x: c[3] || '0', y: c[4] || '0', blur: c[5] || '0', spread: c[6] || '0' });
      } else if (sec === 'grid') {
        res.grid.push({ token: c[0], type: c[1] || 'columns', count: c[2] || '1', width: c[3] || 'auto', gutter: c[4] || '0', margin: c[5] || '0', align: c[6] || 'stretch' });
      }
    }
  }
  return res;
}

// ============================================
// [3] Variables Creation
// ============================================

async function getOrCreateCollection(name) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  for (let c of cols) if (c.name.toLowerCase() === name.toLowerCase()) return c;
  return figma.variables.createVariableCollection(name);
}

async function createAllVariables(parsed, options) {
  const results = { colors: 0, spacing: 0, radius: 0, typography: 0 };
  const allExisting = await figma.variables.getLocalVariablesAsync();
  const existingMap = new Map();
  allExisting.forEach(v => existingMap.set(v.variableCollectionId + ":" + v.name, v));

  if (options.colors) {
    const col = await getOrCreateCollection('Color');
    let hasDark = parsed.colors.semantic.some(s => s.dark && s.dark !== s.light);
    let lId = col.modes[0].modeId;
    let dId = col.modes.length > 1 ? col.modes[1].modeId : (hasDark ? col.addMode('Dark') : null);
    if (!col.modes[0].name.toLowerCase().includes('light')) col.renameMode(lId, 'Light');

    const primMap = new Map();
    for (let p of parsed.colors.primitive) {
      const name = "primitive/" + p.token;
      let v = existingMap.get(col.id + ":" + name) || figma.variables.createVariable(name, col, 'COLOR');
      v.setValueForMode(lId, hexToRgb(p.value));
      if (dId) v.setValueForMode(dId, hexToRgb(p.value));
      primMap.set(p.token, v);
      results.colors++;
    }
    for (let s of parsed.colors.semantic) {
      const name = "semantic/" + s.token;
      let v = existingMap.get(col.id + ":" + name) || figma.variables.createVariable(name, col, 'COLOR');
      const getAlias = (ref) => primMap.get(ref) ? { type: 'VARIABLE_ALIAS', id: primMap.get(ref).id } : null;
      if (getAlias(s.light)) v.setValueForMode(lId, getAlias(s.light));
      if (dId) v.setValueForMode(dId, getAlias(s.dark) || getAlias(s.light));
      results.colors++;
    }
  }

  const processNumCol = async (data, colName) => {
    if (!data.primitive.length && !data.semantic.length) return 0;
    const col = await getOrCreateCollection(colName);
    const mId = col.modes[0].modeId;
    const pMap = new Map();
    let count = 0;
    for (let p of data.primitive) {
      const name = "primitive/" + p.token;
      let v = existingMap.get(col.id + ":" + name) || figma.variables.createVariable(name, col, 'FLOAT');
      v.setValueForMode(mId, parseFloat(p.value));
      pMap.set(p.token, v);
      count++;
    }
    for (let s of data.semantic) {
      const name = "semantic/" + s.token;
      let v = existingMap.get(col.id + ":" + name) || figma.variables.createVariable(name, col, 'FLOAT');
      if (pMap.get(s.alias)) v.setValueForMode(mId, { type: 'VARIABLE_ALIAS', id: pMap.get(s.alias).id });
      count++;
    }
    return count;
  };

  if (options.spacing) results.spacing = await processNumCol(parsed.spacing, 'Spacing');
  if (options.radius) results.radius = await processNumCol(parsed.radius, 'Radius');

  if (options.typography && parsed.typography.length) {
    const col = await getOrCreateCollection('Typography');
    const mId = col.modes[0].modeId;
    const fontMapVar = new Map();
    const weightMapVar = new Map();

    const ensureDefault = (sub, val) => {
      const fName = sub + "/" + val;
      if (!existingMap.has(col.id + ":" + fName)) {
        let v = figma.variables.createVariable(fName, col, 'STRING');
        v.setValueForMode(mId, val);
        results.typography++;
      }
    };
    ensureDefault("fontFamily", "Inter");
    ensureDefault("fontStyle", "Regular");

    for (let t of parsed.typography) {
      const base = (t.group ? t.group + "/" : "") + t.token;
      if (t.font && !fontMapVar.has(t.font)) {
        const fName = "fontFamily/" + t.font;
        let fv = existingMap.get(col.id + ":" + fName) || figma.variables.createVariable(fName, col, 'STRING');
        fv.setValueForMode(mId, t.font);
        fontMapVar.set(t.font, fv);
        results.typography++;
      }
      const fStyle = resolveFontStyle(t.weight);
      if (fStyle && !weightMapVar.has(fStyle)) {
        const wName = "fontStyle/" + fStyle;
        let wv = existingMap.get(col.id + ":" + wName) || figma.variables.createVariable(wName, col, 'STRING');
        wv.setValueForMode(mId, fStyle);
        weightMapVar.set(fStyle, wv);
        results.typography++;
      }
      const add = (sub, val, type) => {
        const name = base + "/" + sub;
        let v = existingMap.get(col.id + ":" + name) || figma.variables.createVariable(name, col, type);
        const parsedVal = sub === 'lineHeight' ? parseLineHeightValue(val) : parseFloat(val);
        v.setValueForMode(mId, parsedVal);
        results.typography++;
      };
      add('fontSize', t.size, 'FLOAT');
      add('lineHeight', t.lineHeight, 'FLOAT');
      if (t.ls && t.ls !== '0' && t.ls !== '0px') add('letterSpacing', t.ls, 'FLOAT');
    }
  }
  return results;
}

// ============================================
// [4] Styles Creation
// ============================================

async function createStyles(parsed, options) {
  const results = { text: 0, effect: 0, grid: 0, color: 0 };
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMap = new Map();
  allVars.forEach(v => varMap.set(v.name, v));

  if (options.text) {
    const existingTextStyles = await figma.getLocalTextStylesAsync();
    const textStyleMap = new Map();
    existingTextStyles.forEach(s => textStyleMap.set(s.name, s));

    for (let t of parsed.typography) {
      const name = (t.group ? t.group + "/" : "") + t.token;
      let s = textStyleMap.get(name) || figma.createTextStyle();
      s.name = name;
      const fStyle = resolveFontStyle(t.weight);
      let family = t.font;
      let style = fStyle;
      let isFontLoaded = true;
      await figma.loadFontAsync({ family, style }).catch(async () => {
        family = 'Inter'; style = 'Regular';
        await figma.loadFontAsync({ family, style });
        isFontLoaded = false;
        sendQA(`Font fallback: '${t.font} ${fStyle}' not found, used 'Inter Regular'.`);
      });
      s.fontName = { family, style };
      s.fontSize = parseFloat(t.size);
      const lhObj = parseLineHeightObj(t.lineHeight);
      s.lineHeight = lhObj;
      s.letterSpacing = { value: parseFloat(t.ls) || 0, unit: 'PIXELS' };
      
      try {
        const fv = varMap.get(name + "/fontSize");
        const lv = varMap.get(name + "/lineHeight");
        const sv = varMap.get(name + "/letterSpacing");
        const ff = varMap.get("fontFamily/" + t.font);
        const fw = varMap.get("fontStyle/" + fStyle);

        if (fv) s.setBoundVariable('fontSize', fv);
        if (lv && lhObj.unit === 'PIXELS') s.setBoundVariable('lineHeight', lv);
        if (sv) s.setBoundVariable('letterSpacing', sv);
        
        if (isFontLoaded) {
          if (ff) s.setBoundVariable('fontFamily', ff);
          if (fw) s.setBoundVariable('fontStyle', fw);
        } else {
          const ffInter = varMap.get("fontFamily/Inter");
          const fwRegular = varMap.get("fontStyle/Regular");
          if (ffInter) s.setBoundVariable('fontFamily', ffInter);
          if (fwRegular) s.setBoundVariable('fontStyle', fwRegular);
        }
      } catch (e) {}
      results.text++;
    }
  }

  if (options.color) {
    const existingPaintStyles = await figma.getLocalPaintStylesAsync();
    const paintStyleMap = new Map();
    existingPaintStyles.forEach(s => paintStyleMap.set(s.name, s));
    for (let s of parsed.colors.semantic) {
      let ps = paintStyleMap.get(s.token) || figma.createPaintStyle();
      ps.name = s.token;
      const v = varMap.get("semantic/" + s.token);
      if (v) ps.paints = [figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#000000'), 'color', v)];
      else ps.paints = [{ type: 'SOLID', color: hexToRgb(s.light) }];
      results.color++;
    }
  }

  if (options.effect) {
    const existingEffectStyles = await figma.getLocalEffectStylesAsync();
    const effectStyleMap = new Map();
    existingEffectStyles.forEach(s => effectStyleMap.set(s.name, s));
    for (let e of parsed.effects) {
      let es = effectStyleMap.get(e.token) || figma.createEffectStyle();
      es.name = e.token;
      const effect = {
        type: 'DROP_SHADOW', color: parseRgbaColor(e.color) || {r:0,g:0,b:0,a:0.1},
        offset: {x: parseFloat(e.x), y: parseFloat(e.y)}, radius: parseFloat(e.blur), spread: parseFloat(e.spread), visible: true, blendMode: 'NORMAL'
      };
      const bv = varMap.get("primitive/" + e.blur) || varMap.get("semantic/" + e.blur) || varMap.get("primitive/" + parseFloat(e.blur) + "px");
      if (bv) effect.boundVariables = { radius: { type: 'VARIABLE_ALIAS', id: bv.id } };
      es.effects = [effect];
      results.effect++;
    }
  }

  if (options.grid) {
    const existingGridStyles = await figma.getLocalGridStylesAsync();
    const gridStyleMap = new Map();
    existingGridStyles.forEach(s => gridStyleMap.set(s.name, s));
    for (let g of parsed.grid) {
      let gs = gridStyleMap.get(g.token) || figma.createGridStyle();
      gs.name = g.token;
      let grid;
      if (g.type === 'grid') {
        grid = { pattern: 'GRID', sectionSize: parseFloat(g.count), color: { r: 1, g: 0, b: 0, a: 0.1 } };
      } else {
        grid = {
          pattern: g.type.toUpperCase(), count: parseInt(g.count) || 12, gutterSize: parseFloat(g.gutter), offset: parseFloat(g.margin), alignment: 'STRETCH', color: { r: 1, g: 0, b: 0, a: 0.1 }
        };
      }
      gs.layoutGrids = [grid];
      results.grid++;
    }
  }
  return results;
}

// ============================================
// [5] Export Function (Figma -> MD)
// ============================================

async function generateExportMD() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMapById = new Map();
  allVars.forEach(v => varMapById.set(v.id, v));

  let md = `<!-- [MD_TO_FIGMA_EXPORT_LOG] -->\n\n# Design System\n\n`;

  const extractCol = (colName, mdName) => {
    const col = collections.find(c => c.name.toLowerCase() === colName.toLowerCase());
    if (!col) return "";
    let sMd = `## ${mdName}\n\n### Primitive\n| Token | Value | Description |\n|---|---|---|\n`;
    const vars = allVars.filter(v => v.variableCollectionId === col.id);
    let pR = [], sR = [];
    const mId = col.modes[0].modeId;
    const dId = col.modes.length > 1 ? col.modes[1].modeId : null;

    vars.forEach(v => {
      const lV = v.valuesByMode[mId];
      if (v.name.startsWith('primitive/')) {
        const val = colName === 'Color' ? rgbToHex(lV) : lV + "px";
        pR.push(`| ${v.name.replace('primitive/', '')} | ${val} | ${v.description || '-'} |`);
      } else if (v.name.startsWith('semantic/')) {
        const clean = v.name.replace('semantic/', '');
        const getRef = (val, mN) => {
          if (val.type === 'VARIABLE_ALIAS') return varMapById.get(val.id).name.replace('primitive/', '');
          const recN = `recovered/${clean}-${mN}`;
          const recV = colName === 'Color' ? rgbToHex(val) : val + "px";
          pR.push(`| ${recN} | ${recV} | [Auto-Recovered] |`);
          sendQA(`Recovery: ${mdName} '${v.name}' reference lost, created '${recN}'.`);
          return recN;
        };
        if (colName === 'Color') {
          const dV = dId ? v.valuesByMode[dId] : lV;
          sR.push(`| ${clean} | ${getRef(lV, 'light')} | ${getRef(dV, 'dark')} | ${v.description || '-'} |`);
        } else {
          sR.push(`| ${clean} | ${getRef(lV, 'alias')} | ${v.description || '-'} |`);
        }
      }
    });
    if (!pR.length && !sR.length) return "";
    sMd += pR.join('\n') + `\n\n### Semantic\n`;
    if (colName === 'Color') sMd += `| Token | Light | Dark | Description |\n|---|---|---|---|\n`;
    else sMd += `| Token | Alias | Description |\n|---|---|---|\n`;
    sMd += sR.join('\n') + `\n\n`;
    return sMd;
  };

  md += extractCol('Color', 'Colors');
  md += extractCol('Spacing', 'Spacing');
  md += extractCol('Radius', 'Radius');

  const tStyles = await figma.getLocalTextStylesAsync();
  if (tStyles.length) {
    md += `## Typography\n\n`;
    const gs = {};
    tStyles.forEach(s => {
      const parts = s.name.split('/');
      const g = parts.length > 1 ? parts[0] : 'default';
      const t = parts.length > 1 ? parts.slice(1).join('/') : s.name;
      if (!gs[g]) gs[g] = [];
      const lh = s.lineHeight.unit === 'PERCENT' ? Math.round(s.lineHeight.value) + "%" : s.lineHeight.value + "px";
      const ls = s.letterSpacing.value + (s.letterSpacing.unit === 'PIXELS' ? "px" : "%");
      gs[g].push(`| ${t} | ${s.fontName.family} | ${s.fontSize}px | ${s.fontName.style} | ${lh} | ${ls} |`);
    });
    for (let g in gs) {
      md += `### ${g}\n| Token | Font | Size | Weight | LineHeight | LetterSpacing |\n|---|---|---|---|---|---|\n` + gs[g].join('\n') + `\n\n`;
    }
  }

  const eStyles = await figma.getLocalEffectStylesAsync();
  if (eStyles.length) {
    md += `## Effects\n\n| Token | Type | Color | X | Y | Blur | Spread |\n|---|---|---|---|---|---|---|\n`;
    eStyles.forEach(s => {
      if (s.effects.length) {
        const e = s.effects[0];
        if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
          md += `| ${s.name} | ${e.type === 'DROP_SHADOW' ? 'drop-shadow' : 'inner-shadow'} | ${rgbaToString(e.color)} | ${e.offset.x}px | ${e.offset.y}px | ${e.radius}px | ${e.spread}px |\n`;
        }
      }
    });
    md += `\n`;
  }

  const gStyles = await figma.getLocalGridStylesAsync();
  if (gStyles.length) {
    md += `## Grid\n\n| Token | Type | Count | Width | Gutter | Margin | Alignment |\n|---|---|---|---|---|---|---|\n`;
    gStyles.forEach(s => {
      if (s.layoutGrids.length) {
        const g = s.layoutGrids[0];
        if (g.pattern === 'GRID') md += `| ${s.name} | grid | ${g.sectionSize}px | - | - | - | - |\n`;
        else md += `| ${s.name} | ${g.pattern.toLowerCase()} | ${g.count} | auto | ${g.gutterSize}px | ${g.offset}px | ${g.alignment.toLowerCase()} |\n`;
      }
    });
    md += `\n`;
  }

  return { mdContent: md };
}

// ============================================
// [6] Message Handler
// ============================================

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      sendLog('info', 'MD parsing and generation started...');
      const parsed = parseMD(msg.content);
      const vRes = await createAllVariables(parsed, msg.options.variables);
      const sRes = await createStyles(parsed, msg.options.styles);
      figma.ui.postMessage({ type: 'complete', results: { variables: vRes, styles: sRes } });
      sendLog('success', 'All systems synced successfully!');
    } catch (e) { sendError('Sync failed', e.message); }
  }

  if (msg.type === 'export') {
    try {
      sendLog('info', 'Analyzing and exporting Figma data...');
      const exportData = await generateExportMD();
      figma.ui.postMessage({ type: 'export_complete', mdContent: exportData.mdContent });
    } catch (e) { sendError('Export failed', e.message); }
  }

  if (msg.type === 'cancel') figma.closePlugin();
};