/**
 * Demo-only Apollo link: answers every query with generated sample data shaped by the
 * backend schema (schemaMap.json, extracted from 01wire-be), and answers every mutation
 * with a friendly "changes aren't saved" error. Nothing ever leaves the browser.
 */
import { ApolloLink, Observable, FetchResult } from "@apollo/client";
import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  SelectionSetNode,
} from "graphql";
import schemaMap from "demo/schemaMap.json";
import { DEMO_TOKEN, DEMO_WRITE_MESSAGE } from "demo/demoMode";
import {
  COMPANIES,
  DOMAINS,
  HEADLINES,
  OUTLETS,
  PACKAGES,
  PARAGRAPH,
  PEOPLE,
  TIERS,
} from "demo/sampleData";

type Ref = [string, boolean];
interface SchemaMap {
  types: Record<string, Record<string, Ref>>;
  enums: Record<string, string[]>;
  queries: Record<string, Ref>;
}
const SCHEMA = schemaMap as unknown as SchemaMap;

interface Ctx {
  vars: Record<string, any>;
  frags: Record<string, FragmentDefinitionNode>;
  filter: Record<string, any>;
  perPage: number;
  currentPage: number;
  /** Seed of the object being built, so its name, email and domain agree. */
  eseed?: number;
}

const ITEM_COUNT = 24;
const DAY = 86400000;
// Fixed "now" so the demo looks the same on every visit.
const NOW = Date.UTC(2026, 10, 12, 10, 0, 0);

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Final avalanche so small changes spread to the low bits used by pick().
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
const pick = <T>(list: readonly T[], seed: number): T => list[seed % list.length];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Flatten a selection set, following fragment spreads and inline fragments. */
function fieldsOf(sel: SelectionSetNode | undefined, ctx: Ctx, out: FieldNode[] = []): FieldNode[] {
  if (!sel) return out;
  sel.selections.forEach((s) => {
    if (s.kind === Kind.FIELD) out.push(s);
    else if (s.kind === Kind.INLINE_FRAGMENT) fieldsOf(s.selectionSet, ctx, out);
    else if (s.kind === Kind.FRAGMENT_SPREAD) fieldsOf(ctx.frags[s.name.value]?.selectionSet, ctx, out);
  });
  return out;
}

function money(seed: number, min = 2000, max = 60000): number {
  const steps = Math.floor((max - min) / 500);
  return min + (seed % (steps + 1)) * 500;
}

function intFor(name: string, parent: string, seed: number, idx: number, ctx: Ctx): number {
  const n = name.toLowerCase();
  if (n === "currentpage") return ctx.currentPage;
  if (n === "prid") return 1048 - idx;
  if (n === "perpage") return ctx.perPage;
  if (n === "itemcount" || n === "totalcount") return ITEM_COUNT;
  if (n === "pagecount") return Math.max(1, Math.ceil(ITEM_COUNT / ctx.perPage));
  if (n === "balance") return 12500;
  if (n === "count") return 1 + (seed % 9);
  // Counts of things, even when the name also mentions money ("owedCount", "newPaidPrs").
  if (/count$|delivered$|^new|published$|payments(test)?$|^rows?|toadd|alreadyimported|sourcerow/.test(n)) return 1 + (seed % 9);
  if (/^(da|dr|pa|ur)$/.test(n)) return 25 + (seed % 66);
  if (n.includes("traffic")) return 120000 + (seed % 80) * 97000;
  if (n.includes("percent")) return n.includes("gst") ? 18 : 20;
  if (n.includes("rank")) return idx + 1;
  if (n.includes("refunded")) return 0;
  if (/payment/i.test(parent) && /amount/.test(n)) return money(seed) * 100; // paise
  if (/owed|outstanding|due/.test(n)) return money(seed, 5000, 40000);
  if (/price|credit|amount|cost|inr|total|margin|revenue|paid|spend/.test(n)) return money(seed);
  if (/late|overdue|failed|rejected/.test(n)) return seed % 3;
  return 1 + (seed % 12);
}

function boolFor(name: string, seed: number, idx: number, ctx: Ctx): boolean {
  const n = name.toLowerCase();
  const pages = Math.max(1, Math.ceil(ITEM_COUNT / ctx.perPage));
  if (n === "hasnextpage") return ctx.currentPage < pages - 1;
  if (n === "haspreviouspage") return ctx.currentPage > 0;
  if (n.includes("verified")) return true;
  if (n === "featured") return idx < 2;
  if (n.includes("test")) return false;
  if (n === "overdue") return seed % 6 === 0;
  return seed % 2 === 0;
}

