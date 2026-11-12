import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import {
  IPaymentsNeedingReview,
  MARK_PAYMENT_REVIEWED,
  PAYMENTS_NEEDING_REVIEW,
  gatewayLabel,
  inrFromPaise,
} from "graphql/queries/payments";

// Gateway payments a person must look at: refund after the PR was paid, paid twice,
// amount mismatch, PR could not be submitted after payment. Hidden when there are none.
function PaymentsReview(): JSX.Element | null {
  const navigate = useNavigate();
  const { data, refetch } = useQuery<IPaymentsNeedingReview>(PAYMENTS_NEEDING_REVIEW, {
    fetchPolicy: "network-only",
    pollInterval: 60000,
  });
  const [markReviewed, { loading }] = useMutation(MARK_PAYMENT_REVIEWED);
  const list = data?.paymentsNeedingReview || [];
  if (!list.length) return null;
  return (
    <Card sx={{ mt: 2, p: 2, border: "1px solid #FFD8A8", background: "#FFF9F0" }} data-testid="payments-review">
      <MDTypography variant="h6">
        ⚠ {list.length} payment{list.length === 1 ? "" : "s"} need{list.length === 1 ? "s" : ""} review
      </MDTypography>
      {list.slice(0, 10).map((p) => (
        <MDBox
          key={p.id}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          py={1.25}
          flexWrap="wrap"
          sx={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <MDBox flex="1 1 420px" minWidth={0}>
            <MDTypography fontSize="14px" fontWeight="medium">
              PR #{p.prId} · {gatewayLabel(p)} · {inrFromPaise(p.amount)}
              {p.test ? " · TEST" : ""}
              {p.issueAt ? ` · ${dayjs(p.issueAt).format("DD MMM YYYY, h:mm A")}` : ""}
            </MDTypography>
            <MDTypography fontSize="13px" sx={{ color: "#344767" }}>
              {p.issue}
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={1}>
            <MDButton size="small" variant="outlined" color="primary" onClick={() => navigate(`/pr-orders/${p.articleId}`)}>
              Open PR
            </MDButton>
            <MDButton
              size="small"
              variant="outlined"
              color="dark"
              disabled={loading}
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
        </MDBox>
      ))}
    </Card>
  );
}

export default PaymentsReview;
