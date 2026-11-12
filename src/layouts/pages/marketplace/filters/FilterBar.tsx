import { useEffect, useState } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { BRAND, BRAND_SOFT, FilterOpts, INK, LINE, MUTED, Update, defById } from "./FilterControls";
import { ActiveChip, Filters, SCOPES, SavedFilter, Scope, loadSaved, storeSaved } from "./model";

function Pill({ label, icon, onClick, active = false, highlighted = false, disabled = false, caret = false, testId }: { label: string; icon?: JSX.Element; onClick?: (e: React.MouseEvent<HTMLElement>) => void; active?: boolean; highlighted?: boolean; disabled?: boolean; caret?: boolean; testId?: string }): JSX.Element {
  const on = active || highlighted;
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      sx={{
        flex: "0 0 auto",
        gap: 0.5,
        px: 1.5,
        height: 34,
        borderRadius: "17px",
        fontSize: "14px",
        fontWeight: on ? 600 : 400,
        whiteSpace: "nowrap",
        border: `1px solid ${on ? BRAND : LINE}`,
        background: highlighted ? BRAND : active ? BRAND_SOFT : "#fff",
        color: highlighted ? "#fff" : on ? BRAND : disabled ? MUTED : INK,
        opacity: disabled ? 0.6 : 1,
        "& svg": { fontSize: "18px !important" },
      }}
    >
      {icon}
      {label}
      {caret && <KeyboardArrowDownIcon />}
    </ButtonBase>
  );
}

interface Props {
  filters: Filters;
  update: Update;
  opts: FilterOpts;
  chips: ActiveChip[];
  resultCount: number;
  isPhone: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;
  currentQuery: string; // filter part of the URL (no page), used by Save filter
  onApplyQuery: (query: string) => void;
  sortControl: JSX.Element;
}

// Quick pills: [label, filter id, has-value test]
const QUICK: { label: string; id: string; on: (f: Filters) => boolean; noData?: boolean }[] = [
  { label: "Price", id: "price", on: (f) => f.priceMin !== null || f.priceMax !== null },
  { label: "Traffic", id: "traffic", on: () => false, noData: true },
  { label: "DR", id: "dr", on: () => false, noData: true },
  { label: "DA", id: "da", on: (f) => f.daMin !== null || f.daMax !== null },
  { label: "Language", id: "language", on: (f) => !!(f.langInclude.length || f.langExclude.length) },
  { label: "Link type", id: "linkType", on: (f) => !!f.linkType },
  { label: "Category", id: "category", on: (f) => !!(f.catInclude.length || f.catExclude.length) },
];