function dateFor(name: string, seed: number): string {
  const n = name.toLowerCase();
  const future = /publishat|publishby|expire|due|scheduled/.test(n);
  const offset = (1 + (seed % 40)) * DAY + (seed % 24) * 3600000;
  return new Date(future ? NOW + offset : NOW - offset).toISOString();
}

function stringFor(name: string, parent: string, seed: number, idx: number, ctx: Ctx): string | null {
  const n = name.toLowerCase();
  const p = parent.replace(/Type$/, "");
  const e = ctx.eseed ?? seed + idx;
  const company = pick(COMPANIES, e);
  const person = pick(PEOPLE, e);
  const domain = pick(DOMAINS, e); // OUTLETS and DOMAINS share an order
  const outlet = pick(OUTLETS, e);

  // Filters asked for by the page win, so filtered views stay consistent.
  if (typeof ctx.filter[name] === "string" && ctx.filter[name]) return ctx.filter[name];

  if (/image|logo|avatar|screenshot/.test(n)) return null;
  if (/^(notes|note|internalnotes|changesrequested|instructions|submiterror|reason|issue|variantlabel|importbatch|vendorpaymentnote|livenote|articlenote|message)$/.test(n))
    return null;
  if (n === "token") return DEMO_TOKEN;
  if (n === "prid") return `PR-${1040 + (seed % 60)}`;
  if (n === "ticker") return company.split(" ")[0].slice(0, 4).toUpperCase();

  if (n === "status") {
    if (p === "AdminPrRow") return pick(["SUBMITTED", "REVIEW", "AWAITING_APPROVAL", "SCHEDULED", "PUBLISHED", "DRAFT"], seed + idx);
    if (p === "AdminPrItem") return pick(["PENDING", "PUBLISHED", "PUBLISHED", "REJECTED"], seed + idx);
    if (p.startsWith("Offline")) return pick(["DELIVERED", "NOT_DELIVERED", "DELIVERED"], seed + idx);
    return pick(["SUCCESS", "PENDING"], seed);
  }
  if (n === "nextstep") return pick(["REVIEW", "WAITING_CUSTOMER", "PUBLISH_SITES", "CLOSE_PR", "DONE", "UNPAID"], seed + idx);
  if (n === "vendororderstatus") return pick(["DELIVERED", "NOT_DELIVERED"], seed + idx);
  if (/paymentstatus/.test(n)) return pick(["PAID", "PAID", "UNPAID"], seed + idx);
  if (n === "type" && p === "AdminPrItem") return pick(["Publication", "Package"], seed + idx);

  if (n === "title") {
    if (p === "Publication") return outlet;
    if (p === "Client") return company;
    if (p === "Estimate") return `${company} launch plan`;
    return pick(HEADLINES, seed + idx);
  }
  if (n === "name") {
    if (p === "Bundle") return pick(PACKAGES, seed + idx);
    if (/Media|AdminPrItem/.test(p)) return outlet;
    return person;
  }
  if (n === "item") return pick([...PACKAGES, ...OUTLETS], seed + idx);
  if (/fullname|customername/.test(n)) return person;
  if (n === "clientname") return company;
  if (/email/.test(n)) {
    if (p === "Client") return `press@${slug(company)}.in`;
    return `${slug(person).replace("-", ".")}@${slug(company)}.in`;
  }
  if (n === "domain") return domain;
  if (/liveLink|articlelink|sampleurl|url|website|checkouturl/i.test(n)) {
    if (p === "Client" || n === "website") return `https://www.${slug(company)}.in`;
    return `https://www.${domain}/news/${slug(pick(HEADLINES, seed)).slice(0, 48)}`;
  }
  if (n === "linkedin") return `https://www.linkedin.com/company/${slug(company)}`;
  if (n === "twitter") return `https://x.com/${slug(company).replace(/-/g, "")}`;
  if (/facebook|instagram|youtube|others/.test(n)) return null;
  if (/phone/.test(n)) return `+91 98${(10000000 + (seed % 89999999)).toString().slice(0, 8)}`;
  if (n === "content") return PARAGRAPH;
  if (n === "changes")
    return pick(
      [
        "Please add the CEO quote in the second paragraph",
        "Update the funding amount to ₹120 crore",
        "Use the new company logo",
        "Shorten the headline",
        "Add the Mumbai office address",
      ],
      seed + idx
    );
  if (n === "groups") return pick(["Startups", "Agencies", "Enterprise"], seed + idx);
  if (/summary|description|metadescription|featureimagedesc/.test(n))
    return `${company} shares a milestone with customers, partners and the press.`;
  if (n === "metatitle") return pick(HEADLINES, seed).slice(0, 60);
  if (n === "tier") return pick(TIERS, seed + idx);
  if (n === "language") return "English";
  if (n === "timezone") return "Asia/Kolkata";
  if (n === "tat") return pick(["24 hours", "48 hours", "3-5 days"], seed);
  if (n === "timeline") return pick(["1-2 days", "2-3 days", "1 week"], seed);
  if (n === "linktype") return pick(["DO_FOLLOW", "NO_FOLLOW"], seed);
  if (n === "indexed") return pick(["Yes", "Google News"], seed);
  if (n === "backlinks") return pick(["1 do-follow", "2 no-follow"], seed);
  if (n === "coverage") return pick(["India", "India + Global", "US / UK"], seed);
  if (n === "contentrule") return "Client-supplied copy, light edit";
  if (n === "disclaimer") return "Sponsored label may apply";
  if (n === "packagetype") return pick(["Bundle", "Single outlet"], seed);
  if (/vendorpackagename/.test(n)) return `${pick(PACKAGES, seed)} (vendor)`;
  if (/vendor|sourcevendor|provider/.test(n)) return pick(["Vendor A", "Vendor B", "Vendor C"], seed);
  if (n === "section") return pick(["Business", "Technology", "Startups"], seed);
  if (n === "niche") return pick(["Startups", "Finance", "Health"], seed);
  if (n === "validity") return "Lifetime";
  if (n === "wordsallowed") return "800";
  if (n === "source") return "manual";
  if (n === "currency") return "INR";
  if (n === "method") return pick(["razorpay", "bank_transfer"], seed);
  if (n === "month") return "2026-11";
  if (n === "customergroup") return pick(["Startups", "Agencies", "Enterprise"], seed + idx);
  if (n === "ordertype") return "PR";
  if (n === "address") return "Lower Parel, Mumbai";
  if (n === "city") return "Mumbai";
  if (n === "state") return "Maharashtra";
  if (n === "country") return "India";
  if (n === "code") return `WIRE${10 + (seed % 40)}`;
  if (/ids?$/.test(n)) return `demo-${n.replace(/ids?$/, "")}-${100 + (seed % 900)}`;
  if (n === "traffic") return `${1 + (seed % 9)}M`;
  return company;
}

