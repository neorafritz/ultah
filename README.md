# Bluehour Birthday Story

A mobile-friendly, frontend-only birthday story template built with React and Vite. It uses six animated anime scenes, a bright blue palette, and a transparent PNG gift that opens a personal birthday letter when tapped.

## Personalize it

Edit `src/data/story.js` to replace `[Nama Pacarmu]`, `[Namamu]`, and `[Usia]`, and to change the Indonesian copy for each chapter. Replace the six WebP scene illustrations in `src/assets/story/` to create a different visual theme. The closed and open gift PNGs live in `src/assets/objects/`.

The gift image is the story's main interaction: tap or press Enter/Space on it to open the letter. Scroll, swipe, arrow keys, or the small chapter dots to move between scenes. Background illustrations and drifting petals animate continuously; reduced-motion preferences are respected.

## Run locally

Use Node.js 22 or 24.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The production files are written to `dist/` with a relative asset base, so the template can be served from a root domain or a subdirectory. All fonts and illustrations are bundled locally; the site needs no API keys, database, or external services.
