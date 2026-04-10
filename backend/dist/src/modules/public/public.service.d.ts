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
        sections: {
            id: string;
            tenantId: string;
            pageId: string;
            name: string;
            type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social" | "spacer" | "before_after" | "whatsapp" | "freestyle";
            order: number;
            isActive: boolean;
            content: {
                heading?: string;
                subheading?: string;
                buttonText?: string;
                buttonLink?: string;
                backgroundImage?: string;
                backgroundVideo?: string;
                title?: string;
                subtitle?: string;
                description?: string;
                alignment?: "left" | "center" | "right";
                items?: Array<{
                    id?: string;
                    title?: string;
                    description?: string;
                    icon?: string;
                    image?: string;
                    link?: string;
                }>;
                images?: Array<{
                    url: string;
                    alt?: string;
                    title?: string;
                    description?: string;
                }>;
                testimonials?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    company?: string;
                    text?: string;
                    avatar?: string;
                    rating?: number;
                }>;
                members?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    bio?: string;
                    image?: string;
                    social?: {
                        linkedin?: string;
                        twitter?: string;
                        github?: string;
                    };
                }>;
                plans?: Array<{
                    id?: string;
                    name?: string;
                    price?: string;
                    currency?: string;
                    interval?: string;
                    features?: string[];
                    highlighted?: boolean;
                    buttonText?: string;
                    buttonLink?: string;
                }>;
                faqs?: Array<{
                    id?: string;
                    question?: string;
                    answer?: string;
                }>;
                stats?: Array<{
                    id?: string;
                    value?: string;
                    label?: string;
                    icon?: string;
                }>;
                videoUrl?: string;
                videoPoster?: string;
                text?: string;
                html?: string;
            };
            styling: {
                backgroundColor?: string;
                textColor?: string;
                padding?: {
                    top?: string;
                    bottom?: string;
                    left?: string;
                    right?: string;
                };
                margin?: {
                    top?: string;
                    bottom?: string;
                };
                customCss?: string;
                containerWidth?: "full" | "contained" | "narrow";
                backgroundImage?: string;
                backgroundOverlay?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        tenantId: string;
        templateId: string;
        name: string;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        isActive: boolean;
        isHomepage: boolean;
        order: number;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getWbPageBySlug(tenantSlug: string, templateId: string, pageSlug: string): Promise<{
        sections: {
            id: string;
            tenantId: string;
            pageId: string;
            name: string;
            type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social" | "spacer" | "before_after" | "whatsapp" | "freestyle";
            order: number;
            isActive: boolean;
            content: {
                heading?: string;
                subheading?: string;
                buttonText?: string;
                buttonLink?: string;
                backgroundImage?: string;
                backgroundVideo?: string;
                title?: string;
                subtitle?: string;
                description?: string;
                alignment?: "left" | "center" | "right";
                items?: Array<{
                    id?: string;
                    title?: string;
                    description?: string;
                    icon?: string;
                    image?: string;
                    link?: string;
                }>;
                images?: Array<{
                    url: string;
                    alt?: string;
                    title?: string;
                    description?: string;
                }>;
                testimonials?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    company?: string;
                    text?: string;
                    avatar?: string;
                    rating?: number;
                }>;
                members?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    bio?: string;
                    image?: string;
                    social?: {
                        linkedin?: string;
                        twitter?: string;
                        github?: string;
                    };
                }>;
                plans?: Array<{
                    id?: string;
                    name?: string;
                    price?: string;
                    currency?: string;
                    interval?: string;
                    features?: string[];
                    highlighted?: boolean;
                    buttonText?: string;
                    buttonLink?: string;
                }>;
                faqs?: Array<{
                    id?: string;
                    question?: string;
                    answer?: string;
                }>;
                stats?: Array<{
                    id?: string;
                    value?: string;
                    label?: string;
                    icon?: string;
                }>;
                videoUrl?: string;
                videoPoster?: string;
                text?: string;
                html?: string;
            };
            styling: {
                backgroundColor?: string;
                textColor?: string;
                padding?: {
                    top?: string;
                    bottom?: string;
                    left?: string;
                    right?: string;
                };
                margin?: {
                    top?: string;
                    bottom?: string;
                };
                customCss?: string;
                containerWidth?: "full" | "contained" | "narrow";
                backgroundImage?: string;
                backgroundOverlay?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        tenantId: string;
        templateId: string;
        name: string;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        isActive: boolean;
        isHomepage: boolean;
        order: number;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getWbHomepage(tenantSlug: string, templateId: string): Promise<{
        sections: {
            id: string;
            tenantId: string;
            pageId: string;
            name: string;
            type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social" | "spacer" | "before_after" | "whatsapp" | "freestyle";
            order: number;
            isActive: boolean;
            content: {
                heading?: string;
                subheading?: string;
                buttonText?: string;
                buttonLink?: string;
                backgroundImage?: string;
                backgroundVideo?: string;
                title?: string;
                subtitle?: string;
                description?: string;
                alignment?: "left" | "center" | "right";
                items?: Array<{
                    id?: string;
                    title?: string;
                    description?: string;
                    icon?: string;
                    image?: string;
                    link?: string;
                }>;
                images?: Array<{
                    url: string;
                    alt?: string;
                    title?: string;
                    description?: string;
                }>;
                testimonials?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    company?: string;
                    text?: string;
                    avatar?: string;
                    rating?: number;
                }>;
                members?: Array<{
                    id?: string;
                    name?: string;
                    role?: string;
                    bio?: string;
                    image?: string;
                    social?: {
                        linkedin?: string;
                        twitter?: string;
                        github?: string;
                    };
                }>;
                plans?: Array<{
                    id?: string;
                    name?: string;
                    price?: string;
                    currency?: string;
                    interval?: string;
                    features?: string[];
                    highlighted?: boolean;
                    buttonText?: string;
                    buttonLink?: string;
                }>;
                faqs?: Array<{
                    id?: string;
                    question?: string;
                    answer?: string;
                }>;
                stats?: Array<{
                    id?: string;
                    value?: string;
                    label?: string;
                    icon?: string;
                }>;
                videoUrl?: string;
                videoPoster?: string;
                text?: string;
                html?: string;
            };
            styling: {
                backgroundColor?: string;
                textColor?: string;
                padding?: {
                    top?: string;
                    bottom?: string;
                    left?: string;
                    right?: string;
                };
                margin?: {
                    top?: string;
                    bottom?: string;
                };
                customCss?: string;
                containerWidth?: "full" | "contained" | "narrow";
                backgroundImage?: string;
                backgroundOverlay?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        tenantId: string;
        templateId: string;
        name: string;
        slug: string;
        description: string | null;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        isActive: boolean;
        isHomepage: boolean;
        order: number;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
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
    getPublicForms(tenantSlug: string): Promise<any>;
    getPublicBookingServices(tenantSlug: string): Promise<any>;
}
