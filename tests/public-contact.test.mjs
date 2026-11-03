import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { approvedPublicContactEmail } from '../src/config/public-contact.mjs';
import { assessRelease } from '../scripts/release-preflight.mjs';

test('Contact and privacy pages share the explicitly approved public email',()=>{
  assert.equal(approvedPublicContactEmail,'vishvaelumalai98@gmail.com');
  for(const path of ['src/pages/contact.astro','src/pages/privacy.astro']){
    const code=readFileSync(path,'utf8');
    assert.match(code,/approvedPublicContactEmail/);
  }
});

test('release preflight rejects accidental contact email drift',()=>{
  const baseline={SITE_URL:'https://vishatechpicks.example.org/',OWNER_RELEASE_APPROVED:'true',
  PUBLIC_SITE_LIVE:'true',CONTENT_REVIEW_APPROVED:'true',PRIVACY_REVIEW_APPROVED:'true',
  DEVICE_ACCESSIBILITY_APPROVED:'true',HOSTING_APPROVED:'true',RELEASE_MODE:'editorial'};
  assert.equal(assessRelease(baseline).ready,true);
  assert.equal(assessRelease({...baseline,PUBLIC_CONTACT_EMAIL:'other@example.org'}).ready,false);
});
