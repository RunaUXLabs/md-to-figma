/**
 * MD to Figma - v2.0.1 Official Stable Release
 * The Complete Bidirectional Semantic Design System Engine
 * Featuring Smart Update & AI-Ready QA Reporting
 */

figma.showUI(__html__, { width: 500, height: 650 });

const sendLog = (type, message) => figma.ui.postMessage({ type: 'log', logType: type, message: message });
const sendQA = (message) => figma.ui.postMessage({ type: 'qa_log', message: message });
const sendError = (message, detail) => figma.ui.postMessage({ type: 'error', message: message, detail: detail || '' });

const rgbToHex = (color) => {
  const r = Math.round(color.r * 255).toString(16);
  const g = Math.round(color.g * 255).toString(16);
  const b = Math.round(color.b * 255).toString(16);
  return "#" + (r.length === 1 ? "0" + r : r) + (g.length === 1 ? "0" + g : g) + (b.length === 1 ? "0" + b : b);
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 0, g: 0, b: 0 };
};

const rgbaToString = (color) => {
  const a = (color.a !== undefined) ? color.a : 1;
  return "rgba(" + Math.round(color.r * 255) + ", " + Math.round(color.g * 255) + ", " + Math.round(color.b * 255) + ", " + a.toFixed(2) + ")";
};

const parseRgbaColor = (str) => {
  const m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  return m ? { r: parseInt(m[1])/255, g: parseInt(m[2])/255, b: parseInt(m[3])/255, a: m[4] ? parseFloat(m[4]) : 1 } : null;
};

// Helper for clean numbers in MD
const roundVal = (v) => {
  var n = parseFloat(v);
  return isNaN(n) ? "0" : Math.round(n * 100) / 100;
};

const parseLineHeightValue = (value) => {
  const raw = String(value || "").trim();
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return 100;
  if (raw.indexOf("%") !== -1) return num;
  return num <= 10 ? num * 100 : num;
};

const parseLineHeightObj = (v) => {
  const raw = String(v || "").trim();
  const num = parseFloat(raw);
  if (isNaN(num)) return { value: 100, unit: 'PERCENT' };
  if (raw.indexOf("%") !== -1) return { value: num, unit: 'PERCENT' };
  if (raw.indexOf("px") !== -1) return { value: num, unit: 'PIXELS' };
  return num <= 10 ? { value: num * 100, unit: 'PERCENT' } : { value: num, unit: 'PIXELS' };
};

const weightMap = {
  '100': 'Thin', 'thin': 'Thin', '200': 'ExtraLight', 'extralight': 'ExtraLight', 'extra-light': 'ExtraLight', 'extra light': 'ExtraLight',
  '300': 'Light', 'light': 'Light', '400': 'Regular', 'regular': 'Regular', 'normal': 'Regular',
  '500': 'Medium', 'medium': 'Medium', 'midium': 'Medium', '600': 'SemiBold', 'semibold': 'SemiBold', 'semi-bold': 'SemiBold', 'semi bold': 'SemiBold',
  '700': 'Bold', 'bold': 'Bold', '800': 'ExtraBold', 'extrabold': 'ExtraBold', 'extra-bold': 'ExtraBold', 'extra bold': 'ExtraBold',
  '900': 'Black', 'black': 'Black', 'heavy': 'Black'
};

const resolveFontStyle = (w) => {
  const raw = String(w || "").trim().toLowerCase();
  const normalized = raw.replace(/[\s\-_]/g, "");
  return weightMap[normalized] || weightMap[raw] || 'Regular';
};

const getSemanticWeightName = (w) => {
  const style = resolveFontStyle(w);
  const keys = Object.keys(weightMap);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (weightMap[key] === style && /^\d+$/.test(key)) return key;
  }
  return style.toLowerCase();
};

