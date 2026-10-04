import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// Run pure helpers without a browser, installed packages, or a user's saved data.
const source = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const signalSource = await fs.readFile(new URL('../signals.js', import.meta.url), 'utf8');
const guidedReaderSource = await fs.readFile(new URL('../guided-reader.js', import.meta.url), 'utf8');
const trainingSource = await fs.readFile(new URL('../training.js', import.meta.url), 'utf8');
const trainingDataSource = await fs.readFile(new URL('../training-data.js', import.meta.url), 'utf8');
const challengeDataSource = await fs.readFile(new URL('../challenge-data.js', import.meta.url), 'utf8');
const challengesSource = await fs.readFile(new URL('../challenges.js', import.meta.url), 'utf8');
const data = new Map();
const context = vm.createContext({
  console,
  URL,
  document: { addEventListener() {} },
  localStorage: { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
});
vm.runInContext(source, context);
const signalDataEnd = signalSource.indexOf('\nconst categories =');
assert.notEqual(signalDataEnd, -1, 'Signal definitions should end before UI bindings');
vm.runInContext(`${signalSource.slice(0, signalDataEnd)}\nglobalThis.signalAuditData = signalContent;`, context);
const run = (code) => vm.runInContext(code, context);
assert.equal(run('quizQuestions.length'), 20);
assert.equal(run('new Set(quizQuestions.map(q => q.id)).size'), 20);
let randomState = 0x5eed1234;
const seededRandom = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 0x100000000;
};
const answerPositions = [0, 0, 0];
for (let round = 0; round < 300; round += 1) {
  for (const question of run('quizQuestions')) {
    const ordered = run('orderedQuizOptions')(question, seededRandom);
    assert.equal(new Set(ordered.map((option) => option.index)).size, question.options.length, 'Shuffling must preserve each answer exactly once');
    answerPositions[ordered.findIndex((option) => option.index === question.answer)] += 1;
  }
}
assert.ok(answerPositions.every((count) => count > 1800 && count < 2200), `Correct answer positions should be balanced across repeat attempts: ${answerPositions.join(', ')}`);
assert.match(source, /orderedQuizOptions\(lesson\)/, 'Daily Wag should also avoid a fixed correct-answer position');
assert.equal(run('dailyLessons.length'), 6);
const scenarioSearchable = Array.from(run('scenarioLibrary.map(scenario => `${scenario.title} ${scenario.tag} ${scenario.look} ${scenario.do} ${scenario.avoid}`.toLowerCase())'));
for (const term of ['child', 'unsafe', 'food', 'walk', 'alone', 'doorbell']) assert.ok(scenarioSearchable.some((scenario) => scenario.includes(term)), `Challenge scenario deep-link search should find “${term}”.`);
assert.match(source, /requestedSearch\.slice\(0, 80\)/, 'Scenario deep links should bound and safely initialize their search text');
const scenarioUrl = run(`scenarioSearchUrl('https://wagsignals.example/scenarios.html?keep=1#list', ' eating rocks ')`);
assert.equal(scenarioUrl.searchParams.get('search'), ' eating rocks ', 'Typed scenario searches should be serializable into a back/refresh-safe URL');
assert.equal(scenarioUrl.searchParams.get('keep'), '1', 'Updating the scenario query should preserve unrelated parameters');
assert.equal(scenarioUrl.hash, '#list', 'Updating the scenario query should preserve the current fragment');
assert.equal(run(`scenarioSearchUrl('https://wagsignals.example/scenarios.html?search=old', '   ').searchParams.has('search')`), false, 'Clearing scenario search should clear the URL query');
assert.equal(run(`scenarioSearchUrl('https://wagsignals.example/scenarios.html', 'x'.repeat(100)).searchParams.get('search').length`), 80, 'Scenario search deep links should remain bounded');
assert.match(source, /history\.replaceState\(history\.state, '', scenarioSearchUrl\(window\.location\.href, search\.value\)\)/, 'Scenario search state should survive browser Back and refresh');
for (const [query, expectedTitle] of [
  ['my dog bites me', null],
  ["won't give toy back", 'Food bowl time'],
  ['pulling leash', 'A trigger appears on a walk'],
  ['scared of visitors', 'A visitor arrives'],
  ['eating rocks', 'Something unsafe is on the ground'],
  ['runs out door', 'The doorbell rings'],
  ['barks at dogs', 'Two dogs meet']
]) {
  const matches = run(`findScenarioMatches(${JSON.stringify(query)})`);
  if (expectedTitle) assert.ok(Array.from(matches).some((scenario) => scenario.title === expectedTitle), `Scenario search should understand “${query}”.`);
  else assert.equal(matches.length, 0, 'Biting should not be misrepresented as an unrelated scenario.');
}
assert.equal(run(`findScenarioGuideFallback('my dog bites me')[1]`), './challenges.html?guide=biting-nipping#guide', 'A biting query with no matching scenario should route to the existing safety guide.');
assert.equal(run(`findScenarioGuideFallback('the dog nipped someone')[1]`), './challenges.html?guide=biting-nipping#guide', 'A nipping query should use the same safety-first route.');
assert.equal(run(`findScenarioGuideFallback('my dog is relaxed')`), null, 'Biting fallback should not appear for unrelated searches.');
for (const scenario of run('scenarioLibrary')) {
  const target = scenario.next[1].split(/[?#]/)[0].replace(/^\.\//, '');
  await fs.access(new URL(`../${target}`, import.meta.url));
}
assert.equal(run("isDateKey('2024-02-29')"), true, 'Leap days should remain valid dates');
assert.equal(run("isDateKey('2025-02-29')"), false, 'Non-leap February 29 must be rejected');
assert.equal(run("isDateKey('2025-02-30')"), false, 'Impossible calendar days must be rejected');
assert.equal(run("isDateKey('2025-04-31')"), false, 'Impossible month lengths must be rejected');
assert.equal(run("JSON.stringify(normalizeProgress({dailyDates: ['2025-02-30', '2024-02-29']}).dailyDates)"), '["2024-02-29"]', 'Malformed saved dates must not distort streaks');
assert.equal(run("chooseEnglishVoice([{name: 'Japanese Voice', lang: 'ja-JP', localService: true}])"), null, 'Do not assign a non-English voice to English guidance');
assert.equal(run("chooseEnglishVoice([{name: 'Spanish Voice', lang: 'es-ES', localService: true}, {name: 'English Online Voice', lang: 'en-US', localService: false}, {name: 'English Local Voice', lang: 'en-GB', localService: true}]).name"), 'English Local Voice', 'Prefer a locally available English voice');
assert.equal(run('Object.keys(signalAuditData).length'), 40);
assert.equal(run(`signalSearchMatches('loose-tail', signalAuditData['loose-tail'], 'tail wag')`), true, 'Tail-wag clue should be findable using ordinary owner language.');
assert.equal(run(`signalSearchMatches('loose-tail', signalAuditData['loose-tail'], "I don't know if my dog's tail wag means they're happy")`), true, 'Tail-wag search should tolerate a natural-language question and retain the whole-dog caveat.');
assert.equal(run(`signalSearchMatches('loose-tail', signalAuditData['loose-tail'], 'Why does my dog wag its tail?')`), true, 'Question-word phrasing should still surface the tail guide.');
assert.equal(run('new Set(Object.values(signalAuditData).map(signal => signal.title)).size'), 40, 'Every signal needs its own useful title');
assert.equal(run("Object.values(signalAuditData).every(signal => ['Face','Ears','Mouth','Tail','Body','Movement','Warnings'].includes(signal.category) && ['title','summary','image','alt','see','check','meaning','avoid','response','help'].every(key => typeof signal[key] === 'string' && signal[key].trim()))"), true, 'Every signal needs complete readable guidance and image text');
assert.equal(run("Object.values(signalAuditData).every(signal => signal.image.startsWith('./assets/') && signal.alt.length > 15)"), true, 'Every signal image needs local provenance and useful accessible text');
assert.equal(run("Object.values(signalAuditData).every(signal => !signal.related || signalAuditData[signal.related[1].split('signal=')[1]] || !signal.related[1].includes('signal='))"), true, 'Signal cross-links should resolve');
assert.equal(run('currentStreak([])'), 0);
assert.equal(run("currentStreak(['2020-01-01', '2020-01-02'])"), 0, 'An old streak must not be current');
assert.equal(run('currentStreak([todayKey(), todayKey()])'), 1);
assert.equal(run("getLongestStreak(['2020-01-01','2020-01-02','2020-01-04'])"), 2);
assert.equal(run('normalizeProgress({ quizBest: 999, pawprints: -5 }).quizBest'), 20);
assert.equal(run('normalizeProgress({ quizBest: 999, pawprints: -5 }).pawprints'), 0);
assert.equal(run('normalizeProgress(null).favorites.length'), 0);
assert.equal(run("normalizeProgress({favorites: ['soft-eyes','soft-eyes',null]}).favorites.length"), 1);
assert.equal(run("(() => { const p = normalizeProgress({}); addPawprint(p, p.learnedClues, 'soft-eyes'); addPawprint(p, p.learnedClues, 'soft-eyes'); return p.pawprints; })()"), 1);
run('saveProgress(normalizeProgress({quizBest: 13, favorites: ["soft-eyes"]}))');
assert.equal(run('readProgress().quizBest'), 13);
assert.equal(run('readProgress().favorites[0]'), 'soft-eyes');
data.set('wagsignals.progress.v1', '{broken');
assert.equal(run('readProgress().pawprints'), 0);
assert.equal(run("voiceTextFromSelectors({ querySelectorAll: () => [{textContent: 'Look', closest: () => null}, {textContent: 'Soft eyes', closest: () => null}, {textContent: 'Try', closest: () => null}, {textContent: 'Give space', closest: () => null}] }, ['strong', 'span'])"), 'Look. Soft eyes. Try. Give space');
assert.equal(run("voiceTextFromSelectors({ querySelectorAll: () => [{textContent: 'Visible guidance', closest: () => null}, {textContent: 'Collapsed steps', closest: () => ({})}] }, ['p'])"), 'Visible guidance', 'Voice controls should not read hidden disclosures');
assert.equal(run("voiceTextFromSelectors({ querySelectorAll: () => [{textContent: 'Expanded step', closest: () => null}] }, ['li'])"), 'Expanded step', 'Voice controls should include disclosures only when open');
assert.equal(run("voiceTextFromSelectors({ querySelectorAll: () => [{textContent: 'x'.repeat(1200), closest: () => null}] }, ['p']).length"), 1200, 'Do not silently truncate safety advice');
assert.ok(run("splitVoiceText('A short sentence. ' + 'word '.repeat(200)).every(chunk => chunk.length <= 220)"));
assert.match(source, /if \(module\) module\.open = true;/, 'Jumping to a collapsed lesson should open its section');
assert.match(source, /if \(firstModule\) firstModule\.before\(toolbar\);/, 'Topic jump should remain available outside collapsible training sections');

const trainingContext = vm.createContext({ window: {}, document: { querySelector: () => null } });
vm.runInContext(trainingDataSource, trainingContext);
vm.runInContext(guidedReaderSource, trainingContext);
vm.runInContext(trainingSource, trainingContext);
const trainingLessons = trainingContext.window.WagSignalsTrainingLessons;
const expectedTrainingIds = ['name-attention', 'sit', 'down', 'stay-wait', 'come', 'loose-leash', 'leave-it', 'drop-it', 'settle-mat', 'cooperative-handling', 'toilet-training', 'positive-socialization'];
assert.equal(JSON.stringify([...trainingLessons].map((lesson) => lesson.id).sort()), JSON.stringify([...expectedTrainingIds].sort()), 'All 12 training lessons should exist exactly once');
assert.equal(new Set(trainingLessons.map((lesson) => lesson.id)).size, 12, 'Training lesson routes must be unique');
assert.equal(trainingLessons.every((lesson) => lesson.stages.length >= 3 && lesson.setup.length >= 3 && lesson.success.length >= 2 && lesson.struggles.length >= 2 && lesson.mistakes.length >= 2 && lesson.safety && lesson.next && lesson.image.startsWith('./assets/') && Array.isArray(lesson.sources)), true, 'Every lesson needs original practical detail, a local illustration, troubleshooting, safety, sources, and a next step');
assert.equal(trainingLessons.every((lesson) => lesson.stages.every((stage) => ['do', 'watch', 'reward', 'repeat', 'ready'].every((key) => typeof stage[key] === 'string' && stage[key].trim()))), true, 'Every training stage needs an action, observation, reward, reset, and progress cue');
const leaveLesson = trainingLessons.find((lesson) => lesson.id === 'leave-it');
const dropLesson = trainingLessons.find((lesson) => lesson.id === 'drop-it');
assert.match(leaveLesson.overview.join(' '), /before your dog takes/i, 'Leave It should teach disengaging before access');
assert.match(dropLesson.overview.join(' '), /already hold/i, 'Drop It should teach releasing an object already held');
assert.notEqual(leaveLesson.stages[0].title, dropLesson.stages[0].title, 'Leave It and Drop It need distinct progressions');
assert.match(dropLesson.stages[0].title, /trade/i, 'Drop It should begin with a low-pressure exchange rather than taking the item');
assert.equal(dropLesson.sources.some((item) => item.href.includes('vcahospitals.com')), false, 'Drop It must not cite material that disallows AI adaptation');
assert.equal(dropLesson.sources.some((item) => item.href.includes('dogstrust.org.uk') && item.href.includes('resource-guarding')), true, 'Drop It should link to a suitable guarding-safety resource');
assert.equal(trainingLessons.every((lesson) => lesson.sources.every((item) => item.href.startsWith('https://'))), true, 'Lesson references must use HTTPS');
const trainingHooks = trainingContext.window.WagSignalsSectionReaderTestHooks;
assert.ok(trainingHooks, 'Shared guide speech controller test hooks should be available');
const utterances = [];
const fakeSpeech = {
  cancelCount: 0, pauseCount: 0, resumeCount: 0,
  speak: (utterance) => utterances.push(utterance),
  cancel() { this.cancelCount += 1; },
  pause() { this.pauseCount += 1; },
  resume() { this.resumeCount += 1; }
};
class FakeUtterance { constructor(text) { this.text = text; } }
const readerStates = [];
const reader = trainingHooks.createSectionReader({
  sections: [{ label: 'Overview', text: 'A short start.' }, { label: 'Step 1 — Begin', text: 'Try this step.' }, { label: 'Safety', text: 'Finish safely.' }],
  synthesis: fakeSpeech,
  Utterance: FakeUtterance,
  getVoice: () => ({ name: 'Local English', lang: 'en-GB' }),
  onUpdate: (state) => readerStates.push(state)
});
assert.equal(utterances.length, 0, 'Opening a lesson must never start audio automatically');
reader.toggle();
assert.equal(reader.getState().state, 'speaking');
assert.equal(utterances.length, 1);
reader.toggle();
assert.equal(reader.getState().state, 'paused', 'Play control should pause active speech');
reader.toggle();
assert.equal(reader.getState().state, 'speaking', 'Play control should resume paused speech');
assert.equal(fakeSpeech.pauseCount, 1);
assert.equal(fakeSpeech.resumeCount, 1);
utterances.at(-1).onend();
assert.equal(reader.getState().sectionIndex, 1, 'Finishing a section should continue to the next section');
assert.equal(readerStates.at(-1).message.includes('Step 1 — Begin'), true, 'Reader status should name the active section');
const staleUtterance = utterances.at(-1);
reader.next();
assert.equal(reader.getState().sectionIndex, 2, 'Next section should select and play the following section');
staleUtterance.onend();
assert.equal(reader.getState().sectionIndex, 2, 'Cancelled speech callbacks must not move the new reader state');
reader.previous();
assert.equal(reader.getState().sectionIndex, 1, 'Previous section should move back without overlapping speech');
reader.stop();
assert.equal(reader.getState().state, 'stopped');
const utteranceCountAfterStop = utterances.length;
staleUtterance.onend();
assert.equal(utterances.length, utteranceCountAfterStop, 'Stopped/cancelled speech must not restart from a stale onend callback');
reader.restart();
assert.equal(reader.getState().sectionIndex, 0, 'Restart should begin at the overview');
for (let attempt = 0; attempt < 8 && reader.getState().state === 'speaking'; attempt += 1) utterances.at(-1).onend();
assert.equal(reader.getState().state, 'finished', 'The reader should finish cleanly after the final section');
reader.toggle();
assert.equal(reader.getState().sectionIndex, 0, 'Replay after completion should begin at the first section');
let voiceListenerRemoved = 0;
reader.removeVoiceListener = () => { voiceListenerRemoved += 1; };
const cancelCountBeforeDestroy = fakeSpeech.cancelCount;
const activeBeforeDestroy = utterances.at(-1);
reader.destroy();
assert.equal(voiceListenerRemoved, 1, 'Destroying the shared reader should remove its voice listener');
assert.ok(fakeSpeech.cancelCount > cancelCountBeforeDestroy, 'Destroying the shared reader should cancel active speech');
const utteranceCountAfterDestroy = utterances.length;
activeBeforeDestroy.onend();
assert.equal(utterances.length, utteranceCountAfterDestroy, 'Leaving a guide must prevent stale speech from continuing');
const unavailableReader = trainingHooks.createSectionReader({ sections: [{ label: 'Overview', text: 'Text.' }], synthesis: null, Utterance: undefined });
unavailableReader.toggle();
assert.equal(unavailableReader.getState().supported, false, 'Speech limitations should not imply speech support');
assert.equal(unavailableReader.getState().state, 'idle', 'Unsupported speech should leave the written lesson available without fake playback');
assert.ok(trainingHooks.splitGuidedSpeech('word '.repeat(100)).every((chunk) => chunk.length <= 220), 'Long text should be split into safe utterance lengths');
function verifyPageHideLifecycle(controllerSource, label) {
  const listener = controllerSource.match(/window\.addEventListener\('pagehide', (\(event\) => \{\s*if \(event\.persisted\) reader\?\.stop\(\);\s*else destroyReader\(\);\s*\})\);/);
  assert.ok(listener, `${label} must distinguish a cached page from one being discarded`);
  let stops = 0;
  let destroys = 0;
  const handlePageHide = vm.runInNewContext(listener[1], {
    reader: { stop() { stops += 1; } },
    destroyReader() { destroys += 1; }
  });
  handlePageHide({ persisted: true });
  assert.equal(stops, 1, `${label} speech should stop while the page enters the back/forward cache`);
  assert.equal(destroys, 0, `${label} reader state should survive a cached history return`);
  handlePageHide({ persisted: false });
  assert.equal(destroys, 1, `${label} should still destroy the reader when the page is discarded`);
}
verifyPageHideLifecycle(trainingSource, 'Training');
assert.match(source, /page === 'quiz' \|\| page === 'training' \|\| page === 'challenges'/, 'The old per-card reader must not duplicate the shared Training or Challenge reader');
assert.match(trainingSource, /WagSignalsSectionReader\.create\(/, 'Training must use the shared reader controller');
assert.doesNotMatch(trainingSource, /function createTrainingReader|function splitTrainingSpeech/, 'Training must not keep a private duplicate speech controller');

const challengeContext = vm.createContext({ window: {} });
vm.runInContext(challengeDataSource, challengeContext);
const challengeGuides = challengeContext.window.WagSignalsChallengeGuides;
for (const href of run('scenarioLibrary.map(scenario => scenario.next[1])')) {
  const route = new URL(href, 'http://localhost/');
  const page = route.pathname.split('/').pop();
  if (page === 'signals.html') assert.ok(run(`signalAuditData[${JSON.stringify(route.searchParams.get('signal'))}]`), `Scenario clue link should resolve: ${href}`);
  if (page === 'training.html') assert.ok(trainingLessons.some((lesson) => lesson.id === route.searchParams.get('lesson')), `Scenario lesson link should resolve: ${href}`);
  if (page === 'challenges.html') assert.ok(challengeGuides.some((guide) => guide.id === route.searchParams.get('guide')), `Scenario challenge link should resolve: ${href}`);
}
const expectedChallengeIds = ['biting-nipping', 'stones-dirt', 'destructive-chewing', 'resource-guarding', 'barking-lunging', 'chasing-traffic', 'separation-distress', 'door-dashing'];
assert.deepEqual(Array.from(challengeGuides, (guide) => guide.id), expectedChallengeIds, 'All existing challenge guides should appear exactly once in index order');
assert.equal(new Set(challengeGuides.map((guide) => guide.id)).size, challengeGuides.length, 'Challenge guide routes must be unique');
assert.equal(challengeGuides.every((guide) => guide.image.startsWith('./assets/') && guide.alt.length > 15 && guide.rightNow.length > 60 && ['why', 'manage', 'practice', 'watch', 'avoid', 'progress', 'help', 'next', 'sources'].every((key) => Array.isArray(guide[key]) && (key === 'practice' || guide[key].length))), true, 'Every challenge should have an illustrated, immediate, structured guide');
assert.equal(challengeGuides.every((guide) => guide.watch.every((clue) => clue.id && clue.label && clue.note) && guide.next.every((item) => item.label && item.href && item.detail)), true, 'Body-language and next-step connections need readable labels and context');
const ingestionGuide = challengeGuides.find((guide) => guide.id === 'stones-dirt');
assert.match(ingestionGuide.rightNow, /contact your veterinarian/i, 'Suspected ingestion should route users to a veterinarian promptly');
assert.match(ingestionGuide.rightNow, /do not induce vomiting/i, 'Ingestion advice must not suggest inducing vomiting');
assert.match(ingestionGuide.avoid.join(' '), /do not chase|pry the mouth open/i, 'Scavenging guidance must avoid risky retrieval');
const guardingGuide = challengeGuides.find((guide) => guide.id === 'resource-guarding');
assert.match(guardingGuide.rightNow, /Do not take the bowl|do not take the bowl/i, 'Guarding guidance must prioritize distance over taking items');
assert.match(guardingGuide.practice.join(' '), /do not start .* exercises on your own/i, 'Guarding must not get an unsupervised behavior-modification recipe');
assert.match(guardingGuide.next.find((item) => item.label.startsWith('Drop It')).detail, /not guarding treatment/i, 'Drop It cross-link must state its guarding limitation');
const separationGuide = challengeGuides.find((guide) => guide.id === 'separation-distress');
assert.match(separationGuide.rightNow, /do not put the dog in a crate.*if that makes them panic more/i, 'Separation advice must not prescribe confinement that worsens panic');
assert.match(separationGuide.avoid.join(' '), /cry it out/i, 'Separation advice must reject waiting out panic');
assert.match(challengesSource, /history\.pushState[\s\S]*showGuide\(id, \{ focus: true \}\)/, 'Opening a challenge should create a browser-history entry and focus the guide');
assert.match(challengesSource, /window\.addEventListener\('popstate'/, 'Challenge routes must respond to browser Back and Forward');
assert.match(challengesSource, /reader\?\.destroy\(\)/, 'Changing guides and leaving a page must cancel speech');
assert.match(challengesSource, /WagSignalsSectionReader\.create\(/, 'Challenge speech must use the shared reader controller');
assert.match(challengesSource, /data-reader-section/, 'Challenge content must be divided into navigable speech sections');
verifyPageHideLifecycle(challengesSource, 'Challenges');
assert.match(challengesSource, /querySelector\('#guide'\)/, 'Direct challenge routes should render into the real #guide fragment target');
assert.match(challengeDataSource, /\.\/sources-safety\.html#source-list/, 'Challenge guides should connect to the existing Sources & safety material');
const stylesheet = await fs.readFile(new URL('../styles.css', import.meta.url), 'utf8');
const cssColor = (property) => stylesheet.match(new RegExp(`${property}:\\s*(#[a-fA-F0-9]{6})`))?.[1];
const luminance = (color) => color.slice(1).match(/../g).map((hex) => parseInt(hex, 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (foreground, background) => { const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a); return (values[0] + 0.05) / (values[1] + 0.05); };
const paper = cssColor('--paper'); const softInk = cssColor('--ink-soft'); const coral = cssColor('--coral-dark'); const sun = cssColor('--sun');
assert.ok(contrast(softInk, paper) >= 4.5, 'Secondary text should meet WCAG AA on the page background');
assert.ok(contrast('#ffffff', coral) >= 4.5, 'Primary button text should meet WCAG AA');
assert.ok(contrast(cssColor('--ink'), paper) >= 3, 'Keyboard focus should be visible against light panels');
assert.ok(contrast(sun, cssColor('--ink')) >= 3, 'Keyboard focus should be visible against dark panels');
assert.match(stylesheet, /:focus-visible\s*\{\s*outline:\s*3px solid var\(--ink\)/, 'Default keyboard focus should use the dark high-contrast color');
assert.match(stylesheet, /\.signal-dialog\s+:focus-visible[^}]*outline-color:\s*var\(--sun\)/, 'Dark panels need the contrasting light focus color');
console.log(`Contrast: secondary text ${contrast(softInk, paper).toFixed(2)}:1; white on primary ${contrast('#ffffff', coral).toFixed(2)}:1; focus outline ${contrast(cssColor('--ink'), paper).toFixed(2)}:1 on light, ${contrast(sun, cssColor('--ink')).toFixed(2)}:1 on dark panels.`);
console.log('Passed progress, body-language completeness, randomized quiz answer balance, persistence, contrast, and audio helper assertions.');
