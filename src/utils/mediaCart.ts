import { gql } from "@apollo/client";

// Media picked in the Marketplace, kept in this browser per user until it is paid for.
// A copy goes to the server (saveCart) so a reminder email can be sent if nothing is bought.
export interface MediaCart {
  bundles: any[];
  publications: any[];
}

const userKey = (): string => {
  try {
    const token = localStorage.getItem("token") || "";
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return `mediaCart:${payload?.userId || "guest"}`;
  } catch {
    return "mediaCart:guest";
  }
};

export const getCart = (): MediaCart | null => {
  try {
    const cart = JSON.parse(localStorage.getItem(userKey()) || "null");
    if (!cart?.bundles?.length && !cart?.publications?.length) return null;
    return { bundles: cart.bundles || [], publications: cart.publications || [] };
  } catch {
    return null;
  }
};

const SAVE_CART = gql`
  mutation SaveCart($publicationIds: [String!], $bundleIds: [String!]) {
    saveCart(publicationIds: $publicationIds, bundleIds: $bundleIds)
  }
`;
let lastSent = "";
let syncTimer: ReturnType<typeof setTimeout> | null = null;

// Debounced; only sends when the ids change. Errors are ignored (reminders are a nice-to-have).
const syncCart = (bundles: any[], publications: any[]): void => {
  const ids = (list: any[]) => (list || []).map((x) => x?.id).filter(Boolean);
  const payload = { publicationIds: ids(publications), bundleIds: ids(bundles) };
  const key = userKey() + JSON.stringify(payload);
  if (key === lastSent) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      if (!localStorage.getItem("token")) return;
      const { client } = await import("providers/apollo-client");
      await client.mutate({ mutation: SAVE_CART, variables: payload });
      lastSent = key;
    } catch {
      // not logged in as a user, offline, or an admin account: no reminder copy
    }
  }, 1500);
};

export const saveCart = (bundles: any[] = [], publications: any[] = []): void => {
  syncCart(bundles, publications);
  try {
    if (!bundles.length && !publications.length) {
      localStorage.removeItem(userKey());
      return;
    }
    localStorage.setItem(userKey(), JSON.stringify({ bundles, publications }));
  } catch {
    // storage blocked or full: the selection still lives in the page
  }
};

export const clearCart = (): void => {
  syncCart([], []);
  try {
    localStorage.removeItem(userKey());
  } catch {
    // nothing to clear
  }
};
