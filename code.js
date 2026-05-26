/**
 * MD to Figma - v2.0.0 Official Stable Release
 * The Complete Bidirectional Semantic Design System Engine
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
    if (line.indexOf("## ") === 0) { sec = line.replace("## ", "").toLowerCase(); sub = ""; typoGroup = ""; continue; }
    if (line.indexOf("### ") === 0) { 
      const name = line.replace("### ", "").trim();
      if (sec === 'typography') typoGroup = name.toLowerCase();
      else sub = name.toLowerCase();
      continue;
    }
    if (line.indexOf("|") === 0 && line.indexOf("---") === -1) {
      const c = line.split("|").map(x => x.trim()).filter(x => x !== "");
      if (c.length < 2 || c[0].toLowerCase() === "token") continue;
      if (sec === 'colors') {
        if (sub === 'primitive') res.colors.primitive.push({ token: c[0], value: c[1] || "#000000", desc: c[2] || "" });
        else if (sub === 'semantic') res.colors.semantic.push({ token: c[0], light: c[1] || "", dark: c[2] || c[1] || "", desc: c[3] || "" });
      } else if (sec === 'spacing' || sec === 'radius') {
        if (res[sec] && res[sec][sub]) {
          const target = res[sec][sub];
          if (sub === 'primitive') target.push({ token: c[0], value: c[1] || "0px", desc: c[2] || "" });
          else if (sub === 'semantic') target.push({ token: c[0], alias: c[1] || "", desc: c[2] || "" });
        }
      } else if (sec === 'typography') {
        res.typography.push({ token: c[0], font: c[1] || "Inter", size: c[2] || "16px", weight: c[3] || "Regular", lineHeight: c[4] || "100%", ls: c[5] || "0", group: typoGroup });
      } else if (sec === 'effects') {
        res.effects.push({ token: c[0], type: c[1] || "drop-shadow", color: c[2] || "rgba(0,0,0,0.1)", x: c[3] || "0", y: c[4] || "0", blur: c[5] || "0", spread: c[6] || "0" });
      } else if (sec === 'grid') {
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
  const existingMap = new Map();
  allExisting.forEach(v => existingMap.set(v.variableCollectionId + ":" + v.name, v));

  const safeSet = (col, name, type, mId, val, key) => {
    let v = existingMap.get(key) || figma.variables.createVariable(name, col, type);
    v.setValueForMode(mId, val);
    existingMap.set(key, v);
    return v;
  };

  if (options.colors) {
    sendLog('info', "Creating Color variables...");
    const col = await getOrCreateCollection("Color");
    const hasDark = parsed.colors.semantic.some(s => s.dark && s.dark !== s.light);
    let lId = col.modes[0].modeId;
    let dId = col.modes.length > 1 ? col.modes[1].modeId : (hasDark ? col.addMode("Dark") : null);
    if (col.modes[0].name.toLowerCase().indexOf("light") === -1) col.renameMode(lId, "Light");

    const primMap = new Map();
    for (var i = 0; i < parsed.colors.primitive.length; i++) {
      const p = parsed.colors.primitive[i];
      const name = "primitive/" + p.token;
      const v = safeSet(col, name, "COLOR", lId, hexToRgb(p.value), col.id + ":" + name);
      if (dId) v.setValueForMode(dId, hexToRgb(p.value));
      primMap.set(p.token, v);
      results.colors++;
    }
    for (var i = 0; i < parsed.colors.semantic.length; i++) {
      const s = parsed.colors.semantic[i];
      const name = "semantic/" + s.token;
      const getAlias = (ref) => {
        const targetVar = primMap.get(ref);
        return targetVar ? { type: "VARIABLE_ALIAS", id: targetVar.id } : null;
      };
      const lightAlias = getAlias(s.light);
      if (lightAlias) {
        const v = safeSet(col, name, "COLOR", lId, lightAlias, col.id + ":" + name);
        if (dId) {
          const darkVar = primMap.get(s.dark) || lightVar;
          const darkAlias = darkVar ? { type: "VARIABLE_ALIAS", id: darkVar.id } : null;
          if (darkAlias) v.setValueForMode(dId, darkAlias);
        }
      }
      results.colors++;
    }
  }

  const processNumCol = async (data, colName) => {
    if (data.primitive.length === 0 && data.semantic.length === 0) return 0;
    sendLog('info', "Creating " + colName + " variables...");
    const col = await getOrCreateCollection(colName);
    const mId = col.modes[0].modeId;
    const pMap = new Map();
    let count = 0;
    for (var i = 0; i < data.primitive.length; i++) {
      const p = data.primitive[i];
      const name = "primitive/" + p.token;
      const v = safeSet(col, name, "FLOAT", mId, parseFloat(p.value), col.id + ":" + name);
      pMap.set(p.token, v);
      count++;
    }
    for (var i = 0; i < data.semantic.length; i++) {
      const s = data.semantic[i];
      const name = "semantic/" + s.token;
      const targetVar = pMap.get(s.alias);
      if (targetVar) safeSet(col, name, "FLOAT", mId, { type: "VARIABLE_ALIAS", id: targetVar.id }, col.id + ":" + name);
      count++;
    }
    return count;
  };

  if (options.spacing) results.spacing = await processNumCol(parsed.spacing, "Spacing");
  if (options.radius) results.radius = await processNumCol(parsed.radius, "Radius");

  if (options.typography && parsed.typography.length > 0) {
    sendLog('info', "Creating Typography variables...");
    const col = await getOrCreateCollection("Typography");
    const mId = col.modes[0].modeId;

    const uniqueFonts = [];
    for (var i = 0; i < parsed.typography.length; i++) {
      if (uniqueFonts.indexOf(parsed.typography[i].font) === -1) uniqueFonts.push(parsed.typography[i].font);
    }
    
    safeSet(col, "fontFamily/primary", "STRING", mId, uniqueFonts[0] || "Inter", col.id + ":fontFamily/primary");
    safeSet(col, "fontFamily/secondary", "STRING", mId, "Inter", col.id + ":fontFamily/secondary");

    for (var i = 0; i < parsed.typography.length; i++) {
      const t = parsed.typography[i];
      const base = (t.group ? t.group + "/" : "") + t.token;
      const rawW = String(t.weight || "400").trim().toLowerCase();
      const fStyle = resolveFontStyle(rawW);
      const semanticName = getSemanticWeightName(t.weight);
      const wName = "fontWeight/" + semanticName;
      safeSet(col, wName, "STRING", mId, fStyle, col.id + ":" + wName);

      const add = (sub, val, type) => {
        const name = base + "/" + sub;
        const parsedVal = (sub === 'LineHeight') ? parseLineHeightValue(val) : parseFloat(val);
        safeSet(col, name, type, mId, parsedVal, col.id + ":" + name);
        results.typography++;
      };
      add("Size", t.size, "FLOAT");
      add("LineHeight", t.lineHeight, "FLOAT");
      if (t.ls && t.ls !== "0" && t.ls !== "0px") add("LetterSpacing", t.ls, "FLOAT");
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

  const extractCol = (colName, mdName) => {
    let col = null;
    for (var i = 0; i < collections.length; i++) {
      if (collections[i].name.toLowerCase() === colName.toLowerCase()) { col = collections[i]; break; }
    }
    if (!col) return "";
    let sMd = "## " + mdName + "\n\n### Primitive\n| Token | Value | Description |\n|---|---|---|\n";
    const vars = allVars.filter(v => v.variableCollectionId === col.id);
    let pR = [], sR = [];
    const mId = col.modes[0].modeId;
    const dId = col.modes.length > 1 ? col.modes[1].modeId : null;

    vars.forEach(v => {
      const lV = v.valuesByMode[mId];
      if (v.name.indexOf("primitive/") === 0) {
        const val = colName === "Color" ? rgbToHex(lV) : lV + "px";
        pR.push("| " + v.name.replace("primitive/", "") + " | " + val + " | " + (v.description || "-") + " |");
      } else if (v.name.indexOf("semantic/") === 0) {
        const clean = v.name.replace(/^(primitive|semantic)\//, "");
        const getRef = (val, mN) => {
          if (val && val.type === "VARIABLE_ALIAS") {
            const target = varMapById.get(val.id);
            return target ? target.name.replace(/^(primitive|semantic)\//, "") : "";
          }
          const recN = "recovered/" + clean + "-" + mN;
          const recV = colName === "Color" ? rgbToHex(val) : val + "px";
          pR.push("| " + recN + " | " + recV + " | [Auto-Recovered] |");
          sendQA("Recovery: " + mdName + " '" + v.name + "' reference lost, created '" + recN + "'.");
          return recN;
        };
        if (colName === "Color") {
          const dV = dId ? v.valuesByMode[dId] : lV;
          sR.push("| " + clean + " | " + getRef(lV, "light") + " | " + getRef(dV, "dark") + " | " + (v.description || "-") + " |");
        } else {
          sR.push("| " + clean + " | " + getRef(lV, "alias") + " | " + (v.description || "-") + " |");
        }
      }
    });
    if (pR.length === 0 && sR.length === 0) return "";
    sMd += pR.join("\n") + "\n\n### Semantic\n";
    if (colName === "Color") sMd += "| Token | Light | Dark | Description |\n|---|---|---|---|\n";
    else sMd += "| Token | Alias | Description |\n|---|---|---|\n";
    sMd += sR.join("\n") + "\n\n";
    return sMd;
  };

  md += extractCol("Color", "Colors");
  md += extractCol("Spacing", "Spacing");
  md += extractCol("Radius", "Radius");

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

    let colTypo = null;
    for (var i = 0; i < collections.length; i++) {
      if (collections[i].name.toLowerCase() === 'typography') { colTypo = collections[i]; break; }
    }
    const ffPrimaryVar = allVars.find(v => v.name === "fontFamily/primary" && colTypo && v.variableCollectionId === colTypo.id);
    const ffSecondaryVar = allVars.find(v => v.name === "fontFamily/secondary" && colTypo && v.variableCollectionId === colTypo.id);
    
    const primaryFontValue = (ffPrimaryVar && colTypo) ? ffPrimaryVar.valuesByMode[colTypo.modes[0].modeId] : null;
    const secondaryFontValue = (ffSecondaryVar && colTypo) ? ffSecondaryVar.valuesByMode[colTypo.modes[0].modeId] : null;

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
        } else if (ffSecondaryVar && boundVarId === ffSecondaryVar.id) {
          exportedFontFamily = primaryFontValue || secondaryFontValue;
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