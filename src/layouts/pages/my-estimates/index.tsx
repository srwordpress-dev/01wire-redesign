import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDCircularLoader from "components/MDCircularLoader";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { DELETE_ESTIMATE, IDeleteEstimateVars } from "graphql/mutations/deleteEstimate";
import { IMarketplaceListings, MARKETPLACE_LISTINGS } from "graphql/queries/marketplaceListings";
import { GET_BUNDLES, IGetBundles, IGetBundlesVars } from "graphql/queries/filterBundlesPaginated";
import { toSites, toCartItem } from "layouts/pages/marketplace/listings";
import { mediaOf, toCartBundle } from "layouts/pages/marketplace/BundlesTab";
import { saveCart } from "utils/mediaCart";
import { getImageUrl } from "utils/apiConfig";
import { palette } from "assets/theme/tokens";

// Only what this page shows; prices and availability come from today's Marketplace
const MY_ESTIMATES = gql`
  query myEstimates($paginationInput: PaginationInput!, $filterInput: EstimateFilterInput!) {
    filterEstimatesPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        title
        publicationIds
        bundleIds
        totalCredits
        createdAt
        publicationInfo { id title image domain variantLabel price }
        bundleInfo { id name price media { name image } }
      }
    }
  }
`;

const INK = palette.ink;
const MUTED = palette.textMuted;
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priceDesc", label: "Highest price" },
  { value: "priceAsc", label: "Lowest price" },
];

type Item = { id: string; kind: "pub" | "pkg"; name: string; image?: string; price: number | null; available: boolean; cart?: any };

// A small logo tile; hidden if the image does not load
function Logo({ src, name }: { src?: string; name: string }): JSX.Element | null {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  if (!url || failed) return null;
  return (
    <MDBox
      component="img"
      src={url}
      alt={`${name} logo`}
      title={name}
      onError={() => setFailed(true)}
      sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", p: 0.5, flexShrink: 0 }}
    />
  );
}

