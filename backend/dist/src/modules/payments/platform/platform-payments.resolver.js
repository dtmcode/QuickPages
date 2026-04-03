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
exports.PlatformPaymentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_2 = require("@nestjs/graphql");
const gql_auth_guard_1 = require("../../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../../core/auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../../core/auth/decorators/current-user.decorator");
const platform_payments_service_1 = require("./platform-payments.service");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let PlatformPaymentStatus = class PlatformPaymentStatus {
    stripeConfigured;
    message;
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], PlatformPaymentStatus.prototype, "stripeConfigured", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], PlatformPaymentStatus.prototype, "message", void 0);
PlatformPaymentStatus = __decorate([
    (0, graphql_2.ObjectType)()
], PlatformPaymentStatus);
let CheckoutSessionResult = class CheckoutSessionResult {
    url;
    isDirect;
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CheckoutSessionResult.prototype, "url", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], CheckoutSessionResult.prototype, "isDirect", void 0);
CheckoutSessionResult = __decorate([
    (0, graphql_2.ObjectType)()
], CheckoutSessionResult);
let PlatformPaymentsResolver = class PlatformPaymentsResolver {
    platformPaymentsService;
    db;
    constructor(platformPaymentsService, db) {
        this.platformPaymentsService = platformPaymentsService;
        this.db = db;
    }
    platformPaymentStatus() {
        const configured = this.platformPaymentsService.isStripeConfigured();
        return {
            stripeConfigured: configured,
            message: configured
                ? 'Stripe ist aktiv und konfiguriert.'
                : 'Stripe-Integration in Vorbereitung. Bitte STRIPE_SECRET_KEY in .env setzen.',
        };
    }
    async changePackage(targetPackage, successUrl, cancelUrl, tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann das Paket ändern');
        const [dbUser] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.userId))
            .limit(1);
        const email = dbUser?.email || '';
        const result = await this.platformPaymentsService.createPackageCheckout({
            tenantId,
            targetPackage,
            userEmail: email,
            successUrl: successUrl ||
                `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/packages?success=true&package=${targetPackage}`,
            cancelUrl: cancelUrl ||
                `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/packages?cancelled=true`,
        });
        return result;
    }
    async createAddonCheckout(addonType, successUrl, cancelUrl, tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann Add-ons kaufen');
        const [dbUser] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.userId))
            .limit(1);
        const result = await this.platformPaymentsService.createAddonCheckout({
            tenantId,
            addonType,
            userEmail: dbUser?.email || '',
            successUrl: successUrl ||
                `${process.env.FRONTEND_URL}/dashboard/packages?addon_success=true&addon=${addonType}`,
            cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/dashboard/packages`,
        });
        return result;
    }
    async createBillingPortalSession(returnUrl, tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann das Billing Portal öffnen');
        return this.platformPaymentsService.createBillingPortalSession(tenantId, returnUrl);
    }
    async cancelSubscription(tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann kündigen');
        await this.platformPaymentsService.cancelAtPeriodEnd(tenantId);
        return true;
    }
    async reactivateSubscription(tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann reaktivieren');
        await this.platformPaymentsService.reactivate(tenantId);
        return true;
    }
    async activateAddon(addonType, tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann Add-ons aktivieren');
        await this.platformPaymentsService.directActivateAddon(tenantId, addonType);
        return true;
    }
    async deactivateAddon(addonType, tenantId, user) {
        if (user.role !== 'owner')
            throw new Error('Nur der Owner kann Add-ons deaktivieren');
        await this.platformPaymentsService.directDeactivateAddon(tenantId, addonType);
        return true;
    }
};
exports.PlatformPaymentsResolver = PlatformPaymentsResolver;
__decorate([
    (0, graphql_1.Query)(() => PlatformPaymentStatus),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", PlatformPaymentStatus)
], PlatformPaymentsResolver.prototype, "platformPaymentStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => CheckoutSessionResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('targetPackage')),
    __param(1, (0, graphql_1.Args)('successUrl', { nullable: true, defaultValue: '' })),
    __param(2, (0, graphql_1.Args)('cancelUrl', { nullable: true, defaultValue: '' })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "changePackage", null);
__decorate([
    (0, graphql_1.Mutation)(() => CheckoutSessionResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('addonType')),
    __param(1, (0, graphql_1.Args)('successUrl', { nullable: true, defaultValue: '' })),
    __param(2, (0, graphql_1.Args)('cancelUrl', { nullable: true, defaultValue: '' })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "createAddonCheckout", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('returnUrl')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "createBillingPortalSession", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "cancelSubscription", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "reactivateSubscription", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('addonType')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "activateAddon", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('addonType')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PlatformPaymentsResolver.prototype, "deactivateAddon", null);
exports.PlatformPaymentsResolver = PlatformPaymentsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __param(1, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [platform_payments_service_1.PlatformPaymentsService, Object])
], PlatformPaymentsResolver);
//# sourceMappingURL=platform-payments.resolver.js.map