import { gql } from "@apollo/client";

export interface OtpVerifyInput {
  token: string;
  otp: string;
}

export interface IVerifyOtpVars {
  params: OtpVerifyInput;
}

export interface IVerifyOtp {
  token: string;
  type?: string;
}

export const VERIFY_OTP = gql`
  mutation verifyOtp($params: OtpVerifyInput!) {
    verifyOtp(params: $params) {
      token
      type
    }
  }
`;
