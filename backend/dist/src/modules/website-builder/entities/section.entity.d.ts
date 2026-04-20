import { Page } from './page.entity';
export declare enum SectionType {
    freestyle = "freestyle",
    custom = "custom"
}
export declare class Section {
    id: string;
    tenantId: string;
    pageId: string;
    name: string;
    type: SectionType;
    order: number;
    isActive: boolean;
    content: Record<string, any>;
    styling?: Record<string, any>;
    page?: Page;
    createdAt: Date;
    updatedAt: Date;
}
