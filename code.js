/**
 * MD to Figma - v2.1.0 Official Stable Release
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

// --- Motion tokens (Timing / Easing) ---
// The Plugin API stores TIMING variables in SECONDS, while the Figma UI and CSS
// both speak milliseconds. MD is authored in ms; convert on the way in and out.
const parseTimingValue = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  if (raw.indexOf("ms") !== -1) return num / 1000;
  if (raw.indexOf("s") !== -1) return num;
  return num > 10 ? num / 1000 : num;
};

const timingToMs = (seconds) => {
  const n = parseFloat(seconds);
  return isNaN(n) ? "0ms" : Math.round(n * 1000) + "ms";
};

// Preset lookup ignores case and separators, so the Figma UI label ("Ease in and out"),
// a hyphenated token ("ease-in-and-out"), "easeInAndOut" and "Ease in & out" all resolve alike.
const easingKey = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const easingPresetMap = {
  'linear': 'LINEAR',
  'easein': 'EASE_IN',
  'easeout': 'EASE_OUT',
  'ease': 'EASE_IN_AND_OUT', 'easeinout': 'EASE_IN_AND_OUT', 'easeinandout': 'EASE_IN_AND_OUT',
  'easeinback': 'EASE_IN_BACK',
  'easeoutback': 'EASE_OUT_BACK',
  'easeinoutback': 'EASE_IN_AND_OUT_BACK', 'easeinandoutback': 'EASE_IN_AND_OUT_BACK',
  'gentle': 'GENTLE', 'quick': 'QUICK', 'bouncy': 'BOUNCY', 'slow': 'SLOW',
  'hold': 'HOLD', 'step': 'HOLD', 'none': 'HOLD'
};

// Export uses the exact labels the Figma UI shows, so the MD and the panel read alike.
const easingTypeToName = {
  'LINEAR': 'Linear', 'EASE_IN': 'Ease in', 'EASE_OUT': 'Ease out', 'EASE_IN_AND_OUT': 'Ease in and out',
  'EASE_IN_BACK': 'Ease in back', 'EASE_OUT_BACK': 'Ease out back', 'EASE_IN_AND_OUT_BACK': 'Ease in and out back',
  'GENTLE': 'Gentle', 'QUICK': 'Quick', 'BOUNCY': 'Bouncy', 'SLOW': 'Slow', 'HOLD': 'Hold'
};

// Returns a MotionEasing object, or null when the notation is not understood.
const parseEasingValue = (value) => {
  const raw = String(value || "").trim();
  const low = raw.toLowerCase();

  const bez = low.match(/cubic-bezier\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
  if (bez) {
    return {
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: { x1: parseFloat(bez[1]), y1: parseFloat(bez[2]), x2: parseFloat(bez[3]), y2: parseFloat(bez[4]) }
    };
  }

  const spr = low.match(/spring\s*\(\s*([\d.]+)\s*\)/);
  if (spr) {
    let bounce = parseFloat(spr[1]);
    if (isNaN(bounce)) bounce = 0;
    if (bounce < 0) bounce = 0;
    if (bounce > 1) bounce = 1;
    return { type: 'CUSTOM_SPRING', easingFunctionSpring: { bounce: bounce } };
  }

  const preset = easingPresetMap[easingKey(raw)];
  return preset ? { type: preset } : null;
};

// Serializes a MotionEasing value back into the MD notation above.
const easingToString = (val) => {
  if (!val || !val.type) return "-";
  if (val.type === 'CUSTOM_CUBIC_BEZIER') {
    const b = val.easingFunctionCubicBezier;
    if (!b) return "ease-in-and-out";
    // Figma stores control points as float32, so 0.7 reads back as 0.699999988079071.
    // 5 decimals removes that noise while keeping any precision a dragged handle really has.
    const num = (n) => (typeof n === "number" && isFinite(n)) ? String(parseFloat(n.toFixed(5))) : "0";
    return "cubic-bezier(" + num(b.x1) + ", " + num(b.y1) + ", " + num(b.x2) + ", " + num(b.y2) + ")";
  }
  if (val.type === 'CUSTOM_SPRING') {
    const s = val.easingFunctionSpring;
    return "spring(" + (s && isFinite(s.bounce) ? String(parseFloat(s.bounce.toFixed(5))) : "0.5") + ")";
  }
  return easingTypeToName[val.type] || "-";
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

const cleanTokenName = (name) => {
  return String(name || "").replace(/^(primitive|semantic)\//i, '');
};

const normalizeName = (name) => {
  return cleanTokenName(name).toLowerCase().replace(/[\s\-_\/]/g, "");
};

function parseMD(content) {
  const res = { colors: { primitive: [], semantic: [] }, spacing: { primitive: [], semantic: [] }, radius: { primitive: [], semantic: [] }, typography: [], effects: [], grid: [], motion: { timing: [], easing: [] } };
  const lines = content.split('\n');
  res.variableModes = null;
  res.motionStyles = [];
  let sec = '', sub = '', typoGroup = '';
  
  for (var i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.indexOf("## ") === 0) { 
      sec = line.replace("## ", "").toLowerCase(); 
      sub = ""; typoGroup = ""; 
      continue; 
    }
    if (sec === 'variable modes') {
      if (res.variableModes === null) res.variableModes = [];
      if (line.indexOf('|') !== 0 || /^\|\s*-/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map(x => x.trim().replace(/&#124;/g, '|'));
      if (cells[0] === 'Category') continue;
      if (cells.length !== 7) throw new Error('Variable Modes: expected 7 columns.');
      try {
        res.variableModes.push({ category: cells[0], collection: JSON.parse(cells[1]), token: JSON.parse(cells[2]), type: cells[3], mode: JSON.parse(cells[4]), value: JSON.parse(cells[5]), description: JSON.parse(cells[6]) });
      } catch (e) { throw new Error('Variable Modes: invalid JSON cell: ' + e.message); }
      continue;
    }
    if (line.indexOf("### ") === 0) { 
      const name = line.replace("### ", "").trim();
      sub = name.toLowerCase();
      if (sec.includes('typography')) typoGroup = name;
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
        if (c.length === 3 && /^[\[{]/.test(c[2])) {
          res.effects.push({ token: c[0], type: c[1], settings: JSON.parse(c[2].replace(/&#124;/g, '|')) });
        } else res.effects.push({ token: c[0], type: c[1] || "drop-shadow", color: c[2] || "rgba(0,0,0,0.1)", x: c[3] || "0", y: c[4] || "0", blur: c[5] || "0", spread: c[6] || "0" });
      } else if (sec === 'motion styles') {
        if (c.length !== 2) throw new Error('Motion Styles: Token / Entries 두 열이 필요합니다.');
        res.motionStyles.push({ token: c[0], entries: JSON.parse(c[1].replace(/&#124;/g, '|')) });
      } else if (sec.includes('motion')) {
        const mv = c[1] || "";
        const looksEasing = sub.includes('easing') || sub.includes('curve') ||
                            (!sub.includes('timing') && !sub.includes('duration') && !/^[\d.]/.test(mv.trim()));
        if (looksEasing) {
          res.motion.easing.push({ token: c[0], value: mv || "linear", desc: c[2] || "" });
        } else {
          res.motion.timing.push({ token: c[0], value: mv || "0ms", desc: c[2] || "" });
        }
      } else if (sec.includes('grid')) {
        if (c.length === 3 && /^[\[{]/.test(c[2])) res.grid.push({ token: c[0], type: c[1], settings: JSON.parse(c[2].replace(/&#124;/g, '|')) });
        else res.grid.push({ token: c[0], type: c[1] || "columns", count: c[2] || "1", width: c[3] || "auto", gutter: c[4] || "0", margin: c[5] || "0", align: c[6] || "stretch" });
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

// Exact collection/name identities are intentional here: fuzzy matching is unsafe
// when two collections contain the same token with different mode values.
async function syncVariableModes(rows, options) {
  const results = { colors: 0, spacing: 0, radius: 0, typography: 0, motion: 0 };
  const scanned = { colors: 0, spacing: 0, radius: 0, typography: 0, motion: 0 };
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const identity = (collection, token) => JSON.stringify([collection, token]);
  const byName = new Map();
  variables.forEach(v => {
    const col = collections.find(c => c.id === v.variableCollectionId);
    if (col) byName.set(identity(col.name, v.name), v);
  });
  const selected = rows.filter(r => options[r.category]);
  const seenRows = new Set();
  const incomingTypes = new Map();
  selected.forEach(r => {
    if (typeof r.collection !== 'string' || !r.collection || typeof r.token !== 'string' || !r.token || typeof r.mode !== 'string' || !r.mode || typeof r.description !== 'string' || ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN', 'TIMING', 'EASING'].indexOf(r.type) === -1) throw new Error('Variable Modes: invalid identity or type.');
    const key = JSON.stringify([r.collection, r.token, r.mode]);
    if (seenRows.has(key)) throw new Error('Variable Modes: duplicate row for ' + r.token + ' / ' + r.mode);
    seenRows.add(key);
    const tokenKey = identity(r.collection, r.token);
    if (incomingTypes.has(tokenKey) && incomingTypes.get(tokenKey) !== r.type) throw new Error('Variable Modes: inconsistent type for ' + r.token);
    incomingTypes.set(tokenKey, r.type);
    const existing = byName.get(identity(r.collection, r.token));
    if (existing && existing.resolvedType !== r.type) throw new Error('Variable Modes: type conflict for ' + r.collection + '/' + r.token);
  });
  const prepared = new Map();
  const failedModes = new Set();
  selected.forEach(r => {
    let col = collections.find(c => c.name === r.collection);
    if (!col) {
      col = figma.variables.createVariableCollection(r.collection);
      col.renameMode(col.defaultModeId, r.mode);
      collections.push(col);
    }
    const modeKey = identity(r.collection, r.mode);
    if (!col.modes.some(m => m.name === r.mode) && !failedModes.has(modeKey)) {
      try { col.addMode(r.mode); }
      catch (e) { failedModes.add(modeKey); sendQA('Mode skipped: ' + r.collection + ' / ' + r.mode + ': ' + e.message); }
    }
    const key = identity(r.collection, r.token);
    if (prepared.has(key)) return;
    let v = byName.get(key);
    try {
      if (!v) { v = figma.variables.createVariable(r.token, col, r.type); byName.set(key, v); }
      if (typeof v.setPluginData === 'function') v.setPluginData('mdToFigmaCategory', r.category);
      prepared.set(key, { variable: v, category: r.category, touched: false });
    } catch (e) { sendQA('Variable skipped: ' + r.token + ': ' + e.message); }
  });
  selected.forEach(r => {
    const entry = prepared.get(identity(r.collection, r.token));
    if (!entry) return;
    const col = collections.find(c => c.id === entry.variable.variableCollectionId);
    const mode = col.modes.find(m => m.name === r.mode);
    if (!mode) return; // Never fall back to another mode on an addMode failure.
    let value = r.value;
    if (value && value.alias) {
      const target = byName.get(identity(value.alias.collection, value.alias.token));
      if (!target || target.resolvedType !== r.type) { sendQA('Alias skipped: ' + r.token + ' / ' + r.mode); return; }
      value = { type: 'VARIABLE_ALIAS', id: target.id };
    }
    try {
      if (JSON.stringify(entry.variable.valuesByMode[mode.modeId]) !== JSON.stringify(value)) {
        entry.variable.setValueForMode(mode.modeId, value);
        entry.touched = true;
      }
      if (entry.variable.description !== r.description) { entry.variable.description = r.description; entry.touched = true; }
    } catch (e) { sendQA('Value skipped: ' + r.token + ' / ' + r.mode + ': ' + e.message); }
  });
  prepared.forEach(entry => { scanned[entry.category]++; if (entry.touched) results[entry.category]++; });
  results.scanned = scanned;
  return results;
}

async function createAllVariables(parsed, options) {
  if (parsed.variableModes !== null) return syncVariableModes(parsed.variableModes, options);
  const results = { colors: 0, spacing: 0, radius: 0, typography: 0, motion: 0 };
  // results counts tokens actually written (new or value changed); scanned counts every token examined.
  const scanned = { colors: 0, spacing: 0, radius: 0, typography: 0, motion: 0 };
  const allExisting = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  
  const globalVarMap = new Map();
  const normalizedVarMap = new Map();
  
  // A name can exist in more than one collection (Spacing/semantic/md vs Radius/semantic/md),
  // so candidates are kept as lists and picked by collection, not last-write-wins.
  const candidateMap = new Map();
  const claimedBy = new Map();
  const KNOWN_TARGETS = ['color', 'spacing', 'radius', 'typography', 'motion'];

  const addCandidate = (key, v) => {
    if (!key) return;
    if (!candidateMap.has(key)) candidateMap.set(key, []);
    const list = candidateMap.get(key);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === v.id) return;
    }
    list.push(v);
  };

  // Deliberately NOT keyed on the last path segment: that would let 'display/lg/Size'
  // grab 'display/xl/Size'. normalizeName already covers the documented fuzzy case
  // (primitive/ and semantic/ prefixes, and - vs / vs _ separators).
  const registerCandidate = (v) => {
    addCandidate(v.name.toLowerCase(), v);
    addCandidate(normalizeName(v.name), v);
  };

  allExisting.forEach(v => {
    globalVarMap.set(v.name.toLowerCase(), v);
    const simpleName = v.name.split('/').pop().toLowerCase();
    if (!globalVarMap.has(simpleName)) globalVarMap.set(simpleName, v);
    
    const norm = normalizeName(v.name);
    if (norm) normalizedVarMap.set(norm, v);

    registerCandidate(v);
  });

  const collectionNameOf = (v) => {
    const col = collections.find(c => c.id === v.variableCollectionId);
    return col ? col.name.toLowerCase() : "";
  };

  // Priority: the target collection first, then a collection the plugin does not manage
  // (a designer's own structure), and never a token that belongs to another category.
  const findSmartMatch = (name, defaultColName) => {
    const target = String(defaultColName || "").toLowerCase();
    const keys = [name.toLowerCase(), normalizeName(name)];
    const pool = [];
    const seen = new Set();
    for (var k = 0; k < keys.length; k++) {
      const list = keys[k] ? candidateMap.get(keys[k]) : null;
      if (!list) continue;
      for (var j = 0; j < list.length; j++) {
        if (!seen.has(list[j].id)) {
          seen.add(list[j].id);
          pool.push(list[j]);
        }
      }
    }
    if (pool.length === 0) return null;

    const eligible = (v) => !claimedBy.has(v.id) || claimedBy.get(v.id) === target;

    for (var i = 0; i < pool.length; i++) {
      if (collectionNameOf(pool[i]) === target && eligible(pool[i])) return pool[i];
    }
    for (var i = 0; i < pool.length; i++) {
      if (KNOWN_TARGETS.indexOf(collectionNameOf(pool[i])) === -1 && eligible(pool[i])) return pool[i];
    }
    return null;
  };

  const loggedMatches = new Set();
  const newVarIds = new Set();
  const pendingMatch = new Map();
  const newCreations = { Color: 0, Spacing: 0, Radius: 0, Typography: 0, Motion: 0 };
  
  const getOrCreateSmartVariable = (name, type, defaultColName) => {
    const lowName = name.toLowerCase();
    const simpleName = name.split('/').pop().toLowerCase();
    const normName = normalizeName(name);
    
    let v = findSmartMatch(name, defaultColName);
    if (v) {
      if (typeof v.setPluginData === 'function') v.setPluginData('mdToFigmaCategory', ({ Color: 'colors', Spacing: 'spacing', Radius: 'radius', Typography: 'typography', Motion: 'motion' })[defaultColName] || 'typography');
      claimedBy.set(v.id, String(defaultColName || "").toLowerCase());
      if (!loggedMatches.has(v.id)) {
        const col = collections.find(c => c.id === v.variableCollectionId);
        // Logged later, and only if the value actually changes - see noteChange().
        pendingMatch.set(v.id, col ? col.name : "Unknown");
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
    if (typeof newVar.setPluginData === 'function') newVar.setPluginData('mdToFigmaCategory', ({ Color: 'colors', Spacing: 'spacing', Radius: 'radius', Typography: 'typography', Motion: 'motion' })[defaultColName] || 'typography');
    
    if (newCreations[defaultColName] !== undefined) {
      newCreations[defaultColName]++;
    }
    
    globalVarMap.set(lowName, newVar);
    normalizedVarMap.set(normName, newVar);
    registerCandidate(newVar);
    claimedBy.set(newVar.id, String(defaultColName || "").toLowerCase());
    loggedMatches.add(newVar.id);
    newVarIds.add(newVar.id);
    return newVar;
  };

  // Compares a stored variable value with an incoming one. Numbers and colors use a
  // tolerance because Figma round-trips them through float32.
  const valuesEqual = (a, b) => {
    if (a === b) return true;
    if (a === undefined || a === null || b === undefined || b === null) return false;
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 0.000001;
    if (typeof a === "string" || typeof b === "string") return String(a) === String(b);
    if (typeof a === "boolean" || typeof b === "boolean") return a === b;
    if (typeof a !== "object" || typeof b !== "object") return false;

    if (a.type === "VARIABLE_ALIAS" || b.type === "VARIABLE_ALIAS") {
      return a.type === b.type && a.id === b.id;
    }
    if (a.r !== undefined && b.r !== undefined) {
      const nearColor = (x, y) => Math.abs((x || 0) - (y || 0)) < 0.002;
      const aAlpha = (a.a === undefined) ? 1 : a.a;
      const bAlpha = (b.a === undefined) ? 1 : b.a;
      return nearColor(a.r, b.r) && nearColor(a.g, b.g) && nearColor(a.b, b.b) && nearColor(aAlpha, bAlpha);
    }
    if (a.type !== undefined && b.type !== undefined) {
      if (a.type !== b.type) return false;
      const near = (x, y) => Math.abs(x - y) < 0.00001;
      const ab = a.easingFunctionCubicBezier, bb = b.easingFunctionCubicBezier;
      if (ab || bb) {
        if (!ab || !bb) return false;
        if (!(near(ab.x1, bb.x1) && near(ab.y1, bb.y1) && near(ab.x2, bb.x2) && near(ab.y2, bb.y2))) return false;
      }
      const as = a.easingFunctionSpring, bs = b.easingFunctionSpring;
      if (as || bs) {
        if (!as || !bs) return false;
        if (!near(as.bounce, bs.bounce)) return false;
      }
      return true;
    }
    return false;
  };

  // Emits the Smart Match line only for an existing token whose value really moved.
  const noteChange = (variable) => {
    if (pendingMatch.has(variable.id)) {
      sendQA("Smart Match: '" + pendingMatch.get(variable.id) + "' 컬렉션의 '" + variable.name + "' 값 변경 적용.");
      pendingMatch.delete(variable.id);
    }
  };

  // Returns true when the value was actually written (i.e. it differed from what was stored).
  const safeSetValue = (variable, value, modeIndex = 0) => {
    const col = collections.find(c => c.id === variable.variableCollectionId);
    if (!col || !col.modes || col.modes.length === 0) return false;
    
    let modeId;
    if (typeof modeIndex === 'string') {
      let mode = col.modes.find(m => m.name.toLowerCase() === modeIndex.toLowerCase());
      if (!mode) {
        try { mode = { modeId: col.addMode(modeIndex) }; }
        catch (e) { sendQA("Mode skipped: " + col.name + " / " + modeIndex + ': ' + e.message); return false; }
      }
      modeId = mode.modeId;
    } else {
      modeId = modeIndex === 0 ? col.defaultModeId : (col.modes[modeIndex] && col.modes[modeIndex].modeId);
      if (!modeId) return false;
    }
    try {
      const prev = variable.valuesByMode ? variable.valuesByMode[modeId] : undefined;
      if (prev !== undefined && valuesEqual(prev, value)) return false;
      variable.setValueForMode(modeId, value);
      if (!newVarIds.has(variable.id)) noteChange(variable);
      return true;
    } catch (e) {
      sendQA("Skipped mode sync for '" + variable.name + "': " + e.message);
      return false;
    }
  };

  // A token counts toward the report when it is brand new or when a value changed.
  const countIfTouched = (variable, touched) => touched || newVarIds.has(variable.id);

  if (options.colors && (parsed.colors.primitive.length > 0 || parsed.colors.semantic.length > 0)) {
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
        const normInput = normalizeName(input);
        const targetVar = primMap.get(input) || 
                          globalVarMap.get(input.toLowerCase()) || 
                          normalizedVarMap.get(normInput);
        if (targetVar) return { type: "VARIABLE_ALIAS", id: targetVar.id };
        if (input.startsWith("#")) return hexToRgb(input);
        if (input.startsWith("rgb")) return parseRgbaColor(input);
        return null;
      };

      let touched = false;
      if (isSemantic) {
        const lVal = resolveVal(p.light);
        const dVal = resolveVal(p.dark) || lVal;
        if (lVal) {
          if (safeSetValue(v, lVal, 'Light')) touched = true;
          if (safeSetValue(v, dVal, 'Dark')) touched = true;
        }
      } else {
        const val = resolveVal(p.value);
        if (val) {
          if (safeSetValue(v, val, 0)) touched = true;
          primMap.set(p.token, v);
        }
      }
      scanned.colors++;
      if (countIfTouched(v, touched)) results.colors++;
    }
  }

  const processNumCol = async (data, colName, key) => {
    if (data.primitive.length === 0 && data.semantic.length === 0) return 0;
    sendLog('info', "Syncing " + colName + "...");
    const pMap = new Map();
    let count = 0;
    for (var i = 0; i < data.primitive.length; i++) {
      const p = data.primitive[i];
      const v = getOrCreateSmartVariable("primitive/" + p.token, "FLOAT", colName);
      const touched = safeSetValue(v, parseFloat(p.value), 0);
      pMap.set(p.token, v);
      scanned[key]++;
      if (countIfTouched(v, touched)) count++;
    }
    for (var i = 0; i < data.semantic.length; i++) {
      const s = data.semantic[i];
      const v = getOrCreateSmartVariable("semantic/" + s.token, "FLOAT", colName);
      const normAlias = normalizeName(s.alias);
      const targetVar = pMap.get(s.alias) || normalizedVarMap.get(normAlias);
      let touched = false;
      if (targetVar) touched = safeSetValue(v, { type: "VARIABLE_ALIAS", id: targetVar.id }, 0);
      scanned[key]++;
      if (countIfTouched(v, touched)) count++;
    }
    return count;
  };

  if (options.spacing) results.spacing = await processNumCol(parsed.spacing, "Spacing", "spacing");
  if (options.radius) results.radius = await processNumCol(parsed.radius, "Radius", "radius");

  if (options.typography && parsed.typography.length > 0) {
    sendLog('info', "Syncing Typography...");
    const uniqueFonts = [];
    for (var i = 0; i < parsed.typography.length; i++) {
      if (uniqueFonts.indexOf(parsed.typography[i].font) === -1) uniqueFonts.push(parsed.typography[i].font);
    }
    
    // fontFamily / fontWeight are counted too, deduped by id so a weight reused across
    // many rows is examined once rather than inflating the scanned total.
    const countedTypo = new Set();
    const syncTypoVar = (name, value) => {
      const v = getOrCreateSmartVariable(name, "STRING", "Typography");
      const touched = safeSetValue(v, value, 0);
      if (countedTypo.has(v.id)) return;
      countedTypo.add(v.id);
      scanned.typography++;
      if (countIfTouched(v, touched)) results.typography++;
    };

    syncTypoVar("fontFamily/primary", uniqueFonts[0] || "Inter");
    syncTypoVar("fontFamily/secondary", "Inter");

    for (var i = 0; i < parsed.typography.length; i++) {
      const t = parsed.typography[i];
      const base = (t.group ? t.group + "/" : "") + t.token;
      syncTypoVar("fontWeight/" + getSemanticWeightName(t.weight), resolveFontStyle(t.weight));

      const add = (sub, val, type) => {
        const v = getOrCreateSmartVariable(base + "/" + sub, type, "Typography");
        const parsedVal = (sub === 'LineHeight') ? parseLineHeightValue(val) : parseFloat(val);
        const touched = safeSetValue(v, parsedVal, 0);
        scanned.typography++;
        if (countIfTouched(v, touched)) results.typography++;
      };
      add("Size", t.size, "FLOAT");
      add("LineHeight", t.lineHeight, "FLOAT");
      if (t.ls && t.ls !== "0" && t.ls !== "0px") add("LetterSpacing", t.ls, "FLOAT");
    }
  }

  if (options.motion && (parsed.motion.timing.length > 0 || parsed.motion.easing.length > 0)) {
    sendLog('info', "Syncing Motion...");
    // TIMING / EASING variable types shipped with Plugin API v1 update 133 (2026-08-05).
    // Older Figma clients throw on createVariable for these types, so fail soft.
    let motionUnsupported = false;

    const syncMotion = (list, type, prefix, toValue) => {
      for (var i = 0; i < list.length; i++) {
        if (motionUnsupported) return;
        const item = list[i];
        const value = toValue(item.value);
        if (value === null) {
          // 'Custom bezier' / 'Custom spring' are picker labels, not values - guide the user to the value form.
          const hint = (type === "EASING")
            ? " 커브 프리셋(Hold, Linear, Ease in ...) 또는 스프링 프리셋(Gentle, Quick, Bouncy, Slow), 커스텀은 cubic-bezier(x1, y1, x2, y2) / spring(0~1) 형식으로 적어주세요."
            : " 150ms 처럼 밀리초 단위로 적어주세요.";
          sendQA("Motion: '" + item.token + "' 의 값 '" + item.value + "' 을(를) 해석하지 못해 건너뛰었습니다." + hint);
          continue;
        }
        const name = item.token.indexOf("/") !== -1 ? item.token : prefix + item.token;
        try {
          const v = getOrCreateSmartVariable(name, type, "Motion");
          const touched = safeSetValue(v, value, 0);
          scanned.motion++;
          if (countIfTouched(v, touched)) results.motion++;
        } catch (e) {
          motionUnsupported = true;
          sendQA("Motion 배리어블(Timing/Easing)을 만들 수 없습니다. 피그마를 최신 버전으로 업데이트해 주세요. (" + e.message + ")");
        }
      }
    };

    syncMotion(parsed.motion.timing, "TIMING", "duration/", parseTimingValue);
    syncMotion(parsed.motion.easing, "EASING", "easing/", parseEasingValue);
  }

  // Print grouped summary of new creations
  const categories = Object.keys(newCreations);
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (newCreations[cat] > 0) {
      sendQA("✅ 신규 생성 요약: '" + cat + "' 컬렉션에 " + newCreations[cat] + "개의 토큰이 새로 생성되었습니다.");
    }
  }

  results.scanned = scanned;
  return results;
}

async function createStyles(parsed, options) {
  // *New counts styles actually created; the plain counters stay as "processed",
  // because an existing style is re-applied every run and we do not diff its properties.
  const results = { text: 0, effect: 0, grid: 0, color: 0, motion: 0, textNew: 0, effectNew: 0, gridNew: 0, colorNew: 0, motionNew: 0 };
  const groupedName = (group, token) => token.indexOf(group + '/') === 0 ? token : group + '/' + token;
  const effectTypes = { 'drop-shadow': 'DROP_SHADOW', 'inner-shadow': 'INNER_SHADOW', 'layer-blur': 'LAYER_BLUR', 'background-blur': 'BACKGROUND_BLUR', noise: 'NOISE', texture: 'TEXTURE', glass: 'GLASS' };
  const allVars = await figma.variables.getLocalVariablesAsync();
  const styleCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const varMap = new Map();
  allVars.forEach(v => varMap.set(v.name, v));
  const restoreEffectAliases = value => {
    if (!value || typeof value !== 'object') return value;
    if (value.alias) {
      const col = styleCollections.find(c => c.name === value.alias.collection);
      const target = col && allVars.find(v => v.variableCollectionId === col.id && v.name === value.alias.token);
      if (!target) throw new Error('효과 참조 변수가 없습니다: ' + value.alias.token);
      return { type: 'VARIABLE_ALIAS', id: target.id };
    }
    if (Array.isArray(value)) return value.map(restoreEffectAliases);
    const output = {};
    Object.keys(value).forEach(key => { output[key] = restoreEffectAliases(value[key]); });
    return output;
  };
  const applyExplicitBindings = (item, fields, label) => {
    const output = Object.assign({}, item);
    delete output.boundVariables;
    const bindings = item.boundVariables || {};
    Object.keys(bindings).forEach(field => {
      try {
        if (fields.indexOf(field) === -1) throw new Error('지원하지 않는 바인딩 속성');
        const alias = restoreEffectAliases(bindings[field]);
        const target = alias && allVars.find(v => v.id === alias.id);
        if (!target || alias.type !== 'VARIABLE_ALIAS' || target.resolvedType !== (field === 'color' ? 'COLOR' : 'FLOAT')) throw new Error('참조 대상 누락 또는 타입 불일치');
        if (!output.boundVariables) output.boundVariables = {};
        output.boundVariables[field] = alias;
      } catch (err) { sendQA('Binding skipped: ' + label + '/' + field + ': ' + err.message + '. 정적 값을 사용합니다.'); }
    });
    return output;
  };

  if (options.text && parsed.typography.length > 0) {
    sendLog('info', "Creating Text styles...");
    const existingTextStyles = await figma.getLocalTextStylesAsync();
    const textStyleMap = new Map();
    existingTextStyles.forEach(s => textStyleMap.set(s.name, s));

    for (var i = 0; i < parsed.typography.length; i++) {
      const t = parsed.typography[i];
      const name = (t.group ? t.group + "/" : "") + t.token;
      const existingText = textStyleMap.get(name);
      let s = existingText || figma.createTextStyle();
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
        
        const preferredCollection = fv ? fv.variableCollectionId : null;
        const findTextVariable = (token, type) => {
          const candidates = allVars.filter(v => v.name === token && v.resolvedType === type);
          return candidates.find(v => v.variableCollectionId === preferredCollection) || (candidates.length === 1 ? candidates[0] : null);
        };
        const ensureFontVariable = (token, value) => {
          const existing = findTextVariable(token, 'STRING');
          if (existing) return existing;
          let col = styleCollections.find(c => c.id === preferredCollection) || styleCollections.find(c => c.name === 'Typography');
          if (!col) { col = figma.variables.createVariableCollection('Typography'); styleCollections.push(col); }
          const variable = figma.variables.createVariable(token, col, 'STRING');
          col.modes.forEach(m => variable.setValueForMode(m.modeId, value));
          allVars.push(variable);
          varMap.set(token, variable);
          return variable;
        };
        const ffVar = ensureFontVariable(isFontLoaded ? 'fontFamily/primary' : 'fontFamily/secondary', family);
        const semanticName = getSemanticWeightName(t.weight);
        const fwVar = ensureFontVariable('fontWeight/' + (isFontLoaded ? semanticName : '400'), style);
        const bind = (field, variable) => {
          if (!variable) return;
          try { s.setBoundVariable(field, variable); }
          catch (e) { sendQA('Binding Error (' + name + '/' + field + '): ' + e.message); }
        };
        bind('fontFamily', ffVar);
        bind('fontStyle', fwVar);
        bind('fontSize', fv);
        if (lhObj.unit === 'PIXELS') bind('lineHeight', lv);
        if (String(t.ls).indexOf('%') === -1) bind('letterSpacing', sv);
      } catch (e) {
        sendQA("Binding Error (" + name + "): " + e.message);
      }
      results.text++;
      if (!existingText) results.textNew++;
    }
  }

  if (options.color && parsed.variableModes !== null) {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const paintStyles = await figma.getLocalPaintStylesAsync();
    const seen = new Set();
    const colorRows = parsed.variableModes.filter(r => r.category === 'colors' && r.type === 'COLOR');
    const tokenOwners = new Map();
    colorRows.forEach(r => {
      if (!tokenOwners.has(r.token)) tokenOwners.set(r.token, new Set());
      tokenOwners.get(r.token).add(r.collection);
    });
    if (colorRows.length > 0) sendLog('info', 'Creating Color styles...');
    colorRows.forEach(row => {
      const key = JSON.stringify([row.collection, row.token]);
      if (seen.has(key)) return;
      seen.add(key);
      const col = collections.find(c => c.name === row.collection);
      const variable = col && allVars.find(v => v.variableCollectionId === col.id && v.name === row.token && v.resolvedType === 'COLOR');
      if (!variable) {
        sendQA('Color Style skipped: ' + row.collection + '/' + row.token + '의 컬러 변수가 없습니다. Colors Variables도 선택하거나 기존 변수를 확인해 주세요.');
        return;
      }
      // One style per variable, not per mode. The bound variable resolves the
      // consumer's mode, preserving custom mode names and aliases.
      const boundTo = s => s.paints && s.paints.length === 1 && s.paints[0].boundVariables &&
        s.paints[0].boundVariables.color && s.paints[0].boundVariables.color.id === variable.id;
      const name = row.token;
      if (tokenOwners.get(row.token).size > 1) {
        sendQA('Color Style skipped: ' + name + ' 이름이 여러 컬렉션에 있습니다. MD 토큰에 그룹 경로를 명시해 주세요.');
        return;
      }
      const existing = paintStyles.find(s => s.name === name && boundTo(s)) ||
        paintStyles.find(s => s.name === row.collection + '/' + row.token && boundTo(s)) ||
        paintStyles.find(s => s.name === row.token && boundTo(s));
      if (paintStyles.some(s => s.name === name && s !== existing)) {
        sendQA('Color Style skipped: ' + name + ' 이름의 다른 스타일이 이미 있습니다.');
        return;
      }
      let style;
      try {
        const paint = figma.variables.setBoundVariableForPaint(figma.util.solidPaint('#000000'), 'color', variable);
        style = existing || figma.createPaintStyle();
        style.name = name;
        style.paints = [paint];
        style.description = row.description;
        results.color++;
        if (!existing) { results.colorNew++; paintStyles.push(style); }
      } catch (e) {
        if (style && !existing) style.remove();
        sendQA('Color Style skipped: ' + name + ': ' + e.message);
      }
    });
  } else if (options.color && parsed.colors.semantic.length > 0) {
    sendLog('info', "Creating Color styles...");
    const existingPaintStyles = await figma.getLocalPaintStylesAsync();
    const paintStyleMap = new Map();
    existingPaintStyles.forEach(s => paintStyleMap.set(s.name, s));
    for (var i = 0; i < parsed.colors.semantic.length; i++) {
      const s = parsed.colors.semantic[i];
      const existingPaint = paintStyleMap.get(s.token);
      let ps = existingPaint || figma.createPaintStyle();
      ps.name = s.token;
      const v = varMap.get("semantic/" + s.token);
      if (v) ps.paints = [figma.variables.setBoundVariableForPaint(figma.util.solidPaint("#000000"), "color", v)];
      else ps.paints = [{ type: "SOLID", color: hexToRgb(s.light) }];
      results.color++;
      if (!existingPaint) results.colorNew++;
    }
  }

  if (options.effect && parsed.effects.length > 0) {
    sendLog('info', "Creating Effect styles...");
    const existingEffectStyles = await figma.getLocalEffectStylesAsync();
    const effectStyleMap = new Map();
    existingEffectStyles.forEach(s => effectStyleMap.set(s.name, s));
    for (var i = 0; i < parsed.effects.length; i++) {
      const e = parsed.effects[i];
      const typeKey = e.type.toLowerCase().replace(/_/g, '-');
      const type = effectTypes[typeKey];
      if (!type) { sendQA('Effect skipped: ' + e.token + ': ' + (typeKey === 'shader' ? 'Shader는 추후 지원 예정입니다.' : '지원하지 않는 효과 종류입니다.')); continue; }
      const name = groupedName(typeKey, e.token);
      const existingEffect = effectStyleMap.get(name) || effectStyleMap.get(e.token);
      let es;
      const effect = {
        type: type, color: parseRgbaColor(e.color || '') || {r:0,g:0,b:0,a:0.1},
        offset: {x: parseFloat(e.x), y: parseFloat(e.y)}, radius: parseFloat(e.blur), spread: parseFloat(e.spread), visible: true, blendMode: "NORMAL"
      };
      try {
        let effects;
        if (e.settings) effects = Array.isArray(e.settings) ? e.settings : [Object.assign({}, e.settings, { type: type })];
        else if (type === 'DROP_SHADOW' || type === 'INNER_SHADOW') effects = [effect];
        else if (type === 'LAYER_BLUR' || type === 'BACKGROUND_BLUR') effects = [{ type: type, radius: parseFloat(e.blur), visible: true, blurType: 'NORMAL' }];
        else throw new Error('Settings JSON에 종류별 속성을 명시해 주세요.');
        if (effects.some(item => !Object.keys(effectTypes).some(key => effectTypes[key] === item.type))) throw new Error('Shader 또는 미지원 효과가 포함되어 있습니다.');
        effects = effects.map(item => applyExplicitBindings(item,
          item.type === 'DROP_SHADOW' || item.type === 'INNER_SHADOW' ? ['color', 'radius', 'spread', 'offsetX', 'offsetY'] :
          item.type === 'LAYER_BLUR' || item.type === 'BACKGROUND_BLUR' ? ['radius'] : [], name));
        es = existingEffect || figma.createEffectStyle();
        try { es.effects = effects; }
        catch (validationError) {
          const message = String(validationError.message || '');
          // Noise's beta schema differs across clients. Retry only the known
          // blendMode validation mismatch; never strip shadow blend modes.
          if (!/blendMode/.test(message)) throw validationError;
          let compatible = false;
          const adjusted = effects.map(item => {
            if (item.type !== 'NOISE') return item;
            const copy = Object.assign({}, item);
            if (/Unrecognized key/.test(message) && item.blendMode === 'NORMAL') {
              delete copy.blendMode; compatible = true;
            } else if (/Required|required|undefined/.test(message) && item.blendMode === undefined) {
              copy.blendMode = 'NORMAL'; compatible = true;
            }
            return copy;
          });
          if (!compatible) throw validationError;
          es.effects = adjusted;
          sendLog('info', 'Noise compatibility: ' + name + '의 기본 혼합 모드를 현재 Figma API 형식에 맞춰 등록했습니다.');
        }
        es.name = name;
        effectStyleMap.set(name, es);
        results.effect++;
        if (!existingEffect) results.effectNew++;
      } catch (err) {
        if (es && !existingEffect && es.remove) es.remove();
        sendQA('Effect skipped: ' + name + ': ' + err.message);
      }
    }
  }

  if (options.grid && parsed.grid.length > 0) {
    sendLog('info', "Creating Grid styles...");
    var existingGridStyles = await figma.getLocalGridStylesAsync();
    var gridStyleMap = new Map();
    for (var i = 0; i < existingGridStyles.length; i++) {
      gridStyleMap.set(existingGridStyles[i].name, existingGridStyles[i]);
    }
    for (var i = 0; i < parsed.grid.length; i++) {
      var g = parsed.grid[i];
      var gridType = g.type.toLowerCase();
      if (['columns', 'rows', 'grid'].indexOf(gridType) === -1) { sendQA('Grid skipped: ' + g.token + ': 지원하지 않는 종류입니다.'); continue; }
      var gridName = groupedName(gridType, g.token);
      var existingGrid = gridStyleMap.get(gridName) || gridStyleMap.get(g.token);
      var gs = existingGrid || figma.createGridStyle();
      gs.name = gridName;
      var grid = null;
      if (gridType === "grid") {
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
      if (g.settings) {
        const entries = Array.isArray(g.settings) ? g.settings : [Object.assign({}, g.settings, { pattern: gridType.toUpperCase() })];
        gs.layoutGrids = entries.map(item => {
          if (['GRID', 'ROWS', 'COLUMNS'].indexOf(item.pattern) === -1) throw new Error('지원하지 않는 가이드 종류');
          const fields = item.pattern === 'GRID' ? ['sectionSize'] : item.alignment === 'CENTER' ? ['sectionSize', 'count', 'gutterSize'] : item.alignment === 'STRETCH' ? ['count', 'offset', 'gutterSize'] : ['sectionSize', 'count', 'offset', 'gutterSize'];
          return applyExplicitBindings(item, fields, gridName);
        });
      } else if (grid) gs.layoutGrids = [grid];
      gridStyleMap.set(gridName, gs);
      results.grid++;
      if (!existingGrid) results.gridNew++;
    }
  }
  if (options.motion && parsed.motionStyles.length > 0) {
    try {
      if (!figma.motion || typeof figma.motion.figmaAnimationStyles !== 'function' || typeof figma.createCustomAnimationStyle !== 'function' || typeof figma.getLocalCustomAnimationStylesAsync !== 'function') throw new Error('이 Figma 환경은 Motion Styles API를 지원하지 않습니다.');
      const presets = figma.motion.figmaAnimationStyles();
      const existingStyles = await figma.getLocalCustomAnimationStylesAsync();
      sendLog('info', 'Creating Motion styles...');
      for (var mi = 0; mi < parsed.motionStyles.length; mi++) {
        const row = parsed.motionStyles[mi];
        let target;
        let existing;
        let oldEntries = [];
        let added = [];
        try {
          if (!Array.isArray(row.entries) || row.entries.length === 0) throw new Error('Entries는 비어 있지 않은 JSON 배열이어야 합니다.');
          const entries = row.entries.map(entry => {
            const preset = entry.preset === '@first' ? presets[0] : presets.find(p => p.name === entry.preset || p.styleId === entry.styleId);
            if (!preset) throw new Error('프리셋을 찾을 수 없습니다: ' + entry.preset + '. 사용 가능: ' + presets.map(p => p.name).join(', '));
            return { styleId: preset.styleId, props: restoreEffectAliases(entry.props || {}) };
          });
          existing = existingStyles.find(s => s.name === row.token);
          target = existing || figma.createCustomAnimationStyle();
          oldEntries = target.animationEntries.slice();
          for (var ei = 0; ei < entries.length; ei++) added.push(await target.addAnimationEntryAsync(entries[ei].styleId, entries[ei].props));
          oldEntries.forEach(entry => target.removeAnimationEntry(entry.id));
          target.name = row.token;
          results.motion++;
          if (!existing) { results.motionNew++; existingStyles.push(target); }
        } catch (err) {
          if (target && !existing) target.remove();
          else if (target) added.forEach(entry => target.removeAnimationEntry(entry.id));
          sendQA('Motion Style skipped: ' + row.token + ': ' + err.message);
        }
      }
    } catch (err) { sendQA('Motion Styles skipped: ' + err.message); }
  }
  return results;
}

async function generateExportMD() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMapById = new Map();
  allVars.forEach(v => varMapById.set(v.id, v));

  let md = "<!-- [MD_TO_FIGMA_EXPORT_LOG] -->\n\n# Design System\n\n";
  // This editable table is the authoritative variable source on re-import.
  // JSON cells preserve precision, strings, alpha and structured easing values.
  md += '## Variable Modes\n\n> 변수 수정은 이 표에서 합니다. 아래 기존 섹션은 스타일 생성과 요약용입니다. 이름과 값은 JSON 표기이며 TIMING 단위는 초입니다. 모드는 이름으로 매칭하고 MD에 없는 기존 모드는 유지합니다.\n\n';
  md += '| Category | Collection | Token | Type | Mode | Value | Description |\n|---|---|---|---|---|---|---|\n';
  const cell = value => JSON.stringify(value).replace(/\|/g, '&#124;');
  allVars.forEach(v => {
    const col = collections.find(c => c.id === v.variableCollectionId);
    if (!col) return;
    const hint = (col.name + '/' + v.name).toLowerCase();
    const savedCategory = typeof v.getPluginData === 'function' ? v.getPluginData('mdToFigmaCategory') : '';
    const category = ['colors', 'spacing', 'radius', 'typography', 'motion'].indexOf(savedCategory) !== -1 ? savedCategory : v.resolvedType === 'COLOR' ? 'colors' :
      (v.resolvedType === 'TIMING' || v.resolvedType === 'EASING') ? 'motion' :
      /spacing|gap|padding/.test(hint) ? 'spacing' : /radius|corner|round/.test(hint) ? 'radius' : 'typography';
    const exportModes = col.modes.slice().sort((a, b) => a.modeId === col.defaultModeId ? -1 : b.modeId === col.defaultModeId ? 1 : 0);
    exportModes.forEach(mode => {
      let value = v.valuesByMode[mode.modeId];
      if (value === undefined) return;
      if (value && value.type === 'VARIABLE_ALIAS') {
        const target = varMapById.get(value.id);
        const targetCol = target && collections.find(c => c.id === target.variableCollectionId);
        if (!targetCol) throw new Error('Cannot export unresolved alias: ' + v.name);
        value = { alias: { collection: targetCol.name, token: target.name } };
      }
      md += '| ' + category + ' | ' + cell(col.name) + ' | ' + cell(v.name) + ' | ' + v.resolvedType + ' | ' + cell(mode.name) + ' | ' + cell(value) + ' | ' + cell(v.description || '') + ' |\n';
    });
  });
  md += '\n';

  const primitiveColors = [];
  const semanticColors = [];
  const primitiveSpacing = [];
  const semanticSpacing = [];
  const primitiveRadius = [];
  const semanticRadius = [];
  const timingVars = [];
  const easingVars = [];

  allVars.forEach(v => {
    const col = collections.find(c => c.id === v.variableCollectionId);
    const colName = col ? col.name.toLowerCase() : "";
    const varName = v.name.toLowerCase();

    if (v.resolvedType === "COLOR") {
      if (v.name.startsWith("primitive/")) {
        primitiveColors.push(v);
      } else if (v.name.startsWith("semantic/")) {
        semanticColors.push(v);
      } else {
        if (colName.includes("color")) primitiveColors.push(v);
        else semanticColors.push(v);
      }
    } else if (v.resolvedType === "FLOAT") {
      const category = typeof v.getPluginData === 'function' ? v.getPluginData('mdToFigmaCategory') : '';
      const isTypography = category === 'typography' || /typo|font/.test(colName) || /letters?spacing|lineheight|\/size$/.test(varName);
      const isSpacing = category ? category === 'spacing' : !isTypography && (colName.includes("spacing") || varName.includes("spacing") || varName.includes("gap") || varName.includes("padding"));
      const isRadius = category ? category === 'radius' : !isTypography && (colName.includes("radius") || varName.includes("radius") || varName.includes("corner") || varName.includes("round"));

      if (isSpacing) {
        if (v.name.startsWith("primitive/")) primitiveSpacing.push(v);
        else semanticSpacing.push(v);
      } else if (isRadius) {
        if (v.name.startsWith("primitive/")) primitiveRadius.push(v);
        else semanticRadius.push(v);
      }
    } else if (v.resolvedType === "TIMING") {
      timingVars.push(v);
    } else if (v.resolvedType === "EASING") {
      easingVars.push(v);
    }
  });

  const resolveExportValue = (val, isColor) => {
    if (val === undefined || val === null) return "-";
    if (val.type === "VARIABLE_ALIAS") {
      const target = varMapById.get(val.id);
      return target ? cleanTokenName(target.name) : "[Alias]";
    }
    if (isColor) {
      return rgbToHex(val);
    }
    return val + "px";
  };

  // 1. Colors Section
  md += "## Colors\n\n";
  if (primitiveColors.length > 0) {
    md += "### Primitive\n\n| Token | Value | Description |\n|---|---|---|\n";
    primitiveColors.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      md += "| " + cleanTokenName(v.name) + " | " + resolveExportValue(val, true) + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

  if (semanticColors.length > 0) {
    md += "### Semantic\n\n| Token | Light | Dark | Description |\n|---|---|---|---|\n";
    semanticColors.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mIdLight = col.modes[0].modeId;
      const valLight = v.valuesByMode[mIdLight];
      const displayLight = resolveExportValue(valLight, true);

      const mIdDark = col.modes.length > 1 ? col.modes[1].modeId : mIdLight;
      const valDark = v.valuesByMode[mIdDark];
      const displayDark = resolveExportValue(valDark, true);

      md += "| " + cleanTokenName(v.name) + " | " + displayLight + " | " + displayDark + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

  // 2. Spacing Section
  md += "## Spacing\n\n";
  if (primitiveSpacing.length > 0) {
    md += "### Primitive\n\n| Token | Value | Description |\n|---|---|---|\n";
    primitiveSpacing.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      md += "| " + cleanTokenName(v.name) + " | " + resolveExportValue(val, false) + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

  if (semanticSpacing.length > 0) {
    md += "### Semantic\n\n| Token | Alias | Description |\n|---|---|---|\n";
    semanticSpacing.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      md += "| " + cleanTokenName(v.name) + " | " + resolveExportValue(val, false) + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

  // 3. Radius Section
  md += "## Radius\n\n";
  if (primitiveRadius.length > 0) {
    md += "### Primitive\n\n| Token | Value | Description |\n|---|---|---|\n";
    primitiveRadius.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      md += "| " + cleanTokenName(v.name) + " | " + resolveExportValue(val, false) + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

  if (semanticRadius.length > 0) {
    md += "### Semantic\n\n| Token | Alias | Description |\n|---|---|---|\n";
    semanticRadius.forEach(v => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      const mId = col.modes[0].modeId;
      const val = v.valuesByMode[mId];
      md += "| " + cleanTokenName(v.name) + " | " + resolveExportValue(val, false) + " | " + (v.description || "-") + " |\n";
    });
    md += "\n";
  }

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
      const g = parts.length > 1 ? parts[0] : "";
      const t = parts.length > 1 ? parts.slice(1).join("/") : s.name;
      if (!gs[g]) gs[g] = [];

      let sizeVal = s.fontSize;
      if (s.boundVariables && s.boundVariables.fontSize) {
        const boundVar = varMapById.get(s.boundVariables.fontSize.id);
        if (boundVar) {
          const col = collections.find(c => c.id === boundVar.variableCollectionId);
          const mId = col ? col.modes[0].modeId : null;
          if (mId) {
            const vVal = boundVar.valuesByMode[mId];
            if (vVal !== undefined) sizeVal = parseFloat(vVal);
          }
        }
      }

      let lhVal = s.lineHeight;
      if (s.boundVariables && s.boundVariables.lineHeight) {
        const boundVar = varMapById.get(s.boundVariables.lineHeight.id);
        if (boundVar) {
          const col = collections.find(c => c.id === boundVar.variableCollectionId);
          const mId = col ? col.modes[0].modeId : null;
          if (mId) {
            const vVal = boundVar.valuesByMode[mId];
            if (vVal !== undefined) lhVal = { value: parseFloat(vVal), unit: "PIXELS" };
          }
        }
      }

      let lsVal = s.letterSpacing;
      if (s.boundVariables && s.boundVariables.letterSpacing) {
        const boundVar = varMapById.get(s.boundVariables.letterSpacing.id);
        if (boundVar) {
          const col = collections.find(c => c.id === boundVar.variableCollectionId);
          const mId = col ? col.modes[0].modeId : null;
          if (mId) {
            const vVal = boundVar.valuesByMode[mId];
            if (vVal !== undefined) lsVal = { value: parseFloat(vVal), unit: "PIXELS" };
          }
        }
      }

      const lh = lhVal.unit === "PERCENT" ? Math.round(lhVal.value) + "%" : roundVal(lhVal.value) + "px";
      const ls = roundVal(lsVal.value) + (lsVal.unit === "PIXELS" ? "px" : "%");
      
      let semanticWeight = s.fontName.style;
      if (s.boundVariables && s.boundVariables.fontStyle) {
        const boundVar = varMapById.get(s.boundVariables.fontStyle.id);
        if (boundVar) {
          const col = collections.find(c => c.id === boundVar.variableCollectionId);
          const mId = col ? col.modes[0].modeId : null;
          if (mId) {
            const styleVal = boundVar.valuesByMode[mId];
            const normalizedStyle = String(styleVal || "").toLowerCase().replace(/[\s\-_]/g, "");
            semanticWeight = revWeightMap[normalizedStyle] || styleVal;
          }
        }
      } else {
        const normalizedStyle = s.fontName.style.toLowerCase().replace(/[\s\-_]/g, "");
        semanticWeight = revWeightMap[normalizedStyle] || s.fontName.style;
      }
      
      let exportedFontFamily = s.fontName.family;
      if (s.boundVariables && s.boundVariables.fontFamily) {
        const boundVarId = s.boundVariables.fontFamily.id;
        if (ffPrimaryVar && boundVarId === ffPrimaryVar.id && primaryFontValue) {
          exportedFontFamily = primaryFontValue;
        }
      }

      gs[g].push("| " + t + " | " + exportedFontFamily + " | " + roundVal(sizeVal) + "px | " + semanticWeight + " | " + lh + " | " + ls + " |");
    });
    const groups = Object.keys(gs);
    for (var i = 0; i < groups.length; i++) {
      const g = groups[i];
      md += (g ? "### " + g + "\n" : "") + "| Token | Font | Size | Weight | LineHeight | LetterSpacing |\n|---|---|---|---|---|---|\n" + gs[g].join("\n") + "\n\n";
    }
  }

  // Motion Section (Timing / Easing variables)
  if (timingVars.length > 0 || easingVars.length > 0) {
    md += "## Motion\n\n";

    const motionRow = (v, toDisplay) => {
      const col = collections.find(c => c.id === v.variableCollectionId);
      if (!col || !col.modes || col.modes.length === 0) return "";
      const raw = v.valuesByMode[col.modes[0].modeId];
      let display;
      if (raw && raw.type === "VARIABLE_ALIAS") {
        const target = varMapById.get(raw.id);
        display = target ? cleanTokenName(target.name) : "[Alias]";
      } else {
        display = toDisplay(raw);
      }
      return "| " + cleanTokenName(v.name) + " | " + display + " | " + (v.description || "-") + " |\n";
    };

    if (timingVars.length > 0) {
      md += "### Timing\n\n| Token | Value | Description |\n|---|---|---|\n";
      timingVars.forEach(v => { md += motionRow(v, timingToMs); });
      md += "\n";
    }

    if (easingVars.length > 0) {
      md += "### Easing\n\n| Token | Value | Description |\n|---|---|---|\n";
      easingVars.forEach(v => { md += motionRow(v, easingToString); });
      md += "\n";
    }
  }

  const paintStyles = await figma.getLocalPaintStylesAsync();
  if (paintStyles.length > 0 && primitiveColors.length === 0 && semanticColors.length === 0) {
    md += "## Colors (from Styles)\n\n| Token | Value | Description |\n|---|---|---|\n";
    paintStyles.forEach(ps => {
      const p = ps.paints[0];
      if (p && p.type === "SOLID") {
        md += "| " + cleanTokenName(ps.name) + " | " + rgbToHex(p.color) + " | " + (ps.description || "-") + " |\n";
      }
    });
    md += "\n";
  }

  const portableEffect = value => {
      if (!value || typeof value !== 'object') return value;
      if (value.type === 'VARIABLE_ALIAS') {
        const target = varMapById.get(value.id);
        const col = target && collections.find(c => c.id === target.variableCollectionId);
        if (!col) throw new Error('Cannot export effect alias: ' + value.id);
        return { alias: { collection: col.name, token: target.name } };
      }
      if (Array.isArray(value)) return value.map(portableEffect);
      const output = {};
      Object.keys(value).forEach(key => { output[key] = portableEffect(value[key]); });
      return output;
  };
  const eStyles = await figma.getLocalEffectStylesAsync();
  if (eStyles.length > 0) {
    md += "## Effects\n\n| Token | Type | Settings |\n|---|---|---|\n";
    eStyles.forEach(s => {
      if (s.effects.length > 0) {
        const e = s.effects[0];
        if (s.effects.some(item => item.type === 'SHADER')) { sendQA('Effect export skipped: ' + s.name + ': Shader는 추후 지원 예정입니다.'); return; }
        md += '| ' + s.name + ' | ' + e.type.toLowerCase().replace(/_/g, '-') + ' | ' + JSON.stringify(portableEffect(s.effects)).replace(/\|/g, '&#124;') + ' |\n';
      }
    });
    md += "\n";
  }

  const gStyles = await figma.getLocalGridStylesAsync();
  if (gStyles.length > 0) {
    md += "## Grid\n\n| Token | Type | Settings |\n|---|---|---|\n";
    gStyles.forEach(s => {
      if (s.layoutGrids.length > 0) {
        const g = s.layoutGrids[0];
        md += '| ' + s.name + ' | ' + g.pattern.toLowerCase() + ' | ' + JSON.stringify(portableEffect(s.layoutGrids)).replace(/\|/g, '&#124;') + ' |\n';
      }
    });
    md += "\n";
  }
  if (typeof figma.getLocalCustomAnimationStylesAsync === 'function') {
    try {
      const styles = await figma.getLocalCustomAnimationStylesAsync();
      if (styles.length > 0) {
        md += '## Motion Styles\n\n| Token | Entries |\n|---|---|\n';
        styles.forEach(s => {
          const entries = s.animationEntries.map(entry => ({ preset: entry.name, styleId: entry.styleId, props: portableEffect(entry.props || {}) }));
          md += '| ' + s.name + ' | ' + JSON.stringify(entries).replace(/\|/g, '&#124;') + ' |\n';
        });
      }
    } catch (err) { sendQA('Motion Styles export skipped: ' + err.message); }
  }
  return { mdContent: md };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "generate") {
    try {
      sendLog("info", "MD parsing and generation started...");
      const parsed = parseMD(msg.content);
      
      if (parsed.variableModes !== null) {
        sendLog('info', 'Variable Modes: 컬렉션과 모드 이름을 기준으로 배리어블을 동기화합니다.');
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
