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
        const packages = [
            {
                type: 'page',
                name: 'Page',
                description: 'Eine professionelle Landing Page',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.PAGE],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.PAGE],
                },
                features: ['1 Landing Page', 'Website Builder', 'Basis-Analytics'],
            },
            {
                type: 'landing',
                name: 'Landing',
                description: 'Bis zu 3 Landing Pages mit Domain',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.LANDING],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.LANDING],
                },
                features: ['3 Landing Pages', 'Eigene Domain', 'Kontaktformular'],
            },
            {
                type: 'creator',
                name: 'Creator',
                description: 'Blog und mehrere Seiten',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.CREATOR],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.CREATOR],
                },
                features: ['10 Seiten', 'Blog (50 Posts)', 'Eigene Domain'],
            },
            {
                type: 'business',
                name: 'Business',
                description: 'Newsletter, Booking, Forms',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.BUSINESS],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.BUSINESS],
                },
                features: ['30 Seiten', 'Newsletter', 'Booking', 'Form Builder'],
            },
            {
                type: 'shop',
                name: 'Shop',
                description: 'Vollständiges Shop-System',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.SHOP],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.SHOP],
                },
                features: ['200 Produkte', 'Stripe Payments', 'Bestellverwaltung'],
            },
            {
                type: 'professional',
                name: 'Professional',
                description: 'AI, Mehrsprachigkeit, großer Shop',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.PROFESSIONAL],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.PROFESSIONAL],
                },
                features: ['AI Content', 'Mehrsprachigkeit', '1.000 Produkte'],
            },
            {
                type: 'enterprise',
                name: 'Enterprise',
                description: 'Unbegrenzte Ressourcen, White-Label',
                price: package_helper_1.PACKAGE_PRICES[package_helper_1.PackageType.ENTERPRISE],
                limits: {
                    ...package_helper_1.PACKAGE_LIMITS[package_helper_1.PackageType.ENTERPRISE],
                },
                features: ['White-Label', 'Unbegrenzte Ressourcen', 'Account Manager'],
            },
        ];
        const addons = Object.entries(package_helper_1.ADDON_DEFINITIONS).map(([key, def]) => ({
            type: key,
            name: def.name,
            description: def.description,
            price: def.price,
            limits: {
                users: def.limits.users ?? 0,
                posts: def.limits.posts ?? 0,
                pages: def.limits.pages ?? 0,
                products: def.limits.products ?? 0,
                emailsPerMonth: def.limits.emailsPerMonth ?? 0,
                subscribers: def.limits.subscribers ?? 0,
                aiCredits: def.limits.aiCredits ?? 0,
                storageMb: def.limits.storageMb ?? 0,
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