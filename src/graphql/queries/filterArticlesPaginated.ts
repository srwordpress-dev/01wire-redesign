import { gql } from "@apollo/client";

import { PaginationInput, ArticleData } from "types";

export interface ArticleFilterInput {
  clientId?: string;
  status?: string;
  categories?: string[];
  startTime?: string;
  endTime?: string;
  userId?: string;
}

export interface IGetArticlesVars {
  paginationInput: PaginationInput;
  filterInput: ArticleFilterInput;
}

export interface IGetArticles {
  filterArticlesPaginated: ArticleData;
}

export const GET_ARTICLES = gql`
  query filterArticlesPaginated(
    $paginationInput: PaginationInput!
    $filterInput: ArticleFilterInput!
  ) {
    filterArticlesPaginated(paginationInput: $paginationInput, filterInput: $filterInput) {
      data {
        id
        userId
        clientId
        title
        prId
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
        user {
          email
        }
        timezone
        notes
        changesRequested
        instructions
        publishAt
        createdAt
        bundleInfo {
          id
          type
        }
        mediaContact {
          name
          email
          phone
          website
          address
          state
          country
          facebook
          instagram
          linkedIn
          twitter
          youtube
          others
        }
      }
      paginationInfo {
        currentPage
        perPage
        pageCount
        itemCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
