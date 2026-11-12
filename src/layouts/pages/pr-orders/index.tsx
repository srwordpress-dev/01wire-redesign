import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PaymentsReview from "layouts/pages/orders/components/PaymentsReview";
import { ADMIN_PR_ORDERS, IAdminPrOrders, IAdminPrRow } from "graphql/queries/adminPrOrders";
import SitesTable from "./components/SitesTable";
import PrOrderDetail from "./components/PrOrderDetail";
import { INK, MUTED, PR_STATUS, Pill, boughtSummary, date, inr, methodLabel, nextStepLabel } from "./components/common";

const TABS: { key: keyof IAdminPrOrders["adminPrOrders"]["counts"]; label: string }[] = [
  { key: "toReview", label: "To review" },
  { key: "waitingOnCustomer", label: "Waiting for customer" },
  { key: "inProgress", label: "In progress" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "drafts", label: "Unpaid drafts" },
  { key: "all", label: "All paid" },
];
const PER_PAGE = 20;
const cell = { borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.5, px: 1.5, fontSize: "14px", color: INK, verticalAlign: "top" };
const head = { ...cell, fontWeight: 700, color: MUTED, fontSize: "12px", textTransform: "uppercase" as const, verticalAlign: "middle" };

function Progress({ row }: { row: IAdminPrRow }): JSX.Element {
  if (row.status === "DRAFT") return <MDTypography fontSize="13px" sx={{ color: MUTED }}>Not paid</MDTypography>;
  const total = row.totalCount || 1;
  return (
    <MDBox sx={{ minWidth: 110 }}>
      <MDBox sx={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "#eceff1", mb: 0.5 }}>
        <MDBox sx={{ width: `${(row.liveCount / total) * 100}%`, background: "#43a047" }} />
        <MDBox sx={{ width: `${(row.rejectedCount / total) * 100}%`, background: "#e57373" }} />
      </MDBox>
      <MDTypography fontSize="12px" sx={{ color: INK }}>
        {row.liveCount}/{row.totalCount} live
        {row.rejectedCount > 0 && ` · ${row.rejectedCount} rejected`}
      </MDTypography>
      {row.overdueCount > 0 && (
        <MDTypography fontSize="12px" sx={{ color: "#b71c1c", fontWeight: 700 }}>
          {row.overdueCount} late
        </MDTypography>
      )}
    </MDBox>
  );
}

