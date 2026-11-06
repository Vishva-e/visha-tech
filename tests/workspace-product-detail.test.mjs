import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
/** @param {string} filename */
const read = filename => readFileSync(filename, 'utf8');

test('App product detail is created from existing owner-submitted candidates', () => {
  const detail = read('src/pages/dashboard/products/[id].astro');
  const dashboard = read('src/pages/dashboard/index.astro');
  const app = read('src/layouts/AppLayout.astro');
  assert.match(detail, /productCandidates\.map\(product/);
  assert.match(detail, /getStaticPaths/);
  assert.match(detail, /aria-labelledby="product-heading"/);
  assert.match(detail, /appGuidePath/);
  assert.match(dashboard, /productCandidates\[0\]/);
  assert.match(dashboard, /View product details/);
  assert.match(app, /Product spotlight/);
});

test('App product detail does not bypass affiliate or editorial approval', () => {
  const detail = read('src/pages/dashboard/products/[id].astro');
  assert.match(detail, /approvedAffiliateLink\(product, process\.env\)/);
  assert.match(detail, /productLink \?/);
  assert.match(detail, /Affiliate|affiliate/);
  assert.match(detail, /Price not displayed/);
  assert.match(detail, /Illustrative artwork/);
  assert.doesNotMatch(detail, /product\.url\}/);
});
