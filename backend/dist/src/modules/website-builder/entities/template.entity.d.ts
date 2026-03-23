import { Page } from './page.entity';
export declare class Template {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    isActive: boolean;
    isDefault: boolean;
    settings?: Record<string, any>;
    pages?: Page[];
    createdAt: Date;
    updatedAt: Date;
}
