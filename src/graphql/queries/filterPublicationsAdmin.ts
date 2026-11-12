import { gql } from "@apollo/client";

import { PaginationInfo, PaginationInput } from "types";

// Admin Publications page. Kept separate from filterPublicationsPaginated (used by the
// customer flows) so the admin-only fields never ride along there.
export interface AdminPublication {
  id: string;
  title: string;
  image?: string | null;
  stats?: { da?: number; pa?: number; dr?: number; ur?: number; traffic?: number };
  categories?: string[];
  visibility: string;
  linkType?: string | null;
  url?: string | null;
  timeline?: string | null;
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
  vendorPriceInr?: number | null;
  markupPercent?: number | null;
  gstPercent?: number | null;
  sourceVendor?: string | null;
  internalNotes?: string | null;
  importBatch?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPublicationFilterInput {
  search?: string;
  title?: string;
  visibility?: string[];
  section?: string;
  language?: string;
  priceMin?: number;
  priceMax?: number;
  importBatch?: string;
  filterIds?: string[];
}

export interface IFilterPublicationsAdminVars {
  paginationInput: PaginationInput;
  filterInput: AdminPublicationFilterInput;
}

export interface IFilterPublicationsAdmin {
  filterPublicationsPaginated: { data: AdminPublication[]; paginationInfo: PaginationInfo };
}

export const ADMIN_PUBLICATION_FIELDS = gql`
  fragment AdminPublicationFields on PublicationType {
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
    categories
    visibility
    linkType
    url
    timeline
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
    vendorPriceInr
    markupPercent
    gstPercent
    sourceVendor
    internalNotes
    importBatch
    createdAt
    updatedAt
  }
`;

export const FILTER_PUBLICATIONS_ADMIN = gql`
  ${ADMIN_PUBLICATION_FIELDS}
  query filterPublicationsAdmin(
    $paginationInput: PaginationInput!
    $filterInput: PublicationFilterInput!
  ) {
    filterPublicationsPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        ...AdminPublicationFields
      }
      paginationInfo {
        currentPage
        perPage
        pageCount
        itemCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export interface IGetPublicationAdmin {
  getPublicationById: AdminPublication | null;
}

export const GET_PUBLICATION_ADMIN = gql`
  ${ADMIN_PUBLICATION_FIELDS}
  query getPublicationAdmin($id: String!) {
    getPublicationById(id: $id) {
      ...AdminPublicationFields
    }
  }
`;
