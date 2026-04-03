import type { DrizzleDB } from '../../core/database/drizzle.module';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
export declare class WebsiteBuilderService {
    private db;
    constructor(db: DrizzleDB);
    findAllGlobalTemplates(limit?: number): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        category: string | null;
        isActive: boolean;
        isPremium: boolean;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
        } | null;
        previewUrl: string | null;
        demoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOneGlobalTemplate(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        category: string | null;
        isActive: boolean;
        isPremium: boolean;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
        } | null;
        previewUrl: string | null;
        demoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cloneGlobalTemplate(globalTemplateId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
        pages: {
            [x: string]: any;
        }[];
    }>;
    createTemplate(tenantId: string, input: CreateTemplateInput): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
    }>;
    findAllTemplates(tenantId: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
        pages: {
            [x: string]: any;
        }[];
    }[]>;
    findOneTemplate(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
        pages: {
            [x: string]: any;
        }[];
    }>;
    findDefaultTemplate(tenantId: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
        pages: {
            [x: string]: any;
        }[];
    } | null>;
    updateTemplate(id: string, tenantId: string, input: UpdateTemplateInput): Promise<{
        id: string;
        tenantId: string;
        globalTemplateId: string | null;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
        isDefault: boolean;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteTemplate(id: string, tenantId: string): Promise<boolean>;
    cloneTemplate(id: string, tenantId: string, newName?: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
        pages: {
            [x: string]: any;
        }[];
    }>;
    setAsDefaultTemplate(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        globalTemplateId: string | null;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
        isDefault: boolean;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createPage(tenantId: string, input: CreatePageInput): Promise<{
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
    }>;
    findAllPages(tenantId: string, templateId?: string): Promise<{
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
    findOnePage(id: string, tenantId: string): Promise<{
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
        template: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        sections: {
            [x: string]: any;
        }[];
    }>;
    findPageBySlug(slug: string, tenantId: string, templateId?: string): Promise<{
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
    findHomepage(tenantId: string, templateId: string): Promise<{
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
    updatePage(id: string, tenantId: string, input: UpdatePageInput): Promise<{
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
    deletePage(id: string, tenantId: string): Promise<boolean>;
    reorderSections(pageId: string, tenantId: string, sectionIds: string[]): Promise<{
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
        template: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        sections: {
            [x: string]: any;
        }[];
    }>;
    createSection(tenantId: string, input: CreateSectionInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        pageId: string;
        order: number;
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
    }>;
    findAllSections(tenantId: string, pageId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        pageId: string;
        order: number;
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
    }[]>;
    findOneSection(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        pageId: string;
        order: number;
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
        page: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    updateSection(id: string, tenantId: string, input: UpdateSectionInput): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
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
    }>;
    deleteSection(id: string, tenantId: string): Promise<boolean>;
    duplicateSection(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        pageId: string;
        order: number;
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
    }>;
    toggleSectionVisibility(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
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
    }>;
    moveSection(id: string, tenantId: string, targetPageId: string): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
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
    }>;
    findAllGlobalSections(): Promise<{
        id: string;
        pageId: string;
        name: string;
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        order: number;
        content: unknown;
        styling: unknown;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOneGlobalSection(id: string): Promise<{
        id: string;
        pageId: string;
        name: string;
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        order: number;
        content: unknown;
        styling: unknown;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cloneGlobalSection(globalSectionId: string, pageId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
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
        type: "newsletter" | "booking" | "contact" | "about" | "video" | "custom" | "map" | "hero" | "features" | "services" | "gallery" | "testimonials" | "team" | "pricing" | "cta" | "faq" | "blog" | "stats" | "text" | "html" | "countdown" | "social";
        pageId: string;
        order: number;
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
    }>;
    createDefaultTemplate(tenantId: string, tenantName: string, packageType: string): Promise<{
        id: string;
        name: string;
        settings: {
            colors?: {
                primary?: string;
                secondary?: string;
                accent?: string;
                background?: string;
                text?: string;
            };
            fonts?: {
                heading?: string;
                body?: string;
            };
            spacing?: {
                default?: string;
            };
        } | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        isDefault: boolean;
        thumbnailUrl: string | null;
        globalTemplateId: string | null;
    }>;
}
