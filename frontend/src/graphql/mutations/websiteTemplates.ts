import { gql } from '@apollo/client';

// ==================== TEMPLATES ====================

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!, $tenantId: String!) {
    createTemplate(input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: String!, $input: UpdateTemplateInput!, $tenantId: String!) {
    updateTemplate(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      updatedAt
    }
  }
`;

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: String!, $tenantId: String!) {
    deleteTemplate(id: $id, tenantId: $tenantId)
  }
`;

// ==================== PAGES ====================

export const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!, $tenantId: String!) {
    createPage(input: $input, tenantId: $tenantId) {
      id
      name
      slug
      templateId
      isActive
      createdAt
    }
  }
`;

export const UPDATE_PAGE = gql`
  mutation UpdatePage($id: String!, $input: UpdatePageInput!, $tenantId: String!) {
    updatePage(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      slug
      updatedAt
    }
  }
`;

export const DELETE_PAGE = gql`
  mutation DeletePage($id: String!, $tenantId: String!) {
    deletePage(id: $id, tenantId: $tenantId)
  }
`;

// ==================== SECTIONS ====================

export const CREATE_SECTION = gql`
  mutation CreateSection($input: CreateSectionInput!, $tenantId: String!) {
    createSection(input: $input, tenantId: $tenantId) {
      id
      name
      type
      pageId
      order
      isActive
      createdAt
    }
  }
`;

export const UPDATE_SECTION = gql`
  mutation UpdateSection($id: String!, $input: UpdateSectionInput!, $tenantId: String!) {
    updateSection(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      type
      updatedAt
    }
  }
`;

export const DELETE_SECTION = gql`
  mutation DeleteSection($id: String!, $tenantId: String!) {
    deleteSection(id: $id, tenantId: $tenantId)
  }
`;