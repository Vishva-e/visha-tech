import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
/** @param {string} p */
const source=p=>readFileSync(resolve(root,p),'utf8');

test('editorial library contains ten substantive research-based guides',()=>{
  const folder=resolve(root,'src/content/guides');
  const files=readdirSync(folder).filter(name=>name.endsWith('.md'));
  assert.equal(files.length,10,'Phase 2 needs exactly ten real guides');
  for(const file of files){
    const content=source('src/content/guides/'+file);
    const body=content.split('---\n').slice(2).join('---\n');
    assert.ok(body.split(/\s+/).length>=350,file+' must have substantial original content');
    assert.match(content,/reviewType: desk-research/,file+' must disclose research method');
    assert.ok(!/tag=[\w-]+-21/.test(content),file+' must not contain undeclared affiliate link');
  }
});

test('comparison workbench is progressive, accessible, and does not invent prices',()=>{
  const component=source('src/components/ComparisonTool.astro');
  const data=source('src/data/comparisons.ts');
  assert.match(component,/aria-controls="comparison-panel"/);
  assert.match(component,/scope="col"/);
  assert.match(component,/aria-label="Feature comparison table"/);
  assert.match(component,/createElement/);
  assert.ok(!component.includes('innerHTML'),'untrusted data must not be written with innerHTML');
  for(const topic of ['ram','storage','audio','laptop'])assert.match(data,new RegExp("id: '"+topic+"'"));
  assert.ok(!/₹\s*\d+/.test(data));
});

test('brand is Visha Shops across header and footer',()=>{
  for(const file of ['src/components/Header.astro','src/components/Footer.astro']){
    assert.ok(!source(file).includes('Vishva <strong>Tech Picks</strong>'),file+' contains previous branding');
    assert.ok(source(file).includes('Visha <strong>Shops</strong>'));
  }
});

test('private product review tool has no hosted admin or public publishing API',()=>{
  const app=source('scripts/product-review-dashboard.mjs');
  const store=source('scripts/product-review-store.mjs');
  assert.match(app,/server.listen\(portOption,'127.0.0.1'/);
  assert.match(app,/timingSafeEqual/);
  assert.match(app,/Content-Security-Policy/);
  assert.match(store,/publishApproved:.*false/);
  for(const file of ['src/pages/admin.astro','src/pages/admin/index.astro','public/tools/product-review.html']){
    assert.equal(existsSync(resolve(root,file)),false);
  }
});
