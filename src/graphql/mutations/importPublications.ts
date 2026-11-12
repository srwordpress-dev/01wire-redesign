import { gql } from "@apollo/client";

export interface PublicationImportRow {
  title: string;
  domain: string;
  variantLabel?: string | null;
  image?: string | null;
  description?: string | null;
  topics?: string[] | null;
  sampleUrl?: string | null;
  tat?: string | null;
  indexed?: string | null;
  backlinks?: string | null;
  language?: string | null;
  tier?: string | null;
  section?: string | null;
  validity?: string | null;
  niche?: string | null;
  wordsAllowed?: string | null;
  disclaimer?: string | null;
  linkType?: "DO_FOLLOW" | "NO_FOLLOW" | null;
  da?: number | null;
  dr?: number | null;
  vendorPriceInr: number;
  sourceVendor?: string | null;
  internalNotes?: string | null;
  visibility?: string | null;
}

export interface IImportPublicationsVars {
  params: { rows: PublicationImportRow[]; dryRun: boolean; importBatch?: string | null };
}

export interface PublicationImportResult {
  dryRun: boolean;
  added: number;
  updated: number;
  unchanged: number;
  skipped: { row: number; domain?: string | null; reason: string }[];
}

export interface IImportPublications {
  importPublications: PublicationImportResult;
}

export const IMPORT_PUBLICATIONS = gql`
  mutation importPublications($params: PublicationImportInput!) {
    importPublications(params: $params) {
      dryRun
      added
      updated
      unchanged
      skipped {
        row
        domain
        reason
      }
    }
  }
`;
