import { gql } from "@apollo/client";

export interface ClientUpdateInput {
  id: string;
  title: string;
  type: string;
  category: string;
  email: string;
  website: string;
  ticker: string;
  logo: string;
  notes: string;
}
export interface IUpdateClientVars {
  params: ClientUpdateInput;
}
export const UPDATE_CLIENT = gql`
  mutation updateClient($params: ClientUpdateInput!) {
    updateClient(params: $params) {
      id
    }
  }
`;
