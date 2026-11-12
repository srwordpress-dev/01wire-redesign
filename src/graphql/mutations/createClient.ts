import { gql } from "@apollo/client";

export interface ClientCreateInput {
  title: string;
  type: string;
  category: string[];
  email: string;
  website: string;
  ticker: string;
  logo: string;
  notes: string;
  social: {
    facebook: string;
    instagram: string;
    linkedIn: string;
    twitter: string;
    youtube: string;
    others: string;
  };
}
export interface ICreateClientVars {
  params: ClientCreateInput;
}
export const CREATE_CLIENT = gql`
  mutation createClient($params: ClientCreateInput!) {
    createClient(params: $params) {
      id
      title
      type
      email
    }
  }
`;
