import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum LocalOrderStatus {
  PENDING   = 'pending',
  CONFIRMED = 'confirmed',
  READY     = 'ready',
  PICKED_UP = 'picked_up',
  CANCELLED = 'cancelled',
}
registerEnumType(LocalOrderStatus, { name: 'LocalOrderStatus' });

export enum LocalOrderType {
  PICKUP   = 'pickup',
  DELIVERY = 'delivery',
}
registerEnumType(LocalOrderType, { name: 'LocalOrderType' });

export enum StoreType {
  MARKET   = 'market',
  PHARMACY = 'pharmacy',
  FLORIST  = 'florist',
  BAKERY   = 'bakery',
  BUTCHER  = 'butcher',
  KIOSK    = 'kiosk',
  FARM     = 'farm',
  OTHER    = 'other',
}
registerEnumType(StoreType, { name: 'StoreType' });

@ObjectType()
export class LocalStoreSettings {
  @Field(() => ID) id: string;
  @Field() tenantId: string;
  @Field() storeType: string;
  @Field() pickupEnabled: boolean;
  @Field() deliveryEnabled: boolean;
  @Field(() => Int, { nullable: true }) pickupSlotDuration: number | null;
  @Field(() => Int, { nullable: true }) maxOrdersPerSlot: number | null;
  @Field(() => Int, { nullable: true }) minOrderAmount: number | null;
  @Field() cashOnPickupEnabled: boolean;
  @Field() cardOnPickupEnabled: boolean;
  @Field() onlinePaymentEnabled: boolean;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class LocalProduct {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) categoryId: string | null;
  @Field() name: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Int) price: number;
  @Field(() => Int, { nullable: true }) compareAtPrice: number | null;
  @Field() unit: string;
  images: unknown;
  @Field(() => Int, { nullable: true }) stock: number | null;
  @Field() isUnlimited: boolean;
  @Field() isAvailable: boolean;
  @Field() isFeatured: boolean;
  @Field() isOrganic: boolean;
  @Field() isRegional: boolean;
  @Field(() => String, { nullable: true }) origin: string | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class LocalProductsResponse {
  @Field(() => [LocalProduct]) products: LocalProduct[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class LocalDeal {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) localProductId: string | null;
  @Field() title: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => String, { nullable: true }) image: string | null;
  @Field() discountType: string;
  @Field(() => Int) discountValue: number;
  @Field(() => Date) startsAt: Date;
  @Field(() => Date) endsAt: Date;
  @Field() isActive: boolean;
  @Field(() => LocalProduct, { nullable: true }) product?: LocalProduct | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class LocalDealsResponse {
  @Field(() => [LocalDeal]) deals: LocalDeal[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class LocalPickupSlot {
  @Field(() => ID) id: string;
  @Field(() => Int) dayOfWeek: number;
  @Field() startTime: string;
  @Field() endTime: string;
  @Field(() => Int) maxOrders: number;
  @Field() isActive: boolean;
}

@ObjectType()
export class LocalPickupSlotsResponse {
  @Field(() => [LocalPickupSlot]) slots: LocalPickupSlot[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class AvailablePickupSlot {
  @Field(() => ID) slotId: string;
  @Field() date: string;
  @Field() startTime: string;
  @Field() endTime: string;
  @Field(() => Int) available: number;
  @Field(() => Int) maxOrders: number;
}

@ObjectType()
export class LocalOrderItem {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) localProductId: string | null;
  @Field() productName: string;
  @Field(() => Int) productPrice: number;
  @Field() unit: string;
  @Field(() => Int) quantity: number;
  @Field(() => Int) total: number;
}

@ObjectType()
export class LocalOrder {
  @Field(() => ID) id: string;
  @Field() orderNumber: string;
  @Field() orderType: string;
  @Field(() => String, { nullable: true }) pickupSlotId: string | null;
  @Field(() => String, { nullable: true }) pickupDate: string | null;
  @Field(() => String, { nullable: true }) pickupCode: string | null;
  @Field() pickupCodeUsed: boolean;
  @Field(() => Date, { nullable: true }) pickupConfirmedAt: Date | null;
  @Field() customerName: string;
  @Field(() => String, { nullable: true }) customerEmail: string | null;
  @Field(() => String, { nullable: true }) customerPhone: string | null;
  @Field(() => String, { nullable: true }) deliveryAddress: string | null;
  @Field() status: string;
  @Field(() => String, { nullable: true }) notes: string | null;
  @Field(() => Int) subtotal: number;
  @Field(() => Int) discountAmount: number;
  @Field(() => Int) total: number;
  @Field() paymentMethod: string;
  @Field(() => Date, { nullable: true }) paidAt: Date | null;
  @Field(() => [LocalOrderItem], { nullable: true }) items?: LocalOrderItem[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class LocalOrdersResponse {
  @Field(() => [LocalOrder]) orders: LocalOrder[];
  @Field(() => Int) total: number;
}