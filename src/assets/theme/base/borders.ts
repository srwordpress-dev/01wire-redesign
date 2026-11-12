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
 * The base border styles for the Material Dashboard 2 PRO React TSUI Dashboard PRO Material.
 * You can add new border width, border color or border radius using this file.
 * You can customized the borders value for the entire Material Dashboard 2 PRO React TSUI Dashboard PRO Material using thie file.
 */

// Material Dashboard 2 PRO React TS Base Styles
import colors from "assets/theme/base/colors";

// Material Dashboard 2 PRO React TS Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

const { grey } = colors;

// types
interface Types {
  borderColor: string;
  borderWidth: {
    0: number;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  borderRadius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    section: string;
  };
}

const borders: Types = {
  borderColor: grey[300],

  borderWidth: {
    0: 0,
    1: pxToRem(1),
    2: pxToRem(2),
    3: pxToRem(3),
    4: pxToRem(4),
    5: pxToRem(5),
  },

  borderRadius: {
    xs: pxToRem(1.6),
    sm: pxToRem(2),
    // DESIGN.md: 4px for controls/cards, 8px for dialogs and the sidebar panel.
    md: pxToRem(4),
    lg: pxToRem(4),
    xl: pxToRem(4),
    xxl: pxToRem(8),
    section: pxToRem(160),
  },
};

export default borders;
