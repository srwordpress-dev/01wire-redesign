import { gql } from "@apollo/client";

export interface ILoginOtpVars {
    email: string;
}
export interface ILoginOtp {
  status: string;
  token: string;
  expireAt: string;
}
export const LOGIN_VIA_OTP = gql`
  mutation loginViaOtp($email: String!) {
    loginViaOtp(email: $email) {
      status
      token
      expireAt
    }
  }
`;
