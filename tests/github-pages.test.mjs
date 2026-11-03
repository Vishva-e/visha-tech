import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareGitHubPages} from '../scripts/prepare-github-pages.mjs';

test('GitHub Pages preparation makes project-prefixed HTML links with noindex intact',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-pages-'));
  try{
    await writeFile(join(dir,'robots.txt'),'User-agent: *\nDisallow: /\n');
    await mkdir(join(dir,'404'),{recursive:true});
    const html='<html><head><meta name="robots" content="noindex,nofollow,noarchive"></head><body><main id="main"><a href="/guides/">Guides</a><a href="/visha-tech/about/">Already prefixed</a><a href="https://example.org">External</a><link href="/visha-tech/_astro/main.css"><img src="/favicon.svg"><a href="//cdn.example.org/a">CDN</a></main></body></html>';
    await writeFile(join(dir,'index.html'),html);
    await writeFile(join(dir,'404','index.html'),html);
    for(let i=0;i<24;i++){
      const p=join(dir,'p'+i);await mkdir(p);await writeFile(join(p,'index.html'),html);
    }
    const result=prepareGitHubPages(dir,'/visha-tech');
    assert.equal(result.pages,26);
    const output=await readFile(join(dir,'index.html'),'utf8');
    assert.match(output,/href="\/visha-tech\/guides\/"/);
    assert.match(output,/src="\/visha-tech\/favicon.svg"/);
    assert.match(output,/href="\/visha-tech\/_astro\/main.css"/);
    assert.doesNotMatch(output,/\/visha-tech\/visha-tech/);
    assert.match(output,/href="\/\/cdn\.example\.org\/a"/);
    assert.match(output,/content="noindex,nofollow,noarchive"/);
    assert.equal(await readFile(join(dir,'404.html'),'utf8'),await readFile(join(dir,'404','index.html'),'utf8'));
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('Github Pages must refuse missing prelaunch protections or unsafe base path',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-pages-negative-'));
  try{
    await writeFile(join(dir,'index.html'),'<html></html>');
    await writeFile(join(dir,'robots.txt'),'User-agent: *\nAllow: /\n');
    assert.throws(()=>prepareGitHubPages(dir,'/visha-tech'),/safeguard/);
    assert.throws(()=>prepareGitHubPages(dir,'https://evil.example/'),/Unsafe/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
