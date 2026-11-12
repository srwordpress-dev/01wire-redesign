import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import {
  GET_PUBLICATION_SETTINGS,
  IGetPublicationSettings,
} from "graphql/queries/getPublicationSettings";
import {
  UPDATE_PUBLICATION_SETTINGS,
  IUpdatePublicationSettings,
  IUpdatePublicationSettingsVars,
} from "graphql/mutations/updatePublicationSettings";
import { calcClientPrice, toNumberOrNull } from "./pricing";

type Field = "markupPercent" | "gstPercent" | "usdInrRate";
const FIELDS: { key: Field; label: string; min: number; max: number; help: string }[] = [
  { key: "markupPercent", label: "Default markup %", min: 0, max: 1000, help: "0 – 1000" },
  { key: "gstPercent", label: "GST %", min: 0, max: 100, help: "0 – 100" },
  { key: "usdInrRate", label: "USD → INR rate", min: 0.0001, max: 10000, help: "₹ per $1" },
];

const PricingSettingsDialog = ({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { data, loading } = useQuery<IGetPublicationSettings>(GET_PUBLICATION_SETTINGS, {
    fetchPolicy: "network-only",
  });
  const [save, { loading: saving }] = useMutation<
    IUpdatePublicationSettings,
    IUpdatePublicationSettingsVars
  >(UPDATE_PUBLICATION_SETTINGS, {
    refetchQueries: [{ query: GET_PUBLICATION_SETTINGS }],
  });
  const [vals, setVals] = useState<Record<Field, string>>({
    markupPercent: "",
    gstPercent: "",
    usdInrRate: "",
  });
  const [confirming, setConfirming] = useState(false);
  const settings = data?.getPublicationSettings;

  useEffect(() => {
    if (!settings) return;
    setVals({
      markupPercent: String(settings.markupPercent),
      gstPercent: String(settings.gstPercent),
      usdInrRate: String(settings.usdInrRate),
    });
  }, [settings]);

  const errors: Partial<Record<Field, string>> = {};
  FIELDS.forEach(({ key, label, min, max }) => {
    const n = toNumberOrNull(vals[key]);
    if (n == null) errors[key] = `Enter the ${label.toLowerCase()}`;
    else if (!Number.isFinite(n)) errors[key] = "Enter a number";
    else if (n < min || n > max) errors[key] = `Must be between ${min} and ${max}`;
  });
  const valid = !Object.keys(errors).length;
  const changed =
    !!settings && FIELDS.some(({ key }) => toNumberOrNull(vals[key]) !== Number(settings[key]));
  const next = valid
    ? {
        markupPercent: toNumberOrNull(vals.markupPercent),
        gstPercent: toNumberOrNull(vals.gstPercent),
        usdInrRate: toNumberOrNull(vals.usdInrRate),
      }
    : null;

  const onSave = () => {
    if (!next) return;
    save({ variables: { params: next } })
      .then(() => {
        toast.success("Pricing saved. Vendor-priced publications were re-priced.");
        setConfirming(false);
        onSaved?.();
        onClose();
      })
      .catch((err: any) => toast.error(err?.message));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      {(loading || saving) && <MDCircularLoader overlayloader startLoader />}
      <MDBox display="flex" alignItems="center" justifyContent="space-between" pr={1}>
        <DialogTitle>
          <MDTypography fontSize="18px" fontWeight="medium">
            Pricing settings
          </MDTypography>
          <MDTypography fontSize="13px" color="text">
            Defaults used to turn a vendor price (₹) into credits ($1 = 1 credit).
          </MDTypography>
        </DialogTitle>
        <IconButton aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MDBox>
      <DialogContent>
        <Grid container spacing={2}>
          {FIELDS.map(({ key, label, help }) => (
            <Grid item xs={12} sm={4} key={key}>
              <MDTypography component="label" fontSize="13px" fontWeight="medium">
                {label}
              </MDTypography>
              <MDInput
                fullWidth
                value={vals[key]}
                inputProps={{ inputMode: "decimal", "aria-label": label, name: key }}
                onChange={(e: any) => setVals({ ...vals, [key]: e.target.value })}
                error={!!errors[key]}
              />
              <MDTypography fontSize="12px" color={errors[key] ? "error" : "text"}>
                {errors[key] || help}
              </MDTypography>
            </Grid>
          ))}
        </Grid>
        <MDBox mt={2}>
          <MDTypography fontSize="13px" color="text">
            Example: a ₹10,000 vendor price ={" "}
            <strong>{next ? calcClientPrice(10000, null, null, next as any) : "-"} credits</strong>{" "}
            with these defaults.
          </MDTypography>
          <MDTypography fontSize="12px" color="text" mt={0.5}>
            Last updated:{" "}
            {settings?.updatedAt ? dayjs(settings.updatedAt).format("DD MMM YYYY, h:mm A") : "never"}
          </MDTypography>
        </MDBox>
        <Alert severity="warning" sx={{ mt: 2, fontSize: "13px" }}>
          Saving re-prices <strong>every</strong> publication that has a vendor price, straight
          away, including ones customers can see. Publications with their own markup or GST keep
          that override; publications priced directly in credits are not changed.
        </Alert>
        {confirming && (
          <Alert severity="error" sx={{ mt: 2, fontSize: "13px" }}>
            Re-price all vendor-priced publications now? Click <strong>Yes, re-price</strong> to
            continue.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: "wrap" }}>
        <MDButton variant="outlined" color="primary" onClick={onClose}>
          Cancel
        </MDButton>
        {confirming ? (
          <MDButton variant="contained" color="error" disabled={saving} onClick={onSave}>
            Yes, re-price
          </MDButton>
        ) : (
          <MDButton
            variant="contained"
            color="primary"
            disabled={!valid || !changed}
            onClick={() => setConfirming(true)}
          >
            Save
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PricingSettingsDialog;
