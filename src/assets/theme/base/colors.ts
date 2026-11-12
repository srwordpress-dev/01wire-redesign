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
 * The base colors for the Material Dashboard 2 PRO React TSUI Dashboard PRO Material.
 * You can add new color using this file.
 * You can customized the colors for the entire Material Dashboard 2 PRO React TSUI Dashboard PRO Material using thie file.
 */

import { palette as p } from "assets/theme/tokens";

// types
interface ColorsTypes {
  main: string;
  focus: string;
}

interface GradientsTypes {
  main: string;
  state: string;
}

interface SocialMediaColorsTypes {
  main: string;
  dark: string;
}

interface BadgeColorsTypes {
  background: string;
  text: string;
}

interface Types {
  background:
  | {
    default: string;
    sidenav?: string;
    card?: string;
  }
  | any;
  white:
  | {
    main: string;
    focus: string;
  }
  | any;
  text:
  | {
    main: string;
    focus: string;
    primary?: string;
    secondary?: string;
    textSecondary?: string;
    disabled?: string;
  }
  | any;
  transparent:
  | {
    main: string;
  }
  | any;
  black:
  | {
    light: string;
    main: string;
    focus: string;
  }
  | any;
  pinkCard:
  | {
    main: string;
    focus: string;
  }
  | any;
  primary: ColorsTypes | any;
  secondary: ColorsTypes | any;
  info: ColorsTypes | any;
  success: ColorsTypes | any;
  warning: ColorsTypes | any;
  error: ColorsTypes | any;
  light: ColorsTypes | any;
  dark: ColorsTypes | any;
  brand: ColorsTypes | any;
  grey:
  | {
    [key: string | number]: string;
  }
  | any;
  gradients:
  | {
    primary: GradientsTypes;
    secondary: GradientsTypes;
    info: GradientsTypes;
    success: GradientsTypes;
    warning: GradientsTypes;
    error: GradientsTypes;
    light: GradientsTypes;
    dark: GradientsTypes;
  }
  | any;
  socialMediaColors:
  | {
    facebook: SocialMediaColorsTypes;
    twitter: SocialMediaColorsTypes;
    instagram: SocialMediaColorsTypes;
    linkedin: SocialMediaColorsTypes;
    pinterest: SocialMediaColorsTypes;
    youtube: SocialMediaColorsTypes;
    vimeo: SocialMediaColorsTypes;
    slack: SocialMediaColorsTypes;
    dribbble: SocialMediaColorsTypes;
    github: SocialMediaColorsTypes;
    reddit: SocialMediaColorsTypes;
    tumblr: SocialMediaColorsTypes;
  }
  | any;
  badgeColors:
  | {
    primary: BadgeColorsTypes;
    secondary: BadgeColorsTypes;
    info: BadgeColorsTypes;
    success: BadgeColorsTypes;
    warning: BadgeColorsTypes;
    error: BadgeColorsTypes;
    light: BadgeColorsTypes;
    dark: BadgeColorsTypes;
  }
  | any;
  coloredShadows:
  | {
    [key: string]: string;
  }
  | any;
  inputBorderColor: string;
  tabs:
  | {
    indicator:
    | {
      boxShadow: string;
    }
    | any;
  }
  | any;
}

const colors: Types = {
  background: {
    default: p.canvas,
  },

  text: {
    main: p.textMuted,
    focus: p.ink,
    textSecondary: p.brand,
  },

  transparent: {
    main: "transparent",
  },

  // "white" in this template means "the surface colour": warm Paper, never pure #fff.
  white: {
    main: p.surface,
    focus: p.surface,
  },

  black: {
    light: p.ink,
    main: p.ink,
    focus: p.ink,
  },
  pinkCard: {
    main: p.brand,
  },
  // Primary = Ink. Primary actions are dark, the red is reserved for links/focus/active.
  primary: {
    main: p.ink,
    focus: p.inkHover,
  },

  // Secondary = neutral (Cancel / Close / muted captions).
  secondary: {
    main: p.textMuted,
    focus: p.ink,
  },

  info: {
    main: p.info,
    focus: p.info,
  },

  success: {
    main: p.success,
    focus: p.success,
  },

  warning: {
    main: p.warning,
    focus: p.warning,
  },

  error: {
    main: p.error,
    focus: p.error,
  },

  light: {
    main: p.surfaceElevated,
    focus: p.surfaceElevated,
  },

  dark: {
    main: p.ink,
    focus: p.inkHover,
  },

  // 01Wire brand red, available as palette.brand / color="brand"-style lookups.
  brand: {
    main: p.brand,
    focus: p.brandHover,
    soft: p.brandSoft,
  },

  grey: {
    100: p.surfaceSunken,
    200: p.canvas,
    300: p.hairline,
    400: p.outline,
    500: p.textDisabled,
    600: p.textMuted,
    700: "#4a4943",
    800: "#36352e",
    900: p.ink,
  },

  // DESIGN.md: no gradients. main === state so every "gradient" renders flat.
  gradients: {
    primary: { main: p.ink, state: p.ink },
    secondary: { main: p.textMuted, state: p.textMuted },
    info: { main: p.info, state: p.info },
    success: { main: p.success, state: p.success },
    warning: { main: p.warning, state: p.warning },
    error: { main: p.error, state: p.error },
    light: { main: p.surfaceElevated, state: p.surfaceElevated },
    dark: { main: p.ink, state: p.ink },
  },

  socialMediaColors: {
    facebook: { main: "#3b5998", dark: "#344e86" },
    twitter: { main: "#55acee", dark: "#3ea1ec" },
    instagram: { main: "#125688", dark: "#0e456d" },
    linkedin: { main: "#0077b5", dark: "#00669c" },
    pinterest: { main: "#cc2127", dark: "#b21d22" },
    youtube: { main: "#e52d27", dark: "#d41f1a" },
    vimeo: { main: "#1ab7ea", dark: "#13a3d2" },
    slack: { main: "#3aaf85", dark: "#329874" },
    dribbble: { main: "#ea4c89", dark: "#e73177" },
    github: { main: "#24292e", dark: "#171a1d" },
    reddit: { main: "#ff4500", dark: "#e03d00" },
    tumblr: { main: "#35465c", dark: "#2a3749" },
  },

  badgeColors: {
    primary: { background: p.surfaceElevated, text: p.ink },
    secondary: { background: p.surfaceElevated, text: p.textMuted },
    info: { background: p.infoSoft, text: p.info },
    success: { background: p.successSoft, text: p.success },
    warning: { background: p.warningSoft, text: p.warning },
    error: { background: p.errorSoft, text: p.error },
    light: { background: p.surface, text: p.textMuted },
    dark: { background: p.ink, text: p.surface },
  },

  // DESIGN.md: shadows are warm ink, never tinted by the button colour.
  coloredShadows: {
    primary: p.ink,
    secondary: p.ink,
    info: p.ink,
    success: p.ink,
    warning: p.ink,
    error: p.ink,
    light: p.ink,
    dark: p.ink,
  },

  inputBorderColor: p.outline,

  tabs: {
    indicator: { boxShadow: "transparent" },
  },
};

export default colors;
