/**
 * MD to Figma - v1.6.0 Optimized Main Plugin Code (Full Fix + Partial Sync Support)
 * 
 * Improvements:
 * 1. 4 Separate Collections: Color, Spacing, Radius, Typography.
 * 2. Partial Sync: Supports creating Styles only, auto-linking to existing Variables.
 * 3. Enforced Alias: Semantic colors MUST reference Primitive variables.
 * 4. High Compatibility: ZERO usage of ?. or ?? for older/restricted environments.
 * 5. Natural Sorting: Numeric-aware sorting for all collections.
 */

figma.showUI(__html__, { width: 500, height: 650 });

// ============================================
// 로그 및 에러 전송 헬퍼
// ============================================

const sendLog = (type, message) => {
  figma.ui.postMessage({ type: 'log', logType: type, message: message });
};

const sendError = (message, detail) => {
  figma.ui.postMessage({
    type: 'error',
    message: message,
    detail: detail || '',
    copyable: "[에러] " + message + "\n\n상세:\n" + (detail || '없음')
  });
};

// ============================================
// 데이터 비교 및 변환 유틸리티
// ============================================

const colorsEqual = (color1, color2) => {
  if (!color1 || !color2) return false;
  return Math.abs(color1.r - color2.r) < 0.001 &&
    Math.abs(color1.g - color2.g) < 0.001 &&
    Math.abs(color1.b - color2.b) < 0.001;
};

const numbersEqual = (num1, num2) => Math.abs(num1 - num2) < 0.001;

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
};

