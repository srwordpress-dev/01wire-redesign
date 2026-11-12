import { gql } from "@apollo/client";

import { EstimateType } from "types";

export interface IGetEstimateByIdVars {
  [x: string]: any;
  id: string;
}

export interface IGetEstimateById {
  getEstimateById: EstimateType;
}

export const GET_ESTIMATE_BY_ID = gql`
  query getEstimateById($id: String!) {
    getEstimateById(id: $id) {
      id
      userId
      title
      publicationIds
      bundleIds
      totalCredits
      traffic
      createdAt
      updatedAt
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
        categories
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
  }
`;
