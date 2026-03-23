import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SubscriptionService } from './subscription.service';
import { TenantSubscriptionInfo, AvailablePackagesResponse } from './dto/subscription.types';
export declare class SubscriptionResolver {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    availablePackages(): AvailablePackagesResponse;
    tenantSubscription(tenantId: string): Promise<TenantSubscriptionInfo>;
    activateAddon(addonType: string, quantity: number, tenantId: string, user: JwtPayload): Promise<boolean>;
    deactivateAddon(addonType: string, tenantId: string, user: JwtPayload): Promise<boolean>;
    changePackage(targetPackage: string, tenantId: string, user: JwtPayload): Promise<string>;
}
