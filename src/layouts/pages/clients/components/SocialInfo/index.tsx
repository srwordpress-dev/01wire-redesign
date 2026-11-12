import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { UPDATE_CLIENT, IUpdateClientVars } from "graphql/mutations/updateClient";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import { useForm } from "react-hook-form";
import InputAdornment from "@mui/material/InputAdornment";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FormField from "layouts/pages/releases/components/FormField";
import { Divider } from "@mui/material";

function removeEmptyFields(obj: { [key: string]: any }): { [key: string]: any } {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === "") {
      delete obj[key];
    }
  }
  return obj;
}
function SocialInfo({
  data,
  cb,
  saveData,
  refetch,
  setSaveData,
}: {
  data: any;
  cb: any;
  saveData: any;
  refetch: any;
  setSaveData: any;
}): JSX.Element {
  const {
    control,
    formState: { isDirty },
    reset,
    handleSubmit,
  } = useForm({ defaultValues: {} });
  const [loading, setLoading] = useState<boolean>(false);
  const [updateClient] = useMutation<IUpdateClientVars>(UPDATE_CLIENT);
  const onSubmit = (formVals: any) => {
    formVals = removeEmptyFields(formVals);
    setLoading(true);
    if (data?.id) {
      updateClient({
        variables: {
          params: {
            id: data.id,
            social: {
              ...formVals,
            },
          },
        },
      })
        .then(() => {
          setLoading(false);
          toast.success("Saved Successfully");
          if (refetch) refetch();
          cb();
        })
        .catch((err: any) => {
          setLoading(false);
          setSaveData(false);
          toast.error(err?.message);
          console.log("err while updating client", err);
        });
    }
  };

  useEffect(() => {
    if (saveData && isDirty) {
      handleSubmit(onSubmit)();
    } else if (saveData) {
      refetch();
    }
  }, [saveData]);

  useEffect(() => {
    if (data?.id) {
      const { social = {} } = data;
      const { facebook, instagram, youtube, twitter, others, linkedIn } = social;
      const defaultValues = {
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

  return (
    <MDBox>
      {loading && <MDCircularLoader overlayloader startLoader />}
      <MDBox mt={2} display="flex" alignItems="center">
        <MDTypography variant="h5">Social Media Info</MDTypography>
        <Divider sx={{ width: "80%", p: 0 }} orientation="horizontal" />
      </MDBox>
      <MDBox>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <FormField
              type="text"
              label="Facebook"
              name="facebook"
              control={control}
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

export default SocialInfo;
