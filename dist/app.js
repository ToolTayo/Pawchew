const storageKey = 'wagsignals.progress.v1';

const dailyLessons = [
  { id: 'soft-eyes', kicker: 'Body language', title: 'Soft eyes are an invitation to slow down.', body: 'Blinking, relaxed eyes and a loose body often mean your dog can stay present and make choices.', notice: 'Look for the whole pattern—not just the eyes.', try: 'Let your dog approach, sniff, or move away without pressure.', image: './assets/guide-relaxed.webp', alt: 'A golden retriever sitting with a relaxed body and soft eyes', question: 'Which clue helps confirm a relaxed read?', options: ['Loose movement and easy breathing', 'A fast stiff wag only', 'A fixed stare'], answer: 0, explanation: 'Relaxation is a cluster: soft eyes, flexible movement, and the ability to disengage.' },
  { id: 'play-bow', kicker: 'Body language', title: 'A play bow is an invitation, not a command.', body: 'A low front end and raised hips can invite play when the face and movement stay loose.', notice: 'Good play includes pauses and the freedom to opt out.', try: 'Offer a short game, then give everyone a break.', image: './assets/guide-playful.webp', alt: 'A small dog holding a clear play bow with its front legs down and hips raised', question: 'What makes play safer?', options: ['Chasing without pauses', 'Give-and-take with easy breaks', 'Holding a dog in place'], answer: 1, explanation: 'Healthy play has turn-taking, pauses, and room for each dog to leave.' },
  { id: 'sniff-break', kicker: 'Everyday behavior', title: 'A sniff break can be useful enrichment.', body: 'Sniffing gives dogs information and can help them settle. A walk does not need to be fast to be valuable.', notice: 'Sudden frantic sniffing can also release pressure.', try: 'Let your dog investigate safe smells before moving on.', image: './assets/behavior-sniffing.webp', alt: 'A dog sniffing grass in a sunny park', question: 'What is a helpful response to calm sniffing?', options: ['Allow safe time to explore', 'Pull away every time', 'Assume the dog is disobedient'], answer: 0, explanation: 'Sniffing is normal information gathering and often a calming outlet.' },
  { id: 'space-signal', kicker: 'Safety', title: 'A freeze is a reason to add space.', body: 'Stillness, a tight mouth, hard focus, or a body leaning away can be a quiet stop sign.', notice: 'Freezing is not proof that a dog is calm.', try: 'Stop reaching, turn sideways, and create a clear exit.', image: './assets/guide-needs-space.webp', alt: 'A dog standing still and asking for space', question: 'What should happen first?', options: ['More touching', 'More distance', 'A louder command'], answer: 1, explanation: 'Distance lowers pressure and gives the dog a chance to recover.' },
  { id: 'trade-safe', kicker: 'Challenges', title: 'A calm trade beats a chase.', body: 'If a dog has something unsafe, offer something better and make giving it up feel safe.', notice: 'Do not pry objects from a worried dog’s mouth.', try: 'Keep high-value treats ready and return to the game when the trade is done.', image: './assets/challenge-stones-dirt.webp', alt: 'A handler offering a treat trade while a dog investigates a stone outdoors', question: 'What is the safest first move?', options: ['Chase and grab', 'Offer a better trade and add distance', 'Scold after the dog drops it'], answer: 1, explanation: 'A trade protects trust and reduces the chance of guarding or a frantic chase.' },
  { id: 'mat-settle', kicker: 'Training', title: 'Settling is a skill worth practicing.', body: 'A predictable mat can give your dog a safe place to rest while normal life happens around them.', notice: 'The goal is choice and soft muscles, not forced stillness.', try: 'Reward a lowered head, relaxed breathing, and choosing to stay.', image: './assets/training-settle.webp', alt: 'A dog resting on a mat beside a seated handler', question: 'What should you reward?', options: ['Only a perfect long stay', 'Small signs of softening and rest', 'A dog that cannot move'], answer: 1, explanation: 'Reinforcing tiny moments of calm builds a useful, voluntary settle.' }
];

const quizQuestions = [
  { image: './assets/guide-stressed.webp', alt: 'Dog sitting outdoors in a park', question: 'A dog is lip licking and looking tense in a busy park. What is the kindest first step?', options: ['Add distance and lower stimulation', 'Force a greeting', 'Ignore every signal'], answer: 0, explanation: 'A tense face and repeated lip licking call for less pressure and more predictability. Also consider heat, food, and health.', },
  { image: './assets/guide-playful.webp', alt: 'Dog in an outdoor pose on grass', question: 'Which pattern most supports a play invitation?', options: ['Loose movement with pauses', 'A frozen hard stare', 'A tight mouth and retreat'], answer: 0, explanation: 'Play is bouncy and flexible, with room for both dogs to opt in or out.' },
  { image: './assets/challenge-guarding.webp', alt: 'Dog indoors near a bowl while a person stands back', question: 'A dog freezes over a food bowl. What should you do?', options: ['Reach into the bowl', 'Give space and manage the setup', 'Punish the growl'], answer: 1, explanation: 'Freezing is information. Distance and professional guidance are safer than confrontation.' },
  { image: './assets/training-leash.webp', alt: 'Dog walking beside a person outdoors', question: 'What should earn a reward during loose-leash practice?', options: ['A slack leash and check-in', 'A tighter pull', 'Ignoring the handler'], answer: 0, explanation: 'Reward the behavior you want repeated: slack, connection, and easy movement.' },
  { image: './assets/challenge-separation.webp', alt: 'Dog resting indoors on a mat near a food puzzle', question: 'What helps separation distress?', options: ['Practice absences shorter than panic', 'Leave for a long time immediately', 'Punish vocalizing afterward'], answer: 0, explanation: 'Gradual practice below the dog’s panic threshold is safer and more teachable.' },
  { image: './assets/guide-warning.webp', alt: 'Dog standing outdoors with a tense posture', question: 'A dog growls when someone reaches toward them. What does the growl provide?', options: ['Useful safety information', 'Proof the dog is bad', 'A reason to reach faster'], answer: 0, explanation: 'A warning is communication. Stop, create distance, and seek qualified support if it repeats.' }
];

Object.assign(quizQuestions[0], { id: 'stress-cluster', level: 'Beginner', category: 'Stressed / anxious', clues: 'Lip licking and a tense face appear while the dog is sitting in a busy park.', action: 'Lower stimulation, add distance, and check whether the dog can settle.', related: ['Read stress patterns', './signals.html?signal=stressed-pattern'] });
Object.assign(quizQuestions[1], { id: 'play-pauses', level: 'Beginner', category: 'Playful', clues: 'The body stays loose, bouncy, and able to pause.', action: 'Offer a short game with breaks and an easy way to opt out.', related: ['Read the play bow', './signals.html?signal=play-bow'] });
Object.assign(quizQuestions[2], { id: 'guarding-freeze', level: 'Intermediate', category: 'Needs space', clues: 'The dog freezes over the bowl and the person is approaching.', action: 'Stop reaching, create distance, and manage the meal behind a barrier.', related: ['Read guarding freeze', './signals.html?signal=guarding-freeze'] });
Object.assign(quizQuestions[3], { id: 'loose-leash', level: 'Beginner', category: 'Movement', clues: 'The leash has a soft curve and the dog can check in.', action: 'Reward slack and connection before the leash becomes tight.', related: ['Practice loose-leash walking', './training.html'] });
Object.assign(quizQuestions[4], { id: 'separation-panic', level: 'Intermediate', category: 'Stressed / anxious', clues: 'The dog becomes distressed as absences get longer.', action: 'Practice absences shorter than panic and build time gradually.', related: ['Read separation distress', './challenges.html'] });
Object.assign(quizQuestions[5], { id: 'growl-information', level: 'Intermediate', category: 'Warning', clues: 'The growl appears when someone reaches toward the dog.', action: 'Stop, make space, and arrange qualified behavior and veterinary support if it repeats.', related: ['Read growling', './signals.html?signal=growling'] });

