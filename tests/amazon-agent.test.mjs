import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const agent = resolve('scripts/amazon-agent.mjs');
const rawProductUrl = 'https://www.amazon.in/dp/B0TEST1234';
const taggedProductUrl = 'https://www.amazon.in/dp/B0TEST1234?tag=vishvatechgui-21';
/** @param {string} queueDir @param {string} command @param {...string} args */
function invoke(queueDir, command, ...args) {
  return spawnSync(process.execPath, [agent, command, ...args], {
    encoding: 'utf8',
    env: { ...process.env, AMAZON_AGENT_QUEUE_DIR: queueDir },
  });
}

test('rejects unsafe hosts, shortlinks, non-product pages and foreign tracking tags', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'visha-agent-reject-'));
  try {
    for (const url of [
      'https://evil.example/dp/B0TEST1234',
      'https://amzn.in/d/B0TEST1234',
      'http://www.amazon.in/dp/B0TEST1234',
      'https://www.amazon.in/s?k=laptop',
      'https://www.amazon.in/dp/B0TEST1234?tag=someoneelse-21',
      'https://www.amazon.com/dp/B0TEST1234',
      'https://www.amazon.in/dp/not-an-asin'
    ]) {
      const run = invoke(dir, 'queue', '--title', 'A suitable test product', '--url', url,
        '--category', 'laptops', '--summary', 'Original editorial note for review only.');
      assert.notEqual(run.status, 0, url);
    }
    assert.equal((await readdir(dir)).length, 0);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('generates a tagged direct link from an ASIN without SiteStripe interaction', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'visha-agent-link-'));
  try {
    const result = invoke(dir, 'link', '--asin', 'b0test1234');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), taggedProductUrl);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('queues an owner-selected product URL for human review only', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'visha-agent-accept-'));
  try {
    const result = invoke(dir, 'queue', '--title', 'An example laptop for developers', '--url', rawProductUrl,
      '--category', 'laptops', '--summary', 'Compare battery life, RAM and thermal design before publishing.');
    assert.equal(result.status, 0, result.stderr);
    const names = await readdir(dir);
    assert.equal(names.length, 1);
    const record = JSON.parse(await readFile(join(dir, names[0]), 'utf8'));
    assert.equal(record.amazon.asin, 'B0TEST1234');
    assert.equal(record.amazon.trackingId, 'vishvatechgui-21');
    assert.equal(record.amazon.url, taggedProductUrl);
    assert.equal(record.source, 'owner-generated-direct-link');
    assert.equal(record.publishApproved, false);
    assert.equal(record.reviewStatus, 'pending');
    const list = invoke(dir, 'list');
    assert.equal(list.status, 0, list.stderr);
    assert.match(list.stdout, /B0TEST1234/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('accepts a valid SiteStripe URL without changing the owner tracking tag', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'visha-agent-sitestripe-'));
  try {
    const result = invoke(dir, 'queue', '--title', 'A suitable test product', '--url', taggedProductUrl,
      '--category', 'laptops', '--summary', 'Original editorial note for review only.');
    assert.equal(result.status, 0, result.stderr);
    const [name] = await readdir(dir);
    const record = JSON.parse(await readFile(join(dir, name), 'utf8'));
    assert.equal(record.amazon.url, taggedProductUrl);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