const parseRgbaColor = (colorStr) => {
  const match = colorStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  if (match) {
    return {
      r: parseInt(match[1]) / 255,
      g: parseInt(match[2]) / 255,
      b: parseInt(match[3]) / 255,
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  return null;
};

const parseLineHeightValue = (value) => {
  const raw = String(value || '').trim();
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return 100;
  if (raw.endsWith('%')) return num;
  return num <= 10 ? num * 100 : num;
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

/**
 * 자연스러운 정렬 (숫자 인식: 2, 4, 12, 100)
 */
function naturalCompare(a, b) {
  const re = /(\d+)|(\D+)/g;
  const aParts = String(a).match(re) || [];
  const bParts = String(b).match(re) || [];
  const length = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < length; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];
    const aIsNum = !isNaN(aPart);
    const bIsNum = !isNaN(bPart);
    if (aIsNum && bIsNum) {
      const diff = parseInt(aPart) - parseInt(bPart);
      if (diff !== 0) return diff;
    } else if (aPart !== bPart) {
      return aPart < bPart ? -1 : 1;
    }
  }
  return aParts.length - bParts.length;
}

// ============================================
// 맵 생성 헬퍼 (O(1) 검색용)
// ============================================

function createVariableMap(variables) {
  const map = new Map();
  if (!variables) return map;
  for (let i = 0; i < variables.length; i++) {
    const v = variables[i];
    try {
      if (v.name && v.id) map.set(v.name, v);
    } catch (e) { continue; }
  }
  return map;
}

function createStyleMap(styles) {
  const map = new Map();
  if (!styles) return map;
  for (let i = 0; i < styles.length; i++) {
    const s = styles[i];
    try {
      if (s.name && s.id) map.set(s.name, s);
    } catch (e) { continue; }
  }
  return map;
}

function allVariablesFilter(vars, type) {
  const result = [];
  if (!vars) return result;
  for (let i = 0; i < vars.length; i++) {
    if (vars[i].resolvedType === type) result.push(vars[i]);
  }
  return result;
}

// ============================================
// UI 메시지 핸들러
// ============================================

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    try {
      sendLog('info', '📄 MD 파일 파싱 시작...');
      const parsed = parseMD(msg.content);

      let results = {
        variables: { colors: 0, spacing: 0, radius: 0, typography: 0 },
        styles: { text: 0, effect: 0, grid: 0, color: 0 }
      };

      // 1. 배리어블 생성
      sendLog('info', '📦 컬렉션별 Variables 처리 시작...');
      results.variables = await createAllVariables(parsed, msg.options.variables);

      // 2. 스타일 생성 (부분 등록 지원)
      const optS = msg.options.styles;
      const isAnyStyleSelected = optS.color || optS.text || optS.effect || optS.grid;
      if (isAnyStyleSelected) {
        sendLog('info', '🎨 Styles 처리 시작...');
        results.styles = await createStyles(parsed, msg.options.styles);
      }

      sendLog('success', '🎉 모든 작업이 완료되었습니다!');
      figma.ui.postMessage({ type: 'complete', results: results });

    } catch (e) {
      sendError('프로세스 오류', e.message);
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// ============================================
// MD 파서
// ============================================

function parseMD(content) {
  const result = {
    colors: { primitive: [], semantic: [] },
    spacing: { primitive: [], semantic: [] },
    radius: { primitive: [], semantic: [] },
    typography: [],
    effects: [],
    grid: []
  };

  const lines = content.split('\n');
  let currentSection = '';
  let currentSubSection = '';
  let currentTypographyGroup = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').toLowerCase();
      currentSubSection = '';
      currentTypographyGroup = '';
      continue;
    }
    if (line.startsWith('### ')) {
      const subSection = line.replace('### ', '');
      if (currentSection === 'typography') {
        currentTypographyGroup = subSection.toLowerCase();
      } else {
        currentSubSection = subSection.toLowerCase();
      }
      continue;
    }
    if (line.startsWith('|') && !line.includes('---')) {
      const rawCells = line.split('|');
      const cells = [];
      for (let j = 0; j < rawCells.length; j++) {
        const c = rawCells[j].trim();
        if (c) cells.push(c);
      }
      if (!cells || cells.length < 2) continue;
      if (cells[0].toLowerCase() === 'token') continue;

      if (currentSection === 'colors') {
        if (currentSubSection === 'primitive') {
          result.colors.primitive.push({ token: cells[0], value: cells[1], description: cells[2] || '' });
        } else if (currentSubSection === 'semantic') {
          const hasModes = cells.length >= 4 && cells[2] && cells[2] !== '-' && cells[2] !== '';
          if (hasModes) {
            result.colors.semantic.push({ token: cells[0], light: cells[1], dark: cells[2], description: cells[3] || '' });
          } else {
            result.colors.semantic.push({ token: cells[0], light: cells[1], dark: cells[1], alias: cells[1], description: cells[2] || '' });
          }
        }
      } else if (currentSection === 'spacing' || currentSection === 'radius') {
        const target = result[currentSection][currentSubSection];
        if (currentSubSection === 'primitive') {
          target.push({ token: cells[0], value: cells[1], description: cells[2] || '' });
        } else if (currentSubSection === 'semantic') {
          target.push({ token: cells[0], alias: cells[1], description: cells[2] || '' });
        }
      } else if (currentSection === 'typography') {
        result.typography.push({
          token: cells[0], font: cells[1], size: cells[2], weight: cells[3],
          lineHeight: cells[4], letterSpacing: cells[5] || '0', group: currentTypographyGroup || ''
        });
      } else if (currentSection === 'effects') {
        result.effects.push({
          token: cells[0], type: cells[1], color: cells[2], x: cells[3], y: cells[4], blur: cells[5], spread: cells[6] || '0'
        });
      } else if (currentSection === 'grid') {
        result.grid.push({
          token: cells[0], type: cells[1], count: cells[2], width: cells[3], gutter: cells[4], margin: cells[5], alignment: cells[6] || 'stretch'
        });
      }
    }
  }
  return result;
}

// ============================================
// Variables 생성 및 컬렉션 관리
// ============================================

async function getOrCreateCollection(name) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (let i = 0; i < collections.length; i++) {
    if (collections[i].name === name) return collections[i];
  }
  return figma.variables.createVariableCollection(name);
}

