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

import { ReactNode } from "react";

// @mui material components
import { Theme } from "@mui/material/styles";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import { palette } from "assets/theme/tokens";

// Declaring prop types for DataTableBodyCell
interface Props {
  children: ReactNode;
  noBorder?: boolean;
  align?: "left" | "right" | "center";
  // Pin the cell to the right edge while the table scrolls horizontally
  sticky?: boolean;
  // Shadow on the pinned cell's left edge (set while the table scrolls sideways)
  stickyShadow?: string;
  // Hide the cell below this breakpoint, e.g. "md"
  hideBelow?: string;
}

function DataTableBodyCell({ noBorder, align, sticky, stickyShadow, hideBelow, children }: Props): JSX.Element {
  return (
    <MDBox
      component="td"
      textAlign={align}
      py={1.5}
      px={2}
      sx={({ typography: { size }, borders: { borderWidth } }: Theme) => ({
        fontSize: size.sm,
        borderBottom: noBorder ? "none" : `${borderWidth[1]} solid ${palette.hairline}`,
        ...(hideBelow && { display: { xs: "none", [hideBelow]: "table-cell" } }),
        ...(sticky && {
          position: "sticky",
          right: 0,
          zIndex: 1,
          background: palette.surface,
          boxShadow: stickyShadow || "none",
        }),
      })}
    >
      <MDBox
        display="inline-block"
        width="max-content"
        color="dark"
        sx={{ verticalAlign: "middle" }}
      >
        {children}
      </MDBox>
    </MDBox>
  );
}

// Declaring default props for DataTableBodyCell
DataTableBodyCell.defaultProps = {
  noBorder: false,
  align: "left",
  sticky: false,
};

export default DataTableBodyCell;
