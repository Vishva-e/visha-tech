import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { assessRelease } from '../scripts/release-preflight.mjs';
import { validateAmazonLink } from '../scripts/amazon-link-policy.mjs';

const candidateUrl='https://www.amazon.in/dp/B0TEST1234?tag=example-21';
test('release preflight fails closed without real owner approvals',()=>{
  const assessment=assessRelease({});
  assert.equal(assessment.ready,false);
  assert.ok(assessment.blockers.length>=7);
  assert.equal(assessRelease({SITE_URL:'https://example.com/'}).ready,false);
  assert.equal(assessRelease({SITE_URL:'https://localhost/'}).ready,false);
});
test('editorial and affiliate publication require separate gates',()=>{
  const e={
    SITE_URL:'https://vishatechpicks.example.org/',
    OWNER_RELEASE_APPROVED:'true',PUBLIC_SITE_LIVE:'true',CONTENT_REVIEW_APPROVED:'true',
    PRIVACY_REVIEW_APPROVED:'true',DEVICE_ACCESSIBILITY_APPROVED:'true',
    HOSTING_APPROVED:'true',PUBLIC_CONTACT_EMAIL:'vishvaelumalai98@gmail.com'
  };
  assert.equal(assessRelease(e).ready,true);
  assert.equal(assessRelease({...e,PUBLIC_CONTACT_EMAIL:'unapproved@example.org'}).ready,false);
  assert.equal(assessRelease({...e,PUBLIC_CONTACT_EMAIL:undefined}).ready,true);
  assert.equal(assessRelease({...e,PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true'}).ready,false);
  assert.equal(assessRelease({...e,RELEASE_MODE:'affiliate'}).ready,false);
  assert.equal(assessRelease({...e,RELEASE_MODE:'affiliate',PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true',
    AMAZON_SITE_REGISTERED:'true',AMAZON_LINKS_EDITORIALLY_APPROVED:'true',
    AMAZON_APPROVED_SITE_URL:'https://different.example.org/'}).ready,false);
});
test('Amazon link validation rejects redirects, untagged products and foreign hosts',()=>{
  assert.equal(validateAmazonLink(candidateUrl).asin,'B0TEST1234');
  for(const url of [
    'https://amzn.in/d/anything','https://amazon.co.uk/dp/B0TEST1234?tag=example-21',
    'https://www.amazon.in/dp/B0TEST1234','http://www.amazon.in/dp/B0TEST1234?tag=example-21',
    'https://www.amazon.in:8443/dp/B0TEST1234?tag=example-21'
  ])assert.throws(()=>validateAmazonLink(url));
});
test('local handoff writes only human-approved provenance-matched candidates, never website files',async()=>{
  const queue=await mkdtemp(join(tmpdir(),'visha-handoff-queue-'));
  const out=await mkdtemp(join(tmpdir(),'visha-handoff-out-'));
  try{
    const approvedId=randomUUID(), pendingId=randomUUID();
    const base={schemaVersion:1,title:'A sample technical product',editorialNote:'Original comparison note grounded in specifications.',
      category:'developer-gear',source:'manual-sitestripe',createdAt:new Date().toISOString(),
      amazon:{asin:'B0TEST1234',url:candidateUrl,trackingId:'example-21'},publishApproved:false};
    await writeFile(join(queue,`B0TEST1234-${approvedId}.json`),JSON.stringify({...base,id:approvedId,
      reviewStatus:'approved',reviewHistory:[{decision:'approve',note:'Reviewed suitability and disclosure.',at:new Date().toISOString()}]}));
    await writeFile(join(queue,`B0TEST1234-${pendingId}.json`),JSON.stringify({...base,id:pendingId,reviewStatus:'pending'}));
    const env={...process.env,AMAZON_AGENT_QUEUE_DIR:queue,AMAZON_AGENT_HANDOFF_DIR:out};
    const script=resolve('scripts/amazon-handoff.mjs');
    const dry=spawnSync(process.execPath,[script],{env,encoding:'utf8'});
    assert.equal(dry.status,0,dry.stderr);
    assert.equal((await readdir(out)).length,0);
    const saved=spawnSync(process.execPath,[script,'--write'],{env,encoding:'utf8'});
    assert.equal(saved.status,0,saved.stderr);
    const names=await readdir(out);
    assert.equal(names.length,1);
    const doc=JSON.parse(await readFile(join(out,names[0]),'utf8'));
    assert.equal(doc.products.length,1);
    assert.equal(doc.products[0].id,approvedId);
    assert.equal(doc.products[0].publishApproved,false);
    assert.equal(doc.publicationAuthorized,false);
    assert.match(doc.products[0].editorialStatus,/awaiting-separate/);
  }finally{await rm(queue,{recursive:true,force:true});await rm(out,{recursive:true,force:true});}
});
