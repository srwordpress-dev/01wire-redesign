import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import MDBox from "components/MDBox";
import MDCircularLoader from "components/MDCircularLoader";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ReviewNPublish from "layouts/pages/releases/components/ReviewNPublish";
import Autocomplete from "@mui/material/Autocomplete";
import {
  UPDATE_ARTICLE_STATUS,
  IUpdateArticleStatusVars,
} from "graphql/mutations/updateArticleStatus";
import RejectPR from "./RejectPRModal";
import MDTypography from "components/MDTypography";

const PRDetail = ({
  onClose,
  refetch,
  id,
  articleStatus,
}: {
  onClose: any;
  refetch: any;
  id: any;
  articleStatus?: any;
}) => {
  const [updateArticleStatus] = useMutation<IUpdateArticleStatusVars>(UPDATE_ARTICLE_STATUS);
  const [status, setStatus] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const handleUpdateStatus = () => {
    if (["REJECTED", "AWAITING_APPROVAL"].includes(status)) {
      setOpen(true);
    } else {
      setLoader(true);
      updateArticleStatus({
        variables: {
          params: {
            id,
            status,
          },
        },
      })
        .then(() => {
          setLoader(false);
          refetch();
          toast.success("Submitted successfully");
          onClose();
        })
        .catch((err) => {
          toast.error(err?.message);
          setLoader(false);
        });
    }
  };

  const statusOptions =
    articleStatus === "SCHEDULED"
      ? [
          // { label: "AWAITING APPROVAL", value: "AWAITING_APPROVAL" },
          { label: "REJECTED", value: "REJECTED" },
          { label: "PUBLISHED", value: "PUBLISHED" },
        ]
      : articleStatus === "SUBMITTED"
      ? [
          { label: "REVIEW", value: "REVIEW" },
          { label: "AWAITING APPROVAL", value: "AWAITING_APPROVAL" },
          { label: "SCHEDULED", value: "SCHEDULED" },
          { label: "REJECTED", value: "REJECTED" },
          { label: "PUBLISHED", value: "PUBLISHED" },
        ]
      : [
          { label: "AWAITING APPROVAL", value: "AWAITING_APPROVAL" },
          { label: "SCHEDULED", value: "SCHEDULED" },
          { label: "REJECTED", value: "REJECTED" },
          { label: "PUBLISHED", value: "PUBLISHED" },
        ];
  return (
    <>
      <MDBox p={2}>
        {loader && <MDCircularLoader overlayloader startLoader />}
        {open && <RejectPR id={id} status={status} onClose={() => setOpen(false)} />}
        <MDBox display="flex" alignItems="center">
          <IconButton onClick={onClose}>
            <ArrowBackIosIcon />
          </IconButton>
        </MDBox>
        <MDBox mt={3}>
          <ReviewNPublish id={id} />
        </MDBox>
      </MDBox>
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        alignItem="center"
        width="102.47%"
        bgColor="white"
        sx={{
          position: "sticky",
          bottom: 0,
          marginLeft: "-1.2%",
          padding: "2rem 1rem",
          boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          zIndex: 1000,
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
            {"Cancel"}
          </MDTypography>
        </MDButton>
        {!["DRAFT", "AWAITING_APPROVAL", "REJECTED", "PUBLISHED"].includes(articleStatus) && (
          <MDBox display="flex" alignItems="center">
            <MDBox mr={3}>
              <Autocomplete
                disableClearable
                options={status ? statusOptions?.filter((s) => s?.value !== status) : statusOptions}
                onChange={(event, option: any) => {
                  setStatus(option?.value);
                }}
                value={status && statusOptions?.find((one: any) => one?.value === status)}
                size="small"
                sx={{ width: "14rem" }}
                renderInput={(params) => <MDInput label="Status" {...params} />}
              />
            </MDBox>
            <MDButton
              disabled={!status}
              color="primary"
              variant="contained"
              onClick={handleUpdateStatus}
            >
              Update
            </MDButton>
          </MDBox>
        )}
      </MDBox>
    </>
  );
};
export default PRDetail;
