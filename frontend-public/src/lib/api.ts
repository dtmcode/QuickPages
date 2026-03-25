// 📂 PFAD: frontend-public/src/lib/api.ts

import { Tenant, Page, Post, Product, Category, Navigation } from '@/types';
const isServer = typeof window === 'undefined';
const API_URL = isServer 
  ? (process.env.API_URL || 'http://localhost:3000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
// ==================== WB TYPES ====================
export interface WbSection {
  id: string;
  name: string;
  type: string;
  content: Record<string, unknown>;
  styling?: Record<string, unknown>;
  isActive: boolean;
  order: number;
}

export interface WbPage {
  id: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isHomepage: boolean;
  isActive: boolean;
  order: number;
  sections?: WbSection[];
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings extends Tenant {
  settings: Record<string, unknown>;
}

class PublicAPI {
  private baseUrl: string;

  constructor(tenant: string) {
    this.baseUrl = `${API_URL}/api/public/${tenant}`;
  }

  private async fetchWithCache<T>(
    endpoint: string,
    revalidate: number = 60,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log('🔍 Fetching:', fullUrl);

    const res = await fetch(fullUrl, {
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error details');
      throw new Error(
        `API Error: ${res.status} ${res.statusText} - URL: ${fullUrl} - Details: ${errorText}`,
      );
    }

    return res.json();
  }

  // ==================== TENANT ====================
  async getSettings(): Promise<Tenant> {
    return this.fetchWithCache<Tenant>('/settings', 3600);
  }

  // ==================== CMS PAGES ====================
  async getPages(): Promise<Page[]> {
    return this.fetchWithCache<Page[]>('/pages', 60);
  }

  async getPage(slug: string): Promise<Page> {
    return this.fetchWithCache<Page>(`/pages/${slug}`, 60);
  }

  // ==================== BLOG ====================
  async getPosts(): Promise<Post[]> {
    return this.fetchWithCache<Post[]>('/posts', 60);
  }

  async getPost(slug: string): Promise<Post> {
    return this.fetchWithCache<Post>(`/posts/${slug}`, 60);
  }

  // ==================== SHOP ====================
  async getProducts(): Promise<Product[]> {
    return this.fetchWithCache<Product[]>('/products', 60);
  }

  async getProduct(slug: string): Promise<Product> {
    return this.fetchWithCache<Product>(`/products/${slug}`, 60);
  }

  // ==================== CATEGORIES ====================
  async getCategories(): Promise<Category[]> {
    return this.fetchWithCache<Category[]>('/categories', 300);
  }

  // ==================== NAVIGATION ====================
  async getNavigation(location: string): Promise<Navigation | null> {
    try {
      return await this.fetchWithCache<Navigation>(
        `/navigation/${location}`,
        300,
      );
    } catch {
      return null;
    }
  }

  // ==================== WEBSITE BUILDER ====================
  async getWbHomepage(): Promise<WbPage> {
    return this.fetchWithCache<WbPage>('/wb/homepage', 60);
  }

  async getWbPage(slug: string): Promise<WbPage> {
    return this.fetchWithCache<WbPage>(`/wb/pages/${slug}`, 60);
  }

  async getWbPages(): Promise<WbPage[]> {
    return this.fetchWithCache<WbPage[]>('/wb/pages', 60);
  }
}

export function getAPI(tenant: string) {
  return new PublicAPI(tenant);
}