async function createAllVariables(parsed, options) {
  const results = { colors: 0, spacing: 0, radius: 0, typography: 0 };
  const allExisting = await figma.variables.getLocalVariablesAsync();
  const existingMap = createVariableMap(allExisting);

  // 1. Color 컬렉션
  if (options.colors) {
    sendLog('info', '   🎨 Color 컬렉션 동기화 중...');
    const col = await getOrCreateCollection('Color');

    let hasDark = false;
    for (let i = 0; i < parsed.colors.semantic.length; i++) {
      const s = parsed.colors.semantic[i];
      if (s.dark && s.dark !== s.light) {
        hasDark = true; break;
      }
    }

    let lightModeId = null;
    let darkModeId = null;
    for (let i = 0; i < col.modes.length; i++) {
      if (col.modes[i].name === 'Light') lightModeId = col.modes[i].modeId;
      if (col.modes[i].name === 'Dark') darkModeId = col.modes[i].modeId;
    }

    if (!lightModeId) {
      lightModeId = col.modes[0].modeId;
      col.renameMode(lightModeId, 'Light');
    }
    if (hasDark && !darkModeId) {
      darkModeId = col.addMode('Dark');
      sendLog('info', '      🌓 Dark 모드 생성');
    }

    results.colors = await processColorVariables(parsed.colors, col, { light: lightModeId, dark: darkModeId }, existingMap);
    await sortCollection(col);
  }

  // 2. Spacing 컬렉션
  if (options.spacing) {
    sendLog('info', '   📏 Spacing 컬렉션 동기화 중...');
    const col = await getOrCreateCollection('Spacing');
    results.spacing = await processNumberVariables(parsed.spacing, col, 'spacing', existingMap);
    await sortCollection(col);
  }

  // 3. Radius 컬렉션
  if (options.radius) {
    sendLog('info', '   ⭕ Radius 컬렉션 동기화 중...');
    const col = await getOrCreateCollection('Radius');
    results.radius = await processNumberVariables(parsed.radius, col, 'radius', existingMap);
    await sortCollection(col);
  }

  // 4. Typography 컬렉션
  if (options.typography) {
    sendLog('info', '   📝 Typography 컬렉션 동기화 중...');
    const col = await getOrCreateCollection('Typography');
    results.typography = await processTypographyVariables(parsed.typography, col, existingMap);
    await sortCollection(col);
  }

  return results;
}

async function processColorVariables(data, col, modeIds, existingMap) {
  let count = 0;
  const primitiveRefMap = new Map();

  for (let i = 0; i < data.primitive.length; i++) {
    const item = data.primitive[i];
    const name = "primitive/" + item.token;
    const color = hexToRgb(item.value);
    let variable = existingMap.get(name);

    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'COLOR');
      if (item.description) variable.description = item.description;
      count++;
    }
    variable.setValueForMode(modeIds.light, color);
    if (modeIds.dark) variable.setValueForMode(modeIds.dark, color);
    primitiveRefMap.set(item.token, variable);
  }

  for (let i = 0; i < data.semantic.length; i++) {
    const item = data.semantic[i];
    const name = "semantic/" + item.token;
    const lightRef = item.light || item.alias;
    const darkRef = item.dark || lightRef;

    const getAliasValue = (ref) => {
      const target = primitiveRefMap.get(ref);
      if (target) return { type: 'VARIABLE_ALIAS', id: target.id };
      return null;
    };

    const lightVal = getAliasValue(lightRef);
    if (!lightVal) continue;

    let variable = existingMap.get(name);
    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'COLOR');
      if (item.description) variable.description = item.description;
      count++;
    }

    variable.setValueForMode(modeIds.light, lightVal);
    if (modeIds.dark) variable.setValueForMode(modeIds.dark, getAliasValue(darkRef) || lightVal);
  }
  return count;
}

async function processNumberVariables(data, col, prefix, existingMap) {
  let count = 0;
  const modeId = col.modes[0].modeId;
  const primitiveRefMap = new Map();

  for (let i = 0; i < data.primitive.length; i++) {
    const item = data.primitive[i];
    const name = "primitive/" + item.token;
    const val = parseFloat(item.value);
    let variable = existingMap.get(name);
    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'FLOAT');
      count++;
    }
    variable.setValueForMode(modeId, val);
    primitiveRefMap.set(item.token, variable);
  }

  for (let i = 0; i < data.semantic.length; i++) {
    const item = data.semantic[i];
    const name = "semantic/" + item.token;
    const target = primitiveRefMap.get(item.alias);
    if (!target) continue;

    let variable = existingMap.get(name);
    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'FLOAT');
      count++;
    }
    variable.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: target.id });
  }
  return count;
}

