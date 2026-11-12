import { useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import WalletIcon from "assets/images/account_balance_wallet.svg";

import PackageBg from "assets/images/packageBg.svg";
import TermsAndConditionsModal from "../TandC";
import PaymentIframe from "../PaymentIFrame";

const cardStyles = {
  p: 2,
  background: `url(${PackageBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  height: "94px",
};

const TopUpPackages = () => {
  const [open, setOpen] = useState<any>(false);
  const [paymentUrl, setUrl] = useState<any>(null);
  return (
    <>
      {open && (
        <TermsAndConditionsModal kind={open} onClose={() => setOpen(false)} setUrl={setUrl} />
      )}
      {paymentUrl && <PaymentIframe src={paymentUrl} onClose={() => setUrl(null)} />}
      <Card sx={{ height: "auto", p: 2 }}>
        <MDTypography fontSize="14px" fontWeight="medium" color="textSecondary">
          Recommended Top-up
        </MDTypography>
        <Grid container mt={1} spacing={2}>
          <Grid item xs={12} md={6}>
            <MDBox>
              <Card
                sx={{
                  ...cardStyles,
                }}
              >
                <MDBox
                  position="absolute"
                  left={15}
                  bottom={2}
                  display="flex"
                  alignItems="center"
                  alignSelf="center"
                >
                  <img src={WalletIcon} height={"35px"} width={"35px"} />
                  <MDTypography fontSize="29px" fontWeight="medium" color="white">
                    100 Credits
                  </MDTypography>
                </MDBox>
              </Card>
              <MDBox
                sx={{ background: "rgba(245, 245, 250, 1)", borderRadius: "0 0 12px 12px" }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pt={4}
                px={2}
                pb={2}
                mt={-3}
              >
                <MDTypography color="primary" fontSize="24px">
                  $100
                </MDTypography>
                <MDButton onClick={() => setOpen("CREDITS_100")} color="primary" size="small">
                  <MDTypography fontSize="16px" fontWeight="regular" color="white">
                    Buy $100
                  </MDTypography>
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox>
              <Card
                sx={{
                  ...cardStyles,
                }}
              >
                <MDBox
                  position="absolute"
                  left={15}
                  bottom={2}
                  display="flex"
                  alignItems="center"
                  alignSelf="center"
                >
                  <img src={WalletIcon} height={"35px"} width={"35px"} />
                  <MDTypography fontSize="29px" fontWeight="medium" color="white">
                    500 Credits
                  </MDTypography>
                </MDBox>
              </Card>
              <MDBox
                sx={{ background: "rgba(245, 245, 250, 1)", borderRadius: "0 0 12px 12px" }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pt={4}
                px={2}
                pb={2}
                mt={-3}
              >
                <MDTypography color="primary" fontSize="24px">
                  $500
                </MDTypography>
                <MDButton onClick={() => setOpen("CREDITS_500")} color="primary" size="small">
                  <MDTypography fontSize="16px" fontWeight="regular" color="white">
                    Buy $500
                  </MDTypography>
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox>
              <Card
                sx={{
                  ...cardStyles,
                }}
              >
                <MDBox
                  position="absolute"
                  left={15}
                  bottom={2}
                  display="flex"
                  alignItems="center"
                  alignSelf="center"
                >
                  <img src={WalletIcon} height={"35px"} width={"35px"} />
                  <MDTypography fontSize="29px" fontWeight="medium" color="white">
                    1000 Credits
                  </MDTypography>
                </MDBox>
              </Card>
              <MDBox
                sx={{ background: "rgba(245, 245, 250, 1)", borderRadius: "0 0 12px 12px" }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pt={4}
                px={2}
                pb={2}
                mt={-3}
              >
                <MDTypography color="primary" fontSize="24px">
                  $1000
                </MDTypography>
                <MDButton onClick={() => setOpen("CREDITS_1000")} color="primary" size="small">
                  <MDTypography fontSize="16px" fontWeight="regular" color="white">
                    Buy $1000
                  </MDTypography>
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox>
              <Card
                sx={{
                  ...cardStyles,
                }}
              >
                <MDBox
                  position="absolute"
                  left={15}
                  bottom={2}
                  display="flex"
                  alignItems="center"
                  alignSelf="center"
                >
                  <img src={WalletIcon} height={"35px"} width={"35px"} />
                  <MDTypography fontSize="29px" fontWeight="medium" color="white">
                    5000 Credits
                  </MDTypography>
                </MDBox>
              </Card>
              <MDBox
                sx={{ background: "rgba(245, 245, 250, 1)", borderRadius: "0 0 12px 12px" }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pt={4}
                px={2}
                pb={2}
                mt={-3}
              >
                <MDTypography color="primary" fontSize="24px">
                  $5000
                </MDTypography>
                <MDButton onClick={() => setOpen("CREDITS_5000")} color="primary" size="small">
                  <MDTypography fontSize="16px" fontWeight="regular" color="white">
                    Buy $5000
                  </MDTypography>
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
      </Card>
    </>
  );
};

export default TopUpPackages;
