# 01Wire Design System — Dashboard
> Ink on warm newsprint, one red wire.

**Theme:** light · **Applies to:** the 01Wire client dashboard and admin panel (this repo)

Adapted from a warm-parchment editorial reference (GradientDeck style file), re-branded for 01Wire: 01Wire red replaces the reference accent, proprietary fonts are replaced with free ones, and surfaces are tuned for dense data screens (tables, forms, orders). The code source of truth for every value below is `src/assets/theme/tokens.ts`; the MUI theme in `src/assets/theme/` is built from it.

01Wire sells placements in publications, so the dashboard should feel like a well-run newsroom desk: cream paper, warm ink, hairline rules, mono labels, and a single red signal that marks where you act or where something needs attention. Authority comes from restraint and alignment, not from bold weights, gradients or coloured shadows.

## Tokens — Colours

| Name | Value | Token | Role |
|------|-------|-------|------|
| Bone | `#f2f1ed` | `canvas` | App background behind cards and the sidebar |
| Paper | `#fbfbf8` | `surface` | Cards, tables, sidebar, dialogs, inputs. Warm near-white; never pure `#fff` |
| Parchment | `#f7f7f4` | `surfaceSunken` | Table header rows, hover rows, read-only fields, nested panels |
| Linen | `#e6e5e0` | `surfaceElevated` | Secondary filled buttons, chips, selected-but-neutral states |
| Stone | `#cdcdc9` | `outline` | Input borders, strong dividers |
| Rule | `#e4e3de` | `hairline` | 1px card borders, table row rules |
| Mist | `#a1a19f` | `textDisabled` | Placeholders, disabled text (not for content) |
| Ash | `#6b6a64` | `textMuted` | Secondary text, captions, table body meta, icons |
| Ink | `#26251e` | `ink` | Primary text, headings, **primary action buttons**, active nav |
| 01Wire Red | `#e10600` | `brand` | Links, active-nav marker, focus ring, key highlights. Text/marker colour, not a large fill |
| Red Soft | `#fdecea` | `brandSoft` | Background of red-tinted chips and the active-nav row |

### Status colours (dashboard addition)
Data screens need statuses; they stay earthy so they sit inside the warm palette.

| Name | Value | Soft bg | Use |
|------|-------|---------|-----|
| Forest | `#34785c` | `#e5efe9` | Success, published, paid |
| Amber | `#a86b1f` | `#f6ecdc` | Warning, pending, awaiting action |
| Wine | `#b3261e` | `#f8e4e2` | Error, rejected, destructive buttons |
| Slate | `#3d6480` | `#e3eaf0` | Info, in progress, neutral system notices |

## Tokens — Typography

