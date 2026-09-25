import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'daily.html', 'quiz.html', 'signals.html', 'behaviors.html', 'training.html', 'challenges.html', 'body-map.html'];
const requiredFiles = [
  ...pages, 'styles.css', 'signals.js', 'app.js', 'favicon.svg', 'robots.txt', 'sitemap.xml',
  'assets/dog-language-hero.png', 'assets/guide-relaxed.png', 'assets/guide-playful.png',
  'assets/guide-interested.png', 'assets/guide-uncertain.png', 'assets/guide-stressed.png',
  'assets/guide-fearful.png', 'assets/guide-needs-space.png', 'assets/guide-warning.png',
  'assets/behavior-sniffing.png', 'assets/behavior-barking.png', 'assets/behavior-chewing.png',
  'assets/behavior-digging.png', 'assets/behavior-zoomies.png', 'assets/behavior-jumping.png',
  'assets/behavior-pawing.png', 'assets/behavior-resting.png', 'assets/training-rewards.png',
  'assets/training-attention.png', 'assets/training-sit-wait.png', 'assets/training-recall.png',
  'assets/training-leash.png', 'assets/training-leave-it.png', 'assets/training-settle.png',
  'assets/training-handling.png', 'assets/challenge-biting.png', 'assets/challenge-stones-dirt.png',
  'assets/challenge-destruction.png', 'assets/challenge-guarding.png', 'assets/challenge-lunging.png',
  'assets/challenge-chasing.png', 'assets/challenge-separation.png', 'assets/challenge-door-dashing.png',
  'app.js'
];

for (const relativePath of requiredFiles) await fs.access(path.join(projectRoot, relativePath));

const htmlByPage = new Map();
for (const page of pages) htmlByPage.set(page, await fs.readFile(path.join(projectRoot, page), 'utf8'));
const allHtml = [...htmlByPage.values()].join('\n');
const references = [...allHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference && !reference.startsWith('#') && !/^(https?:|data:|mailto:|javascript:)/i.test(reference));
for (const reference of references) await fs.access(path.resolve(projectRoot, reference.replace(/^\.\//, '')));

const externalImageRefs = [...allHtml.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]).filter((src) => /^(https?:)?\/\//i.test(src));
if (externalImageRefs.length) throw new Error(`External image references are not allowed: ${externalImageRefs.join(', ')}`);

const requiredCopy = [
  'eyes', 'ears', 'mouth', 'body', 'tail', 'movement', 'context', 'Situation / context',
  'Relaxed / happy', 'Ready to play', 'Interested / alert', 'Not so sure', 'Stressed / anxious',
  'Fearful', 'Needs space', 'Strong warning', 'Sniffing & exploring', 'Barking & vocalizing',
  'Chewing & shredding', 'Digging', 'Zoomies', 'Jumping up', 'Pawing & nudging',
  'Resting & hiding', 'Start with rewards', 'Name & attention', 'Sit & wait', 'Come when called',
  'Loose-leash walking', 'Leave it & drop it', 'Settle on a mat', 'Cooperative handling',
  'Biting & nipping', 'Eating stones & dirt', 'Destructive chewing', 'Guarding food or toys',
  'Barking & lunging', 'Chasing animals or cars', 'Separation distress', 'Door dashing',
  'Today’s Wag.', 'Can you read the whole pattern?', 'Daily Wag', 'Quiz'
];
const missingCopy = requiredCopy.filter((text) => !allHtml.includes(text));
if (missingCopy.length) throw new Error(`Missing required guide content: ${missingCopy.join(', ')}`);

const signalCount = (htmlByPage.get('signals.html').match(/data-signal=/g) ?? []).length;
const behaviorCount = (htmlByPage.get('behaviors.html').match(/class="behavior-card"/g) ?? []).length;
const trainingCount = (htmlByPage.get('training.html').match(/class="training-card"/g) ?? []).length;
const challengeCount = (htmlByPage.get('challenges.html').match(/class="challenge-card"/g) ?? []).length;
for (const [label, count] of [['signal', signalCount], ['behavior', behaviorCount], ['training', trainingCount], ['challenge', challengeCount]]) {
  if (count < 8) throw new Error(`Expected at least 8 ${label} cards, found ${count}.`);
}

const navTargets = [...allHtml.matchAll(/href="\.\/([^"#]+\.html)"/g)].map((match) => match[1]);
for (const target of new Set(navTargets)) await fs.access(path.join(projectRoot, target));

console.log(`Checked ${requiredFiles.length} required files, ${references.length} local references, ${pages.length} pages, ${signalCount} signal cards, ${behaviorCount} behavior cards, ${trainingCount} training cards, ${challengeCount} challenge cards, and ${externalImageRefs.length} external image references.`);
