import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDLabel from "components/MDLabel";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormField from "layouts/pages/releases/components/FormField";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { CREATE_PUBLICATION, ICreatePublicationVars } from "graphql/mutations/createPublication";
import { UPDATE_PUBLICATION, IUpdatePublicationVars } from "graphql/mutations/updatePublication";
import {
  BULK_UPDATE_PUBLICATIONS,
  IBulkUpdatePublicationsVars,
} from "graphql/mutations/bulkUpdatePublications";
import {
  GET_PUBLICATION_ADMIN,
  IGetPublicationAdmin,
  AdminPublication,
} from "graphql/queries/filterPublicationsAdmin";
import {
  GET_PUBLICATION_SETTINGS,
  IGetPublicationSettings,
} from "graphql/queries/getPublicationSettings";
import { genericValidations } from "utils/helpers";
import { TimelineOptions, CategoryOptions, MAX_IMAGE_SIZE_MB } from "constants/index";
import { calcClientPrice, formatInr, toNumberOrNull } from "../pricing";
import { buildVariantLabel } from "../importRows";
import { LANGUAGE_OPTIONS, SECTION_OPTIONS } from "../Filters";

export const TOPIC_OPTIONS = [
  { label: "Crypto", value: "crypto" },
  { label: "News & media", value: "news-media" },
  { label: "Technology", value: "technology" },
  { label: "Business", value: "business" },
  { label: "Finance", value: "finance" },
  { label: "Health", value: "health" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Sports", value: "sports" },
  { label: "Education", value: "education" },
  { label: "Auto", value: "auto" },
  { label: "Real estate", value: "real-estate" },
  { label: "Travel", value: "travel" },
  { label: "Gaming & casino", value: "gaming-casino" },
  { label: "Regional", value: "regional" },
];
const LINK_TYPE_OPTIONS = [
  { label: "Do-follow", value: "DO_FOLLOW" },
  { label: "No-follow", value: "NO_FOLLOW" },
];
const TIER_OPTIONS = ["Standard", "Corporate", "Author", "Author Article", "Brand Post", "Organic"];
const VALIDITY_OPTIONS = ["Standard", "Permanent", "1 Year", "6 Months", "3 Months"];
const INDEXED_OPTIONS = ["Yes", "No", "Maybe"];
const DOMAIN_RE = /^[a-z0-9.-]+\.[a-z]{2,}$/;

// Text fields sent as-is (trimmed; blank = not set)
const TEXT_FIELDS = [
  "title",
  "domain",
  "variantLabel",
  "url",
  "image",
  "description",
  "sampleUrl",
  "tat",
  "indexed",
  "backlinks",
  "language",
  "tier",
  "section",
  "validity",
  "niche",
  "wordsAllowed",
  "disclaimer",
  "sourceVendor",
  "internalNotes",
] as const;
const STAT_FIELDS = ["da", "pa", "dr", "ur", "traffic"] as const;
const PRICE_FIELDS = ["vendorPriceInr", "markupPercent", "gstPercent", "price"] as const;

const EMPTY: Record<string, any> = {
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""])),
  ...Object.fromEntries(STAT_FIELDS.map((f) => [f, ""])),
  ...Object.fromEntries(PRICE_FIELDS.map((f) => [f, ""])),
  topics: [],
  categories: CategoryOptions.filter((c) => c.value === "GENERAL"),
  linkType: null,
  timeline: null,
};

// ---- validation rules (react-hook-form) ----
const numberRule = (label: string, { min = 0, max, int = false }: any = {}) => ({
  validate: (v: any) => {
    const n = toNumberOrNull(v);
    if (n == null) return true;
    if (!Number.isFinite(n)) return `${label} must be a number`;
    if (int && !Number.isInteger(n)) return `${label} must be a whole number`;
    if (n < min) return `${label} can't be less than ${min}`;
    if (max != null && n > max) return `${label} can't be more than ${max}`;
    return true;
  },
});
const maxLen = (n: number) => ({
  maxLength: { value: n, message: `Keep it under ${n} characters` },
});
const urlRule = {
  pattern: {
    value: /^https?:\/\/[^\s"]+\.[^\s"]+$/i,
    message: "Enter a full URL starting with https://",
  },
};

