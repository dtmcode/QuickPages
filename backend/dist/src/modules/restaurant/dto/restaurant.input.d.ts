export declare class UpdateRestaurantSettingsInput {
    dineInEnabled?: boolean;
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
    deliveryRadius?: number;
    deliveryFee?: number;
    freeDeliveryFrom?: number;
    minOrderAmount?: number;
    estimatedPickupTime?: number;
    estimatedDeliveryTime?: number;
    cashEnabled?: boolean;
    cardOnPickupEnabled?: boolean;
    onlinePaymentEnabled?: boolean;
}
export declare class CreateRestaurantTableInput {
    number: string;
    name?: string;
    capacity?: number;
}
export declare class UpdateRestaurantTableInput {
    number?: string;
    name?: string;
    capacity?: number;
    isActive?: boolean;
}
export declare class CreateMenuCategoryInput {
    name: string;
    description?: string;
    image?: string;
    position?: number;
    availableFrom?: string;
    availableTo?: string;
}
export declare class UpdateMenuCategoryInput {
    name?: string;
    description?: string;
    image?: string;
    position?: number;
    isActive?: boolean;
    availableFrom?: string;
    availableTo?: string;
}
export declare class CreateMenuItemInput {
    categoryId?: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    allergens?: string[];
    isVegan?: boolean;
    isVegetarian?: boolean;
    isSpicy?: boolean;
    isPopular?: boolean;
    position?: number;
    preparationTime?: number;
}
export declare class UpdateMenuItemInput {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    images?: string[];
    allergens?: string[];
    isVegan?: boolean;
    isVegetarian?: boolean;
    isSpicy?: boolean;
    isPopular?: boolean;
    isAvailable?: boolean;
    position?: number;
    preparationTime?: number;
}
export declare class CreateModifierGroupInput {
    menuItemId: string;
    name: string;
    isRequired?: boolean;
    minSelections?: number;
    maxSelections?: number;
    position?: number;
}
export declare class UpdateModifierGroupInput {
    name?: string;
    isRequired?: boolean;
    minSelections?: number;
    maxSelections?: number;
    position?: number;
}
export declare class CreateModifierInput {
    groupId: string;
    name: string;
    priceModifier?: number;
    isDefault?: boolean;
    position?: number;
}
export declare class UpdateModifierInput {
    name?: string;
    priceModifier?: number;
    isDefault?: boolean;
    isAvailable?: boolean;
    position?: number;
}
export declare class SelectedModifierInput {
    groupName: string;
    modifierName: string;
    priceModifier: number;
}
export declare class FoodOrderItemInput {
    menuItemId: string;
    quantity: number;
    selectedModifiers?: SelectedModifierInput[];
    notes?: string;
}
export declare class CreateFoodOrderInput {
    orderType: string;
    tableId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod?: string;
    couponCode?: string;
    items: FoodOrderItemInput[];
}
export declare class UpdateFoodOrderStatusInput {
    status: string;
    note?: string;
}
