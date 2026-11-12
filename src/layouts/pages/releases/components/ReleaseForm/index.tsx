import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// @mui material components
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDCircularLoader from "components/MDCircularLoader";
// NewProduct page components
import AddPress from "../AddPress";
import Media from "../Media";
import PlanNPayment from "../PlanNPayment";
import ReviewNPublish from "../ReviewNPublish";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_ARTICLE_BY_ID,
  IGetArticleByIdVars,
  IGetArticleById,
} from "graphql/queries/getArticleById";
import ChangesNote from "../ChangesNote";
import MDTypography from "components/MDTypography";
import Dialog from "@mui/material/Dialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReleasePreview from "../ReleasePreview";
import {
  UPDATE_ARTICLE_STATUS,
  IUpdateArticleStatusVars,
} from "graphql/mutations/updateArticleStatus";
interface Props {
  onClose?: () => void;
  idVal?: any;
  refetch?: any;
}

// Backend only accepts edits/resubmits while the PR is DRAFT or AWAITING_APPROVAL
const EDITABLE_STATUSES = ["DRAFT", "AWAITING_APPROVAL"];
const isReadOnly = (article: any) => !!article && !EDITABLE_STATUSES.includes(article?.status);

function getSteps(): string[] {
  return ["Add Press Release", "Category & Media", "Plan & Payment", "Review & Publish"];
}

function getStepContent(
  stepIndex: number,
  saveData: boolean,
  handleNext: any,
  article: any,
  fetchData: any,
  setSaveData: any,
  setPayable: any,
  onValuesChange: (values: any) => void,
  setMediaCount: (count: number) => void
): JSX.Element {
  switch (stepIndex) {
    case 0:
      return (
        <AddPress
          cb={handleNext}
          saveData={saveData}
          data={article}
          refetch={fetchData}
          setSaveData={setSaveData}
          disabled={isReadOnly(article)}
          onValuesChange={onValuesChange}
        />
      );
    case 1:
      return (
        <Media
          cb={handleNext}
          saveData={saveData}
          data={article}
          disabled={isReadOnly(article)}
          refetch={fetchData}
          setSaveData={setSaveData}
        />
      );
    case 2:
      return (
        <PlanNPayment
          cb={handleNext}
          saveData={saveData}
          data={article}
          refetch={fetchData}
          setSaveData={setSaveData}
          setPayable={setPayable}
          setMediaCount={setMediaCount}
          disabled={article?.status !== "DRAFT"}
        />
      );
    case 3:
      return <ReviewNPublish id={article?.id} />;
    default:
      return null;
  }
}

