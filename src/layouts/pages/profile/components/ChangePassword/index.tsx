import { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogActions from "@mui/material/DialogActions";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDCircularLoader from "components/MDCircularLoader";
import FormField from "layouts/pages/releases/components/FormField";
import { RESET_PASSWORD, IResetPasswordVars } from "graphql/mutations/resetPassword";

const ChangePassword = ({ onClose }: { onClose: any }) => {
  const theme = useTheme();
  const [loader, setLoader] = useState<boolean>(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [resetPassword] = useMutation<IResetPasswordVars>(RESET_PASSWORD);
  const {
    control,
    formState: { isDirty },
    handleSubmit,
  } = useForm({});
  const onSubmit = (formVals: any) => {
    if (!formVals?.newPassword || !formVals?.confirmPassword) {
      toast.error("Please enter the required values");
      return;
    }
    if (formVals?.newPassword !== formVals?.confirmPassword) {
      toast.error("New Password and Confirm Password mismatched");
      return;
    }
    setLoader(true);
    resetPassword({
      variables: {
        password: formVals?.newPassword,
      },
    })
      .then(() => {
        setLoader(false);
        toast.success("Password reset successfully.");
        onClose();
      })
      .catch((err: any) => {
        console.log("error in password reset", err);
        setLoader(false);
        toast.error(err?.message);
      });
  };
  return (
    <>
      <Dialog
        PaperProps={{
          style: {
            height: "447px",
            width: isMobile ? "100%" : "454px",
            border: "0.5px solid #00000033",
            boxShadow: "0px 4px 16px 0px #00000033",
          },
        }}
        open
        onClose={onClose}
      >
        {loader && <MDCircularLoader overlayloader startLoader />}
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="20px" fontWeight="medium">
              Change Password
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent>
          <MDBox>
            <FormField
              label="New Password"
              placeholder="Enter New Password"
              name="newPassword"
              control={control}
              required
              variant="outlined"
              type="password"
            />
            <FormField
              label="Confirm Password"
              placeholder="Rewrite Password Again"
              name="confirmPassword"
              control={control}
              required
              variant="outlined"
              type="password"
            />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <MDButton variant="outlined" color="primary" onClick={onClose}>
            Cancel
          </MDButton>
          <MDButton
            disabled={!isDirty}
            onClick={() => handleSubmit(onSubmit)()}
            variant="contained"
            color="primary"
          >
            Submit
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangePassword;
