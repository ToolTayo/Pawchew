# Pawchew / WagSignals

WagSignals is a static dog body-language guide. The root files are the maintainable source; `dist/` is the production build output used by Sites hosting. The guide is split into focused pages so people can learn body language, behaviors, training, and safety without one long scroll.

## Pages

- `index.html` — short home page and guide picker
- `signals.html` — interactive whole-dog body-language reader
- `behaviors.html` — illustrated everyday behavior guide
- `training.html` — illustrated reward-based training guide
- `body-map.html` — whole-body checklist and safety steps

Shared styling lives in `styles.css`; the signal reader interaction lives in `signals.js`. Image provenance is documented in `ASSET-LICENSES.md`.

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
