import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../install.js', import.meta.url), 'utf8');

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toLowerCase();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = [];
    this.parentElement = null;
    this.hidden = false;
    this.disabled = false;
    this.open = false;
    this.isConnected = false;
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      remove: (...names) => names.forEach((name) => this.classes.delete(name)),
      contains: (name) => this.classes.has(name),
      toggle: (name, force) => {
        const shouldAdd = force ?? !this.classes.has(name);
        if (shouldAdd) this.classes.add(name); else this.classes.delete(name);
        return shouldAdd;
      }
    };
    this._textContent = '';
  }
  set textContent(value) { this._textContent = String(value); this.children = []; }
  get textContent() { return [this._textContent, ...this.children.map((child) => child.textContent)].filter(Boolean).join(' '); }
  set innerHTML(value) { this._textContent = String(value); }
  setAttribute(name, value = '') { this.attributes.set(name, String(value)); if (name === 'open') this.open = true; }
  removeAttribute(name) { this.attributes.delete(name); if (name === 'open') this.open = false; }
  hasAttribute(name) { return this.attributes.has(name); }
  append(...nodes) {
    for (const node of nodes) {
      node.parentElement = this;
      const setConnected = (item, connected) => {
        item.isConnected = connected;
        item.children.forEach((child) => setConnected(child, connected));
      };
      setConnected(node, this.isConnected);
      this.children.push(node);
    }
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  async dispatch(type, overrides = {}) {
    const event = { type, target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...overrides };
    await Promise.all((this.listeners.get(type) || []).map((listener) => listener(event)));
    return event;
  }
  async click() { return this.dispatch('click'); }
  focus() { this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; }
  close() {
    this.open = false;
    for (const listener of this.listeners.get('close') || []) listener({ type: 'close', target: this });
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (selector === '[data-install-entry]' && node.hasAttribute('data-install-entry')) return node;
      node = node.parentElement;
    }
    return null;
  }
  contains(target) { return this === target || this.children.some((child) => child.contains(target)); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const result = [];
    const matches = (child) => {
      if (selector === 'button') return child.tagName === 'button';
      if (selector === '[data-install-action]') return child.hasAttribute('data-install-action');
      if (selector === '[data-install-status]') return child.hasAttribute('data-install-status');
      if (selector === '[data-install-feedback]') return child.hasAttribute('data-install-feedback');
      if (selector === '[data-install-help-list]') return child.hasAttribute('data-install-help-list');
      if (selector.includes('button:not')) return child.tagName === 'button' && !child.disabled;
      return child.tagName === selector.toLowerCase();
    };
    const visit = (node) => {
      for (const child of node.children) {
        if (matches(child)) result.push(child);
        visit(child);
      }
    };
    visit(this);
    return result;
  }
}

function createHarness({ standalone = false, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0 Safari/537.36', platform = 'Win32', maxTouchPoints = 0 } = {}) {
  const windowListeners = new Map();
  const documentListeners = new Map();
  const doc = {
    activeElement: null,
    createElement(tagName) { return new FakeElement(tagName, doc); },
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(listener);
    },
    querySelectorAll(selector) { return root.querySelectorAll(selector); }
  };
  doc.documentElement = new FakeElement('html', doc);
  doc.documentElement.isConnected = true;
  doc.body = new FakeElement('body', doc);
  doc.documentElement.append(doc.body);
  const root = doc.documentElement;
  const entry = doc.createElement('div');
  entry.setAttribute('data-install-entry', '');
  const action = doc.createElement('button');
  action.type = 'button';
  action.setAttribute('data-install-action', '');
  const status = doc.createElement('span');
  status.setAttribute('data-install-status', '');
  status.hidden = true;
  const feedback = doc.createElement('span');
  feedback.setAttribute('data-install-feedback', '');
  feedback.hidden = true;
  entry.append(action, status, feedback);
  doc.body.append(entry);
  doc.activeElement = action;

  const win = {
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    dispatch(type, supplied = {}) {
      const event = { type, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...supplied };
      for (const listener of windowListeners.get(type) || []) listener(event);
      return event;
    },
    matchMedia() { return { matches: standalone, addEventListener() {}, addListener() {} }; }
  };
  const nav = { userAgent, platform, maxTouchPoints };
  vm.runInNewContext(source, { window: win, document: doc, navigator: nav, Object, Number });
  return { win, doc, nav, action, status, feedback, get dialog() { return doc.body.querySelector('dialog'); } };
}

// A beforeinstallprompt event can arrive before UI init; it is captured, not invoked.
const early = createHarness();
let earlyPromptCalls = 0;
const earlyEvent = early.win.dispatch('beforeinstallprompt', {
  prompt: async () => { earlyPromptCalls += 1; },
  userChoice: Promise.resolve({ outcome: 'accepted' })
});
assert.equal(earlyEvent.defaultPrevented, true, 'Suppress the browser automatic prompt so the visitor controls timing.');
assert.equal(earlyPromptCalls, 0, 'Never prompt automatically when the browser event fires.');
const mobileMenu = early.doc.createElement('div');
early.doc.body.append(mobileMenu);
early.win.WagSignalsInstall.addMobileEntry(mobileMenu);
early.win.WagSignalsInstall.init();
const earlyActions = early.doc.querySelectorAll('[data-install-action]');
assert.equal(earlyActions.length, 2, 'Desktop and mobile More each expose the persistent install action.');
assert.ok(earlyActions.every((item) => !item.hidden), 'Website-mode install entries remain visible.');
assert.equal(earlyPromptCalls, 0, 'Initialization must not call the native prompt.');
await earlyActions[0].click();
assert.equal(earlyPromptCalls, 1, 'The captured native prompt runs only after an explicit user click.');
assert.match(early.feedback.textContent, /accepted/i, 'Accepted outcome is handled without hiding the action prematurely.');
assert.equal(earlyActions[0].hidden, false, 'Accepting the prompt does not mark the app installed before appinstalled fires.');

