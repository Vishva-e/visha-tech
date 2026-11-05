#!/usr/bin/env node
/**
 * Visha Shop — local, manual-review Amazon link intake.
 * No browser automation, account login, scraping, API credentials or publication.
 * Amazon links must be manually obtained by the account owner from SiteStripe.
 */
import { randomUUID } from 'node:crypto';
import { validateAmazonLink } from './amazon-link-policy.mjs';
import { ownerProvidedTrackingId } from '../src/config/amazon-associates.mjs';
export { validateAmazonLink } from './amazon-link-policy.mjs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const HELP = `Visha Shop • Amazon review-queue agent
  npm run agent:amazon -- queue --title "Product title" --url "https://www.amazon.in/dp/XXXXXXXXXX?tag=YOURTAG-21" --category laptops --summary "Original editor note"
  npm run agent:amazon -- list
Accepted: direct amazon.in product links containing your Amazon tracking tag.
Not accepted: short URLs, scraping, copied reviews/images, direct publishing, account passwords.
Outputs remain local in data/amazon/review-queue/ (gitignored).
`;

/** @param {string[]} argv @returns {Record<string, string>} */
function parseFlags(argv) {
  /** @type {Record<string, string>} */
  const flags = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key?.startsWith('--') || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error('Expected paired --key value arguments.');
    }
    flags[key.slice(2)] = argv[i + 1];
  }
  return flags;
}


const queueDir = resolve(process.env.AMAZON_AGENT_QUEUE_DIR || 'data/amazon/review-queue');

async function main() {
  const [command = 'help', ...rawFlags] = process.argv.slice(2);
  if (command === 'help' || command === '--help') {
    process.stdout.write(HELP);
    return;
  }
  if (command === 'queue') {
    const flags = parseFlags(rawFlags);
    const title = flags.title?.trim();
    const summary = flags.summary?.trim();
    const category = flags.category?.trim();
    if (!title || title.length < 8 || title.length > 180) throw new Error('Original title must be 8–180 characters.');
    if (!summary || summary.length < 15 || summary.length > 800) throw new Error('Add a 15–800 character original editorial note.');
    if (!/^[a-z][a-z0-9-]{1,40}$/.test(category ?? '')) throw new Error('Invalid category slug.');
    const parsed = validateAmazonLink(flags.url ?? '');
    if (parsed.trackingId !== ownerProvidedTrackingId) {
      throw new Error('Amazon India link tracking ID does not match the owner-provided Visha Shop ID.');
    }
    const record = {
      schemaVersion: 1,
      id: randomUUID(),
      title,
      editorialNote: summary,
      category,
      amazon: parsed,
      source: 'manual-sitestripe',
      reviewStatus: 'pending',
      publishApproved: false,
      createdAt: new Date().toISOString(),
    };
    await mkdir(queueDir, { recursive: true, mode: 0o700 });
    const name = `${record.amazon.asin}-${record.id}.json`;
    await writeFile(join(queueDir, name), JSON.stringify(record, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    process.stdout.write(`Draft queued for human review: ${name}\nNo website or Amazon account changes were made.\n`);
    return;
  }
  if (command === 'list') {
    let names;
    try { names = await readdir(queueDir); }
    catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') { process.stdout.write('Review queue is empty.\n'); return; }
      throw error;
    }
    const rows = [];
    for (const name of names.filter(name => name.endsWith('.json'))) {
      const record = JSON.parse(await readFile(join(queueDir, name), 'utf8'));
      rows.push({ id: record.id, asin: record.amazon?.asin, status: record.reviewStatus, publishApproved: record.publishApproved, title: record.title });
    }
    process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
    return;
  }
  throw new Error('Unsupported command. Try: npm run agent:amazon -- help');
}

main().catch(error => { process.stderr.write(`Amazon agent: ${error.message}\n`); process.exitCode = 1; });
