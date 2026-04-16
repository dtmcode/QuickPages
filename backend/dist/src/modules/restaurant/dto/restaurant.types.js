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
exports.FoodOrdersResponse = exports.FoodOrder = exports.FoodOrderStatusEntry = exports.FoodOrderItem = exports.SelectedModifier = exports.MenuItemsResponse = exports.MenuItem = exports.MenuModifierGroup = exports.MenuModifier = exports.MenuCategoriesResponse = exports.MenuCategory = exports.RestaurantTablesResponse = exports.RestaurantTable = exports.RestaurantSettings = exports.PaymentMethod = exports.FoodOrderStatus = exports.FoodOrderType = void 0;
const graphql_1 = require("@nestjs/graphql");
var FoodOrderType;
(function (FoodOrderType) {
    FoodOrderType["DINE_IN"] = "dine_in";
    FoodOrderType["PICKUP"] = "pickup";
    FoodOrderType["DELIVERY"] = "delivery";
})(FoodOrderType || (exports.FoodOrderType = FoodOrderType = {}));
(0, graphql_1.registerEnumType)(FoodOrderType, { name: 'FoodOrderType' });
var FoodOrderStatus;
(function (FoodOrderStatus) {
    FoodOrderStatus["NEW"] = "new";
    FoodOrderStatus["ACCEPTED"] = "accepted";
    FoodOrderStatus["PREPARING"] = "preparing";
    FoodOrderStatus["READY"] = "ready";
    FoodOrderStatus["ON_THE_WAY"] = "on_the_way";
    FoodOrderStatus["DELIVERED"] = "delivered";
    FoodOrderStatus["CANCELLED"] = "cancelled";
})(FoodOrderStatus || (exports.FoodOrderStatus = FoodOrderStatus = {}));
(0, graphql_1.registerEnumType)(FoodOrderStatus, { name: 'FoodOrderStatus' });
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD_ON_PICKUP"] = "card_on_pickup";
    PaymentMethod["ONLINE"] = "online";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
