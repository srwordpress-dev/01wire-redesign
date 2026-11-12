import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import MDButton from "components/MDButton";
import { TermsAndConditionsList } from "constants/index";
import MDBox from "components/MDBox";
import { CREATE_TRANSACTION, ICreateTransactionVars } from "graphql/mutations/createTransaction";

const TermsAndConditionsDialog = ({
  kind,
  onClose,
  setUrl,
}: {
  kind: string;
  onClose: any;
  setUrl: any;
}) => {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [createTransaction] = useMutation<ICreateTransactionVars>(CREATE_TRANSACTION);
  const handleBuyPackage = ({ kind }: { kind: string }) => {
    setLoading(true);
    createTransaction({
      variables: {
        params: {
          kind,
        },
      },
    })
      .then((res: any) => {
        console.log("res>>>", res?.data);
        // setUrl(res?.data?.createTransaction);
        window.open(res?.data?.createTransaction, "_blank", "noopener,noreferrer");
        setLoading(false);
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.message);
      });
  };
  const handleAgreeChange = (event: any) => {
    setAgree(event.target.checked);
  };

  return (
    <>
      <Dialog maxWidth="xs" open onClose={onClose}>
        {loading && <MDCircularLoader overlayloader startLoader />}
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>
            <MDTypography fontSize="16px" fontWeight="medium">
              Terms and Conditions
            </MDTypography>
          </DialogTitle>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        <DialogContent style={{ backgroundColor: "#f5f5f5" }}>
          <div style={{ paddingLeft: "16px" }}>
            {TermsAndConditionsList?.map((one, i) => {
              return (
                <MDTypography
                  fontSize="12px"
                  fontWeight="regular"
                  sx={{ color: "rgba(73, 73, 73, 1)" }}
                  key={i}
                >
                  <strong>&bull;</strong>
                  {one}
                </MDTypography>
              );
            })}
          </div>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <FormControlLabel
            control={<Checkbox checked={agree} onChange={handleAgreeChange} />}
            label="I Agree all the above mentioned Terms & Conditions"
          />
          <MDButton
            sx={{ margin: "auto" }}
            variant="contained"
            color="primary"
            disabled={!agree}
            onClick={() => handleBuyPackage({ kind })}
          >
            Proceed to Pay
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TermsAndConditionsDialog;
