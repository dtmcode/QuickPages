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
exports.RestaurantResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const restaurant_service_1 = require("./restaurant.service");
const restaurant_types_1 = require("./dto/restaurant.types");
const restaurant_input_1 = require("./dto/restaurant.input");
let RestaurantResolver = class RestaurantResolver {
    restaurantService;
    constructor(restaurantService) {
        this.restaurantService = restaurantService;
    }
    async restaurantSettings(tenantId) {
        return this.restaurantService.getSettings(tenantId);
    }
    async updateRestaurantSettings(tenantId, input) {
        return this.restaurantService.updateSettings(tenantId, input);
    }
    async restaurantTables(tenantId) {
        return this.restaurantService.getTables(tenantId);
    }
    async createRestaurantTable(tenantId, input) {
        return this.restaurantService.createTable(tenantId, input);
    }
    async updateRestaurantTable(tenantId, id, input) {
        return this.restaurantService.updateTable(tenantId, id, input);
    }
    async deleteRestaurantTable(tenantId, id) {
        return this.restaurantService.deleteTable(tenantId, id);
    }
    async menuCategories(tenantId) {
        return this.restaurantService.getMenuCategories(tenantId);
    }
    async createMenuCategory(tenantId, input) {
        return this.restaurantService.createMenuCategory(tenantId, input);
    }
    async updateMenuCategory(tenantId, id, input) {
        return this.restaurantService.updateMenuCategory(tenantId, id, input);
    }
    async deleteMenuCategory(tenantId, id) {
        return this.restaurantService.deleteMenuCategory(tenantId, id);
    }
    async menuItems(tenantId, categoryId) {
        return this.restaurantService.getMenuItems(tenantId, categoryId);
    }
    async menuItem(tenantId, id) {
        return this.restaurantService.getMenuItemWithModifiers(tenantId, id);
    }
    async createMenuItem(tenantId, input) {
        return this.restaurantService.createMenuItem(tenantId, input);
    }
    async updateMenuItem(tenantId, id, input) {
        return this.restaurantService.updateMenuItem(tenantId, id, input);
    }
    async deleteMenuItem(tenantId, id) {
        return this.restaurantService.deleteMenuItem(tenantId, id);
    }
    async createModifierGroup(tenantId, input) {
        return this.restaurantService.createModifierGroup(tenantId, input);
    }
    async updateModifierGroup(tenantId, id, input) {
        return this.restaurantService.updateModifierGroup(tenantId, id, input);
    }
    async deleteModifierGroup(tenantId, id) {
        return this.restaurantService.deleteModifierGroup(tenantId, id);
    }
    async createModifier(tenantId, input) {
        return this.restaurantService.createModifier(tenantId, input);
    }
    async updateModifier(tenantId, id, input) {
        return this.restaurantService.updateModifier(tenantId, id, input);
    }
    async deleteModifier(tenantId, id) {
        return this.restaurantService.deleteModifier(tenantId, id);
    }
    async foodOrders(tenantId, status) {
        return this.restaurantService.getFoodOrders(tenantId, status);
    }
    async foodOrder(tenantId, id) {
        return this.restaurantService.getFoodOrderById(tenantId, id);
    }
    async createFoodOrder(tenantId, input) {
        return this.restaurantService.createFoodOrder(tenantId, input);
    }
    async updateFoodOrderStatus(tenantId, id, input) {
        return this.restaurantService.updateFoodOrderStatus(tenantId, id, input);
    }
    async confirmFoodOrderPickup(tenantId, orderId, pickupCode) {
        return this.restaurantService.confirmPickup(tenantId, orderId, pickupCode);
    }
};
exports.RestaurantResolver = RestaurantResolver;
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.RestaurantSettings),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurantSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.RestaurantSettings),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.UpdateRestaurantSettingsInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateRestaurantSettings", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.RestaurantTablesResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurantTables", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.RestaurantTable),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateRestaurantTableInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createRestaurantTable", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.RestaurantTable),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateRestaurantTableInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateRestaurantTable", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "deleteRestaurantTable", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.MenuCategoriesResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "menuCategories", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuCategory),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateMenuCategoryInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createMenuCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuCategory),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateMenuCategoryInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateMenuCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "deleteMenuCategory", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.MenuItemsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('categoryId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "menuItems", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.MenuItem),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "menuItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuItem),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateMenuItemInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createMenuItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuItem),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateMenuItemInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateMenuItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "deleteMenuItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuModifierGroup),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateModifierGroupInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createModifierGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuModifierGroup),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateModifierGroupInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateModifierGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "deleteModifierGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuModifier),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateModifierInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createModifier", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.MenuModifier),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateModifierInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateModifier", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "deleteModifier", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.FoodOrdersResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "foodOrders", null);
__decorate([
    (0, graphql_1.Query)(() => restaurant_types_1.FoodOrder),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "foodOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.FoodOrder),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, restaurant_input_1.CreateFoodOrderInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createFoodOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => restaurant_types_1.FoodOrder),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, restaurant_input_1.UpdateFoodOrderStatusInput]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "updateFoodOrderStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('pickupCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "confirmFoodOrderPickup", null);
exports.RestaurantResolver = RestaurantResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [restaurant_service_1.RestaurantService])
], RestaurantResolver);
//# sourceMappingURL=restaurant.resolver.js.map