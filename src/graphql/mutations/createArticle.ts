import { gql } from "@apollo/client";

export interface ArticleCreateInput {
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
  timezone: string;
  notes: string;
  bundleIds: string;
  publicationIds: string;
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
export interface ICreateArticleVars {
  params: ArticleCreateInput;
}
export const CREATE_ARTICLE = gql`
  mutation createArticle($params: ArticleCreateInput!) {
    createArticle(params: $params) {
      id
      userId
      clientId
      title
      content
      language
      summary
      publicationIds
    }
  }
`;
