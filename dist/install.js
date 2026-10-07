(() => {
  const appWindow = window;
  const appDocument = document;
  const appNavigator = navigator;
  let deferredInstallPrompt = null;
  let installedByEvent = false;
  let promptInFlight = false;
  let initialized = false;
  const boundActions = new WeakSet();
  let helpDialog = null;
  let instructionList = null;
  let restoreFocusTo = null;
  let fallbackDialogOpen = false;

  function isStandalone() {
    if (installedByEvent || appNavigator.standalone === true) return true;
    if (typeof appWindow.matchMedia !== 'function') return false;
    return ['standalone', 'minimal-ui', 'fullscreen'].some((mode) => {
      try { return appWindow.matchMedia(`(display-mode: ${mode})`).matches; }
      catch { return false; }
    });
  }

  function updateInstallUi() {
    const installed = isStandalone();
    appDocument.documentElement?.classList.toggle('wagsignals-installed', installed);
    appDocument.querySelectorAll('[data-install-action]').forEach((action) => {
      action.hidden = installed;
      action.disabled = promptInFlight;
    });
    appDocument.querySelectorAll('[data-install-status]').forEach((status) => {
      status.hidden = !installed;
    });
  }

  function handleBeforeInstallPrompt(event) {
    event.preventDefault();
    if (isStandalone()) return;
    deferredInstallPrompt = typeof event.prompt === 'function' ? event : null;
    updateInstallUi();
  }

  function handleAppInstalled() {
    deferredInstallPrompt = null;
    installedByEvent = true;
    promptInFlight = false;
    updateInstallUi();
  }

  function getInstructions() {
    const userAgent = appNavigator.userAgent || '';
    const platform = appNavigator.userAgentData?.platform || appNavigator.platform || '';
    const ios = /iPhone|iPad|iPod/i.test(`${userAgent} ${platform}`)
      || (/Mac/i.test(platform) && Number(appNavigator.maxTouchPoints) > 1);
    const android = /Android/i.test(userAgent);
    if (ios) {
      return [
        'Open WagSignals in Safari, then tap Share → Add to Home Screen.',
        'If shown, turn on “Open as Web App,” then tap Add. If you started in another browser, use Safari for this install path.'
      ];
    }
    if (android && /SamsungBrowser/i.test(userAgent)) {
      return [
        'In Samsung Internet, open Menu and look for Add page to → Home screen; menu wording varies by version.',
        'That option may create a shortcut rather than a standalone app. If an Install app option is offered, choose it; otherwise try Chrome’s Install app option.'
      ];
    }
    if (android && /EdgA|Edge\//i.test(userAgent)) {
      return [
        'Open the browser menu and look for Install app or Add to Home screen.',
        'Choose Install if offered. Some Android browsers can add only a shortcut, which may open in a browser tab.'
      ];
    }
    if (android && /Chrome\//i.test(userAgent)) {
      return [
        'In Chrome, tap ⋮ → Install app (or Install and create shortcut) → Install.',
        'Choose Install, not Create shortcut, when both choices are shown.'
      ];
    }
    if (/Edg\//i.test(userAgent)) {
      return [
        'In Microsoft Edge, use the install icon near the address bar, or Menu → Apps → Install this site as an app.',
        'Follow Edge’s confirmation to add WagSignals to your apps.'
      ];
    }
    if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
      return [
        'In Chrome, select the install icon at the end of the address bar, or open Menu → Install WagSignals (wording can vary).',
        'Follow the browser’s confirmation to add WagSignals as an app.'
      ];
    }
    if (android) {
      return [
        'Open your browser menu and look for Install app or Add to Home screen.',
        'If only Create shortcut or Bookmark is offered, this browser may not support a standalone WagSignals app.'
      ];
    }
    return [
      'Open your browser menu and look for Install app or Add to Home Screen.',
      'Availability varies: some browsers create only a bookmark or shortcut and do not support standalone web-app installation.'
    ];
  }

  function restoreFocus() {
    appDocument.body.classList.remove('install-help-open');
    fallbackDialogOpen = false;
    const target = restoreFocusTo;
    restoreFocusTo = null;
    if (target?.isConnected && !target.hidden && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  function closeHelp() {
    if (!helpDialog) return;
    if (fallbackDialogOpen) {
      helpDialog.removeAttribute('open');
      helpDialog.classList.remove('install-dialog-fallback');
      restoreFocus();
      return;
    }
    if (typeof helpDialog.close === 'function' && helpDialog.open) helpDialog.close();
  }

  function buildHelpDialog() {
    const dialog = appDocument.createElement('dialog');
    dialog.className = 'install-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'install-help-title');
    dialog.setAttribute('aria-describedby', 'install-help-intro install-help-note');

    const panel = appDocument.createElement('div');
    panel.className = 'install-dialog-panel';
    const heading = appDocument.createElement('h2');
    heading.id = 'install-help-title';
    heading.textContent = 'Install WagSignals';
    const intro = appDocument.createElement('p');
    intro.id = 'install-help-intro';
    intro.textContent = 'Use your browser’s own install option. Labels and availability vary by browser and device.';
    const list = appDocument.createElement('ol');
    list.className = 'install-help-steps';
    list.setAttribute('data-install-help-list', '');
    const note = appDocument.createElement('p');
    note.id = 'install-help-note';
    note.className = 'install-help-note';
    note.textContent = 'Some browsers offer only a shortcut or bookmark; WagSignals cannot force standalone installation.';
    const close = appDocument.createElement('button');
    close.className = 'button install-dialog-close';
    close.type = 'button';
    close.textContent = 'Close';
    close.setAttribute('aria-label', 'Close install instructions');
    panel.append(heading, intro, list, note, close);
    dialog.append(panel);
    appDocument.body.append(dialog);
    instructionList = list;
    close.addEventListener('click', closeHelp);
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeHelp();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeHelp();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeHelp();
        return;
      }
      if (event.key !== 'Tab' || !fallbackDialogOpen) return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && appDocument.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && appDocument.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    return dialog;
  }

  function showHelp(trigger) {
    if (isStandalone()) return;
    if (!helpDialog) helpDialog = buildHelpDialog();
    restoreFocusTo = trigger?.isConnected ? trigger : appDocument.activeElement;
    instructionList.textContent = '';
    for (const instruction of getInstructions()) {
      const item = appDocument.createElement('li');
      item.textContent = instruction;
      instructionList.append(item);
    }
    if (typeof helpDialog.showModal === 'function') {
      try { helpDialog.showModal(); }
      catch { helpDialog.setAttribute('open', ''); helpDialog.classList.add('install-dialog-fallback'); fallbackDialogOpen = true; appDocument.body.classList.add('install-help-open'); }
    } else {
      helpDialog.setAttribute('open', '');
      helpDialog.classList.add('install-dialog-fallback');
      fallbackDialogOpen = true;
      appDocument.body.classList.add('install-help-open');
    }
    helpDialog.querySelector('button')?.focus();
  }

  function announceInstallOutcome(action, message) {
    const entry = action.closest?.('[data-install-entry]') || action.parentElement;
    const feedback = entry?.querySelector('[data-install-feedback]');
    if (feedback) {
      feedback.textContent = message;
      feedback.hidden = false;
    }
  }

  async function activateInstall(event) {
    const action = event.currentTarget;
    if (isStandalone()) return;
    if (!deferredInstallPrompt || promptInFlight) {
      showHelp(action);
      return;
    }
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    promptInFlight = true;
    updateInstallUi();
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === 'accepted') {
        announceInstallOutcome(action, 'Install accepted. Follow any remaining browser steps.');
      } else if (choice?.outcome === 'dismissed') {
        announceInstallOutcome(action, 'Install prompt dismissed. Select Install WagSignals for manual setup steps.');
      }
    } catch {
      announceInstallOutcome(action, 'The browser prompt is unavailable. Showing manual install steps.');
      showHelp(action);
    } finally {
      promptInFlight = false;
      updateInstallUi();
    }
  }

  function addMobileEntry(container) {
    const wrapper = appDocument.createElement('div');
    wrapper.className = 'mobile-install-entry';
    wrapper.setAttribute('data-install-entry', '');
    const action = appDocument.createElement('button');
    action.type = 'button';
    action.className = 'mobile-more-link install-action mobile-install-action';
    action.setAttribute('data-install-action', '');
    action.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 14v5h14v-5"/></svg><span>Install WagSignals</span>';
    const status = appDocument.createElement('span');
    status.className = 'install-status mobile-install-status';
    status.setAttribute('data-install-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Installed';
    status.hidden = true;
    const feedback = appDocument.createElement('span');
    feedback.className = 'sr-only';
    feedback.setAttribute('data-install-feedback', '');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.hidden = true;
    wrapper.append(action, status, feedback);
    container.append(wrapper);
    return wrapper;
  }

  function init() {
    appDocument.querySelectorAll('[data-install-action]').forEach((action) => {
      if (boundActions.has(action)) return;
      action.addEventListener('click', activateInstall);
      boundActions.add(action);
    });
    if (!initialized) {
      const displayModes = ['standalone', 'minimal-ui', 'fullscreen'];
      if (typeof appWindow.matchMedia === 'function') {
        for (const mode of displayModes) {
          try {
            const query = appWindow.matchMedia(`(display-mode: ${mode})`);
            if (query.addEventListener) query.addEventListener('change', updateInstallUi);
            else query.addListener?.(updateInstallUi);
          } catch { /* Display-mode detection is an optional enhancement. */ }
        }
      }
      appWindow.addEventListener('pageshow', updateInstallUi);
      appWindow.addEventListener('resize', updateInstallUi, { passive: true });
      appWindow.addEventListener('orientationchange', updateInstallUi, { passive: true });
      appDocument.addEventListener('visibilitychange', updateInstallUi);
      initialized = true;
    }
    updateInstallUi();
  }

  appWindow.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  appWindow.addEventListener('appinstalled', handleAppInstalled);
  if (isStandalone()) appDocument.documentElement?.classList.add('wagsignals-installed');
  appWindow.WagSignalsInstall = Object.freeze({ init, addMobileEntry, isStandalone, getInstructions });
  init();
})();
