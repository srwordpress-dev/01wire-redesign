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
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

import { palette } from "assets/theme/tokens";

const { transparent } = colors;
const { size } = typography;

const outlined = {
  base: {
    minHeight: pxToRem(36),
    color: palette.ink,
    borderColor: palette.outline,
    padding: `${pxToRem(8)} ${pxToRem(16)}`,
    "&:hover": {
      backgroundColor: palette.surfaceSunken,
      borderColor: palette.outline,
    },

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(16)} !important`,
    },
  },

  small: {
    minHeight: pxToRem(32),
    padding: `${pxToRem(6)} ${pxToRem(16)}`,
    fontSize: size.xs,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(12)} !important`,
    },
  },

  large: {
    minHeight: pxToRem(47),
    padding: `${pxToRem(12)} ${pxToRem(28)}`,
    fontSize: size.sm,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(22)} !important`,
    },
  },

  primary: {
    backgroundColor: transparent.main,
    color: palette.ink,
    borderColor: palette.ink,
    "&:hover": {
      backgroundColor: palette.surfaceSunken,
    },
  },
  secondary: {
    backgroundColor: transparent.main,
    color: palette.ink,
    borderColor: palette.outline,
    "&:hover": {
      backgroundColor: palette.surfaceSunken,
    },
  },
};

export default outlined;