quizQuestions.push(
  { id: 'tight-wag', level: 'Intermediate', category: 'Alert / interested', image: './assets/guide-interested.webp', alt: 'Dog standing outdoors and looking toward a butterfly', question: 'A dog holds its tail high, keeps its mouth closed, and leans toward a butterfly. What is the safest read?', options: ['Activated and needing more context', 'Definitely happy and ready to greet', 'Calm because the tail is raised'], answer: 0, explanation: 'A high tail and forward weight show activation, not a guaranteed friendly feeling. A still image cannot tell you how fast a tail is moving, so check stiffness, distance, and recovery.', clues: 'The tail is held high, the mouth is closed, and the weight is forward.', action: 'Pause the approach and give the dog room to observe or disengage.', related: ['Read high-tail activation', './signals.html?signal=fast-tight-wag'] },
  { id: 'whale-eye', level: 'Intermediate', category: 'Uncertain', image: './assets/guide-stressed.webp', alt: 'Dog sitting outdoors and looking to the side', question: 'A dog turns its head away while the eye stays wide with white showing. What should you check next?', options: ['Whether the dog can move away and soften', 'Whether to hold the head still', 'Whether visible white always means aggression'], answer: 0, explanation: 'Visible eye white can be a worry clue in context. Check the exit route, mouth, ears, and the pressure around the dog.', clues: 'The head turns away, the eye is wide, and the face looks tense.', action: 'Stop reaching and create space without cornering the dog.', related: ['Learn visible eye whites', './signals.html?signal=whale-eye'] },
  { id: 'ears-back', level: 'Beginner', category: 'Fearful', image: './assets/guide-fearful.webp', alt: 'Dog crouching near an indoor doorway', question: 'A dog has ears back, a low body, and a tucked tail during a greeting. What is the kindest first move?', options: ['Increase distance and stop the greeting', 'Lean over for a hug', 'Call the dog closer repeatedly'], answer: 0, explanation: 'That cluster may be consistent with fear. More control and less pressure are safer than forced contact.', clues: 'Ears are back, the body is low, and the tail is tucked.', action: 'Turn sideways, add distance, and protect the dog’s escape route.', related: ['Read ears pulled back', './signals.html?signal=ears-back'] },
  { id: 'head-turn', level: 'Beginner', category: 'Uncertain', image: './assets/guide-uncertain.webp', alt: 'Dog outdoors in a paused stance', question: 'During petting, a dog turns their head away and lifts one paw. What might that combination be saying?', options: ['The interaction may be too intense', 'The dog is asking you to hold tighter', 'The dog has agreed to keep going'], answer: 0, explanation: 'Head turns and paw lifts can be quiet conflict or uncertainty signals. Respecting early signals prevents escalation.', clues: 'The head points away and one paw pauses in the air.', action: 'Pause touch and let the dog choose whether to return.', related: ['Read the paw lift', './signals.html?signal=paw-lift'] },
  { id: 'stress-panting', level: 'Intermediate', category: 'Stressed / anxious', image: './assets/guide-stressed.webp', alt: 'Dog sitting outdoors in a park', question: 'A dog is lip licking and panting in a busy park without obvious exercise. What should you avoid assuming?', options: ['That panting must mean happiness', 'That the setting may be stressful', 'That recovery and other clues matter'], answer: 0, explanation: 'Panting can reflect heat, exercise, stress, pain, medication, or illness. The setting and recovery matter.', clues: 'There is no obvious exercise in the scene, and panting appears with a tongue flick and tension.', action: 'Lower pressure, offer shade and water, and get veterinary help for a sudden or intense change.', related: ['Read panting in context', './signals.html?signal=panting-context'] },
  { id: 'freeze-not-calm', level: 'Intermediate', category: 'Needs space', image: './assets/guide-needs-space.webp', alt: 'Dog standing outdoors in a still posture', question: 'A dog becomes completely still when a hand reaches over their head. What should you do first?', options: ['Stop and create an exit', 'Pet faster so they get used to it', 'Assume they are calm because they are quiet'], answer: 0, explanation: 'A freeze can be a stop signal, not consent. Stop adding pressure before the dog needs a bigger warning.', clues: 'Movement stops, the mouth tightens, and the hand is still above the dog.', action: 'Withdraw the hand, turn sideways, and let the dog move away.', related: ['Read freezing', './signals.html?signal=freeze'] },
  { id: 'raised-hackles', level: 'Advanced', category: 'Alert / interested', image: './assets/guide-warning.webp', alt: 'Dog standing outdoors with a tense posture', question: 'Raised fur appears along a dog’s back. Which interpretation is most accurate?', options: ['The dog is aroused; the reason needs context', 'The dog is definitely aggressive', 'The dog is definitely relaxed'], answer: 0, explanation: 'Raised hackles show activation, not one emotion. Check the trigger, mouth, eyes, movement, and recovery.', clues: 'Hair is lifted along the back, but the image alone cannot tell you why.', action: 'Increase space and watch whether the whole body softens or intensifies.', related: ['Read raised hackles', './signals.html?signal=raised-hackles'] },
  { id: 'growl-not-bad', level: 'Beginner', category: 'Warning', image: './assets/guide-warning.webp', alt: 'Dog standing outdoors with a tense posture', question: 'What is a growl most useful for telling you?', options: ['The situation is too much or too close', 'The dog deserves punishment', 'You should reach in quickly'], answer: 0, explanation: 'A growl is valuable safety information. Punishing it can remove the warning without changing the discomfort.', clues: 'The dog is rigid, focused, and vocalizing as someone approaches.', action: 'Stop, create distance, and seek help for repeated or high-risk warnings.', related: ['Read growling', './signals.html?signal=growling'] },
  { id: 'barking-context', level: 'Intermediate', category: 'Frustrated / overwhelmed', image: './assets/behavior-barking.webp', alt: 'Dog outdoors facing a distant van', question: 'A dog barks at a van, then cannot settle. What should you inspect before choosing a response?', options: ['Trigger, distance, rhythm, and recovery', 'Only the volume of the bark', 'Whether to punish every sound'], answer: 0, explanation: 'Barking has many functions. The body, trigger, distance, and recovery help show whether the dog is alert, frustrated, afraid, or asking for help.', clues: 'The dog is oriented toward movement and stays activated after it passes.', action: 'Add distance and reward a calm look back when the dog can still think.', related: ['Explore barking with body clues', './signals.html?signal=barking'] },
  { id: 'lunge-distance', level: 'Advanced', category: 'Frustrated / overwhelmed', image: './assets/challenge-lunging.webp', alt: 'Dog outdoors on leash with a person creating space', question: 'A dog lunges toward another dog on leash. What is the safest immediate goal?', options: ['Create distance before asking for learning', 'Hold the leash tighter and move closer', 'Wait until the dog is at full intensity'], answer: 0, explanation: 'Learning is difficult at full arousal. Distance and secure management come before training around the trigger.', clues: 'The leash is tight, front feet drive forward, and the dog is vocalizing.', action: 'Turn away early, create space, and work below the reaction threshold.', related: ['Read lunging', './signals.html?signal=lunging'] },
  { id: 'guarding-space', level: 'Advanced', category: 'Needs space', image: './assets/challenge-guarding.webp', alt: 'Dog indoors near a bowl while a person gives space', question: 'A dog freezes over a bowl and watches a person closely. What should the person avoid?', options: ['Reaching into the bowl', 'Giving space behind a barrier', 'Getting a professional trade plan'], answer: 0, explanation: 'A guarding freeze is an early warning. Space and management protect everyone while a qualified plan is built.', clues: 'The dog hovers over the bowl, stops moving, and tracks the approaching person.', action: 'Back away and manage meals without testing the warning.', related: ['Read guarding freeze', './signals.html?signal=guarding-freeze'] },
  { id: 'approach-retreat', level: 'Advanced', category: 'Uncertain', image: './assets/guide-uncertain.webp', alt: 'Dog outdoors pausing and looking to the side', question: 'A dog investigates a visitor, then pauses with a head turn and one paw lifted. What does that pattern suggest?', options: ['Interest mixed with uncertainty', 'Permanent consent to pet', 'A need to lure the dog closer'], answer: 0, explanation: 'An approach followed by a pause or look-away can show information gathering while the dog still needs safety and control.', clues: 'The dog pauses, turns its head, and holds one paw up while monitoring the visitor.', action: 'Stay still, add space, and let the dog choose the pace.', related: ['Read approach and pause', './signals.html?signal=approach-retreat'] },
  { id: 'voluntary-approach', level: 'Beginner', category: 'Relaxed / comfortable', image: './assets/guide-relaxed.webp', alt: 'Relaxed dog sitting outdoors with a loose body', question: 'A dog chooses to sit near you with a loose body, then turns away when you reach. What is the best response?', options: ['Pause and let the dog choose again', 'Hold the dog for more petting', 'Assume sitting nearby means yes forever'], answer: 0, explanation: 'Sharing space is useful information, but consent is ongoing. A turn-away can be a request for a break.', clues: 'The dog is relaxed nearby, then turns away when contact is offered.', action: 'Stop reaching and invite another choice rather than restraining the dog.', related: ['Read choosing to stay near', './signals.html?signal=moving-closer'] },
  { id: 'low-tail-baseline', level: 'Advanced', category: 'Relaxed / comfortable', image: './assets/guide-uncertain.webp', alt: 'Dog outdoors with a soft head turn', question: 'A dog has a low tail but a loose body, soft mouth, and easy movement. What is the best conclusion?', options: ['Compare it with the dog’s normal baseline and whole pattern', 'The dog must be afraid', 'Tail position alone tells you the feeling'], answer: 0, explanation: 'Tail carriage varies by anatomy and individual. A low tail matters most when it changes from baseline or clusters with other clues.', clues: 'The tail is low, but the mouth and body are not obviously tense.', action: 'Watch changes, movement, and recovery instead of labeling the tail alone.', related: ['Learn tail and breed differences', './signals.html?signal=low-tail'] }
);

