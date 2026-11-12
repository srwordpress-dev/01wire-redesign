import { gql } from "@apollo/client";

// Admin "Offline Orders": orders taken outside the dashboard (monthly sheet import)
export interface IOfflineOrder {
  id: string;
  orderDate: string;
  customerGroup: string;
  articleLink: string | null;
  articleNote: string | null;
  orderType: string | null;
  amountPaid: number;
  item: string;
  matchedPublicationId: string | null;
  customerPaymentStatus: string;
  status: "DELIVERED" | "NOT_DELIVERED" | string;
  deliveredAt: string | null;
  liveLink: string | null;
  liveLinks: string[];
  liveNote: string | null;
  vendor: string | null;
  vendorCost: number;
  margin: number;
  vendorPaymentStatus: "PAID" | "UNPAID" | string;
  vendorOrderStatus: string | null;
  vendorPaymentNote: string | null;
  notes: string | null;
  importBatch: string;
  sourceRow: number | null;
  isTest: boolean;
}
export interface IOfflineTotals {
  count: number;
  delivered: number;
  notDelivered: number;
  paid: number;
  vendorCost: number;
  margin: number;
  owedToVendors: number;
  owedCount: number;
}
export interface IOfflineOrders {
  offlineOrders: { data: IOfflineOrder[]; totals: IOfflineTotals; vendors: string[]; groups: string[] };
}
export interface IOfflineImportResult {
  dryRun: boolean;
  importBatch: string;
  rowsRead: number;
  toAdd: number;
  alreadyImported: number;
  errors: { row: number; reason: string }[];
  warnings: { row: number; reason: string }[];
  months: { month: string; count: number; paid: number; vendorCost: number }[];
  paid: number;
  vendorCost: number;
}

const ORDER = `
  id orderDate customerGroup articleLink articleNote orderType amountPaid item matchedPublicationId
  customerPaymentStatus status deliveredAt liveLink liveLinks liveNote vendor vendorCost margin
  vendorPaymentStatus vendorOrderStatus vendorPaymentNote notes importBatch sourceRow isTest
`;

export const OFFLINE_ORDERS = gql`
  query offlineOrders($filterInput: OfflineOrdersFilterInput!) {
    offlineOrders(filterInput: $filterInput) {
      data { ${ORDER} }
      totals { count delivered notDelivered paid vendorCost margin owedToVendors owedCount }
      vendors
      groups
    }
  }
`;

export const IMPORT_OFFLINE_ORDERS = gql`
  mutation importOfflineOrders($fileBase64: String!, $dryRun: Boolean!, $importBatch: String) {
    importOfflineOrders(fileBase64: $fileBase64, dryRun: $dryRun, importBatch: $importBatch) {
      dryRun importBatch rowsRead toAdd alreadyImported
      errors { row reason }
      warnings { row reason }
      months { month count paid vendorCost }
      paid vendorCost
    }
  }
`;

export const UPDATE_OFFLINE_ORDER = gql`
  mutation updateOfflineOrder($params: OfflineOrderUpdateInput!) {
    updateOfflineOrder(params: $params) { ${ORDER} }
  }
`;

export const CREATE_OFFLINE_ORDER = gql`
  mutation createOfflineOrder($params: OfflineOrderCreateInput!) {
    createOfflineOrder(params: $params) { ${ORDER} }
  }
`;

export const DELETE_OFFLINE_ORDER = gql`
  mutation deleteOfflineOrder($id: String!) {
    deleteOfflineOrder(id: $id)
  }
`;

export const UNDO_OFFLINE_IMPORT = gql`
  mutation undoOfflineImport($importBatch: String!) {
    undoOfflineImport(importBatch: $importBatch)
  }
`;
