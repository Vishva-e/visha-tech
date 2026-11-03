#!/usr/bin/env node
/** Standalone, read-only launch readiness check. It does not deploy or authorize release.
 * Each flag below is a self-attested checklist item, not proof of external approval.
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { approvedPublicContactEmail } from '../src/config/public-contact.mjs';

/** @param {string|undefined} value */
const on=value=>value==='true';
/** @param {string|undefined} input */
function approvedHttpsOrigin(input){
  if(!input)return null;
  try{
    const url=new URL(input);
    if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/')return null;
    const host=url.hostname.toLowerCase();
    if(!host.includes('.')||host==='localhost'||host.endsWith('.local')||host.endsWith('.example')||
      host.endsWith('.invalid')||host.endsWith('.test')||host==='example.com'||host==='www.example.com'||/^[0-9.]+$/.test(host))return null;
    return url.origin;
  }catch{return null;}
}
/** @param {Record<string,string|undefined>} env */
export function assessRelease(env){
  /** @type {string[]} */ const blockers=[];
  /** @type {string[]} */ const checks=[];
  /** @type {string[]} */ const notes=[];
  const mode=env.RELEASE_MODE==='affiliate'?'affiliate':'editorial';
  const origin=approvedHttpsOrigin(env.SITE_URL);
  /** @param {boolean} pass @param {string} description */
  const check=(pass,description)=>{(pass?checks:blockers).push(description);};
  check(Boolean(origin),'Verified real HTTPS SITE_URL provided (no placeholder domain)');
  check(on(env.OWNER_RELEASE_APPROVED),'Explicit owner release approval independently recorded');
  check(on(env.PUBLIC_SITE_LIVE),'Public-site metadata/SEO activation explicitly approved');
  check(on(env.CONTENT_REVIEW_APPROVED),'Original content and citations reviewed by the owner');
  check(on(env.PRIVACY_REVIEW_APPROVED),'Actual hosting/privacy/legal notice reviewed by the owner');
  check(on(env.DEVICE_ACCESSIBILITY_APPROVED),'Real device, keyboard and accessibility review completed');
  check(on(env.HOSTING_APPROVED),'Cloudflare hosting and public URL independently approved');
  const contact=env.PUBLIC_CONTACT_EMAIL?.trim()||approvedPublicContactEmail;
  check(contact===approvedPublicContactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && contact.length<=254,
    'Public contact email matches the owner-approved address');
  if(mode==='affiliate'){
    check(on(env.PUBLIC_AMAZON_ASSOCIATE_ACTIVE),'Active Amazon Associates participation verified');
    check(on(env.AMAZON_SITE_REGISTERED),'Real site URL added to Associates website list');
    check(on(env.AMAZON_LINKS_EDITORIALLY_APPROVED),'All live paid product links personally reviewed');
    check(Boolean(origin)&&approvedHttpsOrigin(env.AMAZON_APPROVED_SITE_URL)===origin,
      'Amazon-approved website list URL matches SITE_URL');
  }else{
    check(!on(env.PUBLIC_AMAZON_ASSOCIATE_ACTIVE),
      'Editorial-only release must not claim active Amazon affiliate participation');
  }
  if(env.RELEASE_MODE && !['editorial','affiliate'].includes(env.RELEASE_MODE))blockers.push('RELEASE_MODE must be editorial or affiliate');
  notes.push('This command never deploys or creates an approval; all flags are self-attested and must be independently verified.');
  notes.push('Noindex/robots.txt/_headers must be changed in a separately authorized release PR, not in this one.');
  return {mode,ready:blockers.length===0,checks,blockers,notes};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=assessRelease(process.env);
  if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    console.log(`Visha Tech Picks • ${result.mode} launch preflight: ${result.ready?'CHECKLIST COMPLETE (not authorization)':'BLOCKED'}`);
    for(const x of result.checks)console.log(' ✓ '+x);
    for(const x of result.blockers)console.log(' ✕ '+x);
    for(const x of result.notes)console.log(' Note: '+x);
  }
  if(!result.ready)process.exitCode=2;
}
