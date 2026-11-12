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
import borders from "assets/theme/base/borders";

// Material Dashboard 2 PRO React Helper Function
import { palette } from "assets/theme/tokens";

const { white } = colors;
const { borderWidth, borderRadius } = borders;

// types
// types
type Types = any;

const card: Types = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundColor: white.main,
      backgroundClip: "border-box",
      border: `${borderWidth[1]} solid ${palette.hairline}`,
      borderRadius: borderRadius.xl,
      boxShadow: "none",
      overflow: "visible",
    },
  },
};

export default card;
