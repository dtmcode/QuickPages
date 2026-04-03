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
exports.SubscriptionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const subscription_service_1 = require("./subscription.service");
const subscription_types_1 = require("./dto/subscription.types");
const package_helper_1 = require("./package.helper");
let SubscriptionResolver = class SubscriptionResolver {
    subscriptionService;
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    availablePackages() {
        const packages = Object.values(package_helper_1.PACKAGES).map((pkg) => ({
            type: pkg.type,
            name: pkg.name,
            description: pkg.description,
            price: pkg.priceMonthly,
            limits: {
                users: pkg.features.maxUsers,
                posts: pkg.features.maxPosts,
                pages: pkg.features.maxPages,
                products: pkg.features.maxProducts,
                emailsPerMonth: pkg.features.maxSubscribers,
                subscribers: pkg.features.maxSubscribers,
                aiCredits: pkg.features.aiCreditsPerMonth,
                storageMb: pkg.features.storageMb,
            },
            features: pkg.highlightFeatures,
        }));
        const addons = Object.values(package_helper_1.ADDONS).map((def) => ({
            type: def.type,
            name: def.name,
            description: def.description,
            price: def.priceMonthly,
            limits: {
                users: def.adds.maxUsers ?? 0,
                posts: def.adds.maxPosts ?? 0,
                pages: def.adds.maxPages ?? 0,
                products: def.adds.maxProducts ?? 0,
                emailsPerMonth: def.adds.maxSubscribers ?? 0,
                subscribers: def.adds.maxSubscribers ?? 0,
                aiCredits: def.adds.aiCreditsPerMonth ?? 0,
                storageMb: 0,
            },
        }));
        return { packages, addons };
    }
    async tenantSubscription(tenantId) {
        return await this.subscriptionService.getTenantSubscriptionInfo(tenantId);
    }
    async activateAddon(addonType, quantity, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Add-ons aktivieren');
        }
        const validAddons = Object.values(subscription_types_1.AddonType);
        if (!validAddons.includes(addonType)) {
            throw new Error(`Ungültiger Add-on Typ: ${addonType}`);
        }
        await this.subscriptionService.activateAddon(tenantId, addonType, quantity);
        return true;
    }
    async deactivateAddon(addonType, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Add-ons deaktivieren');
        }
        await this.subscriptionService.deactivateAddon(tenantId, addonType);
        return true;
    }
    async changePackage(targetPackage, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann das Package ändern');
        }
        await this.subscriptionService.changePackage(tenantId, targetPackage);
        return targetPackage;
    }
};
exports.SubscriptionResolver = SubscriptionResolver;
__decorate([
    (0, graphql_1.Query)(() => subscription_types_1.AvailablePackagesResponse),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", subscription_types_1.AvailablePackagesResponse)
], SubscriptionResolver.prototype, "availablePackages", null);
__decorate([
    (0, graphql_1.Query)(() => subscription_types_1.TenantSubscriptionInfo),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "tenantSubscription", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('addonType', { type: () => String })),
    __param(1, (0, graphql_1.Args)('quantity', { nullable: true, defaultValue: 1 })),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "activateAddon", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('addonType', { type: () => String })),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "deactivateAddon", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('targetPackage')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "changePackage", null);
exports.SubscriptionResolver = SubscriptionResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionResolver);
//# sourceMappingURL=subscription.resolver.js.map