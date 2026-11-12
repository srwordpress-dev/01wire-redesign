import { gql } from "@apollo/client";

export type PublicationBulkAction = "PUBLISH" | "SUPPRESS" | "DELETE" | "SET_MARKUP";

export interface IBulkUpdatePublicationsVars {
  params: {
    ids: string[];
    action: PublicationBulkAction;
    // SET_MARKUP only; null clears the override (back to the default markup)
    markupPercent?: number | null;
  };
}

export interface IBulkUpdatePublications {
  bulkUpdatePublications: { matched: number; changed: number };
}

export const BULK_UPDATE_PUBLICATIONS = gql`
  mutation bulkUpdatePublications($params: PublicationBulkInput!) {
    bulkUpdatePublications(params: $params) {
      matched
      changed
    }
  }
`;
