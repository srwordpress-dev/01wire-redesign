import { gql } from "@apollo/client";

import { PaginationInput, PublicationData } from "types";

export interface PublicationFilterInput {
  filterIds?: string[];
}
export interface IGetPublicationsVars {
  paginationInput: PaginationInput;
  filterInput: PublicationFilterInput;
}

export interface IGetPublications {
  filterPublicationsPaginated: PublicationData;
}

export const GET_PUBLICATIONS = gql`
  query filterPublicationsPaginated(
    $paginationInput: PaginationInput!
    $filterInput: PublicationFilterInput!
  ) {
    filterPublicationsPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
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
        createdAt
        updatedAt
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
