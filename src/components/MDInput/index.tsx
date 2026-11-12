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

import { forwardRef } from "react";

// @mui material components
import { OutlinedTextFieldProps, StandardTextFieldProps } from "@mui/material";

// Custom styles for MDInput
import MDInputRoot from "components/MDInput/MDInputRoot";

// Declaring props types for MDInput
interface Props extends Omit<OutlinedTextFieldProps | StandardTextFieldProps, "variant"> {
  variant?: "standard" | "outlined";
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
}

const MDInput = forwardRef<HTMLDivElement, Props>(({ error = false, success = false, disabled = false, ...rest }, ref) => (
  <MDInputRoot {...rest} ref={ref} disabled={disabled} ownerState={{ error, success, disabled }} />
));

// Declaring default props for MDInput


export default MDInput;
