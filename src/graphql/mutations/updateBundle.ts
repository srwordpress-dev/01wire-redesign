import { gql } from "@apollo/client";

export interface BundleUpdateInput {
  id: string;
  image: string;
  description: string;
  type: string;
  category: string;
  publicationIds: [string];
  price: number;
}
export interface IUpdateBundleVars {
  params: BundleUpdateInput;
}
export const UPDATE_BUNDLE = gql`
  mutation updateBundle($params: BundleUpdateInput!) {
    updateBundle(params: $params) {
      id
    }
  }
`;
