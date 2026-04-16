import { InputType, Field, Int } from '@nestjs/graphql';

// ─── Settings ─────────────────────────────────────────────────────────────────

@InputType()
export class UpdateRestaurantSettingsInput {
  @Field({ nullable: true }) dineInEnabled?: boolean;
  @Field({ nullable: true }) pickupEnabled?: boolean;
  @Field({ nullable: true }) deliveryEnabled?: boolean;
  @Field(() => Int, { nullable: true }) deliveryRadius?: number;
  @Field(() => Int, { nullable: true }) deliveryFee?: number;
  @Field(() => Int, { nullable: true }) freeDeliveryFrom?: number;
  @Field(() => Int, { nullable: true }) minOrderAmount?: number;
  @Field(() => Int, { nullable: true }) estimatedPickupTime?: number;
  @Field(() => Int, { nullable: true }) estimatedDeliveryTime?: number;
  @Field({ nullable: true }) cashEnabled?: boolean;
  @Field({ nullable: true }) cardOnPickupEnabled?: boolean;
  @Field({ nullable: true }) onlinePaymentEnabled?: boolean;
}

// ─── Table ────────────────────────────────────────────────────────────────────

@InputType()
export class CreateRestaurantTableInput {
  @Field() number: string;
  @Field({ nullable: true }) name?: string;
  @Field(() => Int, { nullable: true }) capacity?: number;
}

@InputType()
export class UpdateRestaurantTableInput {
  @Field({ nullable: true }) number?: string;
  @Field({ nullable: true }) name?: string;
  @Field(() => Int, { nullable: true }) capacity?: number;
  @Field({ nullable: true }) isActive?: boolean;
}

// ─── Menu Category ────────────────────────────────────────────────────────────

@InputType()
export class CreateMenuCategoryInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) image?: string;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) availableFrom?: string;
  @Field({ nullable: true }) availableTo?: string;
}

@InputType()
export class UpdateMenuCategoryInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) image?: string;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) isActive?: boolean;
  @Field({ nullable: true }) availableFrom?: string;
  @Field({ nullable: true }) availableTo?: string;
}

// ─── Menu Item ────────────────────────────────────────────────────────────────

@InputType()
export class CreateMenuItemInput {
  @Field({ nullable: true }) categoryId?: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) price: number;
  @Field(() => [String], { nullable: true }) images?: string[];
  @Field(() => [String], { nullable: true }) allergens?: string[];
  @Field({ nullable: true }) isVegan?: boolean;
  @Field({ nullable: true }) isVegetarian?: boolean;
  @Field({ nullable: true }) isSpicy?: boolean;
  @Field({ nullable: true }) isPopular?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field(() => Int, { nullable: true }) preparationTime?: number;
}

@InputType()
export class UpdateMenuItemInput {
  @Field({ nullable: true }) categoryId?: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field(() => [String], { nullable: true }) images?: string[];
  @Field(() => [String], { nullable: true }) allergens?: string[];
  @Field({ nullable: true }) isVegan?: boolean;
  @Field({ nullable: true }) isVegetarian?: boolean;
  @Field({ nullable: true }) isSpicy?: boolean;
  @Field({ nullable: true }) isPopular?: boolean;
  @Field({ nullable: true }) isAvailable?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field(() => Int, { nullable: true }) preparationTime?: number;
}

// ─── Modifier Group ───────────────────────────────────────────────────────────

@InputType()
export class CreateModifierGroupInput {
  @Field() menuItemId: string;
  @Field() name: string;
  @Field({ nullable: true }) isRequired?: boolean;
  @Field(() => Int, { nullable: true }) minSelections?: number;
  @Field(() => Int, { nullable: true }) maxSelections?: number;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdateModifierGroupInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) isRequired?: boolean;
  @Field(() => Int, { nullable: true }) minSelections?: number;
  @Field(() => Int, { nullable: true }) maxSelections?: number;
  @Field(() => Int, { nullable: true }) position?: number;
}

// ─── Modifier ─────────────────────────────────────────────────────────────────

@InputType()
export class CreateModifierInput {
  @Field() groupId: string;
  @Field() name: string;
  @Field(() => Int, { nullable: true }) priceModifier?: number;
  @Field({ nullable: true }) isDefault?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdateModifierInput {
  @Field({ nullable: true }) name?: string;
  @Field(() => Int, { nullable: true }) priceModifier?: number;
  @Field({ nullable: true }) isDefault?: boolean;
  @Field({ nullable: true }) isAvailable?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}

// ─── Food Order ───────────────────────────────────────────────────────────────

@InputType()
export class SelectedModifierInput {
  @Field() groupName: string;
  @Field() modifierName: string;
  @Field(() => Int) priceModifier: number;
}

@InputType()
export class FoodOrderItemInput {
  @Field() menuItemId: string;
  @Field(() => Int) quantity: number;
  @Field(() => [SelectedModifierInput], { nullable: true }) selectedModifiers?: SelectedModifierInput[];
  @Field({ nullable: true }) notes?: string;
}

@InputType()
export class CreateFoodOrderInput {
  @Field() orderType: string; // dine_in | pickup | delivery
  @Field({ nullable: true }) tableId?: string;
  @Field() customerName: string;
  @Field({ nullable: true }) customerEmail?: string;
  @Field({ nullable: true }) customerPhone?: string;
  @Field({ nullable: true }) deliveryAddress?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) paymentMethod?: string;
  @Field({ nullable: true }) couponCode?: string;
  @Field(() => [FoodOrderItemInput]) items: FoodOrderItemInput[];
}

@InputType()
export class UpdateFoodOrderStatusInput {
  @Field() status: string;
  @Field({ nullable: true }) note?: string;
}