function parseMD(content) {
  const res = { colors: { primitive: [], semantic: [] }, spacing: { primitive: [], semantic: [] }, radius: { primitive: [], semantic: [] }, typography: [], effects: [], grid: [] };
  const lines = content.split('\n');
  let sec = '', sub = '', typoGroup = '';
  
  for (var i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.indexOf("## ") === 0) { 
      sec = line.replace("## ", "").toLowerCase(); 
      sub = ""; typoGroup = ""; 
      continue; 
    }
    if (line.indexOf("### ") === 0) { 
      const name = line.replace("### ", "").trim();
      sub = name.toLowerCase();
      if (sec.includes('typography')) typoGroup = sub;
      continue;
    }
    if (line.indexOf("|") === 0 && line.indexOf("---") === -1) {
      const c = line.split("|").map(x => x.trim()).filter(x => x !== "");
      if (c.length < 2 || c[0].toLowerCase() === "token") continue;

      if (sec.includes('color')) {
        // Smart Color Parsing: if 3+ columns, assume semantic (Token, Light, Dark...)
        if (c.length >= 3 && (sub.includes('semantic') || sub.includes('token'))) {
          res.colors.semantic.push({ token: c[0], light: c[1], dark: c[2] || c[1], desc: c[3] || "" });
        } else {
          res.colors.primitive.push({ token: c[0], value: c[1] || "#000000", desc: c[2] || "" });
        }
      } else if (sec.includes('spacing') || sec.includes('radius')) {
        const target = sec.includes('spacing') ? res.spacing : res.radius;
        if (c.length >= 2) {
          // If value contains px/rem or is numeric, it's likely primitive
          if (/[0-9]/.test(c[1]) && !sub.includes('semantic')) target.primitive.push({ token: c[0], value: c[1], desc: c[2] || "" });
          else target.semantic.push({ token: c[0], alias: c[1], desc: c[2] || "" });
        }
      } else if (sec.includes('typography')) {
        res.typography.push({ token: c[0], font: c[1] || "Inter", size: c[2] || "16px", weight: c[3] || "Regular", lineHeight: c[4] || "100%", ls: c[5] || "0", group: typoGroup });
      } else if (sec.includes('effect')) {
        res.effects.push({ token: c[0], type: c[1] || "drop-shadow", color: c[2] || "rgba(0,0,0,0.1)", x: c[3] || "0", y: c[4] || "0", blur: c[5] || "0", spread: c[6] || "0" });
      } else if (sec.includes('grid')) {
        res.grid.push({ token: c[0], type: c[1] || "columns", count: c[2] || "1", width: c[3] || "auto", gutter: c[4] || "0", margin: c[5] || "0", align: c[6] || "stretch" });
      }
    }
  }
  return res;
}

async function getOrCreateCollection(name) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  for (var i = 0; i < cols.length; i++) {
    const c = cols[i];
    if (c.name.toLowerCase() === name.toLowerCase()) return c;
  }
  return figma.variables.createVariableCollection(name);
}

