#!/usr/bin/env node
/**
 * Read-only Cloudflare Workers static-assets preflight.
 * Never contacts Cloudflare, runs Wrangler, or deploys anything.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(process.cwd());
const problems = [];
const configPath = join(root, 'wrangler.jsonc');
const outputPath = join(root, 'dist');
const fail = message => problems.push(message);

if (!existsSync(configPath)) {
  fail('Missing root wrangler.jsonc');
} else {
  const raw = readFileSync(configPath, 'utf8');
  let config;
  try {
    // This project's Wrangler file is JSON-compatible JSONC (no comments).
    config = JSON.parse(raw);
  } catch {
    fail('wrangler.jsonc cannot be parsed by this safe JSON-only check; review its syntax');
  }
  if (config) {
    if (config.name !== 'visha-tech') {
      fail('Worker name differs from documented Cloudflare project visha-tech; verify the dashboard before changing it');
    }
    if (config.assets?.directory !== './dist') {
      fail('Expected assets.directory to be ./dist for static Astro output');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(config.compatibility_date ?? '')) {
      fail('Missing valid compatibility_date in wrangler.jsonc');
    }
    if (config.main || config.build?.command) {
      fail('Unexpected Worker entrypoint or Wrangler build command: investigate static-only configuration');
    }
  }
}
if (!existsSync(join(outputPath, 'index.html'))) {
  fail('Missing dist/index.html; run npm run build first');
}
for (const asset of ['robots.txt', '_headers']) {
  const file = join(outputPath, asset);
  if (!existsSync(file) || !statSync(file).isFile()) {
    fail('Missing expected static asset dist/' + asset);
  }
}
if (problems.length) {
  for (const item of problems) console.error('FAIL: ' + item);
  process.exitCode = 1;
} else {
  console.log('PASS: local static-assets packaging checks completed.');
  console.log('NOT CHECKED: Cloudflare account permissions, project domain, Worker name registration, deployment API, or Git integration.');
  console.log('NO DEPLOYMENT PERFORMED.');
}
