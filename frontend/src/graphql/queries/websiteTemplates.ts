import { gql } from '@apollo/client';

// ==================== RICHTIG: Verwende die Backend-Resolver-Namen! ====================

export const GET_WEBSITE_TEMPLATES = gql`
  query GetWebsiteTemplates($includePresets: Boolean) {
    wbTemplates(includePresets: $includePresets) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const GET_WEBSITE_TEMPLATE = gql`
  query GetWebsiteTemplate($id: String!) {
    wbTemplate(id: $id) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAGES = gql`
  query GetPages {
    wbPages {
      id
      name
      slug
      templateId
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SECTIONS = gql`
  query GetSections($includePresets: Boolean) {
    wbSections(includePresets: $includePresets) {
      id
      name
      type
      content
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAGE_WITH_SECTIONS = gql`
  query GetPageWithSections($pageId: String!) {
    wbPageWithSections(pageId: $pageId) {
      id
      name
      slug
      templateId
      sections {
        id
        name
        type
        content
        order
      }
    }
  }
`;
