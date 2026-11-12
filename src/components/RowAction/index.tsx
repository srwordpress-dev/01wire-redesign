import { ReactNode } from "react";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

interface Props extends Omit<IconButtonProps, "children"> {
  // Shown as tooltip and used as the accessible name of the icon-only button
  label: string;
  // Image icon (svg asset); use children for MUI icons instead
  icon?: string;
  children?: ReactNode;
}

function RowAction({ label, icon, children, ...rest }: Props): JSX.Element {
  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} {...rest}>
        {icon ? <img width={36} height={36} alt="" src={icon} /> : children}
      </IconButton>
    </Tooltip>
  );
}

export default RowAction;
