import { gql } from "@apollo/client";

import { Bundle } from "types";

export interface IGetBundleByIdVars {
  [x: string]: any;
  id: string;
}
export interface IGetBundleById {
  getBundleById: Bundle;
}

export const GET_BUNDLE_BY_ID = gql`
  query getBundleById($id: String!) {
    getBundleById(id: $id) {
      id
      publicationIds
      image
      description
      type
      category
      traffic
      price
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
  }
`;
