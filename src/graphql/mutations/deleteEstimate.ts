import { gql } from "@apollo/client";

export interface IDeleteEstimateVars {
  id: string;
}

export const DELETE_ESTIMATE = gql`
  mutation deleteEstimate($id: String!) {
    deleteEstimate(id: $id)
  }
`;
