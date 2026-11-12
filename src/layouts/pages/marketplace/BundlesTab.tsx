import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Link from "@mui/material/Link";
import { getImageUrl } from "utils/apiConfig";
import { PackageTierOptions } from "constants/index";
import { bundleDetail, bundleName, creditsText } from "layouts/pages/releases/components/OrderSummary";
import { palette } from "assets/theme/tokens";

// Packages tab of the Marketplace: ready-made PR packages at one price.
// "Add" puts a package in the same media cart as single publications.

const MUTED = palette.textMuted;
const INK = palette.ink;
const GREEN = "#2E7D32";
const PREVIEW = 8;
const POPULAR = "#E65100";
// Popular (featured) packages first in their rank order, then cheapest first
const byPopular = (a: any, b: any) =>
  Number(!!b.featured) - Number(!!a.featured) ||
  (a.featuredRank ?? 999) - (b.featuredRank ?? 999) ||
  a.price - b.price;
export const TIER_COLOURS: Record<string, string> = {
  Starter: "#607D8B",
  Standard: "#1A73E8",
  Good: "#00897B",
  "Very Good": "#43A047",
  Premium: "#8E24AA",
  Elite: "#C77700",
};

// Named media of a package, or the publications of an old-style bundle
export const mediaOf = (b: any): { name: string; image?: string }[] =>
  b?.media?.length ? b.media : (b?.publicationInfo || []).map((p: any) => ({ name: p.title, image: p.image }));

// What the cart keeps for a package (OrderSummary / PR form read these fields)
export const toCartBundle = (b: any) => ({
  id: b.id,
  name: b.name,
  tier: b.tier,
  type: b.type,
  category: b.category,
  price: b.price,
  publicationIds: b.publicationIds,
  mediaCount: mediaOf(b).length,
  coverage: b.coverage,
});

function Logo({ m, size = 28 }: { m: { name: string; image?: string }; size?: number }): JSX.Element | null {
  const src = getImageUrl(m.image);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return (
    <MDBox
      component="img"
      src={src}
      alt={`${m.name} logo`}
      title={m.name}
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{ width: size, height: size, minWidth: size, borderRadius: "8px", objectFit: "contain", background: "#fff", border: "2px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.1)", boxSizing: "border-box" }}
    />
  );
}

export const PopularBadge = () => (
  <Chip size="small" label="★ Popular" data-testid="popular-badge" sx={{ background: POPULAR, color: "#fff", fontWeight: 700, height: 22 }} />
);

const TierChip = ({ tier }: { tier?: string }) =>
  tier ? (
    <Chip size="small" label={tier} sx={{ background: TIER_COLOURS[tier] || "#607D8B", color: "#fff", fontWeight: 600, height: 22 }} />
  ) : null;

// "Sample: View" (or "Samples: View 1 · View 2 · View 3"), like the publications table; nothing when there is none
export function SampleLinks({ urls, size = "13px" }: { urls?: string[]; size?: string }): JSX.Element | null {
  const list = (urls || []).filter(Boolean).slice(0, 3);
  if (!list.length) return null;
  return (
    <MDTypography component="div" fontSize={size} sx={{ color: MUTED }} data-testid="package-samples">
      {list.length === 1 ? "Sample: " : "Samples: "}
      {list.map((u, i) => (
        <span key={u + i}>
          {i > 0 && " · "}
          <Link href={u} target="_blank" rel="noopener noreferrer" fontSize={size} onClick={(e) => e.stopPropagation()} sx={{ color: "#1A73E8", fontWeight: 600 }}>
            {list.length === 1 ? "View" : `View ${i + 1}`}
          </Link>
        </span>
      ))}
    </MDTypography>
  );
}

