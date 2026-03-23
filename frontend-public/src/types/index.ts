// ==================== TENANT ====================
export interface Tenant {
  name: string;
  slug: string;
  domain: string | null;
  shopTemplate: 'default' | 'minimalist' | 'fashion' | 'tech';
  settings: {
    modules: {
      cms: boolean;
      shop: boolean;
      email: boolean;
      landing: boolean;
    };
    limits: {
      users: number;
      products: number;
      emails: number;
    };
  };
}

// ==================== SEO ====================
export interface SEOMeta {
  id: string;
  entityType: string;
  entityId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex: boolean;
  nofollow: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== SECTIONS (NEU) ====================
export interface Section {
  id: string;
  name: string;
  type: string;
  component: string;
  config?: Record<string, any>;
  description?: string;
  thumbnail?: string;
}

export interface PageSection {
  id: string;
  orderIndex: number;
  overrideConfig?: Record<string, any>;
  section: Section;
}

// ==================== PAGE ====================
export interface Page {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaDescription?: string;
  template: string;
  status: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seo?: SEOMeta;
  
  // ✅ NEU: Page Sections (aus Website Template System)
  sections?: PageSection[];
  
  // ✅ ALT: Template Data (für Backward Compatibility)
  templateData?: {
    id: string;
    name: string;
    sections: Array<{
      id: string;
      orderIndex: number;
      overrideConfig?: Record<string, unknown>;
      section: {
        id: string;
        name: string;
        type: string;
        component: string;
        config?: Record<string, unknown>;
      };
    }>;
  };
}

// ==================== POST ====================
export interface Post {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: string;
  isPublished: boolean;
  publishedAt: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  seo?: SEOMeta;
}

// ==================== PRODUCT ====================
export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  seo?: SEOMeta;
}

// ==================== CATEGORY ====================
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== NAVIGATION ====================
export interface Navigation {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  description?: string;
  isActive: boolean;
  items: NavigationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  navigationId: string;
  label: string;
  type: string;
  url?: string;
  pageId?: string;
  postId?: string;
  categoryId?: string;
  icon?: string;
  cssClass?: string;
  openInNewTab: boolean;
  order: number;
  parentId?: string;
  children?: NavigationItem[];
  createdAt: string;
  updatedAt: string;
}

// ==================== WEBSITE TEMPLATES (NEU) ====================
export interface WebsiteTemplatePage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  orderIndex: number;
  sections?: Array<{
    id: string;
    orderIndex: number;
    config?: Record<string, any>;
    section: Section;
  }>;
}

export interface WebsiteTemplate {
  id: string;
  tenantId?: string;
  name: string;
  category: string;
  description?: string;
  thumbnail?: string;
  isPreset: boolean;
  isPublic: boolean;
  pages?: WebsiteTemplatePage[];
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}