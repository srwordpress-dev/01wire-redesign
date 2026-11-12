import { gql } from "@apollo/client";

export interface IResetPasswordVars {
  password: string;
}

export const RESET_PASSWORD = gql`
  mutation resetPassword($password: String!) {
    resetPassword(password: $password)
  }
`;
