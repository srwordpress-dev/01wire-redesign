// Same formula as the server (PublicationService.calcPrice):
// credits = ceil(vendorINR * (1 + markup%) * (1 + gst%) / usdInrRate), $1 = 1 credit
export interface PricingDefaults {
  markupPercent: number;
  gstPercent: number;
  usdInrRate: number;
}

export const calcClientPrice = (
  vendorPriceInr: number | null | undefined,
  markupPercent: number | null | undefined,
  gstPercent: number | null | undefined,
  defaults?: PricingDefaults | null
): number | null => {
  if (vendorPriceInr == null || !defaults || !(defaults.usdInrRate > 0)) return null;
  const markup = markupPercent ?? defaults.markupPercent;
  const gst = gstPercent ?? defaults.gstPercent;
  return Math.ceil((vendorPriceInr * (1 + markup / 100) * (1 + gst / 100)) / defaults.usdInrRate);
};

// "" / null / undefined -> null, otherwise a number (NaN when not numeric)
export const toNumberOrNull = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[₹,\s]/g, "");
  if (s === "") return null;
  return Number(s);
};

export const formatInr = (n?: number | null) =>
  n == null ? "-" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
