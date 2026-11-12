import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import MDBox from "components/MDBox";
import { useForm } from "react-hook-form";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import { useMutation } from "@apollo/client";
import { CREATE_CLIENT, ICreateClientVars } from "graphql/mutations/createClient";
import { UPDATE_CLIENT, IUpdateClientVars } from "graphql/mutations/updateClient";
import FormField from "layouts/pages/releases/components/FormField";
import MDCircularLoader from "components/MDCircularLoader";
import MDTypography from "components/MDTypography";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import { removeEmptyFields } from "utils/helpers";
import { genericValidations } from "utils/helpers";
import { MAX_IMAGE_SIZE_MB } from "constants/index";

const ComanyTypeOptions = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
];
const IndustryTypeOptions = [
  {label:'Agriculture',value: 'AGRICULTURE'},
  {label:'Finance',value: 'FINANCE'},
  {label:'Healthcare',value: 'HEALTHCARE'},
  {label:'Education',value: 'EDUCATION'},
  {label:'Manufacturing',value: 'MANUFACTURING'},
  {label:'Retail',value: 'RETAIL'},
  {label:'Marketing',value: 'MARKETING'},
  {label:'Gaming',value: 'GAMING'},
  {label:'Casino',value: 'CASINO'},
  {label:'Aerospace and Defence',value: 'AEROSPACE_DEFENCE'},
  {label:'Agriculture Automotive',value: 'AGRICULTURE_AUTOMOTIVE'},
  {label:'Banking and Financial Services',value: 'BANKING_FINANCIAL'},
  {label:'Biotechnology',value: 'BIOTECHNOLOGY'},
  {label:'Blockchain and Cryptocurrency',value: 'BLOCKCHAIN_CRYPTO'},
  {label:'Business and Professional Services',value: 'BUSINESS_PROFESSIONAL'},
  {label:'Chemicals',value: 'CHEMICALS'},
  {label:'Clean Technology',value: 'CLEAN_TECHNOLOGY'},
  {label:'Closed End Funds and Trusts',value: 'FUNDS_TRUST'},
  {label:'Computers, Technology and Internet',value: 'COMPUTER_INTERNET'},
  {label:'Consumer and Retail Products',value: 'CONSUMER_RETAIL'},
  {label:'Electronics and Engineering',value: 'ECLECTRONICS_ENGINEERING'},
  {label:'Exchange Traded Funds',value: 'EXCHANGE_FUNDS'},
  {label:'Food and Beverage Products',value: 'FOOD_BEVERAGE'},
  {label:'Government',value: 'GOVERNMENT'},
  {label:'Healthcare and Pharmaceuticals',value: 'HEALTHCARE_PHARMACEUTICAL'},
  {label:'Industrial and Manufacturing',value: 'INDUSTRIAL_MANUFACTURING'},
  {label:'Metals',value: 'METALS'},
  {label:'Oil and Gas Mining',value: 'OIL_GAS_MINING'},
  {label:'Paper Packaging',value: 'PAPER_PACKAGING'},
  {label:'Publising and Media',value: 'PUBLISHING_MEDIA'},
  {label:'Real Estate',value: 'REAL_ESTATE'},
  {label:'Sports',value: 'SPORTS'},
  {label:'Leisure and Entertainment',value: 'LEISURE_ENTERTAINMENT'},
  {label:'Telecommunication',value: 'TELECOMMUNICATION'},
  {label:'Transportation',value: 'TRANSPORTATION'},
  {label:'Travel',value: 'TRAVEL'},
  {label:'Utilities',value: 'UTILITIES'}
];

