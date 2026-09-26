import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const decorateHtml = (html, page) => {
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'WagSignals';
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const tags = [
    `<meta name="robots" content="${indexable ? 'index, follow' : 'noindex, nofollow'}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta property="og:type" content="website" />',
    '<meta name="twitter:card" content="summary" />'
  ];
  if (siteOrigin) {
    const canonical = `${siteOrigin}${routeFor(page)}`;
    tags.push(`<link rel="canonical" href="${canonical}" />`, `<meta property="og:url" content="${canonical}" />`);
  }
  return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
};

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const file of pages) {
  const html = await fs.readFile(path.join(projectRoot, file), 'utf8');
  await fs.writeFile(path.join(outputRoot, file), decorateHtml(html, file));
}
for (const file of ['styles.css', 'signals.js', 'app.js']) {
  await fs.copyFile(path.join(projectRoot, file), path.join(outputRoot, file));
}
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

console.log('Built static site into dist/.');
