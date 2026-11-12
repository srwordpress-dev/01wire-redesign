// Filter model for the Marketplace: types, URL (de)serialisation, matching and chips.
// Variant-level filters (price, language include, link type, section, TAT, indexed, backlink,
// tier, disclaimer) must all hold for the SAME option of a site. Site-level filters: search,
// DA, category include/exclude and language exclude (drops any site that offers that language).

import { CATEGORIES, CATEGORY_LABEL, siteCategories } from "../categories";

export interface Variant {
  id: string; // publication id: one offering = one publication
  label: string;
  language: string;
  linkType: string;
  tier: string;
  backlinks: string;
  backlinkAllowed: string;
  section: string;
  validity: string;
  niche: string;
  indexed: string;
  wordsAllowed: string;
  tat: string;
  disclaimer: string;
  sample: string;
  price: number;
}
export interface Site {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  image: string; // file name or URL, "" when none
  topics: string[];
  sample: string;
  tat: string;
  da: number | null;
  dr: number | null;
  linkType: string;
  indexed: string;
  backlinkAllowed: string;
  sections: string[];
  languages: string[];
  price: number;
  variants: Variant[];
}

export type Scope = "all" | "name" | "domain" | "topic";
export interface Filters {
  q: string;
  scope: Scope;
  priceMin: number | null;
  priceMax: number | null;
  langInclude: string[];
  langExclude: string[];
  linkType: string;
  catInclude: string[];
  catExclude: string[];
  daMin: number | null;
  daMax: number | null;
  section: string[];
  tatMax: string;
  indexed: string[];
  backlink: string;
  tier: string[];
  disclaimer: string;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  scope: "all",
  priceMin: null,
  priceMax: null,
  langInclude: [],
  langExclude: [],
  linkType: "",
  catInclude: [],
  catExclude: [],
  daMin: null,
  daMax: null,
  section: [],
  tatMax: "",
  indexed: [],
  backlink: "",
  tier: [],
  disclaimer: "",
};

export interface Option {
  value: string;
  label: string;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const SCOPES: Option[] = [
  { value: "all", label: "All" },
  { value: "name", label: "Website name" },
  { value: "domain", label: "Domain" },
  { value: "topic", label: "Topic" },
];
export const LANGUAGE_CODES: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Gujarati: "gu",
  Marathi: "mr",
  Punjabi: "pa",
  Tamil: "ta",
  Bengali: "bn",
  Kannada: "kn",
  Malayalam: "ml",
  Telugu: "te",
  Odia: "or",
};
const langCode = (l: string) => LANGUAGE_CODES[l] || slugify(l);
export const LINK_TYPES: Option[] = [
  { value: "dofollow", label: "Do-follow" },
  { value: "nofollow", label: "No-follow" },
];
export const SECTIONS: Option[] = ["General", "Casino", "Crypto", "Health", "Review"].map((s) => ({ value: slugify(s), label: s }));
export const TATS: (Option & { hours: number })[] = [
  { value: "24h", label: "Within 24 hours", hours: 24 },
  { value: "48h", label: "Within 48 hours", hours: 48 },
  { value: "3d", label: "Within 3 days", hours: 72 },
  { value: "1w", label: "Within 1 week", hours: 168 },
];
export const INDEXED: Option[] = ["Yes", "No", "Maybe"].map((s) => ({ value: slugify(s), label: s }));
export const BACKLINK: Option[] = ["Yes", "No"].map((s) => ({ value: slugify(s), label: s }));
export const DISCLAIMER: Option[] = [
  { value: "with", label: "With disclaimer" },
  { value: "without", label: "Without disclaimer" },
];
export const SORTS: Option[] = [
  { value: "name", label: "Name: A to Z" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "da", label: "DA: high to low" },
];
export const CATEGORY_OPTIONS: Option[] = CATEGORIES.map((c) => ({ value: c.slug, label: c.label }));

// "48 hrs" -> 48, "3–5 days" -> 120 (upper bound), "1 week" -> 168, "" -> null
export function tatHours(tat: string): number | null {
  const t = (tat || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!t) return null;
  const nums = (t.match(/\d+(\.\d+)?/g) || []).map(Number);
  if (!nums.length) return null;
  const n = Math.max(...nums);
  if (/week/.test(t)) return n * 168;
  if (/day/.test(t)) return n * 24;
  if (/h(ou)?rs?|hour/.test(t)) return n;
  return null;
}

interface PreparedVariant {
  v: Variant;
  lang: string;
  link: string;
  section: string;
  tat: number | null;
  indexed: string;
  backlink: string;
  tier: string;
  disclaimer: "with" | "without" | "";
}
export interface PreparedSite {
  site: Site;
  categories: string[];
  langCodes: string[];
  name: string;
  domain: string;
  topic: string;
  variants: PreparedVariant[];
}

const disclaimerKind = (d: string): "with" | "without" | "" => {
  const t = (d || "").trim().toLowerCase();
  if (!t) return "";
  if (t === "no") return "without";
  return "with"; // Yes, Branded Category, Maybe (may carry one)
};

