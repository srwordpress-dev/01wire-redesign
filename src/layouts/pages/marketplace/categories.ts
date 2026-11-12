// Category taxonomy for the Marketplace. A website's categories come from its offerings'
// `topics` (category slugs set by the admin). Websites with no topics fall back to a keyword
// guess from what we have (variant niche text, section, name, domain, language).

export interface CategoryDef {
  slug: string;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "crypto", label: "Crypto" },
  { slug: "news-media", label: "News & Media" },
  { slug: "technology", label: "Technology" },
  { slug: "business", label: "Business" },
  { slug: "finance", label: "Finance" },
  { slug: "health", label: "Health" },
  { slug: "lifestyle", label: "Lifestyle" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "sports", label: "Sports" },
  { slug: "education", label: "Education" },
  { slug: "auto", label: "Auto" },
  { slug: "real-estate", label: "Real Estate" },
  { slug: "travel", label: "Travel" },
  { slug: "gaming-casino", label: "Gaming/Casino" },
  { slug: "regional", label: "Regional" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));

// Each pattern is matched with a leading word boundary, case-insensitive, so "tech"
// also matches "technology" and "techgenyz". Add a trailing "\\b" for exact words.
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  crypto: ["crypto", "bitcoin", "blockchain", "web3", "nft", "defi", "btc\\b", "coins?\\b"],
  "news-media": ["news", "media\\b", "journalis", "headlines?\\b", "breaking\\b", "organic coverage"],
  technology: ["tech", "gadget", "android", "software", "ai\\b", "mobiles?\\b", "apps?\\b", "cyber", "internet", "computer", "laptop", "iphone", "smartphone", "digital"],
  business: ["business", "startup", "entrepreneur", "industr", "economy", "corporate", "ecommerce", "e-commerce", "commerce", "marketing", "brands?\\b"],
  finance: ["financ", "money", "stocks?\\b", "invest", "banking", "insurance", "loans?\\b", "tax\\b", "trading", "mutual fund", "fintech", "wealth", "paisa", "share market"],
  health: ["health", "fitness", "medical", "medicine", "wellness", "yoga", "diet", "pharma", "doctor", "hospital", "ayurved"],
  lifestyle: ["lifestyle", "fashion", "beauty", "food", "recipe", "home decor", "decor", "relationship", "parenting", "makeup", "skin ?care", "hair ?care", "women"],
  entertainment: ["entertainment", "bollywood", "tollywood", "movie", "film", "cinema", "celebrit", "music", "tv\\b", "web series", "showbiz", "gossip", "reality show"],
  sports: ["sport", "cricket", "football", "tennis", "badminton", "hockey", "kabaddi", "golf", "nfl\\b", "olympic"],
  education: ["educat", "study", "studies", "exams?\\b", "admit card", "results?\\b", "career", "jobs?\\b", "school", "universit", "college", "scholarship", "courses?\\b", "syllabus", "admission"],
  auto: ["auto", "cars?\\b", "bikes?\\b", "motor", "vehicle", "ev\\b", "electric vehicle"],
  "real-estate": ["real estate", "realty", "realestate", "propert", "housing", "construction", "interior"],
  travel: ["travel", "tour", "trips?\\b", "hotel", "holiday", "destination", "yatra"],
  "gaming-casino": ["casino", "gaming", "games?\\b", "bet\\b", "betting", "poker", "rummy", "lottery", "satta", "esports"],
  regional: ["regional", "local news", "bihar", "jharkhand", "uttar pradesh", "rajasthan", "gujarat", "punjab", "haryana", "maharashtra", "kerala", "karnataka", "tamil nadu", "telangana", "andhra", "odisha", "assam", "bengal", "himachal", "uttarakhand", "chhattisgarh", "madhya pradesh"],
};

const KEYWORD_RES: [string, RegExp][] = Object.entries(CATEGORY_KEYWORDS).map(([slug, words]) => [slug, new RegExp(`\\b(?:${words.join("|")})`, "i")]);
// Domains run words together ("avemtravel"), so longer open-ended keywords may also match mid-word there.
const DOMAIN_RES: [string, RegExp][] = Object.entries(CATEGORY_KEYWORDS).map(([slug, words]) => {
  const loose = words.filter((w) => w.length >= 5 && !w.includes("\\b") && !w.includes(" "));
  return [slug, new RegExp(`\\b(?:${words.join("|")})${loose.length ? `|${loose.join("|")}` : ""}`, "i")];
});

// Name/domain words that make a site with no other match look like a news site.
export const NEWS_FALLBACK = /(news|times|express|samachar|khabar|live|post|today|herald|chronicle|daily|mirror|tribune|reporter|samay|bhaskar|patrika|jagran|dainik|gazette|journal|observer|bulletin)/i;

// Languages that make a site "Regional" on their own (not English or Hindi).
const REGIONAL_LANGUAGES = new Set(["Gujarati", "Marathi", "Punjabi", "Tamil", "Bengali", "Kannada", "Malayalam", "Telugu", "Odia"]);

const SECTION_CATEGORY: Record<string, string> = { Casino: "gaming-casino", Crypto: "crypto", Health: "health" };

export interface CategorySource {
  name: string;
  domain: string;
  languages: string[];
  topics: string[];
  variants: { niche: string; section: string }[];
}

const toSlug = (v: string) => {
  if (!v) return "";
  const hit = CATEGORIES.find((c) => c.slug === v || c.label.toLowerCase() === v.toLowerCase());
  return hit ? hit.slug : "";
};

export function siteCategories(site: CategorySource): string[] {
  const fromTopics = new Set((site.topics || []).map(toSlug).filter(Boolean));
  if (fromTopics.size) return CATEGORIES.map((c) => c.slug).filter((s) => fromTopics.has(s));
  const found = new Set<string>();
  site.variants.forEach((v) => {
    if (SECTION_CATEGORY[v.section]) found.add(SECTION_CATEGORY[v.section]);
  });
  const niche = site.variants.map((v) => v.niche).join(" | ");
  const nameText = `${site.name} ${site.domain.replace(/[.-]/g, " ")}`;
  KEYWORD_RES.forEach(([slug, re], i) => {
    if (re.test(niche)) found.add(slug);
    // name/domain: news words only count as a fallback (below), other keywords count directly
    else if (slug !== "news-media" && DOMAIN_RES[i][1].test(nameText)) found.add(slug);
  });
  if (site.languages.some((l) => REGIONAL_LANGUAGES.has(l))) found.add("regional");
  if (!found.size && NEWS_FALLBACK.test(nameText)) found.add("news-media");
  return CATEGORIES.map((c) => c.slug).filter((s) => found.has(s));
}
