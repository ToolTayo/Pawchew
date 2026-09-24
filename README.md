# Pawchew / WagSignals

WagSignals is a static dog body-language guide. The root files are the maintainable source; `dist/` is the production build output used by Sites hosting.

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
