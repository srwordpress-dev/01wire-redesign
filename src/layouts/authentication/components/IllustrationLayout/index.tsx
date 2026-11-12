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
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React TS examples components
import PageLayout from "examples/LayoutContainers/PageLayout";

// Material Dashboard 2 PRO React context
import { useMaterialUIController } from "context";

// Declaring props types for IllustrationLayout
interface Props {
  header?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  illustration?: string;
  loginLogo?: string;
}

function IllustrationLayout({
  header,
  title,
  description,
  illustration,
  loginLogo,
  children,
}: Props): JSX.Element {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <PageLayout background="white">
      <Grid
        container
        sx={{
          backgroundColor: ({ palette: { background, white } }) =>
            darkMode ? background.default : white.main,
        }}
      >
        <Grid item xs={12} lg={6}>
          <MDBox
            display={{ xs: "none", lg: "flex" }}
            width="100%"
            height="100%"
            sx={{ backgroundImage: `url(${illustration})` }}
          />
        </Grid>
        <Grid item xs={12} sm={8} md={6} lg={6} xl={4} sx={{ mx: "auto" }}>
          <MDBox display="flex" flexDirection="column" justifyContent="center" height="100vh">
            <MDBox py={3} px={1} textAlign="center">
              {!header ? (
                <>
                  <MDBox
                    width="194px"
                    height="76px"
                    mb={4}
                    sx={{ backgroundImage: `url(${loginLogo})` }}
                  />
                  <MDBox textAlign="left">
                    <MDTypography fontSize="42px" fontWeight="medium">
                      {title}
                    </MDTypography>
                  </MDBox>
                  <MDTypography textAlign="left" fontSize="16px" color="text" fontWeight="regular">
                    {description}
                  </MDTypography>
                </>
              ) : (
                header
              )}
            </MDBox>
            <MDBox p={1}>{children}</MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

// Declaring default props for IllustrationLayout
IllustrationLayout.defaultProps = {
  header: "",
  title: "",
  description: "",
  illustration: "",
};

export default IllustrationLayout;