const fact = (label: string, value?: string) =>
  value ? (
    <MDBox>
      <MDTypography fontSize="11px" sx={{ color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </MDTypography>
      <MDTypography fontSize="13px" sx={{ color: INK }}>
        {value}
      </MDTypography>
    </MDBox>
  ) : null;

interface Props {
  isPhone: boolean;
  all: any[];
  loading: boolean;
  error: boolean;
  refetch: () => void;
  bundles: any[];
  setBundles: (fn: (prev: any[]) => any[]) => void;
}

function BundlesTab({ isPhone, all, loading, error, refetch, bundles, setBundles }: Props): JSX.Element {
  const [tier, setTier] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<string>("popular");
  const [details, setDetails] = useState<any>(null);
  // Opened from the Dashboard ("View" on a package card): show that package straight away
  const [params] = useSearchParams();
  useEffect(() => {
    const id = params.get("package");
    if (id && all.length && !details) {
      const b = all.find((x) => x.id === id);
      if (b) setDetails(b);
    }
  }, [all]);

  const tiers = PackageTierOptions.filter((t) => all.some((b) => b.tier === t));
  const hasPopular = all.some((b) => b.featured);
  const types = useMemo(() => [...new Set(all.map((b) => b.packageType).filter(Boolean))].sort(), [all]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = all.filter(
      (b) =>
        (tier === "ALL" || (tier === "POPULAR" ? b.featured : b.tier === tier)) &&
        (type === "ALL" || b.packageType === type) &&
        (!needle || `${bundleName(b)} ${mediaOf(b).map((m) => m.name).join(" ")}`.toLowerCase().includes(needle))
    );
    if (sort === "popular") return rows.sort(byPopular);
    return rows.sort((a, b) => (sort === "priceDesc" ? b.price - a.price : a.price - b.price));
  }, [all, tier, type, q, sort]);
  const addedIds = useMemo(() => new Set(bundles.map((b) => b?.id)), [bundles]);
  const toggle = (b: any) =>
    setBundles((prev) => (prev.some((x) => x?.id === b.id) ? prev.filter((x) => x?.id !== b.id) : [...prev, toCartBundle(b)]));

  if (loading && !all.length) {
    return (
      <Card sx={{ p: 3 }}>
        <MDTypography fontSize="15px" sx={{ color: MUTED }}>
          Loading packages…
        </MDTypography>
      </Card>
    );
  }
  if (error && !all.length) {
    return (
      <Card sx={{ p: 3 }}>
        <MDTypography fontSize="15px" sx={{ color: INK }}>
          Could not load packages. Check your connection and try again.
        </MDTypography>
        <MDButton color="primary" size="small" sx={{ mt: 1.5 }} onClick={() => refetch()}>
          Try again
        </MDButton>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ p: 2, mb: 2 }}>
        <MDBox display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Search package or media…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: isPhone ? "1 1 100%" : "1 1 260px", "& .MuiInputBase-root": { height: 40 } }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
            inputProps={{ "aria-label": "Search packages" }}
          />
          <TextField select size="small" label="Package type" value={type} onChange={(e) => setType(e.target.value)} SelectProps={{ MenuProps: { disableScrollLock: true } }} sx={{ minWidth: 220, flex: isPhone ? "1 1 100%" : "0 0 auto", "& .MuiInputBase-root": { height: 40 } }}>
            <MenuItem value="ALL">All types</MenuItem>
            {types.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} SelectProps={{ MenuProps: { disableScrollLock: true } }} sx={{ minWidth: 170, flex: isPhone ? "1 1 100%" : "0 0 auto", "& .MuiInputBase-root": { height: 40 } }}>
            <MenuItem value="popular">Most popular</MenuItem>
            <MenuItem value="priceAsc">Price: low to high</MenuItem>
            <MenuItem value="priceDesc">Price: high to low</MenuItem>
          </TextField>
        </MDBox>
        <MDBox display="flex" alignItems="center" gap={1} mt={1.5} flexWrap="wrap">
          {["ALL", ...(hasPopular ? ["POPULAR"] : []), ...tiers].map((t) => (
            <Chip
              key={t}
              label={t === "ALL" ? "All tiers" : t === "POPULAR" ? "★ Popular" : t}
              color={tier === t ? "primary" : "default"}
              variant={tier === t ? "filled" : "outlined"}
              onClick={() => setTier(t)}
            />
          ))}
          <MDTypography fontSize="14px" sx={{ color: MUTED, ml: 1 }} data-testid="package-count">
            {list.length} {list.length === 1 ? "package" : "packages"}
          </MDTypography>
        </MDBox>
      </Card>
      {!list.length && (
        <Card sx={{ p: 3 }}>
          <MDTypography fontSize="15px" sx={{ color: MUTED }}>
            {all.length ? "No packages match these filters." : "No packages are available right now."}
          </MDTypography>
        </Card>
      )}
      <MDBox display="grid" gridTemplateColumns={isPhone ? "1fr" : "repeat(auto-fill, minmax(330px, 1fr))"} gap={2}>
        {list.map((b: any) => {
          const on = addedIds.has(b.id);
          const media = mediaOf(b);
          const logos = media.filter((m) => m.image).slice(0, 7);
          return (
            <Card
              key={b.id}
              data-testid="bundle-card"
              data-popular={b.featured ? "true" : undefined}
              sx={{
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                border: on ? `2px solid ${GREEN}` : b.featured ? `2px solid ${POPULAR}` : "2px solid transparent",
                background: b.featured && !on ? "#FFF8F1" : undefined,
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <MDTypography fontSize="17px" fontWeight="bold" sx={{ color: INK, lineHeight: 1.3 }}>
                  {bundleName(b)}
                </MDTypography>
                <MDBox display="flex" gap={0.5} flexWrap="wrap" justifyContent="flex-end">
                  {b.featured && <PopularBadge />}
                  <TierChip tier={b.tier} />
                </MDBox>
              </MDBox>
              {b.packageType && (
                <MDTypography fontSize="13px" sx={{ color: MUTED, mt: 0.5 }}>
                  {b.packageType}
                </MDTypography>
              )}
              {logos.length > 0 && (
                <MDBox display="flex" mt={1.5} sx={{ "& > *:not(:first-of-type)": { ml: "-6px" } }}>
                  {logos.map((m) => (
                    <Logo key={m.name} m={m} />
                  ))}
                </MDBox>
              )}
              <MDTypography fontSize="13px" sx={{ color: INK, mt: 1.25, lineHeight: 1.45 }}>
                {media.slice(0, PREVIEW).map((m) => m.name).join(", ")}
                {media.length > PREVIEW && (
                  <MDTypography component="span" fontSize="13px" sx={{ color: MUTED }}>
                    {` + ${media.length - PREVIEW} more`}
                  </MDTypography>
                )}
              </MDTypography>
              <MDTypography fontSize="12px" sx={{ color: MUTED, mt: 0.75 }}>
                {bundleDetail(b)}
                {b.language ? ` · ${b.language}` : ""}
                {b.tat ? ` · TAT ${b.tat}` : ""}
              </MDTypography>
              <MDBox mt={0.5}>
                <SampleLinks urls={b.sampleUrls} />
              </MDBox>
              <MDBox flexGrow={1} />
              <MDTypography fontSize="20px" fontWeight="bold" color="primary" mt={2}>
                {creditsText(b.price)}
              </MDTypography>
              <MDTypography fontSize="11px" sx={{ color: MUTED }}>
                incl. GST
              </MDTypography>
              <MDBox display="flex" gap={1} mt={1.5}>
                <MDButton
                  color={on ? "success" : "primary"}
                  variant={on ? "outlined" : "contained"}
                  size="small"
                  fullWidth
                  onClick={() => toggle(b)}
                  aria-pressed={on}
                  aria-label={on ? `Remove ${bundleName(b)}` : `Add ${bundleName(b)}`}
                >
                  {on ? "Added ✓" : "Add"}
                </MDButton>
                <MDButton variant="outlined" color="primary" size="small" fullWidth onClick={() => setDetails(b)}>
                  Details
                </MDButton>
              </MDBox>
            </Card>
          );
        })}
      </MDBox>
      {details && (
        <PackageDetails bundle={details} isPhone={isPhone} added={addedIds.has(details.id)} onToggle={() => toggle(details)} onClose={() => setDetails(null)} />
      )}
    </>
  );
}

function PackageDetails({ bundle: b, isPhone, added, onToggle, onClose }: { bundle: any; isPhone: boolean; added: boolean; onToggle: () => void; onClose: () => void }): JSX.Element {
  const media = mediaOf(b);
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth fullScreen={isPhone}>
      <MDBox p={3} data-testid="bundle-details">
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <MDBox>
            <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <MDTypography variant="h5" sx={{ color: INK }}>
                {bundleName(b)}
              </MDTypography>
              {b.featured && <PopularBadge />}
              <TierChip tier={b.tier} />
            </MDBox>
            {b.packageType && (
              <MDTypography fontSize="14px" sx={{ color: MUTED }}>
                {b.packageType}
              </MDTypography>
            )}
          </MDBox>
          <IconButton aria-label="Close package details" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        {b.description && (
          <MDTypography fontSize="14px" sx={{ color: INK, mt: 1.5 }}>
            {b.description}
          </MDTypography>
        )}
        <MDBox display="grid" gridTemplateColumns={isPhone ? "1fr 1fr" : "repeat(3, 1fr)"} gap={2} mt={2}>
          {fact("Named media", String(media.length))}
          {fact("Extra coverage", b.coverage)}
          {fact("Language", b.language)}
          {fact("Content", b.contentRule)}
          {fact("Backlinks", b.backlinks)}
          {fact("Disclaimer", b.disclaimer)}
          {fact("Turnaround", b.tat)}
          {b.sampleUrls?.length ? (
            <MDBox>
              <MDTypography fontSize="11px" sx={{ color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Sample reports
              </MDTypography>
              <SampleLinks urls={b.sampleUrls} />
            </MDBox>
          ) : null}
        </MDBox>
        <MDTypography variant="h6" sx={{ color: INK, mt: 3, mb: 1 }}>
          Media included
        </MDTypography>
        <MDBox display="flex" flexWrap="wrap" gap={1}>
          {media.map((m, i) => (
            <MDBox key={`${m.name}-${i}`} display="flex" alignItems="center" gap={0.75} px={1.25} py={0.5} sx={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: "16px" }}>
              <Logo m={m} size={20} />
              <MDTypography fontSize="13px" sx={{ color: INK }}>
                {m.name}
              </MDTypography>
            </MDBox>
          ))}
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={3} flexWrap="wrap">
          <MDBox>
            <MDTypography fontSize="18px" fontWeight="bold" color="primary">
              {creditsText(b.price)}
            </MDTypography>
            <MDTypography fontSize="12px" sx={{ color: MUTED }}>
              Package price, incl. 18% GST
            </MDTypography>
          </MDBox>
          <MDButton color={added ? "success" : "primary"} variant={added ? "outlined" : "contained"} onClick={onToggle} aria-pressed={added}>
            {added ? "Added ✓" : "Add package"}
          </MDButton>
        </MDBox>
      </MDBox>
    </Dialog>
  );
}

export default BundlesTab;
