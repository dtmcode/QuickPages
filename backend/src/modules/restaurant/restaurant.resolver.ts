import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { RestaurantService } from './restaurant.service';
import {
  RestaurantSettings,
  RestaurantTable,
  RestaurantTablesResponse,
  MenuCategory,
  MenuCategoriesResponse,
  MenuItem,
  MenuItemsResponse,
  MenuModifierGroup,
  MenuModifier,
  FoodOrder,
  FoodOrdersResponse,
} from './dto/restaurant.types';
import {
  UpdateRestaurantSettingsInput,
  CreateRestaurantTableInput,
  UpdateRestaurantTableInput,
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
  CreateModifierInput,
  UpdateModifierInput,
  CreateFoodOrderInput,
  UpdateFoodOrderStatusInput,
} from './dto/restaurant.input';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ─── Settings ─────────────────────────────────────────────────────────────────

  @Query(() => RestaurantSettings)
  @UseGuards(GqlAuthGuard)
  async restaurantSettings(
    @TenantId() tenantId: string,
  ): Promise<RestaurantSettings> {
    return this.restaurantService.getSettings(tenantId);
  }

  @Mutation(() => RestaurantSettings)
  @UseGuards(GqlAuthGuard)
  async updateRestaurantSettings(
    @TenantId() tenantId: string,
    @Args('input') input: UpdateRestaurantSettingsInput,
  ): Promise<RestaurantSettings> {
    return this.restaurantService.updateSettings(tenantId, input);
  }

  // ─── Tables ───────────────────────────────────────────────────────────────────

  @Query(() => RestaurantTablesResponse)
  @UseGuards(GqlAuthGuard)
  async restaurantTables(
    @TenantId() tenantId: string,
  ): Promise<RestaurantTablesResponse> {
    return this.restaurantService.getTables(tenantId);
  }

  @Mutation(() => RestaurantTable)
  @UseGuards(GqlAuthGuard)
  async createRestaurantTable(
    @TenantId() tenantId: string,
    @Args('input') input: CreateRestaurantTableInput,
  ): Promise<RestaurantTable> {
    return this.restaurantService.createTable(tenantId, input);
  }

  @Mutation(() => RestaurantTable)
  @UseGuards(GqlAuthGuard)
  async updateRestaurantTable(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRestaurantTableInput,
  ): Promise<RestaurantTable> {
    return this.restaurantService.updateTable(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteRestaurantTable(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.restaurantService.deleteTable(tenantId, id);
  }

  // ─── Menu Categories ──────────────────────────────────────────────────────────

  @Query(() => MenuCategoriesResponse)
  @UseGuards(GqlAuthGuard)
  async menuCategories(
    @TenantId() tenantId: string,
  ): Promise<MenuCategoriesResponse> {
    return this.restaurantService.getMenuCategories(tenantId);
  }

  @Mutation(() => MenuCategory)
  @UseGuards(GqlAuthGuard)
  async createMenuCategory(
    @TenantId() tenantId: string,
    @Args('input') input: CreateMenuCategoryInput,
  ): Promise<MenuCategory> {
    return this.restaurantService.createMenuCategory(tenantId, input);
  }

  @Mutation(() => MenuCategory)
  @UseGuards(GqlAuthGuard)
  async updateMenuCategory(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMenuCategoryInput,
  ): Promise<MenuCategory> {
    return this.restaurantService.updateMenuCategory(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteMenuCategory(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.restaurantService.deleteMenuCategory(tenantId, id);
  }

  // ─── Menu Items ───────────────────────────────────────────────────────────────

  @Query(() => MenuItemsResponse)
  @UseGuards(GqlAuthGuard)
  async menuItems(
    @TenantId() tenantId: string,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
  ): Promise<MenuItemsResponse> {
    return this.restaurantService.getMenuItems(tenantId, categoryId);
  }

  @Query(() => MenuItem)
  @UseGuards(GqlAuthGuard)
  async menuItem(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MenuItem> {
    return this.restaurantService.getMenuItemWithModifiers(tenantId, id);
  }

  @Mutation(() => MenuItem)
  @UseGuards(GqlAuthGuard)
  async createMenuItem(
    @TenantId() tenantId: string,
    @Args('input') input: CreateMenuItemInput,
  ): Promise<MenuItem> {
    return this.restaurantService.createMenuItem(tenantId, input);
  }

  @Mutation(() => MenuItem)
  @UseGuards(GqlAuthGuard)
  async updateMenuItem(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMenuItemInput,
  ): Promise<MenuItem> {
    return this.restaurantService.updateMenuItem(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteMenuItem(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.restaurantService.deleteMenuItem(tenantId, id);
  }

  // ─── Modifier Groups ──────────────────────────────────────────────────────────

  @Mutation(() => MenuModifierGroup)
  @UseGuards(GqlAuthGuard)
  async createModifierGroup(
    @TenantId() tenantId: string,
    @Args('input') input: CreateModifierGroupInput,
  ): Promise<MenuModifierGroup> {
    return this.restaurantService.createModifierGroup(tenantId, input);
  }

  @Mutation(() => MenuModifierGroup)
  @UseGuards(GqlAuthGuard)
  async updateModifierGroup(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateModifierGroupInput,
  ): Promise<MenuModifierGroup> {
    return this.restaurantService.updateModifierGroup(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteModifierGroup(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.restaurantService.deleteModifierGroup(tenantId, id);
  }

  // ─── Modifiers ────────────────────────────────────────────────────────────────

  @Mutation(() => MenuModifier)
  @UseGuards(GqlAuthGuard)
  async createModifier(
    @TenantId() tenantId: string,
    @Args('input') input: CreateModifierInput,
  ): Promise<MenuModifier> {
    return this.restaurantService.createModifier(tenantId, input);
  }

  @Mutation(() => MenuModifier)
  @UseGuards(GqlAuthGuard)
  async updateModifier(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateModifierInput,
  ): Promise<MenuModifier> {
    return this.restaurantService.updateModifier(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteModifier(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.restaurantService.deleteModifier(tenantId, id);
  }

  // ─── Food Orders ──────────────────────────────────────────────────────────────

  @Query(() => FoodOrdersResponse)
  @UseGuards(GqlAuthGuard)
  async foodOrders(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
  ): Promise<FoodOrdersResponse> {
    return this.restaurantService.getFoodOrders(tenantId, status);
  }

  @Query(() => FoodOrder)
  @UseGuards(GqlAuthGuard)
  async foodOrder(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FoodOrder> {
    return this.restaurantService.getFoodOrderById(tenantId, id);
  }

  // Öffentliche Mutation — kein Auth-Guard (Kunden bestellen)
  @Mutation(() => FoodOrder)
  async createFoodOrder(
    @TenantId() tenantId: string,
    @Args('input') input: CreateFoodOrderInput,
  ): Promise<FoodOrder> {
    return this.restaurantService.createFoodOrder(tenantId, input);
  }

  @Mutation(() => FoodOrder)
  @UseGuards(GqlAuthGuard)
  async updateFoodOrderStatus(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFoodOrderStatusInput,
  ): Promise<FoodOrder> {
    return this.restaurantService.updateFoodOrderStatus(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async confirmFoodOrderPickup(
    @TenantId() tenantId: string,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('pickupCode') pickupCode: string,
  ): Promise<boolean> {
    return this.restaurantService.confirmPickup(tenantId, orderId, pickupCode);
  }
}
