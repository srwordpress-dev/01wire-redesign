import { gql } from "@apollo/client";

export interface WalletType {
  id: string;
  userId: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGetUserWallet {
  getUserWallet: WalletType;
}

export const GET_USER_WALLET = gql`
  query getUserWallet {
    getUserWallet {
      id
      userId
      balance
      createdAt
      updatedAt
    }
  }
`;
