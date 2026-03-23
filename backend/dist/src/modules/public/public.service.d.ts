import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class PublicService {
    private db;
    constructor(db: DrizzleDB);
    getTenantSettings(tenantSlug: string): Promise<{
        name: string;
        slug: string;
        domain: string | null;
        shopTemplate: "default" | "minimalist" | "fashion" | "tech" | null;
        settings: unknown;
    }>;
    private getTenantId;
    getPublishedPages(tenantSlug: string): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "landing" | "default" | "contact" | "about" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getPageBySlug(tenantSlug: string, pageSlug: string): Promise<{
        seo: {
            id: string;
            entityType: string;
            entityId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            ogTitle: string | null;
            ogDescription: string | null;
            ogImage: string | null;
            canonicalUrl: string | null;
            noindex: boolean;
            nofollow: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        metaDescription: string | null;
        template: "landing" | "default" | "contact" | "about" | "blank";
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getPublishedWbPages(tenantSlug: string, templateId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        metaDescription: string | null;
        order: number;
        metaTitle: string | null;
        metaKeywords: string | null;
        templateId: string;
        isHomepage: boolean;
        sections: {
            [x: string]: any;
        }[];
    }[]>;
    getWbPageBySlug(tenantSlug: string, templateId: string, pageSlug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        metaDescription: string | null;
        order: number;
        metaTitle: string | null;
        metaKeywords: string | null;
        templateId: string;
        isHomepage: boolean;
        sections: {
            [x: string]: any;
        }[];
    }>;
    getWbHomepage(tenantSlug: string, templateId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        metaDescription: string | null;
        order: number;
        metaTitle: string | null;
        metaKeywords: string | null;
        templateId: string;
        isHomepage: boolean;
        sections: {
            [x: string]: any;
        }[];
    } | null>;
    getDefaultTemplateId(tenantSlug: string): Promise<string | null>;
    getPublishedPosts(tenantSlug: string): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getPostBySlug(tenantSlug: string, postSlug: string): Promise<{
        seo: {
            id: string;
            entityType: string;
            entityId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            ogTitle: string | null;
            ogDescription: string | null;
            ogImage: string | null;
            canonicalUrl: string | null;
            noindex: boolean;
            nofollow: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getProducts(tenantSlug: string): Promise<{
        id: string;
        tenantId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: number;
        compareAtPrice: number | null;
        stock: number;
        images: string | null;
        isActive: boolean;
        isFeatured: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getProductBySlug(tenantSlug: string, productSlug: string): Promise<{
        seo: {
            id: string;
            entityType: string;
            entityId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            ogTitle: string | null;
            ogDescription: string | null;
            ogImage: string | null;
            canonicalUrl: string | null;
            noindex: boolean;
            nofollow: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        tenantId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: number;
        compareAtPrice: number | null;
        stock: number;
        images: string | null;
        isActive: boolean;
        isFeatured: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getCategories(tenantSlug: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        isActive: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getNavigation(tenantSlug: string, location: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        location: string;
        items: {
            [x: string]: any;
        }[];
    } | null>;
    subscribeToNewsletter(tenantSlug: string, data: {
        email: string;
        firstName?: string;
        lastName?: string;
        source?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    submitContactForm(tenantSlug: string, data: {
        name: string;
        email: string;
        message: string;
        phone?: string;
        subject?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
