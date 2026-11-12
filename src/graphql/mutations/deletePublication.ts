import { gql } from "@apollo/client";

export interface IDeletePublicationVars {
  id: string;
}

export const DELETE_PUBLICATION = gql`
  mutation deletePublication($id: String!) {
    deletePublication(id: $id)
  }
`;
