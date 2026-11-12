import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { GET_BUNDLE_BY_ID, IGetBundleByIdVars } from "graphql/queries/getBundleById";
import { CREATE_BUNDLE, ICreateBundleVars } from "graphql/mutations/createBundle";
import { UPDATE_BUNDLE, IUpdateBundleVars } from "graphql/mutations/updateBundle";
import { PackageTierOptions } from "constants/index";

// Admin form for a PR package: name, tier, media list and vendor price.
// Credits are worked out on the server from the vendor price (markup + GST + rate),
// the same way as Marketplace publications.

const EMPTY = {
  name: "",
  tier: "",
  packageType: "",
  media: "",
  coverage: "",
  contentRule: "",
  backlinks: "",
  disclaimer: "",
  language: "",
  tat: "",
  description: "",
  vendor: "",
  vendorPackageName: "",
  vendorPriceInr: "",
  markupPercent: "",
  internalNotes: "",
  source: "",
  featured: false as boolean,
  featuredRank: "",
  sample1: "",
  sample2: "",
  sample3: "",
};
const SAMPLE_KEYS = ["sample1", "sample2", "sample3"] as const;
// Fields a live package may change without being suppressed first
const LIVE_EDITABLE = ["featured", "featuredRank", ...SAMPLE_KEYS] as string[];
const isLink = (v: string) => /^https?:\/\/\S+\.\S+$/i.test(v.trim());
type Values = typeof EMPTY;
const TEXT_KEYS: (keyof Values)[] = ["name", "tier", "packageType", "coverage", "contentRule", "backlinks", "disclaimer", "language", "tat", "description", "vendor", "vendorPackageName", "internalNotes", "source"];

const splitMedia = (text: string) =>
  text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

