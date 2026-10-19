# MD to Figma v2.1.0 format reference

This reference describes the existing importer, not a new interchange format. Preserve the user's data; examples illustrate syntax only. The deployed runtime remains authoritative.

## Document rules

- Use exact level-two headings: `## Variable Modes`, `## Typography`, `## Effects`, `## Grid`, `## Motion Styles`. Omit absent sections. Legacy foundation sections are supported as described below.
- Tables have leading/trailing pipes and one physical line per row. Use JSON escapes for embedded quotes/newlines and `&#124;` for pipes inside cells. Never leave an empty table cell: for JSON strings use `""`; omit incomplete style rows until resolved.
- Do not put illustrative headings or tables in comments or code fences inside an import document. The v2.1.0 parser does not exclude comments or fenced text. A line containing `---` inside legacy/style data is also skipped by this parser; flag such source names/values instead of silently renaming or reporting successful preservation.

## Variables and arbitrary modes

Prefer this table for new output, including a single mode:

```markdown
## Variable Modes

| Category | Collection | Token | Type | Mode | Value | Description |
|---|---|---|---|---|---|---|
| spacing | "Layout" | "gap" | FLOAT | "넓은 화면" | 24 | "Content gap" |
| spacing | "Layout" | "gap" | FLOAT | "작은 화면" | 12 | "Content gap" |
```

- Category is `colors`, `spacing`, `radius`, `typography` or `motion`; it determines the Variables checkbox to select, not the collection name.
- Collection, Token, Mode and Description are JSON strings. Identity is exact Collection + Token + Mode. A variable's Type, Category and Description should be consistent across its mode rows.
- Type/Value: `FLOAT` finite unitless number; `STRING` JSON string; `BOOLEAN` true/false; `COLOR` RGBA object with r/g/b/a in 0..1; `TIMING` nonnegative seconds; `EASING` a Figma MotionEasing object, e.g. `{"type":"EASE_OUT"}` or `{"type":"LINEAR"}`. Preserve exported custom easing objects; do not guess unfamiliar properties.
- Alias value: `{"alias":{"collection":"Layout","token":"base"}}`. Resolve by exact names and matching type. Include the target or list it as an external dependency. Never invent missing targets or flatten aliases without the user's request. Do not introduce cyclic references.
- The first encountered mode becomes a new collection's default. Existing defaults stay unchanged. Missing mode rows do not overwrite other existing modes. Mode creation limits may be reported in Figma QA.
- When this section exists, it is the sole variable input. Keep existing summary sections if requested, but update their displayed values consistently when they reflect an edited value. Never add a second authoritative table.

## Color styles

Select Color Styles to create styles from COLOR variables in Variable Modes. Select the variables' categories too, unless those variables already exist. Token `surface` creates a top-level style; `semantic/surface` creates a group. Do not prepend the collection name. A variable's modes share one bound style; styles are not duplicated per mode. Same-named COLOR tokens in different collections can collide as style names: explain the conflict instead of inventing a group.

## Text styles

```markdown
## Typography

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| body | Inter | 16px | 400 | 150% | 0px |

### Body

| Token | Font | Size | Weight | LineHeight | LetterSpacing |
|---|---|---|---|---|---|
| md | Inter | 18px | 700 | 24px | 0.5px |
```

Only add such rows when the source supplies or the user requests text styles. No subgroup means top-level `body`; optional `### Body` plus `md` creates `Body/md`, with original case.

For mode-aware bindings, explicitly include matching typography variables in Variable Modes: `<full-style-name>/Size` FLOAT; `<full-style-name>/LineHeight` and `/LetterSpacing` FLOAT in pixels. Font family variables are `fontFamily/primary` and `fontFamily/secondary` STRING; weights use `fontWeight/400` STRING `"Regular"`, `fontWeight/700` STRING `"Bold"`, etc. Preserve existing weight/style names. The importer uses its font-variable convention and can supplement missing font variables from style fields. Do not promise arbitrary per-style font-variable references are supported. Ambiguous matching variables require user review.

