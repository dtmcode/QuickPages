import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { LocalStoreService } from './local-store.service';
import {
  LocalStoreSettings,
  LocalProduct,
  LocalProductsResponse,
  LocalDeal,
  LocalDealsResponse,
  LocalPickupSlot,
  LocalPickupSlotsResponse,
  AvailablePickupSlot,
  LocalOrder,
  LocalOrdersResponse,
} from './dto/local-store.types';
import {
  UpdateLocalStoreSettingsInput,
  CreateLocalProductInput,
  UpdateLocalProductInput,
  CreateLocalDealInput,
  UpdateLocalDealInput,
  CreatePickupSlotInput,
  UpdatePickupSlotInput,
  CreateLocalOrderInput,
  UpdateLocalOrderStatusInput,
} from './dto/local-store.input';

@Resolver()
export class LocalStoreResolver {
  constructor(private readonly localStoreService: LocalStoreService) {}

  // ─── Settings ─────────────────────────────────────────────────────────────────

  @Query(() => LocalStoreSettings)
  @UseGuards(GqlAuthGuard)
  async localStoreSettings(
    @TenantId() tenantId: string,
  ): Promise<LocalStoreSettings> {
    return this.localStoreService.getSettings(tenantId);
  }

  @Mutation(() => LocalStoreSettings)
  @UseGuards(GqlAuthGuard)
  async updateLocalStoreSettings(
    @TenantId() tenantId: string,
    @Args('input') input: UpdateLocalStoreSettingsInput,
  ): Promise<LocalStoreSettings> {
    return this.localStoreService.updateSettings(tenantId, input);
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  @Query(() => LocalProductsResponse)
  @UseGuards(GqlAuthGuard)
  async localProducts(
    @TenantId() tenantId: string,
  ): Promise<LocalProductsResponse> {
    return this.localStoreService.getProducts(tenantId);
  }

  @Mutation(() => LocalProduct)
  @UseGuards(GqlAuthGuard)
  async createLocalProduct(
    @TenantId() tenantId: string,
    @Args('input') input: CreateLocalProductInput,
  ): Promise<LocalProduct> {
    return this.localStoreService.createProduct(tenantId, input);
  }

  @Mutation(() => LocalProduct)
  @UseGuards(GqlAuthGuard)
  async updateLocalProduct(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLocalProductInput,
  ): Promise<LocalProduct> {
    return this.localStoreService.updateProduct(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteLocalProduct(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.localStoreService.deleteProduct(tenantId, id);
  }

  // ─── Deals ────────────────────────────────────────────────────────────────────

  @Query(() => LocalDealsResponse)
  @UseGuards(GqlAuthGuard)
  async localDeals(@TenantId() tenantId: string): Promise<LocalDealsResponse> {
    return this.localStoreService.getDeals(tenantId);
  }

  @Mutation(() => LocalDeal)
  @UseGuards(GqlAuthGuard)
  async createLocalDeal(
    @TenantId() tenantId: string,
    @Args('input') input: CreateLocalDealInput,
  ): Promise<LocalDeal> {
    return this.localStoreService.createDeal(tenantId, input);
  }

  @Mutation(() => LocalDeal)
  @UseGuards(GqlAuthGuard)
  async updateLocalDeal(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLocalDealInput,
  ): Promise<LocalDeal> {
    return this.localStoreService.updateDeal(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteLocalDeal(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.localStoreService.deleteDeal(tenantId, id);
  }

  // ─── Pickup Slots ─────────────────────────────────────────────────────────────

  @Query(() => LocalPickupSlotsResponse)
  @UseGuards(GqlAuthGuard)
  async localPickupSlots(
    @TenantId() tenantId: string,
  ): Promise<LocalPickupSlotsResponse> {
    return this.localStoreService.getPickupSlots(tenantId);
  }

  @Query(() => [AvailablePickupSlot])
  @UseGuards(GqlAuthGuard)
  async availablePickupSlots(
    @TenantId() tenantId: string,
    @Args('days', { nullable: true }) days?: number,
  ): Promise<AvailablePickupSlot[]> {
    return this.localStoreService.getAvailablePickupSlots(tenantId, days ?? 7);
  }

  @Mutation(() => LocalPickupSlot)
  @UseGuards(GqlAuthGuard)
  async createLocalPickupSlot(
    @TenantId() tenantId: string,
    @Args('input') input: CreatePickupSlotInput,
  ): Promise<LocalPickupSlot> {
    return this.localStoreService.createPickupSlot(tenantId, input);
  }

  @Mutation(() => LocalPickupSlot)
  @UseGuards(GqlAuthGuard)
  async updateLocalPickupSlot(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePickupSlotInput,
  ): Promise<LocalPickupSlot> {
    return this.localStoreService.updatePickupSlot(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteLocalPickupSlot(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.localStoreService.deletePickupSlot(tenantId, id);
  }

  // ─── Orders ───────────────────────────────────────────────────────────────────

  @Query(() => LocalOrdersResponse)
  @UseGuards(GqlAuthGuard)
  async localOrders(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
  ): Promise<LocalOrdersResponse> {
    return this.localStoreService.getOrders(tenantId, status);
  }

  @Query(() => LocalOrder)
  @UseGuards(GqlAuthGuard)
  async localOrder(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LocalOrder> {
    return this.localStoreService.getOrderById(tenantId, id);
  }

  // Öffentlich — kein Auth (Kunden bestellen)
  @Mutation(() => LocalOrder)
  async createLocalOrder(
    @TenantId() tenantId: string,
    @Args('input') input: CreateLocalOrderInput,
  ): Promise<LocalOrder> {
    return this.localStoreService.createOrder(tenantId, input);
  }

  @Mutation(() => LocalOrder)
  @UseGuards(GqlAuthGuard)
  async updateLocalOrderStatus(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLocalOrderStatusInput,
  ): Promise<LocalOrder> {
    return this.localStoreService.updateOrderStatus(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async confirmLocalOrderPickup(
    @TenantId() tenantId: string,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('pickupCode') pickupCode: string,
  ): Promise<boolean> {
    return this.localStoreService.confirmPickup(tenantId, orderId, pickupCode);
  }
}
