import { Tenant, Page, Post, Product, Category, Navigation } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  async getSettings(): Promise<Tenant> {
    return this.fetchWithCache<Tenant>('/settings', 3600);
  }

  async getPages(): Promise<Page[]> {
    return this.fetchWithCache<Page[]>('/pages', 60);
  }

  // ✅ WICHTIG: Lädt Page MIT Sections
  async getPage(slug: string): Promise<Page> {
    return this.fetchWithCache<Page>(`/pages/${slug}`, 60);
  }

  async getPosts(): Promise<Post[]> {
    return this.fetchWithCache<Post[]>('/posts', 60);
  }

  async getPost(slug: string): Promise<Post> {
    return this.fetchWithCache<Post>(`/posts/${slug}`, 60);
  }

  async getProducts(): Promise<Product[]> {
    return this.fetchWithCache<Product[]>('/products', 60);
  }

  async getProduct(slug: string): Promise<Product> {
    return this.fetchWithCache<Product>(`/products/${slug}`, 60);
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchWithCache<Category[]>('/categories', 300);
  }

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
}

export function getAPI(tenant: string) {
  return new PublicAPI(tenant);
}