/**
 * React Hooks für Website Builder
 * Type-Safe State Management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from './api-client';
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
} from '../types/website-builder.types';

// ==================== TEMPLATES ====================

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.templates.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (data: CreateTemplateDto) => {
    try {
      const newTemplate = await api.templates.create(data);
      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create template');
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, data: UpdateTemplateDto) => {
    try {
      const updated = await api.templates.update(id, data);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update template');
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await api.templates.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete template');
    }
  }, []);

  const cloneTemplate = useCallback(async (id: string, name?: string) => {
    try {
      const cloned = await api.templates.clone(id, name);
      setTemplates((prev) => [...prev, cloned]);
      return cloned;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to clone template');
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
  };
}

export function useTemplate(id: string | null) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!id) {
      setTemplate(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.templates.getById(id);
      setTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  return { template, isLoading, error, refetch: fetchTemplate };
}

// ==================== PAGES ====================

export function usePages(templateId?: string) {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.pages.getAll(templateId);
      setPages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pages');
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const createPage = useCallback(async (data: CreatePageDto) => {
    try {
      const newPage = await api.pages.create(data);
      setPages((prev) => [...prev, newPage]);
      return newPage;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create page');
    }
  }, []);

  const updatePage = useCallback(async (id: string, data: UpdatePageDto) => {
    try {
      const updated = await api.pages.update(id, data);
      setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update page');
    }
  }, []);

  const deletePage = useCallback(async (id: string) => {
    try {
      await api.pages.delete(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete page');
    }
  }, []);

  const reorderSections = useCallback(async (pageId: string, sectionIds: string[]) => {
    try {
      const updated = await api.pages.reorderSections(pageId, { sectionIds });
      setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reorder sections');
    }
  }, []);

  return {
    pages,
    isLoading,
    error,
    refetch: fetchPages,
    createPage,
    updatePage,
    deletePage,
    reorderSections,
  };
}

export function usePage(id: string | null) {
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!id) {
      setPage(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.pages.getById(id);
      setPage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch page');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { page, isLoading, error, refetch: fetchPage };
}

// ==================== SECTIONS ====================

export function useSections(pageId?: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.sections.getAll(pageId);
      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const createSection = useCallback(async (data: CreateSectionDto) => {
    try {
      const newSection = await api.sections.create(data);
      setSections((prev) => [...prev, newSection]);
      return newSection;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create section');
    }
  }, []);

  const updateSection = useCallback(async (id: string, data: UpdateSectionDto) => {
    try {
      const updated = await api.sections.update(id, data);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update section');
    }
  }, []);

  const deleteSection = useCallback(async (id: string) => {
    try {
      await api.sections.delete(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete section');
    }
  }, []);

  const duplicateSection = useCallback(async (id: string) => {
    try {
      const duplicated = await api.sections.duplicate(id);
      setSections((prev) => [...prev, duplicated]);
      return duplicated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to duplicate section');
    }
  }, []);

  const toggleVisibility = useCallback(async (id: string) => {
    try {
      const updated = await api.sections.toggleVisibility(id);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  }, []);

  return {
    sections,
    isLoading,
    error,
    refetch: fetchSections,
    createSection,
    updateSection,
    deleteSection,
    duplicateSection,
    toggleVisibility,
  };
}
