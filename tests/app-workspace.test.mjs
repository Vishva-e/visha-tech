import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
/** @param {string} path */
const file = path => readFileSync(path, 'utf8');

test('Workspace has distinct sidebar, toolbar and indexable-only-on-release metadata', () => {
  const layout = file('src/layouts/AppLayout.astro');
  assert.match(layout, /id="app-sidebar"/);
  assert.match(layout, /id="app-sidebar-toggle"/);
  assert.match(layout, /aria-controls="app-sidebar"/);
  assert.match(layout, /aria-label="Breadcrumb"/);
  assert.match(layout, /id="main"/);
  assert.match(layout, /noindex,nofollow,noarchive/);
  assert.match(layout, /PUBLIC_SITE_LIVE/);
  assert.match(layout, /subscribeToSavedChanges/);
  assert.match(layout, /toggleSaved/);
});

test('Workspace pages provide real data and functional view controls', () => {
  const overview = file('src/pages/dashboard/index.astro');
  const library = file('src/pages/dashboard/library/index.astro');
  const saved = file('src/pages/dashboard/saved/index.astro');
  const detail = file('src/pages/dashboard/guides/[slug].astro');
  const card = file('src/components/AppGuideCard.astro');
  assert.match(overview, /getCollection\('guides'/);
  assert.match(overview, /categoryCounts/);
  assert.match(library, /id="app-library-search"/);
  assert.match(library, /id="app-library-category"/);
  assert.match(library, /id="app-library-sort"/);
  assert.match(library, /data-view="grid"/);
  assert.match(library, /data-view="list"/);
  assert.match(library, /history\.replaceState/);
  assert.match(saved, /getSavedIds/);
  assert.match(saved, /subscribeToSavedChanges/);
  assert.match(detail, /getStaticPaths/);
  assert.match(detail, /const \{ Content, headings \} = await render\(guide\)/);
  assert.match(detail, /aria-label="Table of contents"/);
  assert.match(detail, /data-save-guide=\{guide\.id\}/);
  assert.match(card, /data-save-guide=\{guide\.id\}/);
});

test('Reading list stays browser local and never injects arbitrary guide slugs', () => {
  const source = file('src/lib/reading-list.ts');
  assert.match(source, /localStorage\.getItem/);
  assert.match(source, /localStorage\.setItem/);
  assert.match(source, /SLUG\.test\(slug\)/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon/);
});

test('Workspace reachable from storefront without altering affiliate release gates', () => {
  assert.match(file('src/components/Header.astro'), /href: '\/dashboard\/'/);
  assert.match(file('src/components/Footer.astro'), /href="\/dashboard\/"/);
  assert.match(file('public/robots.txt'), /Disallow:\s*\//);
  assert.match(file('src/layouts/AppLayout.astro'), /noindex,nofollow,noarchive/);
  assert.doesNotMatch(file('src/pages/dashboard/index.astro'), /buy now|add to cart|checkout now/i);
});
