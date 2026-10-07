import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');
const pages = ['index.html', 'daily.html', 'quiz.html', 'signals.html', 'behaviors.html', 'training.html', 'challenges.html', 'body-map.html', 'saved.html', 'scenarios.html', 'cheat-sheet.html', 'sources-safety.html'];
const normalizeOrigin = (value) => {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_ORIGIN must be an https origin such as https://example.com.');
  }
  return url.origin;
};
const siteOrigin = normalizeOrigin(process.env.PUBLIC_SITE_ORIGIN);
const indexable = process.env.PUBLIC_SITE_INDEXABLE === 'true';
if (indexable && !siteOrigin) throw new Error('PUBLIC_SITE_INDEXABLE=true requires PUBLIC_SITE_ORIGIN.');
const routeFor = (page) => page === 'index.html' ? '/' : `/${page}`;
const assetVersions = new Map();
for (const file of ['styles.css', 'app.js', 'signals.js', 'training-data.js', 'guided-reader.js', 'training.js', 'challenge-data.js', 'challenges.js', 'pwa-register.js', 'install.js', 'manifest.webmanifest', 'assets/wagsignals-192.png', 'assets/wagsignals-512.png', 'assets/wagsignals-maskable-512.png']) {
  assetVersions.set(file, createHash('sha256').update(await fs.readFile(path.join(projectRoot, file))).digest('hex').slice(0, 12));
}
const buildHash = createHash('sha256');
const sourceAssets = (await fs.readdir(path.join(projectRoot, 'assets')))
  .filter((file) => !/\.(?:jpe?g)$/i.test(file))
  .sort()
  .map((file) => `assets/${file}`);
const buildInputs = [
  ...pages, 'styles.css', 'app.js', 'signals.js', 'training-data.js', 'guided-reader.js', 'training.js',
  'challenge-data.js', 'challenges.js', 'pwa-register.js', 'install.js', 'manifest.webmanifest', 'service-worker.js',
  'favicon.svg', ...sourceAssets
];
for (const file of buildInputs) {
  buildHash.update(file);
  buildHash.update('\0');
  buildHash.update(await fs.readFile(path.join(projectRoot, file)));
}
const buildId = buildHash.digest('hex').slice(0, 16);
const decorateHtml = (html, page) => {
  // Changed assets get new production URLs, even when a manual version bump is missed.
  html = html.replace(/(styles\.css|app\.js|signals\.js|training-data\.js|guided-reader\.js|training\.js|challenge-data\.js|challenges\.js|pwa-register\.js|install\.js)\?v=[\w-]+/g, (_, file) => `${file}?v=${assetVersions.get(file)}`);
  html = html.replace(/manifest\.webmanifest\?v=[\w-]+/g, `manifest.webmanifest?v=${assetVersions.get('manifest.webmanifest')}`);
  html = html.replace(/assets\/(wagsignals-(?:192|512|maskable-512)\.png)\?v=[\w-]+/g, (_, file) => `assets/${file}?v=${assetVersions.get(`assets/${file}`)}`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'WagSignals';
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const tags = [
    `<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, nofollow'}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="WagSignals" />',
    `<meta name="twitter:card" content="${siteOrigin ? 'summary_large_image' : 'summary'}" />`
  ];
  if (siteOrigin) {
    const canonical = `${siteOrigin}${routeFor(page)}`;
    const previewImage = `${siteOrigin}/assets/dog-language-hero.webp`;
    tags.push(
      `<link rel="canonical" href="${canonical}" />`,
      `<meta property="og:url" content="${canonical}" />`,
      `<meta property="og:image" content="${previewImage}" />`,
      '<meta property="og:image:alt" content="Friendly dogs in a sunny park, illustrating WagSignals dog body-language guidance" />',
      `<meta name="twitter:image" content="${previewImage}" />`,
      '<meta name="twitter:image:alt" content="Friendly dogs in a sunny park" />'
    );
  }
  return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
};

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const file of pages) {
  const html = await fs.readFile(path.join(projectRoot, file), 'utf8');
  await fs.writeFile(path.join(outputRoot, file), decorateHtml(html, file));
}
for (const file of ['styles.css', 'signals.js', 'app.js', 'training-data.js', 'guided-reader.js', 'training.js', 'challenge-data.js', 'challenges.js', 'pwa-register.js', 'install.js', 'manifest.webmanifest']) {
  await fs.copyFile(path.join(projectRoot, file), path.join(outputRoot, file));
}
const serviceWorker = (await fs.readFile(path.join(projectRoot, 'service-worker.js'), 'utf8')).replace('__BUILD_ID__', buildId);
await fs.writeFile(path.join(outputRoot, 'service-worker.js'), serviceWorker);
await fs.copyFile(path.join(projectRoot, 'favicon.svg'), path.join(outputRoot, 'favicon.svg'));
const robots = siteOrigin && indexable
  ? `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n';
await fs.writeFile(path.join(outputRoot, 'robots.txt'), robots);
const sitemapUrls = siteOrigin && indexable
  ? pages.map((page) => `  <url><loc>${siteOrigin}${routeFor(page)}</loc></url>`).join('\n')
  : '';
await fs.writeFile(path.join(outputRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls ? `\n${sitemapUrls}\n` : ''}</urlset>\n`);
await fs.cp(path.join(projectRoot, 'assets'), path.join(outputRoot, 'assets'), {
  recursive: true,
  filter: (source) => !/\.(?:jpe?g)$/i.test(source)
});

console.log(`Built static site into dist/ (${indexable ? 'indexable' : 'no-index'}${siteOrigin ? `; ${siteOrigin}` : ''}).`);
