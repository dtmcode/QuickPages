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
exports.AvailablePackagesResponse = exports.PackageDefinitionType = exports.AddonDefinitionType = exports.TenantSubscriptionInfo = exports.PackageLimitsType = exports.UsageStats = exports.TenantAddon = exports.Subscription = exports.SubscriptionStatus = exports.AddonType = void 0;
const graphql_1 = require("@nestjs/graphql");
var AddonType;
(function (AddonType) {
    AddonType["SHOP_MODULE"] = "shop_module";
    AddonType["SHOP_EXTRA"] = "shop_extra";
    AddonType["BOOKING_MODULE"] = "booking_module";
    AddonType["BLOG_MODULE"] = "blog_module";
    AddonType["NEWSLETTER_EXTRA"] = "newsletter_extra";
    AddonType["MEMBERS_MODULE"] = "members_module";
    AddonType["AI_CONTENT"] = "ai_content";
    AddonType["EXTRA_PAGES"] = "extra_pages";
    AddonType["EXTRA_USERS"] = "extra_users";
    AddonType["I18N"] = "i18n";
    AddonType["CUSTOM_DOMAIN"] = "custom_domain";
    AddonType["RESTAURANT_MODULE"] = "restaurant_module";
    AddonType["LOCAL_STORE_MODULE"] = "local_store_module";
    AddonType["FUNNELS_MODULE"] = "funnels_module";
    AddonType["SHOP_BUSINESS"] = "shop_business";
    AddonType["SHOP_PRO"] = "shop_pro";
    AddonType["EMAIL_STARTER"] = "email_starter";
    AddonType["EMAIL_BUSINESS"] = "email_business";
    AddonType["NEWSLETTER"] = "newsletter";
    AddonType["BOOKING"] = "booking";
    AddonType["FORM_BUILDER"] = "form_builder";
    AddonType["EXTRA_PRODUCTS"] = "extra_products";
    AddonType["EXTRA_AI_CREDITS"] = "extra_ai_credits";
})(AddonType || (exports.AddonType = AddonType = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["PAST_DUE"] = "past_due";
    SubscriptionStatus["TRIALING"] = "trialing";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
(0, graphql_1.registerEnumType)(AddonType, { name: 'AddonType' });
(0, graphql_1.registerEnumType)(SubscriptionStatus, { name: 'SubscriptionStatus' });
let Subscription = class Subscription {
    id;
    package;
    status;
    currentPeriodStart;
    currentPeriodEnd;
    cancelAtPeriodEnd;
    stripeSubscriptionId;
    createdAt;
};
exports.Subscription = Subscription;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Subscription.prototype, "package", void 0);
__decorate([
    (0, graphql_1.Field)(() => SubscriptionStatus),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Subscription.prototype, "cancelAtPeriodEnd", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Subscription.prototype, "createdAt", void 0);
exports.Subscription = Subscription = __decorate([
    (0, graphql_1.ObjectType)()
], Subscription);
let TenantAddon = class TenantAddon {
    id;
    addonType;
    quantity;
    isActive;
    activatedAt;
    expiresAt;
    createdAt;
};
exports.TenantAddon = TenantAddon;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TenantAddon.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => AddonType),
    __metadata("design:type", String)
], TenantAddon.prototype, "addonType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TenantAddon.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TenantAddon.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TenantAddon.prototype, "activatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TenantAddon.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TenantAddon.prototype, "createdAt", void 0);
exports.TenantAddon = TenantAddon = __decorate([
    (0, graphql_1.ObjectType)()
], TenantAddon);
let UsageStats = class UsageStats {
    month;
    emailsSent;
    productsCreated;
    postsCreated;
    apiCalls;
    storageUsedMb;
};
exports.UsageStats = UsageStats;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UsageStats.prototype, "month", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UsageStats.prototype, "emailsSent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UsageStats.prototype, "productsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UsageStats.prototype, "postsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UsageStats.prototype, "apiCalls", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UsageStats.prototype, "storageUsedMb", void 0);
exports.UsageStats = UsageStats = __decorate([
    (0, graphql_1.ObjectType)()
], UsageStats);
let PackageLimitsType = class PackageLimitsType {
    users;
    posts;
    pages;
    products;
    emailsPerMonth;
    subscribers;
    aiCredits;
    storageMb;
};
exports.PackageLimitsType = PackageLimitsType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "posts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "pages", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "products", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "emailsPerMonth", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "subscribers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "aiCredits", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageLimitsType.prototype, "storageMb", void 0);
exports.PackageLimitsType = PackageLimitsType = __decorate([
    (0, graphql_1.ObjectType)()
], PackageLimitsType);
let TenantSubscriptionInfo = class TenantSubscriptionInfo {
    currentPackage;
    limits;
    addons;
    currentUsage;
    subscription;
};
exports.TenantSubscriptionInfo = TenantSubscriptionInfo;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TenantSubscriptionInfo.prototype, "currentPackage", void 0);
__decorate([
    (0, graphql_1.Field)(() => PackageLimitsType),
    __metadata("design:type", PackageLimitsType)
], TenantSubscriptionInfo.prototype, "limits", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TenantAddon]),
    __metadata("design:type", Array)
], TenantSubscriptionInfo.prototype, "addons", void 0);
__decorate([
    (0, graphql_1.Field)(() => UsageStats),
    __metadata("design:type", UsageStats)
], TenantSubscriptionInfo.prototype, "currentUsage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Subscription)
], TenantSubscriptionInfo.prototype, "subscription", void 0);
exports.TenantSubscriptionInfo = TenantSubscriptionInfo = __decorate([
    (0, graphql_1.ObjectType)()
], TenantSubscriptionInfo);
let AddonDefinitionType = class AddonDefinitionType {
    type;
    name;
    description;
    price;
    limits;
};
exports.AddonDefinitionType = AddonDefinitionType;
__decorate([
    (0, graphql_1.Field)(() => AddonType),
    __metadata("design:type", String)
], AddonDefinitionType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AddonDefinitionType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AddonDefinitionType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AddonDefinitionType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => PackageLimitsType),
    __metadata("design:type", PackageLimitsType)
], AddonDefinitionType.prototype, "limits", void 0);
exports.AddonDefinitionType = AddonDefinitionType = __decorate([
    (0, graphql_1.ObjectType)()
], AddonDefinitionType);
let PackageDefinitionType = class PackageDefinitionType {
    type;
    name;
    description;
    price;
    limits;
    features;
};
exports.PackageDefinitionType = PackageDefinitionType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PackageDefinitionType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PackageDefinitionType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PackageDefinitionType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PackageDefinitionType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => PackageLimitsType),
    __metadata("design:type", PackageLimitsType)
], PackageDefinitionType.prototype, "limits", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], PackageDefinitionType.prototype, "features", void 0);
exports.PackageDefinitionType = PackageDefinitionType = __decorate([
    (0, graphql_1.ObjectType)()
], PackageDefinitionType);
let AvailablePackagesResponse = class AvailablePackagesResponse {
    packages;
    addons;
};
exports.AvailablePackagesResponse = AvailablePackagesResponse;
__decorate([
    (0, graphql_1.Field)(() => [PackageDefinitionType]),
    __metadata("design:type", Array)
], AvailablePackagesResponse.prototype, "packages", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AddonDefinitionType]),
    __metadata("design:type", Array)
], AvailablePackagesResponse.prototype, "addons", void 0);
exports.AvailablePackagesResponse = AvailablePackagesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AvailablePackagesResponse);
//# sourceMappingURL=subscription.types.js.map