import { gql } from "@apollo/client";

// Gateway payments (Razorpay / Shopify) as admins see them
export interface IPaymentRecord {
  id: string;
  provider: string; // RAZORPAY | SHOPIFY
  status: string; // PENDING | PAID | CANCELLED
  prId?: number;
  articleId: string;
  userId: string;
  credits: number;
  amount: number; // paise
  currency: string;
  gatewayRef?: string; // e.g. Shopify order "#1008"
  gatewayPaymentId?: string;
  test: boolean;
  refundedAmount: number; // paise
  reversedCredits: number;
  submitError?: string;
  issue?: string;
  issueAt?: string;
  paidAt?: string;
  createdAt?: string;
}

const FIELDS = `
  id provider status prId articleId userId credits amount currency gatewayRef gatewayPaymentId
  test refundedAmount reversedCredits submitError issue issueAt paidAt createdAt
`;

export const ARTICLE_PAYMENTS = gql`
  query articlePayments($articleId: String!) {
    articlePayments(articleId: $articleId) { ${FIELDS} }
  }
`;
export interface IArticlePayments {
  articlePayments: IPaymentRecord[];
}

export const PAYMENTS_NEEDING_REVIEW = gql`
  query paymentsNeedingReview {
    paymentsNeedingReview { ${FIELDS} }
  }
`;
export interface IPaymentsNeedingReview {
  paymentsNeedingReview: IPaymentRecord[];
}

export const MARK_PAYMENT_REVIEWED = gql`
  mutation markPaymentReviewed($id: ID!) {
    markPaymentReviewed(id: $id)
  }
`;

export const providerName = (p: string) => (p === "SHOPIFY" ? "Shopify" : p === "RAZORPAY" ? "Razorpay" : p);
// "Shopify order #1012" / "Razorpay payment pay_Tw5..."
export const gatewayLabel = (p: { provider: string; gatewayRef?: string }) =>
  `${providerName(p.provider)}${p.gatewayRef ? ` ${p.provider === "SHOPIFY" ? "order" : "payment"} ${p.gatewayRef}` : ""}`;
export const inrFromPaise = (paise: number) =>
  `₹${(Number(paise || 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
