/**
 * Type-Safe API Client für Website Builder
 * Verwendung im Dashboard
 */

import {
  Template,
  Page,
  Section,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreatePageDto,
  UpdatePageDto,
  CreateSectionDto,
  UpdateSectionDto,
  ReorderSectionsDto,
} from '../types/website-builder.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==================== ERROR HANDLING ====================

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(
      error.message || 'API request failed',
      response.status,
      error
    );
  }
  return response.json();
}

// ==================== FETCH HELPER ====================

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token'); // Oder dein Auth-System

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  return handleResponse<T>(response);
}

// ==================== TEMPLATES ====================

export const templatesApi = {
  async getAll(): Promise<Template[]> {
    return fetchApi<Template[]>('/templates');
  },

  async getById(id: string): Promise<Template> {
    return fetchApi<Template>(`/templates/${id}`);
  },

  async getDefault(): Promise<Template | null> {
    return fetchApi<Template | null>('/templates/default');
  },

  async create(data: CreateTemplateDto): Promise<Template> {
    return fetchApi<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateTemplateDto): Promise<Template> {
    return fetchApi<Template>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  },

  async clone(id: string, name?: string): Promise<Template> {
    return fetchApi<Template>(`/templates/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async setAsDefault(id: string): Promise<Template> {
    return fetchApi<Template>(`/templates/${id}/set-default`, {
      method: 'POST',
    });
  },
};

// ==================== PAGES ====================

export const pagesApi = {
  async getAll(templateId?: string): Promise<Page[]> {
    const query = templateId ? `?templateId=${templateId}` : '';
    return fetchApi<Page[]>(`/pages${query}`);
  },

  async getById(id: string): Promise<Page> {
    return fetchApi<Page>(`/pages/${id}`);
  },

  async getBySlug(slug: string, templateId?: string): Promise<Page> {
    const query = templateId ? `?templateId=${templateId}` : '';
    return fetchApi<Page>(`/pages/slug/${slug}${query}`);
  },

  async getHomepage(templateId: string): Promise<Page | null> {
    return fetchApi<Page | null>(`/pages/template/${templateId}/homepage`);
  },

  async create(data: CreatePageDto): Promise<Page> {
    return fetchApi<Page>('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdatePageDto): Promise<Page> {
    return fetchApi<Page>(`/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/pages/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderSections(id: string, data: ReorderSectionsDto): Promise<Page> {
    return fetchApi<Page>(`/pages/${id}/reorder-sections`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ==================== SECTIONS ====================

export const sectionsApi = {
  async getAll(pageId?: string): Promise<Section[]> {
    const query = pageId ? `?pageId=${pageId}` : '';
    return fetchApi<Section[]>(`/sections${query}`);
  },

  async getById(id: string): Promise<Section> {
    return fetchApi<Section>(`/sections/${id}`);
  },

  async getByType(type: string): Promise<Section[]> {
    return fetchApi<Section[]>(`/sections?type=${type}`);
  },

  async create(data: CreateSectionDto): Promise<Section> {
    return fetchApi<Section>('/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateSectionDto): Promise<Section> {
    return fetchApi<Section>(`/sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/sections/${id}`, {
      method: 'DELETE',
    });
  },

  async duplicate(id: string): Promise<Section> {
    return fetchApi<Section>(`/sections/${id}/duplicate`, {
      method: 'POST',
    });
  },

  async toggleVisibility(id: string): Promise<Section> {
    return fetchApi<Section>(`/sections/${id}/toggle-visibility`, {
      method: 'POST',
    });
  },

  async moveToPage(id: string, targetPageId: string): Promise<Section> {
    return fetchApi<Section>(`/sections/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ targetPageId }),
    });
  },
};

// ==================== EXPORT ALL ====================

export const api = {
  templates: templatesApi,
  pages: pagesApi,
  sections: sectionsApi,
};
