import type { DrizzleDB } from '../../core/database/drizzle.module';
import { CreateNavigationInput } from './dto/create-navigation.input';
import { UpdateNavigationInput } from './dto/update-navigation.input';
import { CreateNavigationItemInput } from './dto/create-navigation-item.input';
import { UpdateNavigationItemInput } from './dto/update-navigation-item.input';
export declare class NavigationService {
    private db;
    constructor(db: DrizzleDB);
    createNavigation(tenantId: string, input: CreateNavigationInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        location: string;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        location: string;
        items: {
            [x: string]: any;
        }[];
    }[]>;
    findByLocation(tenantId: string, location: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        location: string;
        items: {
            [x: string]: any;
        }[];
    } | null>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        location: string;
        items: {
            [x: string]: any;
        }[];
    }>;
    updateNavigation(id: string, tenantId: string, input: UpdateNavigationInput): Promise<{
        id: string;
        tenantId: string;
        name: string;
        location: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteNavigation(id: string, tenantId: string): Promise<boolean>;
    createNavigationItem(navigationId: string, tenantId: string, input: CreateNavigationItemInput): Promise<any>;
    findNavigationItems(navigationId: string, tenantId: string): Promise<{
        [x: string]: any;
    }[]>;
    updateNavigationItem(itemId: string, tenantId: string, input: UpdateNavigationItemInput): Promise<{
        [x: string]: any;
    }>;
    deleteNavigationItem(itemId: string, tenantId: string): Promise<boolean>;
    reorderNavigationItems(navigationId: string, tenantId: string, itemOrders: {
        id: string;
        order: number;
    }[]): Promise<boolean>;
}
