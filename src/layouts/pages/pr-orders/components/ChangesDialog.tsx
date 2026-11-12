import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { INK, MUTED } from "./common";

// The checklist shown to the admin; the ticked lines are sent to the customer as they are written here
export const CHANGE_OPTIONS = [
  "Title / headline",
  "Article content / wording",
  "Add a company quote",
  "Images (better quality / right size)",
  "Links (fewer links / fix links)",
  "Company details (name, website, contact)",
  "Remove promotional words (site policy)",
  "Formatting",
  "Other (see note)",
];

// "Make changes": tick what the customer must change, add a note, send
function ChangesDialog({ accepted, saving, onClose, onConfirm }: { accepted: boolean; saving: boolean; onClose: () => void; onConfirm: (changes: string[], note: string) => void }): JSX.Element {
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const toggle = (c: string) => { setErr(""); setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c])); };
  const submit = () => {
    const n = note.trim();
    if (!picked.length && !n) return setErr("Tick at least one change or write what to change");
    if (picked.includes("Other (see note)") && !n) return setErr("Write the other change in the note");
    onConfirm(CHANGE_OPTIONS.filter((c) => picked.includes(c)), n);
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: INK }}>Make changes</DialogTitle>
      <DialogContent>
        <MDTypography fontSize="14px" sx={{ color: MUTED, mb: 1.5 }}>
          The customer gets an email with this list, edits the PR and sends it again (no new payment).
          {accepted ? " The PR goes back to “Waiting for customer” until then; sites can't be published meanwhile." : ""}
        </MDTypography>
        <MDTypography fontSize="13px" fontWeight="bold" sx={{ color: INK }}>What should they change?</MDTypography>
        <Grid container data-testid="changes-checklist">
          {CHANGE_OPTIONS.map((c) => (
            <Grid item xs={12} sm={6} key={c}>
              <FormControlLabel
                sx={{ display: "flex", flexWrap: "nowrap", alignItems: "center", mr: 0 }}
                control={<Checkbox size="small" checked={picked.includes(c)} onChange={() => toggle(c)} />}
                label={<MDTypography fontSize="14px" sx={{ color: INK }}>{c}</MDTypography>}
              />
            </Grid>
          ))}
        </Grid>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Note for the customer (optional)"
          InputLabelProps={{ shrink: true }}
          placeholder="e.g. Please replace the first image with a landscape one, at least 1200px wide"
          value={note}
          onChange={(e) => { setErr(""); setNote(e.target.value); }}
          inputProps={{ maxLength: 2000, "data-testid": "changes-note-input" }}
          sx={{ mt: 1.5 }}
        />
        {err && <MDTypography fontSize="13px" sx={{ color: "#b71c1c", mt: 1 }}>{err}</MDTypography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton size="small" variant="outlined" color="secondary" onClick={onClose}>Cancel</MDButton>
        <MDButton size="small" variant="gradient" color="warning" onClick={submit} disabled={saving}>{saving ? "Sending…" : "Send to customer"}</MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default ChangesDialog;
