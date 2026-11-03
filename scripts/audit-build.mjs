#!/usr/bin/env node
/**
 * Pre-publication static build audit.
 * This does not contact the internet, publish, or mutate the built site.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

const root = resolve('dist');
assert.ok(existsSync(root),'Run npm run build before audit:build.');
/** @param {string} path @returns {string[]} */
function walk(path) {
  return readdirSync(path, {withFileTypes:true}).flatMap(item=>{
    const abs=join(path,item.name);
    return item.isDirectory()?walk(abs):[abs];
  });
}
const all=walk(root), html=all.filter(name=>name.endsWith('.html'));
/** @type {string[]} */
const errors=[];
/** @param {boolean} pass @param {string} msg */
const confirm=(pass,msg)=>{if(!pass)errors.push(msg);};
confirm(html.length >= 26,`Expected at least 26 static pages; found ${html.length}`);
confirm(existsSync(join(root,'robots.txt')),'Missing pre-release robots.txt');
confirm(existsSync(join(root,'_headers')),'Missing pre-release security headers');
const robots=existsSync(join(root,'robots.txt'))?readFileSync(join(root,'robots.txt'),'utf8'):'';
const headers=existsSync(join(root,'_headers'))?readFileSync(join(root,'_headers'),'utf8'):'';
confirm(/Disallow:\s*\//.test(robots),'Pre-release robots.txt must disallow crawling');
confirm(/X-Robots-Tag:\s*noindex/i.test(headers),'Pre-release HTTP headers must prevent indexing');
let linksChecked=0;
for(const file of html) {
  const path=relative(root,file).split(sep).join('/');
  const page=readFileSync(file,'utf8');
  confirm(/<title>[^<]+<\/title>/i.test(page),`${path}: missing title`);
  confirm(/<meta\s+name="description"\s+content="[^"]+"/i.test(page),`${path}: missing meta description`);
  confirm(/<meta\s+name="robots"\s+content="noindex,nofollow,noarchive"/i.test(page),`${path}: pre-release robots missing`);
  confirm(/<main\s+id="main"/i.test(page),`${path}: missing main landmark`);
  confirm(/<h1[\s>]/i.test(page),`${path}: missing primary heading`);
  confirm(!/\btag=[a-z0-9_-]+-21\b/i.test(page),`${path}: affiliate tracking link present before approved launch`);
  const links=page.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi);
  for(const hit of links) {
    const href=hit[1];
    if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(href)) continue;
    if (/^(javascript:|data:|vbscript:)/i.test(href)) {
      errors.push(`${path}: unsafe link destination`); continue;
    }
    try {
      const link=new URL(href,'https://local.invalid/'+path);
      if (link.hostname !== 'local.invalid') continue;
      const pathname=decodeURIComponent(link.pathname);
      const target=resolve(root,'.'+pathname);
      if(!target.startsWith(root+sep) && target!==root) {
        errors.push(`${path}: escaped build root`);continue;
      }
      const dest=(pathname.endsWith('/') || !pathname.split('/').at(-1)?.includes('.'))?join(target,'index.html'):target;
      confirm(existsSync(dest),`${path}: broken internal link ${href}`);
      linksChecked++;
    } catch(error) { errors.push(`${path}: invalid internal link ${href}`); }
  }
}
confirm(!existsSync(join(root,'admin','index.html')),'Private dashboard must not be a public route');
confirm(!existsSync(join(root,'tools','product-review.html')),'Private dashboard HTML must not enter published output');
if(errors.length) {
  console.error('Pre-release static audit FAILED:');
  for(const message of errors) console.error(' - '+message);
  process.exitCode=1;
} else {
  console.log(`Pre-release static audit PASS: ${html.length} HTML pages, ${linksChecked} local links verified, no publishing/affiliate leaks.`);
}
