# Pawchew / WagSignals

WagSignals is a static dog body-language guide. The root files are the maintainable source; `dist/` is the production build output used by Sites hosting. The guide is split into focused pages so people can learn body language, behaviors, training, and safety without one long scroll.

## Pages

- `index.html` — short home page and guide picker
- `daily.html` — date-rotating daily lesson with local progress
- `quiz.html` — six-question whole-dog quiz with a local best score
- `signals.html` — interactive whole-dog body-language reader
- `behaviors.html` — illustrated everyday behavior guide
- `training.html` — illustrated reward-based training guide
- `challenges.html` — challenging behaviors with safer solutions
- `body-map.html` — whole-body checklist and safety steps
- `saved.html` — local shelf for Daily Wag clues
- `scenarios.html` — searchable real-life situations and next steps
- `cheat-sheet.html` — print-friendly whole-dog reminder
- `sources-safety.html` — safety boundaries and reputable further reading

Shared styling lives in `styles.css`; the signal reader interaction lives in `signals.js`. Image provenance is documented in `ASSET-LICENSES.md`.

`app.js` powers the Daily Wag, quiz, local pawprint progress, streak, saved clue shelf, scenario search, quiz sharing, and device-local guide feedback. No account or feedback backend is required; nothing is sent off-device.

The original illustrations are retained as source JPEGs and delivered in production as resized WebP files. The production build excludes the source JPEGs, keeping the optimized image set local and avoiding hotlinked or third-party artwork.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development server serves the project root, so the homepage is available immediately without navigating into `dist/`.

## Checks and production build

```bash
npm run check
npm run build
npm run preview
```

`npm run preview` serves the built `dist/` directory at [http://localhost:4173](http://localhost:4173).

## Public release metadata

Builds are private/no-index by default so a temporary preview cannot be mistaken for the final public website. When the permanent public domain is known, build the release artifact with the final HTTPS origin:

```powershell
$env:PUBLIC_SITE_ORIGIN = 'https://your-final-domain.example'
$env:PUBLIC_SITE_INDEXABLE = 'true'
npm run build
```

That build adds canonical URLs, Open Graph URLs, an indexable `robots.txt`, and a sitemap for the final origin. Do not set `PUBLIC_SITE_INDEXABLE=true` for a private preview.
