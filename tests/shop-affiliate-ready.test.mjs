import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {approvedAffiliateLink} from '../src/lib/affiliate-link-gate.mjs';
/** @param {string} path */
const content=path=>readFileSync(path,'utf8');
const approvedEnv={
  PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true',AMAZON_SITE_REGISTERED:'true',
  AMAZON_LINKS_EDITORIALLY_APPROVED:'true',AMAZON_ASSOCIATE_TAG:'verifiedshop-21',
  SITE_URL:'https://visha-shop.pages.dev/',
  AMAZON_APPROVED_SITE_URL:'https://visha-shop.pages.dev/'
};
const product={url:'https://www.amazon.in/dp/B0TEST1234?tag=verifiedshop-21',reviewed:true,status:'approved'};
test('approved SiteStripe product with matching tag, site and review gets compliant metadata',()=>{
  const actual=approvedAffiliateLink(product,approvedEnv);
  assert.equal(actual?.asin,'B0TEST1234');
  assert.equal(actual?.trackingId,'verifiedshop-21');
  assert.equal(actual?.disclosure,'(paid link)');
  assert.match(actual?.rel??'',/sponsored nofollow noopener noreferrer/);
});
test('no Amazon links before real account/site/product approvals and tag verification',()=>{
  for(const k of ['PUBLIC_AMAZON_ASSOCIATE_ACTIVE','AMAZON_SITE_REGISTERED','AMAZON_LINKS_EDITORIALLY_APPROVED']){
    assert.equal(approvedAffiliateLink(product,{...approvedEnv,[k]:'false'}),null,k);
  }
  assert.equal(approvedAffiliateLink({...product,reviewed:false},approvedEnv),null);
  assert.equal(approvedAffiliateLink({...product,status:'pending'},approvedEnv),null);
  assert.equal(approvedAffiliateLink(product,{...approvedEnv,AMAZON_ASSOCIATE_TAG:'other-21'}),null);
  assert.equal(approvedAffiliateLink(product,{...approvedEnv,AMAZON_APPROVED_SITE_URL:'https://other-site.example/'}),null);
  assert.equal(approvedAffiliateLink(product,{...approvedEnv,AMAZON_ASSOCIATE_TAG:undefined}),null);
});
test('only direct HTTPS Amazon.in product URLs can ever pass',()=>{
  for(const url of [
    'https://evil.example/dp/B0TEST1234?tag=verifiedshop-21',
    'https://amzn.in/d/B0TEST1234?tag=verifiedshop-21',
    'https://www.amazon.in/s?k=laptop&tag=verifiedshop-21',
    'http://www.amazon.in/dp/B0TEST1234?tag=verifiedshop-21',
    'https://www.amazon.in/dp/B0TEST1234?tag=other-21'
  ])assert.equal(approvedAffiliateLink({...product,url},approvedEnv),null,url);
});
test('shop discovery has route, trusted category links and no fake prices or checkout',()=>{
  const page=content('src/pages/shop/index.astro');
  const nav=content('src/data/site.ts');
  assert.match(nav,/\{label:'Shop', href:'\/shop\/'\}/);
  assert.match(page,/shop-categories/);
  assert.match(page,/category-grid/);
  assert.match(page,/GuideCard/);
  assert.match(page,/Affiliate purchase links are not currently active/);
  assert.doesNotMatch(page,/tag=[a-z0-9_-]+-21|(?:₹|Rs\.)\s*\d+|add to cart|checkout now/i);
  assert.match(content('src/layouts/BaseLayout.astro'),/noindex,nofollow,noarchive/);
});
