import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// @mui material components
import Grid from "@mui/material/Grid";
import InfoIcon from "@mui/icons-material/Info";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDCircularLoader from "components/MDCircularLoader";
import CircularProgress from "@mui/material/CircularProgress";
import MDButton from "components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import FormHelperText from "@mui/material/FormHelperText";

import { useForm } from "react-hook-form";
import EditorialGuidelines from "../EditorialGuidelines";

// NewProduct page components
import FormField from "../FormField";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_ARTICLE, ICreateArticleVars } from "graphql/mutations/createArticle";
import { UPDATE_ARTICLE, IUpdateArticleVars } from "graphql/mutations/updateArticle";
import { GET_CLIENTS, IGetClientsVars, IGetClients } from "graphql/queries/filterClientsPaginated";
import { genericValidations } from "utils/helpers";
import { getErrorMessage } from "utils/errors";
import { MAX_IMAGE_SIZE_MB, countryList } from "constants/index";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { COMPANY_EMAIL_MESSAGE, isPersonalEmail } from "utils/companyEmail";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import ClientForm from "layouts/pages/clients/components/ClientForm";

// Matches the API limits (MAX_TITLE / MAX_SUMMARY / MAX_CONTENT)
const MAX_TITLE = 200;
const MAX_SUBHEADING = 1000;
const MAX_CONTENT = 100000;

interface Props {
  cb?: any;
  saveData?: boolean;
  data?: any;
  refetch?: () => void;
  disabled?: any;
  setSaveData?: any;
  // Live form values, used by the wizard's Preview
  onValuesChange?: (values: any) => void;
}

