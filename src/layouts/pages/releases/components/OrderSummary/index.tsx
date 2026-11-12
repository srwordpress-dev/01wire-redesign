// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { BundleCategoryOptions } from "constants/index";

interface Props {
  bundles?: any[];
  publications?: any[];
  // Server total when known (payment page); otherwise the sum of the lines
  total?: number;
}

export const creditsText = (n: number) => `${n} ${Number(n) === 1 ? "credit" : "credits"}`;

const titleCase = (val: string) =>
  val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : "";

// A package has its own name; an old-style bundle is "Basic · Yahoo bundle"
export const bundleName = (bundle: any) =>
  bundle?.name ||
  [
    titleCase(bundle?.type),
    BundleCategoryOptions.find((c) => c.value === bundle?.category)?.label || titleCase(bundle?.category),
  ]
    .filter(Boolean)
    .join(" · ") + " bundle";

// "12 media + 250+ Medias" for a package, "3 publications" for a bundle
export const bundleDetail = (bundle: any) => {
  if (!bundle?.name) return `${bundle?.publicationIds?.length || 0} publications`;
  const n = bundle?.mediaCount ?? bundle?.media?.length ?? 0;
  return [`${n} named media`, bundle?.coverage].filter(Boolean).join(" + ");
};

const cell = { py: 1.25, px: 1.5, borderBottom: "1px solid rgba(0, 0, 0, 0.08)" };

function OrderSummary({ bundles = [], publications = [], total }: Props): JSX.Element {
  const lines = [
    ...bundles.map((b: any) => ({
      id: b?.id,
      name: bundleName(b),
      detail: bundleDetail(b),
      type: b?.name ? "Package" : "Bundle",
      price: b?.price || 0,
    })),
    ...publications.map((p: any) => ({
      id: p?.id,
      name: p?.title,
      detail: p?.url,
      type: "Publication",
      // Marketplace table rows carry the price as "credits"
      price: p?.price ?? p?.credits ?? 0,
    })),
  ];
  const sum = lines.reduce((acc, one) => acc + one.price, 0);
  const amount = total ?? sum;
  return (
    <MDBox
      sx={{ border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: "8px", overflow: "hidden" }}
    >
      <MDBox px={1.5} py={1.5} sx={{ background: "#F8F9FA" }}>
        <MDTypography variant="h6">Order Summary</MDTypography>
      </MDBox>
      {!lines.length ? (
        <MDTypography px={1.5} py={2} fontSize="15px" sx={{ color: "#7B809A" }}>
          No media selected yet. Choose a bundle or publications in the Marketplace.
        </MDTypography>
      ) : (
        <MDBox component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
          <MDBox component="thead">
            <MDBox component="tr">
              {["Media", "Type", "Price (credits)"].map((h, i) => (
                <MDBox
                  component="th"
                  key={h}
                  sx={{ ...cell, textAlign: i === 2 ? "right" : "left" }}
                >
                  <MDTypography fontSize="13px" fontWeight="medium" sx={{ color: "#7B809A" }}>
                    {h}
                  </MDTypography>
                </MDBox>
              ))}
            </MDBox>
          </MDBox>
          <MDBox component="tbody">
            {lines.map((one) => (
              <MDBox component="tr" key={`${one.type}-${one.id}`}>
                <MDBox component="td" sx={cell}>
                  <MDTypography fontSize="15px" fontWeight="medium">
                    {one.name}
                  </MDTypography>
                  {one.detail && (
                    <MDTypography fontSize="13px" sx={{ color: "#7B809A", wordBreak: "break-all" }}>
                      {one.detail}
                    </MDTypography>
                  )}
                </MDBox>
                <MDBox component="td" sx={cell}>
                  <MDTypography fontSize="14px">{one.type}</MDTypography>
                </MDBox>
                <MDBox component="td" sx={{ ...cell, textAlign: "right" }}>
                  <MDTypography fontSize="15px">{one.price}</MDTypography>
                </MDBox>
              </MDBox>
            ))}
            <MDBox component="tr">
              <MDBox component="td" colSpan={2} sx={{ ...cell, borderBottom: 0 }}>
                <MDTypography fontSize="16px" fontWeight="bold">
                  Total ({lines.length} {lines.length === 1 ? "item" : "items"})
                </MDTypography>
              </MDBox>
              <MDBox component="td" sx={{ ...cell, borderBottom: 0, textAlign: "right" }}>
                <MDTypography fontSize="18px" fontWeight="bold" color="primary">
                  {creditsText(amount)}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      )}
    </MDBox>
  );
}

export default OrderSummary;
