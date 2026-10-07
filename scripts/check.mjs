import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'daily.html', 'quiz.html', 'signals.html', 'behaviors.html', 'training.html', 'challenges.html', 'body-map.html', 'saved.html', 'scenarios.html', 'cheat-sheet.html', 'sources-safety.html'];
const requiredFiles = [
  ...pages, 'styles.css', 'signals.js', 'app.js', 'training-data.js', 'guided-reader.js', 'training.js', 'challenge-data.js', 'challenges.js', 'pwa-register.js', 'service-worker.js', 'manifest.webmanifest', 'favicon.svg', 'robots.txt', 'sitemap.xml',
  'assets/wagsignals-192.png', 'assets/wagsignals-512.png', 'assets/wagsignals-maskable-512.png',
  'assets/dog-language-hero.webp', 'assets/guide-relaxed.webp', 'assets/guide-playful.webp',
  'assets/guide-interested.webp', 'assets/guide-uncertain.webp', 'assets/guide-stressed.webp',
  'assets/guide-fearful.webp', 'assets/guide-tucked-tail.webp', 'assets/guide-needs-space.webp', 'assets/guide-warning.webp',
  'assets/behavior-sniffing.webp', 'assets/behavior-barking.webp', 'assets/behavior-chewing.webp',
  'assets/behavior-digging.webp', 'assets/behavior-zoomies.webp', 'assets/behavior-jumping.webp',
  'assets/behavior-pawing.webp', 'assets/behavior-resting.webp', 'assets/training-rewards.webp',
  'assets/training-potty.webp', 'assets/training-socialization.webp',
  'assets/training-attention.webp', 'assets/training-sit-wait.webp', 'assets/training-recall.webp',
  'assets/training-leash.webp', 'assets/training-leave-it.webp', 'assets/training-settle.webp',
  'assets/training-handling.webp', 'assets/challenge-biting.webp', 'assets/challenge-stones-dirt.webp',
  'assets/challenge-destruction.webp', 'assets/challenge-guarding.webp', 'assets/challenge-lunging.webp',
  'assets/challenge-chasing.webp', 'assets/challenge-separation.webp', 'assets/challenge-door-dashing.webp',
  'app.js'
];

for (const relativePath of requiredFiles) await fs.access(path.join(projectRoot, relativePath));

