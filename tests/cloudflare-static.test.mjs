import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** @param {string} path */
const read=(path)=>readFileSync(path,'utf8');

test('Cloudflare Workers has an explicit static-assets Wrangler config',()=>{
  const config=JSON.parse(read('wrangler.jsonc'));
  assert.equal(config.compatibility_date,'2026-11-03');
  assert.equal(config.name,'visha-tech');
  assert.equal(config.assets.directory,'./dist');
  assert.equal(config.assets.html_handling,'auto-trailing-slash');
  assert.equal(config.assets.not_found_handling,'404-page');
  assert.ok(!Object.hasOwn(config,'main'),'Static assets must not require an SSR Worker entry point');
  assert.ok(!Object.hasOwn(config,'build'),'Cloudflare build command is controlled by project settings');
});

test('Astro stays static; Wrangler cannot auto-install the Cloudflare SSR adapter',()=>{
  const astro=read('astro.config.mjs');
  const pkg=JSON.parse(read('package.json'));
  assert.match(astro,/output:\s*'static'/);
  assert.match(astro,/trailingSlash:\s*'always'/);
  assert.equal(pkg.dependencies?.['@astrojs/cloudflare'],undefined);
  assert.equal(pkg.devDependencies?.['@astrojs/cloudflare'],undefined);
});

test('Prelaunch crawler protections remain committed for Workers static assets',()=>{
  const headers=read('public/_headers');
  const robots=read('public/robots.txt');
  assert.match(headers,/X-Robots-Tag:\s*noindex/i);
  assert.match(robots,/Disallow:\s*\//);
  const src=read('scripts/finalize-build.mjs');
  assert.match(src,/assessRelease\(env\)/);
  assert.match(src,/PUBLIC_SITE_LIVE/);
});
