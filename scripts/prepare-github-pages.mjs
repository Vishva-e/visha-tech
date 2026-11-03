#!/usr/bin/env node
/**
 * Transform only an explicitly requested GitHub Pages preview build. Never
 * change the project's public release/indexing or affiliate policy.
 * GitHub Pages project sites live under /<repository>/ rather than /.
 */
import {existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

/** @param {string} dir @returns {string[]} */
function htmlFiles(dir) {
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const path=join(dir,entry.name);
    return entry.isDirectory()?htmlFiles(path):entry.isFile()&&entry.name.endsWith('.html')?[path]:[];
  });
}
/**
 * @param {string} outputDir
 * @param {string} basePath
 */
export function prepareGitHubPages(outputDir,basePath) {
  if(!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(basePath))throw new Error('Unsafe GitHub Pages base path');
  const dir=resolve(outputDir);
  if(!existsSync(join(dir,'index.html')))throw new Error('Missing built homepage');
  if(!existsSync(join(dir,'robots.txt')))throw new Error('Missing private-preview robots.txt');
  const robots=readFileSync(join(dir,'robots.txt'),'utf8');
  if(!/Disallow:\s*\//.test(robots))throw new Error('Noindex preview robots.txt safeguard missing');
  const files=htmlFiles(dir);
  if(files.length<26)throw new Error('Unexpectedly few built HTML pages');
  let replacements=0;
  for(const file of files){
    const input=readFileSync(file,'utf8');
    if(!/name="robots" content="noindex,nofollow,noarchive"/i.test(input)){
      throw new Error('Pre-release noindex meta missing in '+file);
    }
    // Built-in Astro _astro/ assets already incorporate the conditional base.
    // Rewrite root-absolute HTML attribute paths from site source only; don't
    // touch scheme-relative or already prefixed paths.
    const output=input.replace(/\b(href|src|action|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
      (all,attr,quote,path)=>{
        if(path===basePath.slice(1)||path.startsWith(basePath.slice(1)+'/'))return all;
        replacements++;
        return attr+'='+quote+basePath+'/'+path+quote;
      });
    writeFileSync(file,output,'utf8');
  }
  const notFound=join(dir,'404','index.html');
  if(existsSync(notFound))copyFileSync(notFound,join(dir,'404.html'));
  // Static hosting must not publish private review tools, node modules, etc.
  if(existsSync(join(dir,'admin')))throw new Error('Private dashboard leaked');
  return {pages:files.length,rewritten:replacements,basePath};
}
const isDirect=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isDirect){
  const base=process.env.GITHUB_PAGES_BASE;
  if(!base)throw new Error('GITHUB_PAGES_BASE is required');
  const result=prepareGitHubPages('dist',base);
  console.log('GitHub Pages noindex preview prepared:',JSON.stringify(result));
}
