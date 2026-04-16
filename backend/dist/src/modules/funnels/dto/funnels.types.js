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
exports.FunnelAnalytics = exports.FunnelStepAnalytics = exports.FunnelSubmissionsResponse = exports.FunnelSubmission = exports.FunnelsResponse = exports.Funnel = exports.FunnelStepsResponse = exports.FunnelStep = exports.ConversionGoal = exports.StepType = void 0;
const graphql_1 = require("@nestjs/graphql");
var StepType;
(function (StepType) {
    StepType["OPTIN"] = "optin";
    StepType["SALES"] = "sales";
    StepType["UPSELL"] = "upsell";
    StepType["DOWNSELL"] = "downsell";
    StepType["THANKYOU"] = "thankyou";
    StepType["VIDEO"] = "video";
})(StepType || (exports.StepType = StepType = {}));
(0, graphql_1.registerEnumType)(StepType, { name: 'StepType' });
var ConversionGoal;
(function (ConversionGoal) {
    ConversionGoal["EMAIL"] = "email";
    ConversionGoal["PURCHASE"] = "purchase";
    ConversionGoal["BOOKING"] = "booking";
})(ConversionGoal || (exports.ConversionGoal = ConversionGoal = {}));
(0, graphql_1.registerEnumType)(ConversionGoal, { name: 'ConversionGoal' });
let FunnelStep = class FunnelStep {
    id;
    funnelId;
    title;
    slug;
    stepType;
    position;
    isActive;
    nextStepId;
    views;
    conversions;
    content;
    createdAt;
    updatedAt;
};
exports.FunnelStep = FunnelStep;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FunnelStep.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStep.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStep.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStep.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStep.prototype, "stepType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStep.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FunnelStep.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelStep.prototype, "nextStepId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStep.prototype, "views", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStep.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FunnelStep.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FunnelStep.prototype, "updatedAt", void 0);
exports.FunnelStep = FunnelStep = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelStep);
let FunnelStepsResponse = class FunnelStepsResponse {
    steps;
    total;
};
exports.FunnelStepsResponse = FunnelStepsResponse;
__decorate([
    (0, graphql_1.Field)(() => [FunnelStep]),
    __metadata("design:type", Array)
], FunnelStepsResponse.prototype, "steps", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStepsResponse.prototype, "total", void 0);
exports.FunnelStepsResponse = FunnelStepsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelStepsResponse);
let Funnel = class Funnel {
    id;
    name;
    slug;
    description;
    isActive;
    isPublished;
    conversionGoal;
    utmSource;
    utmMedium;
    utmCampaign;
    totalViews;
    totalConversions;
    steps;
    createdAt;
    updatedAt;
};
exports.Funnel = Funnel;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Funnel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Funnel.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Funnel.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Funnel.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Funnel.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Funnel.prototype, "conversionGoal", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "utmCampaign", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Funnel.prototype, "totalViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Funnel.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FunnelStep], { nullable: true }),
    __metadata("design:type", Array)
], Funnel.prototype, "steps", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Funnel.prototype, "updatedAt", void 0);
exports.Funnel = Funnel = __decorate([
    (0, graphql_1.ObjectType)()
], Funnel);
let FunnelsResponse = class FunnelsResponse {
    funnels;
    total;
};
exports.FunnelsResponse = FunnelsResponse;
__decorate([
    (0, graphql_1.Field)(() => [Funnel]),
    __metadata("design:type", Array)
], FunnelsResponse.prototype, "funnels", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelsResponse.prototype, "total", void 0);
exports.FunnelsResponse = FunnelsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelsResponse);
let FunnelSubmission = class FunnelSubmission {
    id;
    funnelId;
    stepId;
    customerEmail;
    customerName;
    utmSource;
    utmMedium;
    utmCampaign;
    convertedAt;
    createdAt;
};
exports.FunnelSubmission = FunnelSubmission;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FunnelSubmission.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelSubmission.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "stepId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "utmSource", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "utmMedium", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "utmCampaign", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "convertedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], FunnelSubmission.prototype, "createdAt", void 0);
exports.FunnelSubmission = FunnelSubmission = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelSubmission);
let FunnelSubmissionsResponse = class FunnelSubmissionsResponse {
    submissions;
    total;
};
exports.FunnelSubmissionsResponse = FunnelSubmissionsResponse;
__decorate([
    (0, graphql_1.Field)(() => [FunnelSubmission]),
    __metadata("design:type", Array)
], FunnelSubmissionsResponse.prototype, "submissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelSubmissionsResponse.prototype, "total", void 0);
exports.FunnelSubmissionsResponse = FunnelSubmissionsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelSubmissionsResponse);
let FunnelStepAnalytics = class FunnelStepAnalytics {
    stepId;
    stepTitle;
    stepType;
    position;
    views;
    conversions;
    conversionRate;
    dropOffRate;
};
exports.FunnelStepAnalytics = FunnelStepAnalytics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FunnelStepAnalytics.prototype, "stepId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStepAnalytics.prototype, "stepTitle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStepAnalytics.prototype, "stepType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStepAnalytics.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStepAnalytics.prototype, "views", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelStepAnalytics.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStepAnalytics.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelStepAnalytics.prototype, "dropOffRate", void 0);
exports.FunnelStepAnalytics = FunnelStepAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelStepAnalytics);
let FunnelAnalytics = class FunnelAnalytics {
    funnelId;
    funnelName;
    totalViews;
    totalConversions;
    overallConversionRate;
    steps;
};
exports.FunnelAnalytics = FunnelAnalytics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FunnelAnalytics.prototype, "funnelId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelAnalytics.prototype, "funnelName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelAnalytics.prototype, "totalViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FunnelAnalytics.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FunnelAnalytics.prototype, "overallConversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FunnelStepAnalytics]),
    __metadata("design:type", Array)
], FunnelAnalytics.prototype, "steps", void 0);
exports.FunnelAnalytics = FunnelAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], FunnelAnalytics);
//# sourceMappingURL=funnels.types.js.map