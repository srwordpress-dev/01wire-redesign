import { gql } from "@apollo/client";

export interface PublicationSettings {
  markupPercent: number;
  gstPercent: number;
  usdInrRate: number;
  updatedAt?: string | null;
}

export interface IGetPublicationSettings {
  getPublicationSettings: PublicationSettings;
}

export const GET_PUBLICATION_SETTINGS = gql`
  query getPublicationSettings {
    getPublicationSettings {
      markupPercent
      gstPercent
      usdInrRate
      updatedAt
    }
  }
`;