const htmlByPage = new Map();
const cacheVersions = { styles: new Set(), app: new Set(), signals: new Set(), trainingData: new Set(), guidedReader: new Set(), training: new Set(), challengeData: new Set(), challenges: new Set(), pwaRegister: new Set() };
for (const page of pages) htmlByPage.set(page, await fs.readFile(path.join(projectRoot, page), 'utf8'));
const allHtml = [...htmlByPage.values()].join('\n');
if (/\bPawchew\b/i.test(allHtml)) throw new Error('Public page markup must preserve WagSignals branding, not the local project name.');
for (const [page, html] of htmlByPage) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`${page} has duplicate element IDs.`);
  if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error(`${page} must have one main heading.`);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(match[1])) throw new Error(`${page} has a broken in-page link: ${match[1]}`);
  }
  for (const match of html.matchAll(/<a\b(?=[^>]*\btarget="_blank")(?=[^>]*\bhref="https?:\/\/)[^>]*>/g)) {
    if (!/\brel="[^"]*noreferrer[^"]*"/.test(match[0])) throw new Error(`${page} has a new-tab external link without noreferrer.`);
  }
  const stylesVersion = html.match(/styles\.css\?v=([\w-]+)/)?.[1];
  const appVersion = html.match(/app\.js\?v=([\w-]+)/)?.[1];
  const pwaRegisterVersion = html.match(/pwa-register\.js\?v=([\w-]+)/)?.[1];
  if (!stylesVersion || !appVersion || !pwaRegisterVersion) throw new Error(`${page} is missing cache-busted shared assets or PWA registration.`);
  if (!html.includes('rel="manifest"') || !html.includes('apple-mobile-web-app-capable')) throw new Error(`${page} is missing install metadata.`);
  cacheVersions.styles.add(stylesVersion);
  cacheVersions.app.add(appVersion);
  cacheVersions.pwaRegister.add(pwaRegisterVersion);
  if (page === 'signals.html') {
    const signalsVersion = html.match(/signals\.js\?v=([\w-]+)/)?.[1];
    if (!signalsVersion) throw new Error(`${page} is missing cache-busted signal interactions.`);
    cacheVersions.signals.add(signalsVersion);
  }
  if (page === 'training.html') {
    const trainingDataVersion = html.match(/training-data\.js\?v=([\w-]+)/)?.[1];
    const guidedReaderVersion = html.match(/guided-reader\.js\?v=([\w-]+)/)?.[1];
    const trainingVersion = html.match(/training\.js\?v=([\w-]+)/)?.[1];
    if (!trainingDataVersion || !guidedReaderVersion || !trainingVersion) throw new Error('Training page needs cache-busted lesson data, the shared reader, and interactions.');
    cacheVersions.trainingData.add(trainingDataVersion);
    cacheVersions.guidedReader.add(guidedReaderVersion);
    cacheVersions.training.add(trainingVersion);
  }
  if (page === 'challenges.html') {
    const challengeDataVersion = html.match(/challenge-data\.js\?v=([\w-]+)/)?.[1];
    const guidedReaderVersion = html.match(/guided-reader\.js\?v=([\w-]+)/)?.[1];
    const challengesVersion = html.match(/challenges\.js\?v=([\w-]+)/)?.[1];
    if (!challengeDataVersion || !guidedReaderVersion || !challengesVersion) throw new Error('Challenges need cache-busted guide data, the shared reader, and interactions.');
    cacheVersions.challengeData.add(challengeDataVersion);
    cacheVersions.guidedReader.add(guidedReaderVersion);
    cacheVersions.challenges.add(challengesVersion);
  }
  const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  for (const [, attributes, contents] of buttons) {
    if (!/\btype="button"/.test(attributes)) throw new Error(`${page} has a button without an explicit safe type.`);
    const text = contents.replace(/<[^>]*>/g, '').replace(/&(?:amp|nbsp|lt|gt);/g, ' ').trim();
    if (!text && !/\baria-label=/.test(attributes)) throw new Error(`${page} has a button without an accessible name.`);
  }
}
for (const [asset, versions] of Object.entries(cacheVersions)) {
  if (versions.size !== 1) throw new Error(`${asset} cache-busting must use one consistent source version across pages.`);
}
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'manifest.webmanifest'), 'utf8'));
if (manifest.name !== 'WagSignals' || manifest.short_name !== 'WagSignals' || manifest.start_url !== './' || manifest.scope !== './' || manifest.display !== 'standalone') {
  throw new Error('The install manifest must preserve WagSignals identity and use a relative standalone scope.');
}
for (const icon of manifest.icons) {
  const iconPath = path.resolve(projectRoot, icon.src.replace(/^\.\//, ''));
  const iconBytes = await fs.readFile(iconPath);
  const expectedSize = Number(icon.sizes.split('x')[0]);
  if (iconBytes.readUInt32BE(0) !== 0x89504e47 || iconBytes.readUInt32BE(16) !== expectedSize || iconBytes.readUInt32BE(20) !== expectedSize) {
    throw new Error(`PWA icon ${icon.src} is not a valid ${expectedSize}×${expectedSize} PNG.`);
  }
  if (icon.purpose === 'maskable' && icon.src !== './assets/wagsignals-maskable-512.png') throw new Error('Maskable installation needs the dedicated safe-padded original icon.');
}
if (!manifest.icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any') || !manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any') || !manifest.icons.some((icon) => icon.purpose === 'maskable')) {
  throw new Error('The manifest needs 192px, 512px, and maskable original icon variants.');
}
const serviceWorkerSource = await fs.readFile(path.join(projectRoot, 'service-worker.js'), 'utf8');
if (/skipWaiting\s*\(/.test(serviceWorkerSource) || !serviceWorkerSource.includes("name.startsWith('wagsignals-shell-')") || !serviceWorkerSource.includes('wagsignals-images-v1')) {
  throw new Error('Service-worker updates must wait safely and clean up only WagSignals-owned shell caches.');
}
const libraryHtml = htmlByPage.get('signals.html');
for (const id of ['signal-dialog', 'signal-close', 'signal-prev', 'signal-next', 'signal-page', 'signal-clear']) {
  if (!libraryHtml.includes(`id="${id}"`)) throw new Error(`Missing library control: ${id}`);
}
if (!libraryHtml.includes('aria-labelledby="read-title"')) throw new Error('Clue dialog needs an accessible title.');
const appSource = await fs.readFile(path.join(projectRoot, 'app.js'), 'utf8');
const signalsSource = await fs.readFile(path.join(projectRoot, 'signals.js'), 'utf8');
const trainingDataSource = await fs.readFile(path.join(projectRoot, 'training-data.js'), 'utf8');
const guidedReaderSource = await fs.readFile(path.join(projectRoot, 'guided-reader.js'), 'utf8');
const trainingSource = await fs.readFile(path.join(projectRoot, 'training.js'), 'utf8');
const challengeDataSource = await fs.readFile(path.join(projectRoot, 'challenge-data.js'), 'utf8');
const challengesSource = await fs.readFile(path.join(projectRoot, 'challenges.js'), 'utf8');
const buildSource = await fs.readFile(path.join(projectRoot, 'scripts/build.mjs'), 'utf8');
const allSource = `${allHtml}\n${appSource}\n${signalsSource}\n${trainingDataSource}\n${guidedReaderSource}\n${trainingSource}\n${challengeDataSource}\n${challengesSource}`;
const references = [...allHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference && !reference.startsWith('#') && !/^(https?:|data:|mailto:|javascript:)/i.test(reference));
for (const reference of references) await fs.access(path.resolve(projectRoot, reference.replace(/^\.\//, '')));

const externalImageRefs = [...allHtml.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]).filter((src) => /^(https?:)?\/\//i.test(src));
if (externalImageRefs.length) throw new Error(`External image references are not allowed: ${externalImageRefs.join(', ')}`);
const externalScriptImageRefs = [...allSource.matchAll(/(?:image|src):\s*['"]([^'"]+)['"]/g)].map((match) => match[1]).filter((src) => /^(https?:)?\/\//i.test(src));
if (externalScriptImageRefs.length) throw new Error(`External scripted image references are not allowed: ${externalScriptImageRefs.join(', ')}`);

const scriptAssetRefs = [...allSource.matchAll(/(?:image|src):\s*['"]([^'"]+)['"]/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((reference) => reference.startsWith('./'));
for (const reference of new Set(scriptAssetRefs)) await fs.access(path.resolve(projectRoot, reference.replace(/^\.\//, '')));

const signalKeys = new Set([...signalsSource.matchAll(/^\s{2}(?:'([^']+)'|([a-z0-9-]+)):\s*\{/gm)].map((match) => match[1] ?? match[2]));
const signalLinks = [...allSource.matchAll(/signals\.html\?signal=([a-z0-9-]+)/g)].map((match) => match[1]);
const brokenSignalLinks = [...new Set(signalLinks.filter((key) => !signalKeys.has(key)))];
if (brokenSignalLinks.length) throw new Error(`Broken signal links: ${brokenSignalLinks.join(', ')}`);

const requiredCopy = [
  'eyes', 'ears', 'mouth', 'body', 'tail', 'movement', 'context', 'Situation / context',
  'Relaxed / happy', 'Ready to play', 'Interested / alert', 'Not so sure', 'Stressed / anxious',
  'Fearful', 'Needs space', 'Strong warning', 'Sniffing & exploring', 'Barking & vocalizing',
  'Chewing & shredding', 'Digging', 'Zoomies', 'Jumping up', 'Pawing & nudging',
  'Resting & hiding', 'Play signals &amp; pauses', 'Keep it kind and easy.', 'Name &amp; attention', 'Sit', 'Down', 'Stay &amp; wait', 'Come when called',
  'Loose-leash walking', 'Leave it', 'Drop it', 'Settle on a mat', 'Cooperative handling', 'Toilet-training routine', 'Positive socialization',
  'Biting & nipping', 'Eating stones & dirt', 'Destructive chewing', 'Guarding food or toys',
  'Barking & lunging', 'Chasing animals or cars', 'Separation distress', 'Door dashing',
  'Today’s Wag.', 'Can you read the whole pattern?', 'Daily Wag', 'Quiz', 'Your saved clues', 'Real-life scenarios', 'A one-page dog-reading cheat sheet', 'Search dog scenarios', 'Print cheat sheet', 'Sources &amp; safety', 'Useful guidance, careful boundaries.'
];
const missingCopy = requiredCopy.filter((text) => !allSource.includes(text));
if (missingCopy.length) throw new Error(`Missing required guide content: ${missingCopy.join(', ')}`);
if (/chatgpt\.site|dodongking88pop/i.test(allSource)) throw new Error('Source files must not hard-code a private preview domain.');
for (const previewTag of ['og:image', 'twitter:image', 'og:image:alt', 'summary_large_image']) {
  if (!buildSource.includes(previewTag)) throw new Error(`Public sharing metadata is missing ${previewTag}.`);
}

const signalCount = (signalsSource.match(/category:\s*['"]/g) ?? []).length;
const behaviorCount = (htmlByPage.get('behaviors.html').match(/class="behavior-card"/g) ?? []).length;
const trainingCount = (htmlByPage.get('training.html').match(/class="training-card"/g) ?? []).length;
const challengeHtml = htmlByPage.get('challenges.html');
const challengeCount = (challengeHtml.match(/class="challenge-card"/g) ?? []).length;
if (!challengeHtml.includes('id="guide"')) throw new Error('The deep-linked challenge guide needs a real #guide target.');
for (const [page, cardClass, expected] of [['behaviors.html', 'behavior-card', 9], ['training.html', 'training-card', 12]]) {
  const html = htmlByPage.get(page);
  const cards = html.match(new RegExp(`<article class="${cardClass}">[\\s\\S]*?<\\/article>`, 'g')) ?? [];
  if (cards.length !== expected) throw new Error(`${page} should have ${expected} illustrated lessons; found ${cards.length}.`);
  if (cards.some((card) => !/<img\b[^>]*\balt="[^"]+"[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/.test(card) || !card.includes('class="learning-details"'))) {
    throw new Error(`${page} cards need accessible, dimensioned images and practical expandable guidance.`);
  }
}
const challengeCardHtml = challengeHtml.match(/<article class="challenge-card">[\s\S]*?<\/article>/g) ?? [];
if (challengeCardHtml.length !== 8 || challengeCardHtml.some((card) => !/<img\b[^>]*\balt="[^"]+"[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/.test(card) || !/data-open-guide="[a-z0-9-]+"/.test(card) || !/class="button secondary challenge-open"/.test(card))) {
  throw new Error('The challenge index needs exactly eight concise, illustrated cards with direct Open guide actions.');
}
const challengeCardIds = challengeCardHtml.map((card) => card.match(/data-open-guide="([a-z0-9-]+)"/)?.[1]);
if (challengeCardHtml.some((card) => !/href="\.\/challenges\.html\?guide=[a-z0-9-]+#guide"/.test(card))) throw new Error('Every challenge card needs a direct route to its guide target.');
const challengeContext = { window: {} };
vm.runInNewContext(challengeDataSource, challengeContext);
const challengeGuides = challengeContext.window.WagSignalsChallengeGuides;
const requiredChallengeIds = ['biting-nipping', 'stones-dirt', 'destructive-chewing', 'resource-guarding', 'barking-lunging', 'chasing-traffic', 'separation-distress', 'door-dashing'];
const challengeIds = challengeGuides.map((guide) => guide.id);
if (JSON.stringify(challengeIds) !== JSON.stringify(requiredChallengeIds) || JSON.stringify(challengeCardIds) !== JSON.stringify(requiredChallengeIds)) throw new Error('Challenge index cards and guide data should define the existing eight guides once, in a stable order.');
if (new Set(challengeIds).size !== challengeIds.length) throw new Error('Challenge guide IDs must be unique.');
const challengeTrainingIds = [...trainingDataSource.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);
for (const guide of challengeGuides) {
  if (!guide.title || !guide.summary || !guide.rightNow || !guide.image.startsWith('./assets/') || guide.alt.length < 15) throw new Error(`${guide.id} needs an image, useful alt text, a summary, and visible immediate guidance.`);
  for (const field of ['why', 'manage', 'practice', 'watch', 'avoid', 'progress', 'help', 'next', 'sources']) {
    if (!Array.isArray(guide[field]) || (field !== 'practice' && !guide[field].length)) throw new Error(`${guide.id} is missing a useful ${field} section.`);
  }
  await fs.access(path.resolve(projectRoot, guide.image.replace(/^\.\//, '')));
  for (const clue of guide.watch) if (!signalKeys.has(clue.id)) throw new Error(`${guide.id} links to an unknown body-language clue: ${clue.id}`);
  for (const source of guide.sources) {
    if (!/^https:\/\//.test(source.href)) throw new Error(`${guide.id} has a source link that is not HTTPS.`);
    if (!htmlByPage.get('sources-safety.html').includes(source.href)) throw new Error(`${guide.id} references a source missing from Sources & safety: ${source.href}`);
  }
  for (const item of guide.next) {
    const targetUrl = new URL(item.href, 'https://wagsignals.invalid/challenges.html');
    if (targetUrl.origin !== 'https://wagsignals.invalid') continue;
    const target = path.resolve(projectRoot, decodeURIComponent(targetUrl.pathname.replace(/^\//, '')));
    await fs.access(target);
    const route = path.basename(targetUrl.pathname);
    if (route === 'training.html') {
      const lessonId = targetUrl.searchParams.get('lesson');
      if (!challengeTrainingIds.includes(lessonId)) throw new Error(`${guide.id} links to an unknown training lesson: ${lessonId}`);
    }
    if (route === 'signals.html') {
      const clueId = targetUrl.searchParams.get('signal');
      if (!signalKeys.has(clueId)) throw new Error(`${guide.id} links to an unknown body-language clue: ${clueId}`);
    }
    if (route === 'challenges.html') {
      const guideId = targetUrl.searchParams.get('guide');
      if (!requiredChallengeIds.includes(guideId)) throw new Error(`${guide.id} links to an unknown challenge guide: ${guideId}`);
    }
    if (route === 'sources-safety.html' && targetUrl.hash && targetUrl.hash !== '#source-list') throw new Error(`${guide.id} links to an unknown Sources & safety anchor.`);
    if (route === 'behaviors.html' && targetUrl.hash) {
      const titles = [...htmlByPage.get('behaviors.html').matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
      const generatedIds = titles.map((title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''));
      if (!generatedIds.includes(targetUrl.hash.slice(1))) throw new Error(`${guide.id} links to an unknown behavior guide anchor: ${targetUrl.hash}`);
    }
  }
}
const stonesGuide = challengeGuides.find((guide) => guide.id === 'stones-dirt');
for (const safetyTerm of ['contact your veterinarian', 'do not induce vomiting', 'trouble breathing', 'repeated retching']) {
  if (!stonesGuide.rightNow.toLowerCase().includes(safetyTerm)) throw new Error(`Eating stones guidance is missing urgent advice: ${safetyTerm}`);
}
const biteGuide = challengeGuides.find((guide) => guide.id === 'biting-nipping');
for (const safetyTerm of ['soap and running water', 'medical advice', 'uncontrolled bleeding']) {
  if (!biteGuide.rightNow.toLowerCase().includes(safetyTerm)) throw new Error(`Biting guidance is missing wound-safety advice: ${safetyTerm}`);
}
if (/punish.{0,35}growl|punish.{0,35}warning/i.test(challengeGuides.find((guide) => guide.id === 'resource-guarding').rightNow)) throw new Error('Resource guarding immediate guidance must not recommend punishing a warning.');
if (!htmlByPage.get('sources-safety.html').includes('AVMA: Pet first aid')) throw new Error('Sources & safety needs an authoritative pet first-aid resource.');
if (!htmlByPage.get('sources-safety.html').includes('AVSAB: Current public position statements')) throw new Error('Sources & safety needs the current AVSAB training recommendation.');
if (!htmlByPage.get('sources-safety.html').includes('AAHA: Canine behavior guidance')) throw new Error('Sources & safety needs an authoritative behavior and socialization resource.');
const requiredTrainingLessons = ['name-attention', 'sit', 'down', 'stay-wait', 'come', 'loose-leash', 'leave-it', 'drop-it', 'settle-mat', 'cooperative-handling', 'toilet-training', 'positive-socialization'];
const trainingIds = [...trainingDataSource.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);
if (new Set(trainingIds).size !== trainingIds.length) throw new Error('Training lesson IDs must be unique.');
if (trainingIds.length !== requiredTrainingLessons.length || requiredTrainingLessons.some((id) => !trainingIds.includes(id))) {
  throw new Error(`Training data must contain the 12 lesson IDs exactly once; found ${trainingIds.join(', ')}.`);
}
for (const id of requiredTrainingLessons) {
  if (!htmlByPage.get('training.html').includes(`data-open-lesson="${id}"`)) throw new Error(`Training index is missing the Start lesson action for ${id}.`);
}
if (!trainingSource.includes('data-reader-section') || !trainingSource.includes('speechSynthesis') || !trainingSource.includes('pagehide')) {
  throw new Error('Training lessons need section-aware browser speech and navigation cleanup.');
}
for (const term of ['Before you start', 'What success looks like', 'If your dog struggles', 'Common mistakes', 'Safety', 'Your next step']) {
  if (!trainingSource.includes(term)) throw new Error(`Training lesson template is missing ${term}.`);
}
const quizInitialBlock = appSource.match(/const quizQuestions = \[(.*?)\];\s*\n\nObject\.assign/s)?.[1] ?? '';
const quizAddedBlock = appSource.match(/quizQuestions\.push\((.*?)\n\);/s)?.[1] ?? '';
const quizCount = (quizInitialBlock.match(/\{\s*image:/g) ?? []).length + (quizAddedBlock.match(/\{\s*id:/g) ?? []).length;
if (quizCount !== 20) throw new Error(`Expected exactly 20 visual quiz challenges, found ${quizCount}.`);
if (signalCount !== 40) throw new Error(`Expected exactly 40 body-language library entries, found ${signalCount}.`);
for (const [label, count] of [['behavior', behaviorCount], ['training', trainingCount], ['challenge', challengeCount]]) {
  if (count < 8) throw new Error(`Expected at least 8 ${label} cards, found ${count}.`);
}

const quizAltLeakTerms = /\b(?:wag|tail|ears?|eye|white|paw|pant|freeze|hackles?|growl|bark|lung|guard|approach|tuck|mouth|lip)\b/i;
const quizAlts = [...`${quizInitialBlock}\n${quizAddedBlock}`.matchAll(/alt:\s*'([^']+)'/g)].map((match) => match[1]);
const leakedQuizAlts = quizAlts.filter((alt) => quizAltLeakTerms.test(alt));
if (leakedQuizAlts.length) throw new Error(`Quiz alt text reveals answer clues: ${leakedQuizAlts.join(' | ')}`);

for (const [page, selector] of [['saved.html', 'saved-list'], ['scenarios.html', 'scenario-list'], ['cheat-sheet.html', 'print-sheet'], ['sources-safety.html', 'source-list']]) {
  if (!htmlByPage.get(page).includes(`id="${selector}"`)) throw new Error(`${page} is missing ${selector}.`);
}

const navTargets = [...allHtml.matchAll(/href="\.\/([^"#]+\.html)"/g)].map((match) => match[1]);
for (const target of new Set(navTargets)) await fs.access(path.join(projectRoot, target));

console.log(`Checked ${requiredFiles.length} required files, ${references.length} HTML references, ${new Set(scriptAssetRefs).size} script asset references, ${pages.length} pages, ${quizCount} quiz challenges, ${signalCount} body-language entries, ${behaviorCount} behavior cards, ${trainingCount} training cards, ${challengeCount} challenge cards, and ${externalImageRefs.length} external image references.`);
