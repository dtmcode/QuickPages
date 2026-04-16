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
exports.CoursesStats = exports.EnrollmentsResponse = exports.CourseEnrollment = exports.CoursesResponse = exports.Course = exports.CourseChapter = exports.CourseLesson = exports.LessonProgressEntry = exports.MembershipsResponse = exports.Membership = exports.MembershipPlansResponse = exports.MembershipPlan = exports.AccessGrantedBy = exports.LessonType = exports.CourseLevel = exports.MembershipInterval = exports.MembershipStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var MembershipStatus;
(function (MembershipStatus) {
    MembershipStatus["ACTIVE"] = "active";
    MembershipStatus["CANCELLED"] = "cancelled";
    MembershipStatus["EXPIRED"] = "expired";
    MembershipStatus["TRIAL"] = "trial";
    MembershipStatus["PAUSED"] = "paused";
})(MembershipStatus || (exports.MembershipStatus = MembershipStatus = {}));
(0, graphql_1.registerEnumType)(MembershipStatus, { name: 'MembershipStatus' });
var MembershipInterval;
(function (MembershipInterval) {
    MembershipInterval["MONTHLY"] = "monthly";
    MembershipInterval["YEARLY"] = "yearly";
    MembershipInterval["LIFETIME"] = "lifetime";
})(MembershipInterval || (exports.MembershipInterval = MembershipInterval = {}));
(0, graphql_1.registerEnumType)(MembershipInterval, { name: 'MembershipInterval' });
var CourseLevel;
(function (CourseLevel) {
    CourseLevel["BEGINNER"] = "beginner";
    CourseLevel["INTERMEDIATE"] = "intermediate";
    CourseLevel["ADVANCED"] = "advanced";
})(CourseLevel || (exports.CourseLevel = CourseLevel = {}));
(0, graphql_1.registerEnumType)(CourseLevel, { name: 'CourseLevel' });
var LessonType;
(function (LessonType) {
    LessonType["VIDEO"] = "video";
    LessonType["TEXT"] = "text";
    LessonType["PDF"] = "pdf";
    LessonType["QUIZ"] = "quiz";
})(LessonType || (exports.LessonType = LessonType = {}));
(0, graphql_1.registerEnumType)(LessonType, { name: 'LessonType' });
var AccessGrantedBy;
(function (AccessGrantedBy) {
    AccessGrantedBy["PURCHASE"] = "purchase";
    AccessGrantedBy["MEMBERSHIP"] = "membership";
    AccessGrantedBy["MANUAL"] = "manual";
    AccessGrantedBy["FREE"] = "free";
})(AccessGrantedBy || (exports.AccessGrantedBy = AccessGrantedBy = {}));
(0, graphql_1.registerEnumType)(AccessGrantedBy, { name: 'AccessGrantedBy' });
let MembershipPlan = class MembershipPlan {
    id;
    name;
    slug;
    description;
    price;
    interval;
    features;
    isActive;
    isPublic;
    stripePriceId;
    position;
    memberCount;
    createdAt;
    updatedAt;
};
exports.MembershipPlan = MembershipPlan;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MembershipPlan.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MembershipPlan.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MembershipPlan.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MembershipPlan.prototype, "interval", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MembershipPlan.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MembershipPlan.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "stripePriceId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembershipPlan.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "memberCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], MembershipPlan.prototype, "updatedAt", void 0);
exports.MembershipPlan = MembershipPlan = __decorate([
    (0, graphql_1.ObjectType)()
], MembershipPlan);
let MembershipPlansResponse = class MembershipPlansResponse {
    plans;
    total;
};
exports.MembershipPlansResponse = MembershipPlansResponse;
__decorate([
    (0, graphql_1.Field)(() => [MembershipPlan]),
    __metadata("design:type", Array)
], MembershipPlansResponse.prototype, "plans", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembershipPlansResponse.prototype, "total", void 0);
exports.MembershipPlansResponse = MembershipPlansResponse = __decorate([
    (0, graphql_1.ObjectType)()
], MembershipPlansResponse);
let Membership = class Membership {
    id;
    planId;
    plan;
    customerEmail;
    customerName;
    status;
    startedAt;
    expiresAt;
    cancelledAt;
    stripeSubscriptionId;
    grantedManually;
    createdAt;
    updatedAt;
};
exports.Membership = Membership;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Membership.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "planId", void 0);
__decorate([
    (0, graphql_1.Field)(() => MembershipPlan, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "plan", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Membership.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Membership.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Membership.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "cancelledAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Membership.prototype, "grantedManually", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Membership.prototype, "updatedAt", void 0);
exports.Membership = Membership = __decorate([
    (0, graphql_1.ObjectType)()
], Membership);
let MembershipsResponse = class MembershipsResponse {
    memberships;
    total;
};
exports.MembershipsResponse = MembershipsResponse;
__decorate([
    (0, graphql_1.Field)(() => [Membership]),
    __metadata("design:type", Array)
], MembershipsResponse.prototype, "memberships", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembershipsResponse.prototype, "total", void 0);
exports.MembershipsResponse = MembershipsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], MembershipsResponse);
let LessonProgressEntry = class LessonProgressEntry {
    id;
    lessonId;
    completedAt;
    watchTime;
    createdAt;
};
exports.LessonProgressEntry = LessonProgressEntry;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LessonProgressEntry.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LessonProgressEntry.prototype, "lessonId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LessonProgressEntry.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LessonProgressEntry.prototype, "watchTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], LessonProgressEntry.prototype, "createdAt", void 0);
exports.LessonProgressEntry = LessonProgressEntry = __decorate([
    (0, graphql_1.ObjectType)()
], LessonProgressEntry);
let CourseLesson = class CourseLesson {
    id;
    chapterId;
    courseId;
    title;
    slug;
    type;
    videoUrl;
    duration;
    position;
    isPublished;
    isFreePreview;
    createdAt;
    updatedAt;
};
exports.CourseLesson = CourseLesson;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseLesson.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseLesson.prototype, "chapterId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseLesson.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseLesson.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseLesson.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseLesson.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], CourseLesson.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], CourseLesson.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseLesson.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CourseLesson.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CourseLesson.prototype, "isFreePreview", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseLesson.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseLesson.prototype, "updatedAt", void 0);
exports.CourseLesson = CourseLesson = __decorate([
    (0, graphql_1.ObjectType)()
], CourseLesson);
let CourseChapter = class CourseChapter {
    id;
    courseId;
    title;
    description;
    position;
    isPublished;
    lessons;
    createdAt;
};
exports.CourseChapter = CourseChapter;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseChapter.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseChapter.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseChapter.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], CourseChapter.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseChapter.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CourseChapter.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CourseLesson], { nullable: true }),
    __metadata("design:type", Array)
], CourseChapter.prototype, "lessons", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseChapter.prototype, "createdAt", void 0);
exports.CourseChapter = CourseChapter = __decorate([
    (0, graphql_1.ObjectType)()
], CourseChapter);
let Course = class Course {
    id;
    title;
    slug;
    description;
    shortDescription;
    thumbnail;
    price;
    isFree;
    isPublished;
    requiresMembershipPlanId;
    requiredPlan;
    level;
    language;
    totalDuration;
    certificateEnabled;
    stripePriceId;
    chapters;
    enrollmentCount;
    createdAt;
    updatedAt;
};
exports.Course = Course;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "shortDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "isFree", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "requiresMembershipPlanId", void 0);
__decorate([
    (0, graphql_1.Field)(() => MembershipPlan, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "requiredPlan", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Course.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "totalDuration", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Course.prototype, "certificateEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "stripePriceId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CourseChapter], { nullable: true }),
    __metadata("design:type", Array)
], Course.prototype, "chapters", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "enrollmentCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], Course.prototype, "updatedAt", void 0);
exports.Course = Course = __decorate([
    (0, graphql_1.ObjectType)()
], Course);
let CoursesResponse = class CoursesResponse {
    courses;
    total;
};
exports.CoursesResponse = CoursesResponse;
__decorate([
    (0, graphql_1.Field)(() => [Course]),
    __metadata("design:type", Array)
], CoursesResponse.prototype, "courses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesResponse.prototype, "total", void 0);
exports.CoursesResponse = CoursesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CoursesResponse);
let CourseEnrollment = class CourseEnrollment {
    id;
    courseId;
    course;
    customerEmail;
    customerName;
    accessGrantedBy;
    membershipId;
    enrolledAt;
    completedAt;
    progress;
    certificateUrl;
    lessonProgress;
    createdAt;
    updatedAt;
};
exports.CourseEnrollment = CourseEnrollment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CourseEnrollment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseEnrollment.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Course, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "course", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseEnrollment.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseEnrollment.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CourseEnrollment.prototype, "accessGrantedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "membershipId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "enrolledAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CourseEnrollment.prototype, "progress", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "certificateUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => [LessonProgressEntry], { nullable: true }),
    __metadata("design:type", Array)
], CourseEnrollment.prototype, "lessonProgress", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], CourseEnrollment.prototype, "updatedAt", void 0);
exports.CourseEnrollment = CourseEnrollment = __decorate([
    (0, graphql_1.ObjectType)()
], CourseEnrollment);
let EnrollmentsResponse = class EnrollmentsResponse {
    enrollments;
    total;
};
exports.EnrollmentsResponse = EnrollmentsResponse;
__decorate([
    (0, graphql_1.Field)(() => [CourseEnrollment]),
    __metadata("design:type", Array)
], EnrollmentsResponse.prototype, "enrollments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], EnrollmentsResponse.prototype, "total", void 0);
exports.EnrollmentsResponse = EnrollmentsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], EnrollmentsResponse);
let CoursesStats = class CoursesStats {
    totalCourses;
    publishedCourses;
    totalEnrollments;
    activeMembers;
    totalRevenue;
};
exports.CoursesStats = CoursesStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesStats.prototype, "totalCourses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesStats.prototype, "publishedCourses", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesStats.prototype, "totalEnrollments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesStats.prototype, "activeMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CoursesStats.prototype, "totalRevenue", void 0);
exports.CoursesStats = CoursesStats = __decorate([
    (0, graphql_1.ObjectType)()
], CoursesStats);
//# sourceMappingURL=courses.types.js.map