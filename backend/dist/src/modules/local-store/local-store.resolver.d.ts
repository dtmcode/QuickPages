import { LocalStoreService } from './local-store.service';
import { LocalStoreSettings, LocalProduct, LocalProductsResponse, LocalDeal, LocalDealsResponse, LocalPickupSlot, LocalPickupSlotsResponse, AvailablePickupSlot, LocalOrder, LocalOrdersResponse } from './dto/local-store.types';
import { UpdateLocalStoreSettingsInput, CreateLocalProductInput, UpdateLocalProductInput, CreateLocalDealInput, UpdateLocalDealInput, CreatePickupSlotInput, UpdatePickupSlotInput, CreateLocalOrderInput, UpdateLocalOrderStatusInput } from './dto/local-store.input';
export declare class LocalStoreResolver {
    private readonly localStoreService;
    constructor(localStoreService: LocalStoreService);
    localStoreSettings(tenantId: string): Promise<LocalStoreSettings>;
    updateLocalStoreSettings(tenantId: string, input: UpdateLocalStoreSettingsInput): Promise<LocalStoreSettings>;
    localProducts(tenantId: string): Promise<LocalProductsResponse>;
    createLocalProduct(tenantId: string, input: CreateLocalProductInput): Promise<LocalProduct>;
    updateLocalProduct(tenantId: string, id: string, input: UpdateLocalProductInput): Promise<LocalProduct>;
    deleteLocalProduct(tenantId: string, id: string): Promise<boolean>;
    localDeals(tenantId: string): Promise<LocalDealsResponse>;
    createLocalDeal(tenantId: string, input: CreateLocalDealInput): Promise<LocalDeal>;
    updateLocalDeal(tenantId: string, id: string, input: UpdateLocalDealInput): Promise<LocalDeal>;
    deleteLocalDeal(tenantId: string, id: string): Promise<boolean>;
    localPickupSlots(tenantId: string): Promise<LocalPickupSlotsResponse>;
    availablePickupSlots(tenantId: string, days?: number): Promise<AvailablePickupSlot[]>;
    createLocalPickupSlot(tenantId: string, input: CreatePickupSlotInput): Promise<LocalPickupSlot>;
    updateLocalPickupSlot(tenantId: string, id: string, input: UpdatePickupSlotInput): Promise<LocalPickupSlot>;
    deleteLocalPickupSlot(tenantId: string, id: string): Promise<boolean>;
    localOrders(tenantId: string, status?: string): Promise<LocalOrdersResponse>;
    localOrder(tenantId: string, id: string): Promise<LocalOrder>;
    createLocalOrder(tenantId: string, input: CreateLocalOrderInput): Promise<LocalOrder>;
    updateLocalOrderStatus(tenantId: string, id: string, input: UpdateLocalOrderStatusInput): Promise<LocalOrder>;
    confirmLocalOrderPickup(tenantId: string, orderId: string, pickupCode: string): Promise<boolean>;
}
