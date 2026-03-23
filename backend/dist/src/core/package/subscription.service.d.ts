import type { DrizzleDB } from '../database/drizzle.module';
import { AddonType, PackageLimits } from './package.helper';
import { TenantSubscriptionInfo } from './dto/subscription.types';
export declare class SubscriptionService {
    private db;
    constructor(db: DrizzleDB);
    getTenantLimits(tenantId: string): Promise<PackageLimits>;
    getCurrentUsage(tenantId: string): Promise<{
        month: string;
        emailsSent: number;
        productsCreated: number;
        postsCreated: number;
        apiCalls: number;
        storageUsedMb: number;
    }>;
    getTenantSubscriptionInfo(tenantId: string): Promise<TenantSubscriptionInfo>;
    activateAddon(tenantId: string, addonType: AddonType, quantity?: number): Promise<void>;
    deactivateAddon(tenantId: string, addonType: AddonType): Promise<void>;
    changePackage(tenantId: string, targetPackage: string): Promise<void>;
    upgradePackage(tenantId: string, targetPackage: string): Promise<void>;
    incrementUsage(tenantId: string, type: 'emails' | 'products' | 'posts' | 'api'): Promise<void>;
    canPerformAction(tenantId: string, action: 'create_product' | 'send_email' | 'create_post'): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
}
