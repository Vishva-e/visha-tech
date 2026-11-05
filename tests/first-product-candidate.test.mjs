
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCandidates } from '../src/data/product-candidates.mjs';
import { approvedAffiliateLink } from '../src/lib/affiliate-link-gate.mjs';
import {validateAmazonLink} from '../scripts/amazon-link-policy.mjs';

test('owner submitted shortlinks represent one genuine Amazon.in Satechi M1 ASIN',()=>{
  assert.equal(productCandidates.length,1);
  const p=productCandidates[0];
  assert.equal(p.title,'Satechi M1 Bluetooth Wireless Mouse');
  assert.equal(p.asin,'B07NYB3HMC');
  assert.equal(p.originalSources.length,2);
  assert.deepEqual(p.originalSources,[
    'https://amzn.in/d/07rIY2xl','https://link.amazon/B04WRYYpT'
  ]);
  const checked=validateAmazonLink(p.url);
  assert.equal(checked.asin,p.asin);
  assert.equal(checked.trackingId,'vishvatechgui-21');
});

test('first product is visible as an editorial candidate, not a paid link by default',()=>{
  const p=productCandidates[0];
  assert.equal(p.status,'pending');
  assert.equal(p.reviewed,false);
  assert.equal(approvedAffiliateLink(p,{}),null);
  const everyFlag={
    AMAZON_ACCOUNT_VERIFIED:'true',PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true',
    AMAZON_SITE_REGISTERED:'true',AMAZON_LINKS_EDITORIALLY_APPROVED:'true',
    AMAZON_ASSOCIATE_TAG:'vishvatechgui-21',
    SITE_URL:'https://visha-shop.pages.dev/',
    AMAZON_APPROVED_SITE_URL:'https://visha-shop.pages.dev/'
  };
  assert.equal(approvedAffiliateLink(p,everyFlag),null,'Editorial approval is independently required even if all environment flags are set');
  const shop=readFileSync('src/pages/shop/index.astro','utf8');
  assert.match(shop,/PRODUCT SPOTLIGHT/i);
  assert.match(shop,/Satechi M1 Bluetooth Wireless Mouse|product\.title/);
  assert.match(shop,/Affiliate link awaiting review/);
  assert.match(shop,/approvedAffiliateLink/);
  assert.match(shop,/rel=\{productLink\.rel\}/);
  assert.match(shop,/productLink\.disclosure/);
  assert.doesNotMatch(shop,/https:\/\/www\.amazon\.in\/dp\/B07NYB3HMC/,'No raw product URLs in public static template');
});

test('approved link returns only when product and independently verified flags pass',()=>{
  const p=productCandidates[0];
  const env={
    AMAZON_ACCOUNT_VERIFIED:'true',PUBLIC_AMAZON_ASSOCIATE_ACTIVE:'true',
    AMAZON_SITE_REGISTERED:'true',AMAZON_LINKS_EDITORIALLY_APPROVED:'true',
    AMAZON_ASSOCIATE_TAG:'vishvatechgui-21',
    SITE_URL:'https://visha-shop.pages.dev/',
    AMAZON_APPROVED_SITE_URL:'https://visha-shop.pages.dev/'
  };
  const allowed=approvedAffiliateLink({...p,reviewed:true,status:'approved'},env);
  assert.equal(allowed?.asin,'B07NYB3HMC');
  assert.equal(allowed?.trackingId,'vishvatechgui-21');
  assert.equal(allowed?.disclosure,'(paid link)');
});
