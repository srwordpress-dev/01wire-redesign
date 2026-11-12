import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { AppBar, Grid, Toolbar } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { GET_ESTIMATE_BY_ID, IGetEstimateByIdVars } from "graphql/queries/getEstimateById";
import OneWireLogo from "assets/images/01wire-logo.png";
import DisplayBundles from "../releases/components/DisplayBundles";
import PublicationsList from "../releases/components/PublicationsList";
import Footer from "examples/Footer";

const DisplayCount = ({
  count,
  title,
  subTitle,
}: {
  count: number;
  title: string;
  subTitle: string;
}) => {
  return (
    <MDBox
      bgColor="white"
      borderRadius="12px"
      height="202px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ padding: "0 10px" }}
    >
      <MDBox>
        <MDBox display="flex" alignItems="center">
          <MDTypography fontSize="52px" fontWeight="medium" color="primary" fontFamily="Inter">
            {count}
          </MDTypography>
          <MDTypography ml={1} mt={2} fontSize="18px" fontWeight="medium" fontFamily="Inter">
            {title}
          </MDTypography>
        </MDBox>
        <MDTypography
          textAlign="center"
          fontSize="18px"
          fontWeight="medium"
          fontFamily="Inter"
          mt={4}
        >
          {subTitle}
        </MDTypography>
      </MDBox>
    </MDBox>
  );
};
const ShareEstimation = () => {
  const { id } = useParams();
  const { data, loading } = useQuery<IGetEstimateByIdVars>(GET_ESTIMATE_BY_ID, {
    variables: {
      id,
    },
    fetchPolicy: "network-only",
    skip: !id,
  });
  return (
    <MDBox>
      <AppBar
        position="fixed"
        sx={{
          background: "#fff",
          height: "116px",
          boxShadow: "0px 4px 24px 0px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Toolbar sx={{ height: "100%" }}>
          <MDBox m="auto">
            <img src={OneWireLogo} alt="01 Wire" height={"46px"} width="auto" style={{ maxWidth: "100%" }} />
          </MDBox>
        </Toolbar>
      </AppBar>
      <MDBox sx={{ minHeight: "400px", marginTop: "116px" }}>
        {loading ? (
          <MDCircularLoader startLoader />
        ) : data?.getEstimateById ? (
          <MDBox sx={{ padding: "40px 100px" }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DisplayCount
                  count={data?.getEstimateById?.totalCredits}
                  title={data?.getEstimateById?.totalCredits === 1 ? "Credit" : "Credits"}
                  subTitle="Total price"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DisplayCount
                  count={data?.getEstimateById?.traffic}
                  title="Views"
                  subTitle="Total Reach"
                />
              </Grid>
            </Grid>
            {data?.getEstimateById?.bundleInfo?.length > 0 && (
              <MDBox>
                <MDTypography my={3} variant="h6">
                  Packages
                </MDTypography>
                <DisplayBundles
                  bundles={data?.getEstimateById?.bundleInfo}
                  selected={data?.getEstimateById?.bundleInfo}
                  disabled
                />
              </MDBox>
            )}
            <MDBox>
              <MDTypography my={3} variant="h6">
                Publications
              </MDTypography>
              <PublicationsList
                entriesPerPage={false}
                publications={data?.getEstimateById?.publicationInfo}
                disabled
              />
            </MDBox>
          </MDBox>
        ) : (
          <MDBox
            sx={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MDTypography variant="h6">No estimation found</MDTypography>
          </MDBox>
        )}
      </MDBox>
      <MDBox width="100%">
        <MDBox p={2}>
          <Footer />
        </MDBox>
      </MDBox>
    </MDBox>
  );
};
export default ShareEstimation;
