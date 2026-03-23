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
exports.SuccessResponse = exports.CurrentUserResponse = exports.AuthResponse = exports.Tenant = exports.User = exports.PackageType = exports.UserRole = void 0;
const graphql_1 = require("@nestjs/graphql");
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var PackageType;
(function (PackageType) {
    PackageType["STARTER"] = "starter";
    PackageType["BUSINESS"] = "business";
    PackageType["ENTERPRISE"] = "enterprise";
})(PackageType || (exports.PackageType = PackageType = {}));
(0, graphql_1.registerEnumType)(UserRole, { name: 'UserRole' });
(0, graphql_1.registerEnumType)(PackageType, { name: 'PackageType' });
let User = class User {
    id;
    email;
    firstName;
    lastName;
    role;
    isActive;
    emailVerified;
    lastLoginAt;
    createdAt;
};
exports.User = User;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserRole),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
exports.User = User = __decorate([
    (0, graphql_1.ObjectType)()
], User);
let Tenant = class Tenant {
    id;
    name;
    slug;
    domain;
    package;
    shopTemplate;
    isActive;
    createdAt;
};
exports.Tenant = Tenant;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => PackageType),
    __metadata("design:type", String)
], Tenant.prototype, "package", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "shopTemplate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, graphql_1.ObjectType)()
], Tenant);
let AuthResponse = class AuthResponse {
    user;
    tenant;
    accessToken;
    refreshToken;
};
exports.AuthResponse = AuthResponse;
__decorate([
    (0, graphql_1.Field)(() => User),
    __metadata("design:type", User)
], AuthResponse.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => Tenant),
    __metadata("design:type", Tenant)
], AuthResponse.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "accessToken", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuthResponse.prototype, "refreshToken", void 0);
exports.AuthResponse = AuthResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AuthResponse);
let CurrentUserResponse = class CurrentUserResponse {
    user;
    tenant;
};
exports.CurrentUserResponse = CurrentUserResponse;
__decorate([
    (0, graphql_1.Field)(() => User),
    __metadata("design:type", User)
], CurrentUserResponse.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => Tenant),
    __metadata("design:type", Tenant)
], CurrentUserResponse.prototype, "tenant", void 0);
exports.CurrentUserResponse = CurrentUserResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CurrentUserResponse);
let SuccessResponse = class SuccessResponse {
    success;
    message;
};
exports.SuccessResponse = SuccessResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SuccessResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SuccessResponse.prototype, "message", void 0);
exports.SuccessResponse = SuccessResponse = __decorate([
    (0, graphql_1.ObjectType)()
], SuccessResponse);
//# sourceMappingURL=auth.types.js.map