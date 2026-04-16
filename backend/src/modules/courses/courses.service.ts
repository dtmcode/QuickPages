// backend\src\modules\courses\courses.service.ts

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import {
  membershipPlans,
  memberships,
  courses,
  courseChapters,
  courseLessons,
  courseEnrollments,
  lessonProgress,
  tenantCustomers,
} from '../../drizzle/schema';
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

type MembershipPlanRow = typeof membershipPlans.$inferSelect;
type RequiredPlan = Omit<MembershipPlanRow, 'features'> & { features: unknown[] };

@Injectable()
export class CoursesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private toRequiredPlan(plan: MembershipPlanRow): RequiredPlan {
    return { ...plan, features: (plan.features as unknown[]) ?? [] };
  }

  // ════════════════════════════════════════════════════════
  // MEMBERSHIP PLANS
  // ════════════════════════════════════════════════════════

  async getMembershipPlans(tenantId: string) {
    const plans = await this.db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.tenantId, tenantId))
      .orderBy(asc(membershipPlans.position));

    const plansWithCount = await Promise.all(
      plans.map(async (plan) => {
        const [{ value }] = await this.db
          .select({ value: count() })
          .from(memberships)
          .where(
            and(
              eq(memberships.planId, plan.id),
              eq(memberships.status, 'active'),
            ),
          );
        return {
          ...plan,
          features: (plan.features as unknown[]) ?? [],
          memberCount: Number(value),
        };
      }),
    );

    return { plans: plansWithCount, total: plansWithCount.length };
  }

  async getMembershipPlanById(tenantId: string, id: string) {
    const [plan] = await this.db
      .select()
      .from(membershipPlans)
      .where(
        and(eq(membershipPlans.id, id), eq(membershipPlans.tenantId, tenantId)),
      );
    if (!plan) throw new NotFoundException('Membership-Plan nicht gefunden');
    return { ...plan, features: (plan.features as unknown[]) ?? [] };
  }

  async createMembershipPlan(tenantId: string, input: CreateMembershipPlanInput) {
    const slug = this.toSlug(input.name);
    const [plan] = await this.db
      .insert(membershipPlans)
      .values({
        tenantId,
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        interval: input.interval ?? 'monthly',
        features: input.features ?? [],
        isPublic: input.isPublic ?? true,
        position: input.position ?? 0,
      })
      .returning();
    return { ...plan, features: (plan.features as unknown[]) ?? [] };
  }

  async updateMembershipPlan(tenantId: string, id: string, input: UpdateMembershipPlanInput) {
    const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };
    if (input.name) updateData.slug = this.toSlug(input.name);
    if (input.features !== undefined) updateData.features = input.features;

    const [updated] = await this.db
      .update(membershipPlans)
      .set(updateData)
      .where(
        and(eq(membershipPlans.id, id), eq(membershipPlans.tenantId, tenantId)),
      )
      .returning();
    if (!updated) throw new NotFoundException('Plan nicht gefunden');
    return { ...updated, features: (updated.features as unknown[]) ?? [] };
  }

  async deleteMembershipPlan(tenantId: string, id: string) {
    const [{ value }] = await this.db
      .select({ value: count() })
      .from(memberships)
      .where(and(eq(memberships.planId, id), eq(memberships.status, 'active')));

    if (Number(value) > 0) {
      throw new BadRequestException(`Plan hat noch ${value} aktive Mitglieder`);
    }

    await this.db
      .delete(membershipPlans)
      .where(
        and(eq(membershipPlans.id, id), eq(membershipPlans.tenantId, tenantId)),
      );
    return true;
  }

  // ════════════════════════════════════════════════════════
  // MEMBERSHIPS
  // ════════════════════════════════════════════════════════

  async getMemberships(tenantId: string, status?: string) {
    const conditions = [eq(memberships.tenantId, tenantId)];
    if (status) conditions.push(eq(memberships.status, status));

    const result = await this.db
      .select()
      .from(memberships)
      .where(and(...conditions))
      .orderBy(desc(memberships.createdAt));

    const withPlan = await Promise.all(
      result.map(async (m) => {
        if (!m.planId) return { ...m, plan: null };
        const [plan] = await this.db
          .select()
          .from(membershipPlans)
          .where(eq(membershipPlans.id, m.planId));
        return {
          ...m,
          plan: plan ? this.toRequiredPlan(plan) : null,
        };
      }),
    );

    return { memberships: withPlan, total: withPlan.length };
  }

  async grantMembership(tenantId: string, input: GrantMembershipInput) {
    const conditions = [
      eq(memberships.tenantId, tenantId),
      eq(memberships.customerEmail, input.customerEmail),
      eq(memberships.status, 'active'),
    ];
    if (input.planId) conditions.push(eq(memberships.planId, input.planId));

    const [existing] = await this.db
      .select()
      .from(memberships)
      .where(and(...conditions));
    if (existing)
      throw new BadRequestException('Kunde hat bereits eine aktive Membership');

    const [membership] = await this.db
      .insert(memberships)
      .values({
        tenantId,
        planId: input.planId,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        status: 'active',
        startedAt: new Date(),
        expiresAt: input.expiresAt,
        grantedManually: true,
      })
      .returning();

    await this.db
      .update(tenantCustomers)
      .set({ isMember: true, memberSince: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(tenantCustomers.tenantId, tenantId),
          eq(tenantCustomers.email, input.customerEmail),
        ),
      );

    return membership;
  }

  async updateMembershipStatus(tenantId: string, id: string, input: UpdateMembershipStatusInput) {
    const valid = ['active', 'cancelled', 'expired', 'trial', 'paused'];
    if (!valid.includes(input.status))
      throw new BadRequestException('Ungültiger Status');

    const updateData: Record<string, unknown> = { status: input.status, updatedAt: new Date() };
    if (input.status === 'cancelled') updateData.cancelledAt = new Date();

    const [updated] = await this.db
      .update(memberships)
      .set(updateData)
      .where(and(eq(memberships.id, id), eq(memberships.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Membership nicht gefunden');

    if (['cancelled', 'expired'].includes(input.status)) {
      await this.db
        .update(tenantCustomers)
        .set({ isMember: false, updatedAt: new Date() })
        .where(
          and(
            eq(tenantCustomers.tenantId, tenantId),
            eq(tenantCustomers.email, updated.customerEmail),
          ),
        );
    }

    return updated;
  }

  async revokeMembership(tenantId: string, id: string) {
    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, id), eq(memberships.tenantId, tenantId)));
    if (!membership) throw new NotFoundException('Membership nicht gefunden');

    await this.db.delete(memberships).where(eq(memberships.id, id));

    await this.db
      .update(tenantCustomers)
      .set({ isMember: false, updatedAt: new Date() })
      .where(
        and(
          eq(tenantCustomers.tenantId, tenantId),
          eq(tenantCustomers.email, membership.customerEmail),
        ),
      );

    return true;
  }

  // ════════════════════════════════════════════════════════
  // COURSES
  // ════════════════════════════════════════════════════════

  async getCourses(tenantId: string) {
    const result = await this.db
      .select()
      .from(courses)
      .where(eq(courses.tenantId, tenantId))
      .orderBy(desc(courses.createdAt));

    const withData = await Promise.all(
      result.map(async (course) => {
        const [{ value: enrollmentCount }] = await this.db
          .select({ value: count() })
          .from(courseEnrollments)
          .where(eq(courseEnrollments.courseId, course.id));

        let requiredPlan: RequiredPlan | undefined;
        const planId = course.requiresMembershipPlanId;
        if (planId) {
          const [plan] = await this.db
            .select()
            .from(membershipPlans)
            .where(eq(membershipPlans.id, planId));
          requiredPlan = plan ? this.toRequiredPlan(plan) : undefined;
        }

        return {
          ...course,
          enrollmentCount: Number(enrollmentCount),
          requiredPlan,
        };
      }),
    );

    return { courses: withData, total: withData.length };
  }

  async getCourseById(tenantId: string, id: string, withChapters = true) {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.tenantId, tenantId)));
    if (!course) throw new NotFoundException('Kurs nicht gefunden');

    if (!withChapters) return course;

    const chapters = await this.db
      .select()
      .from(courseChapters)
      .where(eq(courseChapters.courseId, id))
      .orderBy(asc(courseChapters.position));

    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await this.db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.chapterId, chapter.id))
          .orderBy(asc(courseLessons.position));
        return { ...chapter, lessons };
      }),
    );

    let requiredPlan: RequiredPlan | undefined;
    const planId = course.requiresMembershipPlanId;
    if (planId) {
      const [plan] = await this.db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, planId));
      requiredPlan = plan ? this.toRequiredPlan(plan) : undefined;
    }

    return { ...course, chapters: chaptersWithLessons, requiredPlan };
  }

  async createCourse(tenantId: string, input: CreateCourseInput) {
    const slug = this.toSlug(input.title);

    const [existing] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.tenantId, tenantId), eq(courses.slug, slug)));
    const finalSlug = existing
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;

    const [course] = await this.db
      .insert(courses)
      .values({
        tenantId,
        title: input.title,
        slug: finalSlug,
        description: input.description,
        shortDescription: input.shortDescription,
        thumbnail: input.thumbnail,
        price: input.price ?? 0,
        isFree: input.isFree ?? false,
        requiresMembershipPlanId: input.requiresMembershipPlanId,
        level: input.level ?? 'beginner',
        language: input.language ?? 'de',
        certificateEnabled: input.certificateEnabled ?? false,
      })
      .returning();

    return course;
  }

  async updateCourse(tenantId: string, id: string, input: UpdateCourseInput) {
    const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };
    if (input.title) updateData.slug = this.toSlug(input.title);

    const [updated] = await this.db
      .update(courses)
      .set(updateData)
      .where(and(eq(courses.id, id), eq(courses.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Kurs nicht gefunden');
    return updated;
  }

  async deleteCourse(tenantId: string, id: string) {
    const [{ value: enrollCount }] = await this.db
      .select({ value: count() })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, id));

    if (Number(enrollCount) > 0) {
      throw new BadRequestException(`Kurs hat noch ${enrollCount} Einschreibungen`);
    }

    await this.db
      .delete(courses)
      .where(and(eq(courses.id, id), eq(courses.tenantId, tenantId)));
    return true;
  }

  async duplicateCourse(tenantId: string, id: string) {
    const original = await this.getCourseById(tenantId, id);

    const [newCourse] = await this.db
      .insert(courses)
      .values({
        tenantId,
        title: `${original.title} (Kopie)`,
        slug: `${original.slug}-kopie-${Date.now().toString().slice(-4)}`,
        description: original.description,
        shortDescription: original.shortDescription,
        thumbnail: original.thumbnail,
        price: original.price,
        isFree: original.isFree,
        isPublished: false,
        level: original.level,
        language: original.language,
        certificateEnabled: original.certificateEnabled,
      })
      .returning();

    const chapters = (original as { chapters?: unknown[] }).chapters ?? [];
    for (const chapter of chapters as Array<{
      title: string;
      description: string | null;
      position: number;
      lessons?: Array<{
        title: string;
        slug: string;
        type: string;
        content: unknown;
        videoUrl: string | null;
        duration: number;
        position: number;
        isFreePreview: boolean;
      }>;
    }>) {
      const [newChapter] = await this.db
        .insert(courseChapters)
        .values({
          courseId: newCourse.id,
          tenantId,
          title: chapter.title,
          description: chapter.description,
          position: chapter.position,
        })
        .returning();

      if (chapter.lessons && chapter.lessons.length > 0) {
        await this.db.insert(courseLessons).values(
          chapter.lessons.map((lesson) => ({
            chapterId: newChapter.id,
            courseId: newCourse.id,
            tenantId,
            title: lesson.title,
            slug: lesson.slug,
            type: lesson.type,
            content: lesson.content ?? {},
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            position: lesson.position,
            isFreePreview: lesson.isFreePreview,
          })),
        );
      }
    }

    return this.getCourseById(tenantId, newCourse.id);
  }

  // ════════════════════════════════════════════════════════
  // CHAPTERS
  // ════════════════════════════════════════════════════════

  async createChapter(tenantId: string, input: CreateChapterInput) {
    const existingChapters = await this.db
      .select()
      .from(courseChapters)
      .where(eq(courseChapters.courseId, input.courseId));

    const [chapter] = await this.db
      .insert(courseChapters)
      .values({
        courseId: input.courseId,
        tenantId,
        title: input.title,
        description: input.description,
        position: input.position ?? existingChapters.length,
      })
      .returning();
    return chapter;
  }

  async updateChapter(tenantId: string, id: string, input: UpdateChapterInput) {
    const [updated] = await this.db
      .update(courseChapters)
      .set(input)
      .where(
        and(eq(courseChapters.id, id), eq(courseChapters.tenantId, tenantId)),
      )
      .returning();
    if (!updated) throw new NotFoundException('Kapitel nicht gefunden');
    return updated;
  }

  async deleteChapter(tenantId: string, id: string) {
    await this.db
      .delete(courseChapters)
      .where(
        and(eq(courseChapters.id, id), eq(courseChapters.tenantId, tenantId)),
      );
    return true;
  }

  // ════════════════════════════════════════════════════════
  // LESSONS
  // ════════════════════════════════════════════════════════

  async createLesson(tenantId: string, input: CreateLessonInput) {
    const existing = await this.db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.chapterId, input.chapterId));

    const slug = `${this.toSlug(input.title)}-${Date.now().toString().slice(-4)}`;

    const [lesson] = await this.db
      .insert(courseLessons)
      .values({
        chapterId: input.chapterId,
        courseId: input.courseId,
        tenantId,
        title: input.title,
        slug,
        type: input.type ?? 'video',
        videoUrl: input.videoUrl,
        duration: input.duration ?? 0,
        content: input.content ?? {},
        position: input.position ?? existing.length,
        isFreePreview: input.isFreePreview ?? false,
      })
      .returning();

    if (input.duration) {
      await this.db
        .update(courses)
        .set({
          totalDuration: sql`total_duration + ${input.duration}`,
          updatedAt: new Date(),
        })
        .where(eq(courses.id, input.courseId));
    }

    return lesson;
  }

  async updateLesson(tenantId: string, id: string, input: UpdateLessonInput) {
    const [updated] = await this.db
      .update(courseLessons)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(courseLessons.id, id), eq(courseLessons.tenantId, tenantId)),
      )
      .returning();
    if (!updated) throw new NotFoundException('Lektion nicht gefunden');
    return updated;
  }

  async deleteLesson(tenantId: string, id: string) {
    await this.db
      .delete(courseLessons)
      .where(
        and(eq(courseLessons.id, id), eq(courseLessons.tenantId, tenantId)),
      );
    return true;
  }

  async reorderChapters(tenantId: string, courseId: string, chapterIds: string[]) {
    await Promise.all(
      chapterIds.map((chapterId, index) =>
        this.db
          .update(courseChapters)
          .set({ position: index })
          .where(
            and(
              eq(courseChapters.id, chapterId),
              eq(courseChapters.tenantId, tenantId),
            ),
          ),
      ),
    );
    return this.getCourseById(tenantId, courseId);
  }

  async reorderLessons(tenantId: string, chapterId: string, lessonIds: string[]) {
    await Promise.all(
      lessonIds.map((lessonId, index) =>
        this.db
          .update(courseLessons)
          .set({ position: index })
          .where(
            and(
              eq(courseLessons.id, lessonId),
              eq(courseLessons.tenantId, tenantId),
            ),
          ),
      ),
    );
    return true;
  }

  // ════════════════════════════════════════════════════════
  // ENROLLMENTS
  // ════════════════════════════════════════════════════════

  async getEnrollments(tenantId: string, courseId?: string) {
    const conditions = [eq(courseEnrollments.tenantId, tenantId)];
    if (courseId) conditions.push(eq(courseEnrollments.courseId, courseId));

    const result = await this.db
      .select()
      .from(courseEnrollments)
      .where(and(...conditions))
      .orderBy(desc(courseEnrollments.enrolledAt));

    return { enrollments: result, total: result.length };
  }

  async enrollCourse(tenantId: string, input: EnrollCourseInput) {
    const [existing] = await this.db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.tenantId, tenantId),
          eq(courseEnrollments.courseId, input.courseId),
          eq(courseEnrollments.customerEmail, input.customerEmail),
        ),
      );
    if (existing) return existing;

    const [course] = await this.db
      .select()
      .from(courses)
      .where(
        and(eq(courses.id, input.courseId), eq(courses.tenantId, tenantId)),
      );
    if (!course) throw new NotFoundException('Kurs nicht gefunden');

    let accessGrantedBy = 'purchase';

    if (course.isFree) {
      accessGrantedBy = 'free';
    } else if (input.membershipId) {
      const [membership] = await this.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.id, input.membershipId),
            eq(memberships.tenantId, tenantId),
            eq(memberships.status, 'active'),
          ),
        );
      if (!membership) throw new ForbiddenException('Keine aktive Membership');

      const requiredPlanId = course.requiresMembershipPlanId;
      if (requiredPlanId && membership.planId !== requiredPlanId) {
        throw new ForbiddenException('Membership-Plan hat keinen Zugang zu diesem Kurs');
      }

      accessGrantedBy = 'membership';
    } else if (!input.stripePaymentIntentId) {
      throw new BadRequestException('Bezahlung oder Membership erforderlich');
    }

    const [enrollment] = await this.db
      .insert(courseEnrollments)
      .values({
        courseId: input.courseId,
        tenantId,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        accessGrantedBy,
        membershipId: input.membershipId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        progress: 0,
      })
      .returning();

    return enrollment;
  }

  async getEnrollmentProgress(tenantId: string, enrollmentId: string) {
    const [enrollment] = await this.db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.id, enrollmentId),
          eq(courseEnrollments.tenantId, tenantId),
        ),
      );
    if (!enrollment) throw new NotFoundException('Einschreibung nicht gefunden');

    const progress = await this.db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.enrollmentId, enrollmentId));

    const [{ value: totalLessons }] = await this.db
      .select({ value: count() })
      .from(courseLessons)
      .where(
        and(
          eq(courseLessons.courseId, enrollment.courseId),
          eq(courseLessons.isPublished, true),
        ),
      );

    const completedLessons = progress.filter((p) => p.completedAt !== null).length;
    const progressPercent =
      Number(totalLessons) > 0
        ? Math.round((completedLessons / Number(totalLessons)) * 100)
        : 0;

    return { ...enrollment, lessonProgress: progress, progress: progressPercent };
  }

  async trackLessonProgress(tenantId: string, input: TrackLessonProgressInput) {
    const [existing] = await this.db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, input.enrollmentId),
          eq(lessonProgress.lessonId, input.lessonId),
        ),
      );

    if (existing) {
      const updateData: Record<string, unknown> = {
        watchTime: input.watchTime ?? existing.watchTime,
      };
      if (input.completed && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
      await this.db
        .update(lessonProgress)
        .set(updateData)
        .where(eq(lessonProgress.id, existing.id));
    } else {
      await this.db.insert(lessonProgress).values({
        enrollmentId: input.enrollmentId,
        lessonId: input.lessonId,
        tenantId,
        completedAt: input.completed ? new Date() : undefined,
        watchTime: input.watchTime ?? 0,
      });
    }

    const [enrollment] = await this.db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, input.enrollmentId));

    if (enrollment) {
      const [{ value: totalLessons }] = await this.db
        .select({ value: count() })
        .from(courseLessons)
        .where(
          and(
            eq(courseLessons.courseId, enrollment.courseId),
            eq(courseLessons.isPublished, true),
          ),
        );

      const allProgress = await this.db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, input.enrollmentId));

      const completed = allProgress.filter((p) => p.completedAt !== null).length;
      const progressPercent =
        Number(totalLessons) > 0
          ? Math.round((completed / Number(totalLessons)) * 100)
          : 0;

      const updateData: Record<string, unknown> = {
        progress: progressPercent,
        updatedAt: new Date(),
      };
      if (progressPercent === 100 && !enrollment.completedAt) {
        updateData.completedAt = new Date();
      }

      await this.db
        .update(courseEnrollments)
        .set(updateData)
        .where(eq(courseEnrollments.id, input.enrollmentId));
    }

    return true;
  }

  // ════════════════════════════════════════════════════════
  // STATS
  // ════════════════════════════════════════════════════════

  async getStats(tenantId: string) {
    const [{ value: totalCourses }] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(eq(courses.tenantId, tenantId));

    const [{ value: publishedCourses }] = await this.db
      .select({ value: count() })
      .from(courses)
      .where(and(eq(courses.tenantId, tenantId), eq(courses.isPublished, true)));

    const [{ value: totalEnrollments }] = await this.db
      .select({ value: count() })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.tenantId, tenantId));

    const [{ value: activeMembers }] = await this.db
      .select({ value: count() })
      .from(memberships)
      .where(
        and(eq(memberships.tenantId, tenantId), eq(memberships.status, 'active')),
      );

    return {
      totalCourses: Number(totalCourses),
      publishedCourses: Number(publishedCourses),
      totalEnrollments: Number(totalEnrollments),
      activeMembers: Number(activeMembers),
      totalRevenue: 0,
    };
  }

  // ════════════════════════════════════════════════════════
  // ACCESS CHECK (Public)
  // ════════════════════════════════════════════════════════

  async checkCourseAccess(tenantId: string, courseId: string, customerEmail: string): Promise<boolean> {
    const [enrollment] = await this.db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.tenantId, tenantId),
          eq(courseEnrollments.courseId, courseId),
          eq(courseEnrollments.customerEmail, customerEmail),
        ),
      );
    return !!enrollment;
  }

  async checkMembershipAccess(tenantId: string, customerEmail: string, planId?: string): Promise<boolean> {
    const conditions = [
      eq(memberships.tenantId, tenantId),
      eq(memberships.customerEmail, customerEmail),
      eq(memberships.status, 'active'),
    ];
    if (planId) conditions.push(eq(memberships.planId, planId));

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(and(...conditions));
    return !!membership;
  }
}