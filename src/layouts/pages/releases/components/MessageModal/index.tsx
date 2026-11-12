import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

interface Props {
  message?: any;
  onClose?: any;
}
const MessageModal = ({ message, onClose }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <Dialog
      PaperProps={{
        style: {
          minHeight: "350px",
          minWidth: isMobile ? "100%" : "500px",
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
            Comments
          </MDTypography>
        </DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MDBox>
      <DialogContent
        sx={{
          textAlign: "justify",
          boxShadow:
            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px !important",
          margin: "0px 15px 15px 15px",
          borderRadius: "6px",
        }}
      >
        {message}
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
