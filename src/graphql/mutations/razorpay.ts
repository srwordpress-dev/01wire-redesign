import { gql } from "@apollo/client";

export interface IPaymentMethods {
  paymentMethods: {
    razorpay: boolean;
    shopify: boolean;
    razorpayTest: boolean;
    shopifyTest: boolean;
    creditPacks: boolean;
    inrPerCredit: number;
  };
}
export const PAYMENT_METHODS = gql`
  query paymentMethods {
    paymentMethods {
      razorpay
      shopify
      razorpayTest
      shopifyTest
      creditPacks
      inrPerCredit
    }
  }
`;

export interface IRazorpayOrder {
  keyId: string;
  orderId: string;
  amount: number; // paise
  currency: string;
  credits: number;
  prId?: number;
}
export interface ICreateRazorpayOrder {
  createRazorpayOrder: IRazorpayOrder;
}
export const CREATE_RAZORPAY_ORDER = gql`
  mutation createRazorpayOrder($articleId: String!) {
    createRazorpayOrder(articleId: $articleId) {
      keyId
      orderId
      amount
      currency
      credits
      prId
    }
  }
`;

export interface IPaymentResult {
  status: "PAID" | "PENDING";
  submitted: boolean;
  message?: string;
}
export interface IVerifyRazorpayPayment {
  verifyRazorpayPayment: IPaymentResult;
}
export const VERIFY_RAZORPAY_PAYMENT = gql`
  mutation verifyRazorpayPayment($params: RazorpayVerifyInput!) {
    verifyRazorpayPayment(params: $params) {
      status
      submitted
      message
    }
  }
`;

// Shopify checkout: the server makes a Shopify draft order for the full PR amount and
// returns its checkout link; the page then asks the server whether it is paid.
export interface IShopifyCheckout {
  checkoutUrl: string;
  amount: number; // paise
  currency: string;
  credits: number;
  prId?: number;
}
export interface ICreateShopifyCheckout {
  createShopifyCheckout: IShopifyCheckout;
}
export const CREATE_SHOPIFY_CHECKOUT = gql`
  mutation createShopifyCheckout($articleId: String!) {
    createShopifyCheckout(articleId: $articleId) {
      checkoutUrl
      amount
      currency
      credits
      prId
    }
  }
`;
export interface ICheckShopifyPayment {
  checkShopifyPayment: { status: "PAID" | "PENDING"; submitted: boolean; message?: string };
}
export const CHECK_SHOPIFY_PAYMENT = gql`
  mutation checkShopifyPayment($articleId: String!) {
    checkShopifyPayment(articleId: $articleId) {
      status
      submitted
      message
    }
  }
`;