async function processTypographyVariables(data, col, existingMap) {
  let count = 0;
  const modeId = col.modes[0].modeId;

  const createFontVariable = (family) => {
    if (!family) return null;
    const name = "fontFamily/" + family;
    let variable = existingMap.get(name);
    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'STRING');
      existingMap.set(name, variable);
      count++;
    }
    variable.setValueForMode(modeId, family);
    return variable;
  };

  const createWeightVariable = (weight) => {
    if (!weight) return null;
    const resolvedStyle = resolveFontStyle(weight);
    const name = "fontStyle/" + resolvedStyle;
    let variable = existingMap.get(name);
    if (!variable) {
      variable = figma.variables.createVariable(name, col, 'STRING');
      existingMap.set(name, variable);
      count++;
    }
    variable.setValueForMode(modeId, resolvedStyle);
    return variable;
  };

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const group = item.group ? item.group + "/" : "";
    const basePath = group + item.token;
    const addVar = (sub, val, type) => {
      const name = basePath + "/" + sub;
      let variable = existingMap.get(name);
      if (!variable) {
        variable = figma.variables.createVariable(name, col, type);
        existingMap.set(name, variable);
        count++;
      }
      const parsedValue = sub === 'lineHeight' ? parseLineHeightValue(val) : parseFloat(val);
      variable.setValueForMode(modeId, parsedValue);
    };
    addVar('fontSize', item.size, 'FLOAT');
    addVar('lineHeight', item.lineHeight, 'FLOAT');
    if (item.letterSpacing && item.letterSpacing !== '0' && item.letterSpacing !== '0px') addVar('letterSpacing', item.letterSpacing, 'FLOAT');
    createFontVariable(item.font);
    createWeightVariable(item.weight);
  }
  return count;
}

async function sortCollection(col) {
  if (!col || typeof col.setVariableOrder !== 'function') return;
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    const idMap = new Map();
    for (let i = 0; i < allVars.length; i++) idMap.set(allVars[i].id, allVars[i].name);
    const ids = [];
    const currentIds = col.variableIds;
    for (let i = 0; i < currentIds.length; i++) ids.push(currentIds[i]);
    ids.sort((a, b) => naturalCompare(idMap.get(a) || "", idMap.get(b) || ""));
    col.setVariableOrder(ids);
  } catch (e) { }
}

// ============================================
// Styles 생성 및 배리어블 연동
// ============================================

async function createStyles(parsed, options) {
  const results = { text: 0, effect: 0, grid: 0, color: 0 };
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMap = createVariableMap(allVars);

  // Spacing 전용 맵 (Effect/Grid용)
  const spacingMap = new Map();
  for (let i = 0; i < allVars.length; i++) {
    const v = allVars[i];
    if (v.name.indexOf('/space-') !== -1 || v.name.indexOf('semantic/') !== -1) {
      const mIds = Object.keys(v.valuesByMode);
      const mId = mIds[0];
      const val = v.valuesByMode[mId];
      const nameParts = v.name.split('/');
      const shortName = nameParts[nameParts.length - 1];
      spacingMap.set(shortName, v);
      if (typeof val === 'number') {
        spacingMap.set(val + "px", v);
        spacingMap.set(String(val), v);
      }
    }
  }

  if (options.color) results.color = await createColorStyles(parsed, varMap);
  if (options.text) results.text = await createTextStyles(parsed, varMap);
  if (options.effect) results.effect = await createEffectStyles(parsed, spacingMap);
  if (options.grid) results.grid = await createGridStyles(parsed, spacingMap);

  return results;
}

async function createColorStyles(parsed, varMap) {
  let count = 0;
  const styles = await figma.getLocalPaintStylesAsync();
  const styleMap = createStyleMap(styles);

  for (let i = 0; i < parsed.colors.semantic.length; i++) {
    const item = parsed.colors.semantic[i];
    const styleName = item.token;
    const targetVar = varMap.get("semantic/" + item.token);
    let style = styleMap.get(styleName);

    if (!style) {
      style = figma.createPaintStyle();
      style.name = styleName;
      count++;
    }

    if (targetVar) {
      const paint = figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#000000'), 'color', targetVar);
      style.paints = [paint];
    } else {
      const hex = item.light || item.alias;
      if (hex && hex.indexOf('#') === 0) style.paints = [{ type: 'SOLID', color: hexToRgb(hex) }];
    }
  }
  return count;
}

