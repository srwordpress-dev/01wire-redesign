import { ReactNode } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Chip from "@mui/material/Chip";

// Declaring props types for Transaction
interface Props {
  color: "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark";
  icon: ReactNode;
  name: string;
  description: string;
  value: string;
  kind: string;
  note?: string;
}

function Transaction({
  color,
  icon,
  name,
  description,
  value,
  kind = "",
  note = "",
}: Props): JSX.Element {
  return (
    <MDBox key={name} component="li" py={1} pr={2} mb={1}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MDBox display="flex" alignItems="center">
          <MDBox display="flex" flexDirection="column">
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="button" fontWeight="medium">
                {name}
              </MDTypography>
              <Chip
                sx={{ ml: 1, background: "#ffddde", color: "#F9565C", height: "22px" }}
                label={kind}
              />
            </MDBox>
            {note && (
              <MDTypography mt={1} variant="caption" color="text" fontWeight="regular">
                {`Note - ${note}`}
              </MDTypography>
            )}
            <MDTypography mt={1} variant="caption" color="text" fontWeight="regular">
              {description}
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDTypography variant="button" color={color} fontWeight="medium" textGradient>
          {value}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default Transaction;
