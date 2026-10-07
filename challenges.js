/* Deep-linkable challenge guides with the shared WagSignals section reader. */
(() => {
  const guides = window.WagSignalsChallengeGuides ?? [];
  const byId = new Map(guides.map((guide) => [guide.id, guide]));
  const index = document.querySelector('#challenge-index');
  const view = document.querySelector('#guide');
  const content = document.querySelector('#challenge-guide-content');
  if (!index || !view || !content) return;

  let reader = null;
  let opener = null;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const addParagraphs = (parent, values) => values.forEach((value) => parent.append(make('p', '', value)));
  const addList = (parent, values, className = 'lesson-bullets') => {
    const list = make('ul', className);
    values.forEach((value) => list.append(make('li', '', value)));
    parent.append(list);
  };
  const addSection = (parent, label, heading, className = '') => {
    const section = make('section', `lesson-section ${className}`.trim());
    section.dataset.readerSection = '';
    section.dataset.readerLabel = label;
    section.dataset.readerMarker = '';
    const title = make('h2', 'lesson-section-title', heading);
    const marker = make('span', 'lesson-reading-marker', 'Current section');
    marker.hidden = true;
    title.append(' ', marker);
    section.append(title);
    parent.append(section);
    return section;
  };
  const addLinkList = (parent, items, className = 'challenge-link-list') => {
    const list = make('ul', className);
    items.forEach((item) => {
      const row = make('li', 'challenge-link-item');
      const link = make('a', '', item.label);
      link.href = item.href;
      if (/^https:\/\//i.test(item.href)) {
        link.target = '_blank';
        link.rel = 'noreferrer';
      }
      row.append(link);
      if (item.detail) row.append(make('span', '', item.detail));
      list.append(row);
    });
    parent.append(list);
  };

  const buildReader = (guide) => {
    const readerPanel = make('section', 'lesson-reader challenge-reader');
    readerPanel.setAttribute('aria-label', 'Optional spoken challenge guide controls');
    readerPanel.append(make('h2', '', 'Read to me, section by section'));
    const description = make('p', 'reader-description', 'Speech starts only when you choose it. The urgent advice stays visible above. Some device voices use an online speech service.');
    const controls = make('div', 'lesson-reader-controls');
    const play = make('button', 'button', '▶ Read this guide');
    play.type = 'button';
    const previous = make('button', 'button secondary', '← Previous section');
    previous.type = 'button';
    const next = make('button', 'button secondary', 'Next section →');
    next.type = 'button';
    const restart = make('button', 'button secondary', 'Restart');
    restart.type = 'button';
    restart.disabled = true;
    const stop = make('button', 'button secondary', 'Stop');
    stop.type = 'button';
    stop.disabled = true;
    const settings = make('details', 'lesson-reader-settings');
    settings.append(make('summary', '', 'Voice speed'));
    const rateLabel = make('label', '', 'Reading pace');
    const rate = make('select', '');
    rate.setAttribute('aria-label', 'Reading pace');
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
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    readerPanel.append(description, controls, status);
    content.append(readerPanel);

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
      description.textContent = 'Speech playback is not available in this browser. The complete written guide remains available below.';
      status.textContent = 'Written guide available';
    }
    const englishVoice = () => {
      const voices = synthesis?.getVoices?.() ?? [];
      if (typeof window.chooseEnglishVoice === 'function') return window.chooseEnglishVoice(voices);
      const english = voices.filter((voice) => /^en(?:-|_)/i.test(voice.lang));
      return english.find((voice) => voice.localService) ?? english[0] ?? null;
    };
    const updateReader = (state) => {
      if (!state.supported) return;
      const labels = { speaking: 'Ⅱ Pause', paused: '▶ Resume', stopped: '▶ Play from here', finished: '▶ Read this guide again', idle: '▶ Read this guide' };
      play.textContent = labels[state.state] ?? labels.idle;
      play.setAttribute('aria-label', `${labels[state.state]?.replace(/^[▶Ⅱ]\s*/, '') ?? 'Read this guide'}: ${guide.title}`);
      restart.disabled = false;
      stop.disabled = !['speaking', 'paused'].includes(state.state);
      previous.disabled = state.sectionIndex <= 0;
      next.disabled = state.sectionIndex >= state.total - 1;
      status.textContent = state.message || (state.state === 'speaking'
        ? `Reading: ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.`
        : state.state === 'paused'
          ? `Paused at ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.`
          : state.started ? `Ready at ${state.sectionLabel} · section ${state.sectionIndex + 1} of ${state.total}.` : 'Ready when you are. The guide will not speak automatically.');
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
    if (!window.WagSignalsSectionReader?.create) {
      controls.hidden = true;
      settings.hidden = true;
      description.textContent = 'The written guide remains available. Speech controls could not be loaded.';
      status.textContent = 'Written guide available';
      return readerPanel;
    }
    reader = window.WagSignalsSectionReader.create({
      sections: speechSections,
      synthesis,
      Utterance: window.SpeechSynthesisUtterance,
      getVoice: englishVoice,
      getRate: () => rate.value,
      onUpdate: updateReader,
      unitLabel: 'guide'
    });
    play.addEventListener('click', () => reader?.toggle());
    restart.addEventListener('click', () => reader?.restart());
    stop.addEventListener('click', () => reader?.stop());
    previous.addEventListener('click', () => reader?.previous());
    next.addEventListener('click', () => reader?.next());
    const voicesChanged = () => englishVoice();
    synthesis?.addEventListener?.('voiceschanged', voicesChanged);
    reader.removeVoiceListener = () => synthesis?.removeEventListener?.('voiceschanged', voicesChanged);
    return readerPanel;
  };

  const destroyReader = () => {
    reader?.destroy();
    reader = null;
    document.dispatchEvent(new Event('wagsignals:stop-audio'));
  };
  const renderGuide = (guide) => {
    content.replaceChildren();
    const intro = make('header', 'lesson-intro lesson-reader-section');
    intro.dataset.readerSection = '';
    intro.dataset.readerLabel = 'Overview';
    const artwork = make('img', 'lesson-art');
    artwork.src = guide.image;
    artwork.alt = guide.alt;
    artwork.width = 768;
    artwork.height = 768;
    artwork.loading = 'eager';
    artwork.decoding = 'async';
    const copy = make('div', 'lesson-intro-copy');
    copy.append(make('span', 'eyebrow', `${guide.order} · ${guide.category}`));
    const title = make('h1', '', guide.title);
    title.id = 'challenge-guide-title';
    title.tabIndex = -1;
    copy.append(title, make('p', 'lesson-lead', guide.summary));
    intro.append(artwork, copy);
    content.append(intro);

    const rightNow = addSection(content, 'Right now', 'What to do right now', 'lesson-safety challenge-right-now');
    rightNow.append(make('p', '', guide.rightNow));
    const why = addSection(content, 'What may be going on', 'What may be going on');
    addList(why, guide.why);
    const manage = addSection(content, 'Manage the situation', 'Manage the situation');
    addList(manage, guide.manage);
    if (guide.practice?.length) {
      const practice = addSection(content, 'Training plan', 'Training plan');
      addList(practice, guide.practice);
    }
    const watch = addSection(content, 'Watch the dog', 'Watch the whole dog');
    const watchIntro = make('p', '', 'These clues add context; no single signal diagnoses a feeling or predicts what a dog will do.');
    watch.append(watchIntro);
    addLinkList(watch, guide.watch.map((item) => ({ label: `Read: ${item.label}`, href: `./signals.html?signal=${encodeURIComponent(item.id)}`, detail: item.note })));
    const avoid = addSection(content, 'What to avoid', 'Avoid these responses');
    addList(avoid, guide.avoid);
    const progress = addSection(content, 'Signs of progress', 'Signs of progress');
    addList(progress, guide.progress);
    const help = addSection(content, 'Get help when', 'When to get help', 'challenge-help');
    addList(help, guide.help);
    const next = addSection(content, 'Next step', 'A useful next step');
    addLinkList(next, guide.next);
    const sources = addSection(content, 'Sources & safety', 'Sources & safety', 'lesson-sources');
    const sourceNotice = make('p', '', 'References support the safety guidance above; they are not endorsements or a claim of professional review.');
    sources.append(sourceNotice);
    addLinkList(sources, guide.sources, 'lesson-bullets challenge-source-list');
    const sourcePage = make('a', 'text-link', 'View all Sources & safety guidance →');
    sourcePage.href = './sources-safety.html';
    sources.append(sourcePage);

    view.setAttribute('aria-labelledby', title.id);
    const readerPanel = buildReader(guide);
    content.insertBefore(readerPanel, why);
  };

  const showGuide = (id, { focus = false } = {}) => {
    const guide = byId.get(id);
    if (!guide) return false;
    destroyReader();
    renderGuide(guide);
    index.hidden = true;
    view.hidden = false;
    document.title = `${guide.title} — Dog behavior challenges — WagSignals`;
    if (focus) view.querySelector('#challenge-guide-title')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return true;
  };
  const showIndex = ({ restoreFocus = false } = {}) => {
    destroyReader();
    content.replaceChildren();
    view.hidden = true;
    index.hidden = false;
    document.title = 'Dog behavior challenges & solutions — WagSignals';
    window.scrollTo(0, 0);
    if (restoreFocus) (opener?.isConnected ? opener : index.querySelector('.challenge-open'))?.focus({ preventScroll: true });
  };

  index.addEventListener('click', (event) => {
    const link = event.target.closest('[data-open-guide]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.dataset.openGuide;
    if (!byId.has(id)) return;
    event.preventDefault();
    opener = link;
    history.pushState({ fromChallengeIndex: true, guideId: id }, '', link.href);
    showGuide(id, { focus: true });
  });
  view.querySelector('[data-back-to-challenges]')?.addEventListener('click', (event) => {
    event.preventDefault();
    destroyReader();
    if (history.state?.fromChallengeIndex) history.back();
    else {
      history.replaceState({}, '', location.pathname);
      showIndex({ restoreFocus: true });
    }
  });
  view.addEventListener('click', (event) => {
    if (event.target.closest('a')) destroyReader();
  });
  window.addEventListener('popstate', () => {
    const id = new URL(location.href).searchParams.get('guide');
    if (id && showGuide(id)) return;
    if (id) history.replaceState(history.state, '', location.pathname);
    showIndex({ restoreFocus: true });
  });
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) reader?.stop();
    else destroyReader();
  });
  document.addEventListener('wagsignals:stop-audio', () => reader?.stop());

  const initialGuide = new URL(location.href).searchParams.get('guide');
  if (initialGuide && !showGuide(initialGuide)) {
    history.replaceState(history.state, '', location.pathname);
  }
})();
