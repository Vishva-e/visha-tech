import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
/** @param {string} path */
const read = path => readFileSync(path, 'utf8');

test('Workspace adds a keyboard-accessible command palette and local navigation', () => {
  const script = read('public/workspace-enhancements.js');
  assert.match(script, /visha-command-palette/);
  assert.match(script, /metaKey \|\| event\.ctrlKey/);
  assert.match(script, /ArrowDown/);
  assert.match(script, /visha-workspace-recent/);
  assert.match(script, /textContent = item\.label/);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|sendBeacon/);
});

test('Workspace appearance preference is local and supports light and dark themes', () => {
  const script = read('public/workspace-enhancements.js');
  const styles = read('src/styles/workspace-enhancements.css');
  assert.match(script, /visha-workspace-theme/);
  assert.match(script, /data-visha-theme/);
  assert.match(styles, /data-visha-theme=dark/);
  assert.match(styles, /prefers-reduced-motion/);
});
