export declare enum LocalOrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    READY = "ready",
    PICKED_UP = "picked_up",
    CANCELLED = "cancelled"
}
export declare enum LocalOrderType {
    PICKUP = "pickup",
    DELIVERY = "delivery"
}
export declare enum StoreType {
    MARKET = "market",
    PHARMACY = "pharmacy",
    FLORIST = "florist",
    BAKERY = "bakery",
    BUTCHER = "butcher",
    KIOSK = "kiosk",
    FARM = "farm",
    OTHER = "other"
}
export declare class LocalStoreSettings {
    id: string;
    tenantId: string;
    storeType: string;
    pickupEnabled: boolean;
    deliveryEnabled: boolean;
    pickupSlotDuration: number | null;
    maxOrdersPerSlot: number | null;
    minOrderAmount: number | null;
    cashOnPickupEnabled: boolean;
    cardOnPickupEnabled: boolean;
    onlinePaymentEnabled: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class LocalProduct {
    id: string;
    categoryId: string | null;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    unit: string;
    images: unknown;
    stock: number | null;
    isUnlimited: boolean;
    isAvailable: boolean;
    isFeatured: boolean;
    isOrganic: boolean;
    isRegional: boolean;
    origin: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class LocalProductsResponse {
    products: LocalProduct[];
    total: number;
}
export declare class LocalDeal {
    id: string;
    localProductId: string | null;
    title: string;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    product?: LocalProduct | null;
    createdAt: Date | null;
}
export declare class LocalDealsResponse {
    deals: LocalDeal[];
    total: number;
}
export declare class LocalPickupSlot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    maxOrders: number;
    isActive: boolean;
}
export declare class LocalPickupSlotsResponse {
    slots: LocalPickupSlot[];
    total: number;
}
export declare class AvailablePickupSlot {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    available: number;
    maxOrders: number;
}
export declare class LocalOrderItem {
    id: string;
    localProductId: string | null;
    productName: string;
    productPrice: number;
    unit: string;
    quantity: number;
    total: number;
}
export declare class LocalOrder {
    id: string;
    orderNumber: string;
    orderType: string;
    pickupSlotId: string | null;
    pickupDate: string | null;
    pickupCode: string | null;
    pickupCodeUsed: boolean;
    pickupConfirmedAt: Date | null;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    deliveryAddress: string | null;
    status: string;
    notes: string | null;
    subtotal: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    paidAt: Date | null;
    items?: LocalOrderItem[];
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class LocalOrdersResponse {
    orders: LocalOrder[];
    total: number;
}
