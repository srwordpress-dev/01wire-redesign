import { gql } from "@apollo/client";

// One published offering. Offerings of the same website share a `domain`;
// legacy publications have no domain and stand alone. `price` is in credits,
// markup and GST included.
export interface MarketplaceListing {
  id: string;
  title: string;
  image?: string | null;
  stats?: {
    da?: number | null;
    pa?: number | null;
    dr?: number | null;
    ur?: number | null;
    traffic?: number | null;
  } | null;
  linkType?: "DO_FOLLOW" | "NO_FOLLOW" | null;
  url?: string | null;
  price: number;
  domain?: string | null;
  variantLabel?: string | null;
  description?: string | null;
  topics?: string[] | null;
  sampleUrl?: string | null;
  tat?: string | null;
  indexed?: string | null;
  backlinks?: string | null;
  language?: string | null;
  tier?: string | null;
  section?: string | null;
  validity?: string | null;
  niche?: string | null;
  wordsAllowed?: string | null;
  disclaimer?: string | null;
}

export interface IMarketplaceListings {
  marketplaceListings: MarketplaceListing[];
}

export const MARKETPLACE_LISTINGS = gql`
  query marketplaceListings {
    marketplaceListings {
      id
      title
      image
      stats {
        da
        pa
        dr
        ur
        traffic
      }
      linkType
      url
      price
      domain
      variantLabel
      description
      topics
      sampleUrl
      tat
      indexed
      backlinks
      language
      tier
      section
      validity
      niche
      wordsAllowed
      disclaimer
    }
  }
`;