function FilterBar({ filters, update, opts, chips, resultCount, isPhone, onOpenDrawer, onClearAll, currentQuery, onApplyQuery, sortControl }: Props): JSX.Element {
  const [draft, setDraft] = useState(filters.q);
  const [pop, setPop] = useState<{ id: string; el: HTMLElement } | null>(null);
  const [saveEl, setSaveEl] = useState<HTMLElement | null>(null);
  const [saved, setSaved] = useState<SavedFilter[]>(() => loadSaved());
  const [saveName, setSaveName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // URL -> box (Back button, saved filter, chip removal)
  useEffect(() => setDraft(filters.q), [filters.q]);
  // box -> URL, debounced; typing replaces the history entry instead of stacking one per key
  useEffect(() => {
    if (draft === filters.q) return undefined;
    const t = setTimeout(() => update({ q: draft }, { replace: !!filters.q && !!draft }), 250);
    return () => clearTimeout(t);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const popDef = pop ? defById(pop.id) : null;
  const saveFilter = () => {
    const name = saveName.trim();
    if (!name) return;
    const next = [{ name, query: currentQuery, savedAt: Date.now() }, ...saved.filter((s) => s.name !== name)].slice(0, 30);
    setSaveMsg(storeSaved(next) ? "Saved in this browser." : "Could not save: browser storage is blocked.");
    setSaved(next);
    setSaveName("");
  };
  const removeSaved = (name: string) => {
    const next = saved.filter((s) => s.name !== name);
    storeSaved(next);
    setSaved(next);
  };

  return (
    <Card sx={{ p: 2, mb: 2, overflow: "visible" }}>
      {/* search with scope */}
      <MDBox display="flex" sx={{ border: `1px solid ${LINE}`, borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
        <TextField
          select
          size="small"
          value={filters.scope}
          onChange={(e) => update({ scope: e.target.value as Scope })}
          SelectProps={{ "aria-label": "Search in", MenuProps: { disableScrollLock: true } } as any}
          sx={{
            width: isPhone ? 104 : 150,
            flex: "0 0 auto",
            background: "#F8F9FA",
            borderRight: `1px solid ${LINE}`,
            "& fieldset": { border: "none" },
            "& .MuiInputBase-root": { height: 44, fontSize: "14px" },
          }}
        >
          {SCOPES.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          size="small"
          placeholder={isPhone ? "Search websites…" : "Search website, domain, or topic…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          inputProps={{ "aria-label": "Search websites" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: draft ? (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Clear search" onClick={() => setDraft("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
          sx={{ "& fieldset": { border: "none" }, "& .MuiInputBase-root": { height: 44 } }}
        />
      </MDBox>

      {/* pill row */}
      <MDBox
        display="flex"
        gap={1}
        mt={1.5}
        pb={0.5}
        data-testid="pill-row"
        sx={{ overflowX: "auto", flexWrap: isPhone ? "nowrap" : "wrap", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      >
        <Pill testId="pill-all" label={chips.length ? `All filters · ${chips.length}` : "All filters"} icon={<TuneIcon />} highlighted onClick={onOpenDrawer} />
        {QUICK.map((p) =>
          p.noData ? (
            <Tooltip key={p.id} title="No data yet" arrow>
              <span>
                <Pill testId={`pill-${p.id}`} label={p.label} caret disabled />
              </span>
            </Tooltip>
          ) : (
            <Pill key={p.id} testId={`pill-${p.id}`} label={p.label} caret active={p.on(filters)} onClick={(e) => setPop({ id: p.id, el: e.currentTarget })} />
          )
        )}
        <Tooltip title="Coming soon" arrow>
          <span>
            <Pill testId="pill-alerts" label="Alerts" icon={<NotificationsNoneIcon />} disabled />
          </span>
        </Tooltip>
        <Pill testId="pill-save" label="Save filter" icon={<BookmarkBorderIcon />} onClick={(e) => { setSaveMsg(""); setSaveEl(e.currentTarget); }} />
      </MDBox>

      {/* active chips + count + sort */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mt={1.5}>
        <MDBox display="flex" alignItems="center" flexWrap="wrap" gap={0.75} minWidth={0}>
          <MDTypography fontSize="15px" fontWeight="bold" sx={{ color: INK, mr: 0.5 }} data-testid="result-count">
            {resultCount} {resultCount === 1 ? "website" : "websites"}
          </MDTypography>
          {chips.map((c) => (
            <Chip
              key={c.key}
              size="small"
              label={c.label}
              onDelete={() => update(c.clear)}
              data-testid={`chip-${c.key}`}
              sx={{ maxWidth: "100%", background: BRAND_SOFT, color: BRAND, fontWeight: 600, "& .MuiChip-deleteIcon": { color: BRAND } }}
            />
          ))}
          {chips.length > 0 && (
            <MDButton variant="text" color="primary" size="small" onClick={onClearAll} sx={{ textTransform: "none" }}>
              Clear all
            </MDButton>
          )}
        </MDBox>
        {sortControl}
      </MDBox>

      {/* quick-filter popover */}
      <Popover
        open={!!pop}
        anchorEl={pop?.el}
        onClose={() => setPop(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, p: 2, width: 340, backgroundColor: "#fff", maxWidth: "calc(100vw - 32px)" }, "data-testid": "quick-popover" } as any}
      >
        {popDef && (
          <MDBox>
            <MDTypography fontSize="13px" fontWeight="bold" sx={{ color: INK, letterSpacing: "0.05em", textTransform: "uppercase", mb: 1.5 }}>
              {popDef.title}
            </MDTypography>
            {popDef.body(filters, update, opts)}
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <MDTypography fontSize="13px" sx={{ color: MUTED }}>
                {resultCount} {resultCount === 1 ? "website" : "websites"}
              </MDTypography>
              <MDButton color="primary" size="small" onClick={() => setPop(null)}>
                Done
              </MDButton>
            </MDBox>
          </MDBox>
        )}
      </Popover>

      {/* save filter popover */}
      <Popover
        open={!!saveEl}
        anchorEl={saveEl}
        onClose={() => setSaveEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, p: 2, width: 340, backgroundColor: "#fff", maxWidth: "calc(100vw - 32px)" }, "data-testid": "save-popover" } as any}
      >
        <MDTypography fontSize="13px" fontWeight="bold" sx={{ color: INK, letterSpacing: "0.05em", textTransform: "uppercase", mb: 1.5 }}>
          Save filter
        </MDTypography>
        {chips.length ? (
          <MDBox display="flex" gap={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Name this filter"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveFilter()}
              inputProps={{ "aria-label": "Filter name", maxLength: 60 }}
            />
            <MDButton color="primary" size="small" onClick={saveFilter} disabled={!saveName.trim()}>
              Save
            </MDButton>
          </MDBox>
        ) : (
          <MDTypography fontSize="13px" sx={{ color: MUTED }}>
            Set a filter first, then save it here.
          </MDTypography>
        )}
        {saveMsg && (
          <MDTypography fontSize="12px" sx={{ color: MUTED, mt: 0.75 }}>
            {saveMsg}
          </MDTypography>
        )}
        <MDTypography fontSize="12px" fontWeight="medium" sx={{ color: MUTED, textTransform: "uppercase", mt: 2, mb: 0.5 }}>
          Saved filters
        </MDTypography>
        {!saved.length && (
          <MDTypography fontSize="13px" sx={{ color: MUTED }}>
            None yet.
          </MDTypography>
        )}
        {saved.map((s) => (
          <MDBox key={s.name} display="flex" alignItems="center" justifyContent="space-between" gap={1} sx={{ borderTop: `1px solid ${LINE}` }}>
            <ButtonBase
              onClick={() => { onApplyQuery(s.query); setSaveEl(null); }}
              sx={{ flex: 1, justifyContent: "flex-start", textAlign: "left", py: 1, fontSize: "14px", color: INK }}
              data-testid={`saved-${s.name}`}
            >
              {s.name}
            </ButtonBase>
            <IconButton size="small" aria-label={`Delete saved filter ${s.name}`} onClick={() => removeSaved(s.name)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </MDBox>
        ))}
      </Popover>
    </Card>
  );
}

export default FilterBar;
