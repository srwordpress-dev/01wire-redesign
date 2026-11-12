import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import ButtonBase from "@mui/material/ButtonBase";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { IMarketplaceListings, MARKETPLACE_LISTINGS } from "graphql/queries/marketplaceListings";
import { toSites } from "layouts/pages/marketplace/listings";
import { getImageUrl } from "utils/apiConfig";
import { GET_BUNDLES, IGetBundles, IGetBundlesVars } from "graphql/queries/filterBundlesPaginated";
import { mediaOf, TIER_COLOURS } from "layouts/pages/marketplace/BundlesTab";
import { palette, eyebrow, transition } from "assets/theme/tokens";

const PREVIEW_SIZE = 6; // publications shown (the Packages box next to it is taller now)

interface PreviewItem {
  id: string;
  image?: string;
  title: string;
  meta: string;
  price?: number;
  priceFrom?: boolean;
}

// Logo, or the item's initials when there is none or it fails to load
const Thumb = ({ src, title }: { src?: string; title: string }) => {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(src);
  const box = { width: 40, height: 40, borderRadius: "8px", flexShrink: 0 };
  if (url && !failed) {
    return (
      <MDBox
        component="img"
        src={url}
        alt=""
        onError={() => setFailed(true)}
        sx={{ ...box, objectFit: "contain", border: "1px solid rgba(0,0,0,0.08)" }}
      />
    );
  }
  const letters = title
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ ...box, backgroundColor: palette.surfaceElevated, color: palette.ink, fontWeight: 500, fontSize: "14px" }}
    >
      {letters || "?"}
    </MDBox>
  );
};

// One category column: header, up to PREVIEW_SIZE items, "View all"
const CategoryPreview = ({
  title,
  subtitle,
  Icon,
  items,
  total,
  loading,
  onOpen,
}: {
  title: string;
  subtitle: string;
  Icon: typeof ArticleOutlinedIcon;
  items: PreviewItem[];
  total?: number;
  loading: boolean;
  onOpen: () => void;
}) => (
  <Card sx={{ height: "100%" }}>
    <MDBox p={2} display="flex" alignItems="center" gap={2}>
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="48px"
        height="48px"
        borderRadius="12px"
        flexShrink={0}
        sx={{ backgroundColor: palette.surfaceElevated, borderRadius: "4px" }}
      >
        <Icon sx={{ color: palette.ink, fontSize: "22px !important" }} />
      </MDBox>
      <MDBox flexGrow={1} minWidth={0}>
        <MDTypography fontSize="16px" fontWeight="medium" sx={{ color: palette.ink }}>
          {title}
          {total !== undefined && (
            <MDTypography component="span" fontSize="14px" fontWeight="regular" color="text">
              {` · ${total} available`}
            </MDTypography>
          )}
        </MDTypography>
        <MDTypography fontSize="14px" fontWeight="light" color="text">
          {subtitle}
        </MDTypography>
      </MDBox>
    </MDBox>
    <Divider sx={{ my: 0 }} />
    <MDBox px={2} py={1} flexGrow={1}>
      {loading ? (
        <MDTypography fontSize="14px" color="text" py={2}>
          Loading…
        </MDTypography>
      ) : items.length ? (
        items.map((item) => (
          <ButtonBase
            key={item.id}
            onClick={onOpen}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1,
              borderRadius: "8px",
              textAlign: "left",
            }}
          >
            <Thumb src={item.image} title={item.title} />
            <MDBox flexGrow={1} minWidth={0}>
              <MDTypography fontSize="14px" fontWeight="medium" noWrap>
                {item.title}
              </MDTypography>
              <MDTypography fontSize="12px" color="text" noWrap>
                {item.meta}
              </MDTypography>
            </MDBox>
            {item.price !== undefined && item.price !== null && (
              <MDTypography fontSize="14px" fontWeight="medium" flexShrink={0} sx={{ color: palette.ink, fontVariantNumeric: "tabular-nums" }}>
                {item.priceFrom ? "from " : ""}
                {item.price} {item.price === 1 ? "credit" : "credits"}
              </MDTypography>
            )}
          </ButtonBase>
        ))
      ) : (
        <MDTypography fontSize="14px" color="text" py={2}>
          Nothing available yet
        </MDTypography>
      )}
    </MDBox>
    <MDBox px={2} pb={2}>
      <MDButton variant="outlined" color="primary" size="small" fullWidth onClick={onOpen}>
        View all {title.toLowerCase()}
        <ArrowForwardIcon sx={{ ml: 0.5 }} />
      </MDButton>
    </MDBox>
  </Card>
);

