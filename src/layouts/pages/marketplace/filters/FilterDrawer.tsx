import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { BRAND, BRAND_SOFT, FILTER_DEFS, FilterOpts, INK, LINE, MUTED, Update } from "./FilterControls";
import { Filters } from "./model";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  update: Update;
  opts: FilterOpts;
  activeCount: number;
  resultCount: number;
  onClearAll: () => void;
}

function FilterDrawer({ open, onClose, filters, update, opts, activeCount, resultCount, onClearAll }: Props): JSX.Element {
  const [find, setFind] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["price"]);
  const q = find.trim().toLowerCase();
  const defs = FILTER_DEFS.filter((d) => !q || `${d.title} ${d.keywords || ""}`.toLowerCase().includes(q));
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ whiteSpace: "normal" }}
      PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, maxWidth: "100%", m: 0, borderRadius: 0, height: "100%" } }}
    >
      <MDBox display="flex" flexDirection="column" height="100%" data-testid="all-filters-drawer">
        <MDBox px={2.5} pt={2.5} pb={1.5} sx={{ borderBottom: `1px solid ${LINE}` }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
            <MDBox>
              <MDBox display="flex" alignItems="center" gap={1}>
                <MDTypography variant="h5" sx={{ color: INK }}>
                  All filters
                </MDTypography>
                {activeCount > 0 && (
                  <MDBox component="span" data-testid="active-badge" sx={{ px: 1, py: 0.25, borderRadius: "10px", background: BRAND_SOFT, color: BRAND, fontSize: "12px", fontWeight: 700 }}>
                    {activeCount} active
                  </MDBox>
                )}
              </MDBox>
              <MDTypography fontSize="13px" sx={{ color: MUTED }}>
                Refine your website search with advanced filters
              </MDTypography>
            </MDBox>
            <IconButton aria-label="Close all filters" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </MDBox>
          <TextField
            fullWidth
            size="small"
            placeholder="All filters…"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            inputProps={{ "aria-label": "Find a filter" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1.5 }}
          />
        </MDBox>

        <MDBox flex={1} sx={{ overflowY: "auto" }}>
          {!defs.length && (
            <MDTypography p={2.5} fontSize="14px" sx={{ color: MUTED }}>
              No filter matches “{find}”.
            </MDTypography>
          )}
          {defs.map((d) => {
            const value = d.disabled ? "" : d.value(filters, opts);
            const isOpen = !d.disabled && (expanded.includes(d.id) || !!q);
            return (
              <Accordion
                key={d.id}
                disableGutters
                elevation={0}
                square
                expanded={isOpen}
                onChange={(_, ex) => setExpanded((xs) => (ex ? [...xs, d.id] : xs.filter((x) => x !== d.id)))}
                sx={{ borderBottom: `1px solid ${LINE}`, "&:before": { display: "none" }, background: "transparent" }}
              >
                <AccordionSummary expandIcon={d.disabled ? null : <ExpandMoreIcon />} sx={{ px: 2.5, minHeight: 52, cursor: d.disabled ? "default !important" : "pointer" }} data-testid={`section-${d.id}`}>
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" width="100%" gap={1} pr={1}>
                    <MDTypography fontSize="13px" fontWeight="bold" sx={{ color: d.disabled ? MUTED : INK, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {d.title}
                    </MDTypography>
                    {d.disabled ? (
                      <MDTypography fontSize="12px" sx={{ color: MUTED }}>
                        No data yet
                      </MDTypography>
                    ) : (
                      value && (
                        <MDBox component="span" sx={{ px: 1, py: 0.25, borderRadius: "10px", background: BRAND_SOFT, color: BRAND, fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                          {value}
                        </MDBox>
                      )
                    )}
                  </MDBox>
                </AccordionSummary>
                {!d.disabled && <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>{d.body(filters, update, opts)}</AccordionDetails>}
              </Accordion>
            );
          })}
        </MDBox>

        <MDBox display="flex" gap={1} p={2} sx={{ borderTop: `1px solid ${LINE}` }}>
          <MDButton variant="outlined" color="dark" fullWidth onClick={onClearAll} disabled={!activeCount}>
            Clear all
          </MDButton>
          <MDButton color="primary" fullWidth onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "website" : "websites"}
          </MDButton>
        </MDBox>
      </MDBox>
    </Drawer>
  );
}

export default FilterDrawer;
