/* Focused lesson views using the shared, optional section reader. */
(() => {
  const lessons = window.WagSignalsTrainingLessons ?? [];
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const index = document.querySelector('#training-index');
  const view = document.querySelector('#lesson');
  const content = document.querySelector('#training-lesson-content');
  const hero = document.querySelector('.page-hero');
  if (!index || !view || !content) return;

  let reader = null;
  let opener = null;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const addReaderSection = (parent, label, heading, className = '') => {
    const section = make('section', `lesson-section ${className}`.trim());
    section.dataset.readerSection = '';
    section.dataset.readerLabel = label;
    section.dataset.readerMarker = '';
    const title = make('h3', 'lesson-section-title', heading);
    const marker = make('span', 'lesson-reading-marker', 'Current section');
    marker.hidden = true;
    title.append(' ', marker);
    section.append(title);
    parent.append(section);
    return section;
  };
  const addParagraphs = (parent, values) => values.forEach((value) => parent.append(make('p', '', value)));
  const addList = (parent, values, className = 'lesson-bullets') => {
    const list = make('ul', className);
    values.forEach((value) => list.append(make('li', '', value)));
    parent.append(list);
  };
  const addPairs = (parent, values, className) => {
    const list = make('div', className);
    values.forEach(([label, text]) => {
      const item = make('article', `${className}-item`);
      item.append(make('h4', '', label), make('p', '', text));
      list.append(item);
    });
    parent.append(list);
  };
  const renderLesson = (lesson) => {
    content.replaceChildren();
    const top = make('header', 'lesson-intro lesson-reader-section');
    const artwork = make('img', 'lesson-art');
    artwork.src = lesson.image;
    artwork.alt = lesson.alt;
    artwork.width = 768;
    artwork.height = 768;
    artwork.loading = 'lazy';
    artwork.decoding = 'async';
    const copy = make('div', 'lesson-intro-copy');
    copy.append(make('span', 'eyebrow', `Lesson ${lesson.order} · ${lesson.category}`));
    const title = make('h1', '', lesson.title);
    title.id = 'lesson-title';
    title.tabIndex = -1;
    copy.append(title);
    const summary = make('p', 'lesson-lead', lesson.summary);
    copy.append(summary);
    top.append(artwork, copy);
    content.append(top);

    const readerPanel = make('section', 'lesson-reader');
    readerPanel.setAttribute('aria-label', 'Optional spoken lesson controls');
    const readerTitle = make('h3', '', 'Listen section by section');
    const readerDescription = make('p', 'reader-description', 'Speech starts only when you choose it. The written lesson always stays on screen.');
    const controls = make('div', 'lesson-reader-controls');
    const play = make('button', 'button', '▶ Read this lesson');
    play.type = 'button';
    play.dataset.readerPlay = '';
    const previous = make('button', 'button secondary', '← Previous section');
    previous.type = 'button';
    previous.dataset.readerPrevious = '';
    const next = make('button', 'button secondary', 'Next section →');
    next.type = 'button';
    next.dataset.readerNext = '';
    const restart = make('button', 'button secondary', 'Restart');
    restart.type = 'button';
    restart.dataset.readerRestart = '';
    restart.disabled = true;
    const stop = make('button', 'button secondary', 'Stop');
    stop.type = 'button';
    stop.dataset.readerStop = '';
    stop.disabled = true;
    const settings = make('details', 'lesson-reader-settings');
    settings.append(make('summary', '', 'Voice speed'));
    const rateLabel = make('label', '', 'Reading pace');
    const rate = make('select', '');
    rate.id = 'lesson-voice-rate';
    rate.setAttribute('aria-label', 'Reading pace');
    rate.dataset.readerRate = '';
    [['0.9', 'Calm'], ['0.98', 'Normal'], ['1.08', 'Quick']].forEach(([value, label]) => {
      const option = make('option', '', label);
      option.value = value;
      option.selected = value === '0.98';
      rate.append(option);
    });
    rateLabel.append(rate);
    settings.append(rateLabel);
    controls.append(play, previous, next, restart, stop, settings);
    const status = make('p', 'lesson-reader-status', 'Ready when you are. The guide will not speak automatically.');
    status.dataset.readerStatus = '';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    readerPanel.append(readerTitle, readerDescription, controls, status);
    content.append(readerPanel);

    const overview = addReaderSection(content, 'Overview', 'What this skill is for');
    addParagraphs(overview, lesson.overview);

    const setup = addReaderSection(content, 'Before you start', 'Before you start');
    addPairs(setup, lesson.setup, 'lesson-setup-grid');

    lesson.stages.forEach((stage, index) => {
      const number = index + 1;
      const label = `Step ${number} — ${stage.title}`;
      const section = addReaderSection(content, label, `Stage ${number} — ${stage.title}`, 'lesson-stage');
      const details = make('dl', 'lesson-coaching');
      for (const [key, title] of [['do', 'Do'], ['watch', 'Watch for'], ['reward', 'Reward'], ['repeat', 'Repeat or reset'], ['ready', 'Move on when']]) {
        details.append(make('dt', '', title), make('dd', '', stage[key]));
      }
      section.append(details);
    });

    const success = addReaderSection(content, 'What success looks like', 'What success looks like');
    addList(success, lesson.success);
    const struggles = addReaderSection(content, 'If your dog struggles', 'If your dog struggles');
    addPairs(struggles, lesson.struggles, 'lesson-pair-grid');
    const mistakes = addReaderSection(content, 'Common mistakes', 'Common mistakes');
    addPairs(mistakes, lesson.mistakes, 'lesson-pair-grid');
    const safety = addReaderSection(content, 'Safety', 'Safety', 'lesson-safety');
    safety.append(make('p', '', lesson.safety));
    const nextStep = addReaderSection(content, 'Next step', 'Your next step');
    nextStep.append(make('p', '', lesson.next));

    if (lesson.sources?.length) {
      const sources = addReaderSection(content, 'Further reading', 'Further reading', 'lesson-sources');
      const list = make('ul', 'lesson-bullets');
      for (const item of lesson.sources) {
        const row = make('li', '');
        const link = make('a', '', item.label);
        link.href = item.href;
        link.target = '_blank';
        link.rel = 'noreferrer';
        row.append(link);
        list.append(row);
      }
      sources.append(list);
    }

    const readerSections = [...content.querySelectorAll('[data-reader-section]')];
    const speechSections = readerSections.map((section) => ({
      label: section.dataset.readerLabel,
      text: section.innerText || section.textContent || ''
    }));
    const synthesis = window.speechSynthesis;
    const supported = Boolean(synthesis && typeof window.SpeechSynthesisUtterance === 'function');
    if (!supported) {
      controls.hidden = true;
      settings.hidden = true;
      status.textContent = 'Speech playback is not available in this browser. Every lesson step remains available to read below.';
      readerDescription.textContent = 'Written lesson available';
    }
    const englishVoice = () => {
      const voices = synthesis?.getVoices?.() ?? [];
      if (typeof window.chooseEnglishVoice === 'function') return window.chooseEnglishVoice(voices);
      const english = voices.filter((voice) => /^en(?:-|_)/i.test(voice.lang));
      return english.find((voice) => voice.localService) ?? english[0] ?? null;
    };
    const updateReader = (state) => {
      if (!state.supported) {
        controls.hidden = true;
        settings.hidden = true;
        readerDescription.textContent = 'Written lesson available';
        status.textContent = 'Speech playback is not available in this browser. Every lesson step remains available to read below.';
        return;
      }
      const labels = { speaking: 'Ⅱ Pause', paused: '▶ Resume', stopped: '▶ Play from here', finished: '▶ Read this lesson again', idle: '▶ Read this lesson' };
      play.textContent = labels[state.state] ?? labels.idle;
      play.setAttribute('aria-label', labels[state.state]?.replace(/^[▶Ⅱ]\s*/, '') + `: ${lesson.title}`);
      const ready = state.started;
      restart.disabled = !state.supported;
      stop.disabled = !state.supported || !['speaking', 'paused'].includes(state.state);
      previous.disabled = !state.supported || state.sectionIndex <= 0;
      next.disabled = !state.supported || state.sectionIndex >= state.total - 1;
      status.textContent = state.message || (state.state === 'speaking'
        ? `Reading: ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.`
        : state.state === 'paused'
          ? `Paused at ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.`
          : ready ? `Ready at ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.` : 'Ready when you are. The guide will not speak automatically.');
      readerSections.forEach((section, sectionIndex) => {
        const current = state.started && sectionIndex === state.sectionIndex;
        section.classList.toggle('is-current-reading', current);
        if (current) section.setAttribute('aria-current', 'location');
        else section.removeAttribute('aria-current');
        const marker = section.querySelector('[data-reader-marker]');
        if (marker) {
          marker.hidden = !current;
          marker.textContent = state.state === 'speaking' ? 'Now reading' : state.state === 'paused' ? 'Paused here' : 'Selected section';
        }
      });
    };
    reader = window.WagSignalsSectionReader.create({
      sections: speechSections,
      synthesis,
      Utterance: window.SpeechSynthesisUtterance,
      getVoice: englishVoice,
      getRate: () => rate.value,
      onUpdate: updateReader,
      unitLabel: 'lesson'
    });
    play.addEventListener('click', () => reader?.toggle());
    restart.addEventListener('click', () => reader?.restart());
    stop.addEventListener('click', () => reader?.stop());
    previous.addEventListener('click', () => reader?.previous());
    next.addEventListener('click', () => reader?.next());
    const voicesChanged = () => englishVoice();
    synthesis?.addEventListener?.('voiceschanged', voicesChanged);
    reader.removeVoiceListener = () => synthesis?.removeEventListener?.('voiceschanged', voicesChanged);
    title.focus({ preventScroll: true });
  };

  const destroyReader = () => {
    reader?.destroy();
    reader = null;
    document.dispatchEvent(new Event('wagsignals:stop-audio'));
  };
  const showLesson = (id, { focus = false } = {}) => {
    const lesson = byId.get(id);
    if (!lesson) return false;
    destroyReader();
    renderLesson(lesson);
    index.hidden = true;
    view.hidden = false;
    if (hero) hero.hidden = true;
    document.title = `${lesson.title} lesson — Dog training — WagSignals`;
    if (focus) content.querySelector('#lesson-title')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return true;
  };
  const showIndex = ({ restoreFocus = false } = {}) => {
    destroyReader();
    view.hidden = true;
    index.hidden = false;
    if (hero) hero.hidden = false;
    document.title = 'Dog training guide — WagSignals';
    window.scrollTo(0, 0);
    if (restoreFocus) (opener?.isConnected ? opener : index.querySelector('.training-start'))?.focus({ preventScroll: true });
  };

  index.addEventListener('click', (event) => {
    const link = event.target.closest('[data-open-lesson]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.dataset.openLesson;
    if (!byId.has(id)) return;
    event.preventDefault();
    opener = link;
    history.pushState({ fromTrainingIndex: true, lessonId: id }, '', link.href);
    showLesson(id, { focus: true });
  });
  view.querySelector('[data-back-to-training]')?.addEventListener('click', (event) => {
    event.preventDefault();
    destroyReader();
    if (history.state?.fromTrainingIndex) history.back();
    else {
      history.replaceState({}, '', location.pathname);
      showIndex({ restoreFocus: true });
    }
  });
  window.addEventListener('popstate', () => {
    const id = new URL(location.href).searchParams.get('lesson');
    if (id && showLesson(id)) return;
    showIndex({ restoreFocus: true });
  });
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) reader?.stop();
    else destroyReader();
  });
  document.addEventListener('wagsignals:stop-audio', () => reader?.stop());

  const initialLesson = new URL(location.href).searchParams.get('lesson');
  if (initialLesson && !showLesson(initialLesson)) {
    history.replaceState({}, '', location.pathname);
  }
})();
