import { gql } from "@apollo/client";
import { PaginationInput, OrderData } from "types";

export interface OrderFilterInput {
  id?: string;
  userId?: string;
  articleId?: string;
  publicationId?: string;
  bundleId?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface IGetOrdersVars {
  paginationInput: PaginationInput;
  filterInput: OrderFilterInput;
}

export interface IGetOrders {
  filterOrdersPaginated: OrderData;
}

export const GET_ORDERS = gql`
  query filterOrdersPaginated($paginationInput: PaginationInput!, $filterInput: OrderFilterInput!) {
    filterOrdersPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        prId
        userId
        articleId
        publicationId
        bundleId
        status
        notes
        publishAt
        publishBy
        createdAt
        updatedAt
        url
        user {
          email
        }
        articleInfo {
          id
          title
          userId
          mediaContact {
            email
          }
        }
        bundleInfo {
          id
          type
          category
          name
          tier
          coverage
          vendor
          vendorPackageName
          media {
            name
          }
        }
        publicationInfo {
          id
          title
          url
          image
          stats {
            traffic
          }
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
