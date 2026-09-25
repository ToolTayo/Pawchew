const storageKey = 'wagsignals.progress.v1';

const dailyLessons = [
  { id: 'soft-eyes', kicker: 'Body language', title: 'Soft eyes are an invitation to slow down.', body: 'Blinking, relaxed eyes and a loose body often mean your dog can stay present and make choices.', notice: 'Look for the whole pattern—not just the eyes.', try: 'Let your dog approach, sniff, or move away without pressure.', image: './assets/guide-relaxed.png', alt: 'A golden retriever sitting with a relaxed body and soft eyes', question: 'Which clue helps confirm a relaxed read?', options: ['Loose movement and easy breathing', 'A fast stiff wag only', 'A fixed stare'], answer: 0, explanation: 'Relaxation is a cluster: soft eyes, flexible movement, and the ability to disengage.' },
  { id: 'play-bow', kicker: 'Body language', title: 'A play bow is an invitation, not a command.', body: 'A low front end and raised hips can invite play when the face and movement stay loose.', notice: 'Good play includes pauses and the freedom to opt out.', try: 'Offer a short game, then give everyone a break.', image: './assets/guide-playful.png', alt: 'A small dog holding a clear play bow with its front legs down and hips raised', question: 'What makes play safer?', options: ['Chasing without pauses', 'Give-and-take with easy breaks', 'Holding a dog in place'], answer: 1, explanation: 'Healthy play has turn-taking, pauses, and room for each dog to leave.' },
  { id: 'sniff-break', kicker: 'Everyday behavior', title: 'A sniff break can be useful enrichment.', body: 'Sniffing gives dogs information and can help them settle. A walk does not need to be fast to be valuable.', notice: 'Sudden frantic sniffing can also release pressure.', try: 'Let your dog investigate safe smells before moving on.', image: './assets/behavior-sniffing.png', alt: 'A dog sniffing grass in a sunny park', question: 'What is a helpful response to calm sniffing?', options: ['Allow safe time to explore', 'Pull away every time', 'Assume the dog is disobedient'], answer: 0, explanation: 'Sniffing is normal information gathering and often a calming outlet.' },
  { id: 'space-signal', kicker: 'Safety', title: 'A freeze is a reason to add space.', body: 'Stillness, a tight mouth, hard focus, or a body leaning away can be a quiet stop sign.', notice: 'Freezing is not proof that a dog is calm.', try: 'Stop reaching, turn sideways, and create a clear exit.', image: './assets/guide-needs-space.png', alt: 'A dog standing still and asking for space', question: 'What should happen first?', options: ['More touching', 'More distance', 'A louder command'], answer: 1, explanation: 'Distance lowers pressure and gives the dog a chance to recover.' },
  { id: 'trade-safe', kicker: 'Challenges', title: 'A calm trade beats a chase.', body: 'If a dog has something unsafe, offer something better and make giving it up feel safe.', notice: 'Do not pry objects from a worried dog’s mouth.', try: 'Keep high-value treats ready and return to the game when the trade is done.', image: './assets/challenge-stones-dirt.png', alt: 'A handler offering a treat trade while a dog investigates a stone outdoors', question: 'What is the safest first move?', options: ['Chase and grab', 'Offer a better trade and add distance', 'Scold after the dog drops it'], answer: 1, explanation: 'A trade protects trust and reduces the chance of guarding or a frantic chase.' },
  { id: 'mat-settle', kicker: 'Training', title: 'Settling is a skill worth practicing.', body: 'A predictable mat can give your dog a safe place to rest while normal life happens around them.', notice: 'The goal is choice and soft muscles, not forced stillness.', try: 'Reward a lowered head, relaxed breathing, and choosing to stay.', image: './assets/training-settle.png', alt: 'A dog resting on a mat beside a seated handler', question: 'What should you reward?', options: ['Only a perfect long stay', 'Small signs of softening and rest', 'A dog that cannot move'], answer: 1, explanation: 'Reinforcing tiny moments of calm builds a useful, voluntary settle.' }
];

