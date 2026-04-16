// backend\src\modules\courses\courses.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CoursesService } from './courses.service';
import {
  MembershipPlan,
  MembershipPlansResponse,
  Membership,
  MembershipsResponse,
  Course,
  CoursesResponse,
  CourseChapter,
  CourseLesson,
  CourseEnrollment,
  EnrollmentsResponse,
  CoursesStats,
} from './dto/courses.types';
import {
  CreateMembershipPlanInput,
  UpdateMembershipPlanInput,
  GrantMembershipInput,
  UpdateMembershipStatusInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateChapterInput,
  UpdateChapterInput,
  CreateLessonInput,
  UpdateLessonInput,
  EnrollCourseInput,
  TrackLessonProgressInput,
} from './dto/courses.input';

@Resolver()
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  // ─── Membership Plans ─────────────────────────────────────────────────────────

  @Query(() => MembershipPlansResponse)
  @UseGuards(GqlAuthGuard)
  async membershipPlans(@TenantId() tenantId: string) {
    return this.coursesService.getMembershipPlans(tenantId);
  }

  @Query(() => MembershipPlan)
  @UseGuards(GqlAuthGuard)
  async membershipPlan(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.getMembershipPlanById(tenantId, id);
  }

  @Mutation(() => MembershipPlan)
  @UseGuards(GqlAuthGuard)
  async createMembershipPlan(
    @TenantId() tenantId: string,
    @Args('input') input: CreateMembershipPlanInput,
  ) {
    return this.coursesService.createMembershipPlan(tenantId, input);
  }

  @Mutation(() => MembershipPlan)
  @UseGuards(GqlAuthGuard)
  async updateMembershipPlan(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMembershipPlanInput,
  ) {
    return this.coursesService.updateMembershipPlan(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteMembershipPlan(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.deleteMembershipPlan(tenantId, id);
  }

  // ─── Memberships ──────────────────────────────────────────────────────────────

  @Query(() => MembershipsResponse)
  @UseGuards(GqlAuthGuard)
  async memberships(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.coursesService.getMemberships(tenantId, status);
  }

  @Mutation(() => Membership)
  @UseGuards(GqlAuthGuard)
  async grantMembership(
    @TenantId() tenantId: string,
    @Args('input') input: GrantMembershipInput,
  ) {
    return this.coursesService.grantMembership(tenantId, input);
  }

  @Mutation(() => Membership)
  @UseGuards(GqlAuthGuard)
  async updateMembershipStatus(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMembershipStatusInput,
  ) {
    return this.coursesService.updateMembershipStatus(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async revokeMembership(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.revokeMembership(tenantId, id);
  }

  // ─── Courses ──────────────────────────────────────────────────────────────────

  @Query(() => CoursesResponse)
  @UseGuards(GqlAuthGuard)
  async courses(@TenantId() tenantId: string) {
    return this.coursesService.getCourses(tenantId);
  }

  @Query(() => Course)
  @UseGuards(GqlAuthGuard)
  async course(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.getCourseById(tenantId, id);
  }

  @Mutation(() => Course)
  @UseGuards(GqlAuthGuard)
  async createCourse(
    @TenantId() tenantId: string,
    @Args('input') input: CreateCourseInput,
  ) {
    return this.coursesService.createCourse(tenantId, input);
  }

  @Mutation(() => Course)
  @UseGuards(GqlAuthGuard)
  async updateCourse(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCourseInput,
  ) {
    return this.coursesService.updateCourse(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCourse(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.deleteCourse(tenantId, id);
  }

  @Mutation(() => Course)
  @UseGuards(GqlAuthGuard)
  async duplicateCourse(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.duplicateCourse(tenantId, id);
  }

  // ─── Chapters ─────────────────────────────────────────────────────────────────

  @Mutation(() => CourseChapter)
  @UseGuards(GqlAuthGuard)
  async createChapter(
    @TenantId() tenantId: string,
    @Args('input') input: CreateChapterInput,
  ) {
    return this.coursesService.createChapter(tenantId, input);
  }

  @Mutation(() => CourseChapter)
  @UseGuards(GqlAuthGuard)
  async updateChapter(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateChapterInput,
  ) {
    return this.coursesService.updateChapter(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteChapter(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.deleteChapter(tenantId, id);
  }

  @Mutation(() => Course)
  @UseGuards(GqlAuthGuard)
  async reorderChapters(
    @TenantId() tenantId: string,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('chapterIds', { type: () => [ID] }) chapterIds: string[],
  ) {
    return this.coursesService.reorderChapters(tenantId, courseId, chapterIds);
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────────

  @Mutation(() => CourseLesson)
  @UseGuards(GqlAuthGuard)
  async createLesson(
    @TenantId() tenantId: string,
    @Args('input') input: CreateLessonInput,
  ) {
    return this.coursesService.createLesson(tenantId, input);
  }

  @Mutation(() => CourseLesson)
  @UseGuards(GqlAuthGuard)
  async updateLesson(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLessonInput,
  ) {
    return this.coursesService.updateLesson(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteLesson(
    @TenantId() tenantId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.coursesService.deleteLesson(tenantId, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async reorderLessons(
    @TenantId() tenantId: string,
    @Args('chapterId', { type: () => ID }) chapterId: string,
    @Args('lessonIds', { type: () => [ID] }) lessonIds: string[],
  ) {
    return this.coursesService.reorderLessons(tenantId, chapterId, lessonIds);
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────────

  @Query(() => EnrollmentsResponse)
  @UseGuards(GqlAuthGuard)
  async enrollments(
    @TenantId() tenantId: string,
    @Args('courseId', { type: () => ID, nullable: true }) courseId?: string,
  ) {
    return this.coursesService.getEnrollments(tenantId, courseId);
  }

  // Public — Kurs kaufen/einschreiben
  @Mutation(() => CourseEnrollment)
  async enrollCourse(
    @TenantId() tenantId: string,
    @Args('input') input: EnrollCourseInput,
  ) {
    return this.coursesService.enrollCourse(tenantId, input);
  }

  @Query(() => CourseEnrollment)
  async enrollmentProgress(
    @TenantId() tenantId: string,
    @Args('enrollmentId', { type: () => ID }) enrollmentId: string,
  ) {
    return this.coursesService.getEnrollmentProgress(tenantId, enrollmentId);
  }

  // Public — Lektions-Fortschritt tracken
  @Mutation(() => Boolean)
  async trackLessonProgress(
    @TenantId() tenantId: string,
    @Args('input') input: TrackLessonProgressInput,
  ) {
    return this.coursesService.trackLessonProgress(tenantId, input);
  }

  // ─── Access Check (Public) ────────────────────────────────────────────────────

  @Query(() => Boolean)
  async checkCourseAccess(
    @TenantId() tenantId: string,
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('customerEmail') customerEmail: string,
  ) {
    return this.coursesService.checkCourseAccess(tenantId, courseId, customerEmail);
  }

  @Query(() => Boolean)
  async checkMembershipAccess(
    @TenantId() tenantId: string,
    @Args('customerEmail') customerEmail: string,
    @Args('planId', { nullable: true }) planId?: string,
  ) {
    return this.coursesService.checkMembershipAccess(tenantId, customerEmail, planId);
  }

  // ─── Stats ────────────────────────────────────────────────────────────────────

  @Query(() => CoursesStats)
  @UseGuards(GqlAuthGuard)
  async coursesStats(@TenantId() tenantId: string) {
    return this.coursesService.getStats(tenantId);
  }
}
