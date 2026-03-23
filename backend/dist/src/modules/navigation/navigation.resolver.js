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
exports.NavigationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const navigation_service_1 = require("./navigation.service");
const navigation_entity_1 = require("./entities/navigation.entity");
const navigation_item_entity_1 = require("./entities/navigation-item.entity");
const create_navigation_input_1 = require("./dto/create-navigation.input");
const update_navigation_input_1 = require("./dto/update-navigation.input");
const create_navigation_item_input_1 = require("./dto/create-navigation-item.input");
const update_navigation_item_input_1 = require("./dto/update-navigation-item.input");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
let NavigationResolver = class NavigationResolver {
    navigationService;
    constructor(navigationService) {
        this.navigationService = navigationService;
    }
    async createNavigation(input, tenantId) {
        return this.navigationService.createNavigation(tenantId, input);
    }
    async navigations(tenantId) {
        return this.navigationService.findAll(tenantId);
    }
    async navigationByLocation(location, tenantId) {
        return this.navigationService.findByLocation(tenantId, location);
    }
    async navigation(id, tenantId) {
        return this.navigationService.findOne(id, tenantId);
    }
    async updateNavigation(id, input, tenantId) {
        return this.navigationService.updateNavigation(id, tenantId, input);
    }
    async deleteNavigation(id, tenantId) {
        return this.navigationService.deleteNavigation(id, tenantId);
    }
    async createNavigationItem(navigationId, input, tenantId) {
        return this.navigationService.createNavigationItem(navigationId, tenantId, input);
    }
    async navigationItems(navigationId, tenantId) {
        return this.navigationService.findNavigationItems(navigationId, tenantId);
    }
    async updateNavigationItem(itemId, input, tenantId) {
        return this.navigationService.updateNavigationItem(itemId, tenantId, input);
    }
    async deleteNavigationItem(itemId, tenantId) {
        return this.navigationService.deleteNavigationItem(itemId, tenantId);
    }
    async reorderNavigationItems(navigationId, itemOrders, tenantId) {
        return this.navigationService.reorderNavigationItems(navigationId, tenantId, itemOrders);
    }
};
exports.NavigationResolver = NavigationResolver;
__decorate([
    (0, graphql_1.Mutation)(() => navigation_entity_1.Navigation),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_navigation_input_1.CreateNavigationInput, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "createNavigation", null);
__decorate([
    (0, graphql_1.Query)(() => [navigation_entity_1.Navigation]),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "navigations", null);
__decorate([
    (0, graphql_1.Query)(() => navigation_entity_1.Navigation, { nullable: true }),
    __param(0, (0, graphql_1.Args)('location')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "navigationByLocation", null);
__decorate([
    (0, graphql_1.Query)(() => navigation_entity_1.Navigation),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "navigation", null);
__decorate([
    (0, graphql_1.Mutation)(() => navigation_entity_1.Navigation),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_navigation_input_1.UpdateNavigationInput, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "updateNavigation", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "deleteNavigation", null);
__decorate([
    (0, graphql_1.Mutation)(() => navigation_item_entity_1.NavigationItem),
    __param(0, (0, graphql_1.Args)('navigationId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_navigation_item_input_1.CreateNavigationItemInput, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "createNavigationItem", null);
__decorate([
    (0, graphql_1.Query)(() => [navigation_item_entity_1.NavigationItem]),
    __param(0, (0, graphql_1.Args)('navigationId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "navigationItems", null);
__decorate([
    (0, graphql_1.Mutation)(() => navigation_item_entity_1.NavigationItem),
    __param(0, (0, graphql_1.Args)('itemId')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_navigation_item_input_1.UpdateNavigationItemInput, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "updateNavigationItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('itemId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "deleteNavigationItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('navigationId')),
    __param(1, (0, graphql_1.Args)('itemOrders', { type: () => [ItemOrderInput] })),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", Promise)
], NavigationResolver.prototype, "reorderNavigationItems", null);
exports.NavigationResolver = NavigationResolver = __decorate([
    (0, graphql_1.Resolver)(() => navigation_entity_1.Navigation),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:paramtypes", [navigation_service_1.NavigationService])
], NavigationResolver);
let ItemOrderInput = class ItemOrderInput {
    id;
    order;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ItemOrderInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ItemOrderInput.prototype, "order", void 0);
ItemOrderInput = __decorate([
    (0, graphql_1.InputType)()
], ItemOrderInput);
//# sourceMappingURL=navigation.resolver.js.map