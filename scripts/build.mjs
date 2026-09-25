import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const file of ['index.html', 'daily.html', 'quiz.html', 'signals.html', 'behaviors.html', 'training.html', 'challenges.html', 'body-map.html', 'styles.css', 'signals.js', 'app.js']) {
  await fs.copyFile(path.join(projectRoot, file), path.join(outputRoot, file));
}
await fs.copyFile(path.join(projectRoot, 'favicon.svg'), path.join(outputRoot, 'favicon.svg'));
await fs.copyFile(path.join(projectRoot, 'robots.txt'), path.join(outputRoot, 'robots.txt'));
await fs.copyFile(path.join(projectRoot, 'sitemap.xml'), path.join(outputRoot, 'sitemap.xml'));
await fs.cp(path.join(projectRoot, 'assets'), path.join(outputRoot, 'assets'), { recursive: true });

console.log('Built static site into dist/.');
