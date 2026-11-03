import { defineConfig } from 'astro/config';
import { assessRelease } from './scripts/release-preflight.mjs';

// Tailwind 4 is configured through PostCSS, preventing duplicate Vite type trees.
// Never turn on public release flags without the owner's separate approval.
const site = process.env.SITE_URL?.trim();
// A project-specific base is used ONLY by the independent GitHub Pages fallback build.
// Cloudflare Workers retain root-relative URLs.
const pagesBase = process.env.GITHUB_PAGES_BASE?.trim();
if (pagesBase && !/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pagesBase)) {
  throw new Error('GITHUB_PAGES_BASE must be a single URL-safe repository path.');
}
const published = process.env.PUBLIC_SITE_LIVE === 'true';
if (published) {
  const gate = assessRelease(process.env);
  if (!gate.ready) {
    throw new Error('Release blocked: ' + gate.blockers.join('; '));
  }
}

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  ...(pagesBase ? { base: pagesBase + '/' } : {}),
  ...(site ? { site } : {}),
});
