export declare class CreatePageInput {
    templateId: string;
    name: string;
    slug: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isActive?: boolean;
    isHomepage?: boolean;
    order?: number;
    settings?: Record<string, any>;
}