function ReleaseForm({ idVal, onClose, refetch }: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  // The payment page sends the user back to a given step (Review & Publish after paying)
  const [activeStep, setActiveStep] = useState<number>(location?.state?.step || 0);
  const [saveData, setSaveData] = useState<boolean>(false);
  const [articleId, setId] = useState<string>(idVal && idVal !== true && idVal);
  const [article, setArticle] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [payable, setPayable] = useState<number>(0);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  // Step-1 values as typed (not yet saved), so the preview shows them
  const [liveValues, setLiveValues] = useState<any>(null);
  const previewArticle = () => {
    if (activeStep !== 0 || !liveValues) return article;
    const { title, summary, content, featureImage } = liveValues;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __typename, ...contact } = article?.mediaContact || {};
    return {
      ...article,
      title,
      summary,
      content,
      featureImage,
      mediaContact: {
        ...contact,
        city: liveValues.city,
        country: liveValues.country,
        name: liveValues.contactName,
        email: liveValues.contactEmail,
        phone: liveValues.contactPhone,
        website: liveValues.website,
      },
    };
  };
  const steps = getSteps();
  const isLastStep: boolean = activeStep === steps.length - 1;

  const isDraft = article?.status === "DRAFT";
  const handleNext = (id?: any) => {
    if (id) setId(id);
    setSaveData(false);
    // A draft is paid for on its own page; Review & Publish comes after payment
    if (activeStep === 2 && isDraft) {
      navigate(`/releases/${id || articleId}/payment`);
      return;
    }
    setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    if (activeStep === 0) {
      onClose();
    } else {
      if (saveData) setSaveData(false);
      setActiveStep(activeStep - 1);
    }
  };
  const [updateArticleStatus] = useMutation<IUpdateArticleStatusVars>(UPDATE_ARTICLE_STATUS);
  const [getArticleById] = useLazyQuery<IGetArticleById, IGetArticleByIdVars>(GET_ARTICLE_BY_ID, {
    fetchPolicy: "network-only",
  });
  const fetchData = () => {
    // A brand-new PR has no id yet (steps call refetch right after create);
    // the articleId effect below fetches it once the id is set
    if (!articleId) return;
    setLoading(true);
    getArticleById({
      variables: {
        id: articleId,
      },
    })
      .then((res: any) => {
        setArticle(res?.data?.getArticleById);
        setLoading(false);
      })
      .catch((err) => {
        console.error("error in detail fetching", err);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (articleId) {
      fetchData();
    }
  }, [articleId]);
  // Resubmit after the admin asked for changes; already paid, so no payment step
  const handleResubmit = () => {
    updateArticleStatus({
      variables: {
        params: {
          id: article?.id,
          status: "SUBMITTED",
        },
      },
    })
      .then(() => {
        toast.success("Resubmitted for review");
        refetch();
        onClose();
      })
      .catch((err) => {
        toast.error(err?.message);
      });
  };
  return (
    <>
      <MDBox mt={-3} mb={3} mx={2}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            background: `
          linear-gradient(180deg, #F7595F 0%, #F8303C 100%)
          `,
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </MDBox>
      <MDBox p={2}>
        {article?.status === "AWAITING_APPROVAL" && (
          <ChangesNote banner changes={article?.changesRequested} note={article?.notes} />
        )}
        <MDBox>
          {/* Steps read the saved PR when they mount, so wait for it */}
          {loading || (articleId && !article) ? (
            <MDBox py={8}>
              <MDCircularLoader startLoader />
            </MDBox>
          ) : (
            <>
              {getStepContent(
                activeStep,
                saveData,
                handleNext,
                article,
                fetchData,
                setSaveData,
                setPayable,
                setLiveValues,
                setMediaCount
              )}
            </>
          )}
        </MDBox>
      </MDBox>
      <MDBox
        width="102.47%"
        display="flex"
        justifyContent="space-between"
        bgColor="white"
        alignItems="center"
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
          onClick={handleBack}
        >
          <MDTypography fontWeight="regular" fontSize="16px">
            {"Back"}
          </MDTypography>
        </MDButton>
        <MDBox display="flex" alignItems="center">
          {activeStep === 2 && isDraft && (
            <MDBox mr={2}>
              <MDTypography
                fontWeight="regular"
                fontFamily="Inter"
                fontSize="15px"
                sx={{ color: "#7B809A" }}
              >
                Credits Payable
              </MDTypography>
              <MDTypography
                textAlign="right"
                fontWeight="bold"
                fontSize="18px"
                sx={{ color: "#F3BE00" }}
              >
                {payable}
              </MDTypography>
            </MDBox>
          )}
          <MDButton
            variant="outlined"
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </MDButton>
          <MDButton
            color="primary"
            onClick={isLastStep ? handleResubmit : () => setSaveData(true)}
            // Media is chosen in the Marketplace; nothing to pay for without it
            disabled={activeStep === 2 && isDraft && !mediaCount}
            sx={{
              visibility: isLastStep && article?.status !== "AWAITING_APPROVAL" && "collapse",
            }}
          >
            {isLastStep
              ? "Resubmit for review"
              : activeStep === 2 && isDraft
              ? "Proceed to Payment"
              : "Next"}
          </MDButton>
        </MDBox>
      </MDBox>
      {previewOpen && (
        <Dialog fullScreen open onClose={() => setPreviewOpen(false)}>
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}
          >
            <MDButton
              variant="outlined"
              color="dark"
              startIcon={<ArrowBackIcon />}
              onClick={() => setPreviewOpen(false)}
            >
              Go Back
            </MDButton>
            <MDTypography variant="h6">Preview</MDTypography>
          </MDBox>
          <MDBox sx={{ padding: { xs: "24px 16px", md: "40px 180px" } }}>
            <ReleasePreview article={previewArticle()} />
          </MDBox>
        </Dialog>
      )}
    </>
  );
}

export default ReleaseForm;
