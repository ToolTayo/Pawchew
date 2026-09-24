import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'dist');

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
await fs.copyFile(path.join(projectRoot, 'index.html'), path.join(outputRoot, 'index.html'));
await fs.copyFile(path.join(projectRoot, 'favicon.svg'), path.join(outputRoot, 'favicon.svg'));
await fs.cp(path.join(projectRoot, 'assets'), path.join(outputRoot, 'assets'), { recursive: true });

console.log('Built static site into dist/.');
