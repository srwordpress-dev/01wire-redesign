import { gql } from "@apollo/client";

export interface IDeleteClientVars {
  id: string;
}

export const DELETE_CLIENT = gql`
  mutation deleteClient($id: String!) {
    deleteClient(id: $id)
  }
`;
