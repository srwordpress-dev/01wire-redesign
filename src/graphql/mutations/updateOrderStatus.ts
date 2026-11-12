import { gql } from "@apollo/client";

export interface OrderUpdateStatusInput {
  id: string;
  status: string;
  notes?: string;
  url?: string;
}
export interface IUpdateOrderStatusVars {
  params: OrderUpdateStatusInput;
}
export const UPDATE_ORDER_STATUS = gql`
  mutation updateOrderStatus($params: OrderUpdateStatusInput!) {
    updateOrderStatus(params: $params)
  }
`;
