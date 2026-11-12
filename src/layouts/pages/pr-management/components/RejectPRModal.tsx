import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import {
  UPDATE_ARTICLE_STATUS,
  IUpdateArticleStatusVars,
} from "graphql/mutations/updateArticleStatus";

const RejectPR = ({ id, onClose, status }: { id: string; onClose: any; status: string }) => {
  const [rejectionReason, setReason] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updateArticleStatus] = useMutation<IUpdateArticleStatusVars>(UPDATE_ARTICLE_STATUS);
  const handleSubmit = () => {
    setLoading(true);
    updateArticleStatus({
      variables: {
        params: {
          id,
          status,
          notes: rejectionReason,
        },
      },
    })
      .then((res: any) => {
        setLoading(false);
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.message);
      });
  };

  return (
    <>
      <Dialog maxWidth="md" open onClose={onClose}>
        {loading && <MDCircularLoader overlayloader startLoader />}
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Update Status
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent>
          <MDBox sx={{ width: "600px", margin: "0 auto", padding: "20px" }}>
            <TextField
              label="Reason"
              multiline
              rows={6}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setReason(e?.target?.value);
              }}
            />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <MDButton
            sx={{ margin: "auto" }}
            variant="contained"
            color="primary"
            disabled={!rejectionReason}
            onClick={handleSubmit}
          >
            Submit
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RejectPR;
