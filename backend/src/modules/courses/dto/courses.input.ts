// backend\src\modules\courses\dto\courses.input.ts

import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// ─── Membership Plan ──────────────────────────────────────────────────────────

@InputType()
export class CreateMembershipPlanInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) price: number; // in Cent
  @Field({ nullable: true }) interval?: string; // monthly | yearly | lifetime
  @Field(() => [String], { nullable: true }) features?: string[];
  @Field({ nullable: true }) isPublic?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdateMembershipPlanInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field({ nullable: true }) interval?: string;
  @Field(() => [String], { nullable: true }) features?: string[];
  @Field({ nullable: true }) isActive?: boolean;
  @Field({ nullable: true }) isPublic?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) stripePriceId?: string;
}

// ─── Membership ───────────────────────────────────────────────────────────────

@InputType()
export class GrantMembershipInput {
  @Field() customerEmail: string;
  @Field() customerName: string;
  @Field({ nullable: true }) planId?: string;
  @Field({ nullable: true }) expiresAt?: Date;
}

@InputType()
export class UpdateMembershipStatusInput {
  // active | cancelled | expired | trial | paused
  @Field() status: string;
}

// ─── Course ───────────────────────────────────────────────────────────────────

@InputType()
export class CreateCourseInput {
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) shortDescription?: string;
  @Field({ nullable: true }) thumbnail?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field({ nullable: true }) isFree?: boolean;
  @Field({ nullable: true }) requiresMembershipPlanId?: string;
  @Field({ nullable: true }) level?: string; // beginner | intermediate | advanced
  @Field({ nullable: true }) language?: string;
  @Field({ nullable: true }) certificateEnabled?: boolean;
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) shortDescription?: string;
  @Field({ nullable: true }) thumbnail?: string;
  @Field(() => Int, { nullable: true }) price?: number;
  @Field({ nullable: true }) isFree?: boolean;
  @Field({ nullable: true }) isPublished?: boolean;
  @Field({ nullable: true }) requiresMembershipPlanId?: string;
  @Field({ nullable: true }) level?: string;
  @Field({ nullable: true }) language?: string;
  @Field({ nullable: true }) certificateEnabled?: boolean;
  @Field({ nullable: true }) stripePriceId?: string;
}

// ─── Chapter ──────────────────────────────────────────────────────────────────

@InputType()
export class CreateChapterInput {
  @Field() courseId: string;
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdateChapterInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) isPublished?: boolean;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

@InputType()
export class CreateLessonInput {
  @Field() chapterId: string;
  @Field() courseId: string;
  @Field() title: string;
  @Field({ nullable: true }) type?: string; // video | text | pdf | quiz
  @Field({ nullable: true }) videoUrl?: string;
  @Field(() => Int, { nullable: true }) duration?: number;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) isFreePreview?: boolean;
  @Field(() => GraphQLJSON, { nullable: true }) content?: any;
}

@InputType()
export class UpdateLessonInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) videoUrl?: string;
  @Field(() => Int, { nullable: true }) duration?: number;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) isPublished?: boolean;
  @Field({ nullable: true }) isFreePreview?: boolean;
  @Field(() => GraphQLJSON, { nullable: true }) content?: any;
}

// ─── Enrollment (Public) ──────────────────────────────────────────────────────

@InputType()
export class EnrollCourseInput {
  @Field() courseId: string;
  @Field() customerEmail: string;
  @Field() customerName: string;
  // Wenn Mitglied: membershipId mitschicken → Zugang ohne Bezahlung
  @Field({ nullable: true }) membershipId?: string;
  // Stripe payment intent nach Bezahlung
  @Field({ nullable: true }) stripePaymentIntentId?: string;
}

// ─── Progress (Public) ────────────────────────────────────────────────────────

@InputType()
export class TrackLessonProgressInput {
  @Field() enrollmentId: string;
  @Field() lessonId: string;
  @Field({ nullable: true }) completed?: boolean;
  @Field(() => Int, { nullable: true }) watchTime?: number;
}
