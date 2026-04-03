import type { DrizzleDB } from '../database/drizzle.module';
import { TenantSubscriptionInfo } from './dto/subscription.types';
export interface PackageLimits {
    users: number;
    posts: number;
    pages: number;
    products: number;
    emailsPerMonth: number;
    subscribers: number;
    aiCredits: number;
    storageMb: number;
}
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
    activateAddon(tenantId: string, addonType: string, quantity?: number): Promise<void>;
    deactivateAddon(tenantId: string, addonType: string): Promise<void>;
    changePackage(tenantId: string, targetPackage: string): Promise<void>;
    upgradePackage(tenantId: string, targetPackage: string): Promise<void>;
    incrementUsage(tenantId: string, type: 'emails' | 'products' | 'posts' | 'api'): Promise<void>;
    canPerformAction(tenantId: string, action: 'create_product' | 'send_email' | 'create_post'): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
}
