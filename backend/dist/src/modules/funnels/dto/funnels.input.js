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
exports.TrackFunnelEventInput = exports.CreateFunnelSubmissionInput = exports.UpdateFunnelStepContentInput = exports.UpdateFunnelStepInput = exports.CreateFunnelStepInput = exports.UpdateFunnelInput = exports.CreateFunnelInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let CreateFunnelInput = class CreateFunnelInput {
    name;
    description;
    conversionGoal;
    utmSource;
    utmMedium;
    utmCampaign;
};
exports.CreateFunnelInput = CreateFunnelInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "conversionGoal", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelInput.prototype, "utmCampaign", void 0);
exports.CreateFunnelInput = CreateFunnelInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFunnelInput);
let UpdateFunnelInput = class UpdateFunnelInput {
    name;
    description;
    conversionGoal;
    isActive;
    isPublished;
    utmSource;
    utmMedium;
    utmCampaign;
};
exports.UpdateFunnelInput = UpdateFunnelInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "conversionGoal", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateFunnelInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateFunnelInput.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelInput.prototype, "utmCampaign", void 0);
exports.UpdateFunnelInput = UpdateFunnelInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFunnelInput);
let CreateFunnelStepInput = class CreateFunnelStepInput {
    funnelId;
    title;
    stepType;
    position;
    nextStepId;
};
exports.CreateFunnelStepInput = CreateFunnelStepInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFunnelStepInput.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFunnelStepInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFunnelStepInput.prototype, "stepType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateFunnelStepInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelStepInput.prototype, "nextStepId", void 0);
exports.CreateFunnelStepInput = CreateFunnelStepInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFunnelStepInput);
let UpdateFunnelStepInput = class UpdateFunnelStepInput {
    title;
    stepType;
    position;
    isActive;
    nextStepId;
};
exports.UpdateFunnelStepInput = UpdateFunnelStepInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelStepInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelStepInput.prototype, "stepType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateFunnelStepInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateFunnelStepInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateFunnelStepInput.prototype, "nextStepId", void 0);
exports.UpdateFunnelStepInput = UpdateFunnelStepInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFunnelStepInput);
let UpdateFunnelStepContentInput = class UpdateFunnelStepContentInput {
    content;
};
exports.UpdateFunnelStepContentInput = UpdateFunnelStepContentInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], UpdateFunnelStepContentInput.prototype, "content", void 0);
exports.UpdateFunnelStepContentInput = UpdateFunnelStepContentInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateFunnelStepContentInput);
let CreateFunnelSubmissionInput = class CreateFunnelSubmissionInput {
    funnelId;
    stepId;
    customerEmail;
    customerName;
    data;
    utmSource;
    utmMedium;
    utmCampaign;
};
exports.CreateFunnelSubmissionInput = CreateFunnelSubmissionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "stepId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateFunnelSubmissionInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFunnelSubmissionInput.prototype, "utmCampaign", void 0);
exports.CreateFunnelSubmissionInput = CreateFunnelSubmissionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFunnelSubmissionInput);
let TrackFunnelEventInput = class TrackFunnelEventInput {
    funnelId;
    stepId;
    eventType;
};
exports.TrackFunnelEventInput = TrackFunnelEventInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TrackFunnelEventInput.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TrackFunnelEventInput.prototype, "stepId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TrackFunnelEventInput.prototype, "eventType", void 0);
exports.TrackFunnelEventInput = TrackFunnelEventInput = __decorate([
    (0, graphql_1.InputType)()
], TrackFunnelEventInput);
//# sourceMappingURL=funnels.input.js.map