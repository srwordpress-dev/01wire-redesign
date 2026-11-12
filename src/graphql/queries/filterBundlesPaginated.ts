import { gql } from "@apollo/client";

import { PaginationInput, BundleData } from "types";

export interface IGetBundlesVars {
  paginationInput: PaginationInput;
}

export interface IGetBundles {
  filterBundlesPaginated: BundleData;
}

export const GET_BUNDLES = gql`
  query filterBundlesPaginated($paginationInput: PaginationInput!) {
    filterBundlesPaginated(paginationInput: $paginationInput) {
      data {
        id
        publicationIds
        image
        description
        type
        category
        traffic
        price
        image
        visibility
        name
        tier
        packageType
        media {
          name
          image
        }
        coverage
        contentRule
        backlinks
        disclaimer
        sampleUrls
        language
        tat
        featured
        featuredRank
        vendor
        vendorPackageName
        vendorPriceInr
        markupPercent
        internalNotes
        source
        createdAt
        updatedAt
        publicationInfo {
          id
          title
          domain
          image
          stats {
            da
            pa
            dr
            ur
            traffic
          }
          categories
          linkType
          url
          timeline
          price
          createdAt
          updatedAt
        }
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
