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

/**
 * The base box-shadow styles for the Material Dashboard 2 PRO React TSUI Dashboard PRO Material.
 * You can add new box-shadow using this file.
 * You can customized the box-shadow for the entire Material Dashboard 2 PRO React TSUI Dashboard PRO Material using thie file.
 */

// Material Dashboard 2 PRO React TS Base Styles
import colors from "assets/theme/base/colors";

// Material Dashboard 2 PRO React TS Helper Functions
import boxShadow from "assets/theme/functions/boxShadow";
import { elevation } from "assets/theme/tokens";

const { black } = colors;

// types
interface Types {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  inset: string;
  colored:
    | {
        primary: string;
        secondary: string;
        info: string;
        success: string;
        warning: string;
        error: string;
        light: string;
        dark: string;
      }
    | any;
  navbarBoxShadow: string;
  sliderBoxShadow: {
    thumb: string;
  };
  tabsBoxShadow: {
    indicator: string;
  };
}

// DESIGN.md: depth comes from hairlines and soft warm shadows, never coloured glows.
const boxShadows: Types = {
  xs: elevation.flat,
  sm: elevation.flat,
  md: elevation.flat,
  lg: elevation.raised,
  xl: elevation.popover,
  xxl: elevation.modal,
  inset: boxShadow([0, 1], [2, 0], black.main, 0.04, "inset"),
  colored: {
    primary: "none",
    secondary: "none",
    info: "none",
    success: "none",
    warning: "none",
    error: "none",
    light: "none",
    dark: "none",
  },
  navbarBoxShadow: `0 1px 0 ${colors.grey[300]}`,
  sliderBoxShadow: {
    thumb: boxShadow([0, 1], [3, 0], black.main, 0.2),
  },
  tabsBoxShadow: {
    indicator: elevation.flat,
  },
};

export default boxShadows;
