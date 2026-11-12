import { gql } from "@apollo/client";

import { PaginationInput, ClientData } from "types";

export interface ClientFilterInput {
  title?: string;
  type?: string;
  categories?: string[];
}

export interface IGetClientsVars {
  paginationInput: PaginationInput;
  filterInput: ClientFilterInput;
}

export interface IGetClients {
  filterClientsPaginated: ClientData;
}

export const GET_CLIENTS = gql`
  query filterClientsPaginated(
    $paginationInput: PaginationInput!
    $filterInput: ClientFilterInput!
  ) {
    filterClientsPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        userId
        title
        type
        category
        email
        website
        ticker
        notes
        logo
        social {
          facebook
          instagram
          linkedIn
          twitter
          youtube
          others
        }
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
