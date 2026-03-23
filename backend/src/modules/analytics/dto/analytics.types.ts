/**
 * ==================== ANALYTICS GRAPHQL TYPES ====================
 */

import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsOverview {
  @Field(() => Int) totalPageViews: number;
  @Field(() => Int) uniqueVisitors: number;
  @Field(() => Int) totalSessions: number;
  @Field(() => Int) avgDuration: number;
  @Field(() => Float) bounceRate: number;
  @Field(() => Int) ordersCount: number;
  @Field(() => Int) revenue: number;
}

@ObjectType()
export class AnalyticsDailyPoint {
  @Field() date: string;
  @Field(() => Int) pageViews: number;
  @Field(() => Int) uniqueVisitors: number;
  @Field(() => Int) sessions: number;
  @Field(() => Int) revenue: number;
}

@ObjectType()
export class TopPageEntry {
  @Field() path: string;
  @Field(() => Int) views: number;
  @Field(() => Int) uniqueViews: number;
}

@ObjectType()
export class TopReferrerEntry {
  @Field() referrer: string;
  @Field(() => Int) visits: number;
}

@ObjectType()
export class BreakdownEntry {
  @Field() name: string;
  @Field(() => Int) count: number;
}

@ObjectType()
export class AnalyticsBreakdowns {
  @Field(() => [BreakdownEntry]) devices: BreakdownEntry[];
  @Field(() => [BreakdownEntry]) browsers: BreakdownEntry[];
  @Field(() => [BreakdownEntry]) countries: BreakdownEntry[];
}

@ObjectType()
export class AnalyticsDashboardData {
  @Field(() => AnalyticsOverview) overview: AnalyticsOverview;
  @Field(() => [AnalyticsDailyPoint]) dailyStats: AnalyticsDailyPoint[];
  @Field(() => [TopPageEntry]) topPages: TopPageEntry[];
  @Field(() => [TopReferrerEntry]) topReferrers: TopReferrerEntry[];
  @Field(() => AnalyticsBreakdowns) breakdowns: AnalyticsBreakdowns;
  @Field(() => Int) realtimeVisitors: number;
}