function scalar(type: string, name: string, parent: string, seed: number, idx: number, ctx: Ctx): any {
  const enumValues = SCHEMA.enums[type];
  if (enumValues?.length) {
    if (typeof ctx.filter[name] === "string" && enumValues.includes(ctx.filter[name])) return ctx.filter[name];
    return pick(enumValues, seed + idx);
  }
  switch (type) {
    case "ID":
      return `demo-${parent.replace(/Type$/, "").toLowerCase()}-${name}-${idx}-${seed % 997}`;
    case "Int":
    case "Float":
      return intFor(name, parent, seed, idx, ctx);
    case "Boolean":
      return boolFor(name, seed, idx, ctx);
    case "DateTime":
      return dateFor(name, seed);
    case "JSON":
      return {};
    default:
      return stringFor(name, parent, seed, idx, ctx);
  }
}

function listLength(name: string, type: string, ctx: Ctx, root = false): number {
  if (name === "data") return Math.min(ctx.perPage, 8);
  if (root && SCHEMA.types[type]) return 8;
  if (SCHEMA.types[type]) return 3;
  return 2;
}

/** Keep money fields in one record consistent: cost is ~60% of paid, margin is the rest. */
function balanceMoney(obj: Record<string, any>): void {
  const paidKey = ["amountPaid", "customersPaid", "paid", "revenue"].find((k) => typeof obj[k] === "number");
  const costKey = ["vendorCost", "cost"].find((k) => typeof obj[k] === "number");
  if (!paidKey || !costKey) return;
  obj[costKey] = Math.round((obj[paidKey] * 0.6) / 500) * 500;
  if (typeof obj.margin === "number") obj.margin = obj[paidKey] - obj[costKey];
}

/** Totals add up: count = delivered + not delivered. */
function balanceCounts(obj: Record<string, any>): void {
  if (typeof obj.delivered === "number" && typeof obj.notDelivered === "number" && "count" in obj)
    obj.count = obj.delivered + obj.notDelivered;
  if (typeof obj.owedCount === "number" && typeof obj.count === "number") obj.owedCount = Math.min(obj.owedCount, obj.count);
}