function AddPress({
  cb,
  saveData,
  data = {},
  refetch,
  disabled = false,
  setSaveData,
  onValuesChange,
}: Props): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [addClientOpen, setAddClientOpen] = useState<boolean>(false);
  const [openAutocomplete, setOpenAutocomplete] = useState<boolean>(false);
  const [showClientErr, setShowClientErr] = useState<boolean>(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { title, content, summary, featureImage, featureImageDesc, createdAt } = data || {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __typename, ...existingContact } = data?.mediaContact || {};
  const {
    control,
    formState: { isDirty, errors },
    reset,
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      clientId: null,
      title,
      content: content && `<div>${content}</div>`,
      summary,
      featureImage,
      featureImageDesc,
      city: existingContact.city,
      country: existingContact.country,
      contactName: existingContact.name,
      contactEmail: existingContact.email,
      contactPhone: existingContact.phone,
      website: existingContact.website,
    },
  });
  const titleLength = watch("title")?.length || 0;
  useEffect(() => {
    if (!onValuesChange) return undefined;
    onValuesChange(watch());
    const subscription = watch((values) => onValuesChange(values));
    return () => subscription.unsubscribe();
  }, [watch]);
  // Add a client without leaving the PR form; the new client is selected
  const handleAddClient = () => setAddClientOpen(true);
  const handleClientCreated = (client: any) => {
    if (client?.id) {
      setClient({ label: client.title, value: client.id });
      setShowClientErr(false);
    }
    setAddClientOpen(false);
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClient, setClient] = useState<any>(null);
  const [createArticle] = useMutation<ICreateArticleVars>(CREATE_ARTICLE);
  const [updateArticle] = useMutation<IUpdateArticleVars>(UPDATE_ARTICLE);
  const [fetchOptions, { data: clientsResult, loading: optionsLoading }] = useLazyQuery<
    IGetClients,
    IGetClientsVars
  >(GET_CLIENTS, {
    // Always fresh, so a client added in the popup (or elsewhere) is listed
    fetchPolicy: "network-only",
  });
  // Derived from the query result (replaces the deprecated onCompleted option)
  useEffect(() => {
    if (!clientsResult) return;
    const clientsObj: any = clientsResult?.filterClientsPaginated?.data?.map((el: any) => ({
      label: el?.title,
      value: el?.id,
    }));
    setOptions(clientsObj);
  }, [clientsResult]);
  const onSubmit = async (allVals: any) => {
    setLoading(true);
    const { city, country, contactName, contactEmail, contactPhone, website, ...formVals } =
      allVals;
    // The API replaces mediaContact as a whole, so keep the step-2 contact fields
    const mediaContact = {
      ...existingContact,
      city,
      country,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      website,
    };
    try {
      let res: any;
      if (data?.id) {
        res = await updateArticle({
          variables: {
            params: {
              id: data.id,
              ...formVals,
              clientId: selectedClient?.value,
              mediaContact,
            },
          },
        });
      } else {
        const { createdAt, ...articleParams } = formVals;
        res = await createArticle({
          variables: {
            params: {
              ...articleParams,
              clientId: selectedClient?.value,
              mediaContact,
            },
          },
        });
      }
      setLoading(false);
      toast.success("Saved Successfully");
      if (refetch) refetch();
      const resId = res?.data?.updateArticle?.id || res?.data?.createArticle?.id;
      cb(resId);
    } catch (err: any) {
      setLoading(false);
      console.error("Error in saving data:", err);
      toast.error(getErrorMessage(err));
      setSaveData(false);
    }
  };
  useEffect(() => {
    if (!saveData) return;
    // Read-only PRs can still report isDirty after load; never save them
    if (disabled) {
      cb();
      return;
    }
    // Validate on every Next (not only when dirty) so required fields always block it;
    // save only when something changed
    handleSubmit(
      (formVals) => {
        if (!selectedClient) {
          setShowClientErr(true);
          setSaveData(false);
        } else if (isDirty) {
          onSubmit(formVals);
        } else {
          cb();
        }
      },
      () => {
        if (!selectedClient) setShowClientErr(true);
        setSaveData(false);
      }
    )();
  }, [saveData]);

  useEffect(() => {
    if (data?.id) {
      const { clientInfo } = data;
      if (clientInfo) {
        setClient({
          label: clientInfo?.title,
          value: clientInfo?.id,
        });
      }
    }
  }, [data]);
  useEffect(() => {
    if (Object.keys(errors).length) {
      setSaveData(false);
    }
  }, [Object.keys(errors).length]);
  // Opening the dropdown lists all of the user's clients (API max 200);
  // typing searches by name. The selected client's label isn't a search.
  useEffect(() => {
    if (!openAutocomplete) return;
    const search = inputValue && inputValue !== selectedClient?.label ? inputValue : "";
    fetchOptions({
      variables: {
        filterInput: search ? { title: search } : {},
        paginationInput: {
          currentPage: 0,
          perPage: 200,
        },
      },
    });
  }, [openAutocomplete, inputValue]);
  const handleInputChange = (event: any, value: any) => {
    setInputValue(value);
  };
  return (
    <MDBox>
      {loading && <MDCircularLoader overlayloader startLoader />}
      {open && <EditorialGuidelines onClose={() => setOpen(false)} />}
      <MDTypography variant="h5">Product Information</MDTypography>
      <MDBox mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={7}>
            <MDBox>
              <MDBox display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography
                  component="label"
                  sx={{ mb: "0.5rem" }}
                  fontSize="1rem"
                  fontWeight="medium"
                  color="textSecondary"
                >
                  Client
                </MDTypography>
                {!disabled && (
                  <MDButton
                    variant="text"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddClient}
                  >
                    Add Client
                  </MDButton>
                )}
              </MDBox>
              <Autocomplete
                open={openAutocomplete}
                onOpen={() => setOpenAutocomplete(true)}
                onClose={() => setOpenAutocomplete(false)}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                onChange={(event, newValue) => {
                  setClient(newValue);
                }}
                disabled={disabled}
                value={selectedClient}
                options={options}
                getOptionLabel={(option: any) => option?.label}
                isOptionEqualToValue={(option: any, val: any) => option?.value === val?.value}
                loading={optionsLoading}
                noOptionsText={
                  <MDBox display="flex" alignItems="center" justifyContent="space-between">
                    {inputValue && inputValue !== selectedClient?.label
                      ? "No matching clients"
                      : "No clients yet"}
                    <MDButton
                      variant="text"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      // mousedown keeps the dropdown from closing before the click lands
                      onMouseDown={(e: any) => e.preventDefault()}
                      onClick={handleAddClient}
                    >
                      Add Client
                    </MDButton>
                  </MDBox>
                }
                renderInput={(params) => (
                  <MDInput
                    {...params}
                    variant="outlined"
                    sx={{
                      height: "42px",
                      "& .MuiInputBase-root": {
                        height: "42px",
                      },
                    }}
                    placeholder="Search Client"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {optionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              {!selectedClient && showClientErr && (
                <FormHelperText error={true}>Please fill value</FormHelperText>
              )}
            </MDBox>
            <FormField
              type="text"
              label="Title"
              name="title"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              subLabel={`${titleLength}/${MAX_TITLE} characters`}
              rules={{
                ...genericValidations.text,
                maxLength: {
                  value: MAX_TITLE,
                  message: `Title must be ${MAX_TITLE} characters or less`,
                },
              }}
            />
            <FormField
              type="text"
              label="Sub-heading (optional)"
              name="summary"
              control={control}
              multiline
              variant="outlined"
              disabled={disabled}
              rows={!disabled && 4}
              errors={errors}
              subLabel="A short line shown under the title"
              rules={{
                maxLength: {
                  value: MAX_SUBHEADING,
                  message: `Sub-heading must be ${MAX_SUBHEADING} characters or less`,
                },
              }}
            />
            {/* <FormField
              label="Created At"
              type="date"
              name="createdAt"
              control={control}
              disabled={disabled}
            /> */}
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormField
              type="file"
              subLabel={`JPEG, PNG, JPG (max. ${MAX_IMAGE_SIZE_MB}MB)`}
              name="featureImage"
              label="Feature Image (1280x720 pixels or 16:9)"
              control={control}
              defaultValue={data?.featureImage}
              disabled={disabled}
              errors={errors}
              rules={genericValidations.text}
            />
            <FormField
              type="text"
              placeholder="Image Description"
              name="featureImageDesc"
              control={control}
              variant="outlined"
              disabled={disabled}
            />
          </Grid>
        </Grid>
      </MDBox>
      <MDBox mt={2}>
        <MDTypography variant="h5">Location & Contact</MDTypography>
        <Grid container columnSpacing={3} mt={1}>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              label="City"
              name="city"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              rules={genericValidations.text}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="dropdown"
              placeholder="Select Country"
              label="Country"
              name="country"
              control={control}
              options={Object.keys(countryList)}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              rules={genericValidations.dropdown}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormField
              type="text"
              label="Contact Name"
              name="contactName"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              rules={genericValidations.text}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormField
              type="email"
              label="Contact Email"
              name="contactEmail"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              rules={{
                ...genericValidations.email,
                validate: (val: string) => !isPersonalEmail(val) || COMPANY_EMAIL_MESSAGE,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormField
              type="text"
              label="Contact Phone"
              name="contactPhone"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <LocalPhoneOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormField
              type="text"
              label="Website"
              name="website"
              control={control}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <LanguageOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </MDBox>
      {addClientOpen && (
        <Dialog open onClose={() => setAddClientOpen(false)} maxWidth="lg" fullWidth scroll="paper">
          <ClientForm
            embedded
            onClose={() => setAddClientOpen(false)}
            onSaved={handleClientCreated}
          />
        </Dialog>
      )}
      <MDBox mt={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <MDBox sx={{ mb: "0.5rem" }} display="flex" alignItems="center">
              <MDTypography
                component="label"
                fontSize="1rem"
                fontWeight="medium"
                color="textSecondary"
              >
                Press Release Content
              </MDTypography>
              <MDButton
                startIcon={<InfoIcon />}
                sx={{ ml: 1, borderRadius: "32px", height: "34px" }}
                color="primary"
                onClick={() => setOpen(true)}
              >
                <MDTypography
                  fontSize="14px"
                  sx={{ fontWeight: 400, color: "rgba(255, 255, 255, 1)" }}
                >
                  Editorial Guidelines
                </MDTypography>
              </MDButton>
            </MDBox>
            <FormField
              type="editor"
              name="content"
              control={control}
              label=""
              multiline
              rows={4}
              variant="outlined"
              disabled={disabled}
              errors={errors}
              rules={{
                ...genericValidations.text,
                validate: (html: string) =>
                  (html?.length || 0) <= MAX_CONTENT ||
                  `Content is too long: ${(
                    html?.length || 0
                  ).toLocaleString()} / ${MAX_CONTENT.toLocaleString()} characters`,
              }}
            />
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default AddPress;