const quizQuestions = [
  { image: './assets/guide-stressed.png', alt: 'A dog showing a slightly tense posture', question: 'A dog is panting, pacing, and lip licking in a quiet room. What is the kindest first step?', options: ['Add distance and lower stimulation', 'Force a greeting', 'Ignore every signal'], answer: 0, explanation: 'Clusters of stress signals call for less pressure and more predictability.' },
  { image: './assets/guide-playful.png', alt: 'A dog holding a play bow', question: 'Which pattern most supports a play invitation?', options: ['Loose movement with pauses', 'A frozen hard stare', 'A tight mouth and retreat'], answer: 0, explanation: 'Play is bouncy and flexible, with room for both dogs to opt in or out.' },
  { image: './assets/challenge-guarding.png', alt: 'A dog beside a bowl while a handler gives space', question: 'A dog freezes over a food bowl. What should you do?', options: ['Reach into the bowl', 'Give space and manage the setup', 'Punish the growl'], answer: 1, explanation: 'Freezing is information. Distance and professional guidance are safer than confrontation.' },
  { image: './assets/training-leash.png', alt: 'A dog walking with slack in the leash', question: 'What should earn a reward during loose-leash practice?', options: ['A slack leash and check-in', 'A tighter pull', 'Ignoring the handler'], answer: 0, explanation: 'Reward the behavior you want repeated: slack, connection, and easy movement.' },
  { image: './assets/challenge-separation.png', alt: 'A dog settling with a food puzzle while a person prepares to leave', question: 'What helps separation distress?', options: ['Practice absences shorter than panic', 'Leave for a long time immediately', 'Punish vocalizing afterward'], answer: 0, explanation: 'Gradual practice below the dog’s panic threshold is safer and more teachable.' },
  { image: './assets/guide-warning.png', alt: 'A dog showing a strong warning signal', question: 'A dog growls when someone reaches toward them. What does the growl provide?', options: ['Useful safety information', 'Proof the dog is bad', 'A reason to reach faster'], answer: 0, explanation: 'A warning is communication. Stop, create distance, and seek qualified support if it repeats.' }
];

