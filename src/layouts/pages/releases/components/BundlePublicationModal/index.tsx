import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PublicationsList from "../PublicationsList";

interface Props {
  onClose?: any;
  currentPublications: string[];
}
const BundlePublicationModal = ({ onClose, currentPublications }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <Dialog
      PaperProps={{
        style: {
          height: "400px",
          minWidth: isMobile ? "100%" : "1000px",
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
            Publications
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
        <PublicationsList
          entriesPerPage={false}
          showCreditsColumn={false}
          publications={currentPublications}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BundlePublicationModal;
