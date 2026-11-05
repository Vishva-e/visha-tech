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

test('Premium storefront exposes functional navigation, guide search and honest editorial promise',()=>{
  const home=read('src/pages/index.astro');
  const header=read('src/components/Header.astro');
  const footer=read('src/components/Footer.astro');
  const article=read('src/pages/guides/[slug].astro');
  const css=read('src/styles/editorial-store.css');
  assert.match(header, /<form action="\/guides\/" method="get" role="search"/);
  assert.match(header, /name="q"/);
  assert.match(header, /visha-explore-menu/);
  assert.match(header, /aria-controls="visha-mobile-nav"/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /Visha <strong>Shop<\/strong>/);
  assert.match(home, /visha-category-rail/);
  assert.match(home, /visha-spotlight-panel/);
  assert.match(home, /visha-featured-scroll/);
  assert.match(home, /visha-decision-grid/);
  assert.match(home, /No invented hands-on tests or undisclosed paid placements/);
  assert.match(footer, /visha-footer-navigation/);
  assert.match(article, /aria-label="Breadcrumb"/);
  assert.match(article, /id="guide-content"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(read('src/layouts/BaseLayout.astro'), /editorial-store\.css/);
});

test('Rebrand does not activate unbuilt payments or affiliate commerce',()=>{
  assert.match(read('src/pages/about.astro'),/not a direct retailer or checkout service/);
  assert.match(read('src/components/Footer.astro'),/PUBLIC_AMAZON_ASSOCIATE_ACTIVE/);
  assert.match(read('public/robots.txt'),/Disallow:\s*\//);
  assert.match(read('src/layouts/BaseLayout.astro'),/noindex,nofollow,noarchive/);
  assert.ok(!/add to cart|checkout now|buy now/i.test(read('src/pages/index.astro')));
});
