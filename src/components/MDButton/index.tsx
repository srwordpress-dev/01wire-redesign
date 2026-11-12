import { ReactNode, forwardRef } from "react";

// @mui material components
import { ButtonProps } from "@mui/material";

// Custom styles for MDButton
import MDButtonRoot from "components/MDButton/MDButtonRoot";

// Material Dashboard 2 PRO React TS contexts
import { useMaterialUIController } from "context";

// Declaring props types for MDButton
interface Props extends Omit<ButtonProps, "color" | "variant"> {
  color?:
    | "white"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "default";
  variant?: "text" | "contained" | "outlined" | "gradient";
  size?: "small" | "medium" | "large";
  circular?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

const MDButton = forwardRef<HTMLButtonElement, Props>(
  ({ color = "white", variant = "contained", size = "medium", circular = false, iconOnly = false, children, ...rest }, ref) => {
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;

    return (
      <MDButtonRoot
        {...rest}
        ref={ref}
        color="primary"
        variant={variant === "gradient" ? "contained" : variant}
        size={size}
        ownerState={{ color, variant, size, circular, iconOnly, darkMode }}
      >
        {children}
      </MDButtonRoot>
    );
  }
);

// Declaring default props for MDButton


export default MDButton;