async function createAllVariables(parsed, options) {
  const results = { colors: 0, spacing: 0, radius: 0, typography: 0 };
  const allExisting = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  
  // Build a global map of variables by name for smart matching
  const globalVarMap = new Map();
  allExisting.forEach(v => {
    // Store by both full path and simple name for fuzzy matching
    globalVarMap.set(v.name.toLowerCase(), v);
    const simpleName = v.name.split('/').pop().toLowerCase();
    if (!globalVarMap.has(simpleName)) globalVarMap.set(simpleName, v);
  });

  const loggedMatches = new Set();
  // Track new creations by category for a cleaner summary
  const newCreations = { Color: 0, Spacing: 0, Radius: 0, Typography: 0 };
  
  const getOrCreateSmartVariable = (name, type, defaultColName) => {
    const lowName = name.toLowerCase();
    const simpleName = name.split('/').pop().toLowerCase();
    
    let v = globalVarMap.get(lowName) || globalVarMap.get(simpleName);
    if (v) {
      if (!loggedMatches.has(v.id)) {
        const col = collections.find(c => c.id === v.variableCollectionId);
        sendQA("Smart Match: '" + (col ? col.name : "Unknown") + "' 컬렉션의 '" + v.name + "' 토큰 업데이트.");
        loggedMatches.add(v.id);
      }
      return v;
    }

    let col = collections.find(c => c.name.toLowerCase() === defaultColName.toLowerCase());
    if (!col) {
      col = figma.variables.createVariableCollection(defaultColName);
      collections.push(col);
    }
    const newVar = figma.variables.createVariable(name, col, type);
    
    // Increment counter instead of logging every single new token
    if (newCreations[defaultColName] !== undefined) {
      newCreations[defaultColName]++;
    }
    
    globalVarMap.set(lowName, newVar);
    loggedMatches.add(newVar.id);
    return newVar;
  };

  const safeSetValue = (variable, value, modeIndex = 0) => {
    const col = collections.find(c => c.id === variable.variableCollectionId);
    if (!col || !col.modes || col.modes.length === 0) return;
    
    // If the requested mode index doesn't exist, fallback to the first mode
    const modeId = col.modes[modeIndex] ? col.modes[modeIndex].modeId : col.modes[0].modeId;
    try {
      variable.setValueForMode(modeId, value);
    } catch (e) {
      sendQA("Skipped mode sync for '" + variable.name + "': " + e.message);
    }
  };

  if (options.colors) {
    sendLog('info', "Syncing Colors...");
    const primMap = new Map();
    const allParsedColors = [...parsed.colors.primitive, ...parsed.colors.semantic];
    
    for (var i = 0; i < allParsedColors.length; i++) {
      const p = allParsedColors[i];
      const isSemantic = !!p.light;
      const name = (isSemantic ? "semantic/" : "primitive/") + p.token;
      const v = getOrCreateSmartVariable(name, "COLOR", "Color");
      
      const resolveVal = (input) => {
        if (!input) return null;
        const targetVar = primMap.get(input) || globalVarMap.get(input.toLowerCase());
        if (targetVar) return { type: "VARIABLE_ALIAS", id: targetVar.id };
        if (input.startsWith("#")) return hexToRgb(input);
        if (input.startsWith("rgb")) return parseRgbaColor(input);
        return null;
      };

      if (isSemantic) {
        const lVal = resolveVal(p.light);
        const dVal = resolveVal(p.dark) || lVal;
        if (lVal) {
          safeSetValue(v, lVal, 0);
          const col = collections.find(c => c.id === v.variableCollectionId);
          if (col && col.modes.length > 1) safeSetValue(v, dVal, 1);
        }
      } else {
        const val = resolveVal(p.value);
        if (val) {
          const col = collections.find(c => c.id === v.variableCollectionId);
          if (col && col.modes.length > 1) {
            col.modes.forEach((m, idx) => safeSetValue(v, val, idx));
          } else {
            safeSetValue(v, val, 0);
          }
          primMap.set(p.token, v);
        }
      }
      results.colors++;
    }
  }

  const processNumCol = async (data, colName) => {
    if (data.primitive.length === 0 && data.semantic.length === 0) return 0;
    sendLog('info', "Syncing " + colName + "...");
    const pMap = new Map();
    let count = 0;
    for (var i = 0; i < data.primitive.length; i++) {
      const p = data.primitive[i];
      const v = getOrCreateSmartVariable("primitive/" + p.token, "FLOAT", colName);
      safeSetValue(v, parseFloat(p.value), 0);
      pMap.set(p.token, v);
      count++;
    }
    for (var i = 0; i < data.semantic.length; i++) {
      const s = data.semantic[i];
      const v = getOrCreateSmartVariable("semantic/" + s.token, "FLOAT", colName);
      const targetVar = pMap.get(s.alias);
      if (targetVar) safeSetValue(v, { type: "VARIABLE_ALIAS", id: targetVar.id }, 0);
      count++;
    }
    return count;
  };

  if (options.spacing) results.spacing = await processNumCol(parsed.spacing, "Spacing");
  if (options.radius) results.radius = await processNumCol(parsed.radius, "Radius");

  if (options.typography && parsed.typography.length > 0) {
    sendLog('info', "Syncing Typography...");
    const uniqueFonts = [];
    for (var i = 0; i < parsed.typography.length; i++) {
      if (uniqueFonts.indexOf(parsed.typography[i].font) === -1) uniqueFonts.push(parsed.typography[i].font);
    }
    
    safeSetValue(getOrCreateSmartVariable("fontFamily/primary", "STRING", "Typography"), uniqueFonts[0] || "Inter", 0);
    safeSetValue(getOrCreateSmartVariable("fontFamily/secondary", "STRING", "Typography"), "Inter", 0);

    for (var i = 0; i < parsed.typography.length; i++) {
      const t = parsed.typography[i];
      const base = (t.group ? t.group + "/" : "") + t.token;
      safeSetValue(getOrCreateSmartVariable("fontWeight/" + getSemanticWeightName(t.weight), "STRING", "Typography"), resolveFontStyle(t.weight), 0);

      const add = (sub, val, type) => {
        const v = getOrCreateSmartVariable(base + "/" + sub, type, "Typography");
        const parsedVal = (sub === 'LineHeight') ? parseLineHeightValue(val) : parseFloat(val);
        safeSetValue(v, parsedVal, 0);
        results.typography++;
      };
      add("Size", t.size, "FLOAT");
      add("LineHeight", t.lineHeight, "FLOAT");
      if (t.ls && t.ls !== "0" && t.ls !== "0px") add("LetterSpacing", t.ls, "FLOAT");
    }
  }

  // Print grouped summary of new creations
  const categories = Object.keys(newCreations);
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (newCreations[cat] > 0) {
      sendQA("✅ 신규 생성 요약: '" + cat + "' 컬렉션에 " + newCreations[cat] + "개의 토큰이 새로 생성되었습니다.");
    }
  }

  return results;
}

