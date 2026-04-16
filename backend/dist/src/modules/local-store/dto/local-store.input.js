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
exports.UpdateLocalOrderStatusInput = exports.CreateLocalOrderInput = exports.LocalOrderItemInput = exports.UpdatePickupSlotInput = exports.CreatePickupSlotInput = exports.UpdateLocalDealInput = exports.CreateLocalDealInput = exports.UpdateLocalProductInput = exports.CreateLocalProductInput = exports.UpdateLocalStoreSettingsInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let UpdateLocalStoreSettingsInput = class UpdateLocalStoreSettingsInput {
    storeType;
    pickupEnabled;
    deliveryEnabled;
    pickupSlotDuration;
    maxOrdersPerSlot;
    minOrderAmount;
    cashOnPickupEnabled;
    cardOnPickupEnabled;
    onlinePaymentEnabled;
};
exports.UpdateLocalStoreSettingsInput = UpdateLocalStoreSettingsInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalStoreSettingsInput.prototype, "storeType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalStoreSettingsInput.prototype, "pickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalStoreSettingsInput.prototype, "deliveryEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalStoreSettingsInput.prototype, "pickupSlotDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalStoreSettingsInput.prototype, "maxOrdersPerSlot", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalStoreSettingsInput.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalStoreSettingsInput.prototype, "cashOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalStoreSettingsInput.prototype, "cardOnPickupEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalStoreSettingsInput.prototype, "onlinePaymentEnabled", void 0);
exports.UpdateLocalStoreSettingsInput = UpdateLocalStoreSettingsInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLocalStoreSettingsInput);
let CreateLocalProductInput = class CreateLocalProductInput {
    name;
    categoryId;
    description;
    price;
    compareAtPrice;
    unit;
    images;
    stock;
    isUnlimited;
    isOrganic;
    isRegional;
    origin;
};
exports.CreateLocalProductInput = CreateLocalProductInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLocalProductInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalProductInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalProductInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateLocalProductInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateLocalProductInput.prototype, "compareAtPrice", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalProductInput.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateLocalProductInput.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateLocalProductInput.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateLocalProductInput.prototype, "isUnlimited", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateLocalProductInput.prototype, "isOrganic", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateLocalProductInput.prototype, "isRegional", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalProductInput.prototype, "origin", void 0);
exports.CreateLocalProductInput = CreateLocalProductInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLocalProductInput);
let UpdateLocalProductInput = class UpdateLocalProductInput {
    name;
    categoryId;
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
};
exports.UpdateLocalProductInput = UpdateLocalProductInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalProductInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalProductInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalProductInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalProductInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalProductInput.prototype, "compareAtPrice", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalProductInput.prototype, "unit", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateLocalProductInput.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalProductInput.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalProductInput.prototype, "isUnlimited", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalProductInput.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalProductInput.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalProductInput.prototype, "isOrganic", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalProductInput.prototype, "isRegional", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalProductInput.prototype, "origin", void 0);
exports.UpdateLocalProductInput = UpdateLocalProductInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLocalProductInput);
let CreateLocalDealInput = class CreateLocalDealInput {
    title;
    localProductId;
    description;
    image;
    discountType;
    discountValue;
    startsAt;
    endsAt;
};
exports.CreateLocalDealInput = CreateLocalDealInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLocalDealInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalDealInput.prototype, "localProductId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalDealInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalDealInput.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLocalDealInput.prototype, "discountType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateLocalDealInput.prototype, "discountValue", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CreateLocalDealInput.prototype, "startsAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CreateLocalDealInput.prototype, "endsAt", void 0);
exports.CreateLocalDealInput = CreateLocalDealInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLocalDealInput);
let UpdateLocalDealInput = class UpdateLocalDealInput {
    title;
    description;
    image;
    discountType;
    discountValue;
    startsAt;
    endsAt;
    isActive;
};
exports.UpdateLocalDealInput = UpdateLocalDealInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalDealInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalDealInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalDealInput.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalDealInput.prototype, "discountType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLocalDealInput.prototype, "discountValue", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateLocalDealInput.prototype, "startsAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateLocalDealInput.prototype, "endsAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLocalDealInput.prototype, "isActive", void 0);
exports.UpdateLocalDealInput = UpdateLocalDealInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLocalDealInput);
let CreatePickupSlotInput = class CreatePickupSlotInput {
    dayOfWeek;
    startTime;
    endTime;
    maxOrders;
};
exports.CreatePickupSlotInput = CreatePickupSlotInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreatePickupSlotInput.prototype, "dayOfWeek", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePickupSlotInput.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePickupSlotInput.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreatePickupSlotInput.prototype, "maxOrders", void 0);
exports.CreatePickupSlotInput = CreatePickupSlotInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePickupSlotInput);
let UpdatePickupSlotInput = class UpdatePickupSlotInput {
    dayOfWeek;
    startTime;
    endTime;
    maxOrders;
    isActive;
};
exports.UpdatePickupSlotInput = UpdatePickupSlotInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdatePickupSlotInput.prototype, "dayOfWeek", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePickupSlotInput.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePickupSlotInput.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdatePickupSlotInput.prototype, "maxOrders", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdatePickupSlotInput.prototype, "isActive", void 0);
exports.UpdatePickupSlotInput = UpdatePickupSlotInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePickupSlotInput);
let LocalOrderItemInput = class LocalOrderItemInput {
    localProductId;
    quantity;
};
exports.LocalOrderItemInput = LocalOrderItemInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocalOrderItemInput.prototype, "localProductId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LocalOrderItemInput.prototype, "quantity", void 0);
exports.LocalOrderItemInput = LocalOrderItemInput = __decorate([
    (0, graphql_1.InputType)()
], LocalOrderItemInput);
let CreateLocalOrderInput = class CreateLocalOrderInput {
    orderType;
    pickupSlotId;
    pickupDate;
    customerName;
    customerEmail;
    customerPhone;
    deliveryAddress;
    notes;
    paymentMethod;
    couponCode;
    items;
};
exports.CreateLocalOrderInput = CreateLocalOrderInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "orderType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "pickupSlotId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "pickupDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "deliveryAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLocalOrderInput.prototype, "couponCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => [LocalOrderItemInput]),
    __metadata("design:type", Array)
], CreateLocalOrderInput.prototype, "items", void 0);
exports.CreateLocalOrderInput = CreateLocalOrderInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLocalOrderInput);
let UpdateLocalOrderStatusInput = class UpdateLocalOrderStatusInput {
    status;
    note;
};
exports.UpdateLocalOrderStatusInput = UpdateLocalOrderStatusInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateLocalOrderStatusInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLocalOrderStatusInput.prototype, "note", void 0);
exports.UpdateLocalOrderStatusInput = UpdateLocalOrderStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLocalOrderStatusInput);
//# sourceMappingURL=local-store.input.js.map