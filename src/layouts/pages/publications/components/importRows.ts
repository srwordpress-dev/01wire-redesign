import { PublicationImportRow } from "graphql/mutations/importPublications";

// ---------------- CSV ----------------

// RFC 4180-style parser: quoted fields, "" escapes, commas and newlines inside quotes,
// CRLF/LF line ends, BOM. Returns the rows as arrays of strings; blank lines are dropped.
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // drop a leading byte-order mark (Excel's "CSV UTF-8" adds one)
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
};

// CSV text -> objects keyed by the header row
export const csvToObjects = (text: string): Record<string, string>[] => {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((h, i) => [h.trim(), (cells[i] ?? "").trim()]))
  );
};

// ---------------- sheet columns -> import rows ----------------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Normalised column name (sheet header or API field name) -> import row field
const COLUMN_MAP: Record<string, keyof PublicationImportRow> = {
  basedomain: "domain",
  domain: "domain",
  website: "domain",
  displayname: "title",
  name: "title",
  title: "title",
  language: "language",
  linktypedfnf: "linkType",
  linktype: "linkType",
  tier: "tier",
  backlinks: "backlinks",
  vertical: "section",
  section: "section",
  validity: "validity",
  categoryniche: "niche",
  niche: "niche",
  category: "niche",
  da: "da",
  dr: "dr",
  indexed: "indexed",
  wordsallowed: "wordsAllowed",
  tat: "tat",
  disclaimer: "disclaimer",
  vendorinr: "vendorPriceInr",
  vendorpriceinr: "vendorPriceInr",
  vendorprice: "vendorPriceInr",
  samplelink: "sampleUrl",
  sampleurl: "sampleUrl",
  sourcevendor: "sourceVendor",
  vendor: "sourceVendor",
  notes: "internalNotes",
  internalnotes: "internalNotes",
  variantlabel: "variantLabel",
  offering: "variantLabel",
  description: "description",
  topics: "topics",
  image: "image",
  logo: "image",
  visibility: "visibility",
};

// Columns we recognise, for the preview ("Mapped columns: ...")
export const recognisedColumns = (headers: string[]) =>
  headers.filter((h) => !!COLUMN_MAP[norm(h)]);

const clean = (v: any): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s === "-" ? null : s;
};

export const normalizeDomain = (v: any): string | null => {
  const s = clean(v);
  if (!s) return null;
  return s
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .trim();
};

const toLinkType = (v: any): "DO_FOLLOW" | "NO_FOLLOW" | null => {
  const s = norm(String(v ?? ""));
  if (s === "df" || s === "dofollow") return "DO_FOLLOW";
  if (s === "nf" || s === "nofollow") return "NO_FOLLOW";
  return null;
};

const linkTypeLabel = (lt: string | null | undefined) =>
  lt === "DO_FOLLOW" ? "Do-follow" : lt === "NO_FOLLOW" ? "No-follow" : "";

const toInt = (v: any): number | null => {
  const s = clean(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
};

const toSampleUrl = (v: any): string | null => {
  const s = clean(v);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

// "Hindi · Casino · 2 backlinks · Do-follow" — the non-default parts of an offering
export const buildVariantLabel = (r: {
  language?: string | null;
  tier?: string | null;
  section?: string | null;
  backlinks?: string | null;
  linkType?: string | null;
  validity?: string | null;
}): string => {
  const parts: string[] = [];
  const nonDefault = (v: string | null | undefined, def: string): string | null => {
    const s = (v || "").trim();
    return s && s.toLowerCase() !== def.toLowerCase() ? s : null;
  };
  const language = nonDefault(r.language, "English");
  const tier = nonDefault(r.tier, "Standard");
  const section = nonDefault(r.section, "General");
  const validity = nonDefault(r.validity, "Standard");
  if (language) parts.push(language);
  if (tier) parts.push(tier);
  if (section) parts.push(section);
  const b = (r.backlinks || "").trim();
  if (b) {
    if (/^(0|no|none)$/i.test(b)) parts.push("No backlink");
    else if (b === "1") parts.push("1 backlink");
    else parts.push(`${b} backlinks`);
  }
  const lt = linkTypeLabel(r.linkType);
  if (lt) parts.push(lt);
  if (validity) parts.push(validity);
  return parts.join(" · ") || "Standard article";
};

// One sheet row (or JSON object) -> an import row. Values the server will reject (bad
// domain, missing vendor price, ...) are passed through so the dry run reports them.
export const mapImportRow = (raw: Record<string, any>): PublicationImportRow => {
  const r: Record<string, any> = {};
  Object.entries(raw || {}).forEach(([k, v]) => {
    const field = COLUMN_MAP[norm(k)];
    if (field && r[field] === undefined) r[field] = v;
  });
  const domain = normalizeDomain(r.domain);
  const section = clean(r.section);
  const vendorRaw = clean(r.vendorPriceInr);
  const vendor = vendorRaw == null ? null : Number(vendorRaw.replace(/[₹,\s]/g, ""));

  let topics: string[] | null = null;
  if (Array.isArray(r.topics)) topics = r.topics.map(String);
  else if (clean(r.topics))
    topics = String(r.topics)
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  // No topics column -> null, so a re-import keeps topics set by hand

  const row: PublicationImportRow = {
    title: clean(r.title) || domain || "",
    domain: domain || "",
    language: clean(r.language),
    tier: clean(r.tier),
    section,
    backlinks: clean(r.backlinks),
    validity: clean(r.validity),
    niche: clean(r.niche),
    indexed: clean(r.indexed),
    wordsAllowed: clean(r.wordsAllowed),
    tat: clean(r.tat),
    disclaimer: clean(r.disclaimer),
    sampleUrl: toSampleUrl(r.sampleUrl),
    sourceVendor: clean(r.sourceVendor),
    internalNotes: clean(r.internalNotes),
    description: clean(r.description),
    image: clean(r.image),
    linkType: toLinkType(r.linkType),
    da: toInt(r.da),
    dr: toInt(r.dr),
    topics,
    // vendorPriceInr is Float! in the API: a missing / non-numeric price is sent as 0 so the
    // server skips just that row (it requires a positive price); see vendorPriceProblem
    vendorPriceInr: vendor != null && Number.isFinite(vendor) ? vendor : 0,
    visibility: VISIBILITIES.includes(clean(r.visibility)?.toUpperCase())
      ? clean(r.visibility).toUpperCase()
      : null,
  };
  row.variantLabel = clean(r.variantLabel) || buildVariantLabel(row);
  return row;
};

const VISIBILITIES = ["PUBLISHED", "SUPPRESSED", "PRIVATE"];

// Clearer reason than the server's "must be greater than 0" for a blank / text price
export const vendorPriceProblem = (raw: Record<string, any>): string | null => {
  const key = Object.keys(raw || {}).find((k) => COLUMN_MAP[norm(k)] === "vendorPriceInr");
  const v = clean(key ? raw[key] : null);
  if (v == null) return "Vendor INR is missing";
  const n = Number(v.replace(/[₹,\s]/g, ""));
  if (!Number.isFinite(n)) return `Vendor INR "${v}" is not a number`;
  if (n <= 0) return "Vendor INR must be more than 0";
  return null;
};
