import { gql } from "@apollo/client";

import { PublicationSettings } from "graphql/queries/getPublicationSettings";

export interface IUpdatePublicationSettingsVars {
  params: { markupPercent?: number; gstPercent?: number; usdInrRate?: number };
}

export interface IUpdatePublicationSettings {
  updatePublicationSettings: PublicationSettings;
}

// Saving re-prices every publication that has a vendor price
export const UPDATE_PUBLICATION_SETTINGS = gql`
  mutation updatePublicationSettings($params: PublicationSettingsInput!) {
    updatePublicationSettings(params: $params) {
      markupPercent
      gstPercent
      usdInrRate
      updatedAt
    }
  }
`;
