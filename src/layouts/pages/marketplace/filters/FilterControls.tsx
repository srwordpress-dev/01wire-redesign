import { useEffect, useState } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  BACKLINK,
  CATEGORY_OPTIONS,
  DISCLAIMER,
  Filters,
  INDEXED,
  LINK_TYPES,
  Option,
  SECTIONS,
  TATS,
} from "./model";

// Shared filter bodies: the same control renders inside a quick-filter popover and inside
// the All-filters drawer, so both always show and change the same URL-backed state.

export const BRAND = "#EE5C61";
export const BRAND_SOFT = "#FDECED";
export const MUTED = "#7B809A";
export const INK = "#344767";
export const LINE = "rgba(0,0,0,0.12)";

export type Update = (patch: Partial<Filters>, opts?: { replace?: boolean }) => void;

export function ToggleChip({ label, selected, tone = "include", onClick, disabled = false }: { label: string; selected: boolean; tone?: "include" | "exclude"; onClick: () => void; disabled?: boolean }): JSX.Element {
  const exclude = tone === "exclude";
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: "16px",
        fontSize: "13px",
        border: `1px solid ${selected ? (exclude ? INK : BRAND) : LINE}`,
        background: selected ? (exclude ? "#EEF0F4" : BRAND_SOFT) : "#fff",
        color: selected ? (exclude ? INK : BRAND) : INK,
        fontWeight: selected ? 600 : 400,
        textDecoration: selected && exclude ? "line-through" : "none",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </ButtonBase>
  );
}

function ChipGroup({ options, selected, onToggle, tone }: { options: Option[]; selected: string[]; onToggle: (v: string) => void; tone?: "include" | "exclude" }): JSX.Element {
  return (
    <MDBox display="flex" flexWrap="wrap" gap={0.75}>
      {options.map((o) => (
        <ToggleChip key={o.value} label={o.label} selected={selected.includes(o.value)} tone={tone} onClick={() => onToggle(o.value)} />
      ))}
    </MDBox>
  );
}

const toggle = (xs: string[], v: string) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]);

function Caption({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <MDTypography fontSize="12px" sx={{ color: MUTED, mt: 1 }}>
      {children}
    </MDTypography>
  );
}
function SubLabel({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <MDTypography fontSize="12px" fontWeight="medium" sx={{ color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75, mt: 0.5 }}>
      {children}
    </MDTypography>
  );
}

