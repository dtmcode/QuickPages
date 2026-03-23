export declare class WbGlobalTemplate {
    id: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    category?: string;
    isActive: boolean;
    isPremium: boolean;
    settings?: Record<string, any>;
    previewUrl?: string;
    demoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WbGlobalTemplatePage {
    id: string;
    templateId: string;
    name: string;
    slug: string;
    description?: string;
    isHomepage: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WbGlobalTemplateSection {
    id: string;
    pageId: string;
    name: string;
    type: string;
    order: number;
    content: Record<string, any>;
    styling?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
