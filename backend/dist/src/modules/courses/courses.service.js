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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../drizzle/schema");
let CoursesService = class CoursesService {
    db;
    constructor(db) {
        this.db = db;
    }
    toSlug(name) {
        return name
            .toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    toRequiredPlan(plan) {
        return { ...plan, features: plan.features ?? [] };
    }
    async getMembershipPlans(tenantId) {
        const plans = await this.db
            .select()
            .from(schema_1.membershipPlans)
            .where((0, drizzle_orm_1.eq)(schema_1.membershipPlans.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.membershipPlans.position));
        const plansWithCount = await Promise.all(plans.map(async (plan) => {
            const [{ value }] = await this.db
                .select({ value: (0, drizzle_orm_1.count)() })
                .from(schema_1.memberships)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.planId, plan.id), (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active')));
            return {
                ...plan,
                features: plan.features ?? [],
                memberCount: Number(value),
            };
        }));
        return { plans: plansWithCount, total: plansWithCount.length };
    }
    async getMembershipPlanById(tenantId, id) {
        const [plan] = await this.db
            .select()
            .from(schema_1.membershipPlans)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, id), (0, drizzle_orm_1.eq)(schema_1.membershipPlans.tenantId, tenantId)));
        if (!plan)
            throw new common_1.NotFoundException('Membership-Plan nicht gefunden');
        return { ...plan, features: plan.features ?? [] };
    }
    async createMembershipPlan(tenantId, input) {
        const slug = this.toSlug(input.name);
        const [plan] = await this.db
            .insert(schema_1.membershipPlans)
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
        return { ...plan, features: plan.features ?? [] };
    }
    async updateMembershipPlan(tenantId, id, input) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.name)
            updateData.slug = this.toSlug(input.name);
        if (input.features !== undefined)
            updateData.features = input.features;
        const [updated] = await this.db
            .update(schema_1.membershipPlans)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, id), (0, drizzle_orm_1.eq)(schema_1.membershipPlans.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Plan nicht gefunden');
        return { ...updated, features: updated.features ?? [] };
    }
    async deleteMembershipPlan(tenantId, id) {
        const [{ value }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.planId, id), (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active')));
        if (Number(value) > 0) {
            throw new common_1.BadRequestException(`Plan hat noch ${value} aktive Mitglieder`);
        }
        await this.db
            .delete(schema_1.membershipPlans)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, id), (0, drizzle_orm_1.eq)(schema_1.membershipPlans.tenantId, tenantId)));
        return true;
    }
    async getMemberships(tenantId, status) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId)];
        if (status)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.memberships.status, status));
        const result = await this.db
            .select()
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.memberships.createdAt));
        const withPlan = await Promise.all(result.map(async (m) => {
            if (!m.planId)
                return { ...m, plan: null };
            const [plan] = await this.db
                .select()
                .from(schema_1.membershipPlans)
                .where((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, m.planId));
            return {
                ...m,
                plan: plan ? this.toRequiredPlan(plan) : null,
            };
        }));
        return { memberships: withPlan, total: withPlan.length };
    }
    async grantMembership(tenantId, input) {
        const conditions = [
            (0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId),
            (0, drizzle_orm_1.eq)(schema_1.memberships.customerEmail, input.customerEmail),
            (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active'),
        ];
        if (input.planId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.memberships.planId, input.planId));
        const [existing] = await this.db
            .select()
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)(...conditions));
        if (existing)
            throw new common_1.BadRequestException('Kunde hat bereits eine aktive Membership');
        const [membership] = await this.db
            .insert(schema_1.memberships)
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
            .update(schema_1.tenantCustomers)
            .set({ isMember: true, memberSince: new Date(), updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, input.customerEmail)));
        return membership;
    }
    async updateMembershipStatus(tenantId, id, input) {
        const valid = ['active', 'cancelled', 'expired', 'trial', 'paused'];
        if (!valid.includes(input.status))
            throw new common_1.BadRequestException('Ungültiger Status');
        const updateData = { status: input.status, updatedAt: new Date() };
        if (input.status === 'cancelled')
            updateData.cancelledAt = new Date();
        const [updated] = await this.db
            .update(schema_1.memberships)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.id, id), (0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Membership nicht gefunden');
        if (['cancelled', 'expired'].includes(input.status)) {
            await this.db
                .update(schema_1.tenantCustomers)
                .set({ isMember: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, updated.customerEmail)));
        }
        return updated;
    }
    async revokeMembership(tenantId, id) {
        const [membership] = await this.db
            .select()
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.id, id), (0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId)));
        if (!membership)
            throw new common_1.NotFoundException('Membership nicht gefunden');
        await this.db.delete(schema_1.memberships).where((0, drizzle_orm_1.eq)(schema_1.memberships.id, id));
        await this.db
            .update(schema_1.tenantCustomers)
            .set({ isMember: false, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, membership.customerEmail)));
        return true;
    }
    async getCourses(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.courses.createdAt));
        const withData = await Promise.all(result.map(async (course) => {
            const [{ value: enrollmentCount }] = await this.db
                .select({ value: (0, drizzle_orm_1.count)() })
                .from(schema_1.courseEnrollments)
                .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.courseId, course.id));
            let requiredPlan;
            const planId = course.requiresMembershipPlanId;
            if (planId) {
                const [plan] = await this.db
                    .select()
                    .from(schema_1.membershipPlans)
                    .where((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, planId));
                requiredPlan = plan ? this.toRequiredPlan(plan) : undefined;
            }
            return {
                ...course,
                enrollmentCount: Number(enrollmentCount),
                requiredPlan,
            };
        }));
        return { courses: withData, total: withData.length };
    }
    async getCourseById(tenantId, id, withChapters = true) {
        const [course] = await this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.id, id), (0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId)));
        if (!course)
            throw new common_1.NotFoundException('Kurs nicht gefunden');
        if (!withChapters)
            return course;
        const chapters = await this.db
            .select()
            .from(schema_1.courseChapters)
            .where((0, drizzle_orm_1.eq)(schema_1.courseChapters.courseId, id))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.courseChapters.position));
        const chaptersWithLessons = await Promise.all(chapters.map(async (chapter) => {
            const lessons = await this.db
                .select()
                .from(schema_1.courseLessons)
                .where((0, drizzle_orm_1.eq)(schema_1.courseLessons.chapterId, chapter.id))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.courseLessons.position));
            return { ...chapter, lessons };
        }));
        let requiredPlan;
        const planId = course.requiresMembershipPlanId;
        if (planId) {
            const [plan] = await this.db
                .select()
                .from(schema_1.membershipPlans)
                .where((0, drizzle_orm_1.eq)(schema_1.membershipPlans.id, planId));
            requiredPlan = plan ? this.toRequiredPlan(plan) : undefined;
        }
        return { ...course, chapters: chaptersWithLessons, requiredPlan };
    }
    async createCourse(tenantId, input) {
        const slug = this.toSlug(input.title);
        const [existing] = await this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courses.slug, slug)));
        const finalSlug = existing
            ? `${slug}-${Date.now().toString().slice(-4)}`
            : slug;
        const [course] = await this.db
            .insert(schema_1.courses)
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
    async updateCourse(tenantId, id, input) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.title)
            updateData.slug = this.toSlug(input.title);
        const [updated] = await this.db
            .update(schema_1.courses)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.id, id), (0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Kurs nicht gefunden');
        return updated;
    }
    async deleteCourse(tenantId, id) {
        const [{ value: enrollCount }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.courseId, id));
        if (Number(enrollCount) > 0) {
            throw new common_1.BadRequestException(`Kurs hat noch ${enrollCount} Einschreibungen`);
        }
        await this.db
            .delete(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.id, id), (0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId)));
        return true;
    }
    async duplicateCourse(tenantId, id) {
        const original = await this.getCourseById(tenantId, id);
        const [newCourse] = await this.db
            .insert(schema_1.courses)
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
        const chapters = original.chapters ?? [];
        for (const chapter of chapters) {
            const [newChapter] = await this.db
                .insert(schema_1.courseChapters)
                .values({
                courseId: newCourse.id,
                tenantId,
                title: chapter.title,
                description: chapter.description,
                position: chapter.position,
            })
                .returning();
            if (chapter.lessons && chapter.lessons.length > 0) {
                await this.db.insert(schema_1.courseLessons).values(chapter.lessons.map((lesson) => ({
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
                })));
            }
        }
        return this.getCourseById(tenantId, newCourse.id);
    }
    async createChapter(tenantId, input) {
        const existingChapters = await this.db
            .select()
            .from(schema_1.courseChapters)
            .where((0, drizzle_orm_1.eq)(schema_1.courseChapters.courseId, input.courseId));
        const [chapter] = await this.db
            .insert(schema_1.courseChapters)
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
    async updateChapter(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.courseChapters)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseChapters.id, id), (0, drizzle_orm_1.eq)(schema_1.courseChapters.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Kapitel nicht gefunden');
        return updated;
    }
    async deleteChapter(tenantId, id) {
        await this.db
            .delete(schema_1.courseChapters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseChapters.id, id), (0, drizzle_orm_1.eq)(schema_1.courseChapters.tenantId, tenantId)));
        return true;
    }
    async createLesson(tenantId, input) {
        const existing = await this.db
            .select()
            .from(schema_1.courseLessons)
            .where((0, drizzle_orm_1.eq)(schema_1.courseLessons.chapterId, input.chapterId));
        const slug = `${this.toSlug(input.title)}-${Date.now().toString().slice(-4)}`;
        const [lesson] = await this.db
            .insert(schema_1.courseLessons)
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
                .update(schema_1.courses)
                .set({
                totalDuration: (0, drizzle_orm_1.sql) `total_duration + ${input.duration}`,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.courses.id, input.courseId));
        }
        return lesson;
    }
    async updateLesson(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.courseLessons)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.id, id), (0, drizzle_orm_1.eq)(schema_1.courseLessons.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Lektion nicht gefunden');
        return updated;
    }
    async deleteLesson(tenantId, id) {
        await this.db
            .delete(schema_1.courseLessons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.id, id), (0, drizzle_orm_1.eq)(schema_1.courseLessons.tenantId, tenantId)));
        return true;
    }
    async reorderChapters(tenantId, courseId, chapterIds) {
        await Promise.all(chapterIds.map((chapterId, index) => this.db
            .update(schema_1.courseChapters)
            .set({ position: index })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseChapters.id, chapterId), (0, drizzle_orm_1.eq)(schema_1.courseChapters.tenantId, tenantId)))));
        return this.getCourseById(tenantId, courseId);
    }
    async reorderLessons(tenantId, chapterId, lessonIds) {
        await Promise.all(lessonIds.map((lessonId, index) => this.db
            .update(schema_1.courseLessons)
            .set({ position: index })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.id, lessonId), (0, drizzle_orm_1.eq)(schema_1.courseLessons.tenantId, tenantId)))));
        return true;
    }
    async getEnrollments(tenantId, courseId) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.courseEnrollments.tenantId, tenantId)];
        if (courseId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.courseId, courseId));
        const result = await this.db
            .select()
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.courseEnrollments.enrolledAt));
        return { enrollments: result, total: result.length };
    }
    async enrollCourse(tenantId, input) {
        const [existing] = await this.db
            .select()
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courseEnrollments.courseId, input.courseId), (0, drizzle_orm_1.eq)(schema_1.courseEnrollments.customerEmail, input.customerEmail)));
        if (existing)
            return existing;
        const [course] = await this.db
            .select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.id, input.courseId), (0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId)));
        if (!course)
            throw new common_1.NotFoundException('Kurs nicht gefunden');
        let accessGrantedBy = 'purchase';
        if (course.isFree) {
            accessGrantedBy = 'free';
        }
        else if (input.membershipId) {
            const [membership] = await this.db
                .select()
                .from(schema_1.memberships)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.id, input.membershipId), (0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active')));
            if (!membership)
                throw new common_1.ForbiddenException('Keine aktive Membership');
            const requiredPlanId = course.requiresMembershipPlanId;
            if (requiredPlanId && membership.planId !== requiredPlanId) {
                throw new common_1.ForbiddenException('Membership-Plan hat keinen Zugang zu diesem Kurs');
            }
            accessGrantedBy = 'membership';
        }
        else if (!input.stripePaymentIntentId) {
            throw new common_1.BadRequestException('Bezahlung oder Membership erforderlich');
        }
        const [enrollment] = await this.db
            .insert(schema_1.courseEnrollments)
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
    async getEnrollmentProgress(tenantId, enrollmentId) {
        const [enrollment] = await this.db
            .select()
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.id, enrollmentId), (0, drizzle_orm_1.eq)(schema_1.courseEnrollments.tenantId, tenantId)));
        if (!enrollment)
            throw new common_1.NotFoundException('Einschreibung nicht gefunden');
        const progress = await this.db
            .select()
            .from(schema_1.lessonProgress)
            .where((0, drizzle_orm_1.eq)(schema_1.lessonProgress.enrollmentId, enrollmentId));
        const [{ value: totalLessons }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.courseLessons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.courseId, enrollment.courseId), (0, drizzle_orm_1.eq)(schema_1.courseLessons.isPublished, true)));
        const completedLessons = progress.filter((p) => p.completedAt !== null).length;
        const progressPercent = Number(totalLessons) > 0
            ? Math.round((completedLessons / Number(totalLessons)) * 100)
            : 0;
        return { ...enrollment, lessonProgress: progress, progress: progressPercent };
    }
    async trackLessonProgress(tenantId, input) {
        const [existing] = await this.db
            .select()
            .from(schema_1.lessonProgress)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgress.enrollmentId, input.enrollmentId), (0, drizzle_orm_1.eq)(schema_1.lessonProgress.lessonId, input.lessonId)));
        if (existing) {
            const updateData = {
                watchTime: input.watchTime ?? existing.watchTime,
            };
            if (input.completed && !existing.completedAt) {
                updateData.completedAt = new Date();
            }
            await this.db
                .update(schema_1.lessonProgress)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.lessonProgress.id, existing.id));
        }
        else {
            await this.db.insert(schema_1.lessonProgress).values({
                enrollmentId: input.enrollmentId,
                lessonId: input.lessonId,
                tenantId,
                completedAt: input.completed ? new Date() : undefined,
                watchTime: input.watchTime ?? 0,
            });
        }
        const [enrollment] = await this.db
            .select()
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.id, input.enrollmentId));
        if (enrollment) {
            const [{ value: totalLessons }] = await this.db
                .select({ value: (0, drizzle_orm_1.count)() })
                .from(schema_1.courseLessons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseLessons.courseId, enrollment.courseId), (0, drizzle_orm_1.eq)(schema_1.courseLessons.isPublished, true)));
            const allProgress = await this.db
                .select()
                .from(schema_1.lessonProgress)
                .where((0, drizzle_orm_1.eq)(schema_1.lessonProgress.enrollmentId, input.enrollmentId));
            const completed = allProgress.filter((p) => p.completedAt !== null).length;
            const progressPercent = Number(totalLessons) > 0
                ? Math.round((completed / Number(totalLessons)) * 100)
                : 0;
            const updateData = {
                progress: progressPercent,
                updatedAt: new Date(),
            };
            if (progressPercent === 100 && !enrollment.completedAt) {
                updateData.completedAt = new Date();
            }
            await this.db
                .update(schema_1.courseEnrollments)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.id, input.enrollmentId));
        }
        return true;
    }
    async getStats(tenantId) {
        const [{ value: totalCourses }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId));
        const [{ value: publishedCourses }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courses.isPublished, true)));
        const [{ value: totalEnrollments }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.tenantId, tenantId));
        const [{ value: activeMembers }] = await this.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active')));
        return {
            totalCourses: Number(totalCourses),
            publishedCourses: Number(publishedCourses),
            totalEnrollments: Number(totalEnrollments),
            activeMembers: Number(activeMembers),
            totalRevenue: 0,
        };
    }
    async checkCourseAccess(tenantId, courseId, customerEmail) {
        const [enrollment] = await this.db
            .select()
            .from(schema_1.courseEnrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courseEnrollments.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.courseEnrollments.courseId, courseId), (0, drizzle_orm_1.eq)(schema_1.courseEnrollments.customerEmail, customerEmail)));
        return !!enrollment;
    }
    async checkMembershipAccess(tenantId, customerEmail, planId) {
        const conditions = [
            (0, drizzle_orm_1.eq)(schema_1.memberships.tenantId, tenantId),
            (0, drizzle_orm_1.eq)(schema_1.memberships.customerEmail, customerEmail),
            (0, drizzle_orm_1.eq)(schema_1.memberships.status, 'active'),
        ];
        if (planId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.memberships.planId, planId));
        const [membership] = await this.db
            .select()
            .from(schema_1.memberships)
            .where((0, drizzle_orm_1.and)(...conditions));
        return !!membership;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], CoursesService);
//# sourceMappingURL=courses.service.js.map