function RangeInputs({ min, max, onCommit, unit, presets = [], idPrefix }: { min: number | null; max: number | null; onCommit: (min: number | null, max: number | null) => void; unit: string; presets?: { label: string; min: number | null; max: number | null }[]; idPrefix: string }): JSX.Element {
  const [lo, setLo] = useState(min === null ? "" : String(min));
  const [hi, setHi] = useState(max === null ? "" : String(max));
  useEffect(() => setLo(min === null ? "" : String(min)), [min]);
  useEffect(() => setHi(max === null ? "" : String(max)), [max]);
  const parse = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) || Number(s) < 0 ? null : Number(s));
  const commit = () => {
    let a = parse(lo);
    let b = parse(hi);
    if (a !== null && b !== null && a > b) [a, b] = [b, a];
    if (a !== min || b !== max) onCommit(a, b);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
  };
  return (
    <MDBox>
      <MDBox display="flex" gap={1} alignItems="center">
        <TextField
          size="small"
          type="number"
          label={`Min ${unit}`}
          inputProps={{ min: 0, "data-testid": `${idPrefix}-min` }}
          value={lo}
          onChange={(e) => setLo(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          sx={{ flex: 1 }}
        />
        <MDTypography fontSize="14px" sx={{ color: MUTED }}>
          –
        </MDTypography>
        <TextField
          size="small"
          type="number"
          label={`Max ${unit}`}
          inputProps={{ min: 0, "data-testid": `${idPrefix}-max` }}
          value={hi}
          onChange={(e) => setHi(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          sx={{ flex: 1 }}
        />
      </MDBox>
      {presets.length > 0 && (
        <MDBox display="flex" flexWrap="wrap" gap={0.75} mt={1.25}>
          {presets.map((p) => (
            <ToggleChip key={p.label} label={p.label} selected={p.min === min && p.max === max} onClick={() => (p.min === min && p.max === max ? onCommit(null, null) : onCommit(p.min, p.max))} />
          ))}
        </MDBox>
      )}
    </MDBox>
  );
}

export interface FilterOpts {
  languages: Option[];
  tiers: Option[];
}

export interface FilterDef {
  id: string;
  title: string; // drawer heading (shown in caps)
  disabled?: boolean;
  keywords?: string; // extra words for the drawer search box
  value: (f: Filters, o: FilterOpts) => string; // short summary for the drawer chip; "" when unset
  body: (f: Filters, update: Update, o: FilterOpts) => JSX.Element | null;
}

const labelOf = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label || v;
const rangeText = (a: number | null, b: number | null) => (a === null && b === null ? "" : a !== null && b !== null ? `${a} - ${b}` : a !== null ? `${a}+` : `≤ ${b}`);
const countText = (xs: string[], opts: Option[]) => (xs.length === 0 ? "" : xs.length === 1 ? labelOf(opts, xs[0]) : `${xs.length} selected`);

const noData = (what: string): FilterDef["body"] => () => <Caption>No data yet. {what} will be filterable once we have it for each website.</Caption>;

export const FILTER_DEFS: FilterDef[] = [
  {
    id: "price",
    title: "Price range",
    keywords: "credits cost budget",
    value: (f) => rangeText(f.priceMin, f.priceMax),
    body: (f, update) => (
      <MDBox>
        <RangeInputs
          idPrefix="price"
          unit="credits"
          min={f.priceMin}
          max={f.priceMax}
          onCommit={(priceMin, priceMax) => update({ priceMin, priceMax })}
          presets={[
            { label: "Up to 25", min: null, max: 25 },
            { label: "Up to 50", min: null, max: 50 },
            { label: "Up to 100", min: null, max: 100 },
            { label: "Up to 250", min: null, max: 250 },
            { label: "250+", min: 250, max: null },
          ]}
        />
        <Caption>Price of an option incl. GST. A website matches when at least one of its options is in range.</Caption>
      </MDBox>
    ),
  },
  { id: "traffic", title: "Traffic", disabled: true, value: () => "", body: noData("Monthly traffic") },
  { id: "dr", title: "Domain rating (DR)", disabled: true, keywords: "ahrefs", value: () => "", body: noData("Domain rating") },
  { id: "refdomains", title: "Referring domains", disabled: true, value: () => "", body: noData("Referring domains") },
  { id: "keywords", title: "Organic keywords", disabled: true, value: () => "", body: noData("Organic keywords") },
  {
    id: "da",
    title: "Domain authority (DA)",
    keywords: "moz",
    value: (f) => rangeText(f.daMin, f.daMax),
    body: (f, update) => (
      <MDBox>
        <RangeInputs
          idPrefix="da"
          unit="DA"
          min={f.daMin}
          max={f.daMax}
          onCommit={(daMin, daMax) => update({ daMin, daMax })}
          presets={[
            { label: "10+", min: 10, max: null },
            { label: "20+", min: 20, max: null },
            { label: "40+", min: 40, max: null },
            { label: "60+", min: 60, max: null },
          ]}
        />
        <Caption>Websites without a DA are left out when a DA bound is set.</Caption>
      </MDBox>
    ),
  },
  { id: "spam", title: "Spam score", disabled: true, value: () => "", body: noData("Spam score") },
  {
    id: "language",
    title: "Language",
    keywords: "include exclude english hindi",
    value: (f, o) => [f.langInclude.length ? countText(f.langInclude, o.languages) : "", f.langExclude.length ? `not ${countText(f.langExclude, o.languages)}` : ""].filter(Boolean).join(", "),
    body: (f, update, o) => (
      <MDBox>
        <SubLabel>Include</SubLabel>
        <ChipGroup
          options={o.languages}
          selected={f.langInclude}
          onToggle={(v) => update({ langInclude: toggle(f.langInclude, v), langExclude: f.langExclude.filter((x) => x !== v) })}
        />
        <SubLabel>Exclude</SubLabel>
        <ChipGroup
          tone="exclude"
          options={o.languages}
          selected={f.langExclude}
          onToggle={(v) => update({ langExclude: toggle(f.langExclude, v), langInclude: f.langInclude.filter((x) => x !== v) })}
        />
        <Caption>Include: the website has an option in that language. Exclude: hides any website that publishes in that language.</Caption>
      </MDBox>
    ),
  },
  { id: "country", title: "Country share", disabled: true, keywords: "traffic country", value: () => "", body: noData("Traffic share by country") },
  {
    id: "linkType",
    title: "Link type",
    keywords: "dofollow nofollow",
    value: (f) => (f.linkType ? labelOf(LINK_TYPES, f.linkType) : ""),
    body: (f, update) => (
      <ChipGroup options={LINK_TYPES} selected={f.linkType ? [f.linkType] : []} onToggle={(v) => update({ linkType: f.linkType === v ? "" : v })} />
    ),
  },
  {
    id: "category",
    title: "Category",
    keywords: "topic niche include exclude",
    value: (f) => [f.catInclude.length ? countText(f.catInclude, CATEGORY_OPTIONS) : "", f.catExclude.length ? `not ${countText(f.catExclude, CATEGORY_OPTIONS)}` : ""].filter(Boolean).join(", "),
    body: (f, update) => (
      <MDBox>
        <SubLabel>Include</SubLabel>
        <ChipGroup
          options={CATEGORY_OPTIONS}
          selected={f.catInclude}
          onToggle={(v) => update({ catInclude: toggle(f.catInclude, v), catExclude: f.catExclude.filter((x) => x !== v) })}
        />
        <SubLabel>Exclude</SubLabel>
        <ChipGroup
          tone="exclude"
          options={CATEGORY_OPTIONS}
          selected={f.catExclude}
          onToggle={(v) => update({ catExclude: toggle(f.catExclude, v), catInclude: f.catInclude.filter((x) => x !== v) })}
        />
        <Caption>Categories come from each website&apos;s topics. Websites without topics are matched by niche, section and name, so a few have none.</Caption>
      </MDBox>
    ),
  },
  {
    id: "section",
    title: "Section",
    keywords: "general casino crypto health review",
    value: (f) => countText(f.section, SECTIONS),
    body: (f, update) => <ChipGroup options={SECTIONS} selected={f.section} onToggle={(v) => update({ section: toggle(f.section, v) })} />,
  },
  {
    id: "tat",
    title: "Turnaround time (TAT)",
    keywords: "delivery speed hours days",
    value: (f) => (f.tatMax ? labelOf(TATS, f.tatMax) : ""),
    body: (f, update) => (
      <MDBox>
        <ChipGroup options={TATS} selected={f.tatMax ? [f.tatMax] : []} onToggle={(v) => update({ tatMax: f.tatMax === v ? "" : v })} />
        <Caption>Uses the slowest end of a range (3–5 days counts as 5 days). Options without a TAT never match.</Caption>
      </MDBox>
    ),
  },
  {
    id: "indexed",
    title: "Indexed",
    keywords: "google",
    value: (f) => countText(f.indexed, INDEXED),
    body: (f, update) => <ChipGroup options={INDEXED} selected={f.indexed} onToggle={(v) => update({ indexed: toggle(f.indexed, v) })} />,
  },
  {
    id: "backlink",
    title: "Backlink allowed",
    value: (f) => (f.backlink ? labelOf(BACKLINK, f.backlink) : ""),
    body: (f, update) => <ChipGroup options={BACKLINK} selected={f.backlink ? [f.backlink] : []} onToggle={(v) => update({ backlink: f.backlink === v ? "" : v })} />,
  },
  {
    id: "tier",
    title: "Tier",
    keywords: "standard organic corporate",
    value: (f, o) => countText(f.tier, o.tiers),
    body: (f, update, o) => <ChipGroup options={o.tiers} selected={f.tier} onToggle={(v) => update({ tier: toggle(f.tier, v) })} />,
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    keywords: "sponsored branded",
    value: (f) => (f.disclaimer ? labelOf(DISCLAIMER, f.disclaimer) : ""),
    body: (f, update) => (
      <MDBox>
        <ChipGroup options={DISCLAIMER} selected={f.disclaimer ? [f.disclaimer] : []} onToggle={(v) => update({ disclaimer: f.disclaimer === v ? "" : v })} />
        <Caption>With: Yes, Branded Category or Maybe. Without: No. Options with no disclaimer info never match.</Caption>
      </MDBox>
    ),
  },
];

export const defById = (id: string) => FILTER_DEFS.find((d) => d.id === id) as FilterDef;
