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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const courses_service_1 = require("./courses.service");
const courses_types_1 = require("./dto/courses.types");
const courses_input_1 = require("./dto/courses.input");
let CoursesResolver = class CoursesResolver {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    async membershipPlans(tenantId) {
        return this.coursesService.getMembershipPlans(tenantId);
    }
    async membershipPlan(tenantId, id) {
        return this.coursesService.getMembershipPlanById(tenantId, id);
    }
    async createMembershipPlan(tenantId, input) {
        return this.coursesService.createMembershipPlan(tenantId, input);
    }
    async updateMembershipPlan(tenantId, id, input) {
        return this.coursesService.updateMembershipPlan(tenantId, id, input);
    }
    async deleteMembershipPlan(tenantId, id) {
        return this.coursesService.deleteMembershipPlan(tenantId, id);
    }
    async memberships(tenantId, status) {
        return this.coursesService.getMemberships(tenantId, status);
    }
    async grantMembership(tenantId, input) {
        return this.coursesService.grantMembership(tenantId, input);
    }
    async updateMembershipStatus(tenantId, id, input) {
        return this.coursesService.updateMembershipStatus(tenantId, id, input);
    }
    async revokeMembership(tenantId, id) {
        return this.coursesService.revokeMembership(tenantId, id);
    }
    async courses(tenantId) {
        return this.coursesService.getCourses(tenantId);
    }
    async course(tenantId, id) {
        return this.coursesService.getCourseById(tenantId, id);
    }
    async createCourse(tenantId, input) {
        return this.coursesService.createCourse(tenantId, input);
    }
    async updateCourse(tenantId, id, input) {
        return this.coursesService.updateCourse(tenantId, id, input);
    }
    async deleteCourse(tenantId, id) {
        return this.coursesService.deleteCourse(tenantId, id);
    }
    async duplicateCourse(tenantId, id) {
        return this.coursesService.duplicateCourse(tenantId, id);
    }
    async createChapter(tenantId, input) {
        return this.coursesService.createChapter(tenantId, input);
    }
    async updateChapter(tenantId, id, input) {
        return this.coursesService.updateChapter(tenantId, id, input);
    }
    async deleteChapter(tenantId, id) {
        return this.coursesService.deleteChapter(tenantId, id);
    }
    async reorderChapters(tenantId, courseId, chapterIds) {
        return this.coursesService.reorderChapters(tenantId, courseId, chapterIds);
    }
    async createLesson(tenantId, input) {
        return this.coursesService.createLesson(tenantId, input);
    }
    async updateLesson(tenantId, id, input) {
        return this.coursesService.updateLesson(tenantId, id, input);
    }
    async deleteLesson(tenantId, id) {
        return this.coursesService.deleteLesson(tenantId, id);
    }
    async reorderLessons(tenantId, chapterId, lessonIds) {
        return this.coursesService.reorderLessons(tenantId, chapterId, lessonIds);
    }
    async enrollments(tenantId, courseId) {
        return this.coursesService.getEnrollments(tenantId, courseId);
    }
    async enrollCourse(tenantId, input) {
        return this.coursesService.enrollCourse(tenantId, input);
    }
    async enrollmentProgress(tenantId, enrollmentId) {
        return this.coursesService.getEnrollmentProgress(tenantId, enrollmentId);
    }
    async trackLessonProgress(tenantId, input) {
        return this.coursesService.trackLessonProgress(tenantId, input);
    }
    async checkCourseAccess(tenantId, courseId, customerEmail) {
        return this.coursesService.checkCourseAccess(tenantId, courseId, customerEmail);
    }
    async checkMembershipAccess(tenantId, customerEmail, planId) {
        return this.coursesService.checkMembershipAccess(tenantId, customerEmail, planId);
    }
    async coursesStats(tenantId) {
        return this.coursesService.getStats(tenantId);
    }
};
exports.CoursesResolver = CoursesResolver;
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.MembershipPlansResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "membershipPlans", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.MembershipPlan),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "membershipPlan", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.MembershipPlan),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.CreateMembershipPlanInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createMembershipPlan", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.MembershipPlan),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, courses_input_1.UpdateMembershipPlanInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateMembershipPlan", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteMembershipPlan", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.MembershipsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "memberships", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Membership),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.GrantMembershipInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "grantMembership", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Membership),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, courses_input_1.UpdateMembershipStatusInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateMembershipStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "revokeMembership", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.CoursesResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "courses", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.Course),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "course", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Course),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.CreateCourseInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Course),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, courses_input_1.UpdateCourseInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Course),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "duplicateCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.CourseChapter),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.CreateChapterInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createChapter", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.CourseChapter),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, courses_input_1.UpdateChapterInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateChapter", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteChapter", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.Course),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('chapterIds', { type: () => [graphql_1.ID] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "reorderChapters", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.CourseLesson),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.CreateLessonInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "createLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.CourseLesson),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, courses_input_1.UpdateLessonInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "updateLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('chapterId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('lessonIds', { type: () => [graphql_1.ID] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "reorderLessons", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.EnrollmentsResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "enrollments", null);
__decorate([
    (0, graphql_1.Mutation)(() => courses_types_1.CourseEnrollment),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.EnrollCourseInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "enrollCourse", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.CourseEnrollment),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('enrollmentId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "enrollmentProgress", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, courses_input_1.TrackLessonProgressInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "trackLessonProgress", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('courseId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('customerEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "checkCourseAccess", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('customerEmail')),
    __param(2, (0, graphql_1.Args)('planId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "checkMembershipAccess", null);
__decorate([
    (0, graphql_1.Query)(() => courses_types_1.CoursesStats),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "coursesStats", null);
exports.CoursesResolver = CoursesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesResolver);
//# sourceMappingURL=courses.resolver.js.map