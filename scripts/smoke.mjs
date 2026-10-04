import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Inspect an already-running local production preview, without changing browser data.
const origin = process.argv[2] || 'http://localhost:4173';
const url = new URL(origin);
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'Smoke checks only target a local preview.');
const root = new URL('../dist/', import.meta.url);
const rootPath = fileURLToPath(root);
const pages = (await fs.readdir(root)).filter((file) => file.endsWith('.html'));
const resources = new Set(pages);
for (const page of pages) {
  const response = await fetch(new URL(page, origin));
  assert.equal(response.status, 200, page);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(response.headers.get('cache-control') || '', /\bno-store\b/i, `${page} should not serve a stale local preview`);
  const html = await response.text();
  assert.match(html, /<main\b/);
  assert.doesNotMatch(html, /Index of /);
  assert.match(html, /<meta name="robots" content="noindex, nofollow"\s*\/>/, `${page} must remain private by default`);
  assert.equal(html, await fs.readFile(path.join(rootPath, page), 'utf8'), `${page} must match the current build, not a stale server copy`);
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    // Check only local resources; external destinations (including mail/tel links) are never fetched.
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(ref)) continue;
    resources.add(ref);
  }
}
for (const asset of await fs.readdir(new URL('assets/', root))) resources.add(`assets/${asset}`);
for (const resource of resources) {
  const resourceUrl = new URL(resource, origin);
  assert.equal(resourceUrl.origin, url.origin, `Resource must stay local: ${resource}`);
  const response = await fetch(resourceUrl);
  assert.equal(response.status, 200, resource);
  assert.match(response.headers.get('cache-control') || '', /\bno-store\b/i, `${resource} should not serve a stale local preview`);
  const actual = Buffer.from(await response.arrayBuffer());
  assert.ok(actual.byteLength > 0, resource);
  const relativePath = decodeURIComponent(resourceUrl.pathname).replace(/^\/+/, '') || 'index.html';
  const expectedPath = path.resolve(rootPath, relativePath);
  const fromRoot = path.relative(rootPath, expectedPath);
  assert.ok(fromRoot !== '..' && !fromRoot.startsWith(`..${path.sep}`) && !path.isAbsolute(fromRoot), `Resource must stay inside dist/: ${resource}`);
  assert.deepEqual(actual, await fs.readFile(expectedPath), `${resource} must match the current production build`);
}
const homepage = await fetch(origin);
assert.equal(homepage.status, 200);
assert.match(homepage.headers.get('cache-control') || '', /\bno-store\b/i, 'The root homepage should not serve a stale local preview');
const homepageHtml = await homepage.text();
assert.match(homepageHtml, /Read the whole dog/);
assert.equal(homepageHtml, await fs.readFile(path.join(rootPath, 'index.html'), 'utf8'), 'The site root must serve the current homepage.');
for (const guide of ['biting-nipping', 'stones-dirt', 'destructive-chewing', 'resource-guarding', 'barking-lunging', 'chasing-traffic', 'separation-distress', 'door-dashing']) {
  const guideResponse = await fetch(new URL(`challenges.html?guide=${guide}`, origin));
  assert.equal(guideResponse.status, 200, `Direct challenge guide route: ${guide}`);
  assert.match(await guideResponse.text(), /challenge-data\.js\?v=/, `Challenge data must load for ${guide}`);
}
const files = [...pages, 'app.js', 'signals.js', 'training-data.js', 'guided-reader.js', 'training.js', 'challenge-data.js', 'challenges.js', 'styles.css', 'favicon.svg', 'robots.txt', 'sitemap.xml', ...(await fs.readdir(new URL('assets/', root))).map((file) => `assets/${file}`)];
const bytes = (await Promise.all(files.map(async (file) => (await fs.stat(new URL(file, root))).size))).reduce((sum, size) => sum + size, 0);
console.log(`Passed: ${pages.length} production pages, ${resources.size} local URLs/assets, root homepage. Build size: ${bytes} bytes.`);
