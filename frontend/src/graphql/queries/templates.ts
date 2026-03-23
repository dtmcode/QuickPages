import { gql } from '@apollo/client';

export const GET_TEMPLATES = gql`
  query GetTemplates($includePresets: Boolean) {
    templates(includePresets: $includePresets) {
      id
      name
      category
      description
      thumbnail
      isPreset
      isPublic
      settings
      createdAt
      updatedAt
      templateSections {
        id
        orderIndex
        section {
          id
          name
          type
          component
          description
          thumbnail
        }
      }
    }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($id: String!) {
    template(id: $id) {
      id
      tenantId
      name
      category
      description
      thumbnail
      isPreset
      isPublic
      settings
      createdBy
      createdAt
      updatedAt
      templateSections {
        id
        orderIndex
        overrideConfig
        section {
          id
          name
          type
          component
          description
          config
          thumbnail
        }
      }
    }
  }
`;

export const GET_SECTIONS = gql`
  query GetSections($includePresets: Boolean) {
    sections(includePresets: $includePresets) {
      id
      name
      type
      component
      description
      config
      isPreset
      isPublic
      thumbnail
      createdAt
      updatedAt
    }
  }
`;

export const GET_SECTION = gql`
  query GetSection($id: String!) {
    section(id: $id) {
      id
      tenantId
      name
      type
      component
      description
      config
      isPreset
      isPublic
      thumbnail
      createdAt
      updatedAt
    }
  }
`;