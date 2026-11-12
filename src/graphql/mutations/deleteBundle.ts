import { gql } from "@apollo/client";

export interface IDeleteBundleVars {
  id: string;
}

export const DELETE_BUNDLE = gql`
  mutation deleteBundle($id: String!) {
    deleteBundle(id: $id)
  }
`;
