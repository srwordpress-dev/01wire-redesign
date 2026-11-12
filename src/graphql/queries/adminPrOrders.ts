import { gql } from "@apollo/client";

// Admin "PR Orders": one row per PR with customer, client, sites, payment and progress
export interface IAdminPrItem {
  orderId: string | null;
  name: string;
  type: "Publication" | "Package" | string;
  status: "PENDING" | "PUBLISHED" | "REJECTED" | null;
  publishBy: string | null;
  url: string | null;
  notes: string | null;
  credits: number | null;
  refundedCredits: number;
  overdue: boolean;
}
export interface IAdminPrRow {
  articleId: string;
  prId: number;
  title: string;
  status: string;
  notes: string | null;
  changeRequests?: { at: string | null; changes: string[]; note: string | null }[] | null;
  createdAt: string;
  updatedAt: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  clientName: string | null;
  items: IAdminPrItem[];
  payment: {
    method: "CREDITS" | "RAZORPAY" | "SHOPIFY" | "UNPAID" | string;
    credits: number | null;
    amount: number | null;
    gatewayRef: string | null;
    test: boolean;
    paidAt: string | null;
    issue: string | null;
    refundedCredits: number;
  };
  liveCount: number;
  pendingCount: number;
  rejectedCount: number;
  overdueCount: number;
  totalCount: number;
  nextStep: "UNPAID" | "REVIEW" | "WAITING_CUSTOMER" | "PUBLISH_SITES" | "CLOSE_PR" | "REJECT_PR" | "DONE" | string;
}
export interface IAdminPrCounts {
  toReview: number;
  waitingOnCustomer: number;
  inProgress: number;
  published: number;
  rejected: number;
  drafts: number;
  all: number;
}
export interface IAdminPrOrders {
  adminPrOrders: {
    data: IAdminPrRow[];
    paginationInfo: { currentPage: number; perPage: number; itemCount: number; pageCount: number; hasNextPage: boolean };
    counts: IAdminPrCounts;
  };
}

const ROW = `
  articleId prId title status notes createdAt updatedAt
  changeRequests { at changes note }
  customerId customerName customerEmail clientName
  items { orderId name type status publishBy url notes credits refundedCredits overdue }
  payment { method credits amount gatewayRef test paidAt issue refundedCredits }
  liveCount pendingCount rejectedCount overdueCount totalCount nextStep
`;

export const ADMIN_PR_ORDERS = gql`
  query adminPrOrders($paginationInput: PaginationInput!, $filterInput: AdminPrFilterInput) {
    adminPrOrders(paginationInput: $paginationInput, filterInput: $filterInput) {
      data { ${ROW} }
      paginationInfo { currentPage perPage itemCount pageCount hasNextPage }
      counts { toReview waitingOnCustomer inProgress published rejected drafts all }
    }
  }
`;

export const ADMIN_PR_ORDER = gql`
  query adminPrOrder($articleId: String!) {
    adminPrOrder(articleId: $articleId) { ${ROW} }
  }
`;