(0, graphql_1.registerEnumType)(PaymentMethod, { name: 'PaymentMethod' });
let RestaurantSettings = class RestaurantSettings {
    id;
    tenantId;
    dineInEnabled;
    pickupEnabled;
    deliveryEnabled;
    deliveryRadius;
    deliveryFee;
    freeDeliveryFrom;
    minOrderAmount;
    estimatedPickupTime;
    estimatedDeliveryTime;
    cashEnabled;
    cardOnPickupEnabled;
    onlinePaymentEnabled;
    createdAt;
    updatedAt;
};
exports.RestaurantSettings = RestaurantSettings;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RestaurantSettings.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RestaurantSettings.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "dineInEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "pickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "deliveryEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "deliveryRadius", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "deliveryFee", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "freeDeliveryFrom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "estimatedPickupTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "estimatedDeliveryTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "cashEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "cardOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantSettings.prototype, "onlinePaymentEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantSettings.prototype, "updatedAt", void 0);
exports.RestaurantSettings = RestaurantSettings = __decorate([
    (0, graphql_1.ObjectType)()
], RestaurantSettings);
let RestaurantTable = class RestaurantTable {
    id;
    number;
    name;
    capacity;
    qrCode;
    isActive;
    createdAt;
};
exports.RestaurantTable = RestaurantTable;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RestaurantTable.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RestaurantTable.prototype, "number", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantTable.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RestaurantTable.prototype, "capacity", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantTable.prototype, "qrCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RestaurantTable.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], RestaurantTable.prototype, "createdAt", void 0);
exports.RestaurantTable = RestaurantTable = __decorate([
    (0, graphql_1.ObjectType)()
], RestaurantTable);
let RestaurantTablesResponse = class RestaurantTablesResponse {
    tables;
    total;
};
exports.RestaurantTablesResponse = RestaurantTablesResponse;
__decorate([
    (0, graphql_1.Field)(() => [RestaurantTable]),
    __metadata("design:type", Array)
], RestaurantTablesResponse.prototype, "tables", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RestaurantTablesResponse.prototype, "total", void 0);
exports.RestaurantTablesResponse = RestaurantTablesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], RestaurantTablesResponse);
let MenuCategory = class MenuCategory {
    id;
    name;
    slug;
    description;
    image;
    position;
    isActive;
    availableFrom;
    availableTo;
    items;
    createdAt;
    updatedAt;
};
exports.MenuCategory = MenuCategory;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MenuCategory.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuCategory.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuCategory.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuCategory.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuCategory.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "availableFrom", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "availableTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuItem], { nullable: true }),
    __metadata("design:type", Array)
], MenuCategory.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuCategory.prototype, "updatedAt", void 0);
exports.MenuCategory = MenuCategory = __decorate([
    (0, graphql_1.ObjectType)()
], MenuCategory);
let MenuCategoriesResponse = class MenuCategoriesResponse {
    categories;
    total;
};
exports.MenuCategoriesResponse = MenuCategoriesResponse;
__decorate([
    (0, graphql_1.Field)(() => [MenuCategory]),
    __metadata("design:type", Array)
], MenuCategoriesResponse.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuCategoriesResponse.prototype, "total", void 0);
exports.MenuCategoriesResponse = MenuCategoriesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], MenuCategoriesResponse);
let MenuModifier = class MenuModifier {
    id;
    name;
    priceModifier;
    isDefault;
    isAvailable;
    position;
    createdAt;
};
exports.MenuModifier = MenuModifier;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MenuModifier.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuModifier.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuModifier.prototype, "priceModifier", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuModifier.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuModifier.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuModifier.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuModifier.prototype, "createdAt", void 0);
exports.MenuModifier = MenuModifier = __decorate([
    (0, graphql_1.ObjectType)()
], MenuModifier);
let MenuModifierGroup = class MenuModifierGroup {
    id;
    name;
    isRequired;
    minSelections;
    maxSelections;
    position;
    modifiers;
    createdAt;
};
exports.MenuModifierGroup = MenuModifierGroup;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MenuModifierGroup.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuModifierGroup.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuModifierGroup.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuModifierGroup.prototype, "minSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuModifierGroup.prototype, "maxSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuModifierGroup.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuModifier], { nullable: true }),
    __metadata("design:type", Array)
], MenuModifierGroup.prototype, "modifiers", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuModifierGroup.prototype, "createdAt", void 0);
exports.MenuModifierGroup = MenuModifierGroup = __decorate([
    (0, graphql_1.ObjectType)()
], MenuModifierGroup);
let MenuItem = class MenuItem {
    id;
    categoryId;
    name;
    slug;
    description;
    price;
    images;
    allergens;
    isVegan;
    isVegetarian;
    isSpicy;
    isPopular;
    isAvailable;
    position;
    preparationTime;
    modifierGroups;
    createdAt;
    updatedAt;
};
exports.MenuItem = MenuItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MenuItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuItem.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuItem.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuItem.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "allergens", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isVegan", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isVegetarian", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isSpicy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isPopular", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuItem.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "preparationTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuModifierGroup], { nullable: true }),
    __metadata("design:type", Array)
], MenuItem.prototype, "modifierGroups", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MenuItem.prototype, "updatedAt", void 0);
exports.MenuItem = MenuItem = __decorate([
    (0, graphql_1.ObjectType)()
], MenuItem);
let MenuItemsResponse = class MenuItemsResponse {
    items;
    total;
};
exports.MenuItemsResponse = MenuItemsResponse;
__decorate([
    (0, graphql_1.Field)(() => [MenuItem]),
    __metadata("design:type", Array)
], MenuItemsResponse.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuItemsResponse.prototype, "total", void 0);
exports.MenuItemsResponse = MenuItemsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], MenuItemsResponse);
let SelectedModifier = class SelectedModifier {
    groupName;
    modifierName;
    priceModifier;
};
exports.SelectedModifier = SelectedModifier;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SelectedModifier.prototype, "groupName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SelectedModifier.prototype, "modifierName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SelectedModifier.prototype, "priceModifier", void 0);
exports.SelectedModifier = SelectedModifier = __decorate([
    (0, graphql_1.ObjectType)()
], SelectedModifier);
let FoodOrderItem = class FoodOrderItem {
    id;
    menuItemId;
    menuItemName;
    menuItemPrice;
    quantity;
    selectedModifiers;
    notes;
    total;
};
exports.FoodOrderItem = FoodOrderItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FoodOrderItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrderItem.prototype, "menuItemId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrderItem.prototype, "menuItemName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrderItem.prototype, "menuItemPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrderItem.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrderItem.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrderItem.prototype, "total", void 0);
exports.FoodOrderItem = FoodOrderItem = __decorate([
    (0, graphql_1.ObjectType)()
], FoodOrderItem);
let FoodOrderStatusEntry = class FoodOrderStatusEntry {
    id;
    status;
    note;
    createdAt;
};
exports.FoodOrderStatusEntry = FoodOrderStatusEntry;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FoodOrderStatusEntry.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrderStatusEntry.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrderStatusEntry.prototype, "note", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrderStatusEntry.prototype, "createdAt", void 0);
exports.FoodOrderStatusEntry = FoodOrderStatusEntry = __decorate([
    (0, graphql_1.ObjectType)()
], FoodOrderStatusEntry);
let FoodOrder = class FoodOrder {
    id;
    orderNumber;
    orderType;
    tableId;
    customerName;
    customerEmail;
    customerPhone;
    deliveryAddress;
    status;
    notes;
    subtotal;
    tax;
    deliveryFee;
    discountAmount;
    total;
    pickupCode;
    pickupCodeUsed;
    estimatedReadyAt;
    paymentMethod;
    paidAt;
    items;
    statusHistory;
    createdAt;
    updatedAt;
};
exports.FoodOrder = FoodOrder;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FoodOrder.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrder.prototype, "orderType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "tableId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrder.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "deliveryAddress", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrder.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrder.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrder.prototype, "tax", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrder.prototype, "deliveryFee", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrder.prototype, "discountAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrder.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "pickupCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FoodOrder.prototype, "pickupCodeUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "estimatedReadyAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrder.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "paidAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FoodOrderItem], { nullable: true }),
    __metadata("design:type", Array)
], FoodOrder.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FoodOrderStatusEntry], { nullable: true }),
    __metadata("design:type", Array)
], FoodOrder.prototype, "statusHistory", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FoodOrder.prototype, "updatedAt", void 0);
exports.FoodOrder = FoodOrder = __decorate([
    (0, graphql_1.ObjectType)()
], FoodOrder);
let FoodOrdersResponse = class FoodOrdersResponse {
    orders;
    total;
};
exports.FoodOrdersResponse = FoodOrdersResponse;
__decorate([
    (0, graphql_1.Field)(() => [FoodOrder]),
    __metadata("design:type", Array)
], FoodOrdersResponse.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrdersResponse.prototype, "total", void 0);
exports.FoodOrdersResponse = FoodOrdersResponse = __decorate([
    (0, graphql_1.ObjectType)()
], FoodOrdersResponse);
//# sourceMappingURL=restaurant.types.js.map