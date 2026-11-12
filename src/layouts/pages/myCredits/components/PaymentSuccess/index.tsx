import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import SuccessIcon from "assets/images/success.svg";

const PaymentSuccess = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  // Opened from a payment redirect, so "back" may leave the app: go to My Credits instead
  const onClose = () => {
    navigate("/my-credits");
  };
  return (
    <>
      <Dialog
        PaperProps={{
          style: {
            minHeight: "274px",
            width: isMobile ? "100%" : "454px",
            boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.2)",
            border: "0.5px solid rgba(0, 0, 0, 0.2)",
          },
        }}
        open
        onClose={onClose}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Payment Status
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent
          sx={{
            textAlign: "center",
          }}
        >
          <MDBox>
            <MDBox mx="auto">
              <img src={SuccessIcon} height="82px" width="82px" alt="success" />
            </MDBox>
            <MDTypography
              fontSize="24px"
              mt={2}
              sx={{ fontWeight: 700, color: "rgba(8, 226, 109, 1)" }}
            >
              Payment Successful
            </MDTypography>
            <MDTypography fontSize="14px" color="text" mt={1}>
              Your credits will appear in My Credits in a moment.
            </MDTypography>
            <MDButton color="primary" sx={{ mt: 2.5, mb: 1 }} onClick={onClose}>
              Go to My Credits
            </MDButton>
          </MDBox>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentSuccess;
