import { gql } from "@apollo/client";

export interface IDeleteArticleVars {
  id: string;
}

export const DELETE_ARTICLE = gql`
  mutation deleteArticle($id: String!) {
    deleteArticle(id: $id)
  }
`;
