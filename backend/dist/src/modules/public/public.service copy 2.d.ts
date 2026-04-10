import { JwtService } from '@nestjs/jwt';
import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class PublicService {
    private db;
    private jwtService;
    constructor(db: DrizzleDB, jwtService: JwtService);
    getTenantSettings(tenantSlug: string): Promise<{
        name: string;
        slug: string;
        domain: string | null;
        shopTemplate: "default" | "minimalist" | "fashion" | "tech" | null;
        settings: unknown;
    }>;
    getTenantBranding(tenantSlug: string): Promise<Record<string, unknown>>;
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
        template: "default" | "landing" | "contact" | "about" | "blank";
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
        template: "default" | "landing" | "contact" | "about" | "blank";
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
    createPublicOrder(tenantSlug: string, data: {
        customerEmail: string;
        customerName: string;
        customerAddress?: string;
        notes?: string;
        items: Array<{
            productId: string;
            productName: string;
            productPrice: number;
            quantity: number;
        }>;
        subtotal: number;
        shipping: number;
        total: number;
    }): Promise<{
        orderNumber: string;
        id: string;
    }>;
    getNavigation(tenantSlug: string, location: string): Promise<{
        id: string;
        name: string;
        settings: {
            backgroundColor?: string;
            textColor?: string;
            fontFamily?: string;
            itemsAlign?: "left" | "center" | "right";
            logoText?: string;
        } | null;
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
    customerRegister(tenantSlug: string, data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }): Promise<{
        accessToken: string;
        customer: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    customerLogin(tenantSlug: string, data: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        customer: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    getCustomerOrders(tenantSlug: string, token: string): Promise<{
        id: string;
        tenantId: string;
        orderNumber: string;
        customerEmail: string;
        customerName: string;
        customerAddress: string | null;
        status: "cancelled" | "pending" | "processing" | "completed";
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        notes: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
