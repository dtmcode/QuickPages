import { WebsiteBuilderService } from './website-builder.service';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
export declare class WebsiteBuilderResolver {
    private readonly service;
    constructor(service: WebsiteBuilderService);
    getGlobalTemplates(limit?: number): Promise<{
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
    getGlobalTemplate(id: string): Promise<{
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
    getTemplates(tenantId: string): Promise<{
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
    getTemplate(id: string, tenantId: string): Promise<{
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
    getDefaultTemplate(tenantId: string): Promise<{
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
    createTemplate(input: CreateTemplateInput, tenantId: string): Promise<{
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
    updateTemplate(id: string, input: UpdateTemplateInput, tenantId: string): Promise<{
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
    setDefaultTemplate(id: string, tenantId: string): Promise<{
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
    getPages(tenantId: string, templateId?: string): Promise<{
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
    getPage(id: string, tenantId: string): Promise<{
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
    getPageBySlug(slug: string, tenantId: string, templateId?: string): Promise<{
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
    getHomepage(tenantId: string, templateId: string): Promise<{
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
    createPage(input: CreatePageInput, tenantId: string): Promise<{
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
    updatePage(id: string, input: UpdatePageInput, tenantId: string): Promise<{
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
    reorderSections(pageId: string, sectionIds: string[], tenantId: string): Promise<{
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
    getSections(tenantId: string, pageId?: string): Promise<{
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
    getSection(id: string, tenantId: string): Promise<{
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
    createSection(input: CreateSectionInput, tenantId: string): Promise<{
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
    updateSection(id: string, input: UpdateSectionInput, tenantId: string): Promise<{
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
    moveSection(id: string, targetPageId: string, tenantId: string): Promise<{
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
    getGlobalSections(): Promise<{
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
    getGlobalSection(id: string): Promise<{
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
}
