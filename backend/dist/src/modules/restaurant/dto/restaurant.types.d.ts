export declare enum FoodOrderType {
    DINE_IN = "dine_in",
    PICKUP = "pickup",
    DELIVERY = "delivery"
}
export declare enum FoodOrderStatus {
    NEW = "new",
    ACCEPTED = "accepted",
    PREPARING = "preparing",
    READY = "ready",
    ON_THE_WAY = "on_the_way",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD_ON_PICKUP = "card_on_pickup",
    ONLINE = "online"
}
export declare class RestaurantSettings {
    id: string;
    tenantId: string;
    dineInEnabled: boolean;
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    deliveryRadius: number | null;
    deliveryFee: number | null;
    freeDeliveryFrom: number | null;
    minOrderAmount: number | null;
    estimatedPickupTime: number | null;
    estimatedDeliveryTime: number | null;
    cashEnabled: boolean;
    cardOnPickupEnabled: boolean;
    onlinePaymentEnabled: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class RestaurantTable {
    id: string;
    number: string;
    name: string | null;
    capacity: number;
    qrCode: string | null;
    isActive: boolean;
    createdAt: Date | null;
}
export declare class RestaurantTablesResponse {
    tables: RestaurantTable[];
    total: number;
}
export declare class MenuCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    position: number;
    isActive: boolean;
    availableFrom: string | null;
    availableTo: string | null;
    items?: MenuItem[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class MenuCategoriesResponse {
    categories: MenuCategory[];
    total: number;
}
export declare class MenuModifier {
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
    isAvailable: boolean;
    position: number;
    createdAt: Date | null;
}
export declare class MenuModifierGroup {
    id: string;
    name: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    position: number;
    modifiers?: MenuModifier[];
    createdAt: Date | null;
}
export declare class MenuItem {
    id: string;
    categoryId: string | null;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    images: unknown;
    allergens: string[] | null;
    isVegan: boolean;
    isVegetarian: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isAvailable: boolean;
    position: number;
    preparationTime: number | null;
    modifierGroups?: MenuModifierGroup[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class MenuItemsResponse {
    items: MenuItem[];
    total: number;
}
export declare class SelectedModifier {
    groupName: string;
    modifierName: string;
    priceModifier: number;
}
export declare class FoodOrderItem {
    id: string;
    menuItemId: string | null;
    menuItemName: string;
    menuItemPrice: number;
    quantity: number;
    selectedModifiers: unknown;
    notes: string | null;
    total: number;
}
export declare class FoodOrderStatusEntry {
    id: string;
    status: string;
    note: string | null;
    createdAt: Date | null;
}
export declare class FoodOrder {
    id: string;
    orderNumber: string;
    orderType: string;
    tableId: string | null;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    deliveryAddress: string | null;
    status: string;
    notes: string | null;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discountAmount: number;
    total: number;
    pickupCode: string | null;
    pickupCodeUsed: boolean;
    estimatedReadyAt: Date | null;
    paymentMethod: string;
    paidAt: Date | null;
    items?: FoodOrderItem[];
    statusHistory?: FoodOrderStatusEntry[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class FoodOrdersResponse {
    orders: FoodOrder[];
    total: number;
}
