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

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Declaring props types for the Breadcrumbs
interface Props {
  icon: ReactNode;
  title: string;
  route: string | string[];
  light?: boolean;
  [key: string]: any;
}

function Breadcrumbs({ icon, title, route, light, names = {}, recordCrumb = "" }: Props): JSX.Element {
  const segs: string[] = Array.isArray(route) ? route : [route];
  // Page names come from the sidebar; any other segment after the first is a record id,
  // shown as e.g. "PR #50" instead of the raw id
  const label = (seg: string, i: number) => {
    if (names[seg]) return names[seg];
    if (i > 0) return recordCrumb || "…";
    return seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  };
  const parents = segs.slice(0, -1);
  const last = segs.length ? label(segs[segs.length - 1], segs.length - 1) : title;

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) => (light ? white.main : grey[600]),
          },
        }}
      >
        {parents.map((el: string, i: number) => (
          <Link to={`/${segs.slice(0, i + 1).join("/")}`} key={`${i}-${el}`}>
            <MDTypography
              component="span"
              variant="button"
              fontWeight="regular"
              color={light ? "white" : "dark"}
              opacity={light ? 0.8 : 0.5}
              sx={{ lineHeight: 0 }}
            >
              {label(el, i)}
            </MDTypography>
          </Link>
        ))}
        <MDTypography
          variant="button"
          fontWeight="regular"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
          data-testid="breadcrumb-current"
        >
          {last}
        </MDTypography>
      </MuiBreadcrumbs>
      {/* <MDTypography
        fontWeight="bold"
        textTransform="capitalize"
        variant="h6"
        color={light ? "white" : "dark"}
        noWrap
      >
        {title.replace("-", " ")}
      </MDTypography> */}
    </MDBox>
  );
}

// Declaring default props for Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
};

export default Breadcrumbs;
