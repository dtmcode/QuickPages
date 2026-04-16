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
exports.LocalStoreResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const local_store_service_1 = require("./local-store.service");
const local_store_types_1 = require("./dto/local-store.types");
const local_store_input_1 = require("./dto/local-store.input");
let LocalStoreResolver = class LocalStoreResolver {
    localStoreService;
    constructor(localStoreService) {
        this.localStoreService = localStoreService;
    }
    async localStoreSettings(tenantId) {
        return this.localStoreService.getSettings(tenantId);
    }
    async updateLocalStoreSettings(tenantId, input) {
        return this.localStoreService.updateSettings(tenantId, input);
    }
    async localProducts(tenantId) {
        return this.localStoreService.getProducts(tenantId);
    }
    async createLocalProduct(tenantId, input) {
        return this.localStoreService.createProduct(tenantId, input);
    }
    async updateLocalProduct(tenantId, id, input) {
        return this.localStoreService.updateProduct(tenantId, id, input);
    }
    async deleteLocalProduct(tenantId, id) {
        return this.localStoreService.deleteProduct(tenantId, id);
    }
    async localDeals(tenantId) {
        return this.localStoreService.getDeals(tenantId);
    }
    async createLocalDeal(tenantId, input) {
        return this.localStoreService.createDeal(tenantId, input);
    }
    async updateLocalDeal(tenantId, id, input) {
        return this.localStoreService.updateDeal(tenantId, id, input);
    }
    async deleteLocalDeal(tenantId, id) {
        return this.localStoreService.deleteDeal(tenantId, id);
    }
    async localPickupSlots(tenantId) {
        return this.localStoreService.getPickupSlots(tenantId);
    }
    async availablePickupSlots(tenantId, days) {
        return this.localStoreService.getAvailablePickupSlots(tenantId, days ?? 7);
    }
    async createLocalPickupSlot(tenantId, input) {
        return this.localStoreService.createPickupSlot(tenantId, input);
    }
    async updateLocalPickupSlot(tenantId, id, input) {
        return this.localStoreService.updatePickupSlot(tenantId, id, input);
    }
    async deleteLocalPickupSlot(tenantId, id) {
        return this.localStoreService.deletePickupSlot(tenantId, id);
    }
    async localOrders(tenantId, status) {
        return this.localStoreService.getOrders(tenantId, status);
    }
    async localOrder(tenantId, id) {
        return this.localStoreService.getOrderById(tenantId, id);
    }
    async createLocalOrder(tenantId, input) {
        return this.localStoreService.createOrder(tenantId, input);
    }
    async updateLocalOrderStatus(tenantId, id, input) {
        return this.localStoreService.updateOrderStatus(tenantId, id, input);
    }
    async confirmLocalOrderPickup(tenantId, orderId, pickupCode) {
        return this.localStoreService.confirmPickup(tenantId, orderId, pickupCode);
    }
};
exports.LocalStoreResolver = LocalStoreResolver;
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalStoreSettings),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localStoreSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalStoreSettings),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, local_store_input_1.UpdateLocalStoreSettingsInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "updateLocalStoreSettings", null);
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalProductsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localProducts", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalProduct),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, local_store_input_1.CreateLocalProductInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "createLocalProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalProduct),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, local_store_input_1.UpdateLocalProductInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "updateLocalProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "deleteLocalProduct", null);
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalDealsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localDeals", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalDeal),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, local_store_input_1.CreateLocalDealInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "createLocalDeal", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalDeal),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, local_store_input_1.UpdateLocalDealInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "updateLocalDeal", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "deleteLocalDeal", null);
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalPickupSlotsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localPickupSlots", null);
__decorate([
    (0, graphql_1.Query)(() => [local_store_types_1.AvailablePickupSlot]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('days', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "availablePickupSlots", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalPickupSlot),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, local_store_input_1.CreatePickupSlotInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "createLocalPickupSlot", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalPickupSlot),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, local_store_input_1.UpdatePickupSlotInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "updateLocalPickupSlot", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "deleteLocalPickupSlot", null);
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalOrdersResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localOrders", null);
__decorate([
    (0, graphql_1.Query)(() => local_store_types_1.LocalOrder),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "localOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalOrder),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, local_store_input_1.CreateLocalOrderInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "createLocalOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => local_store_types_1.LocalOrder),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, local_store_input_1.UpdateLocalOrderStatusInput]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "updateLocalOrderStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('pickupCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LocalStoreResolver.prototype, "confirmLocalOrderPickup", null);
exports.LocalStoreResolver = LocalStoreResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [local_store_service_1.LocalStoreService])
], LocalStoreResolver);
//# sourceMappingURL=local-store.resolver.js.map