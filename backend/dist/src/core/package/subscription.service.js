"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const package_helper_1 = require("./package.helper");
let SubscriptionService = class SubscriptionService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getTenantLimits(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            throw new Error('Tenant nicht gefunden');
        }
        const activeAddons = await this.db
            .select()
            .from(schema_1.tenantAddons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.isActive, true)));
        const pkg = package_helper_1.PACKAGES[tenant.package];
        const base = pkg
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
            const def = Object.values(package_helper_1.ADDONS).find((a) => a.type === addon.addonType);
            if (!def)
                return limits;
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
    async getCurrentUsage(tenantId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [usage] = await this.db
            .select()
            .from(schema_1.usageTracking)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usageTracking.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.usageTracking.month, currentMonth)))
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
    async getTenantSubscriptionInfo(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            throw new Error('Tenant nicht gefunden');
        }
        const limits = await this.getTenantLimits(tenantId);
        const usage = await this.getCurrentUsage(tenantId);
        const activeAddons = await this.db
            .select()
            .from(schema_1.tenantAddons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.isActive, true)));
        const [subscription] = await this.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId))
            .limit(1);
        return {
            currentPackage: tenant.package,
            limits,
            addons: activeAddons.map((addon) => ({
                id: addon.id,
                addonType: addon.addonType,
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
                    status: subscription.status,
                    currentPeriodStart: subscription.currentPeriodStart,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
                    stripeSubscriptionId: subscription.stripeSubscriptionId ?? undefined,
                    createdAt: subscription.createdAt ?? new Date(),
                }
                : undefined,
        };
    }
    async activateAddon(tenantId, addonType, quantity = 1) {
        const existing = await this.db
            .select()
            .from(schema_1.tenantAddons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.addonType, addonType)))
            .limit(1);
        if (existing.length > 0) {
            await this.db
                .update(schema_1.tenantAddons)
                .set({ isActive: true, quantity })
                .where((0, drizzle_orm_1.eq)(schema_1.tenantAddons.id, existing[0].id));
        }
        else {
            await this.db.insert(schema_1.tenantAddons).values({
                tenantId,
                addonType: addonType,
                quantity,
                isActive: true,
            });
        }
        if (addonType === 'restaurant_module') {
            await this.db.update(schema_1.tenants).set({ restaurant: true, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
        else if (addonType === 'local_store_module') {
            await this.db.update(schema_1.tenants).set({ localStore: true, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
        else if (addonType === 'funnels_module') {
            await this.db.update(schema_1.tenants).set({ funnels: true, maxFunnels: 10 * quantity, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
    }
    async deactivateAddon(tenantId, addonType) {
        await this.db
            .update(schema_1.tenantAddons)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.addonType, addonType)));
        if (addonType === 'restaurant_module') {
            await this.db.update(schema_1.tenants).set({ restaurant: false, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
        else if (addonType === 'local_store_module') {
            await this.db.update(schema_1.tenants).set({ localStore: false, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
        else if (addonType === 'funnels_module') {
            await this.db.update(schema_1.tenants).set({ funnels: false, maxFunnels: 0, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        }
    }
    async changePackage(tenantId, targetPackage) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant) {
            throw new Error('Tenant nicht gefunden');
        }
        await this.db
            .update(schema_1.tenants)
            .set({ package: targetPackage, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        const [existingSub] = await this.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId))
            .limit(1);
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        if (existingSub) {
            await this.db
                .update(schema_1.subscriptions)
                .set({
                package: targetPackage,
                updatedAt: now,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, existingSub.id));
        }
        else {
            await this.db.insert(schema_1.subscriptions).values({
                tenantId,
                package: targetPackage,
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            });
        }
    }
    async upgradePackage(tenantId, targetPackage) {
        return this.changePackage(tenantId, targetPackage);
    }
    async incrementUsage(tenantId, type) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const field = {
            emails: 'emailsSent',
            products: 'productsCreated',
            posts: 'postsCreated',
            api: 'apiCalls',
        }[type];
        const [existing] = await this.db
            .select()
            .from(schema_1.usageTracking)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usageTracking.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.usageTracking.month, currentMonth)))
            .limit(1);
        if (existing) {
            await this.db
                .update(schema_1.usageTracking)
                .set({
                [field]: existing[field] + 1,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.usageTracking.id, existing.id));
        }
        else {
            await this.db.insert(schema_1.usageTracking).values({
                tenantId,
                month: currentMonth,
                [field]: 1,
            });
        }
    }
    async canPerformAction(tenantId, action) {
        const limits = await this.getTenantLimits(tenantId);
        const usage = await this.getCurrentUsage(tenantId);
        switch (action) {
            case 'create_product':
                const productLimit = limits.products;
                if (productLimit === -1)
                    return { allowed: true };
                if (usage.productsCreated >= productLimit) {
                    return {
                        allowed: false,
                        reason: `Produkt-Limit erreicht (${productLimit})`,
                    };
                }
                return { allowed: true };
            case 'send_email':
                const emailLimit = limits.emailsPerMonth;
                if (emailLimit === -1)
                    return { allowed: true };
                if (usage.emailsSent >= emailLimit) {
                    return {
                        allowed: false,
                        reason: `Email-Limit erreicht (${emailLimit})`,
                    };
                }
                return { allowed: true };
            case 'create_post':
                const postLimit = limits.posts;
                if (postLimit === -1)
                    return { allowed: true };
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
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map