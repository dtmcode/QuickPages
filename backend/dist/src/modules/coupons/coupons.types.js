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
exports.CouponValidationResult = exports.CouponUsesResponse = exports.CouponUse = exports.CouponsResponse = exports.Coupon = void 0;
const graphql_1 = require("@nestjs/graphql");
let Coupon = class Coupon {
    id;
    tenantId;
    code;
    type;
    value;
    minOrderAmount;
    maxUses;
    usedCount;
    isActive;
    expiresAt;
    applicableTo;
    createdAt;
    updatedAt;
};
exports.Coupon = Coupon;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Coupon.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Coupon.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Coupon.prototype, "code", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Coupon.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Coupon.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Coupon.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Coupon.prototype, "maxUses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Coupon.prototype, "usedCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Coupon.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], Coupon.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Coupon.prototype, "applicableTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], Coupon.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], Coupon.prototype, "updatedAt", void 0);
exports.Coupon = Coupon = __decorate([
    (0, graphql_1.ObjectType)()
], Coupon);
let CouponsResponse = class CouponsResponse {
    coupons;
    total;
};
exports.CouponsResponse = CouponsResponse;
__decorate([
    (0, graphql_1.Field)(() => [Coupon]),
    __metadata("design:type", Array)
], CouponsResponse.prototype, "coupons", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CouponsResponse.prototype, "total", void 0);
exports.CouponsResponse = CouponsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CouponsResponse);
let CouponUse = class CouponUse {
    id;
    couponId;
    tenantId;
    customerEmail;
    referenceId;
    referenceType;
    discountAmount;
    createdAt;
};
exports.CouponUse = CouponUse;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CouponUse.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CouponUse.prototype, "couponId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CouponUse.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CouponUse.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], CouponUse.prototype, "referenceId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CouponUse.prototype, "referenceType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CouponUse.prototype, "discountAmount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], CouponUse.prototype, "createdAt", void 0);
exports.CouponUse = CouponUse = __decorate([
    (0, graphql_1.ObjectType)()
], CouponUse);
let CouponUsesResponse = class CouponUsesResponse {
    uses;
    total;
};
exports.CouponUsesResponse = CouponUsesResponse;
__decorate([
    (0, graphql_1.Field)(() => [CouponUse]),
    __metadata("design:type", Array)
], CouponUsesResponse.prototype, "uses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CouponUsesResponse.prototype, "total", void 0);
exports.CouponUsesResponse = CouponUsesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CouponUsesResponse);
let CouponValidationResult = class CouponValidationResult {
    valid;
    message;
    discountType;
    discountValue;
    discountAmount;
};
exports.CouponValidationResult = CouponValidationResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CouponValidationResult.prototype, "valid", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], CouponValidationResult.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], CouponValidationResult.prototype, "discountType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], CouponValidationResult.prototype, "discountValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], CouponValidationResult.prototype, "discountAmount", void 0);
exports.CouponValidationResult = CouponValidationResult = __decorate([
    (0, graphql_1.ObjectType)()
], CouponValidationResult);
//# sourceMappingURL=coupons.types.js.map