import { useState } from "react";
import { toast } from "react-toastify";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

import MDCircularLoader from "components/MDCircularLoader";
import { useMutation } from "@apollo/client";
import { CREATE_ESTIMATE, ICreateEstimateVars } from "graphql/mutations/createEstimation";

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

const CreateEstimation = ({ onClose, values }: { onClose: any; values: any }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loader, setLoader] = useState(false);
  const [title, setTitle] = useState("");

  const [createEstimate] = useMutation<ICreateEstimateVars>(CREATE_ESTIMATE);
  const onSubmit = () => {
    setLoader(true);
    createEstimate({
      variables: {
        params: {
          title,
          ...values,
        },
      },
    })
      .then((res: any) => {
        setLoader(false);
        toast.success("Saved Successfully");
        copyToClipboard(
          `${window?.location?.origin}/share-estimation/${res?.data?.createEstimate?.id}`
        )
          .then(() => {
            toast.success("Link copied to clipboard");
          })
          .catch((err: any) => {
            toast.error(err);
          });
        onClose();
      })
      .catch((err) => {
        setLoader(false);
        toast.error(err?.message);
      });
  };
  const handleChange = (e: any) => {
    setTitle(e.target.value);
  };
  return (
    <>
      <Dialog
        PaperProps={{
          style: {
            height: "274px",
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
              Estimate Title
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent>
          {loader && <MDCircularLoader startLoader overlayloader />}
          <MDBox>
            <MDTypography mb={"0.5rem"} fontSize="1rem" fontWeight="medium" color="textSecondary">
              Title
            </MDTypography>
            <MDInput fullWidth onChange={handleChange} value={title} />
          </MDBox>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <MDButton
            sx={{ margin: "auto" }}
            variant="contained"
            color="primary"
            disabled={!title}
            onClick={onSubmit}
          >
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateEstimation;
