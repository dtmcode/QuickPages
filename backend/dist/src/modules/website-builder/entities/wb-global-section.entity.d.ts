import { SectionType } from './section.entity';
export declare class WbGlobalSection {
    id: string;
    name: string;
    type: SectionType;
    description?: string;
    category?: string;
    thumbnailUrl?: string;
    order: number;
    content: Record<string, any>;
    styling?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
