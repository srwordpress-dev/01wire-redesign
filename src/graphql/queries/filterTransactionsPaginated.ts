import { gql } from "@apollo/client";

import { PaginationInput, TransactionData } from "types";

export interface TransactionFilterInput {
  status: string;
  type: string;
  kind: string;
  startTime: string;
  endTime: string;
}

export interface IGetTransactionsVars {
  paginationInput: PaginationInput;
  filterInput: TransactionFilterInput;
}

export interface IGetTransactions {
  filterTransactionsPaginated: TransactionData;
}

export const GET_TRANSACTIONS = gql`
  query filterTransactionsPaginated(
    $paginationInput: PaginationInput!
    $filterInput: TransactionFilterInput!
  ) {
    filterTransactionsPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        userId
        status
        type
        kind
        amount
        createdAt
        updatedAt
        notes
      }
      paginationInfo {
        currentPage
        perPage
        pageCount
        itemCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
