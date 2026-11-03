/**
 * Non-public, local-only automated accessibility scan with axe-core.
 * Zero critical or serious WCAG A/AA violations is a baseline check, not a
 * substitute for physical-device, screen-reader, cognitive or manual QA.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const origin='http://127.0.0.1:4321';
const routes=['/','/guides/','/product-finder/','/comparisons/','/affiliate-disclosure/','/contact/','/guides/laptop-for-java-developers/'];
const browser=await chromium.launch({headless:true});
const report=[];
let total=0;
try{
  for(const width of [375,1440]){
    const context=await browser.newContext({viewport:{width,height:850}});
    const page=await context.newPage();
    for(const route of routes){
      await page.goto(origin+route,{waitUntil:'domcontentloaded'});
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const issues=results.violations.map(item=>({id:item.id,impact:item.impact,description:item.description,
        nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));
      const severe=issues.filter(issue=>['critical','serious'].includes(issue.impact));
      report.push({width,route,issues});
      total+=severe.length;
      console.log(`${severe.length?'FAIL':'PASS'} a11y ${width}px ${route}: ${issues.length} violations; ${severe.length} serious/critical`);
    }
    await context.close();
  }
} finally {await browser.close();}
await mkdir('qa-artifacts',{recursive:true});
await writeFile('qa-artifacts/a11y-report.json',JSON.stringify({date:new Date().toISOString(),reports:report},null,2));
if(total){
  console.error(`Accessibility gate failed: ${total} serious/critical WCAG violations. See private artifact a11y-report.json`);
  process.exitCode=1;
}else{
  console.log(`Accessibility baseline passed for ${routes.length*2} route/viewport combinations; manual QA still required.`);
}
