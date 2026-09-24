import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'favicon.svg',
  'assets/dog-language-hero.png',
  'assets/guide-relaxed.png',
  'assets/guide-playful.png',
  'assets/guide-interested.png',
  'assets/guide-uncertain.png',
  'assets/guide-stressed.png',
  'assets/guide-fearful.png',
  'assets/guide-needs-space.png',
  'assets/guide-warning.png',
  'assets/behavior-sniffing.png',
  'assets/behavior-barking.png',
  'assets/behavior-chewing.png',
  'assets/behavior-digging.png',
  'assets/behavior-zoomies.png',
  'assets/behavior-jumping.png',
  'assets/behavior-pawing.png',
  'assets/behavior-resting.png'
];

for (const relativePath of requiredFiles) {
  await fs.access(path.join(projectRoot, relativePath));
}

const html = await fs.readFile(path.join(projectRoot, 'index.html'), 'utf8');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference && !reference.startsWith('#') && !/^(https?:|data:|mailto:|javascript:)/i.test(reference));

for (const reference of references) {
  await fs.access(path.resolve(projectRoot, reference));
}

const requiredCopy = [
  'eyes', 'ears', 'mouth', 'body', 'tail', 'movement', 'context', 'Movement', 'Situation / context',
  'Relaxed / happy', 'Ready to play', 'Interested / alert', 'Not so sure',
  'Stressed / anxious', 'Fearful', 'Needs space', 'Strong warning'
  , 'Sniffing & exploring', 'Barking & vocalizing', 'Chewing & shredding', 'Digging',
  'Zoomies', 'Jumping up', 'Pawing & nudging', 'Resting & hiding'
];
const missingCopy = requiredCopy.filter((text) => !html.includes(text));
if (missingCopy.length) throw new Error(`Missing required body-language content: ${missingCopy.join(', ')}`);

const signalCount = (html.match(/data-signal=/g) ?? []).length;
if (signalCount < 8) throw new Error(`Expected at least 8 signal cards, found ${signalCount}.`);
const behaviorCount = (html.match(/class="behavior-card"/g) ?? []).length;
if (behaviorCount < 8) throw new Error(`Expected at least 8 behavior cards, found ${behaviorCount}.`);

console.log(`Checked ${requiredFiles.length} required files, ${references.length} local references, ${signalCount} signal cards, and ${behaviorCount} behavior cards.`);