const scenarioLibrary = [
  { title: 'A visitor arrives', tag: 'Greetings', image: './assets/guide-interested.webp', alt: 'A dog standing alert and curious', look: 'Check whether your dog can sniff, blink, eat, and move away.', do: 'Use distance, a gate, and reward calm check-ins before greetings.', avoid: 'Do not force a hello or hold the dog in place.', keywords: ['visitor fear', 'scared of visitors', 'guest arrives', 'stranger at home'], next: ['Read approach and pause', './signals.html?signal=approach-retreat'] },
  { title: 'A child reaches toward the dog', tag: 'Family safety', image: './assets/guide-uncertain.webp', alt: 'A dog turning its head away and asking for space', look: 'Head turns, lip licks, weight shifts, and closed mouths can be quiet requests.', do: 'Call the dog away and give them a protected resting place.', avoid: 'Do not allow hugging, climbing, cornering, or chasing.', keywords: ['child reaches', 'kid hugs dog', 'child hugs dog', 'child touches dog'], next: ['Read freezing', './signals.html?signal=freeze'] },
  { title: 'The doorbell rings', tag: 'Home routines', image: './assets/challenge-door-dashing.webp', alt: 'A dog waiting on a mat behind a safety barrier', look: 'Notice arousal before opening the door and secure the exit first.', do: 'Use a gate, mat, leash, and small rewards for pauses.', avoid: 'Do not chase a dog toward an open door.', keywords: ['runs out door', 'door dash', 'door dashing', 'bolts out door', 'doorbell'], next: ['Prevent door dashing', './challenges.html?guide=door-dashing#guide'] },
  { title: 'Two dogs meet', tag: 'Dog-to-dog', image: './assets/guide-playful.webp', alt: 'A dog holding a play bow', look: 'Look for loose curves, pauses, turn-taking, and the freedom to leave.', do: 'Start with space and parallel movement before closer interaction.', avoid: 'Do not force face-to-face greetings or ignore repeated escape attempts.', keywords: ['dogs meet', 'meeting another dog', 'barks at dogs', 'dog greeting'], next: ['Read the play bow', './signals.html?signal=play-bow'] },
  { title: 'A dog freezes during handling', tag: 'Grooming & care', image: './assets/guide-needs-space.webp', alt: 'A dog standing still and asking for space', look: 'Freezing can mean the dog is overwhelmed, not that they agree.', do: 'Stop, soften the setup, and practice tiny touch-reward-release steps.', avoid: 'Do not continue until the dog struggles or snaps.', keywords: ['freeze during petting', 'scared of grooming', 'dog hates nail trim'], next: ['Practice cooperative handling', './training.html?lesson=cooperative-handling#lesson'] },
  { title: 'A trigger appears on a walk', tag: 'Walks', image: './assets/challenge-lunging.webp', alt: 'A handler creating distance from a distant dog', look: 'Watch distance, leash tension, recovery, and whether your dog can eat.', do: 'Turn away early, add distance, and reward looking back.', avoid: 'Do not wait for a full lunge before moving.', keywords: ['pulling leash', 'leash pulling', 'pulls on walks', 'barks at dogs', 'lunging at dogs'], next: ['Read barking & lunging', './challenges.html?guide=barking-lunging#guide'] },
  { title: 'Food or toy guarding', tag: 'Food & toys', image: './assets/challenge-guarding.webp', alt: 'A dog beside a food bowl while a handler gives space', look: 'Freezing, hovering, hard focus, or growling around food or toys means the dog needs space.', do: 'Use distance or a barrier around valued items and get qualified guidance for guarding.', avoid: 'Never grab an item or punish a growl; both can increase risk.', keywords: ['wont give toy back', 'give toy back', 'guarding toy', 'takes toy and runs', 'food guarding', 'growls with toy', 'growling with a toy', 'growls over toy', 'growling over a toy'], next: ['Give space around food and toys', './challenges.html?guide=resource-guarding#guide'] },
  { title: 'The dog is alone', tag: 'Being home alone', image: './assets/challenge-separation.webp', alt: 'A dog settling with a food puzzle while a person prepares to leave', look: 'Pacing, howling, scratching, or panic point to distress.', do: 'Practice absences shorter than panic and build up gradually.', avoid: 'Do not leave a panicked dog alone for longer to “teach” them.', keywords: ['home alone', 'separation anxiety', 'alone and howling', 'hates being alone', 'dog hates being alone', 'cannot be alone'], next: ['Read separation distress', './challenges.html?guide=separation-distress#guide'] },
  { title: 'Something unsafe is on the ground', tag: 'Scavenging', image: './assets/challenge-stones-dirt.webp', alt: 'A handler offering a treat trade while a dog investigates a stone', look: 'Notice what the dog finds valuable and whether eating objects is repeated.', do: 'Use secure management and teach a calm, high-value trade.', avoid: 'Do not chase, pry, or punish after the item is dropped.', keywords: ['eating rocks', 'eating stones', 'eating dirt', 'eats things outside', 'eats things off ground', 'dog keeps eating stones', 'dog eats stones', 'dog ate something', 'swallowed something', 'ate something dangerous'], next: ['Read eating stones & dirt', './challenges.html?guide=stones-dirt#guide'] }
];

const scenarioStopWords = new Set(['a', 'an', 'and', 'are', 'at', 'back', 'be', 'can', 'do', 'does', 'for', 'from', 'get', 'how', 'i', 'if', 'in', 'is', 'it', 'keep', 'keeps', 'me', 'my', 'of', 'on', 'or', 'the', 'their', 'them', 'they', 'to', 'was', 'we', 'what', 'when', 'with', 'would', 'you', 'your']);
function searchTerms(value) {
  return String(value ?? '').toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g)?.filter((word) => word.length > 1 && !scenarioStopWords.has(word)) || [];
}
function scenarioSearchUrl(currentHref, query) {
  const url = new URL(currentHref);
  const value = String(query ?? '').slice(0, 80);
  url.searchParams.delete('search');
  const fragmentParts = url.hash.slice(1).split('&').filter(Boolean);
  const preservedFragmentParts = fragmentParts.filter((part) => {
    const key = part.split('=', 1)[0];
    return new URLSearchParams(`${key}=`).keys().next().value !== 'search';
  });
  if (value.trim()) preservedFragmentParts.push(`search=${encodeURIComponent(value)}`);
  url.hash = preservedFragmentParts.length ? `#${preservedFragmentParts.join('&')}` : '';
  return url;
}
function findScenarioMatches(query) {
  const terms = searchTerms(query);
  if (!terms.length) return query.trim() ? [] : scenarioLibrary;
  return scenarioLibrary.filter((scenario) => {
    const searchable = searchTerms(`${scenario.title} ${scenario.tag} ${scenario.look} ${scenario.do} ${scenario.avoid} ${(scenario.keywords || []).join(' ')}`);
    return terms.every((term) => searchable.some((word) => word.includes(term) || term.includes(word)));
  });
}
function findScenarioGuideFallback(query) {
  return /\b(?:bite|bites|biting|bitten|nip|nips|nipped|nipping|snap|snaps|snapped|snapping)\b/i.test(query)
    ? ['Read the biting & nipping guide', './challenges.html?guide=biting-nipping#guide']
    : null;
}

