/**
=========================================================
* Material Dashboard 2 PRO React TS - v1.0.2
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-2-pro-react-ts
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 PRO React TS Base Styles
import { palette, fonts, transition } from "assets/theme/tokens";

const globals = {
  html: {
    scrollBehavior: "smooth",
  },
  body: {
    backgroundColor: palette.canvas,
    color: palette.ink,
    fontFamily: fonts.sans,
    fontFeatureSettings: '"cv11", "ss01"',
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    textRendering: "optimizeLegibility",
  },
  "*, *::before, *::after": {
    margin: 0,
    padding: 0,
  },
  "::selection": {
    backgroundColor: palette.selection,
    color: palette.ink,
  },
  "table, .MuiTableCell-root": {
    fontVariantNumeric: "tabular-nums",
  },
  "a, a:link, a:visited": {
    textDecoration: "none !important",
  },
  "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
    color: `${palette.brand} !important`,
    transition: `${transition("color")} !important`,
  },
  "a.link:hover, .link:hover, a.link:focus, .link:focus": {
    color: `${palette.brandHover} !important`,
    textDecoration: "underline !important",
  },
  // Press feedback for every button (better-ui: scale 0.96).
  ".MuiButtonBase-root.MuiButton-root:active:not(:disabled)": {
    transform: "scale(0.96)",
  },
  ":focus-visible": {
    outline: `2px solid ${palette.brand}`,
    outlineOffset: "2px",
  },
};

export default globals;
