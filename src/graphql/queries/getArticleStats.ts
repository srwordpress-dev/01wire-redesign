import { gql } from "@apollo/client";

export interface ArticleStatsType {
  status: string;
  count: string;
}

export interface IGetArticleStats {
  getArticleStats: [ArticleStatsType];
}

export const GET_ARTICLE_STATS = gql`
  query getArticleStats {
    getArticleStats {
      status
      count
    }
  }
`;