function MyEstimates(): JSX.Element {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, loading, refetch } = useQuery(MY_ESTIMATES, {
    variables: { paginationInput: { currentPage: 0, perPage: 100 }, filterInput: {} },
    fetchPolicy: "network-only",
  });
  const listings = useQuery<IMarketplaceListings>(MARKETPLACE_LISTINGS, { fetchPolicy: "cache-and-network" });
  const pkgs = useQuery<IGetBundles, IGetBundlesVars>(GET_BUNDLES, {
    variables: { paginationInput: { currentPage: 0, perPage: 200 } },
    fetchPolicy: "cache-and-network",
  });
  const [deleteEstimate, { loading: deleting }] = useMutation<boolean, IDeleteEstimateVars>(DELETE_ESTIMATE);

  // Today's Marketplace: what can still be bought, at what price, in the cart's own format
  const pubNow = useMemo(() => {
    const m = new Map<string, any>();
    toSites(listings.data?.marketplaceListings || []).forEach((site) =>
      site.variants.forEach((v) => m.set(v.id, toCartItem(site, v)))
    );
    return m;
  }, [listings.data]);
  const pkgNow = useMemo(() => {
    const m = new Map<string, any>();
    (pkgs.data?.filterBundlesPaginated?.data || []).filter((b: any) => b?.visibility === "PUBLISHED").forEach((b: any) => m.set(b.id, b));
    return m;
  }, [pkgs.data]);
  const catalogReady = !!listings.data && !!pkgs.data;

  const estimates = useMemo(() => {
    const rows = (data?.filterEstimatesPaginated?.data || []).map((e: any) => {
      const items: Item[] = [
        ...(e.publicationIds || []).map((id: string) => {
          const info = (e.publicationInfo || []).find((p: any) => p?.id === id);
          const now = pubNow.get(id);
          return {
            id,
            kind: "pub" as const,
            name: now?.title || (info ? (info.variantLabel ? `${info.title} · ${info.variantLabel}` : info.title) : "Removed site"),
            image: now?.image || info?.image,
            price: now ? now.price : null,
            available: !!now,
            cart: now,
          };
        }),
        ...(e.bundleIds || []).map((id: string) => {
          const info = (e.bundleInfo || []).find((b: any) => b?.id === id);
          const now = pkgNow.get(id);
          const logo = mediaOf(now || info || {}).find((m) => m.image)?.image;
          return { id, kind: "pkg" as const, name: now?.name || info?.name || "Removed package", image: logo, price: now ? now.price : null, available: !!now, cart: now ? toCartBundle(now) : null };
        }),
      ];
      const ok = items.filter((i) => i.available);
      const today = ok.reduce((s, i) => s + (i.price || 0), 0);
      return { ...e, items, ok, today };
    });
    const needle = q.trim().toLowerCase();
    const shown = rows.filter((e: any) => !needle || `${e.title} ${e.items.map((i: Item) => i.name).join(" ")}`.toLowerCase().includes(needle));
    const t = (e: any) => new Date(e.createdAt).getTime();
    return shown.sort((a: any, b: any) =>
      sort === "oldest" ? t(a) - t(b) : sort === "priceDesc" ? b.today - a.today : sort === "priceAsc" ? a.today - b.today : t(b) - t(a)
    );
  }, [data, pubNow, pkgNow, q, sort]);

  const createPr = (e: any) => {
    if (!e.ok.length) return toast.error("None of these sites or packages can be bought any more");
    navigate("/releases", {
      state: {
        estimation: {
          selectedBundles: e.ok.filter((i: Item) => i.kind === "pkg").map((i: Item) => i.cart),
          selectedPublications: e.ok.filter((i: Item) => i.kind === "pub").map((i: Item) => i.cart),
        },
      },
    });
  };
  const editInMarketplace = (e: any) => {
    if (!e.ok.length) return toast.error("None of these sites or packages can be bought any more");
    saveCart(
      e.ok.filter((i: Item) => i.kind === "pkg").map((i: Item) => i.cart),
      e.ok.filter((i: Item) => i.kind === "pub").map((i: Item) => i.cart)
    );
    navigate(e.ok.some((i: Item) => i.kind === "pub") ? "/marketplace" : "/marketplace?tab=bundles");
  };
  const copyLink = (e: any) => {
    const link = `${window.location.origin}/share-estimation/${e.id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Share link copied", { toastId: "copied" }))
      .catch(() => toast.info(link));
  };
  const remove = () => {
    if (!toDelete) return;
    deleteEstimate({ variables: { id: toDelete.id } })
      .then(() => {
        toast.success(`"${toDelete.title}" deleted`);
        setToDelete(null);
        refetch();
      })
      .catch((err) => toast.error(err?.message || "Could not delete"));
  };

  const all = data?.filterEstimatesPaginated?.data || [];
  return (
    <MDBox>
      <DashboardNavbar text="My Estimates" />
      <MDBox px={2} py={3}>
        <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={2}>
          <TextField
            size="small"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search estimates or sites…"
            inputProps={{ "aria-label": "Search estimates" }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ flex: "1 1 260px", background: "#fff", borderRadius: "8px" }}
          />
          <TextField select size="small" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 170, background: "#fff", borderRadius: "8px", "& .MuiInputBase-root": { height: 40 } }}>
            {SORTS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
          <MDButton variant="gradient" color="primary" size="small" onClick={() => navigate("/marketplace")}>+ New estimate</MDButton>
        </MDBox>

        {loading && !data ? (
          <Card sx={{ minHeight: 200 }}><MDCircularLoader startLoader overlayloader /></Card>
        ) : !all.length ? (
          <Card sx={{ p: { xs: 3, md: 6 }, textAlign: "center" }} data-testid="estimates-empty">
            <MDTypography variant="h5" sx={{ color: INK }}>No estimates yet</MDTypography>
            <MDTypography fontSize="15px" sx={{ color: MUTED, mt: 1, mb: 3, maxWidth: 520, mx: "auto" }}>
              Pick sites and packages in the Marketplace and click <b>Save Estimate</b> to compare prices, share them, or turn them into a PR later.
            </MDTypography>
            <MDButton variant="gradient" color="primary" onClick={() => navigate("/marketplace")}>Go to Marketplace</MDButton>
          </Card>
        ) : !estimates.length ? (
          <Card sx={{ p: 4, textAlign: "center" }}><MDTypography fontSize="15px" sx={{ color: MUTED }}>No estimates match "{q}".</MDTypography></Card>
        ) : (
          <MDBox display="flex" flexDirection="column" gap={2}>
            {estimates.map((e: any) => {
              const logos = e.items.filter((i: Item) => i.image).slice(0, 6);
              const pubsN = e.items.filter((i: Item) => i.kind === "pub").length;
              const pkgN = e.items.filter((i: Item) => i.kind === "pkg").length;
              const gone = e.items.length - e.ok.length;
              const changed = catalogReady && e.totalCredits != null && e.today !== e.totalCredits;
              return (
                <Card key={e.id} sx={{ p: 2.5 }} data-testid="estimate-card">
                  <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                    <MDBox
                      component="a"
                      onClick={() => navigate(`/share-estimation/${e.id}`)}
                      sx={{ cursor: "pointer", minWidth: 0 }}
                      title="Open the shared view"
                    >
                      <MDTypography fontSize="18px" fontWeight="bold" sx={{ color: INK, wordBreak: "break-word" }}>{e.title}</MDTypography>
                    </MDBox>
                    <MDTypography fontSize="13px" sx={{ color: MUTED, whiteSpace: "nowrap" }}>Saved {dayjs(e.createdAt).format("DD MMM YYYY")}</MDTypography>
                  </MDBox>

                  {logos.length > 0 && (
                    <MDBox display="flex" alignItems="center" gap={0.75} mt={1.5} flexWrap="wrap" data-testid="estimate-logos">
                      {logos.map((i: Item) => <Logo key={i.kind + i.id} src={i.image} name={i.name} />)}
                      {e.items.length > logos.length && (
                        <MDTypography fontSize="13px" sx={{ color: MUTED, ml: 0.5 }}>+{e.items.length - logos.length} more</MDTypography>
                      )}
                    </MDBox>
                  )}
                  <MDTypography fontSize="14px" sx={{ color: INK, mt: 1 }}>
                    {e.items.slice(0, 5).map((i: Item) => (catalogReady && !i.available ? `${i.name} (no longer available)` : i.name)).join(", ")}
                    {e.items.length > 5 && ` and ${e.items.length - 5} more`}
                  </MDTypography>

                  <MDBox display="flex" alignItems="baseline" gap={1.5} flexWrap="wrap" mt={1.5}>
                    <MDTypography fontSize="13px" sx={{ color: MUTED }}>
                      {[pubsN ? `${pubsN} ${pubsN === 1 ? "site" : "sites"}` : "", pkgN ? `${pkgN} ${pkgN === 1 ? "package" : "packages"}` : ""].filter(Boolean).join(" · ")}
                    </MDTypography>
                    <MDTypography fontSize="18px" fontWeight="bold" color="primary" data-testid="estimate-total">
                      {!catalogReady ? `${e.totalCredits ?? 0} credits` : e.ok.length ? `${e.today.toLocaleString("en-IN")} credits today` : "Nothing here can be bought now"}
                    </MDTypography>
                    {changed && e.ok.length > 0 && (
                      <MDTypography fontSize="13px" sx={{ color: "#b26a00" }} data-testid="estimate-changed">
                        was {e.totalCredits} when saved{gone ? "" : ": prices changed"}
                      </MDTypography>
                    )}
                  </MDBox>
                  {catalogReady && gone > 0 && (
                    <MDTypography fontSize="13px" sx={{ color: "#b71c1c", mt: 0.5 }} data-testid="estimate-gone">
                      {gone} {gone === 1 ? "item is" : "items are"} no longer available and will be left out
                    </MDTypography>
                  )}

                  <MDBox display="flex" gap={1} flexWrap="wrap" mt={2}>
                    <MDButton size="small" variant="gradient" color="primary" disabled={!catalogReady || !e.ok.length} onClick={() => createPr(e)}>Create PR from this</MDButton>
                    <MDButton size="small" variant="outlined" color="primary" disabled={!catalogReady || !e.ok.length} onClick={() => editInMarketplace(e)}>Edit in Marketplace</MDButton>
                    <MDButton size="small" variant="outlined" color="secondary" onClick={() => copyLink(e)}>Copy share link</MDButton>
                    <MDButton size="small" variant="text" color="error" onClick={() => setToDelete({ id: e.id, title: e.title })}>Delete</MDButton>
                  </MDBox>
                </Card>
              );
            })}
          </MDBox>
        )}
      </MDBox>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: INK }}>Delete this estimate?</DialogTitle>
        <DialogContent>
          <MDTypography fontSize="15px" sx={{ color: INK }}>"{toDelete?.title}"</MDTypography>
          <MDTypography fontSize="13px" sx={{ color: MUTED, mt: 1 }}>Its share link will stop working. Your PRs are not affected.</MDTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton size="small" variant="outlined" color="secondary" onClick={() => setToDelete(null)}>Cancel</MDButton>
          <MDButton size="small" variant="gradient" color="error" onClick={remove}>{deleting ? "Deleting…" : "Delete"}</MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default MyEstimates;