function build(type: string, sel: SelectionSetNode | undefined, path: string, idx: number, ctx: Ctx): any {
  const fields = SCHEMA.types[type] || {};
  const obj: Record<string, any> = {};
  const outer = ctx.eseed;
  // Rows of one list get consecutive entities, so names in a table never repeat.
  ctx.eseed = (hash(type) % 16) + idx;
  fieldsOf(sel, ctx).forEach((f) => {
    const key = f.alias?.value || f.name.value;
    const name = f.name.value;
    if (name === "__typename") {
      obj[key] = type;
      return;
    }
    const [childType, isList] = fields[name] || ["String", /s$/.test(name) && !/status|address|ss$/.test(name)];
    obj[key] = value(childType, isList, f, name, type, `${path}.${name}`, idx, ctx);
  });
  balanceMoney(obj);
  balanceCounts(obj);
  ctx.eseed = outer;
  return obj;
}

function value(
  type: string,
  isList: boolean,
  f: FieldNode,
  name: string,
  parent: string,
  path: string,
  idx: number,
  ctx: Ctx
): any {
  const seed = hash(path) + idx * 7919;
  if (isList) {
    const len = listLength(name, type, ctx, parent === "Query");
    return Array.from({ length: len }, (_, i) =>
      SCHEMA.types[type]
        ? build(type, f.selectionSet, `${path}[${i}]`, name === "data" ? ctx.currentPage * ctx.perPage + i : i, ctx)
        : scalar(type, name, parent, hash(`${path}[${i}]`), i, ctx)
    );
  }
  if (SCHEMA.types[type]) return build(type, f.selectionSet, path, idx, ctx);
  return scalar(type, name, parent, seed, idx, ctx);
}

function findPagination(vars: Record<string, any>): { perPage: number; currentPage: number } {
  const p = Object.values(vars || {}).find((v: any) => v && typeof v === "object" && "perPage" in v) as any;
  return { perPage: Math.max(1, Number(p?.perPage) || 10), currentPage: Math.max(0, Number(p?.currentPage) || 0) };
}

function resolveRoot(field: FieldNode, ctx: Ctx): any {
  const name = field.name.value;
  // One row per status, so the dashboard counts read naturally.
  if (name === "getArticleStats") {
    const counts: Record<string, number> = {
      DRAFT: 3, SUBMITTED: 2, REVIEW: 4, AWAITING_APPROVAL: 1, SCHEDULED: 2, REJECTED: 1, PUBLISHED: 11,
    };
    return Object.entries(counts).map(([status, count]) => ({ __typename: "ArticleStatsType", status, count }));
  }
  const ref = SCHEMA.queries[name];
  if (!ref) return null;
  return value(ref[0], ref[1], field, name, "Query", name, 0, ctx);
}

const BLOCKED_QUERIES = new Set(["getAuthStatus"]);

export function createDemoLink(): ApolloLink {
  return new ApolloLink(
    (operation) =>
      new Observable<FetchResult>((observer) => {
        const doc: DocumentNode = operation.query;
        const op = doc.definitions.find((d) => d.kind === Kind.OPERATION_DEFINITION) as OperationDefinitionNode;
        const frags: Record<string, FragmentDefinitionNode> = {};
        doc.definitions.forEach((d) => {
          if (d.kind === Kind.FRAGMENT_DEFINITION) frags[d.name.value] = d;
        });
        const roots = fieldsOf(op.selectionSet, { frags } as Ctx);
        const timer = setTimeout(() => {
          if (op.operation !== "query" || roots.some((r) => BLOCKED_QUERIES.has(r.name.value))) {
            observer.next({ data: null, errors: [{ message: DEMO_WRITE_MESSAGE } as any] });
            observer.complete();
            return;
          }
          const vars = operation.variables || {};
          const { perPage, currentPage } = findPagination(vars);
          const filter = Object.values(vars).find(
            (v: any) => v && typeof v === "object" && !("perPage" in v)
          ) as Record<string, any>;
          const ctx: Ctx = { vars, frags, filter: filter || {}, perPage, currentPage };
          const data: Record<string, any> = {};
          roots.forEach((r) => {
            data[r.alias?.value || r.name.value] = resolveRoot(r, ctx);
          });
          observer.next({ data });
          observer.complete();
        }, 250);
        return () => clearTimeout(timer);
      })
  );
}
