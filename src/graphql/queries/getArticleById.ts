import { gql } from "@apollo/client";
import { ArticleType } from "types";

export interface IGetArticleByIdVars {
  id: string;
}

export interface IGetArticleById {
  getArticleById: ArticleType;
}

export const GET_ARTICLE_BY_ID = gql`
  query getArticleById($id: String!) {
    getArticleById(id: $id) {
      id
      prId
      userId
      clientId
      title
      content
      language
      summary
      publicationIds
      bundleIds
      featureImage
      featureImageDesc
      status
      category
      publishType
      timezone
      notes
      changesRequested
      instructions
      metaTitle
      metaDescription
      totalCredits
      publishAt
      clientInfo {
        id
        title
        email
        website
        title
        social {
          facebook
          instagram
          linkedIn
          twitter
        }
      }
      bundleInfo {
        id
        category
        publicationIds
        price
        traffic
        type
        image
      }
      publicationInfo {
        id
        categories
        title
        stats {
          dr
          pa
          ur
          da
          traffic
        }
        url
        price
        linkType
        image
      }
      mediaContact {
        name
        email
        phone
        website
        address
        state
        city
        country
        facebook
        instagram
        linkedIn
        twitter
        youtube
        others
      }
    }
  }
`;
