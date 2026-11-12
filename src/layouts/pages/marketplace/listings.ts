// Turns the flat `marketplaceListings` offerings into website rows, and offerings into the
// publication objects the media cart / PR flow expects (see PlanNPayment, OrderSummary).
import { MarketplaceListing } from "graphql/queries/marketplaceListings";
import { Site, Variant } from "./filters/model";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());
const LINK_LABEL: Record<string, string> = { DO_FOLLOW: "Do-follow", NO_FOLLOW: "No-follow" };

// "2" / "1-2" -> Yes, "0" -> No, blank -> "-"
export function backlinkAllowed(backlinks: string): string {
  const nums = (backlinks.match(/\d+/g) || []).map(Number);
  if (!nums.length) return "-";
  return Math.max(...nums) >= 1 ? "Yes" : "No";
}

const unique = (list: string[]) => Array.from(new Set(list.filter(Boolean)));
// DA/DR of 0 means "not known" (publication stats default to 0), so it is shown as "-"
const maxOf = (list: (number | null | undefined)[]) => {
  const nums = list.filter((n): n is number => typeof n === "number" && n > 0);
  return nums.length ? Math.max(...nums) : null;
};

function toVariant(o: MarketplaceListing): Variant {
  const backlinks = str(o.backlinks);
  return {
    id: o.id,
    label: str(o.variantLabel) || "Standard",
    language: str(o.language),
    linkType: LINK_LABEL[str(o.linkType)] || "",
    tier: str(o.tier),
    backlinks,
    backlinkAllowed: backlinkAllowed(backlinks),
    section: str(o.section),
    validity: str(o.validity),
    niche: str(o.niche),
    indexed: str(o.indexed),
    wordsAllowed: str(o.wordsAllowed),
    tat: str(o.tat),
    disclaimer: str(o.disclaimer),
    sample: str(o.sampleUrl),
    price: Number(o.price) || 0,
  };
}

// One row per website (offerings grouped by domain); a legacy publication without a
// domain is its own row keyed by its id.
export function toSites(listings: MarketplaceListing[]): Site[] {
  const groups = new Map<string, MarketplaceListing[]>();
  listings.forEach((o) => {
    if (!o?.id) return;
    const key = str(o.domain).toLowerCase() || `id:${o.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  });
  const sites: Site[] = [];
  groups.forEach((offers, key) => {
    const byPrice = [...offers].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    const variants = byPrice.map(toVariant);
    const first = byPrice[0];
    const cheapest = variants[0];
    const domain = str(first.domain).toLowerCase();
    const url = str(byPrice.find((o) => str(o.url))?.url) || (domain ? `https://${domain}` : "");
    sites.push({
      id: domain || key,
      name: str(first.title) || domain || "Untitled",
      domain,
      url,
      description: str(byPrice.find((o) => str(o.description))?.description),
      image: str(byPrice.find((o) => str(o.image))?.image),
      topics: unique(offers.flatMap((o) => (o.topics || []).map(str))),
      sample: cheapest.sample || variants.find((v) => v.sample)?.sample || "",
      tat: cheapest.tat,
      da: maxOf(offers.map((o) => o.stats?.da)),
      dr: maxOf(offers.map((o) => o.stats?.dr)),
      linkType: cheapest.linkType,
      indexed: cheapest.indexed,
      backlinkAllowed: cheapest.backlinkAllowed,
      sections: unique(variants.map((v) => v.section)),
      languages: unique(variants.map((v) => v.language)),
      price: cheapest.price,
      variants,
    });
  });
  return sites;
}

// What the cart / PR flow stores for a picked offering: OrderSummary reads title, url and
// price (or credits); the PR keeps the ids.
export interface CartPublication {
  id: string;
  title: string;
  url: string;
  price: number;
  credits: number;
  image?: string;
  domain?: string;
  variantLabel?: string;
}

export function toCartItem(site: Site, v: Variant): CartPublication {
  return {
    id: v.id,
    title: site.variants.length > 1 ? `${site.name} · ${v.label}` : site.name,
    url: site.url,
    price: v.price,
    credits: v.price,
    image: site.image || undefined,
    domain: site.domain || undefined,
    variantLabel: v.label,
  };
}

// Display host for a site without a domain (legacy publication with a URL)
export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
