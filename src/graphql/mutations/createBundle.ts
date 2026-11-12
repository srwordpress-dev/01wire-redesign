import { gql } from "@apollo/client";

export interface BundleCreateInput {
  price: number;
  image: string;
  description: string;
  category: string;
  type: string;
  publicationIds: [string];
}
export interface ICreateBundleVars {
  params: BundleCreateInput;
}
export const CREATE_BUNDLE = gql`
  mutation createBundle($params: BundleCreateInput!) {
    createBundle(params: $params) {
      id
    }
  }
`;
