import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import {
  IMPORT_PUBLICATIONS,
  IImportPublications,
  IImportPublicationsVars,
  PublicationImportResult,
  PublicationImportRow,
} from "graphql/mutations/importPublications";
import {
  GET_PUBLICATION_SETTINGS,
  IGetPublicationSettings,
} from "graphql/queries/getPublicationSettings";
import { csvToObjects, mapImportRow, recognisedColumns, vendorPriceProblem } from "./importRows";
import { calcClientPrice, formatInr } from "./pricing";

const MAX_ROWS = 2000;
const PREVIEW_ROWS = 8;
const SHEET_COLUMNS =
  "Base Domain, Display Name, Language, Link Type DF/NF, Tier, Backlinks, Vertical, Validity, Category/Niche, DA, Indexed, Words Allowed, TAT, Disclaimer, Vendor INR, Sample Link, Source Vendor, Notes";

const today = () => new Date().toISOString().slice(0, 10);

const cellSx = { fontSize: "12px", py: 0.75, px: 1, whiteSpace: "nowrap" };

const ImportDialog = ({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: () => void;
}) => {
  const [tab, setTab] = useState<"csv" | "json">("csv");
  const [fileName, setFileName] = useState<string>("");
  const [jsonText, setJsonText] = useState<string>("");
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [batch, setBatch] = useState<string>(`import-${today()}`);
  const [dryResult, setDryResult] = useState<PublicationImportResult | null>(null);
  const [applied, setApplied] = useState<PublicationImportResult | null>(null);
  const [confirmApply, setConfirmApply] = useState(false);

  const { data: settingsData } = useQuery<IGetPublicationSettings>(GET_PUBLICATION_SETTINGS);
  const settings = settingsData?.getPublicationSettings;

  const [runImport, { loading }] = useMutation<IImportPublications, IImportPublicationsVars>(
    IMPORT_PUBLICATIONS
  );

  const rows: PublicationImportRow[] = useMemo(() => rawRows.map(mapImportRow), [rawRows]);

  const resetResults = () => {
    setDryResult(null);
    setApplied(null);
    setConfirmApply(false);
  };

  const loadObjects = (objs: Record<string, any>[], cols: string[]) => {
    resetResults();
    if (!objs.length) {
      setRawRows([]);
      setParseError("No rows found. The first line must be the column names.");
      return;
    }
    if (objs.length > MAX_ROWS) {
      setRawRows([]);
      setParseError(`Too many rows (${objs.length}). Import at most ${MAX_ROWS} at a time.`);
      return;
    }
    const known = recognisedColumns(cols);
    if (!known.length) {
      setRawRows([]);
      setParseError(`No known columns found. Expected columns like: ${SHEET_COLUMNS}.`);
      return;
    }
    setParseError("");
    setHeaders(cols);
    setRawRows(objs);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setParseError("Choose a .csv file (in Excel: File → Save As → CSV UTF-8).");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const objs = csvToObjects(String(reader.result || ""));
        loadObjects(objs, objs.length ? Object.keys(objs[0]) : []);
      } catch (err: any) {
        setParseError(`Could not read the CSV: ${err?.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const onParseJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const arr = Array.isArray(parsed) ? parsed : parsed?.rows;
      if (!Array.isArray(arr) || arr.some((r) => !r || typeof r !== "object")) {
        setParseError(
          'Paste a JSON array of row objects, e.g. [{ "Base Domain": "site.com", ... }]'
        );
        return;
      }
      const cols = Array.from(new Set(arr.flatMap((r: any) => Object.keys(r))));
      loadObjects(arr, cols);
    } catch (err: any) {
      setParseError(`Invalid JSON: ${err?.message}`);
    }
  };

  const send = (dryRun: boolean) =>
    runImport({ variables: { params: { rows, dryRun, importBatch: batch.trim() || null } } })
      .then(({ data }) => {
        const res = data?.importPublications;
        if (!res) return;
        // Clearer reasons for prices the sheet left blank or typed as text
        const skipped = res.skipped.map((s) => {
          const p = vendorPriceProblem(rawRows[s.row - 1]);
          return p && /vendorPriceInr/.test(s.reason) ? { ...s, reason: p } : s;
        });
        const result = { ...res, skipped };
        if (dryRun) setDryResult(result);
        else {
          setApplied(result);
          setConfirmApply(false);
          toast.success(`Imported: ${res.added} added, ${res.updated} updated`);
          onImported?.();
        }
      })
      .catch((err: any) => toast.error(err?.message));

  const result = applied || dryResult;
  const canApply =
    !!dryResult && !applied && dryResult.added + dryResult.updated > 0 && !!rows.length;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      {loading && <MDCircularLoader overlayloader startLoader />}
      <MDBox display="flex" alignItems="center" justifyContent="space-between" pr={1}>
        <DialogTitle>
          <MDTypography fontSize="18px" fontWeight="medium">
            Import publications
          </MDTypography>
          <MDTypography fontSize="13px" color="text">
            Rows are matched to existing offerings by domain + offering label. New ones are added
            hidden (suppressed).
          </MDTypography>
        </DialogTitle>
        <IconButton aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MDBox>
      <DialogContent dividers>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ mb: 2, maxWidth: 360 }}
          aria-label="Import source"
        >
          <Tab value="csv" label="Upload CSV" />
          <Tab value="json" label="Paste JSON" />
        </Tabs>

        {tab === "csv" ? (
          <MDBox>
            <MDButton component="label" variant="outlined" color="primary" size="small">
              <UploadFileIcon sx={{ mr: 1 }} />
              Choose CSV file
              <input hidden type="file" accept=".csv,text/csv" onChange={onFile} />
            </MDButton>
            {fileName && (
              <MDTypography component="span" fontSize="13px" ml={1}>
                {fileName}
              </MDTypography>
            )}
            <MDTypography fontSize="12px" color="text" mt={1}>
              Excel sheet → File → Save As → <strong>CSV UTF-8</strong>. Columns: {SHEET_COLUMNS}.
            </MDTypography>
          </MDBox>
        ) : (
          <MDBox>
            <MDInput
              fullWidth
              multiline
              minRows={5}
              maxRows={12}
              value={jsonText}
              placeholder='[{ "Base Domain": "example.com", "Display Name": "Example", "Vendor INR": 5000 }]'
              inputProps={{
                "aria-label": "JSON rows",
                style: { fontFamily: "monospace", fontSize: 12 },
              }}
              onChange={(e: any) => setJsonText(e.target.value)}
            />
            <MDBox mt={1}>
              <MDButton
                variant="outlined"
                color="primary"
                size="small"
                disabled={!jsonText.trim()}
                onClick={onParseJson}
              >
                Read rows
              </MDButton>
            </MDBox>
            <MDTypography fontSize="12px" color="text" mt={1}>
              Use the sheet column names above or the API field names (domain, title,
              vendorPriceInr, variantLabel, ...).
            </MDTypography>
          </MDBox>
        )}

        {parseError && (
          <Alert severity="error" sx={{ mt: 2, fontSize: "13px" }}>
            {parseError}
          </Alert>
        )}

        {!!rows.length && (
          <MDBox mt={2}>
            <MDBox display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
              <MDBox flex="1 1 220px">
                <MDTypography component="label" fontSize="13px" fontWeight="medium">
                  Import batch name
                </MDTypography>
                <MDInput
                  fullWidth
                  value={batch}
                  inputProps={{ maxLength: 60, "aria-label": "Import batch name" }}
                  onChange={(e: any) => {
                    setBatch(e.target.value);
                    resetResults();
                  }}
                />
              </MDBox>
              <MDTypography fontSize="13px" flex="1 1 220px">
                <strong>{rows.length}</strong> rows read · mapped columns:{" "}
                {recognisedColumns(headers).join(", ")}
              </MDTypography>
            </MDBox>

            <MDTypography fontSize="13px" fontWeight="medium" mt={2} mb={0.5}>
              Preview (first {Math.min(PREVIEW_ROWS, rows.length)} rows)
            </MDTypography>
            <TableContainer sx={{ border: "1px solid #eee", borderRadius: 1, maxHeight: 260 }}>
              <Table size="small">
                <TableBody>
                  <TableRow sx={{ background: "#F8F8FC" }}>
                    {["#", "Domain", "Title", "Offering", "Vendor ₹", "Est. credits"].map((h) => (
                      <TableCell key={h} sx={{ ...cellSx, fontWeight: 600 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                  {rows.slice(0, PREVIEW_ROWS).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell sx={cellSx}>{i + 1}</TableCell>
                      <TableCell sx={cellSx}>{r.domain || <em>missing</em>}</TableCell>
                      <TableCell sx={cellSx}>{r.title}</TableCell>
                      <TableCell sx={cellSx}>{r.variantLabel}</TableCell>
                      <TableCell sx={cellSx}>
                        {r.vendorPriceInr > 0 ? formatInr(r.vendorPriceInr) : <em>invalid</em>}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {r.vendorPriceInr > 0
                          ? calcClientPrice(r.vendorPriceInr, null, null, settings) ?? "-"
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        )}

        {result && (
          <MDBox mt={2}>
            <Alert severity={applied ? "success" : "info"} sx={{ fontSize: "13px" }}>
              {applied ? "Import applied." : "Dry run — nothing has been saved yet."}{" "}
              <strong>{result.added}</strong> to add · <strong>{result.updated}</strong> to update ·{" "}
              <strong>{result.unchanged}</strong> unchanged ·{" "}
              <strong>{result.skipped.length}</strong> skipped
            </Alert>
            {!!result.skipped.length && (
              <TableContainer
                sx={{ border: "1px solid #eee", borderRadius: 1, maxHeight: 220, mt: 1 }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ background: "#F8F8FC" }}>
                      {["Row", "Domain", "Why skipped"].map((h) => (
                        <TableCell key={h} sx={{ ...cellSx, fontWeight: 600 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                    {result.skipped.map((s) => (
                      <TableRow key={s.row}>
                        <TableCell sx={cellSx}>{s.row}</TableCell>
                        <TableCell sx={cellSx}>{s.domain || "-"}</TableCell>
                        <TableCell sx={{ ...cellSx, whiteSpace: "normal" }}>{s.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {confirmApply && (
              <Alert severity="warning" sx={{ mt: 1, fontSize: "13px" }}>
                This writes {dryResult.added + dryResult.updated} publications to the live catalog
                (updates change prices customers see straight away). Click{" "}
                <strong>Yes, apply</strong> to continue.
              </Alert>
            )}
          </MDBox>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
        <MDButton variant="outlined" color="primary" onClick={onClose}>
          {applied ? "Close" : "Cancel"}
        </MDButton>
        <MDButton
          variant="outlined"
          color="dark"
          disabled={!rows.length || loading || !!applied}
          onClick={() => send(true)}
        >
          {dryResult ? "Run dry run again" : "Run dry run"}
        </MDButton>
        {confirmApply ? (
          <MDButton
            variant="contained"
            color="error"
            disabled={loading}
            onClick={() => send(false)}
          >
            Yes, apply
          </MDButton>
        ) : (
          <MDButton
            variant="contained"
            color="primary"
            disabled={!canApply || loading}
            onClick={() => setConfirmApply(true)}
          >
            Apply import
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
