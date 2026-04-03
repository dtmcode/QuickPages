import { NavigationItem } from './navigation-item.entity';
export declare class Navigation {
    id: string;
    tenantId: string;
    name: string;
    location: string;
    description?: string;
    isActive: boolean;
    settings?: Record<string, any>;
    items?: NavigationItem[];
    createdAt: Date;
    updatedAt: Date;
}