export function prepareSites(sites: Site[]): PreparedSite[] {
  return sites.map((site) => {
    const categories = siteCategories(site);
    return {
      site,
      categories,
      langCodes: site.languages.map(langCode),
      name: site.name.toLowerCase(),
      domain: site.domain.toLowerCase(),
      topic: `${site.variants.map((v) => v.niche).join(" ")} ${categories.map((c) => CATEGORY_LABEL[c]).join(" ")}`.toLowerCase(),
      variants: site.variants.map((v) => ({
        v,
        lang: v.language ? langCode(v.language) : "",
        link: v.linkType === "Do-follow" ? "dofollow" : v.linkType === "No-follow" ? "nofollow" : "",
        section: slugify(v.section || ""),
        tat: tatHours(v.tat),
        indexed: slugify(v.indexed || ""),
        backlink: v.backlinkAllowed === "Yes" ? "yes" : v.backlinkAllowed === "No" ? "no" : "",
        tier: slugify(v.tier || ""),
        disclaimer: disclaimerKind(v.disclaimer),
      })),
    };
  });
}

export function tierOptions(sites: Site[]): Option[] {
  const tiers = Array.from(new Set(sites.flatMap((s) => s.variants.map((v) => v.tier)).filter(Boolean))).sort();
  return tiers.map((t) => ({ value: slugify(t), label: t }));
}
export function languageOptions(sites: Site[]): Option[] {
  const langs = Array.from(new Set(sites.flatMap((s) => s.languages))).sort();
  return langs.map((l) => ({ value: langCode(l), label: l }));
}

// Returns the cheapest of the site's options that satisfies every option-level filter,
// or null when the site does not match.
export function matchSite(p: PreparedSite, f: Filters): Variant | null {
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay = f.scope === "name" ? p.name : f.scope === "domain" ? p.domain : f.scope === "topic" ? p.topic : `${p.name} ${p.domain} ${p.topic}`;
    if (!hay.includes(q)) return null;
  }
  if (f.daMin !== null || f.daMax !== null) {
    const { da } = p.site;
    if (da === null || da === undefined) return null;
    if (f.daMin !== null && da < f.daMin) return null;
    if (f.daMax !== null && da > f.daMax) return null;
  }
  if (f.catInclude.length && !f.catInclude.some((c) => p.categories.includes(c))) return null;
  if (f.catExclude.length && f.catExclude.some((c) => p.categories.includes(c))) return null;
  if (f.langExclude.length && f.langExclude.some((l) => p.langCodes.includes(l))) return null;
  const tatLimit = f.tatMax ? TATS.find((t) => t.value === f.tatMax)?.hours ?? null : null;
  let best: Variant | null = null;
  p.variants.forEach((pv) => {
    if (f.priceMin !== null && pv.v.price < f.priceMin) return;
    if (f.priceMax !== null && pv.v.price > f.priceMax) return;
    if (f.langInclude.length && !f.langInclude.includes(pv.lang)) return;
    if (f.linkType && pv.link !== f.linkType) return;
    if (f.section.length && !f.section.includes(pv.section)) return;
    if (tatLimit !== null && (pv.tat === null || pv.tat > tatLimit)) return;
    if (f.indexed.length && !f.indexed.includes(pv.indexed)) return;
    if (f.backlink && pv.backlink !== f.backlink) return;
    if (f.tier.length && !f.tier.includes(pv.tier)) return;
    if (f.disclaimer && pv.disclaimer !== f.disclaimer) return;
    if (best === null || pv.v.price < best.price) best = pv.v;
  });
  return best;
}

// ---------- URL ----------

