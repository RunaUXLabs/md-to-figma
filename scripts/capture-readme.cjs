// Reproduce README screenshots from the shipped UI and the existing simulated Figma harness.
// Requires Playwright and an installed Microsoft Edge. No Figma document is modified.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const harness = fs.readFileSync('tests/modes.test.cjs', 'utf8').split('\nconst options =')[0];
function simulatedRuntime() { return vm.runInNewContext(harness + '\nruntime();', { require }); }
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 500, height: 650 }, deviceScaleFactor: 2, locale: 'en-US' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const frame = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    async function capture(name) {
      const screenshot = await page.screenshot();
      await frame.setContent('<!doctype html><html><body style="margin:0;width:1920px;height:1080px;background:white;display:flex;align-items:center;justify-content:center"><img alt="Plugin screenshot" style="width:1800px;height:960px;object-fit:contain;object-position:center" src="data:image/png;base64,' + screenshot.toString('base64') + '"></body></html>');
      await frame.locator('img').evaluate(image => image.decode());
      await frame.screenshot({ path: path.join(root, 'resources', name) });
    }
    async function open() { await page.goto(pathToFileURL(path.join(root, 'ui.html')).href); }
    async function replay(logs) {
      for (const msg of logs) await page.evaluate(msg => window.onmessage({ data: { pluginMessage: msg } }), msg);
    }
    await open();
    await page.selectOption('#languageSelect', 'en');
    await page.locator('label[for="optVarTypography"]').hover();
    await capture('UI_v220.png');

    await open();
    await page.selectOption('#languageSelect', 'ko');
    const sample = fs.readFileSync('resources/FINAL-INTEGRATION-SAMPLE.md', 'utf8');
    await page.locator('#mdContent').fill(sample);
    await page.locator('#optColorStyles').check();
    await page.locator('#optMotionStyles').check();
    await page.keyboard.press('Escape');
    await page.locator('#generateBtn').click();
    const qa = simulatedRuntime();
    await qa.figma.ui.onmessage({ type: 'generate', content: sample, options: {
      variables: { colors: true, spacing: true, radius: true, typography: true, motion: true },
      styles: { color: true, text: true, effect: true, grid: true, motion: true }
    } });
    await replay(qa.logs);
    await page.mouse.move(10, 10);
    await capture('QALog_v220.png');

    await open();
    await page.selectOption('#languageSelect', 'en');
    const invalid = '## Variable Modes\n\n| Category | Collection | Token | Type | Mode | Value | Description |\n|---|---|---|---|---|---|---|\n| colors | Brand | "primary" | COLOR | "Light" | {"r":0.1,"g":0.4,"b":0.9,"a":1} | "Brand color" |';
    await page.locator('#mdContent').fill(invalid);
    await page.locator('#generateBtn').click();
    const failure = simulatedRuntime();
    await failure.figma.ui.onmessage({ type: 'generate', content: invalid, options: {} });
    await replay(failure.logs);
    await page.mouse.move(10, 10);
    await capture('ErrorLog_v220.png');
    if (errors.length) throw Error(errors.join('\n'));
    console.log('Created UI_v220.png, QALog_v220.png and ErrorLog_v220.png: 1920x1080, centered contain, 60px vertical margin. Reports come from the plugin running against a simulated Figma API.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