const BundleForm = ({ onClose, disabled = false, refetch, id }: { onClose: any; disabled?: any; refetch: any; id: any }) => {
  const editing = !!id && id !== true;
  const [values, setValues] = useState<Values>(EMPTY);
  const [initial, setInitial] = useState<Values>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [createBundle] = useMutation<ICreateBundleVars>(CREATE_BUNDLE);
  const [updateBundle] = useMutation<IUpdateBundleVars>(UPDATE_BUNDLE);
  const { data, loading } = useQuery<IGetBundleByIdVars>(GET_BUNDLE_BY_ID, {
    variables: { id },
    fetchPolicy: "network-only",
    skip: !editing,
  });
  const existing = data?.getBundleById;

  useEffect(() => {
    if (!existing) return;
    const v: any = { ...EMPTY };
    TEXT_KEYS.forEach((k) => (v[k] = existing[k] ?? ""));
    v.media = (existing.media?.length ? existing.media.map((m: any) => m.name) : (existing.publicationInfo || []).map((p: any) => p.title)).join("\n");
    v.vendorPriceInr = existing.vendorPriceInr ?? "";
    v.markupPercent = existing.markupPercent ?? "";
    v.featured = !!existing.featured;
    v.featuredRank = existing.featuredRank && existing.featuredRank < 999 ? String(existing.featuredRank) : "";
    SAMPLE_KEYS.forEach((k, i) => (v[k] = existing.sampleUrls?.[i] || ""));
    setValues(v);
    setInitial(v);
  }, [existing]);

  const set = (k: keyof Values) => (e: any) => setValues((p) => ({ ...p, [k]: e.target.value }));
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = "Enter a package name";
  if (!splitMedia(values.media).length) errors.media = "Add at least one media name";
  if (!(Number(values.vendorPriceInr) > 0)) errors.vendorPriceInr = "Enter the vendor price in ₹";
  if (values.markupPercent !== "" && !(Number(values.markupPercent) >= 0)) errors.markupPercent = "Enter 0 or more";
  if (values.featuredRank !== "" && !(Number(values.featuredRank) >= 1)) errors.featuredRank = "Enter 1 or more";
  SAMPLE_KEYS.forEach((k) => {
    if (values[k].trim() && !isLink(values[k])) errors[k] = "Enter a full link starting with https://";
  });
  const show = (k: keyof Values) => (touched ? errors[k] : undefined);

  const onSubmit = () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    if (JSON.stringify(values) === JSON.stringify(initial)) {
      toast.info("Nothing to save");
      return;
    }
    // Keep logos already matched to media names
    const images = new Map((existing?.media || []).map((m: any) => [m.name, m.image]));
    const params: any = {
      media: splitMedia(values.media).map((name) => ({ name, image: images.get(name) || null })),
      vendorPriceInr: Math.round(Number(values.vendorPriceInr)),
      markupPercent: values.markupPercent === "" ? null : Math.round(Number(values.markupPercent)),
      featured: !!values.featured,
      featuredRank: values.featured && values.featuredRank !== "" ? Math.round(Number(values.featuredRank)) : null,
      sampleUrls: SAMPLE_KEYS.map((k) => values[k].trim()).filter(Boolean),
    };
    TEXT_KEYS.forEach((k) => (params[k] = (values[k] as string).trim() || null));
    // A live package can only change its Popular setting and sample links; other edits need it suppressed
    const onlyFeatured =
      editing &&
      existing?.visibility === "PUBLISHED" &&
      Object.keys(EMPTY).every((k) => LIVE_EDITABLE.includes(k) || (values as any)[k] === (initial as any)[k]);
    if (onlyFeatured) {
      Object.keys(params).forEach((k) => !["featured", "featuredRank", "sampleUrls"].includes(k) && delete params[k]);
    }
    setSaving(true);
    (editing ? updateBundle({ variables: { params: { id, ...params } } }) : createBundle({ variables: { params } }))
      .then(() => {
        toast.success(editing ? "Package saved" : "Package created (hidden until you publish it)");
        refetch();
        onClose();
      })
      .catch((err: any) => toast.error(err?.message))
      .finally(() => setSaving(false));
  };

  const field = (k: keyof Values, label: string, extra: any = {}) => (
    <TextField
      fullWidth
      label={label}
      value={values[k]}
      onChange={set(k)}
      disabled={disabled}
      error={!!show(k)}
      margin="dense"
      {...extra}
      helperText={show(k) || extra.helperText}
    />
  );

  return (
    <>
      <MDBox p={2}>
        <MDBox display="flex" alignItems="center">
          <IconButton onClick={onClose} aria-label="Back to packages">
            <ArrowBackIosIcon />
          </IconButton>
          <MDTypography variant="h5">{disabled ? "View Package" : editing ? "Edit Package" : "Create Package"}</MDTypography>
        </MDBox>
        {(saving || loading) && <MDCircularLoader overlayloader startLoader />}
        {editing && existing && existing.visibility === "PUBLISHED" && !disabled && (
          <MDBox mt={2} p={1.5} sx={{ background: "#FFF4E5", borderRadius: "8px" }}>
            <MDTypography fontSize="14px">This package is live. You can change Popular and the sample links now; for other edits, set it to Suppressed in the list first.</MDTypography>
          </MDBox>
        )}
        <Grid container spacing={3} mt={0}>
          <Grid item xs={12} md={7}>
            <MDTypography variant="h6" mt={1}>
              What clients see
            </MDTypography>
            {field("name", "Package name *")}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                {field("tier", "Tier", {
                  select: true,
                  children: [
                    <MenuItem key="none" value="">
                      -
                    </MenuItem>,
                    ...PackageTierOptions.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    )),
                  ],
                })}
              </Grid>
              <Grid item xs={12} sm={7}>
                {field("packageType", "Package type", { helperText: "e.g. Wire (same article on all platforms)" })}
              </Grid>
            </Grid>
            {field("media", "Media included *", { multiline: true, minRows: 6, helperText: "One media name per line (or comma separated)" })}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {field("coverage", "Extra coverage", { helperText: "e.g. 250+ Medias" })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {field("language", "Language")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {field("contentRule", "Content rule")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {field("tat", "Turnaround (TAT)")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {field("backlinks", "Backlinks")}
              </Grid>
              <Grid item xs={12} sm={6}>
                {field("disclaimer", "Disclaimer")}
              </Grid>
            </Grid>
            {field("description", "Description", { multiline: true, minRows: 2 })}
            <MDTypography variant="h6" mt={2}>
              Sample reports
            </MDTypography>
            <MDTypography fontSize="13px" color="text">
              Up to 3 links (PDF, Google Drive or a live article). Clients see them as "View" on the package card.
            </MDTypography>
            {SAMPLE_KEYS.map((k, i) => (
              <MDBox key={k}>{field(k, `Sample link ${i + 1}`, { placeholder: "https://…", inputProps: { "data-testid": `sample-input-${i + 1}` } })}</MDBox>
            ))}
          </Grid>
          <Grid item xs={12} md={5}>
            <MDTypography variant="h6" mt={1}>
              Admin only
            </MDTypography>
            {field("vendor", "Vendor")}
            {field("vendorPackageName", "Vendor package name")}
            {field("vendorPriceInr", "Vendor price (₹) *", { type: "number" })}
            {field("markupPercent", "Markup % (blank = default)", { type: "number" })}
            <MDBox mt={1} p={1.5} sx={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!values.featured}
                    disabled={disabled}
                    onChange={(e) => setValues((p) => ({ ...p, featured: e.target.checked }))}
                  />
                }
                label="★ Popular (shown first to users)"
              />
              {values.featured &&
                field("featuredRank", "Popular order (1 = first)", { type: "number", helperText: "Blank = after the numbered ones" })}
              <MDTypography fontSize="12px" sx={{ color: "#7B809A" }}>
                This can be changed while the package is live.
              </MDTypography>
            </MDBox>
            {field("internalNotes", "Internal notes", { multiline: true, minRows: 2 })}
            {field("source", "Source")}
            {editing && existing && (
              <MDBox mt={2} p={1.5} sx={{ background: "#F8F9FA", borderRadius: "8px" }}>
                <MDTypography fontSize="14px">
                  Current price: <strong>{existing.price} credits</strong> (incl. GST). It is recalculated when the vendor price or markup changes.
                </MDTypography>
              </MDBox>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        bgColor="white"
        sx={{ position: "sticky", bottom: 0, padding: "1.25rem 1rem", boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px", zIndex: 1000 }}
      >
        <MDButton size="small" variant="outlined" color="dark" onClick={onClose}>
          {disabled ? "Close" : "Cancel"}
        </MDButton>
        {!disabled && (
          <MDButton color="primary" variant="contained" onClick={onSubmit}>
            {editing ? "Save" : "Create package"}
          </MDButton>
        )}
      </MDBox>
    </>
  );
};
export default BundleForm;
