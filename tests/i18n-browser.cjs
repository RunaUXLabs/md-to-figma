// Run with Playwright available through NODE_PATH. Uses installed Edge; no downloads.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel:'msedge', headless:true });
  try {
    const page = await browser.newPage({ viewport:{width:500,height:650}, locale:'en-US' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.sentMessages = [];
      window.addEventListener('message', event => { if (event.data.pluginMessage) window.sentMessages.push(event.data.pluginMessage); });
      document.execCommand = () => { window.copied = document.querySelector('body > textarea').value; return true; };
    });
    await page.goto(pathToFileURL(path.resolve('ui.html')).href);
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    const send = msg => page.evaluate(msg => window.onmessage({data:{pluginMessage:msg}}),msg);
    assert.equal(await page.locator('#languageSelect').inputValue(),'auto');
    await page.selectOption('#languageSelect','auto');
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    await page.selectOption('#languageSelect','ja');
    await send({type:'language',language:'es'});
    assert.equal(await page.locator('html').getAttribute('lang'),'ja', 'late storage must not override manual selection');
    fs.mkdirSync('dist/i18n-qa',{recursive:true});
    for (const width of [500,390]) {
      await page.setViewportSize({width,height:650});
      for (const lang of ['ko','en','ja','zh-CN','es']) {
        await page.selectOption('#languageSelect',lang);
        await page.locator('#mdContent').fill('USER MD / 사용자 데이터');
        await page.locator('#optVarMotion').uncheck();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('html').getAttribute('lang'),lang);
        assert.deepEqual(await page.locator('.option-item label').allTextContents(), ['Colors','Spacing','Radius','Typography','Motion','Color Styles','Text Styles','Effect Styles','Grid Styles','Motion Styles']);
        for (const id of ['optVarColors','optVarSpacing','optVarRadius','optVarTypography','optVarMotion','optColorStyles','optTextStyles','optEffectStyles','optGridStyles','optMotionStyles']) {
          await page.locator('label[for="'+id+'"]').hover();
          const tooltip = page.locator('#'+id+'Help');
          assert.equal(await tooltip.isVisible(),true);
          const expected = await page.evaluate(id => t('help'+id.slice(3)),id);
          assert.equal(await tooltip.textContent(),expected);
          const box = await tooltip.boundingBox();
          assert.ok(box.x >= 0 && box.y >= 0 && box.x+box.width <= width && box.y+box.height <= 650);
          await page.keyboard.press('Escape');
          assert.equal(await tooltip.isVisible(),false);
        }
        await page.locator('#optVarTypography').focus();
        assert.equal(await page.locator('#optVarTypographyHelp').isVisible(),true);
        await page.screenshot({path:`dist/i18n-qa/${lang}-tooltip-${width}.png`});
        await page.keyboard.press('Escape');
        await page.locator('#mdContent').focus();
        const bounds = await page.evaluate(() => {
          const ids = ['mdContent','generateBtn','exportBtn','languageSelect'];
          return ids.map(id => { const r = document.getElementById(id).getBoundingClientRect(); return {id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height}; });
        });
        for (const r of bounds) assert.ok(r.x >= 0 && r.right <= width && r.bottom <= 650 && r.height >= 25, JSON.stringify({lang,width,r}));
        await page.screenshot({path:`dist/i18n-qa/${lang}-${width}.png`});
      }
    }
    await page.setViewportSize({width:500,height:650});
    await page.locator('#generateBtn').click();
    await page.waitForFunction(() => sentMessages.some(m => m.type === 'generate'));
    const request = await page.evaluate(() => sentMessages.find(m => m.type === 'generate'));
    assert.equal(request.content,'USER MD / 사용자 데이터'); assert.equal(request.options.variables.motion,false);
    const name = '<img src=x onerror=alert(1)>/사용자/{0}';
    await send({type:'qa_log',localized:{key:'fontFallback',params:[name,'body/md']}});
    await send({type:'complete',results:{variables:{colors:0,scanned:{colors:3}},styles:{text:2,textNew:0}}});
    for (const lang of ['ko','en','ja','zh-CN','es']) {
      await page.selectOption('#reportLanguageSelect',lang);
      assert.equal(await page.locator('#languageSelect').inputValue(),lang);
      assert.equal(await page.locator('#mdContent').inputValue(),'USER MD / 사용자 데이터');
      assert.equal(await page.locator('#optVarMotion').isChecked(),false);
      assert.ok((await page.locator('#contentQA').innerText()).includes(name));
      assert.equal(await page.locator('#contentQA img').count(),0);
      await page.locator('#copyQABtn').click();
      const copied = await page.evaluate(() => window.copied);
      assert.ok(copied.includes(name) && copied.includes('(0/3)') && copied.includes('(0/2)'));
      await page.screenshot({path:`dist/i18n-qa/${lang}-report.png`});
    }
    const raw = 'Unexpected property blendMode';
    await send({type:'error',localized:{key:'syncFailed',params:[]},detail:raw});
    await page.locator('#copyErrorBtn').click();
    assert.ok((await page.evaluate(() => window.copied)).includes(raw));
    assert.deepEqual(errors,[]);
    console.log('Browser: five languages, 500/390px layouts, state preservation, translated reports/copy, raw errors, safe text rendering passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
