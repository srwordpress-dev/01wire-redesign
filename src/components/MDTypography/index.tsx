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

import { ReactNode, forwardRef } from "react";

// @mui material components
import { TypographyProps } from "@mui/material";

// Custom styles for MDTypography
import MDTypographyRoot from "components/MDTypography/MDTypographyRoot";

const TypographyRoot = MDTypographyRoot as any;

// Material Dashboard 2 PRO React TS contexts
import { useMaterialUIController } from "context";

// Declaring props types for MDTypography
interface Props extends TypographyProps {
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "text"
    | "white"
    | "textSecondary";
  fontWeight?: "light" | "regular" | "medium" | "bold" | undefined;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  verticalAlign?:
    | "unset"
    | "baseline"
    | "sub"
    | "super"
    | "text-top"
    | "text-bottom"
    | "middle"
    | "top"
    | "bottom";
  textGradient?: boolean;
  children: ReactNode;
  opacity?: number;
  [key: string]: any;
}

const MDTypography = forwardRef<HTMLSpanElement, Props>(
  (
    {
      color = "dark",
      width = "auto",
      fontWeight,
      textTransform = "none",
      verticalAlign = "unset",
      textGradient = false,
      opacity = 1,
      children,
      ...rest
    },
    ref
  ) => {
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;

    return (
      <TypographyRoot
        {...rest}
        ref={ref}
        ownerState={{
          color,
          textTransform,
          verticalAlign,
          fontWeight,
          opacity,
          textGradient,
          darkMode,
          width,
        }}
      >
        {children}
      </TypographyRoot>
    );
  }
);

export default MDTypography;
