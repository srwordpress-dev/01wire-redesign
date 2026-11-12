import { gql } from "@apollo/client";
export interface WalletBalanceUpdateInput {
  amount: number;
  notes: string;
  userId: string;
}
export const UPDATE_WALLET_BALANCE = gql`
  mutation updateWalletBalance($params: WalletBalanceUpdateInput!) {
    updateWalletBalance(params: $params)
  }
`;
