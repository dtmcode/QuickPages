import { Template } from './template.entity';
import { Section } from './section.entity';
export declare class Page {
    id: string;
    tenantId: string;
    templateId: string;
    name: string;
    slug: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isActive: boolean;
    isHomepage: boolean;
    order: number;
    settings?: Record<string, any>;
    template?: Template;
    sections?: Section[];
    createdAt: Date;
    updatedAt: Date;
}
