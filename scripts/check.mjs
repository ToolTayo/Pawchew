import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'daily.html', 'quiz.html', 'signals.html', 'behaviors.html', 'training.html', 'challenges.html', 'body-map.html', 'saved.html', 'scenarios.html', 'cheat-sheet.html'];
const requiredFiles = [
  ...pages, 'styles.css', 'signals.js', 'app.js', 'favicon.svg', 'robots.txt', 'sitemap.xml',
  'assets/dog-language-hero.jpg', 'assets/guide-relaxed.jpg', 'assets/guide-playful.jpg',
  'assets/guide-interested.jpg', 'assets/guide-uncertain.jpg', 'assets/guide-stressed.jpg',
  'assets/guide-fearful.jpg', 'assets/guide-needs-space.jpg', 'assets/guide-warning.jpg',
  'assets/behavior-sniffing.jpg', 'assets/behavior-barking.jpg', 'assets/behavior-chewing.jpg',
  'assets/behavior-digging.jpg', 'assets/behavior-zoomies.jpg', 'assets/behavior-jumping.jpg',
  'assets/behavior-pawing.jpg', 'assets/behavior-resting.jpg', 'assets/training-rewards.jpg',
  'assets/training-attention.jpg', 'assets/training-sit-wait.jpg', 'assets/training-recall.jpg',
  'assets/training-leash.jpg', 'assets/training-leave-it.jpg', 'assets/training-settle.jpg',
  'assets/training-handling.jpg', 'assets/challenge-biting.jpg', 'assets/challenge-stones-dirt.jpg',
  'assets/challenge-destruction.jpg', 'assets/challenge-guarding.jpg', 'assets/challenge-lunging.jpg',
  'assets/challenge-chasing.jpg', 'assets/challenge-separation.jpg', 'assets/challenge-door-dashing.jpg',
  'app.js'
];

for (const relativePath of requiredFiles) await fs.access(path.join(projectRoot, relativePath));

const htmlByPage = new Map();
for (const page of pages) htmlByPage.set(page, await fs.readFile(path.join(projectRoot, page), 'utf8'));
const allHtml = [...htmlByPage.values()].join('\n');
const appSource = await fs.readFile(path.join(projectRoot, 'app.js'), 'utf8');
const signalsSource = await fs.readFile(path.join(projectRoot, 'signals.js'), 'utf8');
const allSource = `${allHtml}\n${appSource}\n${signalsSource}`;
const references = [...allHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference && !reference.startsWith('#') && !/^(https?:|data:|mailto:|javascript:)/i.test(reference));
for (const reference of references) await fs.access(path.resolve(projectRoot, reference.replace(/^\.\//, '')));

const externalImageRefs = [...allHtml.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]).filter((src) => /^(https?:)?\/\//i.test(src));
if (externalImageRefs.length) throw new Error(`External image references are not allowed: ${externalImageRefs.join(', ')}`);

const scriptAssetRefs = [...allSource.matchAll(/(?:image|src):\s*['"]([^'"]+)['"]/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference.startsWith('./'));
for (const reference of new Set(scriptAssetRefs)) await fs.access(path.resolve(projectRoot, reference.replace(/^\.\//, '')));

const requiredCopy = [
  'eyes', 'ears', 'mouth', 'body', 'tail', 'movement', 'context', 'Situation / context',
  'Relaxed / happy', 'Ready to play', 'Interested / alert', 'Not so sure', 'Stressed / anxious',
  'Fearful', 'Needs space', 'Strong warning', 'Sniffing & exploring', 'Barking & vocalizing',
  'Chewing & shredding', 'Digging', 'Zoomies', 'Jumping up', 'Pawing & nudging',
  'Resting & hiding', 'Start with rewards', 'Name & attention', 'Sit & wait', 'Come when called',
  'Loose-leash walking', 'Leave it & drop it', 'Settle on a mat', 'Cooperative handling',
  'Biting & nipping', 'Eating stones & dirt', 'Destructive chewing', 'Guarding food or toys',
  'Barking & lunging', 'Chasing animals or cars', 'Separation distress', 'Door dashing',
  'Today’s Wag.', 'Can you read the whole pattern?', 'Daily Wag', 'Quiz', 'Your saved clues', 'Real-life scenarios', 'A one-page dog-reading cheat sheet', 'Search dog scenarios', 'Print cheat sheet'
];
const missingCopy = requiredCopy.filter((text) => !allSource.includes(text));
if (missingCopy.length) throw new Error(`Missing required guide content: ${missingCopy.join(', ')}`);

const signalCount = (signalsSource.match(/category:\s*['"]/g) ?? []).length;
const behaviorCount = (htmlByPage.get('behaviors.html').match(/class="behavior-card"/g) ?? []).length;
const trainingCount = (htmlByPage.get('training.html').match(/class="training-card"/g) ?? []).length;
const challengeCount = (htmlByPage.get('challenges.html').match(/class="challenge-card"/g) ?? []).length;
const quizInitialBlock = appSource.match(/const quizQuestions = \[(.*?)\];\s*\n\nObject\.assign/s)?.[1] ?? '';
const quizAddedBlock = appSource.match(/quizQuestions\.push\((.*?)\n\);/s)?.[1] ?? '';
const quizCount = (quizInitialBlock.match(/\{\s*image:/g) ?? []).length + (quizAddedBlock.match(/\{\s*id:/g) ?? []).length;
if (quizCount !== 20) throw new Error(`Expected exactly 20 visual quiz challenges, found ${quizCount}.`);
if (signalCount < 30) throw new Error(`Expected at least 30 body-language library entries, found ${signalCount}.`);
for (const [label, count] of [['behavior', behaviorCount], ['training', trainingCount], ['challenge', challengeCount]]) {
  if (count < 8) throw new Error(`Expected at least 8 ${label} cards, found ${count}.`);
}

for (const [page, selector] of [['saved.html', 'saved-list'], ['scenarios.html', 'scenario-list'], ['cheat-sheet.html', 'print-sheet']]) {
  if (!htmlByPage.get(page).includes(`id="${selector}"`)) throw new Error(`${page} is missing ${selector}.`);
}

const navTargets = [...allHtml.matchAll(/href="\.\/([^"#]+\.html)"/g)].map((match) => match[1]);
for (const target of new Set(navTargets)) await fs.access(path.join(projectRoot, target));

console.log(`Checked ${requiredFiles.length} required files, ${references.length} HTML references, ${new Set(scriptAssetRefs).size} script asset references, ${pages.length} pages, ${quizCount} quiz challenges, ${signalCount} body-language entries, ${behaviorCount} behavior cards, ${trainingCount} training cards, ${challengeCount} challenge cards, and ${externalImageRefs.length} external image references.`);
