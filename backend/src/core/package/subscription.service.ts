import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import {
  tenants,
  subscriptions,
  tenantAddons,
  usageTracking,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import {
  AddonType,
  calculateTotalLimits,
  PackageLimits,
} from './package.helper'; // ← canUpgradeTo ENTFERNT
import { TenantSubscriptionInfo } from './dto/subscription.types';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getTenantLimits(tenantId: string): Promise<PackageLimits> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant nicht gefunden');
    }

    const activeAddons = await this.db
      .select()
      .from(tenantAddons)
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.isActive, true),
        ),
      );

    const addonTypes = activeAddons.map((a) => a.addonType as AddonType);
    return calculateTotalLimits(tenant.package, addonTypes);
  }

  async getCurrentUsage(tenantId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [usage] = await this.db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.tenantId, tenantId),
          eq(usageTracking.month, currentMonth),
        ),
      )
      .limit(1);

    return {
      month: currentMonth,
      emailsSent: usage?.emailsSent ?? 0,
      productsCreated: usage?.productsCreated ?? 0,
      postsCreated: usage?.postsCreated ?? 0,
      apiCalls: usage?.apiCalls ?? 0,
      storageUsedMb: usage?.storageUsedMb ?? 0,
    };
  }

  async getTenantSubscriptionInfo(
    tenantId: string,
  ): Promise<TenantSubscriptionInfo> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant nicht gefunden');
    }

    const limits = await this.getTenantLimits(tenantId);
    const usage = await this.getCurrentUsage(tenantId);

    const activeAddons = await this.db
      .select()
      .from(tenantAddons)
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.isActive, true),
        ),
      );

    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    return {
      currentPackage: tenant.package,
      limits,
      addons: activeAddons.map((addon) => ({
        id: addon.id,
        addonType: addon.addonType as any,
        quantity: addon.quantity ?? 1,
        isActive: addon.isActive ?? true,
        activatedAt: addon.activatedAt ?? new Date(),
        expiresAt: addon.expiresAt ?? undefined,
        createdAt: addon.createdAt ?? new Date(),
      })),
      currentUsage: usage,
      subscription: subscription
        ? {
            id: subscription.id,
            package: subscription.package,
            status: subscription.status as any,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
            stripeSubscriptionId:
              subscription.stripeSubscriptionId ?? undefined,
            createdAt: subscription.createdAt ?? new Date(),
          }
        : undefined,
    };
  }

  async activateAddon(
    tenantId: string,
    addonType: AddonType,
    quantity: number = 1,
  ) {
    const existing = await this.db
      .select()
      .from(tenantAddons)
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.addonType, addonType),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(tenantAddons)
        .set({ isActive: true, quantity })
        .where(eq(tenantAddons.id, existing[0].id));
    } else {
      await this.db.insert(tenantAddons).values({
        tenantId,
        addonType,
        quantity,
        isActive: true,
      });
    }
  }

  async deactivateAddon(tenantId: string, addonType: AddonType) {
    await this.db
      .update(tenantAddons)
      .set({ isActive: false })
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.addonType, addonType),
        ),
      );
  }

  // ← UMBENENNT & VEREINFACHT!
  async changePackage(tenantId: string, targetPackage: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant nicht gefunden');
    }

    // KEINE Downgrade-Prüfung! Alle Änderungen erlaubt
    // if (!canUpgradeTo(tenant.package, targetPackage)) {
    //   throw new Error('Downgrade ist nicht erlaubt');
    // }

    await this.db
      .update(tenants)
      .set({ package: targetPackage as any, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    // Update or create subscription
    const [existingSub] = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (existingSub) {
      await this.db
        .update(subscriptions)
        .set({
          package: targetPackage as any,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existingSub.id));
    } else {
      await this.db.insert(subscriptions).values({
        tenantId,
        package: targetPackage as any,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }
  }

  // ← ALIAS für Backwards Compatibility
  async upgradePackage(tenantId: string, targetPackage: string) {
    return this.changePackage(tenantId, targetPackage);
  }

  async incrementUsage(
    tenantId: string,
    type: 'emails' | 'products' | 'posts' | 'api',
  ) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const field = {
      emails: 'emailsSent',
      products: 'productsCreated',
      posts: 'postsCreated',
      api: 'apiCalls',
    }[type];

    const [existing] = await this.db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.tenantId, tenantId),
          eq(usageTracking.month, currentMonth),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .update(usageTracking)
        .set({
          [field]: (existing as any)[field] + 1,
          updatedAt: new Date(),
        })
        .where(eq(usageTracking.id, existing.id));
    } else {
      await this.db.insert(usageTracking).values({
        tenantId,
        month: currentMonth,
        [field]: 1,
      });
    }
  }

  async canPerformAction(
    tenantId: string,
    action: 'create_product' | 'send_email' | 'create_post',
  ): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getTenantLimits(tenantId);
    const usage = await this.getCurrentUsage(tenantId);

    switch (action) {
      case 'create_product':
        const productLimit = limits.products;
        if (productLimit === -1) return { allowed: true };
        if (usage.productsCreated >= productLimit) {
          return {
            allowed: false,
            reason: `Produkt-Limit erreicht (${productLimit})`,
          };
        }
        return { allowed: true };

      case 'send_email':
        const emailLimit = limits.emailsPerMonth;
        if (emailLimit === -1) return { allowed: true };
        if (usage.emailsSent >= emailLimit) {
          return {
            allowed: false,
            reason: `Email-Limit erreicht (${emailLimit})`,
          };
        }
        return { allowed: true };

      case 'create_post':
        const postLimit = limits.posts;
        if (postLimit === -1) return { allowed: true };
        if (usage.postsCreated >= postLimit) {
          return {
            allowed: false,
            reason: `Post-Limit erreicht (${postLimit})`,
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }
}
