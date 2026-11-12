import { gql } from "@apollo/client";

import { PaginationInput, EstimateData } from "types";

export interface EstimateFilterInput {
  id?: string;
  userId?: string;
  publicationIds?: string[];
  bundleIds?: string[];
  totalCredits?: number;
  startTime?: string;
  endTime?: string;
}

export interface IGetEstimatesVars {
  paginationInput: PaginationInput;
  filterInput: EstimateFilterInput;
}

export interface IGetEstimates {
  filterEstimatesPaginated: EstimateData;
}

export const GET_ESTIMATES = gql`
  query filterEstimatesPaginated(
    $paginationInput: PaginationInput!
    $filterInput: EstimateFilterInput!
  ) {
    filterEstimatesPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        title
        userId
        publicationIds
        bundleIds
        totalCredits
        createdAt
        updatedAt
        traffic
        bundleInfo {
          id
          publicationIds
          image
          description
          type
          category
          traffic
          price
          createdAt
          updatedAt
          publicationInfo {
            id
            stats {
              da
              pa
              dr
              ur
              traffic
            }
            title
            categories
            linkType
            url
            image
            timeline
            price
            createdAt
            updatedAt
          }
        }
        publicationInfo {
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
          price
          linkType
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