function ClientInfo({
  saveData,
  data,
  refetch,
  onClose,
  setSaveData,
  onSaved,
}: {
  saveData: any;
  data: any;
  refetch: any;
  onClose: any;
  setSaveData: any;
  // When given (e.g. the PR form's Add Client popup), hand back the saved client
  // instead of navigating to the client list
  onSaved?: (client: any) => void;
}): JSX.Element {
  const {
    control,
    formState: { isDirty, errors },
    handleSubmit,
    reset,
  } = useForm({ defaultValues: { category: null, type: null } });
  const [loading, setLoading] = useState<boolean>(false);
  const [createClient] = useMutation<ICreateClientVars>(CREATE_CLIENT);
  const [updateClient] = useMutation<IUpdateClientVars>(UPDATE_CLIENT);
  const navigate = useNavigate();
  useEffect(() => {
    if (data?.id) {
      const { title, logo, type, email, website, category, notes, social = {} } = data;
      const { facebook, instagram, youtube, twitter, others, linkedIn } = social;
      const defaultValues = {
        title,
        type,
        category: category && IndustryTypeOptions?.find((one) => one?.value === category),
        email,
        logo,
        notes,
        website,
        facebook,
        instagram,
        youtube,
        twitter,
        others,
        linkedIn,
      };
      reset(defaultValues);
    }
  }, [data]);

  const onSubmit = async (formVals: any) => {
    formVals = removeEmptyFields(formVals);
    setLoading(true);
    let res: any;
    const {
      title,
      type,
      logo,
      email,
      website,
      facebook,
      youtube,
      linkedIn,
      twitter,
      instagram,
      others,
      notes,
    } = formVals;
    let social: any = {
      facebook,
      youtube,
      linkedIn,
      twitter,
      instagram,
      others,
    };
    social = removeEmptyFields(social);
    try {
      if (data?.id) {
        res = await updateClient({
          variables: {
            params: {
              id: data.id,
              title,
              type,
              logo,
              email,
              website,
              notes,
              category: formVals?.category?.value,
              social,
            },
          },
        });
      } else {
        res = await createClient({
          variables: {
            params: {
              title,
              logo,
              email,
              website,
              type,
              category: formVals?.category?.value,
              social,
              notes,
            },
          },
        });
      }
      setLoading(false);
      toast.success(data?.id ? "Updated Successfully" : "Saved Successfully");
      if (refetch) refetch();
      if (onSaved) {
        onSaved(res?.data?.createClient || res?.data?.updateClient);
        return;
      }
      onClose();
      navigate("/clients");
    } catch (err: any) {
      console.error("Error in saving data:", err);
      setLoading(false);
      toast.error(err?.message);
      setSaveData(false);
    }
  };
  useEffect(() => {
    // A new client always runs validation; "no changes" only applies to edits
    if (saveData && (isDirty || !data?.id)) {
      handleSubmit(onSubmit)();
    } else if (saveData) {
      toast.info("No changes to save");
      setSaveData(false);
    }
  }, [saveData, isDirty]);
  useEffect(() => {
    if (Object.keys(errors).length) {
      setSaveData(false);
    }
  }, [Object.keys(errors).length]);
  return (
    <MDBox>
      {loading && <MDCircularLoader overlayloader startLoader />}
      <MDBox mt={2} display="flex" alignItems="center">
        <MDTypography variant="h5">Client Info</MDTypography>
      </MDBox>
      <MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={7}>
            <FormField
              type="text"
              label="Company Name"
              name="title"
              control={control}
              variant="outlined"
              required
              errors={errors}
              rules={genericValidations.text}
            />
            <FormField
              type="radio"
              placeholder="Select Company Tye"
              label="Company Type"
              name="type"
              control={control}
              opt={ComanyTypeOptions}
              variant="outlined"
              required
              errors={errors}
              rules={genericValidations.text}
            />
            <FormField
              type="dropdown"
              placeholder="Select Industry Type"
              label="Industry Type"
              name="category"
              control={control}
              options={IndustryTypeOptions}
              variant="outlined"
              required
              errors={errors}
              rules={genericValidations.dropdown}
            />
            <FormField
              type="text"
              label="Email"
              name="email"
              control={control}
              required
              errors={errors}
              rules={genericValidations.email}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              type="text"
              label="Website"
              name="website"
              control={control}
              required
              errors={errors}
              rules={genericValidations.url}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <LanguageOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormField
              type="file"
              subLabel={`JPEG, PNG, JPG (max. ${MAX_IMAGE_SIZE_MB}MB)`}
              name="logo"
              label="Logo"
              control={control}
              errors={errors}
              rules={genericValidations.text}
            />
            <FormField
              type="text"
              label="Notes"
              name="notes"
              control={control}
              multiline
              rows={6}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </MDBox>
      <MDBox mt={2} display="flex" alignItems="center">
        <MDTypography variant="h5">Social Media Info</MDTypography>
        <Divider sx={{ ml: 1, flexGrow: 1, mr: 2, bgcolor: "#000", height: "1px" }} />
      </MDBox>
      <MDBox>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              label="Facebook"
              name="facebook"
              control={control}
              errors={errors}
              rules={genericValidations.link}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <FacebookIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              type="text"
              label="LinkedIn"
              name="linkedIn"
              control={control}
              errors={errors}
              rules={genericValidations.link}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <LinkedInIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              type="text"
              label="YouTube"
              name="youtube"
              control={control}
              errors={errors}
              rules={genericValidations.link}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              label="Instagram"
              name="instagram"
              control={control}
              errors={errors}
              rules={genericValidations.link}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              type="text"
              label="X"
              name="twitter"
              control={control}
              errors={errors}
              rules={genericValidations.link}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <XIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormField
              type="text"
              label="Others"
              name="others"
              control={control}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <MoreHorizIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default ClientInfo;
