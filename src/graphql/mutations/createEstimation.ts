import { gql } from "@apollo/client";

export interface EstimateCreateInput {
  bundleIds: string[];
  publicationIds: string[];
  title: string;
}
export interface ICreateEstimateVars {
  params: EstimateCreateInput;
}
export const CREATE_ESTIMATE = gql`
  mutation createEstimate($params: EstimateCreateInput!) {
    createEstimate(params: $params) {
      id
      userId
    }
  }
`;
