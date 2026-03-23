import { NavigationItem } from './navigation-item.entity';
export declare class Navigation {
    id: string;
    tenantId: string;
    name: string;
    location: string;
    description?: string;
    isActive: boolean;
    items?: NavigationItem[];
    createdAt: Date;
    updatedAt: Date;
}
