export declare class UpdateLocalStoreSettingsInput {
    storeType?: string;
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
    pickupSlotDuration?: number;
    maxOrdersPerSlot?: number;
    minOrderAmount?: number;
    cashOnPickupEnabled?: boolean;
    cardOnPickupEnabled?: boolean;
    onlinePaymentEnabled?: boolean;
}
export declare class CreateLocalProductInput {
    name: string;
    categoryId?: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    unit?: string;
    images?: string[];
    stock?: number;
    isUnlimited?: boolean;
    isOrganic?: boolean;
    isRegional?: boolean;
    origin?: string;
}
export declare class UpdateLocalProductInput {
    name?: string;
    categoryId?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    unit?: string;
    images?: string[];
    stock?: number;
    isUnlimited?: boolean;
    isAvailable?: boolean;
    isFeatured?: boolean;
    isOrganic?: boolean;
    isRegional?: boolean;
    origin?: string;
}
export declare class CreateLocalDealInput {
    title: string;
    localProductId?: string;
    description?: string;
    image?: string;
    discountType: string;
    discountValue: number;
    startsAt: Date;
    endsAt: Date;
}
export declare class UpdateLocalDealInput {
    title?: string;
    description?: string;
    image?: string;
    discountType?: string;
    discountValue?: number;
    startsAt?: Date;
    endsAt?: Date;
    isActive?: boolean;
}
export declare class CreatePickupSlotInput {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    maxOrders?: number;
}
export declare class UpdatePickupSlotInput {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    maxOrders?: number;
    isActive?: boolean;
}
export declare class LocalOrderItemInput {
    localProductId: string;
    quantity: number;
}
export declare class CreateLocalOrderInput {
    orderType: string;
    pickupSlotId?: string;
    pickupDate?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod?: string;
    couponCode?: string;
    items: LocalOrderItemInput[];
}
export declare class UpdateLocalOrderStatusInput {
    status: string;
    note?: string;
}