const toForm = (p: AdminPublication) => {
  const s = (v: any) => (v === null || v === undefined ? "" : String(v));
  return {
    ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, s((p as any)[f])])),
    ...Object.fromEntries(STAT_FIELDS.map((f) => [f, s(p.stats?.[f] || "")])),
    ...Object.fromEntries(PRICE_FIELDS.map((f) => [f, s((p as any)[f])])),
    topics: TOPIC_OPTIONS.filter((t) => p.topics?.includes(t.value)),
    categories: CategoryOptions.filter((c) => p.categories?.includes(c.value)),
    linkType: LINK_TYPE_OPTIONS.find((o) => o.value === p.linkType) || null,
    timeline: TimelineOptions.find((o) => o.value === p.timeline) || null,
  };
};

// FormField with the label as the input's accessible name (text inputs only: the
// dropdowns pass these props to the Autocomplete input, which needs its own inputProps)
const Field = (props: any) =>
  props.type === "text" ? (
    <FormField {...props} inputProps={{ "aria-label": props.label, ...(props.inputProps || {}) }} />
  ) : (
    <FormField {...props} />
  );

// Text input with suggestions; any value can be typed
const SuggestField = ({
  name,
  label,
  options,
  control,
  disabled,
  errors,
  rules,
  placeholder,
}: any) => (
  <MDBox mb={2}>
    <MDLabel label={label} />
    <FormControl fullWidth>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            freeSolo
            options={options}
            value={value || ""}
            disabled={disabled}
            onChange={(e, v) => onChange(v || "")}
            onInputChange={(e, v, reason) => reason === "input" && onChange(v)}
            renderInput={(params) => (
              <MDInput
                {...params}
                placeholder={placeholder}
                inputProps={{ ...params.inputProps, "aria-label": label }}
              />
            )}
          />
        )}
      />
    </FormControl>
    <FormHelperText error>{errors?.[name]?.message}</FormHelperText>
  </MDBox>
);

const Section = ({ title, subtitle, children }: any) => (
  <MDBox mt={3}>
    <MDTypography variant="h6">{title}</MDTypography>
    {subtitle && (
      <MDTypography fontSize="13px" color="text">
        {subtitle}
      </MDTypography>
    )}
    <Divider sx={{ my: 1.5 }} />
    <Grid container columnSpacing={3}>
      {children}
    </Grid>
  </MDBox>
);

