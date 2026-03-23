import { SectionType } from '../entities/section.entity';
export declare class UpdateSectionInput {
    name?: string;
    type?: SectionType;
    order?: number;
    isActive?: boolean;
    content?: Record<string, any>;
    styling?: Record<string, any>;
}
