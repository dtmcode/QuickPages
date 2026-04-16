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
exports.TrackLessonProgressInput = exports.EnrollCourseInput = exports.UpdateLessonInput = exports.CreateLessonInput = exports.UpdateChapterInput = exports.CreateChapterInput = exports.UpdateCourseInput = exports.CreateCourseInput = exports.UpdateMembershipStatusInput = exports.GrantMembershipInput = exports.UpdateMembershipPlanInput = exports.CreateMembershipPlanInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let CreateMembershipPlanInput = class CreateMembershipPlanInput {
    name;
    description;
    price;
    interval;
    features;
    isPublic;
    position;
};
exports.CreateMembershipPlanInput = CreateMembershipPlanInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMembershipPlanInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMembershipPlanInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CreateMembershipPlanInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateMembershipPlanInput.prototype, "interval", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateMembershipPlanInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateMembershipPlanInput.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateMembershipPlanInput.prototype, "position", void 0);
exports.CreateMembershipPlanInput = CreateMembershipPlanInput = __decorate([
    (0, graphql_1.InputType)()
], CreateMembershipPlanInput);
let UpdateMembershipPlanInput = class UpdateMembershipPlanInput {
    name;
    description;
    price;
    interval;
    features;
    isActive;
    isPublic;
    position;
    stripePriceId;
};
exports.UpdateMembershipPlanInput = UpdateMembershipPlanInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMembershipPlanInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMembershipPlanInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMembershipPlanInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMembershipPlanInput.prototype, "interval", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateMembershipPlanInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMembershipPlanInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateMembershipPlanInput.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateMembershipPlanInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMembershipPlanInput.prototype, "stripePriceId", void 0);
exports.UpdateMembershipPlanInput = UpdateMembershipPlanInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMembershipPlanInput);
let GrantMembershipInput = class GrantMembershipInput {
    customerEmail;
    customerName;
    planId;
    expiresAt;
};
exports.GrantMembershipInput = GrantMembershipInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GrantMembershipInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GrantMembershipInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GrantMembershipInput.prototype, "planId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], GrantMembershipInput.prototype, "expiresAt", void 0);
exports.GrantMembershipInput = GrantMembershipInput = __decorate([
    (0, graphql_1.InputType)()
], GrantMembershipInput);
let UpdateMembershipStatusInput = class UpdateMembershipStatusInput {
    status;
};
exports.UpdateMembershipStatusInput = UpdateMembershipStatusInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UpdateMembershipStatusInput.prototype, "status", void 0);
exports.UpdateMembershipStatusInput = UpdateMembershipStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMembershipStatusInput);
let CreateCourseInput = class CreateCourseInput {
    title;
    description;
    shortDescription;
    thumbnail;
    price;
    isFree;
    requiresMembershipPlanId;
    level;
    language;
    certificateEnabled;
};
exports.CreateCourseInput = CreateCourseInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "shortDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateCourseInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateCourseInput.prototype, "isFree", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "requiresMembershipPlanId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCourseInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateCourseInput.prototype, "certificateEnabled", void 0);
exports.CreateCourseInput = CreateCourseInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCourseInput);
let UpdateCourseInput = class UpdateCourseInput {
    title;
    description;
    shortDescription;
    thumbnail;
    price;
    isFree;
    isPublished;
    requiresMembershipPlanId;
    level;
    language;
    certificateEnabled;
    stripePriceId;
};
exports.UpdateCourseInput = UpdateCourseInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "shortDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCourseInput.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCourseInput.prototype, "isFree", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCourseInput.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "requiresMembershipPlanId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCourseInput.prototype, "certificateEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCourseInput.prototype, "stripePriceId", void 0);
exports.UpdateCourseInput = UpdateCourseInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCourseInput);
let CreateChapterInput = class CreateChapterInput {
    courseId;
    title;
    description;
    position;
};
exports.CreateChapterInput = CreateChapterInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateChapterInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateChapterInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateChapterInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateChapterInput.prototype, "position", void 0);
exports.CreateChapterInput = CreateChapterInput = __decorate([
    (0, graphql_1.InputType)()
], CreateChapterInput);
let UpdateChapterInput = class UpdateChapterInput {
    title;
    description;
    position;
    isPublished;
};
exports.UpdateChapterInput = UpdateChapterInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateChapterInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateChapterInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateChapterInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateChapterInput.prototype, "isPublished", void 0);
exports.UpdateChapterInput = UpdateChapterInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateChapterInput);
let CreateLessonInput = class CreateLessonInput {
    chapterId;
    courseId;
    title;
    type;
    videoUrl;
    duration;
    position;
    isFreePreview;
    content;
};
exports.CreateLessonInput = CreateLessonInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "chapterId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateLessonInput.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateLessonInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateLessonInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateLessonInput.prototype, "isFreePreview", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateLessonInput.prototype, "content", void 0);
exports.CreateLessonInput = CreateLessonInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLessonInput);
let UpdateLessonInput = class UpdateLessonInput {
    title;
    type;
    videoUrl;
    duration;
    position;
    isPublished;
    isFreePreview;
    content;
};
exports.UpdateLessonInput = UpdateLessonInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateLessonInput.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLessonInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateLessonInput.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLessonInput.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateLessonInput.prototype, "isFreePreview", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], UpdateLessonInput.prototype, "content", void 0);
exports.UpdateLessonInput = UpdateLessonInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLessonInput);
let EnrollCourseInput = class EnrollCourseInput {
    courseId;
    customerEmail;
    customerName;
    membershipId;
    stripePaymentIntentId;
};
exports.EnrollCourseInput = EnrollCourseInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EnrollCourseInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EnrollCourseInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EnrollCourseInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EnrollCourseInput.prototype, "membershipId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EnrollCourseInput.prototype, "stripePaymentIntentId", void 0);
exports.EnrollCourseInput = EnrollCourseInput = __decorate([
    (0, graphql_1.InputType)()
], EnrollCourseInput);
let TrackLessonProgressInput = class TrackLessonProgressInput {
    enrollmentId;
    lessonId;
    completed;
    watchTime;
};
exports.TrackLessonProgressInput = TrackLessonProgressInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TrackLessonProgressInput.prototype, "enrollmentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TrackLessonProgressInput.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], TrackLessonProgressInput.prototype, "completed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], TrackLessonProgressInput.prototype, "watchTime", void 0);
exports.TrackLessonProgressInput = TrackLessonProgressInput = __decorate([
    (0, graphql_1.InputType)()
], TrackLessonProgressInput);
//# sourceMappingURL=courses.input.js.map