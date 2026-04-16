// backend\src\modules\funnels\dto\funnels.input.ts

import { InputType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// ─── Funnel ───────────────────────────────────────────────────────────────────

@InputType()
export class CreateFunnelInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) conversionGoal?: string; // email | purchase | booking
  @Field({ nullable: true }) utmSource?: string;
  @Field({ nullable: true }) utmMedium?: string;
  @Field({ nullable: true }) utmCampaign?: string;
}

@InputType()
export class UpdateFunnelInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) conversionGoal?: string;
  @Field({ nullable: true }) isActive?: boolean;
  @Field({ nullable: true }) isPublished?: boolean;
  @Field({ nullable: true }) utmSource?: string;
  @Field({ nullable: true }) utmMedium?: string;
  @Field({ nullable: true }) utmCampaign?: string;
}

// ─── Funnel Step ──────────────────────────────────────────────────────────────

@InputType()
export class CreateFunnelStepInput {
  @Field() funnelId: string;
  @Field() title: string;
  // optin | sales | upsell | downsell | thankyou | video
  @Field() stepType: string;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) nextStepId?: string;
}

@InputType()
export class UpdateFunnelStepInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) stepType?: string;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field({ nullable: true }) isActive?: boolean;
  @Field({ nullable: true }) nextStepId?: string;
}

@InputType()
export class UpdateFunnelStepContentInput {
  // Sections als JSON — gleiche Struktur wie Website Builder
  @Field(() => GraphQLJSON) content: any;
}

// ─── Submission (Public) ──────────────────────────────────────────────────────

@InputType()
export class CreateFunnelSubmissionInput {
  @Field() funnelId: string;
  @Field({ nullable: true }) stepId?: string;
  @Field({ nullable: true }) customerEmail?: string;
  @Field({ nullable: true }) customerName?: string;
  @Field(() => GraphQLJSON, { nullable: true }) data?: any;
  @Field({ nullable: true }) utmSource?: string;
  @Field({ nullable: true }) utmMedium?: string;
  @Field({ nullable: true }) utmCampaign?: string;
}

// ─── Track (Public) ──────────────────────────────────────────────────────────

@InputType()
export class TrackFunnelEventInput {
  @Field() funnelId: string;
  @Field({ nullable: true }) stepId?: string;
  // view | conversion
  @Field() eventType: string;
}
