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
import { PackageType, PACKAGES, ADDONS } from './package.helper';
import { AddonType } from './dto/subscription.types';
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

    const pkg = PACKAGES[tenant.package as PackageType];
    const base: PackageLimits = pkg
      ? {
          users: pkg.features.maxUsers,
          posts: pkg.features.maxPosts,
          pages: pkg.features.maxPages,
          products: pkg.features.maxProducts,
          emailsPerMonth: pkg.features.maxSubscribers,
          subscribers: pkg.features.maxSubscribers,
          aiCredits: pkg.features.aiCreditsPerMonth,
          storageMb: pkg.features.storageMb,
        }
      : {
          users: 1,
          posts: 0,
          pages: 3,
          products: 0,
          emailsPerMonth: 0,
          subscribers: 0,
          aiCredits: 0,
          storageMb: 0,
        };

    return activeAddons.reduce((limits, addon) => {
      const def = Object.values(ADDONS).find((a) => a.type === addon.addonType);
      if (!def) return limits;
      return {
        users: def.adds.maxUsers
          ? limits.users + def.adds.maxUsers
          : limits.users,
        posts: def.adds.maxPosts
          ? limits.posts + def.adds.maxPosts
          : limits.posts,
        pages: def.adds.maxPages
          ? limits.pages + def.adds.maxPages
          : limits.pages,
        products: def.adds.maxProducts
          ? limits.products + def.adds.maxProducts
          : limits.products,
        emailsPerMonth: def.adds.maxSubscribers
          ? limits.emailsPerMonth + def.adds.maxSubscribers
          : limits.emailsPerMonth,
        subscribers: def.adds.maxSubscribers
          ? limits.subscribers + def.adds.maxSubscribers
          : limits.subscribers,
        aiCredits: def.adds.aiCreditsPerMonth
          ? limits.aiCredits + def.adds.aiCreditsPerMonth
          : limits.aiCredits,
        storageMb: limits.storageMb,
      };
    }, base);
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
    addonType: string,
    quantity: number = 1,
  ) {
    const existing = await this.db
      .select()
      .from(tenantAddons)
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.addonType, addonType as any),
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
        addonType: addonType as any,
        quantity,
        isActive: true,
      });
    }
     if (addonType === 'restaurant_module') {
    await this.db.update(tenants).set({ restaurant: true, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  } else if (addonType === 'local_store_module') {
    await this.db.update(tenants).set({ localStore: true, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  } else if (addonType === 'funnels_module') {
    await this.db.update(tenants).set({ funnels: true, maxFunnels: 10 * quantity, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  }
}

  async deactivateAddon(tenantId: string, addonType: string) {
    await this.db
      .update(tenantAddons)
      .set({ isActive: false })
      .where(
        and(
          eq(tenantAddons.tenantId, tenantId),
          eq(tenantAddons.addonType, addonType as any),
        ),
      );
 if (addonType === 'restaurant_module') {
    await this.db.update(tenants).set({ restaurant: false, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  } else if (addonType === 'local_store_module') {
    await this.db.update(tenants).set({ localStore: false, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  } else if (addonType === 'funnels_module') {
    await this.db.update(tenants).set({ funnels: false, maxFunnels: 0, updatedAt: new Date() }).where(eq(tenants.id, tenantId));
  }
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
