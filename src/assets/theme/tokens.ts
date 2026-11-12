/**
 * 01Wire design tokens — the single source of truth for colours, type and shape.
 * Documented in /DESIGN.md. Components should import from here instead of
 * hard-coding hex values.
 */

export const palette = {
  // Surfaces
  canvas: "#f2f1ed", // Bone — app background
  surface: "#fbfbf8", // Paper — cards, tables, sidebar, dialogs
  surfaceSunken: "#f7f7f4", // Parchment — table headers, hover rows
  surfaceElevated: "#e6e5e0", // Linen — secondary fills, chips
  outline: "#cdcdc9", // Stone — input borders
  hairline: "#e4e3de", // Rule — card borders, row rules

  // Text
  ink: "#26251e",
  inkHover: "#3a3930",
  textMuted: "#6b6a64", // Ash — lightest colour allowed for readable text
  textDisabled: "#a1a19f", // Mist

  // Brand
  brand: "#e10600", // 01Wire red — links, focus, active nav
  brandHover: "#b80500",
  brandSoft: "#fdecea",

  // Status
  success: "#34785c",
  successSoft: "#e5efe9",
  warning: "#a86b1f",
  warningSoft: "#f6ecdc",
  error: "#b3261e",
  errorSoft: "#f8e4e2",
  info: "#3d6480",
  infoSoft: "#e3eaf0",

  selection: "#8bc4f8",
} as const;

export const fonts = {
  sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  serif: '"EB Garamond", "Iowan Old Style", Georgia, serif',
} as const;

export const motion = {
  duration: "150ms",
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/** Transition on named properties only (never `all`). */
export const transition = (...props: string[]): string =>
  props.map((p) => `${p} ${motion.duration} ${motion.easing}`).join(", ");

export const elevation = {
  flat: `0 0 0 1px ${palette.hairline}`,
  raised: `0 1px 2px rgba(38, 37, 30, 0.04), 0 0 0 1px ${palette.hairline}`,
  popover: `0 8px 24px -8px rgba(38, 37, 30, 0.16), 0 0 0 1px ${palette.hairline}`,
  modal: "0 28px 70px rgba(38, 37, 30, 0.14), 0 14px 32px rgba(38, 37, 30, 0.10)",
  focusRing: "0 0 0 3px rgba(225, 6, 0, 0.12)",
} as const;

/** Mono "wire copy" label used for eyebrows, column headers and IDs. */
export const eyebrow = {
  fontFamily: fonts.mono,
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  lineHeight: 1.6,
  color: palette.textMuted,
};

// Short aliases used by page-level code that previously hard-coded colours.
export const INK = palette.ink;
export const MUTED = palette.textMuted;
export const BRAND = palette.brand;
export const BRAND_SOFT = palette.brandSoft;