// Admin "PR Orders": every purchase as one row: who bought which sites for which article, and what is left to do
function PrOrders(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab") : "toReview";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [typed, setTyped] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(typed.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [typed]);

  const { data, loading, refetch } = useQuery<IAdminPrOrders>(ADMIN_PR_ORDERS, {
    skip: !!id,
    fetchPolicy: "cache-and-network",
    variables: {
      paginationInput: { currentPage: page, perPage: PER_PAGE },
      filterInput: {
        tab,
        search: search || undefined,
        startTime: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        endTime: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      },
    },
  });

  if (id) return <PrOrderDetail articleId={id} />;

  const list = data?.adminPrOrders;
  const rows = list?.data || [];
  const counts = list?.counts;
  const info = list?.paginationInfo;

  const onNext = (row: IAdminPrRow) => {
    if (row.nextStep === "PUBLISH_SITES") setOpen(open === row.articleId ? null : row.articleId);
    else navigate(`/pr-orders/${row.articleId}`);
  };

  return (
    <>
      <DashboardNavbar />
      <MDBox px={2} pb={3}>
        <PaymentsReview />
        <Card sx={{ mt: 2 }}>
          <MDBox px={2} pt={1} sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => { setParams(v === "toReview" ? {} : { tab: v }); setPage(0); setOpen(null); }}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="PR order stages"
              sx={{ background: "transparent", "& .MuiTab-root": { minWidth: "auto", px: 2, fontSize: "14px" } }}
            >
              {TABS.map((t) => (
                <Tab key={t.key} value={t.key} data-testid={`tab-${t.key}`} label={`${t.label}${counts ? ` (${counts[t.key]})` : ""}`} />
              ))}
            </Tabs>
          </MDBox>
          <MDBox p={2} display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Search PR #, article title, customer name or email, client"
              sx={{ flex: "1 1 320px", minWidth: 240 }}
              inputProps={{ "aria-label": "Search PR orders" }}
            />
            <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
            <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
            {(typed || from || to) && (
              <MDButton size="small" variant="text" color="secondary" onClick={() => { setTyped(""); setFrom(""); setTo(""); }}>
                Clear
              </MDButton>
            )}
          </MDBox>

          <MDBox sx={{ overflowX: "auto", position: "relative", minHeight: 160 }}>
            {loading && !data && <MDCircularLoader overlayloader startLoader />}
            <Table sx={{ minWidth: 1080 }} data-testid="pr-orders-table">
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  <TableCell sx={{ ...head, width: 40 }} />
                  <TableCell sx={head}>PR #</TableCell>
                  <TableCell sx={head}>Article</TableCell>
                  <TableCell sx={head}>Customer</TableCell>
                  <TableCell sx={head}>Client</TableCell>
                  <TableCell sx={head}>Bought</TableCell>
                  <TableCell sx={head}>Paid</TableCell>
                  <TableCell sx={head}>Progress</TableCell>
                  <TableCell sx={{ ...head, textAlign: "right" }}>Next step</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const st = PR_STATUS[row.status] || { label: row.status, color: INK, bg: "#eee" };
                  const expanded = open === row.articleId;
                  return (
                    <Fragment key={row.articleId}>
                      <TableRow hover data-testid="pr-row" sx={{ "& td": { borderBottom: expanded ? "none" : undefined } }}>
                        <TableCell sx={cell}>
                          <IconButton size="small" aria-label={expanded ? "Hide sites" : "Show sites"} onClick={() => setOpen(expanded ? null : row.articleId)}>
                            <Icon>{expanded ? "expand_less" : "expand_more"}</Icon>
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ ...cell, fontWeight: 700 }}>
                          <MDBox component="a" onClick={() => navigate(`/pr-orders/${row.articleId}`)} sx={{ cursor: "pointer", color: INK }}>
                            #{row.prId}
                          </MDBox>
                        </TableCell>
                        <TableCell sx={{ ...cell, maxWidth: 260 }}>
                          <MDTypography fontSize="14px" fontWeight="medium" sx={{ color: INK, wordBreak: "break-word" }}>{row.title}</MDTypography>
                          <MDBox mt={0.5}><Pill {...st} /></MDBox>
                        </TableCell>
                        <TableCell sx={{ ...cell, maxWidth: 220 }}>
                          <MDTypography fontSize="14px" sx={{ color: INK }}>{row.customerName || "—"}</MDTypography>
                          <MDTypography fontSize="12px" sx={{ color: MUTED, wordBreak: "break-all" }}>{row.customerEmail}</MDTypography>
                        </TableCell>
                        <TableCell sx={{ ...cell, maxWidth: 160 }}>{row.clientName || "—"}</TableCell>
                        <TableCell sx={{ ...cell, maxWidth: 240 }}>
                          <MDTypography fontSize="14px" sx={{ color: INK }}>{boughtSummary(row)}</MDTypography>
                          <MDTypography fontSize="12px" sx={{ color: MUTED }}>
                            {row.items.slice(0, 3).map((i) => i.name).join(", ")}
                            {row.items.length > 3 && ` +${row.items.length - 3} more`}
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ ...cell, whiteSpace: "nowrap" }}>
                          <MDTypography fontSize="14px" sx={{ color: INK }}>
                            {row.payment.credits ?? "—"} cr{row.payment.amount ? ` · ${inr(row.payment.amount)}` : ""}
                          </MDTypography>
                          <MDTypography fontSize="12px" sx={{ color: MUTED }}>
                            {methodLabel(row.payment.method)}
                            {row.payment.test && " · TEST"}
                            {row.payment.paidAt && ` · ${date(row.payment.paidAt)}`}
                          </MDTypography>
                          {row.payment.refundedCredits > 0 && (
                            <MDTypography fontSize="12px" sx={{ color: "#b71c1c" }}>{row.payment.refundedCredits} cr refunded</MDTypography>
                          )}
                          {row.payment.issue && <MDTypography fontSize="12px" sx={{ color: "#b26a00", fontWeight: 700 }}>⚠ Payment needs review</MDTypography>}
                        </TableCell>
                        <TableCell sx={cell}><Progress row={row} /></TableCell>
                        <TableCell sx={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>
                          <MDButton
                            size="small"
                            data-testid="next-step"
                            variant={["REVIEW", "PUBLISH_SITES", "CLOSE_PR", "REJECT_PR"].includes(row.nextStep) ? "gradient" : "outlined"}
                            color={row.nextStep === "REJECT_PR" ? "error" : "primary"}
                            onClick={() => onNext(row)}
                          >
                            {nextStepLabel(row)}
                          </MDButton>
                        </TableCell>
                      </TableRow>
                      {expanded && (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ ...cell, background: "#fafbfc", py: 1 }}>
                            <SitesTable row={row} onChanged={() => refetch()} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
                {!loading && !rows.length && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ ...cell, textAlign: "center", py: 6, color: MUTED }}>
                      {search || from || to ? "No PRs match your search." : "Nothing here right now."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </MDBox>
          {info && info.pageCount > 1 && (
            <MDBox p={2} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
              <MDTypography fontSize="13px" sx={{ color: MUTED }}>
                Page {info.currentPage + 1} of {info.pageCount} · {info.itemCount} PRs
              </MDTypography>
              <MDButton size="small" variant="outlined" color="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</MDButton>
              <MDButton size="small" variant="outlined" color="secondary" disabled={!info.hasNextPage} onClick={() => setPage(page + 1)}>Next</MDButton>
            </MDBox>
          )}
        </Card>
      </MDBox>
    </>
  );
}

export default PrOrders;