const PACKAGE_CARDS = 4;

// One media logo on the package cover; skipped if it fails to load
const CoverLogo = ({ m, size }: { m: { name: string; image?: string }; size: number }) => {
  const [failed, setFailed] = useState(false);
  const url = getImageUrl(m.image);
  if (!url || failed) return null;
  return (
    <MDBox
      component="img"
      src={url}
      alt={`${m.name} logo`}
      title={m.name}
      onError={() => setFailed(true)}
      sx={{ width: size, height: size, objectFit: "contain", borderRadius: "4px", background: palette.surface, p: 0.75, boxShadow: `0 0 0 1px ${palette.hairline}`, flexShrink: 0 }}
    />
  );
};

// Package picture card: a cover made of its media logos, then name, tier, media count, price
const PackageCard = ({ b, onOpen }: { b: any; onOpen: () => void }) => {
  const media = mediaOf(b);
  const logos = media.filter((m) => m.image).slice(0, 4); // one row; "+N more" for the rest
  const name = b?.name || "Package";
  const initials = name.split(/[\s.+-]+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return (
    <ButtonBase
      onClick={onOpen}
      data-testid="package-card"
      sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", textAlign: "left", borderRadius: "4px", overflow: "hidden", border: `1px solid ${palette.hairline}`, background: palette.surface, transition: transition("border-color"), "&:hover": { borderColor: palette.outline } }}
    >
      <MDBox
        data-testid="package-cover"
        sx={{ position: "relative", height: 112, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap", px: 1.5, pt: 2.5, background: palette.surfaceSunken, borderBottom: `1px solid ${palette.hairline}` }}
      >
        {logos.length ? (
          logos.map((m) => <CoverLogo key={m.name} m={m} size={logos.length > 3 ? 42 : 50} />)
        ) : (
          <MDBox sx={{ width: 56, height: 56, borderRadius: "4px", background: palette.surfaceElevated, color: palette.ink, fontWeight: 500, fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {initials || "?"}
          </MDBox>
        )}
        {b?.featured && (
          <MDBox sx={{ position: "absolute", top: 8, left: 8, background: palette.brandSoft, color: palette.brand, fontSize: "11px", fontWeight: 500, px: 1, py: 0.25, borderRadius: "4px" }}>
            ★ Popular
          </MDBox>
        )}
        {media.length > logos.length && logos.length > 0 && (
          <MDBox sx={{ position: "absolute", bottom: 6, right: 8, ...eyebrow, fontSize: "10px" }}>
            +{media.length - logos.length} more
          </MDBox>
        )}
      </MDBox>
      <MDBox p={1.5} display="flex" flexDirection="column" gap={0.5} flexGrow={1}>
        <MDTypography fontSize="15px" fontWeight="medium" sx={{ lineHeight: 1.25, color: palette.ink }}>
          {name}
        </MDTypography>
        <MDBox display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
          {b?.tier && (
            <MDBox component="span" sx={{ background: TIER_COLOURS[b.tier] || "#607D8B", color: "#fff", fontSize: "11px", fontWeight: 500, px: 0.75, py: 0.125, borderRadius: "4px" }}>
              {b.tier}
            </MDBox>
          )}
          <MDTypography fontSize="12px" color="text">
            {media.length} media
          </MDTypography>
        </MDBox>
        <MDBox mt="auto" pt={0.5} display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography fontSize="15px" fontWeight="medium" sx={{ color: palette.ink, fontVariantNumeric: "tabular-nums" }}>
            {b?.price} {b?.price === 1 ? "credit" : "credits"}
          </MDTypography>
          <MDTypography fontSize="13px" fontWeight="medium" color="primary">
            View →
          </MDTypography>
        </MDBox>
      </MDBox>
    </ButtonBase>
  );
};

// Dashboard "Packages" box: the top Popular packages as picture cards
const PackagesPreview = ({ items, total, loading, onOpen, onOpenAll }: { items: any[]; total?: number; loading: boolean; onOpen: (id: string) => void; onOpenAll: () => void }) => (
  <Card sx={{ height: "100%" }}>
    <MDBox p={2} display="flex" alignItems="center" gap={2}>
      <MDBox display="flex" alignItems="center" justifyContent="center" width="48px" height="48px" flexShrink={0} sx={{ backgroundColor: palette.surfaceElevated, borderRadius: "4px" }}>
        <Inventory2OutlinedIcon sx={{ color: palette.ink, fontSize: "22px !important" }} />
      </MDBox>
      <MDBox flexGrow={1} minWidth={0}>
        <MDTypography fontSize="16px" fontWeight="medium" sx={{ color: palette.ink }}>
          Packages
          {total !== undefined && (
            <MDTypography component="span" fontSize="14px" fontWeight="regular" color="text">
              {` · ${total} available`}
            </MDTypography>
          )}
        </MDTypography>
        <MDTypography fontSize="14px" fontWeight="light" color="text">
          Ready-made PR packages
        </MDTypography>
      </MDBox>
    </MDBox>
    <Divider sx={{ my: 0 }} />
    <MDBox p={2} flexGrow={1}>
      {loading ? (
        <MDTypography fontSize="14px" color="text" py={2}>Loading…</MDTypography>
      ) : items.length ? (
        <Grid container spacing={1.5}>
          {items.map((b) => (
            <Grid item xs={12} sm={6} key={b.id}>
              <PackageCard b={b} onOpen={() => onOpen(b.id)} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <MDTypography fontSize="14px" color="text" py={2}>Nothing available yet</MDTypography>
      )}
    </MDBox>
    <MDBox px={2} pb={2}>
      <MDButton variant="outlined" color="primary" size="small" fullWidth onClick={onOpenAll}>
        View all packages
        <ArrowForwardIcon sx={{ ml: 0.5 }} />
      </MDButton>
    </MDBox>
  </Card>
);

function MarketplacePreview(): JSX.Element {
  const navigate = useNavigate();
  const { data: pData, loading: pLoading } = useQuery<IMarketplaceListings>(
    MARKETPLACE_LISTINGS,
    { fetchPolicy: "cache-and-network" }
  );
  const { data: bData, loading: bLoading } = useQuery<IGetBundles, IGetBundlesVars>(GET_BUNDLES, {
    variables: { paginationInput: { currentPage: 0, perPage: 20 } },
    fetchPolicy: "network-only",
  });

  // Marketplace websites (offerings grouped by domain), highest DA first
  const sites = toSites(pData?.marketplaceListings || []);
  const publications: PreviewItem[] = [...sites]
    .sort((a, b) => (b.da ?? -1) - (a.da ?? -1) || a.name.localeCompare(b.name))
    .slice(0, PREVIEW_SIZE)
    .map((s) => ({
      id: s.id,
      image: s.image,
      title: s.name,
      meta: [
        s.domain,
        s.da !== null && `DA ${s.da}`,
        s.variants.length > 1 && `${s.variants.length} options`,
      ]
        .filter(Boolean)
        .join(" · "),
      price: s.price,
      priceFrom: s.variants.length > 1,
    }));
  // Top Popular packages (in the admin's Popular order); if fewer, fill with the next ones
  const allBundles: any[] = bData?.filterBundlesPaginated?.data || [];
  const popular = allBundles.filter((b) => b?.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  const packageCards = [...popular, ...allBundles.filter((b) => !b?.featured)].slice(0, PACKAGE_CARDS);

  const open = () => navigate("/marketplace");
  const openBundles = () => navigate("/marketplace?tab=bundles");

  return (
    <MDBox>
      <MDTypography component="h2" sx={{ ...eyebrow, display: "block", mt: 4, mb: 1.5 }}>
        Marketplace
      </MDTypography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CategoryPreview
            title="Publications"
            subtitle="Pick websites to publish on"
            Icon={ArticleOutlinedIcon}
            items={publications}
            total={pData ? sites.length : undefined}
            loading={pLoading && !pData}
            onOpen={open}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PackagesPreview
            items={packageCards}
            total={bData?.filterBundlesPaginated?.paginationInfo?.itemCount}
            loading={bLoading && !bData}
            onOpen={(id) => navigate(`/marketplace?tab=bundles&package=${id}`)}
            onOpenAll={openBundles}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default MarketplacePreview;
