import { gql } from "@apollo/client";

export interface ILoginVars {
  email: string;
  password: string;
}
export interface ILogin {
  status: string;
  token: string;
  expireAt: string;
}
export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      type
      token
      expireAt
    }
  }
`;
