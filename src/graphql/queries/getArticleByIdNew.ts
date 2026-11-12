import { gql } from "@apollo/client";
import { ArticleType } from "types";

export interface IGetArticleByIdVars {
  id: string;
}

export interface IGetArticleById {
  getArticleById: ArticleType;
}

export const GET_ARTICLE_BY_ID_RNP = gql`
  query getArticleById($id: String!) {
    getArticleById(id: $id) {
      id
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
      instructions
      metaTitle
      metaDescription
      publishAt
      totalCredits
      updatedAt
      clientInfo {
        id
        title
      }
      bundleInfo {
        id
        publicationIds
        image
        description
        type
        category
        traffic
        price
        createdAt
        updatedAt
        publicationInfo {
          id
          stats {
            da
            pa
            dr
            ur
            traffic
          }
          title
          categories
          linkType
          url
          image
          timeline
          price
          createdAt
          updatedAt
        }
      }
      publicationInfo {
        id
        stats {
          da
          pa
          dr
          ur
          traffic
        }
        title
        image
        categories
        linkType
        url
        timeline
        price
        createdAt
        updatedAt
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
