import { InputType, Field, Int } from '@nestjs/graphql';

// ─── Settings ─────────────────────────────────────────────────────────────────

@InputType()
export class UpdateLocalStoreSettingsInput {
  @Field({ nullable: true }) storeType?: string;
  @Field({ nullable: true }) pickupEnabled?: boolean;
  @Field({ nullable: true }) deliveryEnabled?: boolean;
  @Field(() => Int, { nullable: true }) pickupSlotDuration?: number;
  @Field(() => Int, { nullable: true }) maxOrdersPerSlot?: number;
  @Field(() => Int, { nullable: true }) minOrderAmount?: number;
  @Field({ nullable: true }) cashOnPickupEnabled?: boolean;
  @Field({ nullable: true }) cardOnPickupEnabled?: boolean;
  @Field({ nullable: true }) onlinePaymentEnabled?: boolean;
}

// ─── Local Product ────────────────────────────────────────────────────────────

@InputType()
export class CreateLocalProductInput {
  @Field() name: string;
  @Field({ nullable: true }) categoryId?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) price: number;
  @Field(() => Int, { nullable: true }) compareAtPrice?: number;
  @Field({ nullable: true }) unit?: string;       // default: 'Stück'
  @Field(() => [String], { nullable: true }) images?: string[];
  @Field(() => Int, { nullable: true }) stock?: number;
  @Field({ nullable: true }) isUnlimited?: boolean;
  @Field({ nullable: true }) isOrganic?: boolean;
  @Field({ nullable: true }) isRegional?: boolean;
  @Field({ nullable: true }) origin?: string;
}

@InputType()
export class UpdateLocalProductInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) categoryId?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field(() => Int, { nullable: true }) compareAtPrice?: number;
  @Field({ nullable: true }) unit?: string;
  @Field(() => [String], { nullable: true }) images?: string[];
  @Field(() => Int, { nullable: true }) stock?: number;
  @Field({ nullable: true }) isUnlimited?: boolean;
  @Field({ nullable: true }) isAvailable?: boolean;
  @Field({ nullable: true }) isFeatured?: boolean;
  @Field({ nullable: true }) isOrganic?: boolean;
  @Field({ nullable: true }) isRegional?: boolean;
  @Field({ nullable: true }) origin?: string;
}

// ─── Deal ─────────────────────────────────────────────────────────────────────

@InputType()
export class CreateLocalDealInput {
  @Field() title: string;
  @Field({ nullable: true }) localProductId?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) image?: string;
  @Field() discountType: string;       // percent | fixed
  @Field(() => Int) discountValue: number;
  @Field() startsAt: Date;
  @Field() endsAt: Date;
}

@InputType()
export class UpdateLocalDealInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) image?: string;
  @Field({ nullable: true }) discountType?: string;
  @Field(() => Int, { nullable: true }) discountValue?: number;
  @Field({ nullable: true }) startsAt?: Date;
  @Field({ nullable: true }) endsAt?: Date;
  @Field({ nullable: true }) isActive?: boolean;
}

// ─── Pickup Slots ─────────────────────────────────────────────────────────────

@InputType()
export class CreatePickupSlotInput {
  @Field(() => Int) dayOfWeek: number;   // 0=Sonntag … 6=Samstag
  @Field() startTime: string;            // "09:00"
  @Field() endTime: string;              // "12:00"
  @Field(() => Int, { nullable: true }) maxOrders?: number;
}

@InputType()
export class UpdatePickupSlotInput {
  @Field(() => Int, { nullable: true }) dayOfWeek?: number;
  @Field({ nullable: true }) startTime?: string;
  @Field({ nullable: true }) endTime?: string;
  @Field(() => Int, { nullable: true }) maxOrders?: number;
  @Field({ nullable: true }) isActive?: boolean;
}

// ─── Local Order ──────────────────────────────────────────────────────────────

@InputType()
export class LocalOrderItemInput {
  @Field() localProductId: string;
  @Field(() => Int) quantity: number;
}

@InputType()
export class CreateLocalOrderInput {
  @Field() orderType: string;             // pickup | delivery
  @Field({ nullable: true }) pickupSlotId?: string;
  @Field({ nullable: true }) pickupDate?: string;  // "2025-04-20"
  @Field() customerName: string;
  @Field({ nullable: true }) customerEmail?: string;
  @Field({ nullable: true }) customerPhone?: string;
  @Field({ nullable: true }) deliveryAddress?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) paymentMethod?: string;
  @Field({ nullable: true }) couponCode?: string;
  @Field(() => [LocalOrderItemInput]) items: LocalOrderItemInput[];
}

@InputType()
export class UpdateLocalOrderStatusInput {
  @Field() status: string;
  @Field({ nullable: true }) note?: string;
}
