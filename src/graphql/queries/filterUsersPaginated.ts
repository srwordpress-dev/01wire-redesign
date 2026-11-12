import { gql } from "@apollo/client";

import { PaginationInput, UsersData } from "types";

export interface UserFilterInput {
  fullName?: string;
  email?: string;
  startTime?: string;
  endTime?: string;
}

export interface IGetUsersVars {
  paginationInput: PaginationInput;
  filterInput: UserFilterInput;
}

export interface IGetUsers {
  filterUsersPaginated: UsersData;
}

export const GET_USERS = gql`
  query filterUsersPaginated($paginationInput: PaginationInput!, $filterInput: UserFilterInput!) {
    filterUsersPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        fullName
        type
        email
        phoneNumber
        isEmailVerified
        isKycVerified
        createdAt
        updatedAt
        walletInfo {
          id
          userId
          balance
          createdAt
          updatedAt
        }
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
