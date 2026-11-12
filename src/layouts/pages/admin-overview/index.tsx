import { useNavigate } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { palette } from "assets/theme/tokens";

dayjs.extend(relativeTime);

export const ADMIN_OVERVIEW = gql`
  query adminOverview {
    adminOverview {
      counts { toReview waitingOnCustomer inProgress published rejected drafts all }
      pendingSites
      lateSites
      oldestToReviewAt
      paymentsToCheck
      week {
        newPaidPrs sitesPublished newCustomers creditsSpent creditsRefunded
        gatewayPayments gatewayPaymentsTest gatewayInr gatewayInrTest razorpayInr shopifyInr
      }
      offlineThisMonth { month count paid owedToVendors owedCount }
    }
  }
`;

const INK = palette.ink;
const MUTED = palette.textMuted;
const inr = (paise: number) => `₹${(Number(paise || 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// One clickable number card
function Stat({
  label,
  value,
  note,
  warn,
  extra,
  color = INK,
  accent,
  testId,
  onClick,
}: {
  label: string;
  value: number | string;
  note?: string;
  warn?: string;
  extra?: string;
  color?: string;
  accent?: string;
  testId: string;
  onClick?: () => void;
}): JSX.Element {
  const body = (
    <Card sx={{ p: 2, height: "100%", width: "100%", borderTop: accent ? `4px solid ${accent}` : undefined, textAlign: "left" }}>
      <MDTypography fontSize="13px" fontWeight="medium" sx={{ color: MUTED }}>{label}</MDTypography>
      <MDTypography fontSize="30px" fontWeight="bold" sx={{ color, lineHeight: 1.2, mt: 0.5 }} data-testid={`${testId}-value`}>{value}</MDTypography>
      {note && <MDTypography fontSize="13px" sx={{ color: MUTED, mt: 0.5 }}>{note}</MDTypography>}
      {warn && <MDTypography fontSize="13px" fontWeight="bold" sx={{ color: "#b71c1c", mt: 0.5 }}>{warn}</MDTypography>}
      {extra && <MDTypography fontSize="12px" sx={{ color: MUTED, mt: 0.5, fontStyle: "italic" }}>{extra}</MDTypography>}
      {onClick && <MDTypography fontSize="12px" fontWeight="medium" color="primary" sx={{ mt: 1 }}>View →</MDTypography>}
    </Card>
  );
  return onClick ? (
    <ButtonBase onClick={onClick} data-testid={testId} sx={{ width: "100%", height: "100%", borderRadius: "12px", display: "block" }}>{body}</ButtonBase>
  ) : (
    <MDBox data-testid={testId} height="100%">{body}</MDBox>
  );
}

const Section = ({ title, children }: { title: string; children: any }) => (
  <MDBox mt={3}>
    <MDTypography variant="h6" fontWeight="medium" sx={{ color: INK, mb: 1.5 }}>{title}</MDTypography>
    {children}
  </MDBox>
);

// Admin landing page: what is waiting, quick actions, and the last 7 days (incl. money)
function AdminOverview(): JSX.Element {
  const navigate = useNavigate();
  const { data, loading } = useQuery(ADMIN_OVERVIEW, { fetchPolicy: "cache-and-network", pollInterval: 60000 });
  const o = data?.adminOverview;
  const tab = (t: string) => () => navigate(t === "toReview" ? "/pr-orders" : `/pr-orders?tab=${t}`);

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox px={2} pb={4}>
        <MDBox display="flex" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={1} mt={1}>
          <MDTypography variant="h4" sx={{ color: INK }}>Overview</MDTypography>
          <MDTypography fontSize="14px" sx={{ color: MUTED }}>{dayjs().format("dddd, DD MMM YYYY")}</MDTypography>
        </MDBox>

        <Section title="Quick actions">
          <MDBox display="flex" gap={1.5} flexWrap="wrap" data-testid="quick-actions">
            <MDButton variant="gradient" color="primary" size="small" onClick={() => navigate("/pr-orders")}>Open PR Orders</MDButton>
            <MDButton variant="outlined" color="primary" size="small" onClick={() => navigate("/publications")}>Add publication</MDButton>
            <MDButton variant="outlined" color="primary" size="small" onClick={() => navigate("/bundles")}>Add package</MDButton>
            <MDButton variant="outlined" color="primary" size="small" onClick={() => navigate("/user-management")}>Manage users</MDButton>
          </MDBox>
        </Section>

        {!o ? (
          <Card sx={{ mt: 3, minHeight: 200 }}>{loading && <MDCircularLoader overlayloader startLoader />}</Card>
        ) : (
          <>
            <Section title="Needs your attention">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Stat
                    testId="stat-toReview" label="To review" value={o.counts.toReview} accent="#1565c0"
                    note={o.counts.toReview ? `New paid PRs · oldest ${dayjs(o.oldestToReviewAt).fromNow()}` : "Nothing new to review"}
                    onClick={tab("toReview")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Stat testId="stat-waiting" label="Waiting for customer" value={o.counts.waitingOnCustomer} accent="#b26a00" note="Sent back for changes" onClick={tab("waitingOnCustomer")} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Stat
                    testId="stat-inProgress" label="In progress" value={o.counts.inProgress} accent="#6a1b9a"
                    note={`${o.pendingSites} ${o.pendingSites === 1 ? "site" : "sites"} still to publish`}
                    warn={o.lateSites ? `${o.lateSites} late` : undefined}
                    onClick={tab("inProgress")}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Stat
                    testId="stat-payments" label="Payments to check" value={o.paymentsToCheck} accent={o.paymentsToCheck ? "#b71c1c" : "#43a047"}
                    color={o.paymentsToCheck ? "#b71c1c" : INK}
                    note={o.paymentsToCheck ? "Refund, dispute or double payment" : "All payments look fine"}
                    onClick={() => navigate("/pr-orders?tab=all")}
                  />
                </Grid>
              </Grid>
            </Section>

            <Section title="All PRs">
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}><Stat testId="stat-published" label="Published" value={o.counts.published} color="#1b5e20" onClick={tab("published")} /></Grid>
                <Grid item xs={6} md={3}><Stat testId="stat-rejected" label="Rejected" value={o.counts.rejected} color="#b71c1c" onClick={tab("rejected")} /></Grid>
                <Grid item xs={6} md={3}><Stat testId="stat-all" label="All paid" value={o.counts.all} onClick={tab("all")} /></Grid>
                <Grid item xs={6} md={3}><Stat testId="stat-drafts" label="Unpaid drafts" value={o.counts.drafts} note="Not paid yet" onClick={tab("drafts")} /></Grid>
              </Grid>
            </Section>

            <Section title={`Offline orders · ${dayjs(`${o.offlineThisMonth.month}-01`).format("MMMM YYYY")}`}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}><Stat testId="offline-count" label="Orders this month" value={o.offlineThisMonth.count} onClick={() => navigate("/offline-orders")} /></Grid>
                <Grid item xs={6} md={4}><Stat testId="offline-paid" label="Customers paid" value={inr(o.offlineThisMonth.paid * 100)} onClick={() => navigate("/offline-orders")} /></Grid>
                <Grid item xs={12} md={4}>
                  <Stat
                    testId="offline-owed" label="Owed to vendors" value={inr(o.offlineThisMonth.owedToVendors * 100)}
                    color={o.offlineThisMonth.owedToVendors ? "#b71c1c" : INK}
                    note={`${o.offlineThisMonth.owedCount} ${o.offlineThisMonth.owedCount === 1 ? "order" : "orders"} not paid yet`}
                    onClick={() => navigate("/offline-orders")}
                  />
                </Grid>
              </Grid>
            </Section>

            <Section title="Last 7 days">
              <Grid container spacing={2}>
                <Grid item xs={6} md={4} lg={2}><Stat testId="week-prs" label="New paid PRs" value={o.week.newPaidPrs} /></Grid>
                <Grid item xs={6} md={4} lg={2}><Stat testId="week-published" label="Sites published" value={o.week.sitesPublished} /></Grid>
                <Grid item xs={6} md={4} lg={2}><Stat testId="week-customers" label="New customers" value={o.week.newCustomers} /></Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Stat
                    testId="week-credits" label="Credits spent on PRs" value={(o.week.creditsSpent - o.week.creditsRefunded).toLocaleString("en-IN")}
                    note={`${o.week.creditsSpent.toLocaleString("en-IN")} spent − ${o.week.creditsRefunded.toLocaleString("en-IN")} refunded`}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Stat
                    testId="week-money" label="Paid online (real money)" value={inr(o.week.gatewayInr)}
                    note={`${o.week.gatewayPayments} ${o.week.gatewayPayments === 1 ? "payment" : "payments"} · Razorpay ${inr(o.week.razorpayInr)} · Shopify ${inr(o.week.shopifyInr)}`}
                    extra={o.week.gatewayPaymentsTest ? `Also ${o.week.gatewayPaymentsTest} test ${o.week.gatewayPaymentsTest === 1 ? "payment" : "payments"} · ${inr(o.week.gatewayInrTest)} (no real money)` : undefined}
                  />
                </Grid>
              </Grid>
            </Section>
          </>
        )}
      </MDBox>
    </MDBox>
  );
}

export default AdminOverview;
