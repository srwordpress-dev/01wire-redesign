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
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";
import { transition } from "assets/theme/tokens";

const { fontWeightBold, size } = typography;
const { borderRadius } = borders;

const root = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: size.sm,
  fontWeight: fontWeightBold,
  letterSpacing: "0.005em",
  borderRadius: borderRadius.lg,
  padding: `${pxToRem(6.302)} ${pxToRem(16.604)}`,
  lineHeight: 1.4,
  textAlign: "center",
  // Normal case everywhere ("Create package", not "CREATE PACKAGE")
  textTransform: "none",
  userSelect: "none",
  boxShadow: "none !important",
  transition: transition("background-color", "border-color", "color", "opacity", "transform"),

  "&:disabled": {
    pointerEvent: "none",
    opacity: 0.65,
  },

  "& .material-icons": {
    fontSize: pxToRem(15),
    marginTop: pxToRem(-2),
  },
};

export default root;
