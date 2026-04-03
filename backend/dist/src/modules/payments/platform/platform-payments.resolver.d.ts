import type { JwtPayload } from '../../../core/auth/strategies/jwt.strategy';
import { PlatformPaymentsService } from './platform-payments.service';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
declare class PlatformPaymentStatus {
    stripeConfigured: boolean;
    message: string;
}
declare class CheckoutSessionResult {
    url: string;
    isDirect: boolean;
}
export declare class PlatformPaymentsResolver {
    private readonly platformPaymentsService;
    private db;
    constructor(platformPaymentsService: PlatformPaymentsService, db: DrizzleDB);
    platformPaymentStatus(): PlatformPaymentStatus;
    changePackage(targetPackage: string, successUrl: string, cancelUrl: string, tenantId: string, user: JwtPayload): Promise<CheckoutSessionResult>;
    createAddonCheckout(addonType: string, successUrl: string, cancelUrl: string, tenantId: string, user: JwtPayload): Promise<CheckoutSessionResult>;
    createBillingPortalSession(returnUrl: string, tenantId: string, user: JwtPayload): Promise<string>;
    cancelSubscription(tenantId: string, user: JwtPayload): Promise<boolean>;
    reactivateSubscription(tenantId: string, user: JwtPayload): Promise<boolean>;
    activateAddon(addonType: string, tenantId: string, user: JwtPayload): Promise<boolean>;
    deactivateAddon(addonType: string, tenantId: string, user: JwtPayload): Promise<boolean>;
}
export {};
