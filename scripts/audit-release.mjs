#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { assessRelease } from './release-preflight.mjs';
const gate=assessRelease(process.env);
if(!gate.ready){ console.error('Release audit blocked: '+gate.blockers.join('; '));process.exitCode=2; }
else{
  const dist=resolve('dist'),origin=new URL(process.env.SITE_URL ?? '').origin;
  /** @param {string} filename */
  const read=filename=>readFileSync(join(dist,filename),'utf8');
  const sitemap=read('sitemap.xml'),robots=read('robots.txt'),headers=read('_headers');
  if(!sitemap.includes(`<loc>${origin}/</loc>`) ||
     !robots.includes(`Sitemap: ${origin}/sitemap.xml`) ||
     !robots.includes('Allow: /') ||
     /X-Robots-Tag:\s*noindex/i.test(headers) ||
     read('index.html').includes('content="noindex,nofollow,noarchive"') ||
     !read('index.html').includes(`rel="canonical" href="${origin}/"`)){
       console.error('Release output invalid; refusing to mark artifact ready.');process.exitCode=1;
  }else console.log('Editorial release artifact passed sitemap, robots, canonical and header checks. Not deployed.');
}
