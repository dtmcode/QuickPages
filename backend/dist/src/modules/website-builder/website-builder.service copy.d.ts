import type { DrizzleDB } from '../../core/database/drizzle.module';
import { wbTemplates } from '../../drizzle/website-builder.schema';
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
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
        pages: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            sections: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                pageId: string;
                type: "freestyle" | "custom";
                content: Record<string, any>;
                styling: Record<string, any> | null;
                tenantId: string;
            }[];
        }[];
    }>;
    createTemplate(tenantId: string, input: CreateTemplateInput): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
    }>;
    findAllTemplates(tenantId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
        pages: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            sections: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                pageId: string;
                type: "freestyle" | "custom";
                content: Record<string, any>;
                styling: Record<string, any> | null;
                tenantId: string;
            }[];
        }[];
    }[]>;
    findOneTemplate(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
        pages: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            sections: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                pageId: string;
                type: "freestyle" | "custom";
                content: Record<string, any>;
                styling: Record<string, any> | null;
                tenantId: string;
            }[];
        }[];
    }>;
    findDefaultTemplate(tenantId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
        pages: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            sections: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                pageId: string;
                type: "freestyle" | "custom";
                content: Record<string, any>;
                styling: Record<string, any> | null;
                tenantId: string;
            }[];
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
        description: string | null;
        thumbnailUrl: string | null;
        isActive: boolean;
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
        tenantId: string;
        globalTemplateId: string | null;
        isDefault: boolean;
        pages: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
            sections: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                order: number;
                pageId: string;
                type: "freestyle" | "custom";
                content: Record<string, any>;
                styling: Record<string, any> | null;
                tenantId: string;
            }[];
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
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
    }>;
    findAllPages(tenantId: string, templateId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        sections: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            pageId: string;
            type: "freestyle" | "custom";
            content: Record<string, any>;
            styling: Record<string, any> | null;
            tenantId: string;
        }[];
    }[]>;
    findOnePage(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        template: {
            id: string;
            name: string;
            description: string | null;
            thumbnailUrl: string | null;
            isActive: boolean;
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
            tenantId: string;
            globalTemplateId: string | null;
            isDefault: boolean;
        };
        sections: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            pageId: string;
            type: "freestyle" | "custom";
            content: Record<string, any>;
            styling: Record<string, any> | null;
            tenantId: string;
        }[];
    }>;
    findPageBySlug(slug: string, tenantId: string, templateId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        sections: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            pageId: string;
            type: "freestyle" | "custom";
            content: Record<string, any>;
            styling: Record<string, any> | null;
            tenantId: string;
        }[];
    } | null>;
    findHomepage(tenantId: string, templateId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        sections: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            pageId: string;
            type: "freestyle" | "custom";
            content: Record<string, any>;
            styling: Record<string, any> | null;
            tenantId: string;
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
        description: string | null;
        isActive: boolean;
        settings: {
            layout?: string;
            headerVisible?: boolean;
            footerVisible?: boolean;
            customCss?: string;
            customJs?: string;
        } | null;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        slug: string;
        isHomepage: boolean;
        order: number;
        tenantId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        template: {
            id: string;
            name: string;
            description: string | null;
            thumbnailUrl: string | null;
            isActive: boolean;
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
            tenantId: string;
            globalTemplateId: string | null;
            isDefault: boolean;
        };
        sections: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            pageId: string;
            type: "freestyle" | "custom";
            content: Record<string, any>;
            styling: Record<string, any> | null;
            tenantId: string;
        }[];
    }>;
    createSection(tenantId: string, input: CreateSectionInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        pageId: string;
        type: "freestyle" | "custom";
        content: Record<string, any>;
        styling: Record<string, any> | null;
        tenantId: string;
    }>;
    findAllSections(tenantId: string, pageId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        pageId: string;
        type: "freestyle" | "custom";
        content: Record<string, any>;
        styling: Record<string, any> | null;
        tenantId: string;
    }[]>;
    findOneSection(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        pageId: string;
        type: "freestyle" | "custom";
        content: Record<string, any>;
        styling: Record<string, any> | null;
        tenantId: string;
        page: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            settings: {
                layout?: string;
                headerVisible?: boolean;
                footerVisible?: boolean;
                customCss?: string;
                customJs?: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            slug: string;
            isHomepage: boolean;
            order: number;
            tenantId: string;
            metaTitle: string | null;
            metaDescription: string | null;
            metaKeywords: string | null;
        };
    }>;
    updateSection(id: string, tenantId: string, input: UpdateSectionInput): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "freestyle" | "custom";
        order: number;
        isActive: boolean;
        content: Record<string, any>;
        styling: Record<string, any> | null;
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
        order: number;
        pageId: string;
        type: "freestyle" | "custom";
        content: Record<string, any>;
        styling: Record<string, any> | null;
        tenantId: string;
    }>;
    toggleSectionVisibility(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "freestyle" | "custom";
        order: number;
        isActive: boolean;
        content: Record<string, any>;
        styling: Record<string, any> | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    moveSection(id: string, tenantId: string, targetPageId: string): Promise<{
        id: string;
        tenantId: string;
        pageId: string;
        name: string;
        type: "freestyle" | "custom";
        order: number;
        isActive: boolean;
        content: Record<string, any>;
        styling: Record<string, any> | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllGlobalSections(): Promise<{
        id: string;
        pageId: string;
        name: string;
        type: "freestyle" | "custom";
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
        type: "freestyle" | "custom";
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
        order: number;
        pageId: string;
        type: "freestyle" | "custom";
        content: Record<string, any>;
        styling: Record<string, any> | null;
        tenantId: string;
    }>;
    createDefaultTemplate(tenantId: string, tenantName: string, packageType: string): Promise<typeof wbTemplates.$inferSelect>;
}
