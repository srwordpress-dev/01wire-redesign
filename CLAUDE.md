# 01Wire Dashboard — redesign

Always follow DESIGN.md.

- Colours, fonts, radius, shadows and motion come from `src/assets/theme/tokens.ts`. Never add a new hex value in a component; import from the tokens file (or use the MUI theme, which is built from it).
- Primary actions are Ink (`color="primary"`). 01Wire red (`palette.brand`) is for links, focus, the active nav item and things that need attention — never a large fill.
- `color="secondary"` is the neutral style (Cancel / Close / muted text).
- `variant="gradient"` renders flat by design; don't reintroduce gradients or coloured shadows.
- Weights 400/500 only. Mono eyebrow (`eyebrow` from tokens) for labels, column headers, IDs and dates.
- Keep existing copy, routes, GraphQL queries and behaviour unchanged unless asked; this repo is a visual redesign.
- Check every change at 390px and 1440px. Run `npx tsc --noEmit` and `npm run build` before committing.