const num = (v: string | null) => {
  if (v === null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const list = (v: string | null, allowed?: string[]) =>
  Array.from(new Set((v || "").split(",").map((x) => x.trim().toLowerCase()).filter((x) => x && (!allowed || allowed.includes(x)))));
const one = (v: string | null, allowed: string[]) => {
  const x = (v || "").trim().toLowerCase();
  return allowed.includes(x) ? x : "";
};
const values = (opts: Option[]) => opts.map((o) => o.value);

export function parseFilters(sp: URLSearchParams, langs: Option[], tiers: Option[]): Filters {
  const scope = one(sp.get("scope"), values(SCOPES)) as Scope;
  return {
    q: sp.get("q") || "",
    scope: scope || "all",
    priceMin: num(sp.get("priceMin")),
    priceMax: num(sp.get("priceMax")),
    langInclude: list(sp.get("langInclude"), values(langs)),
    langExclude: list(sp.get("langExclude"), values(langs)),
    linkType: one(sp.get("linkType"), values(LINK_TYPES)),
    catInclude: list(sp.get("catInclude"), values(CATEGORY_OPTIONS)),
    catExclude: list(sp.get("catExclude"), values(CATEGORY_OPTIONS)),
    daMin: num(sp.get("daMin")),
    daMax: num(sp.get("daMax")),
    section: list(sp.get("section"), values(SECTIONS)),
    tatMax: one(sp.get("tatMax"), values(TATS)),
    indexed: list(sp.get("indexed"), values(INDEXED)),
    backlink: one(sp.get("backlink"), values(BACKLINK)),
    tier: list(sp.get("tier"), values(tiers)),
    disclaimer: one(sp.get("disclaimer"), values(DISCLAIMER)),
  };
}

export function filtersToParams(f: Filters, sort: string, page: number): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (k: string, v: string | number | null | string[]) => {
    if (v === null || v === "" || (Array.isArray(v) && !v.length)) return;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  };
  set("q", f.q);
  if (f.q && f.scope !== "all") set("scope", f.scope);
  set("priceMin", f.priceMin);
  set("priceMax", f.priceMax);
  set("langInclude", f.langInclude);
  set("langExclude", f.langExclude);
  set("linkType", f.linkType);
  set("catInclude", f.catInclude);
  set("catExclude", f.catExclude);
  set("daMin", f.daMin);
  set("daMax", f.daMax);
  set("section", f.section);
  set("tatMax", f.tatMax);
  set("indexed", f.indexed);
  set("backlink", f.backlink);
  set("tier", f.tier);
  set("disclaimer", f.disclaimer);
  if (sort && sort !== "name") sp.set("sort", sort);
  if (page > 1) sp.set("page", String(page));
  return sp;
}

// ---------- chips ----------

export interface ActiveChip {
  key: string;
  label: string;
  clear: Partial<Filters>;
}

const labelsOf = (vals: string[], opts: Option[]) => vals.map((v) => opts.find((o) => o.value === v)?.label || v).join(", ");
const range = (min: number | null, max: number | null, unit = "") => {
  if (min !== null && max !== null) return `${min} – ${max}${unit}`;
  if (min !== null) return `${min}+${unit}`;
  return `up to ${max}${unit}`;
};

export function activeChips(f: Filters, langs: Option[], tiers: Option[]): ActiveChip[] {
  const chips: ActiveChip[] = [];
  const add = (key: string, label: string, clear: Partial<Filters>) => chips.push({ key, label, clear });
  if (f.q.trim()) add("q", `${f.scope === "all" ? "Search" : SCOPES.find((s) => s.value === f.scope)?.label}: "${f.q.trim()}"`, { q: "", scope: "all" });
  if (f.priceMin !== null || f.priceMax !== null) add("price", `Price: ${range(f.priceMin, f.priceMax, " credits")}`, { priceMin: null, priceMax: null });
  if (f.langInclude.length) add("langInclude", `Language: ${labelsOf(f.langInclude, langs)}`, { langInclude: [] });
  if (f.langExclude.length) add("langExclude", `Not language: ${labelsOf(f.langExclude, langs)}`, { langExclude: [] });
  if (f.linkType) add("linkType", `Link: ${labelsOf([f.linkType], LINK_TYPES)}`, { linkType: "" });
  if (f.catInclude.length) add("catInclude", `Category: ${labelsOf(f.catInclude, CATEGORY_OPTIONS)}`, { catInclude: [] });
  if (f.catExclude.length) add("catExclude", `Not category: ${labelsOf(f.catExclude, CATEGORY_OPTIONS)}`, { catExclude: [] });
  if (f.daMin !== null || f.daMax !== null) add("da", `DA: ${range(f.daMin, f.daMax)}`, { daMin: null, daMax: null });
  if (f.section.length) add("section", `Section: ${labelsOf(f.section, SECTIONS)}`, { section: [] });
  if (f.tatMax) add("tatMax", `TAT: ${labelsOf([f.tatMax], TATS).toLowerCase()}`, { tatMax: "" });
  if (f.indexed.length) add("indexed", `Indexed: ${labelsOf(f.indexed, INDEXED)}`, { indexed: [] });
  if (f.backlink) add("backlink", `Backlink allowed: ${labelsOf([f.backlink], BACKLINK)}`, { backlink: "" });
  if (f.tier.length) add("tier", `Tier: ${labelsOf(f.tier, tiers)}`, { tier: [] });
  if (f.disclaimer) add("disclaimer", labelsOf([f.disclaimer], DISCLAIMER), { disclaimer: "" });
  return chips;
}

// ---------- saved filters (this browser only) ----------

export interface SavedFilter {
  name: string;
  query: string;
  savedAt: number;
}

function storageKey(): string {
  let who = "anon";
  try {
    const token = localStorage.getItem("token") || "";
    const payload = JSON.parse(atob((token.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/")));
    who = String(payload.id || payload._id || payload.userId || payload.sub || payload.email || "anon");
  } catch (e) {
    // no token or not a JWT: fall back to one shared key
  }
  return `01wire.marketplace.savedFilters.${who}`;
}
export function loadSaved(): SavedFilter[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => x && typeof x.name === "string" && typeof x.query === "string") : [];
  } catch (e) {
    return [];
  }
}
export function storeSaved(list: SavedFilter[]): boolean {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}
