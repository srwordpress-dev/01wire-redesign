import { gql } from "@apollo/client";

import { Client } from "types";

export interface IGetClientByIdVars {
  id: string;
}
export interface IGetClientById {
  getClientById: Client;
}

export const GET_CLIENT_BY_ID = gql`
  query getClientById($id: String!) {
    getClientById(id: $id) {
      id
      userId
      title
      type
      category
      email
      website
      notes
      ticker
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
  }
`;
