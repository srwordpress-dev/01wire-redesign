import { gql } from "@apollo/client";

import { Publication } from "types";

export interface IGetPublicationByIdVars {
  [x: string]: any;
  id: string;
}
export interface IGetPublicationById {
  getPublicationById: Publication;
}

export const GET_PUBLICATION_BY_ID = gql`
  query getPublicationById($id: String!) {
    getPublicationById(id: $id) {
      id
      title
      image
      categories
      linkType
      url
      timeline
      price
      stats {
        da
        pa
        dr
        ur
        traffic
      }
      createdAt
      updatedAt
    }
  }
`;
