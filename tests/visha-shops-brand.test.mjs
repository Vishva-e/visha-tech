import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
/** @param {string} path */
const read=(path)=>readFileSync(path,'utf8');

test('Visha Shop is the only active site brand in public views and metadata',()=>{
  for(const path of [
    'src/data/site.ts','src/layouts/BaseLayout.astro','src/components/Header.astro','src/components/Footer.astro',
    'src/pages/index.astro','src/pages/about.astro','src/pages/contact.astro',
    'src/pages/privacy.astro','src/pages/affiliate-disclosure.astro',
    'src/pages/guides/[slug].astro','src/pages/404.astro'
  ]){
    const code=read(path);
    assert.doesNotMatch(code,/Visha Tech Picks|Visha Shops/i,path+' must not retain old branding');
  }
  assert.match(read('src/data/site.ts'),/name: 'Visha Shop'/);
  assert.ok(read('src/layouts/BaseLayout.astro').includes("title === 'Home' ? 'Visha Shop'"));
  assert.match(read('src/pages/contact.astro'),/Visha%20Shop%20Editorial/);
});

test('Modern storefront look exposes working guide search and honest editorial promise',()=>{
  const home=read('src/pages/index.astro');
  const header=read('src/components/Header.astro');
  const css=read('src/styles/modern.css');
  assert.match(home,/<form class="hero-search" action="\/guides\/" method="get" role="search">/);
  assert.match(home,/name="q"/);
  assert.match(home,/hero-showcase/);
  assert.match(home,/category-grid/);
  assert.match(home,/guide-grid/);
  assert.match(home,/No invented hands-on tests or undisclosed paid placements/);
  assert.match(header,/aria-controls="mobile-navigation"/);
  assert.match(header,/Visha <strong>Shops<\/strong>/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(read('src/layouts/BaseLayout.astro'),/modern\.css/);
});

test('Rebrand does not activate unbuilt payments or affiliate commerce',()=>{
  assert.match(read('src/pages/about.astro'),/not a direct retailer or checkout service/);
  assert.match(read('src/components/Footer.astro'),/PUBLIC_AMAZON_ASSOCIATE_ACTIVE/);
  assert.match(read('public/robots.txt'),/Disallow:\s*\//);
  assert.match(read('src/layouts/BaseLayout.astro'),/noindex,nofollow,noarchive/);
  assert.ok(!/add to cart|checkout now|buy now/i.test(read('src/pages/index.astro')));
});
