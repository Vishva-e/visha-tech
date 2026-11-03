import { defineConfig } from 'astro/config';
import { assessRelease } from './scripts/release-preflight.mjs';

// Tailwind 4 is configured through PostCSS, preventing duplicate Vite type trees.
// Never turn on public release flags without the owner's separate approval.
const site = process.env.SITE_URL?.trim();
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
  ...(site ? { site } : {}),
});