const feedbackTopics = {
  'body-language': 'the body-language guide',
  behaviors: 'the behaviors guide',
  training: 'the training guide',
  challenges: 'the challenges guide',
  'body-map': 'the body map',
  scenarios: 'the scenario guide'
};

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function uniqueStrings(value) {
  return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string' && item.trim()))] : [];
}

function normalizeSavedSignals(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const saved = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!/^[a-z0-9-]{1,64}$/.test(id) || !title || seen.has(id)) continue;
    seen.add(id);
    const image = typeof item.image === 'string' && /^\.\/assets\/[a-z0-9-]+\.webp$/.test(item.image)
      ? item.image
      : './assets/guide-relaxed.webp';
    saved.push({
      id,
      title: title.slice(0, 140),
      summary: typeof item.summary === 'string' ? item.summary.slice(0, 360) : '',
      image,
      alt: typeof item.alt === 'string' ? item.alt.slice(0, 240) : ''
    });
    if (saved.length === 40) break;
  }
  return saved;
}

function normalizeProgress(value) {
  const source = value && typeof value === 'object' ? value : {};
  const dailyDates = uniqueStrings(source.dailyDates).filter(isDateKey).sort();
  const completedChallenges = uniqueStrings(source.completedChallenges);
  const learnedClues = uniqueStrings(source.learnedClues);
  if (!Array.isArray(source.learnedClues)) learnedClues.push(...dailyDates.map((date) => `legacy-daily-${date}`));
  const legacyPawprints = dailyDates.length + completedChallenges.length;
  const pawprints = Number.isFinite(Number(source.pawprints)) ? Math.max(0, Math.floor(Number(source.pawprints))) : legacyPawprints;
  const quizBest = Number.isFinite(Number(source.quizBest)) ? Math.min(quizQuestions.length, Math.max(0, Math.floor(Number(source.quizBest)))) : 0;
  const longestStreak = Number.isFinite(Number(source.longestStreak)) ? Math.max(0, Math.floor(Number(source.longestStreak))) : getLongestStreak(dailyDates);
  return {
    dailyDates,
    quizBest,
    favorites: uniqueStrings(source.favorites),
    savedSignals: normalizeSavedSignals(source.savedSignals),
    completedChallenges,
    learnedClues,
    pawprints,
    longestStreak,
    lastDailyCompletion: isDateKey(source.lastDailyCompletion) ? source.lastDailyCompletion : (dailyDates[dailyDates.length - 1] || '')
  };
}

function readProgress() {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(storageKey) || '{}')); }
  catch { return normalizeProgress({}); }
}

function saveProgress(progress) {
  try { localStorage.setItem(storageKey, JSON.stringify(normalizeProgress(progress))); }
  catch { /* Private browsing can deny storage; the current page still remains usable. */ }
}

function toggleSavedSignal(signal) {
  if (!signal || typeof signal !== 'object' || typeof signal.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(signal.id) || typeof signal.title !== 'string' || !signal.title.trim()) return false;
  const next = readProgress();
  const wasSaved = next.savedSignals.some((item) => item.id === signal.id);
  next.savedSignals = wasSaved
    ? next.savedSignals.filter((item) => item.id !== signal.id)
    : normalizeSavedSignals([...next.savedSignals, signal]);
  saveProgress(next);
  renderProgress();
  if (typeof Event === 'function' && typeof document.dispatchEvent === 'function') {
    document.dispatchEvent(new Event('wagsignals:progress-updated'));
  }
  return !wasSaved;
}

window.WagSignalsProgress = Object.freeze({
  getSavedSignals: () => readProgress().savedSignals,
  isSignalSaved: (id) => readProgress().savedSignals.some((signal) => signal.id === id),
  toggleSignal: toggleSavedSignal
});

function dayDifference(first, second) {
  return Math.round((new Date(`${second}T12:00:00`) - new Date(`${first}T12:00:00`)) / 86400000);
}

function currentStreak(dates) {
  const today = todayKey();
  const sorted = [...new Set(dates)].filter((date) => date <= today).sort().reverse();
  if (!sorted.length) return 0;
  if (dayDifference(sorted[0], today) > 1) return 0;
  let streak = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (dayDifference(sorted[index], sorted[index - 1]) !== 1) break;
    streak += 1;
  }
  return streak;
}

function getLongestStreak(dates) {
  const sorted = [...new Set(dates)].sort();
  if (!sorted.length) return 0;
  let longest = 1;
  let streak = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (dayDifference(sorted[index - 1], sorted[index]) === 1) streak += 1;
    else streak = 1;
    longest = Math.max(longest, streak);
  }
  return longest;
}

function addPawprint(progress, collection, id) {
  if (!collection.includes(id)) {
    collection.push(id);
    progress.pawprints += 1;
    return true;
  }
  return false;
}

function renderProgress() {
  const progress = readProgress();
  const streak = currentStreak(progress.dailyDates);
  const summary = `🐾 ${progress.pawprints} pawprint${progress.pawprints === 1 ? '' : 's'} · 🔥 ${streak} day${streak === 1 ? '' : 's'} · ${progress.learnedClues.length} clue${progress.learnedClues.length === 1 ? '' : 's'} · decode best ${progress.quizBest}/${quizQuestions.length}`;
  document.querySelectorAll('[data-progress-summary]').forEach((target) => { target.textContent = summary; });
}

function renderDaily() {
  const now = new Date();
  const index = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000) % dailyLessons.length;
  const lesson = dailyLessons[index];
  const relatedLessons = { 'soft-eyes': ['Read soft eyes in the library', './signals.html?signal=soft-eyes'], 'play-bow': ['Read the play bow', './signals.html?signal=play-bow'], 'sniff-break': ['Explore sniffing behavior', './behaviors.html'], 'space-signal': ['Read freezing and space', './signals.html?signal=freeze'], 'trade-safe': ['See safer challenge solutions', './challenges.html'], 'mat-settle': ['Practice settling', './training.html'] };
  const progress = readProgress();
  const image = document.querySelector('#daily-image');
  document.querySelector('#daily-kicker').textContent = lesson.kicker;
  document.querySelector('#daily-title').textContent = lesson.title;
  document.querySelector('#daily-body').textContent = lesson.body;
  document.querySelector('#daily-notice').textContent = lesson.notice;
  document.querySelector('#daily-try').textContent = lesson.try;
  const related = relatedLessons[lesson.id];
  document.querySelector('#daily-related').innerHTML = related ? `<a class="text-link" href="${related[1]}">${related[0]} →</a>` : '';
  image.src = lesson.image;
  image.alt = lesson.alt;
  document.querySelector('#daily-question-title').textContent = lesson.question;
  const options = document.querySelector('#daily-options');
  options.innerHTML = orderedQuizOptions(lesson).map((option) => `<button class="daily-option" type="button" data-option="${option.index}">${option.text}</button>`).join('');
  const feedback = document.querySelector('#daily-feedback');
  options.addEventListener('click', (event) => {
    const button = event.target.closest('[data-option]');
    if (!button) return;
    const correct = Number(button.dataset.option) === lesson.answer;
    options.querySelectorAll('button').forEach((option) => { option.disabled = true; option.classList.toggle('is-correct', Number(option.dataset.option) === lesson.answer); });
    if (!correct) button.classList.add('is-wrong');
    feedback.textContent = correct ? `Yes — ${lesson.explanation}` : `Not quite. ${lesson.explanation}`;
    document.querySelector('#daily-learn').disabled = readProgress().dailyDates.includes(todayKey());
  });
  const learned = progress.dailyDates.includes(todayKey());
  const learnButton = document.querySelector('#daily-learn');
  learnButton.disabled = learned;
  learnButton.textContent = learned ? 'Learned today ✓' : 'Mark as learned';
  learnButton.addEventListener('click', () => {
    const next = readProgress();
    const date = todayKey();
    let earned = false;
    if (!next.dailyDates.includes(date)) {
      next.dailyDates.push(date);
      next.lastDailyCompletion = date;
      next.longestStreak = Math.max(next.longestStreak, getLongestStreak(next.dailyDates));
      earned = addPawprint(next, next.learnedClues, lesson.id);
    }
    saveProgress(next); renderProgress(); learnButton.disabled = true; learnButton.textContent = 'Learned today ✓';
    document.querySelector('#daily-status').textContent = `Nice work. Your streak is now ${currentStreak(next.dailyDates)} day${currentStreak(next.dailyDates) === 1 ? '' : 's'}.${earned ? ' +1 pawprint for a new clue.' : ' A useful refresher—this clue already earned its pawprint.'}`;
  });
  const saveButton = document.querySelector('#daily-save');
  saveButton.textContent = progress.favorites.includes(lesson.id) ? 'Saved ✓' : 'Save clue';
  saveButton.setAttribute('aria-pressed', String(progress.favorites.includes(lesson.id)));
  saveButton.addEventListener('click', () => {
    const next = readProgress();
    const saved = next.favorites.includes(lesson.id);
    next.favorites = saved ? next.favorites.filter((item) => item !== lesson.id) : [...next.favorites, lesson.id];
    saveProgress(next); saveButton.textContent = saved ? 'Save clue' : 'Saved ✓';
    saveButton.setAttribute('aria-pressed', String(!saved));
  });
}

