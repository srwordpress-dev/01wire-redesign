import { gql, useQuery } from "@apollo/client";

// Friendly breadcrumb label for a record page, e.g. /releases/<id> → "PR #50".
// Returns "" when the URL is not a record page (or while it loads).

export const CRUMB_ARTICLE = gql`
  query crumbArticle($id: String!) {
    getArticleById(id: $id) {
      id
      prId
    }
  }
`;
const PUBLICATION = gql`
  query crumbPublication($id: String!) {
    getPublicationById(id: $id) {
      id
      domain
      title
    }
  }
`;
const BUNDLE = gql`
  query crumbBundle($id: String!) {
    getBundleById(id: $id) {
      id
      name
    }
  }
`;
const CLIENT = gql`
  query crumbClient($id: String!) {
    getClientById(id: $id) {
      id
      title
    }
  }
`;

const KIND: Record<string, "article" | "publication" | "bundle" | "client"> = {
  releases: "article",
  "pr-management": "article",
  "pr-orders": "article",
  publications: "publication",
  bundles: "bundle",
  clients: "client",
};

export default function useRecordCrumb(route: string[]): string {
  const kind = route.length >= 2 ? KIND[route[0]] : undefined;
  const id = kind ? route[1] : "";
  const opts = (k: string) => ({ variables: { id }, skip: kind !== k || !id, fetchPolicy: "cache-first" as const });
  const article = useQuery(CRUMB_ARTICLE, opts("article"));
  const publication = useQuery(PUBLICATION, opts("publication"));
  const bundle = useQuery(BUNDLE, opts("bundle"));
  const client = useQuery(CLIENT, opts("client"));

  if (!kind || !id) return "";
  const q = { article, publication, bundle, client }[kind];
  if (q.loading) return "";
  const d = q.data && (Object.values(q.data)[0] as any);
  if (!d) return "Not found";
  if (kind === "article") return d.prId ? `PR #${d.prId}` : "Press release";
  if (kind === "publication") return d.domain || d.title || "Publication";
  if (kind === "bundle") return d.name || "Package";
  return d.title || "Client";
}