async function createTextStyles(parsed, varMap) {
  let count = 0;
  const styles = await figma.getLocalTextStylesAsync();
  const styleMap = createStyleMap(styles);

  for (let i = 0; i < parsed.typography.length; i++) {
    const item = parsed.typography[i];
    const name = (item.group ? item.group + "/" : "") + item.token;
    let style = styleMap.get(name);
    if (!style) { style = figma.createTextStyle(); style.name = name; count++; }

    const fontStyle = resolveFontStyle(item.weight);
    const font = await loadFontWithFallback(item.font, fontStyle);
    style.fontName = font.fontName;
    style.fontSize = parseFloat(item.size);
    const lh = parseLineHeightValue(item.lineHeight);
    style.lineHeight = { value: lh, unit: 'PERCENT' };
    style.letterSpacing = { value: parseFloat(item.letterSpacing) || 0, unit: 'PIXELS' };

    const fv = varMap.get(name + "/fontSize");
    const sv = varMap.get(name + "/letterSpacing");
    const ff = varMap.get("fontFamily/" + item.font);
    const fw = varMap.get("fontStyle/" + fontStyle);
    try {
      if (fv) style.setBoundVariable('fontSize', fv);
      if (sv) style.setBoundVariable('letterSpacing', sv);
      if (ff) style.setBoundVariable('fontFamily', ff);
      if (fw) style.setBoundVariable('fontStyle', fw);
    } catch (e) {
      sendLog('warn', `Typography binding failed for ${name}: ${e.message || e}`);
    }
  }
  return count;
}

async function createEffectStyles(parsed, spacingMap) {
  let count = 0;
  const styles = await figma.getLocalEffectStylesAsync();
  const styleMap = createStyleMap(styles);
  for (let i = 0; i < parsed.effects.length; i++) {
    const item = parsed.effects[i];
    const nameParts = item.token.split('/');
    const name = nameParts[nameParts.length - 1];
    let style = styleMap.get(name);
    if (!style) { style = figma.createEffectStyle(); style.name = name; count++; }
    const blurVal = parseFloat(item.blur) || 0;
    const effect = {
      type: 'DROP_SHADOW', color: parseRgbaColor(item.color) || { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: parseFloat(item.x) || 0, y: parseFloat(item.y) || 0 },
      radius: blurVal, spread: parseFloat(item.spread) || 0, visible: true, blendMode: 'NORMAL'
    };
    const bv = spacingMap.get(item.blur) || spacingMap.get(blurVal + "px") || spacingMap.get(String(blurVal));
    if (bv) effect.boundVariables = { radius: { type: 'VARIABLE_ALIAS', id: bv.id } };
    style.effects = [effect];
  }
  return count;
}

async function createGridStyles(parsed, spacingMap) {
  let count = 0;
  const styles = await figma.getLocalGridStylesAsync();
  const styleMap = createStyleMap(styles);
  for (let i = 0; i < parsed.grid.length; i++) {
    const item = parsed.grid[i];
    const nameParts = item.token.split('/');
    const name = nameParts[nameParts.length - 1];
    let style = styleMap.get(name);
    if (!style) { style = figma.createGridStyle(); style.name = name; count++; }
    const gVal = parseFloat(item.gutter) || 20;
    const mVal = parseFloat(item.margin) || 0;
    const gv = spacingMap.get(item.gutter) || spacingMap.get(gVal + "px");
    const mv = spacingMap.get(item.margin) || spacingMap.get(mVal + "px");
    let grid;
    if (item.type === 'grid') {
      const sVal = parseFloat(item.count) || 8;
      const sv = spacingMap.get(item.count) || spacingMap.get(sVal + "px");
      grid = { pattern: 'GRID', sectionSize: sVal, color: { r: 1, g: 0, b: 0, a: 0.1 } };
      if (sv) grid.boundVariables = { sectionSize: { type: 'VARIABLE_ALIAS', id: sv.id } };
    } else {
      grid = {
        pattern: item.type === 'rows' ? 'ROWS' : 'COLUMNS',
        count: parseInt(item.count) || 12, gutterSize: gVal, offset: mVal, alignment: 'STRETCH',
        color: { r: 1, g: 0, b: 0, a: 0.1 }
      };
      const b = {};
      if (gv) b.gutterSize = { type: 'VARIABLE_ALIAS', id: gv.id };
      if (mv) b.offset = { type: 'VARIABLE_ALIAS', id: mv.id };
      if (Object.keys(b).length > 0) grid.boundVariables = b;
    }
    style.layoutGrids = [grid];
  }
  return count;
}

// ============================================
// 폰트 및 기타 헬퍼
// ============================================

async function loadFontWithFallback(family, style) {
  const load = async (f, s) => { try { await figma.loadFontAsync({ family: f, style: s }); return true; } catch (e) { return false; } };
  if (await load(family, style)) return { fontName: { family: family, style: style } };
  if (await load(family, 'Regular')) return { fontName: { family: family, style: 'Regular' } };
  if (await load('Inter', style)) return { fontName: { family: 'Inter', style: style } };
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  return { fontName: { family: 'Inter', style: 'Regular' } };
}
