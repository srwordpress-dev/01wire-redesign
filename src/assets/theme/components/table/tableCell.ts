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
import borders from "assets/theme/base/borders";
// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

const { borderWidth } = borders;
import { palette, eyebrow } from "assets/theme/tokens";

// types
type Types = any;

const tableCell: Types = {
  styleOverrides: {
    root: {
      padding: `${pxToRem(12)} ${pxToRem(16)}`,
      borderBottom: `${borderWidth[1]} solid ${palette.hairline}`,
      color: palette.ink,
      fontSize: pxToRem(14),
    },
    head: {
      ...eyebrow,
      backgroundColor: palette.surfaceSunken,
    },
  },
};

export default tableCell;