async function createStyles(parsed, options) {
  const results = { text: 0, effect: 0, grid: 0, color: 0 };
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMap = new Map();
  allVars.forEach(v => varMap.set(v.name, v));

  if (options.text) {
    sendLog('info', "Creating Text styles...");
    const existingTextStyles = await figma.getLocalTextStylesAsync();
    const textStyleMap = new Map();
    existingTextStyles.forEach(s => textStyleMap.set(s.name, s));

    for (var i = 0; i < parsed.typography.length; i++) {
      const t = parsed.typography[i];
      const name = (t.group ? t.group + "/" : "") + t.token;
      let s = textStyleMap.get(name) || figma.createTextStyle();
      s.name = name;
      const fStyle = resolveFontStyle(t.weight);
      let family = t.font;
      let style = fStyle;
      let isFontLoaded = true;

      await figma.loadFontAsync({ family, style }).catch(async () => {
        isFontLoaded = false;
        family = "Inter"; style = "Regular";
        await figma.loadFontAsync({ family, style });
        sendQA("Font fallback: '" + t.font + "' not found. Style '" + name + "' switched to implementation fallback (Inter).");
      });

      s.fontName = { family, style };
      s.fontSize = parseFloat(t.size);
      const lhObj = parseLineHeightObj(t.lineHeight);
      s.lineHeight = lhObj;
      s.letterSpacing = { value: parseFloat(t.ls) || 0, unit: "PIXELS" };
      
      try {
        const fv = varMap.get(name + "/Size");
        const lv = varMap.get(name + "/LineHeight");
        const sv = varMap.get(name + "/LetterSpacing");
        
        const ffVar = isFontLoaded ? varMap.get("fontFamily/primary") : varMap.get("fontFamily/secondary");
        const semanticName = getSemanticWeightName(t.weight);
        const fwVar = varMap.get("fontWeight/" + semanticName);

        if (fv) s.setBoundVariable("fontSize", fv);
        if (lv && lhObj.unit === "PIXELS") s.setBoundVariable("lineHeight", lv);
        if (sv) s.setBoundVariable("letterSpacing", sv);
        if (ffVar) s.setBoundVariable("fontFamily", ffVar);
        if (fwVar) s.setBoundVariable("fontStyle", fwVar);
      } catch (e) {
        sendQA("Binding Error (" + name + "): " + e.message);
      }
      results.text++;
    }
  }

  if (options.color) {
    sendLog('info', "Creating Color styles...");
    const existingPaintStyles = await figma.getLocalPaintStylesAsync();
    const paintStyleMap = new Map();
    existingPaintStyles.forEach(s => paintStyleMap.set(s.name, s));
    for (var i = 0; i < parsed.colors.semantic.length; i++) {
      const s = parsed.colors.semantic[i];
      let ps = paintStyleMap.get(s.token) || figma.createPaintStyle();
      ps.name = s.token;
      const v = varMap.get("semantic/" + s.token);
      if (v) ps.paints = [figma.variables.setBoundVariableForPaint(figma.util.solidPaint("#000000"), "color", v)];
      else ps.paints = [{ type: "SOLID", color: hexToRgb(s.light) }];
      results.color++;
    }
  }

  if (options.effect) {
    sendLog('info', "Creating Effect styles...");
    const existingEffectStyles = await figma.getLocalEffectStylesAsync();
    const effectStyleMap = new Map();
    existingEffectStyles.forEach(s => effectStyleMap.set(s.name, s));
    for (var i = 0; i < parsed.effects.length; i++) {
      const e = parsed.effects[i];
      let es = effectStyleMap.get(e.token) || figma.createEffectStyle();
      es.name = e.token;
      const effect = {
        type: "DROP_SHADOW", color: parseRgbaColor(e.color) || {r:0,g:0,b:0,a:0.1},
        offset: {x: parseFloat(e.x), y: parseFloat(e.y)}, radius: parseFloat(e.blur), spread: parseFloat(e.spread), visible: true, blendMode: "NORMAL"
      };
      const bv = varMap.get("primitive/" + e.blur) || varMap.get("semantic/" + e.blur) || varMap.get("primitive/" + parseFloat(e.blur) + "px");
      if (bv) effect.boundVariables = { radius: { type: "VARIABLE_ALIAS", id: bv.id } };
      es.effects = [effect];
      results.effect++;
    }
  }

  if (options.grid) {
    sendLog('info', "Creating Grid styles...");
    var existingGridStyles = await figma.getLocalGridStylesAsync();
    var gridStyleMap = new Map();
    for (var i = 0; i < existingGridStyles.length; i++) {
      gridStyleMap.set(existingGridStyles[i].name, existingGridStyles[i]);
    }
    for (var i = 0; i < parsed.grid.length; i++) {
      var g = parsed.grid[i];
      var gs = gridStyleMap.get(g.token) || figma.createGridStyle();
      gs.name = g.token;
      var grid = null;
      if (g.type === "grid") {
        grid = { 
          pattern: "GRID", 
          sectionSize: parseFloat(g.count) || 8, 
          color: { r: 1, g: 0, b: 0, a: 0.1 } 
        };
      } else {
        var rawAlign = String(g.align || 'stretch').toUpperCase();
        var validAlign = (rawAlign === 'CENTER' || rawAlign === 'MIN' || rawAlign === 'MAX' || rawAlign === 'STRETCH') ? rawAlign : 'STRETCH';
        grid = {
          pattern: g.type.toUpperCase() === 'ROWS' ? 'ROWS' : 'COLUMNS',
          count: parseInt(g.count) || 12,
          gutterSize: parseFloat(g.gutter) || 0,
          offset: parseFloat(g.margin) || 0,
          alignment: validAlign,
          color: { r: 1, g: 0, b: 0, a: 0.1 }
        };
      }
      if (grid) gs.layoutGrids = [grid];
      results.grid++;
    }
  }
  return results;
}

