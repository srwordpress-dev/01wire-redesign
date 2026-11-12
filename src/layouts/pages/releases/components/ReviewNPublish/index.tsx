import dayjs from "dayjs";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import MDButton from "components/MDButton";
import { useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import AddPress from "../AddPress";
import Media from "../Media";
import PlanNPayment from "../PlanNPayment";
import { creditsText } from "../OrderSummary";
import {
  GET_ARTICLE_BY_ID_RNP,
  IGetArticleById,
  IGetArticleByIdVars,
} from "graphql/queries/getArticleByIdNew";
import {
  ARTICLE_PAYMENTS,
  IArticlePayments,
  MARK_PAYMENT_REVIEWED,
  gatewayLabel,
  inrFromPaise,
  providerName,
} from "graphql/queries/payments";

const STATUS_TEXT: Record<string, string> = {
  SUBMITTED: "Submitted for review",
  REVIEW: "In review",
  AWAITING_APPROVAL: "Changes requested",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  REJECTED: "Rejected (credits refunded)",
};

// Shown once the order is paid (any status after Draft)
function PaidReceipt({ article, justPaid }: { article: any; justPaid: boolean }): JSX.Element {
  // Admins also see which gateway payment paid for it (order no., refunds, problems)
  const isAdmin = localStorage.getItem("role") === "ADMIN";
  const { data: payData, refetch } = useQuery<IArticlePayments>(ARTICLE_PAYMENTS, {
    variables: { articleId: article?.id },
    skip: !isAdmin || !article?.id,
    fetchPolicy: "network-only",
  });
  const [markReviewed] = useMutation(MARK_PAYMENT_REVIEWED);
  const payments = payData?.articlePayments || [];
  const gw = payments.find((p) => p.status === "PAID");
  const paidWith = gw
    ? `${gatewayLabel(gw)} · ${inrFromPaise(gw.amount)}${
        gw.test ? " · TEST" : ""
      }`
    : "01Wire Credits";
  const row = (label: string, value: any) => (
    <MDBox display="flex" justifyContent="space-between" py={0.5}>
      <MDTypography fontSize="15px" sx={{ color: "#7B809A" }}>
        {label}
      </MDTypography>
      <MDTypography fontSize="15px" fontWeight="medium" textAlign="right">
        {value}
      </MDTypography>
    </MDBox>
  );
  return (
    <MDBox
      mb={3}
      p={2}
      sx={{ border: "1px solid rgba(76, 175, 80, 0.4)", borderRadius: "8px", background: "#F4FBF4" }}
    >
      <MDBox display="flex" alignItems="center" mb={1}>
        <CheckCircleIcon sx={{ color: "#4CAF50", mr: 1 }} />
        <MDTypography variant="h6">{justPaid ? "Payment successful" : "Order paid"}</MDTypography>
      </MDBox>
      {row("Amount paid", creditsText(article?.totalCredits ?? 0))}
      {row("Paid with", paidWith)}
      {gw && gw.refundedAmount > 0 &&
        row(
          "Refunded",
          `${inrFromPaise(gw.refundedAmount)} · ${gw.reversedCredits} credit${gw.reversedCredits === 1 ? "" : "s"} taken back`
        )}
      {row("Status", STATUS_TEXT[article?.status] || article?.status)}
      {article?.updatedAt && row("Last updated", dayjs(article.updatedAt).format("DD MMM YYYY, h:mm A"))}
      {isAdmin &&
        payments
          .filter((p) => p.issue)
          .map((p) => (
            <MDBox
              key={p.id}
              mt={1.5}
              p={1.5}
              data-testid="payment-issue"
              sx={{ background: "#FFF4E5", borderRadius: "8px", border: "1px solid #FFD8A8" }}
            >
              <MDTypography fontSize="14px" fontWeight="medium">
                ⚠ Payment needs review ({providerName(p.provider)}
                {p.gatewayRef ? ` ${p.gatewayRef}` : ""} · {inrFromPaise(p.amount)})
              </MDTypography>
              <MDTypography fontSize="13px" mt={0.5}>
                {p.issue}
              </MDTypography>
              <MDButton
                size="small"
                variant="outlined"
                color="dark"
                sx={{ mt: 1 }}
                onClick={() =>
                  markReviewed({ variables: { id: p.id } })
                    .then(() => {
                      toast.success("Marked as reviewed");
                      refetch();
                    })
                    .catch((e: any) => toast.error(e?.message))
                }
              >
                Mark reviewed
              </MDButton>
            </MDBox>
          ))}
    </MDBox>
  );
}

function ReviewNPublish({ id }: { id: any }): JSX.Element {
  const location = useLocation();
  const { data, loading } = useQuery<IGetArticleById, IGetArticleByIdVars>(GET_ARTICLE_BY_ID_RNP, {
    fetchPolicy: "network-only",
    variables: {
      id,
    },
    skip: !id,
  });
  return (
    <MDBox>
      {loading ? (
        // Inline, with room to show: an overlay here sits under the stepper
        <MDBox py={8}>
          <MDCircularLoader startLoader />
        </MDBox>
      ) : (
        <>
          {data?.getArticleById && data.getArticleById.status !== "DRAFT" && (
            <PaidReceipt article={data.getArticleById} justPaid={!!location?.state?.paid} />
          )}
          <AddPress data={data?.getArticleById} disabled />
          <Media data={data?.getArticleById} disabled />
          <PlanNPayment data={data?.getArticleById} disabled />
        </>
      )}
    </MDBox>
  );
}

export default ReviewNPublish;
