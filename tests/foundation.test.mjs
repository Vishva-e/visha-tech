import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const load = (/** @type {string} */ path) => readFileSync(resolve(root,path),'utf8');
const guideFiles = readdirSync(resolve(root,'src/content/guides')).filter((/** @type {string} */ x)=>x.endsWith('.md'));
const pages = ['src/pages/index.astro','src/pages/guides/index.astro','src/pages/guides/[slug].astro','src/pages/categories/[slug].astro','src/pages/comparisons/index.astro', 'src/pages/about.astro','src/pages/editorial-policy.astro','src/pages/affiliate-disclosure.astro','src/pages/privacy.astro','src/pages/contact.astro', 'src/pages/404.astro'];
test('required routes and core components exist',()=>{
  for(const page of pages) assert.ok(existsSync(resolve(root,page)),`Missing ${page}`);
  for(const component of ['Header','Footer','GuideCard','PageHeading']) assert.ok(existsSync(resolve(root,`src/components/${component}.astro`)));
});
test('editorial sample guides contain complete metadata and meaningful content',()=>{
  assert.ok(guideFiles.length>=3,'At least 3 starter guides should exist');
  for(const name of guideFiles){
    const content=load(`src/content/guides/${name}`);
    const frontmatter=content.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter,`${name}: missing frontmatter`);
    for(const key of ['title:','description:','category:','publishedAt:','updatedAt:','reviewType: desk-research','readMinutes:','draft: false']) assert.ok(frontmatter[1].includes(key),`${name}: missing ${key}`);
    assert.ok(content.slice(frontmatter[0].length).trim().split(/\s+/).length>=350,`${name}: sample content too thin`);
    assert.ok(!/\bASIN\b|tag=[A-Za-z0-9-]+-21/i.test(content),`${name}: affiliate data present prematurely`);
  }
});
test('pre-release website is not indexed and has no automated deploy workflow',()=>{
  const layout = load('src/layouts/BaseLayout.astro');
  const config = load('astro.config.mjs');
  assert.ok(layout.includes('noindex,nofollow,noarchive'));
  assert.ok(config.includes('Release blocked:'));
  assert.ok(load('public/robots.txt').includes('Disallow: /'));
  const flow = load('.github/workflows/quality.yml');
  assert.ok(!/wrangler\s+pages\s+deploy|deploy-pages|cloudflare\/pages-action/i.test(flow));
});
test('affiliate disclosure and honest limitations are present',()=>{
  assert.ok(load('src/components/Footer.astro').includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(load('src/components/Footer.astro').includes('amazonActive ?'), 'Must not claim active status by default');
  assert.ok(load('src/pages/affiliate-disclosure.astro').includes('no affiliate tracking IDs'));
  assert.ok(load('src/pages/contact.astro').includes('Contact channel pending'));
});
test('no deployed production URL or tracking keys are embedded',()=>{
  const files = [load('astro.config.mjs'), load('src/layouts/BaseLayout.astro'), load('src/pages/index.astro')].join('\n');
  assert.ok(!/google-analytics\.com|googletagmanager\.com|gtag\(/i.test(files));
  assert.ok(!/vishva-tech-picks\.pages\.dev/i.test(files));
});

test('Visha Shops branding is consistent with retained repository slug',()=>{
  assert.ok(load('src/data/site.ts').includes("name: 'Visha Shops'"));
  assert.ok(load('src/layouts/BaseLayout.astro').includes('Visha Shops'));
  assert.ok(load('README.md').startsWith('# Visha Shops'));
  assert.ok(load('docs/DEPLOYMENT.md').includes('Vishva-e/vishva-tech-picks'));
  assert.ok(!load('src/components/Header.astro').includes('Vishva Tech Picks'));
});