const PublicationForm = ({
  onClose,
  disabled = false,
  refetch,
  id,
}: {
  onClose: any;
  disabled?: any;
  refetch: any;
  id: any;
}) => {
  const isEdit = !!id && id !== true;
  const [loading, setLoading] = useState<boolean>(false);
  const {
    control,
    formState: { isDirty, errors, dirtyFields },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = useForm<Record<string, any>>({ defaultValues: EMPTY });

  const [createPublication] = useMutation<any, ICreatePublicationVars>(CREATE_PUBLICATION);
  const [updatePublication] = useMutation<any, IUpdatePublicationVars>(UPDATE_PUBLICATION);
  const [bulkUpdate] = useMutation<any, IBulkUpdatePublicationsVars>(BULK_UPDATE_PUBLICATIONS);
  const { data, loading: fetchLoading } = useQuery<IGetPublicationAdmin>(GET_PUBLICATION_ADMIN, {
    variables: { id },
    fetchPolicy: "network-only",
    skip: !isEdit,
  });
  const { data: settingsData } = useQuery<IGetPublicationSettings>(GET_PUBLICATION_SETTINGS);
  const settings = settingsData?.getPublicationSettings;
  const saved = data?.getPublicationById;

  useEffect(() => {
    if (saved) reset(toForm(saved));
  }, [saved]);

  const [vendorRaw, markupRaw, gstRaw] = useWatch({
    control,
    name: ["vendorPriceInr", "markupPercent", "gstPercent"],
  });
  const vendor = toNumberOrNull(vendorRaw);
  const markup = toNumberOrNull(markupRaw);
  const gst = toNumberOrNull(gstRaw);
  const vendorValid = vendor != null && Number.isFinite(vendor) && vendor >= 0;
  const usesVendorPrice = vendorRaw !== "" && vendorRaw != null;
  const preview =
    vendorValid &&
    (markup == null || Number.isFinite(markup)) &&
    (gst == null || Number.isFinite(gst))
      ? calcClientPrice(vendor, markup, gst, settings)
      : null;
  const effMarkup = markup ?? settings?.markupPercent;
  const effGst = gst ?? settings?.gstPercent;

  const suggestLabel = () => {
    const v = getValues();
    setValue(
      "variantLabel",
      buildVariantLabel({
        language: v.language,
        tier: v.tier,
        section: v.section,
        backlinks: v.backlinks,
        linkType: v.linkType?.value,
        validity: v.validity,
      }),
      { shouldDirty: true }
    );
  };

  const onSubmit = async (formVals: Record<string, any>) => {
    if (!isDirty) {
      toast.info("Nothing to save");
      return;
    }
    const all: Record<string, any> = {};
    TEXT_FIELDS.forEach((f) => {
      const v = String(formVals[f] ?? "").trim();
      all[f] = v === "" ? null : v;
    });
    if (all.domain) all.domain = all.domain.toLowerCase();
    PRICE_FIELDS.forEach((f) => (all[f] = toNumberOrNull(formVals[f])));
    if (all.vendorPriceInr != null) all.price = null; // calculated by the server
    all.stats = Object.fromEntries(
      STAT_FIELDS.map((f) => [f, Math.round(toNumberOrNull(formVals[f]) ?? 0)])
    );
    all.topics = (formVals.topics || []).map((t: any) => t.value);
    all.categories = (formVals.categories || []).map((c: any) => c.value);
    all.linkType = formVals.linkType?.value ?? null;
    all.timeline = formVals.timeline?.value ?? null;

    let params: Record<string, any>;
    if (isEdit) {
      // Only what changed; the server ignores blanks, so clearing a field keeps the old value
      params = { id };
      Object.keys(all).forEach((k) => {
        const dirty =
          k === "stats"
            ? STAT_FIELDS.some((f) => (dirtyFields as any)[f])
            : (dirtyFields as any)[k];
        if (dirty) params[k] = all[k];
      });
    } else {
      params = Object.fromEntries(
        Object.entries(all).filter(([, v]) => v !== null && !(Array.isArray(v) && !v.length))
      );
      if (!params.categories) params.categories = ["GENERAL"];
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updatePublication({ variables: { params: params as any } });
        // Blank markup = back to the default; the update mutation can't clear a value
        if (
          dirtyFields.markupPercent &&
          all.markupPercent == null &&
          saved?.markupPercent != null
        ) {
          await bulkUpdate({
            variables: { params: { ids: [id], action: "SET_MARKUP", markupPercent: null } },
          });
        }
      } else {
        await createPublication({ variables: { params: params as any } });
      }
      toast.success(isEdit ? "Saved" : "Publication created (hidden until you publish it)");
      refetch();
      onClose();
    } catch (err: any) {
      toast.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const common = { control, errors, disabled, variant: "outlined" };
  const half = { item: true, xs: 12, sm: 6 } as const;
  const third = { item: true, xs: 6, sm: 4, md: 2.4 } as const;

  return (
    <>
      <MDBox p={2}>
        <MDBox display="flex" alignItems="center">
          <IconButton aria-label="Back to publications" onClick={onClose}>
            <ArrowBackIosIcon />
          </IconButton>
          <MDTypography variant="h5">
            {disabled ? "View Publication" : isEdit ? "Edit Publication" : "Create Publication"}
          </MDTypography>
        </MDBox>
        {(loading || fetchLoading) && <MDCircularLoader overlayloader startLoader />}
        {!isEdit && (
          <Alert severity="info" sx={{ mt: 2, fontSize: "13px" }}>
            New publications are saved hidden (suppressed). Publish them from the list when ready.
          </Alert>
        )}

        <Section
          title="Website & offering"
          subtitle="One publication = one offering of a website. Offerings of the same site share the domain and differ by the offering label."
        >
          <Grid {...half}>
            <Field
              type="text"
              label="Title"
              name="title"
              placeholder="e.g. Times of Example"
              rules={{ ...genericValidations.text, ...maxLen(200) }}
              {...common}
            />
            <Field
              type="text"
              label="Domain"
              name="domain"
              placeholder="example.com"
              rules={{
                ...(!isEdit || saved?.domain
                  ? { required: "Enter the domain, e.g. example.com" }
                  : {}),
                validate: (v: string) =>
                  !v?.trim() ||
                  DOMAIN_RE.test(v.trim().toLowerCase()) ||
                  "Enter a domain like example.com (no https://, www or /path)",
              }}
              {...common}
            />
            <MDBox display="flex" alignItems="flex-start" gap={1}>
              <MDBox flex={1}>
                <Field
                  type="text"
                  label="Offering label"
                  name="variantLabel"
                  placeholder="Standard article"
                  subLabel="Unique per domain, e.g. “Hindi · 2 backlinks · Do-follow”. Blank = Standard."
                  rules={maxLen(100)}
                  {...common}
                />
              </MDBox>
              {!disabled && (
                <MDButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mt: 3.5, whiteSpace: "nowrap" }}
                  onClick={suggestLabel}
                >
                  Suggest
                </MDButton>
              )}
            </MDBox>
            <Field
              type="text"
              label="Website URL"
              name="url"
              placeholder="https://example.com (defaults to the domain)"
              rules={urlRule}
              {...common}
            />
          </Grid>
          <Grid {...half}>
            <Field
              type="file"
              subLabel={`Optional. JPEG, PNG, SVG (max. ${MAX_IMAGE_SIZE_MB}MB). Without a logo the marketplace shows the site's initials.`}
              name="image"
              label="Logo"
              control={control}
              defaultValue={saved?.image}
              disabled={disabled}
              errors={errors}
            />
          </Grid>
        </Section>

        <Section title="Listing details" subtitle="What customers see on the marketplace.">
          <Grid item xs={12}>
            <Field
              type="text"
              label="Description"
              name="description"
              multiline
              minRows={2}
              placeholder="Short description shown on the listing"
              rules={maxLen(300)}
              {...common}
            />
          </Grid>
          <Grid {...half}>
            <Field
              type="multiSelect"
              label="Topics"
              name="topics"
              options={TOPIC_OPTIONS}
              rules={{ validate: (v: any[]) => (v?.length || 0) <= 10 || "Pick at most 10 topics" }}
              {...common}
            />
          </Grid>
          <Grid {...half}>
            <Field
              type="multiSelect"
              label="Categories"
              name="categories"
              options={CategoryOptions}
              rules={genericValidations.dropdown}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SuggestField
              name="language"
              label="Language"
              options={LANGUAGE_OPTIONS}
              placeholder="English"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SuggestField
              name="tier"
              label="Tier"
              options={TIER_OPTIONS}
              placeholder="Standard"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SuggestField
              name="section"
              label="Section"
              options={SECTION_OPTIONS}
              placeholder="General"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="dropdown"
              label="Link type"
              name="linkType"
              placeholder="Not specified"
              options={LINK_TYPE_OPTIONS}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="text"
              label="Backlinks"
              name="backlinks"
              placeholder="e.g. 2, 1-2, 0"
              rules={maxLen(20)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SuggestField
              name="validity"
              label="Validity"
              options={VALIDITY_OPTIONS}
              placeholder="Standard"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="text"
              label="TAT"
              name="tat"
              placeholder="e.g. 48 hrs, 3–5 days"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="dropdown"
              label="Timeline (order deadline)"
              name="timeline"
              placeholder="Auto from TAT"
              options={TimelineOptions}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SuggestField
              name="indexed"
              label="Indexed"
              options={INDEXED_OPTIONS}
              placeholder="Yes / No / Maybe"
              rules={maxLen(100)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="text"
              label="Niche / category"
              name="niche"
              rules={maxLen(100)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="text"
              label="Words allowed"
              name="wordsAllowed"
              placeholder="e.g. 800"
              rules={maxLen(40)}
              {...common}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Field
              type="text"
              label="Disclaimer"
              name="disclaimer"
              placeholder="e.g. No, Yes"
              rules={maxLen(60)}
              {...common}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              type="text"
              label="Sample article URL"
              name="sampleUrl"
              placeholder="https://example.com/sample-article"
              rules={urlRule}
              {...common}
            />
          </Grid>
          {STAT_FIELDS.map((f) => (
            <Grid {...third} key={f}>
              <Field
                type="text"
                label={f === "traffic" ? "Traffic" : f.toUpperCase()}
                name={f}
                inputProps={{ inputMode: "numeric" }}
                rules={numberRule(f === "traffic" ? "Traffic" : f.toUpperCase(), {
                  int: true,
                  max: f === "traffic" ? undefined : 100,
                })}
                {...common}
              />
            </Grid>
          ))}
        </Section>

        <Section
          title="Pricing"
          subtitle="Client price (credits, $1 = 1 credit) = vendor ₹ × (1 + markup) × (1 + GST) ÷ USD rate, rounded up."
        >
          <Grid item xs={12} sm={4}>
            <Field
              type="text"
              label="Vendor price (₹)"
              name="vendorPriceInr"
              placeholder="e.g. 5000"
              inputProps={{ inputMode: "decimal" }}
              rules={{
                validate: (v: any) => {
                  const n = toNumberOrNull(v);
                  if (n == null)
                    return saved?.vendorPriceInr != null
                      ? "A vendor price can't be removed once set; enter a value"
                      : true;
                  if (!Number.isFinite(n)) return "Vendor price must be a number";
                  if (n < 0) return "Vendor price can't be negative";
                  return true;
                },
              }}
              {...common}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Field
              type="text"
              label="Markup % (override)"
              name="markupPercent"
              placeholder={settings ? `Default ${settings.markupPercent}%` : "Default"}
              inputProps={{ inputMode: "decimal" }}
              subLabel="Blank = default markup"
              rules={numberRule("Markup", { max: 1000 })}
              {...common}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Field
              type="text"
              label="GST % (override)"
              name="gstPercent"
              placeholder={settings ? `Default ${settings.gstPercent}%` : "Default"}
              inputProps={{ inputMode: "decimal" }}
              subLabel="Blank = default GST"
              rules={{
                validate: (v: any) => {
                  if (toNumberOrNull(v) == null && saved?.gstPercent != null)
                    return "A GST override can't be cleared here; enter a value";
                  return numberRule("GST", { max: 100 }).validate(v);
                },
              }}
              {...common}
            />
          </Grid>
          <Grid item xs={12}>
            {usesVendorPrice ? (
              <MDBox
                p={2}
                mb={2}
                borderRadius="lg"
                sx={{ background: "#F8F8FC", border: "1px solid #eee" }}
                aria-live="polite"
                data-testid="price-preview"
              >
                {preview != null && settings ? (
                  <>
                    <MDTypography fontSize="14px">
                      Client price: <strong style={{ fontSize: 18 }}>{preview} credits</strong>
                    </MDTypography>
                    <MDTypography fontSize="12px" color="text" mt={0.5}>
                      {formatInr(vendor)} × (1 + {effMarkup}%{markup == null ? " default" : ""}) ×
                      (1 + {effGst}%{gst == null ? " default" : ""}) ÷ {settings.usdInrRate} ={" "}
                      {(
                        (vendor * (1 + effMarkup / 100) * (1 + effGst / 100)) /
                        settings.usdInrRate
                      ).toFixed(2)}{" "}
                      → rounded up to {preview}
                    </MDTypography>
                    {isEdit && saved?.price != null && saved.price !== preview && (
                      <MDTypography fontSize="12px" color="text" mt={0.5}>
                        Currently saved: {saved.price} credits
                      </MDTypography>
                    )}
                  </>
                ) : (
                  <MDTypography fontSize="13px" color="text">
                    {settings
                      ? "Enter valid numbers to see the client price."
                      : "Loading pricing settings…"}
                  </MDTypography>
                )}
              </MDBox>
            ) : (
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={4}>
                  <Field
                    type="text"
                    label="Price (credits)"
                    name="price"
                    inputProps={{ inputMode: "numeric" }}
                    subLabel="Only for publications without a vendor price"
                    rules={{
                      required: "Enter a vendor price (₹) or a price in credits",
                      ...numberRule("Price", { min: 1, int: true }),
                    }}
                    {...common}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Section>

        <Section title="Internal" subtitle="Admin only, never shown to customers.">
          <Grid {...half}>
            <Field
              type="text"
              label="Source vendor"
              name="sourceVendor"
              rules={maxLen(100)}
              {...common}
            />
            {saved?.importBatch && (
              <MDTypography fontSize="13px" color="text">
                Import batch: <strong>{saved.importBatch}</strong>
              </MDTypography>
            )}
          </Grid>
          <Grid {...half}>
            <Field
              type="text"
              label="Internal notes"
              name="internalNotes"
              multiline
              minRows={3}
              rules={maxLen(2000)}
              {...common}
            />
          </Grid>
        </Section>
      </MDBox>
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        bgColor="white"
        sx={{
          position: "sticky",
          bottom: 0,
          padding: "1rem",
          zIndex: 2,
          boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        }}
      >
        <MDButton
          sx={{
            height: "40px !important",
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px !important",
          }}
          size="small"
          variant="outlined"
          color="light"
          onClick={onClose}
        >
          <MDTypography fontWeight="regular" fontSize="14px">
            {disabled ? "Close" : "Cancel"}
          </MDTypography>
        </MDButton>
        {!disabled && (
          <MDButton color="primary" variant="contained" onClick={handleSubmit(onSubmit)}>
            {isEdit ? "Save changes" : "Create publication"}
          </MDButton>
        )}
      </MDBox>
    </>
  );
};
export default PublicationForm;
