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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportResult = exports.SubscriberStats = exports.UpdateSubscriberInput = exports.CreateSubscriberInput = exports.NewsletterSubscriber = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let NewsletterSubscriber = class NewsletterSubscriber {
    id;
    email;
    firstName;
    lastName;
    status;
    tags;
    customFields;
    source;
    subscribedAt;
    confirmedAt;
    unsubscribedAt;
    createdAt;
};
exports.NewsletterSubscriber = NewsletterSubscriber;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], NewsletterSubscriber.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], NewsletterSubscriber.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterSubscriber.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "subscribedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "confirmedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "unsubscribedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NewsletterSubscriber.prototype, "createdAt", void 0);
exports.NewsletterSubscriber = NewsletterSubscriber = __decorate([
    (0, graphql_1.ObjectType)()
], NewsletterSubscriber);
let CreateSubscriberInput = class CreateSubscriberInput {
    email;
    firstName;
    lastName;
    tags;
    customFields;
    source;
};
exports.CreateSubscriberInput = CreateSubscriberInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateSubscriberInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSubscriberInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSubscriberInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSubscriberInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateSubscriberInput.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSubscriberInput.prototype, "source", void 0);
exports.CreateSubscriberInput = CreateSubscriberInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSubscriberInput);
let UpdateSubscriberInput = class UpdateSubscriberInput {
    firstName;
    lastName;
    tags;
    customFields;
    status;
};
exports.UpdateSubscriberInput = UpdateSubscriberInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSubscriberInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSubscriberInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSubscriberInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], UpdateSubscriberInput.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSubscriberInput.prototype, "status", void 0);
exports.UpdateSubscriberInput = UpdateSubscriberInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSubscriberInput);
let SubscriberStats = class SubscriberStats {
    total;
    active;
    pending;
    unsubscribed;
};
exports.SubscriberStats = SubscriberStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SubscriberStats.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SubscriberStats.prototype, "active", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SubscriberStats.prototype, "pending", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SubscriberStats.prototype, "unsubscribed", void 0);
exports.SubscriberStats = SubscriberStats = __decorate([
    (0, graphql_1.ObjectType)()
], SubscriberStats);
let BulkImportResult = class BulkImportResult {
    success;
    failed;
    skipped;
    errors;
};
exports.BulkImportResult = BulkImportResult;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BulkImportResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BulkImportResult.prototype, "failed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BulkImportResult.prototype, "skipped", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], BulkImportResult.prototype, "errors", void 0);
exports.BulkImportResult = BulkImportResult = __decorate([
    (0, graphql_1.ObjectType)()
], BulkImportResult);
//# sourceMappingURL=subscriber.types.js.map