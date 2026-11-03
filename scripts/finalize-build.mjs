#!/usr/bin/env node
/**
 * Build output stage only; never touches GitHub, Cloudflare or credentials.
 * Produces sitemap/indexable robots ONLY if all owner's release gates are met.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessRelease } from './release-preflight.mjs';

/** @param {string} dir @returns {string[]} */
function pageFiles(dir) {
  /** @type {string[]} */
  const files=[];
  for(const item of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,item.name);
    if(item.isDirectory()) files.push(...pageFiles(path));
    else if(item.isFile() && item.name==='index.html') files.push(path);
  }
  return files;
}
/** @type {Record<string,string>} */
const escapeEntities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'};
/** @param {string} str */
const xmlEscape=str=>str.replace(/[&<>"']/g,c=>escapeEntities[c] ?? c);
/**
 * @param {string} outputDir
 * @param {Record<string,string|undefined>} env
 */
export function finalizeBuild(outputDir, env) {
  const dir=resolve(outputDir);
  if(!existsSync(join(dir,'robots.txt')) || !existsSync(join(dir,'_headers'))){
    throw new Error('Build assets missing; run Astro build first.');
  }
  const live=env.PUBLIC_SITE_LIVE==='true';
  if(!live) {
    const robots=readFileSync(join(dir,'robots.txt'),'utf8');
    const headers=readFileSync(join(dir,'_headers'),'utf8');
    if(!/Disallow:\s*\//.test(robots)||!/X-Robots-Tag:\s*noindex/i.test(headers)){
      throw new Error('Pre-release privacy/indexing safeguards unexpectedly missing.');
    }
    return {mode:'private-build',pages:pageFiles(dir).length,origin:null};
  }
  const assessment=assessRelease(env);
  if(!assessment.ready){
    throw new Error('Release BLOCKED — '+assessment.blockers.join('; '));
  }
  const origin=new URL(env.SITE_URL ?? '').origin;
  const html=pageFiles(dir).filter(path=>relative(dir,path).split(sep).join('/')!=='404/index.html');
  if(html.length<20)throw new Error('Release blocked: site unexpectedly missing pages.');
  for(const path of html){
    const source=readFileSync(path,'utf8');
    const rel=relative(dir,path).split(sep).join('/').replace(/index\.html$/,'');
    const canonical=origin+'/'+rel;
    if(!source.includes(`rel="canonical" href="${canonical}"`) &&
       !source.includes(`href="${canonical}" rel="canonical"`)){
      throw new Error(`Missing canonical metadata in ${rel || '/'}`);
    }
    if(!source.includes('content="index,follow') || source.includes('content="noindex,nofollow,noarchive"')){
      throw new Error(`Indexing metadata not live in ${rel || '/'}`);
    }
  }
  const hosts=html.map(path=>{
    const rel=relative(dir,path).split(sep).join('/').replace(/index\.html$/,'');
    return origin+'/'+rel;
  });
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    hosts.map(url=>'  <url><loc>'+xmlEscape(url)+'</loc></url>').join('\n')+'\n</urlset>\n';
  let headers=readFileSync(join(dir,'_headers'),'utf8');
  if(!/X-Robots-Tag:\s*noindex/i.test(headers)){
    throw new Error('Expected pre-release header was not found; refusing to transform.');
  }
  headers=headers.replace(/^\s*X-Robots-Tag:\s*noindex[^\r\n]*(?:\r?\n|$)/gmi,'\n');
  headers=headers.replace(/# Pre-release[^\n]*\n/g,'').replace(/# IMPORTANT:[^\n]*\n/g,'');
  writeFileSync(join(dir,'sitemap.xml'),xml,'utf8');
  writeFileSync(join(dir,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,'utf8');
  writeFileSync(join(dir,'_headers'),headers,'utf8');
  return {mode:'release-artifact-only',pages:html.length,origin};
}
const direct=process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){
  try{
    const result=finalizeBuild(resolve('dist'),process.env);
    console.log(`Visha Tech Picks build policy: ${result.mode}; ${result.pages} pages.`);
    if(result.mode==='release-artifact-only'){
      console.log('Output is prepared for independent review only. NO deployment performed.');
    }
  }catch(e){
    console.error('Build policy failure:',e instanceof Error?e.message:String(e));
    process.exitCode=1;
  }
}
