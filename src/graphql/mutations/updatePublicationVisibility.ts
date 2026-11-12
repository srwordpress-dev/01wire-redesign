import { gql } from "@apollo/client";

export interface IUpdatePublicationVisVars {
  id: string;
  visibility: string;
}

export const UPDATE_PUBLICATION_VISIBILITY = gql`
  mutation updatePublicationVisibility($id: String!,$ visibility: VisibilityEnum!) {
    updatePublicationVisibility(id: $id, visibility: $visibility) {
      id
    }
  }
`;
