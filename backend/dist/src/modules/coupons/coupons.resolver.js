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
exports.CouponsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const coupons_service_1 = require("./coupons.service");
const coupons_types_1 = require("./dto/coupons.types");
const coupons_input_1 = require("./dto/coupons.input");
let CouponsResolver = class CouponsResolver {
    couponsService;
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async coupons(tenantId) {
        return this.couponsService.getCoupons(tenantId);
    }
    async coupon(tenantId, id) {
        return this.couponsService.getCouponById(tenantId, id);
    }
    async couponUses(tenantId, couponId) {
        return this.couponsService.getCouponUses(tenantId, couponId);
    }
    async validateCoupon(tenantId, input) {
        return this.couponsService.validateCoupon(tenantId, input);
    }
    async createCoupon(tenantId, input) {
        return this.couponsService.createCoupon(tenantId, input);
    }
    async updateCoupon(tenantId, id, input) {
        return this.couponsService.updateCoupon(tenantId, id, input);
    }
    async deleteCoupon(tenantId, id) {
        return this.couponsService.deleteCoupon(tenantId, id);
    }
};
exports.CouponsResolver = CouponsResolver;
__decorate([
    (0, graphql_1.Query)(() => coupons_types_1.CouponsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "coupons", null);
__decorate([
    (0, graphql_1.Query)(() => coupons_types_1.Coupon),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "coupon", null);
__decorate([
    (0, graphql_1.Query)(() => coupons_types_1.CouponUsesResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('couponId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "couponUses", null);
__decorate([
    (0, graphql_1.Query)(() => coupons_types_1.CouponValidationResult),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, coupons_input_1.ValidateCouponInput]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "validateCoupon", null);
__decorate([
    (0, graphql_1.Mutation)(() => coupons_types_1.Coupon),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, coupons_input_1.CreateCouponInput]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "createCoupon", null);
__decorate([
    (0, graphql_1.Mutation)(() => coupons_types_1.Coupon),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, coupons_input_1.UpdateCouponInput]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "updateCoupon", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CouponsResolver.prototype, "deleteCoupon", null);
exports.CouponsResolver = CouponsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService])
], CouponsResolver);
//# sourceMappingURL=coupons.resolver.js.map