# 🚀 MD to Figma: Global AI Prompt Guide (v2.2.1)

Register your entire design system into Figma Variables & Styles in seconds. This guide helps you bridge the gap between your documentation and Figma using the power of AI.

---

## 📋 The Workflow

### 1. Download the Template
- Click **📥 Template Download** in the plugin to get `DESIGN-TEMPLATE.md`.
- This file defines the only data structure the plugin recognizes.

### 2. Instruct Your AI
- Attach the `DESIGN-TEMPLATE.md` file to your AI (ChatGPT, Claude, etc.).
- Provide your project's raw design data (CSS, JSON, etc.).
- Use the **Master Prompt** provided below.

### 3. Generate & Sync
- Copy the Markdown block from the AI.
- Paste it into the plugin and click **🚀 Generate**.

---

## 🤖 The Master Prompt

> "I have attached a `DESIGN-TEMPLATE.md` file that defines a specific structure for a Figma plugin. 
> 
> Please analyze my project's design system data and **restructure it exactly** into the format defined in the template. 
> 
> **CRITICAL COMPLIANCE RULES:**
> 1. **Color Aliasing**: In the 'Semantic' table, values MUST reference names from the 'Primitive' table (e.g., `blue/500`). **Never use HEX codes in Semantic tables.**
> 2. **LineHeight Smart Units**: 
>    - Use `%` (e.g., `150%`) or unitless decimals (e.g., `1.5`) for flexible web-based styles. These will be entered as raw percentages in Figma Styles to preserve precision.
>    - Use `px` (e.g., `24px`) ONLY if fixed pixel height and Variable Binding are required.
> 3. **Typography Grouping**: Use `### Heading` syntax to group typography tokens (e.g., `### Display`).
> 4. **Font Safety**: If specifying a custom font, don't worry if it's not installed. The plugin will automatically fallback to 'Inter Regular' and link it to an auto-generated 'fontFamily/Inter' variable for a clean, error-free system.
> 
> Output the result as a single, complete Markdown code block."

---

## 💡 Pro Tips for Success
- **Unit Precision**: The plugin is smart—it knows that `%` in the doc means "don't bind to variables, keep it as % in the style".
- **Batch Processing**: Supports partial updates. Sync Colors first, then others later.
- **Natural Sorting**: Token names like `gray/100`, `gray/200` are automatically sorted numerically in Figma.

---
*Automate your design system workflow globally with MD to Figma!*
