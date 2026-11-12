import { gql } from "@apollo/client";

export interface IUpdateBundleVisVars {
  id: string;
  visibility: string;
}

export const UPDATE_BUNDLE_VISIBILITY = gql`
  mutation updateBundleVisibility($id: String!,$ visibility: VisibilityEnum!) {
    updateBundleVisibility(id: $id, visibility: $visibility) {
      id
    }
  }
`;
