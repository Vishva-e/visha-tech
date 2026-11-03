/**
 * Real Chromium smoke tests. Runs locally in CI only; no external preview URL.
 * Dependency is provisioned by the private GitHub Actions QA job.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const origin='http://127.0.0.1:4321';
const browser=await chromium.launch({headless:true});
await mkdir('qa-artifacts',{recursive:true});
const failures=[];
async function step(label,run) {
  try { await run();console.log('PASS '+label); }
  catch(error) { failures.push(label+': '+String(error));console.error('FAIL '+label,error); }
}
try {
  for(const width of [375,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:800},deviceScaleFactor:1});
    const page=await context.newPage();
    await step(`homepage ${width}px width and no horizontal overflow`,async()=>{
      await page.goto(origin+'/',{waitUntil:'networkidle'});
      assert.equal(await page.locator('h1').first().isVisible(),true);
      const viewport=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
      assert.ok(viewport.scroll <= viewport.view+2,`scrollWidth ${viewport.scroll} > viewport ${viewport.view}`);
      const robots=await page.locator('meta[name="robots"]').getAttribute('content');
      assert.match(robots||'',/noindex/);
      await page.screenshot({path:`qa-artifacts/home-${width}.png`,fullPage:true});
    });
    if(width===375) {
      await step('mobile navigation works',async()=>{
        const menu=page.getByRole('button',{name:'Open menu'});
        await menu.click();
        assert.equal(await page.locator('#mobile-navigation').isVisible(),true);
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
        await page.getByRole('button',{name:'Close menu'}).click();
        assert.equal(await page.locator('#mobile-navigation').isVisible(),false);
      });
      await step('guide search, category filter and reset work',async()=>{
        await page.goto(origin+'/guides/',{waitUntil:'networkidle'});
        await page.locator('#guide-search').fill('SSD');
        assert.match(await page.locator('#guide-count').innerText(),/Showing [1-9]/);
        await page.locator('#guide-category').selectOption('audio');
        assert.equal(await page.locator('#guide-count').innerText(),'Showing 0 of 10 guides');
        assert.equal(await page.locator('#search-empty').isVisible(),true);
        await page.locator('#guide-reset').click();
        assert.equal(await page.locator('#guide-count').innerText(),'Showing 10 of 10 guides');
      });
      await step('product finder responds without external requests',async()=>{
        await page.goto(origin+'/product-finder/',{waitUntil:'networkidle'});
        await page.locator('#finder-use').selectOption('development');
        await page.locator('#finder-priority').selectOption('capacity');
        assert.match(await page.locator('#finder-title').innerText(),/Developer workstation/);
        assert.match(await page.locator('#finder-title').innerText(),/Multitasking/);
        assert.match(await page.locator('#finder-guide').getAttribute('href')||'',/laptop-for-java-developers/);
        await page.screenshot({path:'qa-artifacts/finder-375.png',fullPage:true});
      });
      await step('comparison switches and remains scrollable on mobile',async()=>{
        await page.goto(origin+'/comparisons/?topic=storage',{waitUntil:'networkidle'});
        assert.match(await page.locator('#comparison-title').innerText(),/Internal vs external SSD/);
        assert.equal(await page.locator('.comparison-swipe-hint').isVisible(),true);
        await page.locator('#comparison-topic').selectOption('audio');
        assert.match(await page.locator('#comparison-title').innerText(),/Wired vs Bluetooth/);
        await page.screenshot({path:'qa-artifacts/comparisons-375.png',fullPage:true});
      });
      await step('prelaunch crawlers blocked',async()=>{
        const response=await page.request.get(origin+'/robots.txt');
        assert.equal(response.status(),200);
        assert.match(await response.text(),/Disallow:\s*\//);
      });
    }
    await context.close();
  }
} finally { await browser.close(); }
if(failures.length) { console.error(failures.join('\n'));process.exitCode=1; }
else console.log('Chromium QA checks passed on 375, 768 and 1440px viewports');
