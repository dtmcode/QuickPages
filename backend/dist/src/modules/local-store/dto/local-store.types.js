"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalOrdersResponse = exports.LocalOrder = exports.LocalOrderItem = exports.AvailablePickupSlot = exports.LocalPickupSlotsResponse = exports.LocalPickupSlot = exports.LocalDealsResponse = exports.LocalDeal = exports.LocalProductsResponse = exports.LocalProduct = exports.LocalStoreSettings = exports.StoreType = exports.LocalOrderType = exports.LocalOrderStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var LocalOrderStatus;
(function (LocalOrderStatus) {
    LocalOrderStatus["PENDING"] = "pending";
    LocalOrderStatus["CONFIRMED"] = "confirmed";
    LocalOrderStatus["READY"] = "ready";
    LocalOrderStatus["PICKED_UP"] = "picked_up";
    LocalOrderStatus["CANCELLED"] = "cancelled";
})(LocalOrderStatus || (exports.LocalOrderStatus = LocalOrderStatus = {}));
(0, graphql_1.registerEnumType)(LocalOrderStatus, { name: 'LocalOrderStatus' });
var LocalOrderType;
(function (LocalOrderType) {
    LocalOrderType["PICKUP"] = "pickup";
    LocalOrderType["DELIVERY"] = "delivery";
})(LocalOrderType || (exports.LocalOrderType = LocalOrderType = {}));
(0, graphql_1.registerEnumType)(LocalOrderType, { name: 'LocalOrderType' });
var StoreType;
(function (StoreType) {
    StoreType["MARKET"] = "market";
    StoreType["PHARMACY"] = "pharmacy";
    StoreType["FLORIST"] = "florist";
    StoreType["BAKERY"] = "bakery";
    StoreType["BUTCHER"] = "butcher";
    StoreType["KIOSK"] = "kiosk";
    StoreType["FARM"] = "farm";
    StoreType["OTHER"] = "other";
})(StoreType || (exports.StoreType = StoreType = {}));
(0, graphql_1.registerEnumType)(StoreType, { name: 'StoreType' });
let LocalStoreSettings = class LocalStoreSettings {
    id;
    tenantId;
    storeType;
    pickupEnabled;
    deliveryEnabled;
    pickupSlotDuration;
    maxOrdersPerSlot;
    minOrderAmount;
    cashOnPickupEnabled;
    cardOnPickupEnabled;
    onlinePaymentEnabled;
    createdAt;
    updatedAt;
};
exports.LocalStoreSettings = LocalStoreSettings;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalStoreSettings.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalStoreSettings.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalStoreSettings.prototype, "storeType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalStoreSettings.prototype, "pickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalStoreSettings.prototype, "deliveryEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LocalStoreSettings.prototype, "pickupSlotDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LocalStoreSettings.prototype, "maxOrdersPerSlot", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LocalStoreSettings.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalStoreSettings.prototype, "cashOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalStoreSettings.prototype, "cardOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalStoreSettings.prototype, "onlinePaymentEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalStoreSettings.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalStoreSettings.prototype, "updatedAt", void 0);
exports.LocalStoreSettings = LocalStoreSettings = __decorate([
    (0, graphql_1.ObjectType)()
], LocalStoreSettings);
let LocalProduct = class LocalProduct {
    id;
    categoryId;
    name;
    slug;
    description;
    price;
    compareAtPrice;
    unit;
    images;
    stock;
    isUnlimited;
    isAvailable;
    isFeatured;
    isOrganic;
    isRegional;
    origin;
    createdAt;
    updatedAt;
};
exports.LocalProduct = LocalProduct;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalProduct.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalProduct.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalProduct.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalProduct.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "compareAtPrice", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalProduct.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalProduct.prototype, "isUnlimited", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalProduct.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalProduct.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalProduct.prototype, "isOrganic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalProduct.prototype, "isRegional", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "origin", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalProduct.prototype, "updatedAt", void 0);
exports.LocalProduct = LocalProduct = __decorate([
    (0, graphql_1.ObjectType)()
], LocalProduct);
let LocalProductsResponse = class LocalProductsResponse {
    products;
    total;
};
exports.LocalProductsResponse = LocalProductsResponse;
__decorate([
    (0, graphql_1.Field)(() => [LocalProduct]),
    __metadata("design:type", Array)
], LocalProductsResponse.prototype, "products", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalProductsResponse.prototype, "total", void 0);
exports.LocalProductsResponse = LocalProductsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], LocalProductsResponse);
let LocalDeal = class LocalDeal {
    id;
    localProductId;
    title;
    description;
    image;
    discountType;
    discountValue;
    startsAt;
    endsAt;
    isActive;
    product;
    createdAt;
};
exports.LocalDeal = LocalDeal;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalDeal.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalDeal.prototype, "localProductId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalDeal.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalDeal.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalDeal.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalDeal.prototype, "discountType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalDeal.prototype, "discountValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], LocalDeal.prototype, "startsAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], LocalDeal.prototype, "endsAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalDeal.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => LocalProduct, { nullable: true }),
    __metadata("design:type", Object)
], LocalDeal.prototype, "product", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalDeal.prototype, "createdAt", void 0);
exports.LocalDeal = LocalDeal = __decorate([
    (0, graphql_1.ObjectType)()
], LocalDeal);
let LocalDealsResponse = class LocalDealsResponse {
    deals;
    total;
};
exports.LocalDealsResponse = LocalDealsResponse;
__decorate([
    (0, graphql_1.Field)(() => [LocalDeal]),
    __metadata("design:type", Array)
], LocalDealsResponse.prototype, "deals", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalDealsResponse.prototype, "total", void 0);
exports.LocalDealsResponse = LocalDealsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], LocalDealsResponse);
let LocalPickupSlot = class LocalPickupSlot {
    id;
    dayOfWeek;
    startTime;
    endTime;
    maxOrders;
    isActive;
};
exports.LocalPickupSlot = LocalPickupSlot;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalPickupSlot.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalPickupSlot.prototype, "dayOfWeek", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalPickupSlot.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalPickupSlot.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalPickupSlot.prototype, "maxOrders", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalPickupSlot.prototype, "isActive", void 0);
exports.LocalPickupSlot = LocalPickupSlot = __decorate([
    (0, graphql_1.ObjectType)()
], LocalPickupSlot);
let LocalPickupSlotsResponse = class LocalPickupSlotsResponse {
    slots;
    total;
};
exports.LocalPickupSlotsResponse = LocalPickupSlotsResponse;
__decorate([
    (0, graphql_1.Field)(() => [LocalPickupSlot]),
    __metadata("design:type", Array)
], LocalPickupSlotsResponse.prototype, "slots", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalPickupSlotsResponse.prototype, "total", void 0);
exports.LocalPickupSlotsResponse = LocalPickupSlotsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], LocalPickupSlotsResponse);
let AvailablePickupSlot = class AvailablePickupSlot {
    slotId;
    date;
    startTime;
    endTime;
    available;
    maxOrders;
};
exports.AvailablePickupSlot = AvailablePickupSlot;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AvailablePickupSlot.prototype, "slotId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AvailablePickupSlot.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AvailablePickupSlot.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AvailablePickupSlot.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AvailablePickupSlot.prototype, "available", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AvailablePickupSlot.prototype, "maxOrders", void 0);
exports.AvailablePickupSlot = AvailablePickupSlot = __decorate([
    (0, graphql_1.ObjectType)()
], AvailablePickupSlot);
let LocalOrderItem = class LocalOrderItem {
    id;
    localProductId;
    productName;
    productPrice;
    unit;
    quantity;
    total;
};
exports.LocalOrderItem = LocalOrderItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalOrderItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrderItem.prototype, "localProductId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrderItem.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrderItem.prototype, "productPrice", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrderItem.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrderItem.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrderItem.prototype, "total", void 0);
exports.LocalOrderItem = LocalOrderItem = __decorate([
    (0, graphql_1.ObjectType)()
], LocalOrderItem);
let LocalOrder = class LocalOrder {
    id;
    orderNumber;
    orderType;
    pickupSlotId;
    pickupDate;
    pickupCode;
    pickupCodeUsed;
    pickupConfirmedAt;
    customerName;
    customerEmail;
    customerPhone;
    deliveryAddress;
    status;
    notes;
    subtotal;
    discountAmount;
    total;
    paymentMethod;
    paidAt;
    items;
    createdAt;
    updatedAt;
};
exports.LocalOrder = LocalOrder;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LocalOrder.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrder.prototype, "orderType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "pickupSlotId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "pickupDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "pickupCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LocalOrder.prototype, "pickupCodeUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "pickupConfirmedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrder.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "deliveryAddress", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrder.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrder.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrder.prototype, "discountAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrder.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrder.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "paidAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [LocalOrderItem], { nullable: true }),
    __metadata("design:type", Array)
], LocalOrder.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LocalOrder.prototype, "updatedAt", void 0);
exports.LocalOrder = LocalOrder = __decorate([
    (0, graphql_1.ObjectType)()
], LocalOrder);
let LocalOrdersResponse = class LocalOrdersResponse {
    orders;
    total;
};
exports.LocalOrdersResponse = LocalOrdersResponse;
__decorate([
    (0, graphql_1.Field)(() => [LocalOrder]),
    __metadata("design:type", Array)
], LocalOrdersResponse.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrdersResponse.prototype, "total", void 0);
exports.LocalOrdersResponse = LocalOrdersResponse = __decorate([
    (0, graphql_1.ObjectType)()
], LocalOrdersResponse);
//# sourceMappingURL=local-store.types.js.map