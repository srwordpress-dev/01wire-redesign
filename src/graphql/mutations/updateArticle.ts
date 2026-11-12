import { gql } from "@apollo/client";

export interface ArticleUpdateInput {
  id: string;
  clientId: string;
  title: string;
  content: string;
  language: string;
  summary: string;
  featureImage: string;
  featureImageDesc: string;
  articleImages: string;
  status: string;
  category: string;
  publishType: string;
  publishAt: string;
  timezone: string;
  notes: string;
  instructions: string;
  bundleIds: string[];
  publicationIds: string[];
  mediaContact: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    state: string;
    country: string;
    facebook: string;
    instagram: string;
    linkedIn: string;
    twitter: string;
    youtube: string;
    others: string;
  };
}
export interface IUpdateArticleVars {
  params: ArticleUpdateInput;
}
export const UPDATE_ARTICLE = gql`
  mutation updateArticle($params: ArticleUpdateInput!) {
    updateArticle(params: $params) {
      id
    }
  }
`;
