// backend\src\modules\courses\dto\courses.types.ts

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum MembershipStatus {
  ACTIVE    = 'active',
  CANCELLED = 'cancelled',
  EXPIRED   = 'expired',
  TRIAL     = 'trial',
  PAUSED    = 'paused',
}
registerEnumType(MembershipStatus, { name: 'MembershipStatus' });

export enum MembershipInterval {
  MONTHLY  = 'monthly',
  YEARLY   = 'yearly',
  LIFETIME = 'lifetime',
}
registerEnumType(MembershipInterval, { name: 'MembershipInterval' });

export enum CourseLevel {
  BEGINNER     = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED     = 'advanced',
}
registerEnumType(CourseLevel, { name: 'CourseLevel' });

export enum LessonType {
  VIDEO = 'video',
  TEXT  = 'text',
  PDF   = 'pdf',
  QUIZ  = 'quiz',
}
registerEnumType(LessonType, { name: 'LessonType' });

export enum AccessGrantedBy {
  PURCHASE   = 'purchase',
  MEMBERSHIP = 'membership',
  MANUAL     = 'manual',
  FREE       = 'free',
}
registerEnumType(AccessGrantedBy, { name: 'AccessGrantedBy' });

@ObjectType()
export class MembershipPlan {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Int) price: number;
  @Field() interval: string;
  @Field(() => [String], { nullable: true }) features: string[] | null;
  @Field() isActive: boolean;
  @Field() isPublic: boolean;
  @Field(() => String, { nullable: true }) stripePriceId: string | null;
  @Field(() => Int) position: number;
  @Field(() => Int, { nullable: true }) memberCount: number | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class MembershipPlansResponse {
  @Field(() => [MembershipPlan]) plans: MembershipPlan[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class Membership {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) planId: string | null;
  @Field(() => MembershipPlan, { nullable: true }) plan?: MembershipPlan | null;
  @Field() customerEmail: string;
  @Field() customerName: string;
  @Field() status: string;
  @Field(() => Date, { nullable: true }) startedAt: Date | null;
  @Field(() => Date, { nullable: true }) expiresAt: Date | null;
  @Field(() => Date, { nullable: true }) cancelledAt: Date | null;
  @Field(() => String, { nullable: true }) stripeSubscriptionId: string | null;
  @Field() grantedManually: boolean;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class MembershipsResponse {
  @Field(() => [Membership]) memberships: Membership[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class LessonProgressEntry {
  @Field(() => ID) id: string;
  @Field() lessonId: string;
  @Field(() => Date, { nullable: true }) completedAt: Date | null;
  @Field(() => Int, { nullable: true }) watchTime: number | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class CourseLesson {
  @Field(() => ID) id: string;
  @Field() chapterId: string;
  @Field() courseId: string;
  @Field() title: string;
  @Field() slug: string;
  @Field() type: string;
  @Field(() => String, { nullable: true }) videoUrl: string | null;
  @Field(() => Int, { nullable: true }) duration: number | null;
  @Field(() => Int) position: number;
  @Field() isPublished: boolean;
  @Field() isFreePreview: boolean;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class CourseChapter {
  @Field(() => ID) id: string;
  @Field() courseId: string;
  @Field() title: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Int) position: number;
  @Field() isPublished: boolean;
  @Field(() => [CourseLesson], { nullable: true }) lessons?: CourseLesson[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class Course {
  @Field(() => ID) id: string;
  @Field() title: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => String, { nullable: true }) shortDescription: string | null;
  @Field(() => String, { nullable: true }) thumbnail: string | null;
  @Field(() => Int) price: number;
  @Field() isFree: boolean;
  @Field() isPublished: boolean;
  @Field(() => String, { nullable: true }) requiresMembershipPlanId: string | null;
  @Field(() => MembershipPlan, { nullable: true }) requiredPlan?: MembershipPlan | null;
  @Field() level: string;
  @Field() language: string;
  @Field(() => Int, { nullable: true }) totalDuration: number | null;
  @Field() certificateEnabled: boolean;
  @Field(() => String, { nullable: true }) stripePriceId: string | null;
  @Field(() => [CourseChapter], { nullable: true }) chapters?: CourseChapter[];
  @Field(() => Int, { nullable: true }) enrollmentCount: number | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class CoursesResponse {
  @Field(() => [Course]) courses: Course[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class CourseEnrollment {
  @Field(() => ID) id: string;
  @Field() courseId: string;
  @Field(() => Course, { nullable: true }) course?: Course | null;
  @Field() customerEmail: string;
  @Field() customerName: string;
  @Field() accessGrantedBy: string;
  @Field(() => String, { nullable: true }) membershipId: string | null;
  @Field(() => Date, { nullable: true }) enrolledAt: Date | null;
  @Field(() => Date, { nullable: true }) completedAt: Date | null;
  @Field(() => Int) progress: number;
  @Field(() => String, { nullable: true }) certificateUrl: string | null;
  @Field(() => [LessonProgressEntry], { nullable: true }) lessonProgress?: LessonProgressEntry[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class EnrollmentsResponse {
  @Field(() => [CourseEnrollment]) enrollments: CourseEnrollment[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class CoursesStats {
  @Field(() => Int) totalCourses: number;
  @Field(() => Int) publishedCourses: number;
  @Field(() => Int) totalEnrollments: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Int) totalRevenue: number;
}