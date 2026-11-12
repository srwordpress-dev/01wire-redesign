import { useState } from "react";
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
import MDInput from "components/MDInput";
import { UPDATE_WALLET_BALANCE } from "graphql/mutations/updateWalletBalance";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import MDCircularLoader from "components/MDCircularLoader";

const UpdateBalanceModal = ({
  onClose,
  userId,
  refetch,
}: {
  onClose: any;
  userId: any;
  refetch: any;
}) => {
  const [credits, setCredits] = useState<number>();
  const [notes, setNotes] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [updateBalance] = useMutation(UPDATE_WALLET_BALANCE);
  const hanldeSubmit = (type: string) => {
    setLoader(true);
    updateBalance({
      variables: {
        params: {
          amount: type === "Credit" ? credits : -credits,
          notes,
          userId,
        },
      },
    })
      .then(() => {
        refetch();
        setLoader(false);
        toast.success("updated successfully");
        onClose();
      })
      .catch((err) => {
        setLoader(false);
        toast.error(err?.message);
      });
  };
  return (
    <>
      <Dialog maxWidth="sm" open onClose={onClose}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Debit/Credit Wallet
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent sx={{ width: "454px" }}>
          {loader && <MDCircularLoader startLoader overlayloader />}
          <MDTypography
            component="label"
            sx={{ mb: "1rem", fontWeight: "500" }}
            fontSize="14px"
            color="textSecondary"
          >
            Credits
          </MDTypography>
          <MDInput
            fullWidth
            type="number"
            onChange={(e: any) => setCredits(Number(e.target.value))}
            value={credits}
          />
          <MDTypography
            component="label"
            sx={{ mb: "1rem", fontWeight: "500" }}
            fontSize="14px"
            color="textSecondary"
          >
            Notes
          </MDTypography>
          <MDInput
            fullWidth
            type="text"
            onChange={(e: any) => setNotes(e.target.value)}
            value={notes}
          />
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <MDButton sx={{ margin: "auto" }} variant="outlined" color="primary" onClick={onClose}>
            Cancel
          </MDButton>
          <MDButton
            disabled={credits <= 0 || !notes}
            sx={{ margin: "auto" }}
            variant="contained"
            color="success"
            onClick={() => hanldeSubmit("Credit")}
          >
            Credit
          </MDButton>
          <MDButton
            sx={{ margin: "auto" }}
            variant="contained"
            color="primary"
            disabled={credits <= 0 || !notes}
            onClick={() => hanldeSubmit("Debit")}
          >
            Debit
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateBalanceModal;