const scenarioLibrary = [
  { title: 'A visitor arrives', tag: 'Greetings', image: './assets/guide-interested.png', alt: 'A dog standing alert and curious', look: 'Check whether your dog can sniff, blink, eat, and move away.', do: 'Use distance, a gate, and reward calm check-ins before greetings.', avoid: 'Do not force a hello or hold the dog in place.' },
  { title: 'A child reaches toward the dog', tag: 'Family safety', image: './assets/guide-uncertain.png', alt: 'A dog turning its head away and asking for space', look: 'Head turns, lip licks, weight shifts, and closed mouths can be quiet requests.', do: 'Call the dog away and give them a protected resting place.', avoid: 'Do not allow hugging, climbing, cornering, or chasing.' },
  { title: 'The doorbell rings', tag: 'Home routines', image: './assets/challenge-door-dashing.png', alt: 'A dog waiting on a mat behind a safety barrier', look: 'Notice arousal before opening the door and secure the exit first.', do: 'Use a gate, mat, leash, and small rewards for pauses.', avoid: 'Do not chase a dog toward an open door.' },
  { title: 'Two dogs meet', tag: 'Dog-to-dog', image: './assets/guide-playful.png', alt: 'A dog holding a play bow', look: 'Look for loose curves, pauses, turn-taking, and the freedom to leave.', do: 'Start with space and parallel movement before closer interaction.', avoid: 'Do not force face-to-face greetings or ignore repeated escape attempts.' },
  { title: 'A dog freezes during handling', tag: 'Grooming & care', image: './assets/guide-needs-space.png', alt: 'A dog standing still and asking for space', look: 'Freezing can mean the dog is overwhelmed, not that they agree.', do: 'Stop, soften the setup, and practice tiny touch-reward-release steps.', avoid: 'Do not continue until the dog struggles or snaps.' },
  { title: 'A trigger appears on a walk', tag: 'Walks', image: './assets/challenge-lunging.png', alt: 'A handler creating distance from a distant dog', look: 'Watch distance, leash tension, recovery, and whether your dog can eat.', do: 'Turn away early, add distance, and reward looking back.', avoid: 'Do not wait for a full lunge before moving.' },
  { title: 'Food bowl time', tag: 'Mealtimes', image: './assets/challenge-guarding.png', alt: 'A dog beside a food bowl while a handler gives space', look: 'Freezing, hovering, hard focus, or growling means the dog needs space.', do: 'Manage meals behind a barrier and get professional guidance for guarding.', avoid: 'Never reach into the bowl or punish the warning.' },
  { title: 'The dog is alone', tag: 'Being home alone', image: './assets/challenge-separation.png', alt: 'A dog settling with a food puzzle while a person prepares to leave', look: 'Pacing, howling, scratching, or panic point to distress.', do: 'Practice absences shorter than panic and build up gradually.', avoid: 'Do not leave a panicked dog alone for longer to “teach” them.' },
  { title: 'Something unsafe is on the ground', tag: 'Scavenging', image: './assets/challenge-stones-dirt.png', alt: 'A handler offering a treat trade while a dog investigates a stone', look: 'Notice what the dog finds valuable and whether eating objects is repeated.', do: 'Use secure management and teach a calm, high-value trade.', avoid: 'Do not chase, pry, or punish after the item is dropped.' }
];

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readProgress() {
  try { return { dailyDates: [], quizBest: 0, favorites: [], ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
  catch { return { dailyDates: [], quizBest: 0, favorites: [] }; }
}

function saveProgress(progress) { localStorage.setItem(storageKey, JSON.stringify(progress)); }

function dayDifference(first, second) {
  return Math.round((new Date(`${second}T12:00:00`) - new Date(`${first}T12:00:00`)) / 86400000);
}

function currentStreak(dates) {
  const sorted = [...new Set(dates)].sort().reverse();
  if (!sorted.length) return 0;
  let streak = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (dayDifference(sorted[index], sorted[index - 1]) !== 1) break;
    streak += 1;
  }
  return streak;
}

function renderProgress() {
  const target = document.querySelector('[data-progress-summary]');
  if (!target) return;
  const progress = readProgress();
  target.textContent = `${currentStreak(progress.dailyDates)} day${currentStreak(progress.dailyDates) === 1 ? '' : 's'} in a row · ${progress.dailyDates.length} daily clue${progress.dailyDates.length === 1 ? '' : 's'} learned · quiz best ${progress.quizBest}/${quizQuestions.length}`;
}

function renderDaily() {
  const index = Math.floor(Date.now() / 86400000) % dailyLessons.length;
  const lesson = dailyLessons[index];
  const progress = readProgress();
  const image = document.querySelector('#daily-image');
  document.querySelector('#daily-kicker').textContent = lesson.kicker;
  document.querySelector('#daily-title').textContent = lesson.title;
  document.querySelector('#daily-body').textContent = lesson.body;
  document.querySelector('#daily-notice').textContent = lesson.notice;
  document.querySelector('#daily-try').textContent = lesson.try;
  image.src = lesson.image;
  image.alt = lesson.alt;
  document.querySelector('#daily-question-title').textContent = lesson.question;
  const options = document.querySelector('#daily-options');
  options.innerHTML = lesson.options.map((option, optionIndex) => `<button class="daily-option" type="button" data-option="${optionIndex}">${option}</button>`).join('');
  const feedback = document.querySelector('#daily-feedback');
  options.addEventListener('click', (event) => {
    const button = event.target.closest('[data-option]');
    if (!button) return;
    const correct = Number(button.dataset.option) === lesson.answer;
    options.querySelectorAll('button').forEach((option) => { option.disabled = true; option.classList.toggle('is-correct', Number(option.dataset.option) === lesson.answer); });
    if (!correct) button.classList.add('is-wrong');
    feedback.textContent = correct ? `Yes — ${lesson.explanation}` : `Not quite. ${lesson.explanation}`;
    document.querySelector('#daily-learn').disabled = false;
  });
  const learned = progress.dailyDates.includes(todayKey());
  const learnButton = document.querySelector('#daily-learn');
  learnButton.disabled = learned;
  learnButton.textContent = learned ? 'Learned today ✓' : 'Mark as learned';
  learnButton.addEventListener('click', () => {
    const next = readProgress();
    if (!next.dailyDates.includes(todayKey())) next.dailyDates.push(todayKey());
    saveProgress(next); renderProgress(); learnButton.disabled = true; learnButton.textContent = 'Learned today ✓';
    document.querySelector('#daily-status').textContent = `Nice work. Your streak is now ${currentStreak(next.dailyDates)} day${currentStreak(next.dailyDates) === 1 ? '' : 's'}.`;
  });
  const saveButton = document.querySelector('#daily-save');
  saveButton.addEventListener('click', () => {
    const next = readProgress();
    const saved = next.favorites.includes(lesson.id);
    next.favorites = saved ? next.favorites.filter((item) => item !== lesson.id) : [...next.favorites, lesson.id];
    saveProgress(next); saveButton.textContent = saved ? 'Save clue' : 'Saved ✓';
  });
}

function renderQuiz() {
  const shell = document.querySelector('#quiz-shell');
  let questionIndex = 0;
  let score = 0;
  function showQuestion() {
    const question = quizQuestions[questionIndex];
    shell.innerHTML = `<div class="quiz-progress"><span>Question ${questionIndex + 1} of ${quizQuestions.length}</span><span>Score ${score}</span></div><div class="quiz-track"><span style="width:${((questionIndex + 1) / quizQuestions.length) * 100}%"></span></div><article class="quiz-card"><img src="${question.image}" alt="${question.alt}" width="1024" height="1024" /><div><span class="section-kicker">Look for the whole pattern</span><h2>${question.question}</h2><div class="quiz-options">${question.options.map((option, optionIndex) => `<button class="quiz-option" type="button" data-option="${optionIndex}">${option}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p></div></article>`;
    shell.querySelector('.quiz-options').addEventListener('click', (event) => {
      const button = event.target.closest('[data-option]');
      if (!button) return;
      const correct = Number(button.dataset.option) === question.answer;
      if (correct) score += 1;
      shell.querySelectorAll('.quiz-option').forEach((option) => { option.disabled = true; option.classList.toggle('is-correct', Number(option.dataset.option) === question.answer); });
      if (!correct) button.classList.add('is-wrong');
      shell.querySelector('.quiz-feedback').textContent = `${correct ? 'Correct. ' : 'Not quite. '}${question.explanation}`;
      const next = document.createElement('button'); next.className = 'button'; next.type = 'button'; next.textContent = questionIndex === quizQuestions.length - 1 ? 'See my result' : 'Next question'; next.style.marginTop = '8px';
      next.addEventListener('click', () => { questionIndex += 1; if (questionIndex < quizQuestions.length) showQuestion(); else showResult(); });
      shell.querySelector('.quiz-feedback').after(next);
    }, { once: true });
  }
  function showResult() {
    const progress = readProgress(); progress.quizBest = Math.max(progress.quizBest, score); saveProgress(progress); renderProgress();
    shell.innerHTML = `<div class="quiz-result"><span class="section-kicker">Your read is getting sharper</span><h2>${score}/${quizQuestions.length}</h2><p>${score >= 5 ? 'Excellent whole-dog thinking.' : score >= 3 ? 'Good start. Keep checking context and recovery.' : 'Keep practicing—small clues add up.'}</p><div class="habit-actions" style="justify-content:center"><button class="button" type="button" id="quiz-retry">Try again</button><button class="button secondary" type="button" id="quiz-share">Share result</button></div><p id="quiz-share-status" aria-live="polite"></p></div>`;
    shell.querySelector('#quiz-retry').addEventListener('click', () => { questionIndex = 0; score = 0; showQuestion(); });
    shell.querySelector('#quiz-share').addEventListener('click', async () => {
      const shareText = `I scored ${score}/${quizQuestions.length} on the WagSignals dog-reading quiz.`;
      const status = shell.querySelector('#quiz-share-status');
      try {
        if (navigator.share) await navigator.share({ title: 'My WagSignals quiz result', text: shareText, url: window.location.href });
        else await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        status.textContent = navigator.share ? 'Share sheet opened.' : 'Result copied to your clipboard.';
      } catch { status.textContent = 'Sharing was cancelled.'; }
    });
  }
  showQuestion();
}

function renderSaved() {
  const target = document.querySelector('#saved-list');
  if (!target) return;
  const progress = readProgress();
  const saved = dailyLessons.filter((lesson) => progress.favorites.includes(lesson.id));
  const render = () => {
    const current = readProgress();
    const lessons = dailyLessons.filter((lesson) => current.favorites.includes(lesson.id));
    if (!lessons.length) {
      target.innerHTML = '<div class="empty-state"><h2>Your saved shelf is empty.</h2><p>Save a Daily Wag clue when you find one you want to revisit.</p><a class="button" href="./daily.html">Open Daily Wag</a></div>';
      return;
    }
    target.innerHTML = lessons.map((lesson) => `<article class="saved-card"><img src="${lesson.image}" alt="${lesson.alt}" width="1024" height="1024" loading="lazy" decoding="async" /><div class="saved-card-body"><span class="challenge-tag">${lesson.kicker}</span><h2>${lesson.title}</h2><p>${lesson.body}</p><button class="button secondary" type="button" data-remove="${lesson.id}">Remove saved clue</button></div></article>`).join('');
    target.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
      const next = readProgress(); next.favorites = next.favorites.filter((id) => id !== button.dataset.remove); saveProgress(next); render();
    }));
  };
  render();
  document.querySelector('#saved-clear')?.addEventListener('click', () => { const next = readProgress(); next.favorites = []; saveProgress(next); render(); });
}

function renderScenarios() {
  const target = document.querySelector('#scenario-list');
  const search = document.querySelector('#scenario-search');
  const count = document.querySelector('#scenario-count');
  if (!target || !search || !count) return;
  const render = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = scenarioLibrary.filter((scenario) => `${scenario.title} ${scenario.tag} ${scenario.look} ${scenario.do} ${scenario.avoid}`.toLowerCase().includes(query));
    count.textContent = `${filtered.length} scenario${filtered.length === 1 ? '' : 's'}`;
    target.innerHTML = filtered.length ? filtered.map((scenario) => `<article class="scenario-card"><img src="${scenario.image}" alt="${scenario.alt}" width="1024" height="1024" loading="lazy" decoding="async" /><div class="scenario-card-body"><span class="scenario-tag">${scenario.tag}</span><h2>${scenario.title}</h2><p class="scenario-row"><strong>Look for</strong><span>${scenario.look}</span></p><p class="scenario-row"><strong>Try</strong><span>${scenario.do}</span></p><p class="scenario-row"><strong>Avoid</strong><span>${scenario.avoid}</span></p></div></article>`).join('') : '<div class="empty-state"><h2>No matching scenario.</h2><p>Try a word like “door,” “walk,” “food,” or “handling.”</p></div>';
  };
  search.addEventListener('input', render); render();
}

document.addEventListener('DOMContentLoaded', () => {
  renderProgress();
  if (document.body.dataset.page === 'daily') renderDaily();
  if (document.body.dataset.page === 'quiz') renderQuiz();
  if (document.body.dataset.page === 'saved') renderSaved();
  if (document.body.dataset.page === 'scenarios') renderScenarios();
  document.querySelector('#print-sheet')?.addEventListener('click', () => window.print());
});
