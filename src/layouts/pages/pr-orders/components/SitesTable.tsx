import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Link from "@mui/material/Link";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { UPDATE_ORDER_STATUS, IUpdateOrderStatusVars } from "graphql/mutations/updateOrderStatus";
import { IAdminPrItem, IAdminPrRow } from "graphql/queries/adminPrOrders";
import { AskDialog, INK, MUTED, Pill, SITE_STATUS, date } from "./common";

const cell = { borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.25, px: 1.5, fontSize: "14px", color: INK };
const head = { ...cell, fontWeight: 700, color: MUTED, fontSize: "12px", textTransform: "uppercase" as const };

// The sites / packages of one PR, with Publish and Reject for each pending one
function SitesTable({ row, onChanged }: { row: IAdminPrRow; onChanged: () => void }): JSX.Element {
  const [ask, setAsk] = useState<{ item: IAdminPrItem; action: "PUBLISHED" | "REJECTED" } | null>(null);
  const [update, { loading }] = useMutation<boolean, IUpdateOrderStatusVars>(UPDATE_ORDER_STATUS);
  const canAct = row.status === "SCHEDULED";

  const run = (value: string) => {
    if (!ask?.item.orderId) return;
    const { item, action } = ask;
    update({
      variables: {
        params: action === "PUBLISHED" ? { id: item.orderId, status: action, url: value } : { id: item.orderId, status: action, notes: value },
      },
    })
      .then(() => {
        toast.success(action === "PUBLISHED" ? `${item.name} is marked live` : `${item.name} rejected${item.credits ? ` · ${item.credits} credits refunded` : ""}`);
        setAsk(null);
        onChanged();
      })
      .catch((e) => toast.error(e?.message || "Could not update this site"));
  };

  if (!row.items.length) {
    return <MDTypography fontSize="14px" sx={{ color: MUTED, p: 2 }}>No sites or packages chosen yet.</MDTypography>;
  }
  return (
    <MDBox sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 760 }} data-testid="sites-table">
        <TableHead sx={{ display: "table-header-group" }}>
          <TableRow>
            <TableCell sx={head}>Site / package</TableCell>
            <TableCell sx={head}>Type</TableCell>
            <TableCell sx={head}>Credits</TableCell>
            <TableCell sx={head}>Status</TableCell>
            <TableCell sx={head}>Publish by</TableCell>
            <TableCell sx={head}>Live link / reason</TableCell>
            <TableCell sx={{ ...head, textAlign: "right" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {row.items.map((it, i) => {
            const st = it.status ? SITE_STATUS[it.status] : null;
            return (
              <TableRow key={it.orderId || `${it.name}-${i}`} data-testid="site-row">
                <TableCell sx={{ ...cell, fontWeight: 600 }}>{it.name}</TableCell>
                <TableCell sx={cell}>{it.type}</TableCell>
                <TableCell sx={cell}>{it.credits ?? "—"}</TableCell>
                <TableCell sx={cell}>{st ? <Pill {...st} /> : <MDTypography fontSize="13px" sx={{ color: MUTED }}>Not paid</MDTypography>}</TableCell>
                <TableCell sx={{ ...cell, color: it.overdue ? "#b71c1c" : INK, fontWeight: it.overdue ? 700 : 400 }}>
                  {date(it.publishBy)}
                  {it.overdue && <MDBox component="span" sx={{ display: "block", fontSize: "12px" }}>Late</MDBox>}
                </TableCell>
                <TableCell sx={{ ...cell, maxWidth: 260 }}>
                  {it.status === "PUBLISHED" && it.url ? (
                    <Link href={it.url} target="_blank" rel="noreferrer" sx={{ fontSize: "13px", wordBreak: "break-all" }}>
                      {it.url}
                    </Link>
                  ) : it.status === "REJECTED" ? (
                    <MDTypography fontSize="13px" sx={{ color: MUTED }}>
                      {it.notes || "—"}
                      {it.refundedCredits > 0 && ` · ${it.refundedCredits} credits refunded`}
                    </MDTypography>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell sx={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>
                  {it.status === "PENDING" && canAct ? (
                    <>
                      <MDButton size="small" variant="gradient" color="success" onClick={() => setAsk({ item: it, action: "PUBLISHED" })} sx={{ mr: 1 }}>
                        Publish
                      </MDButton>
                      <MDButton size="small" variant="outlined" color="error" onClick={() => setAsk({ item: it, action: "REJECTED" })}>
                        Reject
                      </MDButton>
                    </>
                  ) : it.status === "PENDING" ? (
                    <MDTypography fontSize="12px" sx={{ color: MUTED }}>Accept the PR first</MDTypography>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <AskDialog
        open={!!ask}
        title={ask?.action === "PUBLISHED" ? `Mark "${ask?.item.name}" as live` : `Reject "${ask?.item.name}"`}
        text={
          ask?.action === "PUBLISHED"
            ? "Paste the link where this press release is published. The customer will see it."
            : `The customer gets ${ask?.item.credits ?? "this site's"} credits back in their wallet. The reason is shown to them.`
        }
        label={ask?.action === "PUBLISHED" ? "Live link" : "Reason"}
        placeholder={ask?.action === "PUBLISHED" ? "https://…" : "e.g. The site no longer accepts this topic"}
        needsUrl={ask?.action === "PUBLISHED"}
        danger={ask?.action === "REJECTED"}
        confirm={loading ? "Saving…" : ask?.action === "PUBLISHED" ? "Mark live" : "Reject and refund"}
        onClose={() => setAsk(null)}
        onConfirm={run}
      />
    </MDBox>
  );
}

export default SitesTable;
