// backend\src\modules\funnels\dto\funnels.types.ts

import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum StepType {
  OPTIN    = 'optin',
  SALES    = 'sales',
  UPSELL   = 'upsell',
  DOWNSELL = 'downsell',
  THANKYOU = 'thankyou',
  VIDEO    = 'video',
}
registerEnumType(StepType, { name: 'StepType' });

export enum ConversionGoal {
  EMAIL    = 'email',
  PURCHASE = 'purchase',
  BOOKING  = 'booking',
}
registerEnumType(ConversionGoal, { name: 'ConversionGoal' });

@ObjectType()
export class FunnelStep {
  @Field(() => ID) id: string;
  @Field() funnelId: string;
  @Field() title: string;
  @Field() slug: string;
  @Field() stepType: string;
  @Field(() => Int) position: number;
  @Field() isActive: boolean;
  @Field(() => String, { nullable: true }) nextStepId: string | null;
  @Field(() => Int) views: number;
  @Field(() => Int) conversions: number;
  content: unknown;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class FunnelStepsResponse {
  @Field(() => [FunnelStep]) steps: FunnelStep[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class Funnel {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field() isActive: boolean;
  @Field() isPublished: boolean;
  @Field() conversionGoal: string;
  @Field(() => String, { nullable: true }) utmSource: string | null;
  @Field(() => String, { nullable: true }) utmMedium: string | null;
  @Field(() => String, { nullable: true }) utmCampaign: string | null;
  @Field(() => Int) totalViews: number;
  @Field(() => Int) totalConversions: number;
  @Field(() => [FunnelStep], { nullable: true }) steps?: FunnelStep[];
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
  @Field(() => Date, { nullable: true }) updatedAt: Date | null;
}

@ObjectType()
export class FunnelsResponse {
  @Field(() => [Funnel]) funnels: Funnel[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class FunnelSubmission {
  @Field(() => ID) id: string;
  @Field() funnelId: string;
  @Field(() => String, { nullable: true }) stepId: string | null;
  @Field(() => String, { nullable: true }) customerEmail: string | null;
  @Field(() => String, { nullable: true }) customerName: string | null;
  @Field(() => String, { nullable: true }) utmSource: string | null;
  @Field(() => String, { nullable: true }) utmMedium: string | null;
  @Field(() => String, { nullable: true }) utmCampaign: string | null;
  @Field(() => Date, { nullable: true }) convertedAt: Date | null;
  @Field(() => Date, { nullable: true }) createdAt: Date | null;
}

@ObjectType()
export class FunnelSubmissionsResponse {
  @Field(() => [FunnelSubmission]) submissions: FunnelSubmission[];
  @Field(() => Int) total: number;
}

@ObjectType()
export class FunnelStepAnalytics {
  @Field(() => ID) stepId: string;
  @Field() stepTitle: string;
  @Field() stepType: string;
  @Field(() => Int) position: number;
  @Field(() => Int) views: number;
  @Field(() => Int) conversions: number;
  @Field() conversionRate: string;
  @Field() dropOffRate: string;
}

@ObjectType()
export class FunnelAnalytics {
  @Field(() => ID) funnelId: string;
  @Field() funnelName: string;
  @Field(() => Int) totalViews: number;
  @Field(() => Int) totalConversions: number;
  @Field() overallConversionRate: string;
  @Field(() => [FunnelStepAnalytics]) steps: FunnelStepAnalytics[];
}