function orderedQuizOptions(question, random = Math.random) {
  // Shuffle answer presentation without changing answer IDs or saved challenge IDs.
  const options = question.options.map((text, index) => ({ text, index }));
  for (let index = options.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [options[index], options[other]] = [options[other], options[index]];
  }
  return options;
}

function renderQuiz() {
  const shell = document.querySelector('#quiz-shell');
  let questionIndex = 0;
  let score = 0;
  function showQuestion() {
    const question = quizQuestions[questionIndex];
      shell.innerHTML = `<div class="quiz-progress"><span>Challenge ${questionIndex + 1} of ${quizQuestions.length}</span><span>${question.level || 'Whole-dog read'} · ${question.category || 'Body language'}</span></div><div class="quiz-track"><span style="width:${((questionIndex + 1) / quizQuestions.length) * 100}%"></span></div><article class="quiz-card"><img src="${question.image}" alt="${question.alt}" width="768" height="768" /><div><span class="section-kicker">Look for the whole pattern</span><h2>${question.question}</h2><div class="quiz-options">${orderedQuizOptions(question).map((option) => `<button class="quiz-option" type="button" data-option="${option.index}">${option.text}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p></div></article>`;
    shell.querySelector('.quiz-options').addEventListener('click', (event) => {
      const button = event.target.closest('[data-option]');
      if (!button) return;
      const correct = Number(button.dataset.option) === question.answer;
      if (correct) score += 1;
      const progress = readProgress();
      addPawprint(progress, progress.completedChallenges, question.id || `quiz-${questionIndex}`);
      saveProgress(progress);
      renderProgress();
      shell.querySelectorAll('.quiz-option').forEach((option) => { option.disabled = true; option.classList.toggle('is-correct', Number(option.dataset.option) === question.answer); });
      if (!correct) button.classList.add('is-wrong');
      shell.querySelector('.quiz-feedback').textContent = `${correct ? 'Correct. ' : 'Not quite. '}${question.explanation}`;
      const breakdown = document.createElement('div');
      breakdown.className = 'quiz-breakdown';
      breakdown.innerHTML = `<p><strong>Visible clues</strong>${question.clues || question.explanation}</p><p><strong>Kind next step</strong>${question.action || 'Pause, lower pressure, and check the whole dog before acting.'}</p>${question.related ? `<a class="text-link" href="${question.related[1]}">${question.related[0]} →</a>` : ''}`;
      const next = document.createElement('button'); next.className = 'button'; next.type = 'button'; next.textContent = questionIndex === quizQuestions.length - 1 ? 'See my result' : 'Next question'; next.style.marginTop = '8px';
      next.addEventListener('click', () => { questionIndex += 1; if (questionIndex < quizQuestions.length) showQuestion(); else showResult(); const heading = shell.querySelector('h2'); heading.tabIndex = -1; heading.focus(); });
      shell.querySelector('.quiz-feedback').after(breakdown, next);
    }, { once: true });
  }
  function showResult() {
    const progress = readProgress(); progress.quizBest = Math.max(progress.quizBest, score); saveProgress(progress); renderProgress();
    const ratio = score / quizQuestions.length;
    shell.innerHTML = `<div class="quiz-result"><span class="section-kicker">Your read is getting sharper</span><h2>${score}/${quizQuestions.length}</h2><p>${ratio >= 0.8 ? 'Excellent whole-dog thinking.' : ratio >= 0.55 ? 'Good start. Keep checking context and recovery.' : 'Keep practicing—small clues add up.'}</p><p class="quiz-result-note">Every completed challenge is remembered once for learning; replaying stays available without farming pawprints.</p><div class="habit-actions" style="justify-content:center"><button class="button" type="button" id="quiz-retry">Try again</button><button class="button secondary" type="button" id="quiz-share">Share result</button></div><p id="quiz-share-status" aria-live="polite"></p></div>`;
    shell.querySelector('#quiz-retry').addEventListener('click', () => { questionIndex = 0; score = 0; showQuestion(); });
    shell.querySelector('#quiz-share').addEventListener('click', async () => {
      const shareText = `I scored ${score}/${quizQuestions.length} on the WagSignals dog-reading quiz.`;
      const status = shell.querySelector('#quiz-share-status');
      try {
        const mobileShare = navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (mobileShare) {
          await navigator.share({ title: 'My WagSignals quiz result', text: shareText, url: window.location.href });
          status.textContent = 'Share sheet opened.';
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
          status.textContent = 'Result copied to your clipboard.';
        } else {
          status.textContent = `${shareText} ${window.location.href}`;
        }
      } catch { status.textContent = 'Sharing was cancelled. You can try again or copy the result manually.'; }
    });
  }
  showQuestion();
}

function renderSaved() {
  const target = document.querySelector('#saved-list');
  if (!target) return;
  const makeCard = ({ image, alt, kicker, title, body, href, removeKind, removeId }) => {
    const card = document.createElement('article');
    card.className = 'saved-card';
    const illustration = document.createElement('img');
    illustration.src = image;
    illustration.alt = alt;
    illustration.width = 1024;
    illustration.height = 1024;
    illustration.loading = 'lazy';
    illustration.decoding = 'async';
    const content = document.createElement('div');
    content.className = 'saved-card-body';
    const label = document.createElement('span');
    label.className = 'challenge-tag';
    label.textContent = kicker;
    const heading = document.createElement('h2');
    heading.textContent = title;
    const description = document.createElement('p');
    description.textContent = body;
    content.append(label, heading, description);
    if (href) {
      const reopen = document.createElement('a');
      reopen.className = 'button';
      reopen.href = href;
      reopen.textContent = 'Reopen body-language clue';
      reopen.setAttribute('aria-label', `Reopen ${title} body-language clue`);
      content.append(reopen);
    }
    const remove = document.createElement('button');
    remove.className = 'button secondary';
    remove.type = 'button';
    remove.dataset.removeSaved = '';
    remove.dataset.removeKind = removeKind;
    remove.dataset.removeId = removeId;
    remove.setAttribute('aria-label', `Remove ${title} from saved clues`);
    remove.textContent = 'Remove saved clue';
    content.append(remove);
    card.append(illustration, content);
    return card;
  };
  const render = () => {
    document.dispatchEvent(new Event('wagsignals:stop-audio'));
    const current = readProgress();
    const lessons = dailyLessons.filter((lesson) => current.favorites.includes(lesson.id));
    const signals = current.savedSignals;
    document.querySelector('#saved-clear').disabled = !lessons.length && !signals.length;
    if (!lessons.length && !signals.length) {
      target.innerHTML = '<div class="empty-state"><h2>Your saved shelf is empty.</h2><p>Save a body-language clue or a Daily Wag reminder to revisit it here.</p><a class="button" href="./signals.html">Explore body language</a></div>';
      return;
    }
    const cards = [
      ...lessons.map((lesson) => makeCard({ image: lesson.image, alt: lesson.alt, kicker: lesson.kicker, title: lesson.title, body: lesson.body, removeKind: 'daily', removeId: lesson.id })),
      ...signals.map((signal) => makeCard({
        image: signal.image,
        alt: signal.alt || `Illustration for ${signal.title}`,
        kicker: 'Body language',
        title: signal.title,
        body: signal.summary,
        href: `./signals.html?signal=${encodeURIComponent(signal.id)}`,
        removeKind: 'signal',
        removeId: signal.id
      }))
    ];
    target.replaceChildren(...cards);
    document.dispatchEvent(new Event('wagsignals:content-updated'));
  };
  render();
  target.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-saved]');
    if (!button) return;
    const cardIndex = [...target.querySelectorAll('.saved-card')].indexOf(button.closest('.saved-card'));
    const next = readProgress();
    if (button.dataset.removeKind === 'signal') next.savedSignals = next.savedSignals.filter((item) => item.id !== button.dataset.removeId);
    else next.favorites = next.favorites.filter((id) => id !== button.dataset.removeId);
    saveProgress(next);
    render();
    const cards = target.querySelectorAll('.saved-card');
    (cards[Math.min(cardIndex, cards.length - 1)]?.querySelector('[data-remove-saved], a') || target.querySelector('.empty-state a'))?.focus();
  });
  document.querySelector('#saved-clear')?.addEventListener('click', () => {
    if (!window.confirm('Remove all saved clues from this device? Your pawprints and quiz progress will stay.')) return;
    const next = readProgress(); next.favorites = []; next.savedSignals = []; saveProgress(next); render();
    target.querySelector('a')?.focus();
  });
  document.querySelector('#reset-progress')?.addEventListener('click', () => {
    if (!window.confirm('Reset Daily Wag, quiz, pawprint, and saved-clue progress on this device?')) return;
    try { localStorage.removeItem(storageKey); } catch { /* The visible page remains usable if storage is unavailable. */ }
    window.location.reload();
  });
}

function renderScenarios() {
  const target = document.querySelector('#scenario-list');
  const search = document.querySelector('#scenario-search');
  const count = document.querySelector('#scenario-count');
  if (!target || !search || !count) return;
  const initialUrl = new URL(window.location.href);
  const requestedSearch = new URLSearchParams(initialUrl.hash.slice(1)).get('search')
    ?? initialUrl.searchParams.get('search');
  if (requestedSearch && !search.value) search.value = requestedSearch.slice(0, 80);
  if (initialUrl.searchParams.has('search')) {
    history.replaceState(history.state, '', scenarioSearchUrl(window.location.href, search.value));
  }
  const render = () => {
    document.dispatchEvent(new Event('wagsignals:stop-audio'));
    const query = search.value.trim().toLowerCase();
    const filtered = findScenarioMatches(query);
    count.textContent = `${filtered.length} scenario${filtered.length === 1 ? '' : 's'}`;
    const fallback = !filtered.length && findScenarioGuideFallback(query);
    target.innerHTML = filtered.length ? filtered.map((scenario) => `<article class="scenario-card"><img src="${scenario.image}" alt="${scenario.alt}" width="1024" height="1024" loading="lazy" decoding="async" /><div class="scenario-card-body"><span class="scenario-tag">${scenario.tag}</span><h2>${scenario.title}</h2><p class="scenario-row"><strong>Look for</strong><span>${scenario.look}</span></p><p class="scenario-row"><strong>Try</strong><span>${scenario.do}</span></p><p class="scenario-row"><strong>Avoid</strong><span>${scenario.avoid}</span></p>${query && scenario.next ? `<a class="scenario-next" href="${scenario.next[1]}">${scenario.next[0]} →</a>` : ''}</div></article>`).join('') : fallback ? `<div class="empty-state"><h2>For biting or nipping</h2><p>Start with the safety-first guide, especially if someone may be hurt.</p><a class="button secondary" href="${fallback[1]}">${fallback[0]} →</a></div>` : '<div class="empty-state"><h2>No matching scenario.</h2><p>Try a word like “door,” “walk,” “food,” or “handling.”</p></div>';
    document.dispatchEvent(new Event('wagsignals:content-updated'));
  };
  search.addEventListener('input', () => {
    if (search.value.length > 80) search.value = search.value.slice(0, 80);
    history.replaceState(history.state, '', scenarioSearchUrl(window.location.href, search.value));
    render();
  });
  render();
}

function renderFeedback() {
  const topic = document.body.dataset.feedback;
  const main = document.querySelector('main');
  if (!topic || !main || !feedbackTopics[topic] || document.querySelector('.feedback-card')) return;
  const card = document.createElement('section');
  card.className = 'shell feedback-card';
  card.setAttribute('aria-labelledby', 'feedback-title');
  card.innerHTML = `<div><h2 id="feedback-title">Was ${feedbackTopics[topic]} useful?</h2><p>A personal check-in, saved on this device only—not sent to the WagSignals team.</p></div><div class="feedback-actions"><button class="button secondary" type="button" data-feedback-choice="yes" aria-pressed="false">Yes, helpful</button><button class="button secondary" type="button" data-feedback-choice="no" aria-pressed="false">Not yet</button></div><p class="feedback-status" aria-live="polite"></p>`;
  main.append(card);
  const status = card.querySelector('.feedback-status');
  const showChoice = (value, stored = true) => {
    card.querySelectorAll('[data-feedback-choice]').forEach((choice) => choice.setAttribute('aria-pressed', String(choice.dataset.feedbackChoice === value)));
    status.textContent = value === 'yes' ? `${stored ? 'Saved on this device.' : 'Not saved: browser storage is unavailable.'} Glad it helped.` : `${stored ? 'Saved on this device.' : 'Not saved: browser storage is unavailable.'} Try a real-life scenario for a concrete example.`;
    if (value === 'no') {
      const link = document.createElement('a'); link.href = './scenarios.html'; link.textContent = ' Browse scenarios'; status.append(link);
    }
  };
  try { const value = JSON.parse(localStorage.getItem('wagsignals.feedback.v1') || '{}')?.[topic]; if (value === 'yes' || value === 'no') showChoice(value); } catch { /* A check-in is optional. */ }
  card.querySelectorAll('[data-feedback-choice]').forEach((button) => button.addEventListener('click', () => {
    let stored = false;
    try {
      const raw = JSON.parse(localStorage.getItem('wagsignals.feedback.v1') || '{}');
      const responses = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
      responses[topic] = button.dataset.feedbackChoice;
      localStorage.setItem('wagsignals.feedback.v1', JSON.stringify(responses));
      stored = true;
    } catch { /* Private browsing can deny storage; the visible response still works. */ }
    showChoice(button.dataset.feedbackChoice, stored);
  }));
}

function currentVoicePage() {
  const declaredPage = document.body.dataset.page;
  if (declaredPage) return declaredPage;
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return file.replace(/\.html$/, '') || 'home';
}

function voiceTextFromSelectors(root, selectors) {
  if (!root) return '';
  const seen = new Set();
  const parts = [];
  // One combined query preserves reading order: each label stays with its explanation.
  root.querySelectorAll(selectors.join(', ')).forEach((node) => {
    if (node.closest('details:not([open])')) return;
    const value = node.textContent.replace(/\s+/g, ' ').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    parts.push(value);
  });
  const text = parts.join('. ').replace(/\. ([.!?])/g, '$1');
  return text;
}

function splitVoiceText(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const chunks = [];
  let current = '';
  sentences.forEach((sentence) => {
    const clean = sentence.trim();
    if (!clean) return;
    if (current && `${current} ${clean}`.length > 220) {
      chunks.push(current);
      current = '';
    }
    if (clean.length > 220) {
      clean.split(/\s+/).forEach((word) => {
        if (current && `${current} ${word}`.length > 220) {
          chunks.push(current);
          current = '';
        }
        current = current ? `${current} ${word}` : word;
      });
    } else {
      current = current ? `${current} ${clean}` : clean;
    }
  });
  if (current) chunks.push(current);
  return chunks;
}

function chooseEnglishVoice(voices) {
  const english = voices.filter((item) => /^en(-|_)/i.test(item.lang));
  const localEnglish = english.filter((item) => item.localService);
  const pool = localEnglish.length ? localEnglish : english;
  const natural = pool.filter((item) => /natural|neural|enhanced|premium|microsoft|google/i.test(item.name));
  const warm = /aria|jenny|samantha|zira|sara|libby|hazel|karen|moira/i;
  return natural.find((item) => warm.test(item.name)) || natural[0] || pool[0] || null;
}

function createVoiceController(toolbar) {
  const playStop = toolbar.querySelector('[data-voice-stop]');
  const rate = toolbar.querySelector('[data-voice-rate]');
  const status = toolbar.querySelector('[data-voice-status]');
  const supported = typeof window.speechSynthesis === 'object' && typeof window.SpeechSynthesisUtterance === 'function';
  let voice = null;
  let activeButton = null;
  let activeLabel = '';
  let chunks = [];
  let chunkIndex = 0;
  let runId = 0;
  let speaking = false;
  let pausedByUser = false;

  const updateButton = (button, text, pressed = false) => {
    if (!button) return;
    button.querySelector('[data-voice-button-text]').textContent = text;
    const action = text.replace(/^[▶Ⅱ]\s*/, '');
    button.setAttribute('aria-label', `${action}${action === 'Listen' ? ' to' : ''} ${button.dataset.voiceLabel}`);
    button.setAttribute('aria-pressed', String(pressed));
    button.classList.toggle('is-speaking', pressed);
  };
  const resetButton = (button) => updateButton(button, '▶ Listen', false);
  const setIdle = (message = '') => {
    speaking = false;
    pausedByUser = false;
    resetButton(activeButton);
    activeButton = null;
    activeLabel = '';
    playStop.hidden = true;
    status.textContent = message;
    status.hidden = !message;
  };
  const chooseVoice = () => {
    if (!supported) return;
    voice = chooseEnglishVoice(window.speechSynthesis.getVoices());
  };
  const updatePlaying = () => {
    updateButton(activeButton, pausedByUser ? '▶ Resume' : 'Ⅱ Pause', true);
    playStop.hidden = false;
  };
  const speakChunk = (id) => {
    if (id !== runId || chunkIndex >= chunks.length) {
      if (id === runId) setIdle('Finished. Choose another section whenever you like.');
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(chunks[chunkIndex]);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    else utterance.lang = 'en-US';
    utterance.rate = Number(rate.value);
    utterance.pitch = 1;
    utterance.volume = 0.95;
    status.textContent = `Listening to ${activeLabel} · point ${chunkIndex + 1} of ${chunks.length}…`;
    status.hidden = false;
    utterance.onend = () => { if (id !== runId) return; chunkIndex += 1; speakChunk(id); };
    utterance.onerror = () => { if (id === runId) setIdle('Voice playback stopped. Press Listen to try again.'); };
    window.speechSynthesis.speak(utterance);
    updatePlaying();
  };
  const read = (button, label, getText) => {
    if (!supported) return;
    if (activeButton === button && speaking) {
      pausedByUser = !pausedByUser;
      try {
        if (pausedByUser) window.speechSynthesis.pause();
        else window.speechSynthesis.resume();
      } catch { /* Some embedded browsers expose speech but not pause/resume. */ }
      updatePlaying();
      return;
    }
    if (activeButton) resetButton(activeButton);
    runId += 1;
    window.speechSynthesis.cancel();
    chunks = splitVoiceText(getText());
    if (!chunks.length) {
      status.textContent = 'This section has no text available to read.';
      return;
    }
    chunkIndex = 0;
    speaking = true;
    pausedByUser = false;
    activeButton = button;
    activeLabel = label;
    speakChunk(runId);
  };

  if (!supported) {
    status.textContent = 'Voice playback is not available in this browser. Try a browser with built-in speech support.';
    status.hidden = false;
  } else {
    chooseVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', chooseVoice);
  }
  const stop = () => {
    runId += 1;
    if (supported) window.speechSynthesis.cancel();
    setIdle();
  };
  playStop.addEventListener('click', stop);
  document.addEventListener('wagsignals:stop-audio', stop);
  window.addEventListener('pagehide', stop);
  return {
    bind(button, label, getText) {
      button.dataset.voiceLabel = label;
      button.querySelector('[data-voice-button-text]').textContent = '▶ Listen';
      button.setAttribute('aria-label', `Listen to ${label}`);
      button.setAttribute('aria-pressed', 'false');
      if (!supported) button.disabled = true;
      button.addEventListener('click', () => read(button, label, getText));
    }
  };
}

function createVoiceButton(label) {
  const button = document.createElement('button');
  button.className = 'voice-button button secondary';
  button.type = 'button';
  button.dataset.voiceControl = '';
  button.innerHTML = '<span data-voice-button-text>▶ Listen</span>';
  button.setAttribute('aria-label', `Listen to ${label}`);
  return button;
}

function addVoiceButton(container, root, label, selectors, controller) {
  if (!container || !root || container.querySelector('[data-voice-control]')) return;
  const button = createVoiceButton(label);
  container.append(button);
  controller.bind(button, label, () => voiceTextFromSelectors(root, selectors));
}

function initVoiceReader() {
  const page = currentVoicePage() === 'index' ? 'home' : currentVoicePage();
  const main = document.querySelector('main');
  const anchor = main?.querySelector('.home-hero, .page-hero');
  if (!main || !anchor || page === 'quiz' || page === 'training' || page === 'challenges' || main.querySelector('[data-voice-toolbar]')) return;

  const toolbar = document.createElement('section');
  toolbar.className = 'shell voice-toolbar';
  toolbar.dataset.voiceToolbar = '';
  toolbar.setAttribute('aria-label', 'Listen to this guide');
  toolbar.innerHTML = '<div class="voice-toolbar-actions"><button class="button secondary" type="button" data-voice-intro><span data-voice-button-text>▶ Listen</span></button><button class="button secondary" type="button" data-voice-stop hidden>Stop audio</button><details class="voice-settings"><summary>Audio options</summary><div><label class="voice-speed" for="voice-rate">Speed<select id="voice-rate" data-voice-rate aria-label="Voice speed"><option value="0.9">Calm</option><option value="0.98" selected>Normal</option><option value="1.08">Quick</option></select></label><p>Listen to one section at a time. Voice quality depends on your browser and device. Some device voices use an online speech service.</p></div></details></div><p class="voice-status" data-voice-status role="status" aria-live="polite" hidden></p>';
  if (page === 'home') { toolbar.classList.remove('shell'); main.querySelector('.home-copy').append(toolbar); }
  else anchor.after(toolbar);

  const controller = createVoiceController(toolbar);
  const introRoot = main.querySelector('.home-hero, .page-hero');
  const introButton = toolbar.querySelector('[data-voice-intro]');
  controller.bind(introButton, page === 'home' ? 'the homepage welcome' : 'the introduction', () => voiceTextFromSelectors(introRoot, ['h1', '.page-hero-inner > div:first-child > p', '.home-copy > p:first-of-type']));
  if (page === 'daily') addVoiceButton(main.querySelector('.daily-card > div:nth-child(2)'), main.querySelector('.daily-card'), 'today’s lesson', ['#daily-title', '#daily-body', '.daily-note', '#daily-question-title'], controller);
  if (page === 'signals') addVoiceButton(main.querySelector('.read-panel > div:nth-child(2)'), main.querySelector('.read-panel'), 'this body-language clue', ['h2', '.read-panel > div > p', '.read-list strong', '.read-list span'], controller);
  if (page === 'behaviors') main.querySelectorAll('.behavior-card').forEach((card) => addVoiceButton(card.querySelector('.behavior-card-body'), card, 'this behavior', ['h2', '.behavior-card-body > p', '.behavior-note', '.learning-details[open] li', '.learning-details[open] p'], controller));
  if (page === 'training') main.querySelectorAll('.training-card').forEach((card) => addVoiceButton(card.querySelector('.training-card-body'), card, 'this training skill', ['h2', '.training-card-body > p', '.training-note', '.learning-details[open] li', '.learning-details[open] p'], controller));
  if (page === 'body-map') {
    addVoiceButton(main.querySelector('.body-map > div'), main.querySelector('.body-map'), 'the body map', ['h2', '.body-map > div > p', '.map-list strong', '.map-list span'], controller);
    addVoiceButton(main.querySelector('.pause-card > div'), main.querySelector('.pause-card'), 'the space steps', ['h2', '.pause-card > div > p', '.pause-step strong', '.pause-step span'], controller);
  }
  const bindDynamicCards = () => {
    if (page === 'saved') main.querySelectorAll('.saved-card').forEach((card) => addVoiceButton(card.querySelector('.saved-card-body'), card, 'this saved clue', ['h2', '.saved-card-body > p'], controller));
    if (page === 'scenarios') main.querySelectorAll('.scenario-card').forEach((card) => addVoiceButton(card.querySelector('.scenario-card-body'), card, 'this scenario', ['h2', '.scenario-card .scenario-row'], controller));
  };
  bindDynamicCards();
  document.addEventListener('wagsignals:content-updated', bindDynamicCards);
  if (page === 'cheat-sheet') {
    addVoiceButton(main.querySelector('.cheat-sheet-heading'), main.querySelector('.cheat-sheet-heading'), 'the whole-dog scan', ['h2', 'p'], controller);
    addVoiceButton(main.querySelector('.cheat-safety'), main.querySelector('.cheat-safety'), 'the space safety steps', ['h2', 'li'], controller);
  }
}

function initNavigation() {
  const header = document.querySelector('.topbar');
  const nav = header?.querySelector('.nav');
  if (!nav) return;
  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-tabbar';
  mobileNav.id = 'mobile-navigation';
  mobileNav.setAttribute('aria-label', 'Primary navigation');

  const icons = {
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    learn: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    training: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.3 1.7c-1.1 1.1-1.9 1.5-1.9 3"/><path d="M12 17.3h.01"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  const primary = [
    { label: 'Home', href: './index.html', icon: 'home' },
    { label: 'Learn', href: './signals.html', icon: 'learn' },
    { label: 'Train', href: './training.html', icon: 'training' },
    { label: 'Help', href: './challenges.html', icon: 'help' }
  ];
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const primaryPages = new Set(primary.map((item) => item.href.slice(2)));
  const iconMarkup = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name]}</svg>`;

  primary.forEach((item) => {
    const link = document.createElement('a');
    link.className = 'mobile-tab';
    link.href = item.href;
    link.innerHTML = `${iconMarkup(item.icon)}<span>${item.label}</span>`;
    if ((currentPage === '' ? 'index.html' : currentPage) === item.href.slice(2)) link.setAttribute('aria-current', 'page');
    mobileNav.append(link);
  });

  const more = document.createElement('details');
  more.className = 'mobile-more';
  const summary = document.createElement('summary');
  summary.innerHTML = `${iconMarkup('more')}<span>More</span>`;
  const menu = document.createElement('div');
  menu.className = 'mobile-more-menu';
  const menuTitle = document.createElement('p');
  menuTitle.className = 'mobile-more-title';
  menuTitle.textContent = 'More to explore';
  const menuLinks = document.createElement('div');
  menuLinks.className = 'mobile-more-links';
  const primaryHrefs = new Set(primary.map((item) => item.href));
  nav.querySelectorAll('a[href]').forEach((source) => {
    const href = source.getAttribute('href');
    if (primaryHrefs.has(href)) return;
    const link = source.cloneNode(true);
    link.className = 'mobile-more-link';
    const route = href.split('/').pop().toLowerCase();
    if (route === currentPage) link.setAttribute('aria-current', 'page');
    menuLinks.append(link);
  });
  if (!menuLinks.querySelector('a[href="./cheat-sheet.html"]')) {
    const printable = document.createElement('a');
    printable.className = 'mobile-more-link';
    printable.href = './cheat-sheet.html';
    printable.textContent = 'Print cheat sheet';
    if (currentPage === 'cheat-sheet.html') printable.setAttribute('aria-current', 'page');
    menuLinks.append(printable);
  }
  menu.append(menuTitle);
  window.WagSignalsInstall?.addMobileEntry(menu);
  menu.append(menuLinks);
  more.append(summary, menu);
  if (!primaryPages.has(currentPage === '' ? 'index.html' : currentPage)) more.classList.add('is-current');
  mobileNav.append(more);
  header.after(mobileNav);
  header.classList.add('nav-ready');
  document.body.classList.add('mobile-navigation-ready');
  window.WagSignalsInstall?.init();

  const desktopMore = nav.querySelector('.nav-more');
  if (desktopMore) {
    const versionMarker = document.createElement('span');
    versionMarker.className = 'beta-version-marker';
    versionMarker.textContent = 'Beta 3';
    versionMarker.setAttribute('aria-label', 'WagSignals Beta 3');
    desktopMore.querySelector('.nav-more-menu')?.append(versionMarker);
  }
  const mobileVersionMarker = document.createElement('span');
  mobileVersionMarker.className = 'beta-version-marker';
  mobileVersionMarker.textContent = 'Beta 3';
  mobileVersionMarker.setAttribute('aria-label', 'WagSignals Beta 3');
  menu.append(mobileVersionMarker);
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target) && desktopMore) desktopMore.open = false;
    if (!mobileNav.contains(event.target) && !document.querySelector('.install-dialog')?.contains(event.target)) more.open = false;
  });
  const closeOnEscape = (event) => {
    if (event.key !== 'Escape') return;
    if (more.open) { more.open = false; summary.focus(); }
    if (desktopMore?.open) { desktopMore.open = false; desktopMore.querySelector('summary')?.focus(); }
  };
  header.addEventListener('keydown', closeOnEscape);
  mobileNav.addEventListener('keydown', closeOnEscape);
}

