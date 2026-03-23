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
exports.SendCampaignResult = exports.CampaignStats = exports.UpdateCampaignInput = exports.CreateCampaignInput = exports.NewsletterCampaign = void 0;
const graphql_1 = require("@nestjs/graphql");
let NewsletterCampaign = class NewsletterCampaign {
    id;
    name;
    subject;
    previewText;
    fromName;
    fromEmail;
    replyTo;
    htmlContent;
    plainTextContent;
    status;
    scheduledAt;
    sendAt;
    completedAt;
    filterTags;
    excludeTags;
    totalRecipients;
    sentCount;
    deliveredCount;
    openedCount;
    clickedCount;
    bouncedCount;
    unsubscribedCount;
    createdAt;
    updatedAt;
};
exports.NewsletterCampaign = NewsletterCampaign;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "previewText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "fromName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "fromEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "replyTo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "htmlContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "plainTextContent", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NewsletterCampaign.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "scheduledAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "sendAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], NewsletterCampaign.prototype, "filterTags", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], NewsletterCampaign.prototype, "excludeTags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "totalRecipients", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "sentCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "deliveredCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "openedCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "clickedCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "bouncedCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NewsletterCampaign.prototype, "unsubscribedCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NewsletterCampaign.prototype, "updatedAt", void 0);
exports.NewsletterCampaign = NewsletterCampaign = __decorate([
    (0, graphql_1.ObjectType)()
], NewsletterCampaign);
let CreateCampaignInput = class CreateCampaignInput {
    name;
    subject;
    previewText;
    fromName;
    fromEmail;
    replyTo;
    htmlContent;
    plainTextContent;
    filterTags;
    excludeTags;
    scheduledAt;
};
exports.CreateCampaignInput = CreateCampaignInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "previewText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "fromName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "fromEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "replyTo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "htmlContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCampaignInput.prototype, "plainTextContent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateCampaignInput.prototype, "filterTags", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateCampaignInput.prototype, "excludeTags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateCampaignInput.prototype, "scheduledAt", void 0);
exports.CreateCampaignInput = CreateCampaignInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCampaignInput);
let UpdateCampaignInput = class UpdateCampaignInput {
    name;
    subject;
    previewText;
    fromName;
    fromEmail;
    replyTo;
    htmlContent;
    plainTextContent;
    filterTags;
    excludeTags;
    scheduledAt;
    status;
};
exports.UpdateCampaignInput = UpdateCampaignInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "previewText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "fromName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "fromEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "replyTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "htmlContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "plainTextContent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateCampaignInput.prototype, "filterTags", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateCampaignInput.prototype, "excludeTags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateCampaignInput.prototype, "scheduledAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCampaignInput.prototype, "status", void 0);
exports.UpdateCampaignInput = UpdateCampaignInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCampaignInput);
let CampaignStats = class CampaignStats {
    total;
    sent;
    delivered;
    opened;
    clicked;
    bounced;
    unsubscribed;
    openRate;
    clickRate;
};
exports.CampaignStats = CampaignStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "sent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "delivered", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "opened", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "clicked", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "bounced", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "unsubscribed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "openRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CampaignStats.prototype, "clickRate", void 0);
exports.CampaignStats = CampaignStats = __decorate([
    (0, graphql_1.ObjectType)()
], CampaignStats);
let SendCampaignResult = class SendCampaignResult {
    success;
    recipientCount;
};
exports.SendCampaignResult = SendCampaignResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SendCampaignResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SendCampaignResult.prototype, "recipientCount", void 0);
exports.SendCampaignResult = SendCampaignResult = __decorate([
    (0, graphql_1.ObjectType)()
], SendCampaignResult);
//# sourceMappingURL=campaign.types.js.map