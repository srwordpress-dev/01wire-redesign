import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { IMarketplaceListings, MARKETPLACE_LISTINGS } from "graphql/queries/marketplaceListings";
import { GET_BUNDLES, IGetBundles, IGetBundlesVars } from "graphql/queries/filterBundlesPaginated";
import { getImageUrl } from "utils/apiConfig";
import { getCart, saveCart } from "utils/mediaCart";
import { bundleDetail, bundleName, creditsText } from "layouts/pages/releases/components/OrderSummary";
import CreateEstimation from "layouts/pages/pr-estimation/components/CreateEstimateModal";
import BundlesTab from "./BundlesTab";
import FilterBar from "./filters/FilterBar";
import FilterDrawer from "./filters/FilterDrawer";
import {
  EMPTY_FILTERS,
  Filters,
  SORTS,
  Site,
  Variant,
  activeChips,
  filtersToParams,
  languageOptions,
  matchSite,
  parseFilters,
  prepareSites,
  tierOptions,
} from "./filters/model";
import { hostOf, toCartItem, toSites } from "./listings";
import { palette } from "assets/theme/tokens";

// Marketplace: every published offering, one row per website. Filters live in the URL
// (shareable /marketplace?… links, see filters/model.ts). Picked offerings go into the media
// cart (utils/mediaCart) and on to a PR through "Continue to Add PR", like before.
// A second tab (/marketplace?tab=bundles) lists PR packages; they go into the same cart.

const PER_PAGE = 25;
const MUTED = palette.textMuted;
const INK = palette.ink;
const GREEN = "#2E7D32";
const TILE_COLOURS = ["#F8303C", "#1A73E8", "#43A047", "#FB8C00", "#8E24AA", "#00897B", "#3949AB", "#6D4C41"];
const dash = (v: any) => (v === null || v === undefined || v === "" ? "-" : v);
const initials = (name: string) =>
  name
    .replace(/\.(com|in|co|net|org|news|live|io)(\..*)?$/i, "")
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
const tileColour = (id: string) =>
  TILE_COLOURS[[...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % TILE_COLOURS.length];
const siteHost = (s: Site) => s.domain || hostOf(s.url);

// Logo when we have one, coloured initials otherwise or if it fails to load.
function LogoTile({ site, size = 40 }: { site: Site; size?: number }): JSX.Element {
  const src = getImageUrl(site.image);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) {
    return (
      <MDBox
        component="img"
        src={src}
        alt={`${site.name} logo`}
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{ width: size, height: size, minWidth: size, borderRadius: "10px", objectFit: "contain", background: "#fff", border: "1px solid rgba(0,0,0,0.1)", p: "3px", boxSizing: "border-box" }}
      />
    );
  }
  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      data-testid="logo-initials"
      sx={{ width: size, height: size, minWidth: size, borderRadius: "10px", background: tileColour(site.id), color: "#fff", fontWeight: 700, fontSize: size * 0.36 }}
    >
      {initials(site.name) || "?"}
    </MDBox>
  );
}

// Small columns shrink to fit; actions take what the two buttons need (fits from 1200px up)
const COLUMNS = "minmax(170px, 2.2fr) repeat(6, minmax(60px, 1fr)) minmax(104px, 1.2fr) max-content";

