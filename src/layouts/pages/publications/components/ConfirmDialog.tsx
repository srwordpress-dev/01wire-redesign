import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Small confirm dialog that fits a phone screen (DeleteModal has a fixed 454px body)
const ConfirmDialog = ({
  title,
  message,
  confirmText = "Confirm",
  onConfirm,
  onClose,
  loading = false,
}: {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) => (
  <Dialog open onClose={onClose} fullWidth maxWidth="xs">
    <MDBox display="flex" alignItems="center" justifyContent="space-between" pr={1}>
      <DialogTitle>
        <MDTypography fontSize="16px" fontWeight="medium">
          {title}
        </MDTypography>
      </DialogTitle>
      <IconButton aria-label="Close" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </MDBox>
    <DialogContent>
      <MDTypography fontSize="14px" color="text">
        {message}
      </MDTypography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <MDButton variant="outlined" color="primary" onClick={onClose}>
        Cancel
      </MDButton>
      <MDButton variant="contained" color="primary" disabled={loading} onClick={onConfirm}>
        {confirmText}
      </MDButton>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
