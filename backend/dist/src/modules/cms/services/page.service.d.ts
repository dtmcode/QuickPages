import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { PageStatus, PageTemplate } from '../dto/page.types';
export interface CreatePageInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PageStatus;
    template?: PageTemplate;
}
export interface UpdatePageInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PageStatus;
    template?: PageTemplate;
}
export declare class PageService {
    private db;
    constructor(db: DrizzleDB);
    createPage(tenantId: string, input: CreatePageInput): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        slug: string;
        content: string | null;
        tenantId: string;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        authorId: string | null;
        title: string;
        excerpt: string | null;
        featuredImage: string | null;
        isPublished: boolean;
        publishedAt: Date | null;
    }>;
    getPages(tenantId: string, options?: {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getPage(tenantId: string, pageId: string): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getPageBySlug(tenantId: string, slug: string): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updatePage(tenantId: string, pageId: string, input: UpdatePageInput): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deletePage(tenantId: string, pageId: string): Promise<boolean>;
    duplicatePage(tenantId: string, pageId: string): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        slug: string;
        content: string | null;
        tenantId: string;
        metaDescription: string | null;
        template: "about" | "contact" | "default" | "landing" | "blank";
        status: "draft" | "published" | "archived";
        authorId: string | null;
        title: string;
        excerpt: string | null;
        featuredImage: string | null;
        isPublished: boolean;
        publishedAt: Date | null;
    }>;
}
