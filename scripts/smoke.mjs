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
const sourceRoot = path.dirname(rootPath);
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
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest\?v=[a-f0-9]+"/, `${page} must point to the install manifest`);
  assert.match(html, /pwa-register\.js\?v=[a-f0-9]+/, `${page} must register offline support`);
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
assert.equal(await fs.readFile(path.join(rootPath, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n', 'The private beta must remain blocked from crawler indexing.');
assert.doesNotMatch(await fs.readFile(path.join(rootPath, 'sitemap.xml'), 'utf8'), /<loc>/, 'The private beta must not expose indexable sitemap entries.');
const manifestResponse = await fetch(new URL('manifest.webmanifest', origin));
assert.equal(manifestResponse.status, 200, 'The install manifest should be served by the production preview');
assert.match(manifestResponse.headers.get('content-type') || '', /application\/manifest\+json/i);
const manifest = await manifestResponse.json();
assert.equal(manifest.name, 'WagSignals');
assert.equal(manifest.scope, './');
assert.equal(manifest.start_url, './');
assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) {
  const iconResponse = await fetch(new URL(icon.src, `${origin}/`));
  assert.equal(iconResponse.status, 200, icon.src);
  const bytes = Buffer.from(await iconResponse.arrayBuffer());
  const dimension = Number(icon.sizes.split('x')[0]);
  assert.equal(bytes.readUInt32BE(0), 0x89504e47, `${icon.src} must be a PNG`);
  assert.equal(bytes.readUInt32BE(16), dimension, `${icon.src} width`);
  assert.equal(bytes.readUInt32BE(20), dimension, `${icon.src} height`);
}
const workerResponse = await fetch(new URL('service-worker.js', origin));
assert.equal(workerResponse.status, 200, 'The service worker should be available at site scope');
const workerSource = await workerResponse.text();
const workerBuildId = workerSource.match(/const BUILD_ID = '([a-f0-9]{16})'/)?.[1];
assert.ok(workerBuildId, 'Production service worker should receive a build-specific cache version');
assert.match(workerSource, /const SHELL_CACHE = `wagsignals-shell-\$\{BUILD_ID\}`/, 'The generated build ID should be part of the owned shell-cache name');
assert.doesNotMatch(workerSource, /__BUILD_ID__|skipWaiting\s*\(/, 'The production worker must have a build ID and safe activation behavior');
assert.match(workerSource, /wagsignals-images-v1/, 'Viewed illustrations should be retained for offline visits');
const sourceWorker = await fs.readFile(path.join(sourceRoot, 'service-worker.js'), 'utf8');
assert.equal(workerSource, sourceWorker.replace('__BUILD_ID__', workerBuildId), 'The production worker should be exactly the source worker with the deterministic build ID injected.');
const registrationSource = await fs.readFile(path.join(rootPath, 'pwa-register.js'), 'utf8');
assert.equal(registrationSource, await fs.readFile(path.join(sourceRoot, 'pwa-register.js'), 'utf8'), 'PWA registration output must match source.');
for (const file of ['manifest.webmanifest', 'favicon.svg', 'assets/wagsignals-192.png', 'assets/wagsignals-512.png', 'assets/wagsignals-maskable-512.png']) {
  assert.deepEqual(await fs.readFile(path.join(rootPath, file)), await fs.readFile(path.join(sourceRoot, file)), `${file} must be copied from source without modification.`);
}
for (const guide of ['biting-nipping', 'stones-dirt', 'destructive-chewing', 'resource-guarding', 'barking-lunging', 'chasing-traffic', 'separation-distress', 'door-dashing']) {
  const guideResponse = await fetch(new URL(`challenges.html?guide=${guide}`, origin));
  assert.equal(guideResponse.status, 200, `Direct challenge guide route: ${guide}`);
  assert.match(await guideResponse.text(), /challenge-data\.js\?v=/, `Challenge data must load for ${guide}`);
}
const files = [...pages, 'app.js', 'signals.js', 'training-data.js', 'guided-reader.js', 'training.js', 'challenge-data.js', 'challenges.js', 'pwa-register.js', 'service-worker.js', 'manifest.webmanifest', 'styles.css', 'favicon.svg', 'robots.txt', 'sitemap.xml', ...(await fs.readdir(new URL('assets/', root))).map((file) => `assets/${file}`)];
const bytes = (await Promise.all(files.map(async (file) => (await fs.stat(new URL(file, root))).size))).reduce((sum, size) => sum + size, 0);
console.log(`Passed: ${pages.length} production pages, ${resources.size} local URLs/assets, root homepage. Build size: ${bytes} bytes.`);