| Family | Free font | Role |
|--------|-----------|------|
| Sans | **Inter** (`ss01`, `cv11`, `tnum` in tables) | All UI, headings, body |
| Mono | **JetBrains Mono** | Eyebrows, table column headers, IDs (PR #, order #), timestamps, status metadata |
| Serif | **EB Garamond** (optional) | Only for long editorial prose (press-release preview). Never UI labels |

- **Weights:** 400 and 500 only. Headings are 500 at small sizes, 400 at 26px+. Never 600/700.
- **Tracking tightens as size grows:** 14px +0.01em · 22px −0.005em · 26px −0.012em · 36px −0.02em.
- **Numbers:** tabular (`font-variant-numeric: tabular-nums`) in tables, credits, prices.

| Role | Size | Line height | Weight | Tracking |
|------|------|-------------|--------|----------|
| eyebrow (mono, uppercase) | 11px | 1.6 | 500 | 0.06em |
| caption | 12px | 1.4 | 400 | 0 |
| body-sm | 14px | 1.5 | 400 | 0.01em |
| body | 16px | 1.5 | 400 | 0 |
| heading-sm (h6) | 16px | 1.4 | 500 | 0 |
| heading (h5) | 20px | 1.3 | 500 | −0.005em |
| heading-md (h4) | 24px | 1.25 | 400 | −0.012em |
| heading-lg (h3) | 30px | 1.2 | 400 | −0.02em |
| display (h1/h2) | 36–48px | 1.1 | 400 | −0.03em |

## Tokens — Spacing & Shape

- **Base unit:** 4px. Scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64.
- **Density:** compact. Card padding 24px (16px on mobile). Element gap 8px. Section gap 24px inside the app.
- **Radius:** 4px buttons, inputs, chips, cards, tables. 8px dialogs. No pills (≥999px) on buttons or cards; round only avatars and status dots.
- **Nested radius:** inner = outer − padding (a 4px element inside an 8px dialog with 4px inset).

## Elevation

| Level | Value | Use |
|-------|-------|-----|
| flat | `0 0 0 1px #e4e3de` (or 1px border) | Cards, tables, sidebar — the default |
| raised | `0 1px 2px rgba(38,37,30,0.04), 0 0 0 1px #e4e3de` | Hovered card, sticky header |
| popover | `0 8px 24px -8px rgba(38,37,30,0.16), 0 0 0 1px #e4e3de` | Menus, autocomplete, tooltips |
| modal | `0 28px 70px rgba(38,37,30,0.14), 0 14px 32px rgba(38,37,30,0.10)` | Dialogs |

Shadows are warm (ink-tinted), never blue, never coloured by the button colour.

## Components

### Primary button
Ink `#26251e` fill, Paper text, 4px radius, 14px Inter 500, sentence case, 36px min height (32px small). Hover: `#3a3930`. Press: `scale(0.96)`. One per action group.

### Secondary button (outlined)
Transparent, 1px Stone border, Ink text. Hover: Parchment fill. Used for Cancel / Close / Back.

### Text button
No border or fill, Ash text, Ink on hover. Inline actions and "Clear".

### Destructive button
Wine `#b3261e` fill, Paper text. Only for delete/reject confirmations.

### Card
Paper surface, 1px Rule border, 4px radius, no drop shadow, 24px padding. Card headers use a mono eyebrow + h6 title.

### Data table
Paper surface inside the card. Header row: Parchment background, mono 11px uppercase Ash labels, 0.06em tracking. Rows: 1px Rule bottom border, 12px × 16px cell padding, hover Parchment. Numbers right-aligned and tabular.

### Inputs
Paper fill, 1px Stone border, 4px radius, 40px tall. Focus: 1px Ink border + 3px `rgba(225,6,0,0.12)` ring. Labels 13px Ash.

### Sidebar
Full-height Ink (`#26251e`) rail, the one dark surface in the app, like a newspaper masthead set against the paper. The logo sits on a small Paper tile at the top. Items are 14px Inter 400, Paper text at 72% opacity, with white monoline icons. Hover: 5% Paper tint, full opacity. Active item: 8% Paper tint, full opacity, weight 500, and a 2px 01Wire-red marker on the left edge (`inset 2px 0 0 #e10600`). No drop shadow.

### Top bar
Transparent over Canvas, breadcrumb in mono eyebrow, page title in h5. Becomes Paper with a hairline bottom rule when scrolled.

### Status chip
4px radius, soft status background, status text colour, 12px Inter 500, 2px × 8px padding, optional 6px dot.

### Link
01Wire Red, no underline at rest, underline on hover, 150ms colour transition.

## Do
- Use Ink for every primary action; let red mark links, focus, the active nav item and things that need attention.
- Put structure in hairlines (`#e4e3de`) before reaching for shadows.
- Use the mono eyebrow for column headers, IDs, dates and section labels; it's the 01Wire "wire copy" voice shared with pr.01wire.com.
- Keep text on cream at ≥4.5:1 contrast: Ash `#6b6a64` is the lightest colour allowed for readable text.
- Transition only named properties (`background-color, border-color, color, box-shadow, transform`) at 150ms `cubic-bezier(0.2, 0, 0, 1)`.

## Don't
- No gradients, glows, colour washes or coloured shadows (the template's `variant="gradient"` renders flat).
- No pure `#ffffff` surfaces or `#000000` text.
- No 600/700 weights, no uppercase buttons.
- Don't fill large areas with red; it's a signal, not a surface.
- Don't stack more than two button styles in one action group.
- Don't introduce new hex values in components. Import from `assets/theme/tokens`.

## Agent prompt guide

> Read DESIGN.md fully before writing code. Use only values from `src/assets/theme/tokens.ts`. Primary actions are Ink; 01Wire red `#e10600` is for links, focus and active states only. 4px radius, hairline borders, no gradients, weights 400/500 only, mono eyebrows for labels and IDs. Keep all existing copy, routes, GraphQL calls and behaviour. When done, list every place you deviated from DESIGN.md and why.
