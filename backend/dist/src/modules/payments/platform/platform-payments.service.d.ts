import { ConfigService } from '@nestjs/config';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
export interface CheckoutResult {
    url: string;
    isDirect: boolean;
}
export declare class PlatformPaymentsService {
    private config;
    private db;
    private stripe;
    constructor(config: ConfigService, db: DrizzleDB);
    isStripeConfigured(): boolean;
    isBypassTenant(tenant: any): boolean;
    private getOrCreateCustomer;
    createPackageCheckout(params: {
        tenantId: string;
        targetPackage: string;
        userEmail: string;
        successUrl: string;
        cancelUrl: string;
    }): Promise<CheckoutResult>;
    createAddonCheckout(params: {
        tenantId: string;
        addonType: string;
        userEmail: string;
        successUrl: string;
        cancelUrl: string;
    }): Promise<CheckoutResult>;
    createBillingPortalSession(tenantId: string, returnUrl: string): Promise<string>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    directChangePackage(tenantId: string, targetPackage: string, stripeSubscriptionId?: string): Promise<void>;
    directActivateAddon(tenantId: string, addonType: string, stripeSubscriptionId?: string): Promise<void>;
    directDeactivateAddon(tenantId: string, addonType: string): Promise<void>;
    cancelAtPeriodEnd(tenantId: string): Promise<void>;
    reactivate(tenantId: string): Promise<void>;
    private mapStatus;
}
