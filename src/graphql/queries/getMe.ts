import { gql } from "@apollo/client";

export interface UserType {
  id: string,
  fullName: string
  type: string
  email: string
  isEmailVerified: boolean,
  updatedAt: string
  isKycVerified: boolean;
  phoneNumber: string;
}

export interface IGetMe {
  getMe: UserType
}

export const GET_ME = gql`
  query getMe {
    getMe {
      id
      fullName
      type
      email
      isEmailVerified
      phoneNumber
      isKycVerified
      updatedAt
    }
  }
`;


