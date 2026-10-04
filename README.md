# Pawchew / WagSignals

WagSignals is a static dog body-language guide. The root files are the maintainable source; `dist/` is the production build output used by Sites hosting. The guide is split into focused pages so people can learn body language, behaviors, training, and safety without one long scroll.

## Pages

- `index.html` — short home page and guide picker
- `daily.html` — date-rotating daily lesson with local progress
- `quiz.html` — 20-question whole-dog quiz with a local best score
- `signals.html` — interactive whole-dog body-language reader
- `behaviors.html` — illustrated everyday behavior guide
- `training.html` — illustrated lesson index and 12 focused, progressive training guides
- `challenges.html` — concise index plus eight deep-linkable, structured behavior challenge guides
- `body-map.html` — whole-body checklist and safety steps
- `saved.html` — local shelf for Daily Wag clues
- `scenarios.html` — searchable real-life situations and next steps
- `cheat-sheet.html` — print-friendly whole-dog reminder
- `sources-safety.html` — safety boundaries and reputable further reading

Shared styling lives in `styles.css`; the signal reader interaction lives in `signals.js`; training content and navigation live in `training-data.js` and `training.js`; challenge guidance lives in `challenge-data.js` and `challenges.js`. Both guided sections use the same optional speech controller in `guided-reader.js`. Image provenance is documented in `ASSET-LICENSES.md`.

`app.js` powers the Daily Wag, quiz, local pawprint progress, streak, saved clue shelf, scenario search, quiz sharing, responsive navigation, topic jump menus, and personal guide check-ins. Check-ins are not sent to the site owner. Progress stays in browser storage; there is no account or feedback backend. Optional browser speech may use an online voice service depending on the device. Challenge guides begin with visible, case-specific safety advice and connect to existing body-language clues, lessons, scenarios, behaviors, and Sources & safety. Direct routes use `?guide=<id>#guide`; no challenge-completion or duplicate reward system was added.

The body-language library presents eight clues per page, with search and category filtering across all 40. A native dialog opens each clue immediately, supports Escape, restores focus, and accepts existing `?signal=` links. Every clue and safety explanation remains available.

Original illustrations with retained source JPEGs are delivered in production as resized WebP files. The two new training scenes are original 768px WebP assets directly; together they add about 203 KB. The production build excludes retained source JPEGs, keeping the optimized image set local and avoiding hotlinked or third-party artwork.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development server serves the project root, so the homepage is available immediately without navigating into `dist/`.

## Checks and production build

```bash
npm run check
npm test
npm run build
npm run preview
npm run smoke
```

`npm run preview` serves the built `dist/` directory at [http://localhost:4173](http://localhost:4173). After it starts, `npm run smoke` verifies that this local preview serves the exact current build, every local asset resolves, and the artifact remains no-index by default. If the configured preview port is already in use, choose any available port and pass its matching local origin to the smoke command:

```powershell
npm run preview -- --port <port>
npm run smoke -- http://127.0.0.1:<port>
```

The production build fingerprints CSS and JavaScript URLs automatically to prevent stale cached interfaces. No runtime dependencies or service worker were added. `npm test` exercises progress normalization, expired streaks, unique awards, content counts, persistence, contrast, and the shared reader’s play/pause/resume/stop/restart, section changes, automatic continuation, and stale-speech cancellation without touching browser data. It also checks all eight challenge guides, safety content, and internal cross-links.

## Public release metadata

Builds are private/no-index by default so a temporary preview cannot be mistaken for the final public website. When the permanent public domain is known, build the release artifact with the final HTTPS origin:

```powershell
$env:PUBLIC_SITE_ORIGIN = 'https://your-final-domain.example'
$env:PUBLIC_SITE_INDEXABLE = 'true'
npm run build
```

That build adds canonical URLs, WagSignals Open Graph/Twitter preview metadata using the original local hero artwork, an indexable `robots.txt`, and a sitemap for the final origin. Do not set `PUBLIC_SITE_INDEXABLE=true` for a private preview.