// A prompt event can also arrive after UI init; dismissal leaves the action available.
const dismissed = createHarness();
dismissed.win.WagSignalsInstall.init();
let dismissedPromptCalls = 0;
dismissed.win.dispatch('beforeinstallprompt', {
  prompt: async () => { dismissedPromptCalls += 1; },
  userChoice: Promise.resolve({ outcome: 'dismissed' })
});
assert.equal(dismissedPromptCalls, 0, 'A late browser event must not auto-prompt.');
await dismissed.action.click();
assert.equal(dismissedPromptCalls, 1);
assert.equal(dismissed.action.hidden, false, 'Dismissal must not remove the persistent entry.');
assert.match(dismissed.feedback.textContent, /dismissed/i, 'Dismissal should be announced in a polite live region.');

// Unsupported browsers get accessible, platform-specific help and focus returns to the trigger.
const ios = createHarness({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1', platform: 'iPhone' });
ios.win.WagSignalsInstall.init();
await ios.action.click();
assert.ok(ios.dialog?.open, 'Without a native prompt, clicking the entry opens manual help.');
assert.equal(ios.dialog.attributes.get('role'), 'dialog');
assert.equal(ios.dialog.attributes.get('aria-modal'), 'true');
assert.equal(ios.dialog.attributes.get('aria-labelledby'), 'install-help-title');
assert.match(ios.dialog.attributes.get('aria-describedby'), /install-help-intro.*install-help-note/);
assert.equal(ios.dialog.querySelector('button').attributes.get('aria-label'), 'Close install instructions');
assert.match(ios.dialog.textContent, /Safari.*Share.*Add to Home Screen/i, 'iOS help should give the Safari home-screen steps.');
assert.equal(ios.doc.activeElement.tagName, 'button', 'Opening help moves keyboard focus into the dialog.');
await ios.dialog.querySelector('button').click();
assert.equal(ios.dialog.open, false);
assert.equal(ios.doc.activeElement, ios.action, 'Closing help restores focus to the trigger.');

const escapeHelp = createHarness();
escapeHelp.win.WagSignalsInstall.init();
await escapeHelp.action.click();
await escapeHelp.dialog.dispatch('keydown', { key: 'Escape' });
assert.equal(escapeHelp.dialog.open, false, 'Escape closes install help.');
assert.equal(escapeHelp.doc.activeElement, escapeHelp.action, 'Escape also restores focus to the action.');

const failedPrompt = createHarness();
failedPrompt.win.WagSignalsInstall.init();
failedPrompt.win.dispatch('beforeinstallprompt', {
  prompt: async () => { throw new Error('Browser prompt unavailable'); },
  userChoice: Promise.resolve({ outcome: 'dismissed' })
});
await failedPrompt.action.click();
assert.ok(failedPrompt.dialog?.open, 'A native prompt failure falls back to the manual help dialog.');

// Browser-specific fallbacks do not overpromise standalone installs.
const samsung = createHarness({ userAgent: 'Mozilla/5.0 (Linux; Android 14) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l' });
assert.match(samsung.win.WagSignalsInstall.getInstructions().join(' '), /Samsung Internet.*shortcut/i);
const edge = createHarness({ userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', platform: 'Win32' });
assert.match(edge.win.WagSignalsInstall.getInstructions().join(' '), /Microsoft Edge.*Apps/i);

// Already-installed modes replace actions with status; appinstalled and BFCache are rechecked.
const standalone = createHarness({ standalone: true });
standalone.win.WagSignalsInstall.init();
assert.equal(standalone.action.hidden, true, 'Standalone mode hides redundant install actions.');
assert.equal(standalone.status.hidden, false, 'Standalone mode shows an installed status.');
await standalone.action.click();
assert.equal(standalone.dialog, null, 'Standalone mode must not open install help.');
const installed = createHarness();
installed.win.WagSignalsInstall.init();
installed.win.dispatch('appinstalled');
assert.equal(installed.action.hidden, true, 'appinstalled removes the redundant install action.');
assert.equal(installed.status.hidden, false);
let restoredStandalone = false;
const restored = createHarness();
restored.win.matchMedia = (query) => ({ matches: restoredStandalone && query.includes('standalone'), addEventListener() {}, addListener() {} });
restored.win.WagSignalsInstall.init();
restoredStandalone = true;
restored.win.dispatch('pageshow', { persisted: true });
assert.equal(restored.action.hidden, true, 'BFCache restore refreshes standalone state.');
assert.equal(restored.status.hidden, false);

console.log('Passed persistent install entry, early/late native prompt, click-only prompt, fallback help, iOS/Samsung/Edge guidance, dismissal, installed mode, focus restoration, and BFCache tests.');
