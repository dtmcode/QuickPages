import { gql } from '@apollo/client';

export const APPLY_WEBSITE_TEMPLATE = gql`
  mutation ApplyWebsiteTemplate($templateId: String!) {
    applyWebsiteTemplate(templateId: $templateId)
  }
`;

export const ADD_SECTION_TO_PAGE = gql`
  mutation AddSectionToPage(
    $pageId: String!
    $sectionId: String!
    $orderIndex: Int!
    $overrideConfig: JSON
  ) {
    addSectionToPage(
      pageId: $pageId
      sectionId: $sectionId
      orderIndex: $orderIndex
      overrideConfig: $overrideConfig
    )
  }
`;

export const REMOVE_SECTION_FROM_PAGE = gql`
  mutation RemoveSectionFromPage($pageId: String!, $sectionId: String!) {
    removeSectionFromPage(pageId: $pageId, sectionId: $sectionId)
  }
`;