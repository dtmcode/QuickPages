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
exports.ValidateCouponInput = exports.UpdateCouponInput = exports.CreateCouponInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let CreateCouponInput = class CreateCouponInput {
    code;
    type;
    value;
    minOrderAmount;
    maxUses;
    expiresAt;
    applicableTo;
    isActive;
};
exports.CreateCouponInput = CreateCouponInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCouponInput.prototype, "code", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCouponInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateCouponInput.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateCouponInput.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateCouponInput.prototype, "maxUses", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateCouponInput.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCouponInput.prototype, "applicableTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateCouponInput.prototype, "isActive", void 0);
exports.CreateCouponInput = CreateCouponInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCouponInput);
let UpdateCouponInput = class UpdateCouponInput {
    code;
    type;
    value;
    minOrderAmount;
    maxUses;
    expiresAt;
    applicableTo;
    isActive;
};
exports.UpdateCouponInput = UpdateCouponInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCouponInput.prototype, "code", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCouponInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCouponInput.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCouponInput.prototype, "minOrderAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCouponInput.prototype, "maxUses", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateCouponInput.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCouponInput.prototype, "applicableTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCouponInput.prototype, "isActive", void 0);
exports.UpdateCouponInput = UpdateCouponInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCouponInput);
let ValidateCouponInput = class ValidateCouponInput {
    code;
    module;
    orderAmount;
};
exports.ValidateCouponInput = ValidateCouponInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ValidateCouponInput.prototype, "code", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ValidateCouponInput.prototype, "module", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ValidateCouponInput.prototype, "orderAmount", void 0);
exports.ValidateCouponInput = ValidateCouponInput = __decorate([
    (0, graphql_1.InputType)()
], ValidateCouponInput);
//# sourceMappingURL=coupons.input.js.map