async function generateExportMD() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMapById = new Map();
  allVars.forEach(v => varMapById.set(v.id, v));

  let md = "<!-- [MD_TO_FIGMA_EXPORT_LOG] -->\n\n# Design System\n\n";

  // Group variables by their potential category based on type and name/collection
  const colorVars = [];
  const spacingVars = [];
  const radiusVars = [];

  allVars.forEach(v => {
    const col = collections.find(c => c.id === v.variableCollectionId);
    const colName = col ? col.name.toLowerCase() : "";
    const varName = v.name.toLowerCase();

    if (v.resolvedType === "COLOR") {
      colorVars.push(v);
    } else if (v.resolvedType === "FLOAT") {
      if (colName.includes("spacing") || varName.includes("spacing") || varName.includes("gap") || varName.includes("padding")) {
        spacingVars.push(v);
      } else if (colName.includes("radius") || varName.includes("radius") || varName.includes("corner") || varName.includes("round")) {
        radiusVars.push(v);
      }
    }
  });

  const extractVariableData = (vars, categoryName, isColor) => {
    if (vars.length === 0) return "";
    let sMd = "## " + categoryName + "\n\n### Tokens\n";
    if (isColor) sMd += "| Token | Value | Description |\n|---|---|---|\n";
    else sMd += "| Token | Value | Description |\n|---|---|---|\n";

    let rows = [];
    vars.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      
      let displayVal = "";
      if (val && val.type === "VARIABLE_ALIAS") {
        const target = varMapById.get(val.id);
        displayVal = target ? target.name : "[Alias]";
      } else {
        displayVal = isColor ? rgbToHex(val) : val + "px";
      }
      
      rows.push("| " + v.name + " | " + displayVal + " | " + (v.description || "-") + " |");
    });
    
    return sMd + rows.join("\n") + "\n\n";
  };

  md += extractVariableData(colorVars, "Colors", true);
  md += extractVariableData(spacingVars, "Spacing", false);
  md += extractVariableData(radiusVars, "Radius", false);

  const tStyles = await figma.getLocalTextStylesAsync();
  if (tStyles.length > 0) {
    md += "## Typography\n\n";
    const gs = {};
    const revWeightMap = {};
    const weightKeys = Object.keys(weightMap);
    for (var i = 0; i < weightKeys.length; i++) {
      const key = weightKeys[i];
      const val = weightMap[key];
      const normVal = val.toLowerCase().replace(/[\s\-_]/g, "");
      if (!revWeightMap[normVal] && /^\d+$/.test(key)) revWeightMap[normVal] = key;
    }

    const colTypo = collections.find(c => {
      const n = c.name.toLowerCase();
      return n.includes("typo") || n.includes("type") || n.includes("font");
    });
    
    const ffPrimaryVar = allVars.find(v => (v.name.includes("fontFamily/primary") || v.name.includes("family")) && colTypo && v.variableCollectionId === colTypo.id);
    const primaryFontValue = (ffPrimaryVar && colTypo) ? ffPrimaryVar.valuesByMode[colTypo.modes[0].modeId] : null;

    tStyles.forEach(s => {
      const parts = s.name.split("/");
      const g = parts.length > 1 ? parts[0] : "default";
      const t = parts.length > 1 ? parts.slice(1).join("/") : s.name;
      if (!gs[g]) gs[g] = [];
      const lh = s.lineHeight.unit === "PERCENT" ? Math.round(s.lineHeight.value) + "%" : roundVal(s.lineHeight.value) + "px";
      const ls = roundVal(s.letterSpacing.value) + (s.letterSpacing.unit === "PIXELS" ? "px" : "%");
      
      const normalizedStyle = s.fontName.style.toLowerCase().replace(/[\s\-_]/g, "");
      const semanticWeight = revWeightMap[normalizedStyle] || s.fontName.style;
      
      let exportedFontFamily = s.fontName.family;
      if (s.boundVariables && s.boundVariables.fontFamily) {
        const boundVarId = s.boundVariables.fontFamily.id;
        if (ffPrimaryVar && boundVarId === ffPrimaryVar.id && primaryFontValue) {
          exportedFontFamily = primaryFontValue;
        }
      }

      gs[g].push("| " + t + " | " + exportedFontFamily + " | " + roundVal(s.fontSize) + "px | " + semanticWeight + " | " + lh + " | " + ls + " |");
    });
    const groups = Object.keys(gs);
    for (var i = 0; i < groups.length; i++) {
      const g = groups[i];
      md += "### " + g + "\n| Token | Font | Size | Weight | LineHeight | LetterSpacing |\n|---|---|---|---|---|---|\n" + gs[g].join("\n") + "\n\n";
    }
  }

  const paintStyles = await figma.getLocalPaintStylesAsync();
  if (paintStyles.length > 0 && colorVars.length === 0) {
    md += "## Colors (from Styles)\n\n| Token | Value | Description |\n|---|---|---|\n";
    paintStyles.forEach(ps => {
      const p = ps.paints[0];
      if (p && p.type === "SOLID") {
        md += "| " + ps.name + " | " + rgbToHex(p.color) + " | " + (ps.description || "-") + " |\n";
      }
    });
    md += "\n";
  }

  const eStyles = await figma.getLocalEffectStylesAsync();
  if (eStyles.length > 0) {
    md += "## Effects\n\n| Token | Type | Color | X | Y | Blur | Spread |\n|---|---|---|---|---|---|---|\n";
    eStyles.forEach(s => {
      if (s.effects.length > 0) {
        const e = s.effects[0];
        if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
          md += "| " + s.name + " | " + (e.type === "DROP_SHADOW" ? "drop-shadow" : "inner-shadow") + " | " + rgbaToString(e.color) + " | " + roundVal(e.offset.x) + "px | " + roundVal(e.offset.y) + "px | " + roundVal(e.radius) + "px | " + roundVal(e.spread) + "px |\n";
        }
      }
    });
    md += "\n";
  }

  const gStyles = await figma.getLocalGridStylesAsync();
  if (gStyles.length > 0) {
    md += "## Grid\n\n| Token | Type | Count | Width | Gutter | Margin | Alignment |\n|---|---|---|---|---|---|---|\n";
    gStyles.forEach(s => {
      if (s.layoutGrids.length > 0) {
        const g = s.layoutGrids[0];
        if (g.pattern === "GRID") {
          md += "| " + s.name + " | grid | " + roundVal(g.sectionSize) + "px | - | - | - | - |\n";
        } else {
          md += "| " + s.name + " | " + g.pattern.toLowerCase() + " | " + g.count + " | auto | " + roundVal(g.gutterSize) + "px | " + roundVal(g.offset) + "px | " + g.alignment.toLowerCase() + " |\n";
        }
      }
    });
    md += "\n";
  }
  return { mdContent: md };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "generate") {
    try {
      sendLog("info", "MD parsing and generation started...");
      const parsed = parseMD(msg.content);
      
      // Validation Log for AI guidance
      if (parsed.colors.primitive.length === 0 && parsed.colors.semantic.length === 0) {
        sendQA("AI Prompt (Copy this): ## Colors 섹션의 컬러 데이터가 감지되지 않았습니다. AI에게 '마크다운의 ## Colors 섹션 테이블 구조를 확인하고, 최소 2개 이상의 컬럼(Token, Value)을 포함한 유효한 테이블 형식으로 다시 작성해줘'라고 요청하세요.");
      }
      if (parsed.typography.length === 0) {
        sendQA("AI Prompt (Copy this): ## Typography 섹션 데이터가 감지되지 않았습니다. AI에게 '## Typography 섹션의 테이블 형식이 6개 컬럼(Token, Font, Size, Weight, LineHeight, LetterSpacing)을 갖춘 마크다운 테이블인지 확인하고 교정해줘'라고 요청하세요.");
      }

      const vRes = await createAllVariables(parsed, msg.options.variables);
      const sRes = await createStyles(parsed, msg.options.styles);
      figma.ui.postMessage({ type: "complete", results: { variables: vRes, styles: sRes } });
      sendLog("success", "All systems synced successfully!");
    } catch (e) { sendError("Sync failed", e.message); }
  }
  if (msg.type === "export") {
    try {
      sendLog("info", "Analyzing and exporting Figma data...");
      const exportData = await generateExportMD();
      figma.ui.postMessage({ type: "export_complete", mdContent: exportData.mdContent });
    } catch (e) { sendError("Export failed", e.message); }
  }
  if (msg.type === "cancel") figma.closePlugin();
};