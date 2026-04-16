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
exports.UpdateFoodOrderStatusInput = exports.CreateFoodOrderInput = exports.FoodOrderItemInput = exports.SelectedModifierInput = exports.UpdateModifierInput = exports.CreateModifierInput = exports.UpdateModifierGroupInput = exports.CreateModifierGroupInput = exports.UpdateMenuItemInput = exports.CreateMenuItemInput = exports.UpdateMenuCategoryInput = exports.CreateMenuCategoryInput = exports.UpdateRestaurantTableInput = exports.CreateRestaurantTableInput = exports.UpdateRestaurantSettingsInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let UpdateRestaurantSettingsInput = class UpdateRestaurantSettingsInput {
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
};
exports.UpdateRestaurantSettingsInput = UpdateRestaurantSettingsInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "dineInEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "pickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "deliveryEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "deliveryRadius", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "deliveryFee", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "freeDeliveryFrom", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "estimatedPickupTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantSettingsInput.prototype, "estimatedDeliveryTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "cashEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "cardOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantSettingsInput.prototype, "onlinePaymentEnabled", void 0);
exports.UpdateRestaurantSettingsInput = UpdateRestaurantSettingsInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateRestaurantSettingsInput);
let CreateRestaurantTableInput = class CreateRestaurantTableInput {
    number;
    name;
    capacity;
};
exports.CreateRestaurantTableInput = CreateRestaurantTableInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateRestaurantTableInput.prototype, "number", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateRestaurantTableInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateRestaurantTableInput.prototype, "capacity", void 0);
exports.CreateRestaurantTableInput = CreateRestaurantTableInput = __decorate([
    (0, graphql_1.InputType)()
], CreateRestaurantTableInput);
let UpdateRestaurantTableInput = class UpdateRestaurantTableInput {
    number;
    name;
    capacity;
    isActive;
};
exports.UpdateRestaurantTableInput = UpdateRestaurantTableInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRestaurantTableInput.prototype, "number", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateRestaurantTableInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateRestaurantTableInput.prototype, "capacity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateRestaurantTableInput.prototype, "isActive", void 0);
exports.UpdateRestaurantTableInput = UpdateRestaurantTableInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateRestaurantTableInput);
let CreateMenuCategoryInput = class CreateMenuCategoryInput {
    name;
    description;
    image;
    position;
    availableFrom;
    availableTo;
};
exports.CreateMenuCategoryInput = CreateMenuCategoryInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMenuCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuCategoryInput.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateMenuCategoryInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuCategoryInput.prototype, "availableFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuCategoryInput.prototype, "availableTo", void 0);
exports.CreateMenuCategoryInput = CreateMenuCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], CreateMenuCategoryInput);
let UpdateMenuCategoryInput = class UpdateMenuCategoryInput {
    name;
    description;
    image;
    position;
    isActive;
    availableFrom;
    availableTo;
};
exports.UpdateMenuCategoryInput = UpdateMenuCategoryInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuCategoryInput.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMenuCategoryInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuCategoryInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuCategoryInput.prototype, "availableFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuCategoryInput.prototype, "availableTo", void 0);
exports.UpdateMenuCategoryInput = UpdateMenuCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMenuCategoryInput);
let CreateMenuItemInput = class CreateMenuItemInput {
    categoryId;
    name;
    description;
    price;
    images;
    allergens;
    isVegan;
    isVegetarian;
    isSpicy;
    isPopular;
    position;
    preparationTime;
};
exports.CreateMenuItemInput = CreateMenuItemInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuItemInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMenuItemInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMenuItemInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateMenuItemInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateMenuItemInput.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateMenuItemInput.prototype, "allergens", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateMenuItemInput.prototype, "isVegan", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateMenuItemInput.prototype, "isVegetarian", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateMenuItemInput.prototype, "isSpicy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateMenuItemInput.prototype, "isPopular", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateMenuItemInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateMenuItemInput.prototype, "preparationTime", void 0);
exports.CreateMenuItemInput = CreateMenuItemInput = __decorate([
    (0, graphql_1.InputType)()
], CreateMenuItemInput);
let UpdateMenuItemInput = class UpdateMenuItemInput {
    categoryId;
    name;
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
};
exports.UpdateMenuItemInput = UpdateMenuItemInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuItemInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuItemInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMenuItemInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMenuItemInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateMenuItemInput.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateMenuItemInput.prototype, "allergens", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuItemInput.prototype, "isVegan", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuItemInput.prototype, "isVegetarian", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuItemInput.prototype, "isSpicy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuItemInput.prototype, "isPopular", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMenuItemInput.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMenuItemInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMenuItemInput.prototype, "preparationTime", void 0);
exports.UpdateMenuItemInput = UpdateMenuItemInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMenuItemInput);
let CreateModifierGroupInput = class CreateModifierGroupInput {
    menuItemId;
    name;
    isRequired;
    minSelections;
    maxSelections;
    position;
};
exports.CreateModifierGroupInput = CreateModifierGroupInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateModifierGroupInput.prototype, "menuItemId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateModifierGroupInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateModifierGroupInput.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateModifierGroupInput.prototype, "minSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateModifierGroupInput.prototype, "maxSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateModifierGroupInput.prototype, "position", void 0);
exports.CreateModifierGroupInput = CreateModifierGroupInput = __decorate([
    (0, graphql_1.InputType)()
], CreateModifierGroupInput);
let UpdateModifierGroupInput = class UpdateModifierGroupInput {
    name;
    isRequired;
    minSelections;
    maxSelections;
    position;
};
exports.UpdateModifierGroupInput = UpdateModifierGroupInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateModifierGroupInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateModifierGroupInput.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateModifierGroupInput.prototype, "minSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateModifierGroupInput.prototype, "maxSelections", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateModifierGroupInput.prototype, "position", void 0);
exports.UpdateModifierGroupInput = UpdateModifierGroupInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateModifierGroupInput);
let CreateModifierInput = class CreateModifierInput {
    groupId;
    name;
    priceModifier;
    isDefault;
    position;
};
exports.CreateModifierInput = CreateModifierInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateModifierInput.prototype, "groupId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateModifierInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateModifierInput.prototype, "priceModifier", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateModifierInput.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateModifierInput.prototype, "position", void 0);
exports.CreateModifierInput = CreateModifierInput = __decorate([
    (0, graphql_1.InputType)()
], CreateModifierInput);
let UpdateModifierInput = class UpdateModifierInput {
    name;
    priceModifier;
    isDefault;
    isAvailable;
    position;
};
exports.UpdateModifierInput = UpdateModifierInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateModifierInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateModifierInput.prototype, "priceModifier", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateModifierInput.prototype, "isDefault", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateModifierInput.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateModifierInput.prototype, "position", void 0);
exports.UpdateModifierInput = UpdateModifierInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateModifierInput);
let SelectedModifierInput = class SelectedModifierInput {
    groupName;
    modifierName;
    priceModifier;
};
exports.SelectedModifierInput = SelectedModifierInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SelectedModifierInput.prototype, "groupName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SelectedModifierInput.prototype, "modifierName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SelectedModifierInput.prototype, "priceModifier", void 0);
exports.SelectedModifierInput = SelectedModifierInput = __decorate([
    (0, graphql_1.InputType)()
], SelectedModifierInput);
let FoodOrderItemInput = class FoodOrderItemInput {
    menuItemId;
    quantity;
    selectedModifiers;
    notes;
};
exports.FoodOrderItemInput = FoodOrderItemInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FoodOrderItemInput.prototype, "menuItemId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FoodOrderItemInput.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SelectedModifierInput], { nullable: true }),
    __metadata("design:type", Array)
], FoodOrderItemInput.prototype, "selectedModifiers", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FoodOrderItemInput.prototype, "notes", void 0);
exports.FoodOrderItemInput = FoodOrderItemInput = __decorate([
    (0, graphql_1.InputType)()
], FoodOrderItemInput);
let CreateFoodOrderInput = class CreateFoodOrderInput {
    orderType;
    tableId;
    customerName;
    customerEmail;
    customerPhone;
    deliveryAddress;
    notes;
    paymentMethod;
    couponCode;
    items;
};
exports.CreateFoodOrderInput = CreateFoodOrderInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "orderType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "tableId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "deliveryAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFoodOrderInput.prototype, "couponCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FoodOrderItemInput]),
    __metadata("design:type", Array)
], CreateFoodOrderInput.prototype, "items", void 0);
exports.CreateFoodOrderInput = CreateFoodOrderInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFoodOrderInput);
let UpdateFoodOrderStatusInput = class UpdateFoodOrderStatusInput {
    status;
    note;
};
exports.UpdateFoodOrderStatusInput = UpdateFoodOrderStatusInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateFoodOrderStatusInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFoodOrderStatusInput.prototype, "note", void 0);
exports.UpdateFoodOrderStatusInput = UpdateFoodOrderStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFoodOrderStatusInput);
//# sourceMappingURL=restaurant.input.js.map