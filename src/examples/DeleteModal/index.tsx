import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Box } from "@mui/material";

const DeleteModal = ({ handleSubmit, onClose }: { onClose: any; handleSubmit: any }) => {
  return (
    <>
      <Dialog maxWidth="sm" open onClose={onClose}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Delete{" "}
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent sx={{ width: "454px" }}>
          <Box display="flex" justifyContent="center" alignContent="center">
            <MDTypography
              component="label"
              sx={{ mb: "1rem", fontWeight: "500" }}
              fontSize="14px"
              color="textSecondary"
            >
              Are you sure, you want to delete this?
            </MDTypography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <MDButton
            sx={{ margin: "auto" }}
            variant="outlined"
            color="primary"
            onClick={() => onClose()}
          >
            Cancel
          </MDButton>
          <MDButton
            sx={{ margin: "auto" }}
            variant="contained"
            color="primary"
            onClick={() => {
              handleSubmit();
              onClose();
            }}
          >
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteModal;
