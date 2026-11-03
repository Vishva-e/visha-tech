import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { finalizeBuild } from '../scripts/finalize-build.mjs';

/** @param {string} dir */
async function prepare(dir) {
  await writeFile(join(dir,'robots.txt'),'User-agent: *\nDisallow: /\n');
  await writeFile(join(dir,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
}
/** @param {string} base @param {string} origin @param {number} n */
async function livePages(base,origin,n) {
  for(let i=0;i<n;i++){
    const rel=i===0?'':`guides/article-${i}/`;
    const dir=join(base,rel);
    await mkdir(dir,{recursive:true});
    await writeFile(join(dir,'index.html'),`<!doctype html><html><head><meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="${origin}/${rel}" /><title>Page ${i}</title></head><body><main id="main"><h1>Guide</h1></main></body></html>`);
  }
}
const approved={
  RELEASE_MODE:'editorial', SITE_URL:'https://vishatechpicks.example.org/',
  OWNER_RELEASE_APPROVED:'true',PUBLIC_SITE_LIVE:'true',
  CONTENT_REVIEW_APPROVED:'true',PRIVACY_REVIEW_APPROVED:'true',
  DEVICE_ACCESSIBILITY_APPROVED:'true',HOSTING_APPROVED:'true',
  PUBLIC_CONTACT_EMAIL:'vishvaelumalai98@gmail.com',
  PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'false'
};

test('default build never removes crawl blocks',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-private-build-'));
  try{
    await prepare(dir);
    await writeFile(join(dir,'index.html'),'<title>Private build</title>');
    const result=finalizeBuild(dir,{PUBLIC_SITE_LIVE:'false'});
    assert.equal(result.mode,'private-build');
    assert.match(await readFile(join(dir,'robots.txt'),'utf8'),/Disallow:\s*\//);
    assert.match(await readFile(join(dir,'_headers'),'utf8'),/X-Robots-Tag:\s*noindex/);
    await assert.rejects(readFile(join(dir,'sitemap.xml'),'utf8'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('live SEO output strictly requires owner sign-offs',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-release-blocked-'));
  try{
    await prepare(dir);
    await livePages(dir,'https://vishatechpicks.example.org',22);
    assert.throws(()=>finalizeBuild(dir,{PUBLIC_SITE_LIVE:'true',SITE_URL:approved.SITE_URL}),/Release BLOCKED/);
    assert.match(await readFile(join(dir,'robots.txt'),'utf8'),/Disallow:\s*\//);
    await assert.rejects(readFile(join(dir,'sitemap.xml'),'utf8'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('fully approved editorial release generates sitemap and removes prelaunch headers only inside build output',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-release-fixture-'));
  try{
    await prepare(dir);
    await livePages(dir,'https://vishatechpicks.example.org',22);
    await mkdir(join(dir,'404'),{recursive:true});
    await writeFile(join(dir,'404','index.html'),'not indexed');
    const result=finalizeBuild(dir,approved);
    assert.equal(result.mode,'release-artifact-only');
    assert.equal(result.pages,22);
    const site=await readFile(join(dir,'sitemap.xml'),'utf8');
    assert.equal((site.match(/<loc>/g)||[]).length,22);
    assert.ok(!site.includes('404/'));
    assert.match(site,/https:\/\/vishatechpicks\.example\.org\/guides\/article-1\//);
    assert.match(await readFile(join(dir,'robots.txt'),'utf8'),/Allow:\s*\//);
    assert.doesNotMatch(await readFile(join(dir,'_headers'),'utf8'),/X-Robots-Tag:\s*noindex/i);
    assert.match(await readFile(join(dir,'_headers'),'utf8'),/X-Content-Type-Options: nosniff/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('release SEO output cannot activate Amazon advertising by accident',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-release-affiliate-'));
  try{
    await prepare(dir);
    await livePages(dir,'https://vishatechpicks.example.org',22);
    assert.throws(()=>finalizeBuild(dir,{...approved,PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true'}),/Release BLOCKED/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