function Marketplace(): JSX.Element {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("xl"));
  const navigate = useNavigate();
  const location = useLocation();
  // Opened from a PR's "Change media": the main button leads back to that PR
  const forPr = location?.state?.forPr;
  const [searchParams, setSearchParams] = useSearchParams();
  // Filter changes keep the navigation state (forPr) so the way back to the PR survives
  const setParams = useCallback(
    (sp: URLSearchParams, o?: { replace?: boolean }) => setSearchParams(sp, { replace: !!o?.replace, state: location.state }),
    [setSearchParams, location.state]
  );

  const { data, loading, error, refetch } = useQuery<IMarketplaceListings>(MARKETPLACE_LISTINGS, { fetchPolicy: "cache-and-network" });
  const sites = useMemo(() => toSites(data?.marketplaceListings || []), [data]);
  const prepared = useMemo(() => prepareSites(sites), [sites]);
  const filterOpts = useMemo(() => ({ languages: languageOptions(sites), tiers: tierOptions(sites) }), [sites]);

  const qs = searchParams.toString();
  const filters = useMemo(() => parseFilters(new URLSearchParams(qs), filterOpts.languages, filterOpts.tiers), [qs, filterOpts]);
  const rawSort = searchParams.get("sort") || "";
  const sort = SORTS.some((o) => o.value === rawSort) ? rawSort : "name";
  const pageParam = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const tab = searchParams.get("tab") === "bundles" ? "bundles" : "publications";
  // Switching tabs drops the publication filters (they only apply to that tab)
  const setTab = (t: string) => setParams(new URLSearchParams(t === "bundles" ? { tab: "bundles" } : {}));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [details, setDetails] = useState<Site | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [estimate, setEstimate] = useState<any>(false);

  // ---- selection (the media cart) ----
  const [initialCart] = useState(() => getCart());
  const [bundles, setBundles] = useState<any[]>(initialCart?.bundles || []);
  const [picked, setPicked] = useState<any[]>(initialCart?.publications || []);
  useEffect(() => saveCart(bundles, picked), [bundles, picked]);

  // Packages: loaded here so a cart entry for a package that is gone (deleted or
  // hidden) is dropped before it can reach a PR
  const pkgQuery = useQuery<IGetBundles, IGetBundlesVars>(GET_BUNDLES, {
    variables: { paginationInput: { currentPage: 0, perPage: 200 } },
    fetchPolicy: "cache-and-network",
  });
  const packages = useMemo(
    () => (pkgQuery.data?.filterBundlesPaginated?.data || []).filter((b: any) => b?.visibility === "PUBLISHED"),
    [pkgQuery.data]
  );
  useEffect(() => {
    if (!pkgQuery.data || pkgQuery.loading) return;
    const live = new Set(packages.map((b: any) => b.id));
    setBundles((prev) => (prev.some((b) => !live.has(b?.id)) ? prev.filter((b) => live.has(b?.id)) : prev));
  }, [pkgQuery.data, pkgQuery.loading, packages]);
  const pickedIds = useMemo(() => new Set(picked.map((p) => p?.id)), [picked]);
  const toggle = (site: Site, v: Variant) =>
    setPicked((prev) => (prev.some((p) => p?.id === v.id) ? prev.filter((p) => p?.id !== v.id) : [...prev, toCartItem(site, v)]));
  const count = bundles.length + picked.length;
  const total = [...bundles, ...picked].reduce((acc, one) => acc + (Number(one?.price ?? one?.credits) || 0), 0);

  // Any filter change goes to the URL and resets to page 1.
  const update = useCallback(
    (patch: Partial<Filters>, o?: { replace?: boolean }) => setParams(filtersToParams({ ...filters, ...patch }, sort, 1), o),
    [filters, sort, setParams]
  );
  const clearAll = () => setParams(filtersToParams(EMPTY_FILTERS, sort, 1));
  const setSort = (s: string) => setParams(filtersToParams(filters, s, 1));

  const list = useMemo(() => {
    const rows: { site: Site; best: Variant }[] = [];
    prepared.forEach((p) => {
      const best = matchSite(p, filters);
      if (best) rows.push({ site: p.site, best });
    });
    const byName = (a: { site: Site }, b: { site: Site }) => a.site.name.localeCompare(b.site.name);
    if (sort === "name") rows.sort(byName);
    if (sort === "priceAsc") rows.sort((a, b) => a.best.price - b.best.price || byName(a, b));
    if (sort === "priceDesc") rows.sort((a, b) => b.best.price - a.best.price || byName(a, b));
    if (sort === "da") rows.sort((a, b) => (b.site.da ?? -1) - (a.site.da ?? -1) || byName(a, b));
    return rows;
  }, [prepared, filters, sort]);
  const chips = useMemo(() => activeChips(filters, filterOpts.languages, filterOpts.tiers), [filters, filterOpts]);
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pageParam, pageCount);
  const pageRows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const setPage = (p: number) => {
    setParams(filtersToParams(filters, sort, p));
    window.scrollTo({ top: 0 });
  };

  const goOn = () => {
    if (forPr?.id) {
      navigate(`/releases/${forPr.id}`, { state: { step: 2, useCart: true } });
      return;
    }
    navigate("/releases", { state: { estimation: { selectedBundles: bundles, selectedPublications: picked } } });
  };

  const sortControl = (
    <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} SelectProps={{ MenuProps: { disableScrollLock: true } }} sx={{ minWidth: 180, "& .MuiInputBase-root": { height: 40 } }}>
      {SORTS.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );

  const metric = (label: string, value: any) => (
    <MDBox>
      <MDTypography fontSize="11px" sx={{ color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </MDTypography>
      <MDTypography fontSize="14px" fontWeight="medium" sx={{ color: INK }}>
        {value}
      </MDTypography>
    </MDBox>
  );
  const sampleLink = (url: string) =>
    url ? (
      <Link href={url} target="_blank" rel="noopener noreferrer" fontSize="14px">
        View
      </Link>
    ) : (
      "-"
    );
  const publicationCell = (s: Site) => (
    <MDBox display="flex" gap={1.5} alignItems="center" minWidth={0}>
      <LogoTile site={s} />
      <MDBox minWidth={0}>
        <MDTypography fontSize="15px" fontWeight="bold" sx={{ color: INK, lineHeight: 1.3, wordBreak: "break-word" }}>
          {s.name}
        </MDTypography>
        {s.url && (
          <Link href={s.url} target="_blank" rel="noopener noreferrer" fontSize="12px" sx={{ color: MUTED }}>
            {siteHost(s) || s.url}
          </Link>
        )}
        {s.description && (
          <MDTypography
            fontSize="12px"
            sx={{ color: INK, mt: 0.25, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {s.description}
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  );
  // price = cheapest option that matches the current filters
  const priceCell = (s: Site, best: Variant) => (
    <MDBox>
      <MDTypography fontSize="15px" fontWeight="bold" color="primary">
        {s.variants.length > 1 ? "from " : ""}
        {creditsText(best.price)}
      </MDTypography>
      <MDTypography fontSize="11px" sx={{ color: MUTED }}>
        incl. GST{s.variants.length > 1 ? ` · ${s.variants.length} options` : ""}
      </MDTypography>
    </MDBox>
  );
  // "Add" picks the cheapest matching option. Once a site has something picked, a one-option
  // site toggles it off; a several-option site opens Details to change or add options.
  const actions = (s: Site, best: Variant, full = false) => {
    const n = s.variants.filter((v) => pickedIds.has(v.id)).length;
    const onAdd = () => {
      if (!n) toggle(s, best);
      else if (s.variants.length === 1) toggle(s, s.variants[0]);
      else setDetails(s);
    };
    return (
      <MDBox display="flex" gap={1} width={full ? "100%" : "auto"}>
        <MDButton
          color={n ? "success" : "primary"}
          variant={n ? "outlined" : "contained"}
          size="small"
          fullWidth={full}
          onClick={onAdd}
          aria-label={n ? `${s.name}: added, ${s.variants.length > 1 ? "change options" : "remove"}` : `Add ${s.name}`}
          sx={{ whiteSpace: "nowrap", minWidth: 76 }}
        >
          {n ? `Added ✓${n > 1 ? ` ${n}` : ""}` : "Add"}
        </MDButton>
        <MDButton variant="outlined" color="primary" size="small" fullWidth={full} onClick={() => setDetails(s)}>
          Details
        </MDButton>
      </MDBox>
    );
  };

  const body = () => {
    if (loading && !data) {
      return (
        <Card sx={{ p: 3 }}>
          <MDTypography fontSize="15px" sx={{ color: MUTED }} data-testid="marketplace-loading">
            Loading websites…
          </MDTypography>
        </Card>
      );
    }
    if (error && !data) {
      return (
        <Card sx={{ p: 3 }}>
          <MDTypography fontSize="15px" sx={{ color: INK }} data-testid="marketplace-error">
            Could not load the Marketplace. Check your connection and try again.
          </MDTypography>
          <MDButton color="primary" size="small" sx={{ mt: 1.5 }} onClick={() => refetch()}>
            Try again
          </MDButton>
        </Card>
      );
    }
    return (
      <>
        <FilterBar
          filters={filters}
          update={update}
          opts={filterOpts}
          chips={chips}
          resultCount={list.length}
          isPhone={isPhone}
          onOpenDrawer={() => setDrawerOpen(true)}
          onClearAll={clearAll}
          currentQuery={filtersToParams(filters, sort, 1).toString()}
          onApplyQuery={(query) => setParams(new URLSearchParams(query))}
          sortControl={sortControl}
        />
        <Card sx={{ overflow: "hidden" }}>
          {!isPhone && (
            <MDBox display="grid" gridTemplateColumns={COLUMNS} gap={1.5} px={2} py={1.25} sx={{ background: "#F8F9FA", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              {["Publication", "Sample", "TAT", "DA / DR", "Link", "Indexed", "Backlink allowed", "Price", ""].map((h) => (
                <MDTypography key={h} fontSize="12px" fontWeight="medium" sx={{ color: MUTED, textTransform: "uppercase" }}>
                  {h}
                </MDTypography>
              ))}
            </MDBox>
          )}
          {!list.length && (
            <MDTypography p={3} fontSize="15px" sx={{ color: MUTED }}>
              {sites.length ? "No websites match these filters." : "No websites are listed yet."}
            </MDTypography>
          )}
          {pageRows.map(({ site: s, best }) =>
            isPhone ? (
              <MDBox key={s.id} p={2} data-testid="site-row" sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <MDBox display="flex" justifyContent="space-between" gap={1} alignItems="flex-start">
                  {publicationCell(s)}
                  {priceCell(s, best)}
                </MDBox>
                <MDBox display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1.5} mt={1.5}>
                  {metric("Sample", sampleLink(s.sample))}
                  {metric("TAT", dash(s.tat))}
                  {metric("DA / DR", `${dash(s.da)} / ${dash(s.dr)}`)}
                  {metric("Link", dash(s.linkType))}
                  {metric("Indexed", dash(s.indexed))}
                  {metric("Backlink", dash(s.backlinkAllowed))}
                </MDBox>
                <MDBox mt={1.5}>{actions(s, best, true)}</MDBox>
              </MDBox>
            ) : (
              <MDBox
                key={s.id}
                data-testid="site-row"
                display="grid"
                gridTemplateColumns={COLUMNS}
                gap={1.5}
                px={2}
                py={1.5}
                alignItems="center"
                sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)", "&:hover": { background: "#FAFAFC" } }}
              >
                {publicationCell(s)}
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {sampleLink(s.sample)}
                </MDTypography>
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {dash(s.tat)}
                </MDTypography>
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {dash(s.da)} / {dash(s.dr)}
                </MDTypography>
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {dash(s.linkType)}
                </MDTypography>
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {dash(s.indexed)}
                </MDTypography>
                <MDTypography fontSize="14px" sx={{ color: INK }}>
                  {dash(s.backlinkAllowed)}
                </MDTypography>
                {priceCell(s, best)}
                {actions(s, best)}
              </MDBox>
            )
          )}
        </Card>
        {list.length > PER_PAGE && (
          <MDBox display="flex" justifyContent="center" mt={2}>
            <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" siblingCount={isPhone ? 0 : 1} />
          </MDBox>
        )}
      </>
    );
  };

  return (
    <MDBox>
      <DashboardNavbar text="Marketplace" />
      <MDBox px={2} pt={3} pb={4}>
        <Tabs
          value={tab}
          onChange={(_, t) => setTab(t)}
          aria-label="Marketplace sections"
          sx={{ mb: 2, maxWidth: 420, background: "#fff", borderRadius: "10px", p: 0.5, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        >
          <Tab value="publications" label={`Publications${data ? ` · ${sites.length}` : ""}`} data-testid="tab-publications" />
          <Tab value="bundles" label={`Packages${pkgQuery.data ? ` · ${packages.length}` : ""}`} data-testid="tab-bundles" />
        </Tabs>
        {tab === "bundles" ? (
          <BundlesTab
            isPhone={isPhone}
            all={packages}
            loading={pkgQuery.loading}
            error={!!pkgQuery.error}
            refetch={() => pkgQuery.refetch()}
            bundles={bundles}
            setBundles={setBundles}
          />
        ) : (
          body()
        )}
      </MDBox>

      {/* selection bar */}
      <MDBox
        data-testid="selection-bar"
        display="flex"
        flexDirection={isPhone ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isPhone ? "stretch" : "center"}
        gap={isPhone ? 1.5 : 2}
        bgColor="white"
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 2,
          px: isPhone ? 2 : 3,
          py: isPhone ? 1.5 : 2,
          boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        }}
      >
        <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <MDTypography fontWeight="bold" fontSize={isPhone ? "16px" : "18px"} sx={{ color: INK }} data-testid="selection-summary">
            {count} selected · <MDTypography component="span" fontWeight="bold" fontSize="inherit" color="primary">Total {creditsText(total)}</MDTypography>
          </MDTypography>
          {count > 0 && (
            <MDButton variant="text" color="primary" size="small" onClick={() => setCartOpen(true)} sx={{ textTransform: "none", px: 0.5 }}>
              View selection
            </MDButton>
          )}
        </MDBox>
        <MDBox display="flex" gap={1.5}>
          <MDButton
            variant="outlined"
            color="primary"
            fullWidth={isPhone}
            disabled={!count}
            onClick={() => setEstimate({ bundleIds: bundles.map((b) => b?.id), publicationIds: picked.map((p) => p?.id) })}
          >
            Save Estimate
          </MDButton>
          <MDButton color="primary" fullWidth={isPhone} disabled={!count} onClick={goOn}>
            {forPr?.id ? `Back to PR${forPr.prId ? ` #${forPr.prId}` : ""}` : "Continue to Add PR"}
          </MDButton>
        </MDBox>
      </MDBox>

      {data && tab === "publications" && (
        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          update={update}
          opts={filterOpts}
          activeCount={chips.length}
          resultCount={list.length}
          onClearAll={clearAll}
        />
      )}
      {details && <DetailsDialog site={details} isPhone={isPhone} pickedIds={pickedIds} onToggle={(v) => toggle(details, v)} onClose={() => setDetails(null)} />}
      {cartOpen && (
        <SelectionDialog
          isPhone={isPhone}
          bundles={bundles}
          publications={picked}
          total={total}
          onRemoveBundle={(id) => setBundles((prev) => prev.filter((b) => b?.id !== id))}
          onRemove={(id) => setPicked((prev) => prev.filter((p) => p?.id !== id))}
          onClose={() => setCartOpen(false)}
        />
      )}
      {estimate && <CreateEstimation values={estimate} onClose={() => setEstimate(false)} />}
    </MDBox>
  );
}

function DetailsDialog({ site, isPhone, pickedIds, onToggle, onClose }: { site: Site; isPhone: boolean; pickedIds: Set<string>; onToggle: (v: Variant) => void; onClose: () => void }): JSX.Element {
  const cell = (label: string, value: any) => (
    <MDBox>
      <MDTypography fontSize="11px" sx={{ color: MUTED, textTransform: "uppercase" }}>
        {label}
      </MDTypography>
      <MDTypography fontSize="14px" sx={{ color: INK, wordBreak: "break-word" }}>
        {value}
      </MDTypography>
    </MDBox>
  );
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth fullScreen={isPhone}>
      <MDBox p={3} data-testid="details-dialog">
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <MDBox display="flex" gap={2} alignItems="center">
            <LogoTile site={site} size={52} />
            <MDBox>
              <MDTypography variant="h5" sx={{ color: INK }}>
                {site.name}
              </MDTypography>
              {site.url && (
                <Link href={site.url} target="_blank" rel="noopener noreferrer" fontSize="14px">
                  {siteHost(site) || site.url}
                </Link>
              )}
            </MDBox>
          </MDBox>
          <IconButton aria-label="Close details" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        {site.description && (
          <MDTypography fontSize="15px" sx={{ color: INK, mt: 2 }}>
            {site.description}
          </MDTypography>
        )}
        <MDBox display="grid" gridTemplateColumns={isPhone ? "1fr 1fr" : "repeat(4, 1fr)"} gap={2} mt={2.5}>
          {cell("DA / DR", `${dash(site.da)} / ${dash(site.dr)}`)}
          {cell("Languages", dash(site.languages.join(", ")))}
          {cell("Sections", dash(site.sections.join(", ")))}
          {cell("Options", site.variants.length)}
        </MDBox>
        <MDTypography variant="h6" sx={{ color: INK, mt: 3, mb: 1 }}>
          Options
        </MDTypography>
        {site.variants.map((v) => {
          const on = pickedIds.has(v.id);
          return (
            <MDBox key={v.id} p={2} mb={1.5} data-testid="offering" sx={{ border: `1px solid ${on ? GREEN : "rgba(0,0,0,0.12)"}`, borderRadius: "8px", background: on ? "#F1F8F2" : "transparent" }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                <MDTypography fontSize="15px" fontWeight="bold" sx={{ color: INK }}>
                  {v.label}
                </MDTypography>
                <MDBox display="flex" alignItems="center" gap={1.5}>
                  <MDTypography fontSize="15px" fontWeight="bold" color="primary">
                    {creditsText(v.price)}
                  </MDTypography>
                  <MDButton
                    color={on ? "success" : "primary"}
                    variant={on ? "outlined" : "contained"}
                    size="small"
                    onClick={() => onToggle(v)}
                    aria-pressed={on}
                    aria-label={on ? `Remove ${v.label}` : `Add ${v.label}`}
                    sx={{ minWidth: 92 }}
                  >
                    {on ? "Added ✓" : "Add"}
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox display="grid" gridTemplateColumns={isPhone ? "1fr 1fr" : "repeat(5, 1fr)"} gap={1.5} mt={1.5}>
                {cell("Language", dash(v.language))}
                {cell("Link", dash(v.linkType))}
                {cell("Backlinks", dash(v.backlinks))}
                {cell("Backlink allowed", dash(v.backlinkAllowed))}
                {cell("Indexed", dash(v.indexed))}
                {cell("TAT", dash(v.tat))}
                {cell("Words allowed", dash(v.wordsAllowed))}
                {cell("Section", dash(v.section))}
                {cell("Tier", dash(v.tier))}
                {cell("Validity", dash(v.validity))}
                {cell("Disclaimer", dash(v.disclaimer))}
                {cell(
                  "Sample",
                  v.sample ? (
                    <Link href={v.sample} target="_blank" rel="noopener noreferrer" fontSize="14px">
                      View sample
                    </Link>
                  ) : (
                    "-"
                  )
                )}
              </MDBox>
              {v.niche && (
                <MDTypography fontSize="13px" sx={{ color: MUTED, mt: 1 }}>
                  Niche: {v.niche}
                </MDTypography>
              )}
            </MDBox>
          );
        })}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
          <MDTypography fontSize="12px" sx={{ color: MUTED }}>
            Prices include 18% GST.
          </MDTypography>
          <MDButton color="primary" size="small" onClick={onClose}>
            Done
          </MDButton>
        </MDBox>
      </MDBox>
    </Dialog>
  );
}

function SelectionDialog({
  isPhone,
  bundles,
  publications,
  total,
  onRemoveBundle,
  onRemove,
  onClose,
}: {
  isPhone: boolean;
  bundles: any[];
  publications: any[];
  total: number;
  onRemoveBundle: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}): JSX.Element {
  const lines = [
    ...bundles.map((b) => ({ key: `b-${b?.id}`, name: bundleName(b), detail: bundleDetail(b), price: Number(b?.price) || 0, remove: () => onRemoveBundle(b?.id) })),
    ...publications.map((p) => ({ key: `p-${p?.id}`, name: p?.title, detail: p?.domain || p?.url, price: Number(p?.price ?? p?.credits) || 0, remove: () => onRemove(p?.id) })),
  ];
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth fullScreen={isPhone}>
      <MDBox p={3} data-testid="selection-dialog">
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" sx={{ color: INK }}>
            Your selection
          </MDTypography>
          <IconButton aria-label="Close selection" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
        {!lines.length && (
          <MDTypography fontSize="15px" sx={{ color: MUTED, mt: 2 }}>
            Nothing selected.
          </MDTypography>
        )}
        {lines.map((l) => (
          <MDBox key={l.key} display="flex" alignItems="center" justifyContent="space-between" gap={1} py={1.25} sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <MDBox minWidth={0}>
              <MDTypography fontSize="15px" fontWeight="medium" sx={{ color: INK, wordBreak: "break-word" }}>
                {l.name}
              </MDTypography>
              {l.detail && (
                <MDTypography fontSize="12px" sx={{ color: MUTED, wordBreak: "break-all" }}>
                  {l.detail}
                </MDTypography>
              )}
            </MDBox>
            <MDBox display="flex" alignItems="center" gap={1} flexShrink={0}>
              <MDTypography fontSize="15px" fontWeight="bold" color="primary">
                {creditsText(l.price)}
              </MDTypography>
              <IconButton size="small" aria-label={`Remove ${l.name}`} onClick={l.remove}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </MDBox>
          </MDBox>
        ))}
        <MDBox display="flex" justifyContent="space-between" mt={2}>
          <MDTypography fontSize="16px" fontWeight="bold" sx={{ color: INK }}>
            Total
          </MDTypography>
          <MDTypography fontSize="16px" fontWeight="bold" color="primary">
            {creditsText(total)}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Dialog>
  );
}

export default Marketplace;
