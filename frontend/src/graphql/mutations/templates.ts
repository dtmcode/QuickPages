import { gql } from '@apollo/client';

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
      id
      name
      category
      description
      thumbnail
      isPreset
      isPublic
      settings
      createdAt
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: String!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      category
      description
      thumbnail
      settings
      updatedAt
    }
  }
`;

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: String!) {
    deleteTemplate(id: $id) {
      id
    }
  }
`;

export const APPLY_TEMPLATE = gql`
  mutation ApplyTemplate($templateId: String!) {
    applyTemplate(templateId: $templateId) {
      id
      name
    }
  }
`;

export const ADD_SECTION_TO_TEMPLATE = gql`
  mutation AddSectionToTemplate(
    $templateId: String!
    $sectionId: String!
    $orderIndex: Int!
    $overrideConfig: JSON
  ) {
    addSectionToTemplate(
      templateId: $templateId
      sectionId: $sectionId
      orderIndex: $orderIndex
      overrideConfig: $overrideConfig
    )
  }
`;

export const REMOVE_SECTION_FROM_TEMPLATE = gql`
  mutation RemoveSectionFromTemplate($templateId: String!, $sectionId: String!) {
    removeSectionFromTemplate(templateId: $templateId, sectionId: $sectionId)
  }
`;

export const REORDER_TEMPLATE_SECTIONS = gql`
  mutation ReorderTemplateSections($templateId: String!, $sectionOrders: [SectionOrderInput!]!) {
    reorderTemplateSections(templateId: $templateId, sectionOrders: $sectionOrders) {
      id
      templateSections {
        id
        orderIndex
        section {
          id
          name
        }
      }
    }
  }
`;