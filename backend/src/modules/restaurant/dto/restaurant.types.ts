import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum FoodOrderType {
  DINE_IN  = 'dine_in',
  PICKUP   = 'pickup',
  DELIVERY = 'delivery',
}
registerEnumType(FoodOrderType, { name: 'FoodOrderType' });

export enum FoodOrderStatus {
  NEW        = 'new',
  ACCEPTED   = 'accepted',
  PREPARING  = 'preparing',
  READY      = 'ready',
  ON_THE_WAY = 'on_the_way',
  DELIVERED  = 'delivered',
  CANCELLED  = 'cancelled',
}
registerEnumType(FoodOrderStatus, { name: 'FoodOrderStatus' });

export enum PaymentMethod {
  CASH           = 'cash',
  CARD_ON_PICKUP = 'card_on_pickup',
  ONLINE         = 'online',
}
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
export class RestaurantSettings {
  @Field(() => ID) id: string;
  @Field() tenantId: string;
  @Field() dineInEnabled: boolean;
  @Field() pickupEnabled: boolean;
  @Field() deliveryEnabled: boolean;
  @Field(() => Int, { nullable: true }) deliveryRadius: number | null;
  @Field(() => Int, { nullable: true }) deliveryFee: number | null;
  @Field(() => Int, { nullable: true }) freeDeliveryFrom: number | null;
  @Field(() => Int, { nullable: true }) minOrderAmount: number | null;
  @Field(() => Int, { nullable: true }) estimatedPickupTime: number | null;
  @Field(() => Int, { nullable: true }) estimatedDeliveryTime: number | null;
  @Field() cashEnabled: boolean;
  @Field() cardOnPickupEnabled: boolean;
  @Field() onlinePaymentEnabled: boolean;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class RestaurantTable {
  @Field(() => ID) id: string;
  @Field() number: string;
  @Field(() => String, { nullable: true }) name: string | null;
  @Field(() => Int) capacity: number;
  @Field(() => String, { nullable: true }) qrCode: string | null;
  @Field() isActive: boolean;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class RestaurantTablesResponse {
  @Field(() => [RestaurantTable]) tables: RestaurantTable[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class MenuCategory {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => String, { nullable: true }) image: string | null;
  @Field(() => Int) position: number;
  @Field() isActive: boolean;
  @Field(() => String, { nullable: true }) availableFrom: string | null;
  @Field(() => String, { nullable: true }) availableTo: string | null;
  @Field(() => [MenuItem], { nullable: true }) items?: MenuItem[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class MenuCategoriesResponse {
  @Field(() => [MenuCategory]) categories: MenuCategory[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class MenuModifier {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field(() => Int) priceModifier: number;
  @Field() isDefault: boolean;
  @Field() isAvailable: boolean;
  @Field(() => Int) position: number;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class MenuModifierGroup {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() isRequired: boolean;
  @Field(() => Int) minSelections: number;
  @Field(() => Int) maxSelections: number;
  @Field(() => Int) position: number;
  @Field(() => [MenuModifier], { nullable: true }) modifiers?: MenuModifier[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class MenuItem {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) categoryId: string | null;
  @Field() name: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Int) price: number;
  images: unknown;
  @Field(() => [String], { nullable: true }) allergens: string[] | null;
  @Field() isVegan: boolean;
  @Field() isVegetarian: boolean;
  @Field() isSpicy: boolean;
  @Field() isPopular: boolean;
  @Field() isAvailable: boolean;
  @Field(() => Int) position: number;
  @Field(() => Int, { nullable: true }) preparationTime: number | null;
  @Field(() => [MenuModifierGroup], { nullable: true }) modifierGroups?: MenuModifierGroup[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class MenuItemsResponse {
  @Field(() => [MenuItem]) items: MenuItem[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class SelectedModifier {
  @Field() groupName: string;
  @Field() modifierName: string;
  @Field(() => Int) priceModifier: number;
}

@ObjectType()
export class FoodOrderItem {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) menuItemId: string | null;
  @Field() menuItemName: string;
  @Field(() => Int) menuItemPrice: number;
  @Field(() => Int) quantity: number;
  selectedModifiers: unknown;
  @Field(() => String, { nullable: true }) notes: string | null;
  @Field(() => Int) total: number;
}

@ObjectType()
export class FoodOrderStatusEntry {
  @Field(() => ID) id: string;
  @Field() status: string;
  @Field(() => String, { nullable: true }) note: string | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class FoodOrder {
  @Field(() => ID) id: string;
  @Field() orderNumber: string;
  @Field() orderType: string;
  @Field(() => String, { nullable: true }) tableId: string | null;
  @Field() customerName: string;
  @Field(() => String, { nullable: true }) customerEmail: string | null;
  @Field(() => String, { nullable: true }) customerPhone: string | null;
  @Field(() => String, { nullable: true }) deliveryAddress: string | null;
  @Field() status: string;
  @Field(() => String, { nullable: true }) notes: string | null;
  @Field(() => Int) subtotal: number;
  @Field(() => Int) tax: number;
  @Field(() => Int) deliveryFee: number;
  @Field(() => Int) discountAmount: number;
  @Field(() => Int) total: number;
  @Field(() => String, { nullable: true }) pickupCode: string | null;
  @Field() pickupCodeUsed: boolean;
  @Field(() => Date, { nullable: true }) estimatedReadyAt: Date | null;
  @Field() paymentMethod: string;
  @Field(() => Date, { nullable: true }) paidAt: Date | null;
  @Field(() => [FoodOrderItem], { nullable: true }) items?: FoodOrderItem[];
  @Field(() => [FoodOrderStatusEntry], { nullable: true }) statusHistory?: FoodOrderStatusEntry[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class FoodOrdersResponse {
  @Field(() => [FoodOrder]) orders: FoodOrder[];
  @Field(() => Int) total: number;
}