function initGuideJump() {
  if (document.body.dataset.page === 'challenges') return;
  const cards = [...document.querySelectorAll('.behavior-card, .training-card, .challenge-card')];
  if (!cards.length) return;
  const toolbar = document.createElement('div'); toolbar.className = 'guide-jump';
  const label = document.createElement('label'); label.htmlFor = 'guide-topic'; label.textContent = 'Find a topic';
  const select = document.createElement('select'); select.id = 'guide-topic';
  select.add(new Option(`Choose from ${cards.length} topics`, ''));
  cards.forEach((card) => {
    const heading = card.querySelector('h2');
    card.id ||= heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
    heading.tabIndex = -1;
    select.add(new Option(heading.textContent, card.id));
  });
  select.addEventListener('change', () => {
    const card = cards.find((item) => item.id === select.value);
    if (card) {
      const module = card.closest('.training-module');
      if (module) module.open = true;
      card.scrollIntoView({ block: 'start' });
      card.querySelector('h2').focus({ preventScroll: true });
    }
  });
  toolbar.append(label, select);
  const firstModule = cards[0].closest('.training-module');
  if (firstModule) firstModule.before(toolbar);
  else cards[0].parentElement.before(toolbar);
  const requestedId = window.location.hash.slice(1);
  const requestedCard = cards.find((card) => card.id === requestedId);
  if (requestedCard) window.requestAnimationFrame(() => {
    requestedCard.scrollIntoView({ block: 'start' });
    requestedCard.querySelector('h2')?.focus({ preventScroll: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initGuideJump();
  renderProgress();
  if (document.body.dataset.page === 'daily') renderDaily();
  if (document.body.dataset.page === 'quiz') renderQuiz();
  if (document.body.dataset.page === 'saved') renderSaved();
  if (document.body.dataset.page === 'scenarios') renderScenarios();
  document.querySelector('#print-sheet')?.addEventListener('click', () => window.print());
  renderFeedback();
  window.requestAnimationFrame(initVoiceReader);
});