Use explicit `px` or `%` for LineHeight. Percent line height is static. Use pixels for LetterSpacing in new output; the importer does not reliably preserve percentage letter spacing. Convert from percent only with a known font size and explain the conversion. Fonts and available weights must be checked in the destination. Mode-aware variables do not produce a separate text style for every mode.

## Effects

Use `Token | Type | Settings`. Settings is a JSON object for one effect, or an exported array preserving uppercase `type` fields for stacked effects. Types: `drop-shadow`, `inner-shadow`, `layer-blur`, `background-blur`, `noise`, `texture`, `glass`. Shader is not supported. The type adds a top-level style group, preserving further token paths without duplicating an existing type prefix.

The existing integration sample contains tested static settings for all seven effect types. For new objects, use source settings or that relevant example's field structure; do not copy its values as user data. Noise must omit `blendMode`. Noise, texture and glass availability depends on the host API.

```markdown
## Effects

| Token | Type | Settings |
|---|---|---|
| soft | layer-blur | {"radius":12,"visible":true,"blurType":"NORMAL","boundVariables":{"radius":{"alias":{"collection":"Layout","token":"gap"}}}} |
```

Write fallback static values even when binding a field. Add `boundVariables` only for explicit source bindings or a requested connection. Shadow bindable fields: `color` COLOR, `radius`, `spread`, `offsetX`, `offsetY` FLOAT. Layer/background blur: `radius` FLOAT. Noise/texture/glass use static values. A missing/mismatched reference causes a QA message and static fallback; it does not prove the intended binding worked.

## Layout guide styles

Use `Token | Type | Settings`; Type is `columns`, `rows` or `grid`. Each adds its own top-level group. Settings can be an object or an exported array retaining uppercase `pattern` fields.

```markdown
## Grid

| Token | Type | Settings |
|---|---|---|
| desktop | columns | {"count":12,"alignment":"STRETCH","offset":48,"gutterSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1}} |
| square | grid | {"sectionSize":12,"color":{"r":1,"g":0,"b":0,"a":0.1},"boundVariables":{"sectionSize":{"alias":{"collection":"Layout","token":"gap"}}}} |
```

FLOAT bindings: GRID `sectionSize` (Size). Columns/rows STRETCH `count`, `offset` (Margin), `gutterSize` (Gutter); MIN/MAX also `sectionSize`; CENTER `count`, `sectionSize`, `gutterSize`. Keep alignment-specific static fields. Do not invent a margin binding for CENTER or a color binding for guides.

## Optional motion

Motion variables use TIMING/EASING in Variable Modes. A custom easing example is `{"type":"CUSTOM_CUBIC_BEZIER","easingFunctionCubicBezier":{"x1":0.2,"y1":0,"x2":0,"y2":1}}`. TIMING is seconds, not milliseconds.

Motion styles require separate `## Motion Styles` with `Token | Entries`. Entries is a JSON array of objects containing `preset` and `props`; preserve exported `styleId` if present. Use the exact preset name and supported properties from a real export. A prop can be static or an explicit alias compatible with the preset property. Do not guess names, props, IDs or how they bind. If needed source is missing, request an export or omit the style and explain why. `@first` is solely an explicit API test value and must not be inserted into production output. These styles are local reusable styles and do not automatically animate selected layers. Unsupported APIs are reported in QA.

## Legacy input

Without Variable Modes the v2.0.2 tables remain supported: Colors Primitive `Token | Value`, Semantic `Token | Light | Dark`; Spacing/Radius Primitive `Token | Value`, Semantic `Token | Alias`; Typography six columns; Effects `Token | Type | Color | X | Y | Blur | Spread`; Grid `Token | Type | Count | Width | Gutter | Margin | Alignment`; Motion Timing/Easing `Token | Value`. Existing Light/Dark columns refer to those exact modes. A single Value updates the default mode, not all modes. Legacy timing such as `150ms` differs from unified TIMING `0.15`.

For conversion, preserve all source values and identities; do not reinterpret inferred collections or existing single-mode names as confirmed facts. The bundled preflight focuses on the unified format and JSON styles; legacy input can parse successfully without all of its semantics being checked. Clearly state that limit if retaining legacy output.
