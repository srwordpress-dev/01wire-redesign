import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import BillingInformation from "./components/BillingInformation";
import TopUpPackages from "./components/TopUpPackages";
import { useQuery } from "@apollo/client";
import { IGetUserWallet, GET_USER_WALLET } from "graphql/queries/getUserWallet";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import { PAYMENT_METHODS, IPaymentMethods } from "graphql/mutations/razorpay";

function MyCredits(): JSX.Element {
  const { data, loading, refetch } = useQuery<IGetUserWallet>(GET_USER_WALLET, {
    fetchPolicy: "network-only",
  });
  const { data: methodsData } = useQuery<IPaymentMethods>(PAYMENT_METHODS, {
    fetchPolicy: "network-only",
  });

  return (
    <>
    <DashboardNavbar />
    <MDBox mt={4} px={2}>
      <MDBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <BillingInformation data={data} />
          </Grid>
          <Grid item xs={12} md={7}>
            {/* Buying credits with money is open only to allowed accounts for now */}
            {methodsData?.paymentMethods?.creditPacks ? (
              <TopUpPackages />
            ) : (
              <Card sx={{ p: 3 }} data-testid="topup-closed">
                <MDTypography variant="h6">Buying credits</MDTypography>
                <MDTypography fontSize="14px" color="text" mt={1}>
                  Online credit purchases aren't available yet. To add credits, please contact the 01 Wire team.
                </MDTypography>
              </Card>
            )}
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
    </>

  );
}

export default MyCredits;
