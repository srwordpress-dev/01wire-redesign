import { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

export interface DetailRow {
  label: string;
  value?: ReactNode;
}

// Read-only popup listing label/value pairs for a table row
const DetailsModal = ({
  title,
  rows,
  onClose,
}: {
  title: string;
  rows: DetailRow[];
  onClose: any;
}) => {
  return (
    <Dialog maxWidth="sm" fullWidth open onClose={onClose}>
      <MDBox display="flex" alignItems="center" justifyContent="space-between">
        <DialogTitle>
          <MDTypography fontSize="16px" fontWeight="medium">
            {title}
          </MDTypography>
        </DialogTitle>
        <IconButton aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MDBox>
      <Divider sx={{ my: 0 }} />
      <DialogContent>
        {rows.map(({ label, value }) => (
          <MDBox
            key={label}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 0.25, sm: 2 }}
            py={1}
          >
            <MDTypography
              fontSize="14px"
              fontWeight="medium"
              color="text"
              sx={{ minWidth: { sm: "160px" } }}
            >
              {label}
            </MDTypography>
            <MDTypography fontSize="14px" sx={{ wordBreak: "break-word" }}>
              {value === undefined || value === null || value === "" ? "-" : value}
            </MDTypography>
          </MDBox>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
