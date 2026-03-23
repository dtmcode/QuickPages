import { SectionType } from '../entities/section.entity';
export declare class CreateSectionInput {
    pageId: string;
    name: string;
    type: SectionType;
    order?: number;
    isActive?: boolean;
    content?: Record<string, any>;
    styling?: Record<string, any>;
}
