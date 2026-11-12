import { useState } from "react";
import dayjs from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { IAdminPrRow } from "graphql/queries/adminPrOrders";

export const INK = "#344767";
export const MUTED = "#7b809a";

// PR status, in words an admin understands at a glance
export const PR_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Unpaid draft", color: "#5f6368", bg: "#eceff1" },
  SUBMITTED: { label: "New", color: "#1565c0", bg: "#e3f2fd" },
  REVIEW: { label: "In review", color: "#1565c0", bg: "#e3f2fd" },
  AWAITING_APPROVAL: { label: "Waiting for customer", color: "#b26a00", bg: "#fff4e5" },
  SCHEDULED: { label: "In progress", color: "#6a1b9a", bg: "#f3e5f5" },
  PUBLISHED: { label: "Published", color: "#1b5e20", bg: "#e8f5e9" },
  REJECTED: { label: "Rejected", color: "#b71c1c", bg: "#ffebee" },
};

export const SITE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "#b26a00", bg: "#fff4e5" },
  PUBLISHED: { label: "Live", color: "#1b5e20", bg: "#e8f5e9" },
  REJECTED: { label: "Rejected", color: "#b71c1c", bg: "#ffebee" },
};

export function Pill({ label, color, bg }: { label: string; color: string; bg: string }): JSX.Element {
  return (
    <MDBox
      component="span"
      sx={{ display: "inline-block", px: 1.25, py: 0.25, borderRadius: "999px", fontSize: "12px", fontWeight: 600, color, background: bg, whiteSpace: "nowrap" }}
    >
      {label}
    </MDBox>
  );
}

export const inr = (paise: number | null): string =>
  paise == null ? "" : `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const date = (d: string | null, withTime = false): string =>
  d ? dayjs(d).format(withTime ? "DD MMM YYYY, h:mm A" : "DD MMM YYYY") : "—";

export const methodLabel = (m: string): string =>
  ({ CREDITS: "01Wire Credits", RAZORPAY: "Razorpay", SHOPIFY: "Shopify", UNPAID: "Not paid" } as Record<string, string>)[m] || m;

// One line: "3 sites · 1 package"
export const boughtSummary = (row: IAdminPrRow): string => {
  const sites = row.items.filter((i) => i.type !== "Package").length;
  const pkgs = row.items.filter((i) => i.type === "Package").length;
  return [sites ? `${sites} site${sites > 1 ? "s" : ""}` : "", pkgs ? `${pkgs} package${pkgs > 1 ? "s" : ""}` : ""]
    .filter(Boolean)
    .join(" · ") || "Nothing selected";
};

// The single next thing an admin should do for this PR
export const nextStepLabel = (row: IAdminPrRow): string => {
  switch (row.nextStep) {
    case "REVIEW":
      return "Review";
    case "WAITING_CUSTOMER":
      return "Waiting for customer";
    case "PUBLISH_SITES":
      return `Publish ${row.pendingCount} ${row.pendingCount === 1 ? "site" : "sites"}`;
    case "CLOSE_PR":
      return "Mark PR published";
    case "REJECT_PR":
      return "Close as rejected";
    case "UNPAID":
      return "View draft";
    default:
      return "View";
  }
};

// Asks for a reason or a link before an action (Reject, Ask for changes, Publish)
export function AskDialog({
  open,
  title,
  text,
  label,
  placeholder,
  confirm,
  danger = false,
  needsUrl = false,
  optional = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  text?: string;
  label?: string;
  placeholder?: string;
  confirm: string;
  danger?: boolean;
  needsUrl?: boolean;
  optional?: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}): JSX.Element {
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const v = value.trim();
    if (!label) return onConfirm("");
    if (!v && !optional) return setErr(needsUrl ? "Paste the live link" : "Please write a short reason");
    if (needsUrl && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v)) return setErr("Enter a full link starting with https://");
    onConfirm(v);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{ onExited: () => { setValue(""); setErr(""); } }}
    >
      <DialogTitle sx={{ color: INK }}>{title}</DialogTitle>
      <DialogContent>
        {text && (
          <MDTypography fontSize="14px" sx={{ color: MUTED, mb: label ? 2 : 0 }}>
            {text}
          </MDTypography>
        )}
        {label && (
          <TextField
            autoFocus
            fullWidth
            label={label}
            placeholder={placeholder}
            value={value}
            multiline={!needsUrl}
            minRows={needsUrl ? 1 : 2}
            onChange={(e) => { setValue(e.target.value); setErr(""); }}
            error={!!err}
            helperText={err || " "}
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton variant="outlined" color="secondary" size="small" onClick={onClose}>
          Cancel
        </MDButton>
        <MDButton variant="gradient" color={danger ? "error" : "primary"} size="small" onClick={submit}>
          {confirm}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}
