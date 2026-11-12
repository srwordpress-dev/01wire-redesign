import { gql } from "@apollo/client";

export interface IGetAuthStatusVars {
  email: string;
}
export interface IGetAuthStatus {
  status: string;
  token: string;
  expireAt: string;
}

export const GET_AUTH_STATUS = gql`
  query getAuthStatus($email: String!) {
    getAuthStatus(email: $email) {
      status
      token
      expireAt
    }
  }
`;

