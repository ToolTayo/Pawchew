/* Shared, user-initiated section reader for WagSignals learning guides. */
function splitGuidedSpeech(text) {
  const words = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ');
  const chunks = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 220 && current) {
      chunks.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) chunks.push(current);
  return chunks;
}

function createSectionReader({ sections, synthesis, Utterance, getVoice, getRate = () => 0.98, onUpdate = () => {}, unitLabel = 'guide' }) {
  const safeSections = Array.isArray(sections) ? sections.filter((section) => section && typeof section.text === 'string') : [];
  const supported = Boolean(synthesis && typeof synthesis.speak === 'function' && typeof Utterance === 'function');
  let sectionIndex = 0;
  let chunkIndex = 0;
  let chunks = [];
  let runId = 0;
  let state = 'idle';
  let started = false;
  const noun = String(unitLabel || 'guide');

  const sectionLabel = () => safeSections[sectionIndex]?.label ?? noun;
  const notify = (message = '') => onUpdate({ supported, state, started, sectionIndex, total: safeSections.length, sectionLabel: sectionLabel(), message });
  const cancel = () => {
    runId += 1;
    if (supported) synthesis.cancel();
  };
  const speakCurrentChunk = (id) => {
    if (id !== runId || state !== 'speaking') return;
    if (chunkIndex >= chunks.length) {
      if (sectionIndex < safeSections.length - 1) {
        sectionIndex += 1;
        chunkIndex = 0;
        chunks = splitGuidedSpeech(safeSections[sectionIndex].text);
        notify(`Reading: ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
        speakCurrentChunk(id);
      } else {
        state = 'finished';
        notify(`${noun[0].toUpperCase()}${noun.slice(1)} finished. You can restart or choose a section to hear again.`);
      }
      return;
    }

    const utterance = new Utterance(chunks[chunkIndex]);
    const voice = getVoice?.();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else utterance.lang = 'en-US';
    utterance.rate = Number(getRate()) || 0.98;
    utterance.pitch = 1;
    utterance.volume = 0.95;
    utterance.onend = () => {
      if (id !== runId || state !== 'speaking') return;
      chunkIndex += 1;
      speakCurrentChunk(id);
    };
    utterance.onerror = () => {
      if (id !== runId) return;
      state = 'stopped';
      notify('Speech stopped unexpectedly. You can try Play again or continue with the written guide.');
    };
    synthesis.speak(utterance);
  };
  const playAt = (index) => {
    if (!supported || !safeSections.length) return;
    cancel();
    sectionIndex = Math.max(0, Math.min(index, safeSections.length - 1));
    chunkIndex = 0;
    chunks = splitGuidedSpeech(safeSections[sectionIndex].text);
    state = 'speaking';
    started = true;
    notify(`Reading: ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
    speakCurrentChunk(runId);
  };
  const stop = (message = 'Reading stopped. Play resumes from this section; Restart begins at the overview.') => {
    cancel();
    state = 'stopped';
    started = true;
    notify(message);
  };
  const setSection = (index) => {
    if (!safeSections.length) return;
    const bounded = Math.max(0, Math.min(index, safeSections.length - 1));
    if (bounded === sectionIndex) return;
    const wasSpeaking = state === 'speaking';
    const wasPaused = state === 'paused';
    if (wasSpeaking || wasPaused) {
      playAt(bounded);
      if (wasPaused) {
        try {
          synthesis.pause();
          state = 'paused';
          notify(`Paused at ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
        } catch {
          state = 'speaking';
          notify(`Reading: ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
        }
      }
      return;
    }
    sectionIndex = bounded;
    started = true;
    notify(`Selected: ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
  };

  notify();
  return {
    removeVoiceListener: null,
    getState: () => ({ supported, state, started, sectionIndex, total: safeSections.length, sectionLabel: sectionLabel() }),
    toggle() {
      if (!supported || !safeSections.length) return;
      if (state === 'speaking') {
        try {
          synthesis.pause();
          state = 'paused';
          notify(`Paused at ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
        } catch {
          notify('This browser could not pause speech. You can stop playback or keep reading.');
        }
      } else if (state === 'paused') {
        try {
          synthesis.resume();
          state = 'speaking';
          notify(`Reading: ${sectionLabel()} · section ${sectionIndex + 1} of ${safeSections.length}.`);
        } catch {
          state = 'stopped';
          notify('This browser could not resume speech. Press Play to try again.');
        }
      } else if (state === 'finished') playAt(0);
      else playAt(sectionIndex);
    },
    stop,
    restart() { playAt(0); },
    previous() { setSection(sectionIndex - 1); },
    next() { setSection(sectionIndex + 1); },
    destroy() {
      this.removeVoiceListener?.();
      this.removeVoiceListener = null;
      cancel();
    }
  };
}

window.WagSignalsSectionReader = { create: createSectionReader, split: splitGuidedSpeech };
window.WagSignalsSectionReaderTestHooks = { createSectionReader, splitGuidedSpeech };
