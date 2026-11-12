# 01wire-redesign

Visual redesign of the 01Wire dashboard (client + admin), driven by [`DESIGN.md`](DESIGN.md).

**Look:** ink on warm newsprint. Cream canvas, warm near-black text, hairline rules, 4px corners, mono labels, no gradients, and one 01Wire red (`#e10600`) reserved for links, focus and the active nav item. Primary buttons are Ink.

## What changed so far (phase 1: theme + shell)

| Area | Change |
|------|--------|
| Design tokens | New `src/assets/theme/tokens.ts`, the single source for colour, type, radius, elevation and motion |
| MUI theme | Palette, typography (Inter 400/500 + JetBrains Mono), 4px radius, hairline elevation, flat "gradients" |
| Buttons | Ink primary, neutral outlined secondary, sentence case, 150ms named transitions, `scale(0.96)` press |
| Sidebar | Ink rail with a red active marker instead of a filled pink pill |
| Top bar | Hairline rule instead of a drop shadow; credits chip with mono label; red admin badge |
| Tables | Mono eyebrow column headers on a sunken row, ink body text, hairline rules, tabular numbers |
| Inputs | Paper fill, Stone border, ink focus border + soft red focus ring |
| Sign-in | Paper panel with hairline, ink CTA, red text link, 01Wire tagline |
| Pages | Page-level `INK` / `MUTED` / `BRAND` constants now read from tokens |

Commit 1 after the initial commit is the untouched baseline; everything after it is the redesign, so the diff between the baseline commit and `main` shows exactly what changed.

## Demo mode (live review without a backend)

This repo runs in **demo mode**: the app uses generated sample data (clients, press releases, outlets, orders) shaped by the real backend schema, and never contacts any server. A bar at the bottom switches between **Client view**, **Admin view** and the **Sign-in page**. Saves show "Demo mode: changes aren't saved"; uploads are blocked.

To share it live: import this repo into Vercel as a new project (framework: Create React App, no environment variables needed) and send the project's `.vercel.app` link.

Demo mode never switches on at the live 01Wire addresses (`01wire-frontend.vercel.app`, `dashboard.01wire.com`, `app.01wire.com`). The code is in `src/demo/`.

## Run locally

```bash
npm install
cp .env.example .env   # set REACT_APP_GRAPHQL_SERVER_URL and REACT_APP_IMAGE_BASE_URL
npm start
```

## Next phases
1. Page-by-page pass on the 42 files that still hard-code template colours (`#344767`, `#7B809A`, `#EE5C61`…), starting with Dashboard, Marketplace, PR Orders and Overview.
2. Status chips unified on the DESIGN.md status palette.
3. Before/after screenshots at 390px and 1440px for every page.
