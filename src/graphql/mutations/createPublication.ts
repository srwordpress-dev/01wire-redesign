import { gql } from "@apollo/client";

export interface PublicationCreateInput {
  title: string;
  image?: string | null;
  categories: string[];
  linkType?: string | null;
  url?: string | null;
  timeline?: string | null;
  price?: number | null;
  stats: {
    da?: number;
    pa?: number;
    dr?: number;
    ur?: number;
    traffic?: number;
  };
  // Marketplace listing + admin pricing fields (all optional)
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
  vendorPriceInr?: number | null;
  markupPercent?: number | null;
  gstPercent?: number | null;
  sourceVendor?: string | null;
  internalNotes?: string | null;
}
export interface ICreatePublicationVars {
  params: PublicationCreateInput;
}
export const CREATE_PUBLICATION = gql`
  mutation createPublication($params: PublicationCreateInput!) {
    createPublication(params: $params) {
      id
      title
      image
    }
  }
`;
