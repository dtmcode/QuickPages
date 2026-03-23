/**
 * ==================== ANALYTICS RESOLVER ====================
 * GraphQL API für das Analytics-Dashboard
 */

import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsOverview,
  AnalyticsDailyPoint,
  TopPageEntry,
  TopReferrerEntry,
  AnalyticsBreakdowns,
  AnalyticsDashboardData,
} from './dto/analytics.types';

@Resolver()
export class AnalyticsResolver {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Komplett-Abfrage: Alles was das Dashboard braucht in einem Request
   */
  @Query(() => AnalyticsDashboardData)
  @UseGuards(GqlAuthGuard)
  async analyticsDashboard(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @TenantId() tenantId: string,
  ): Promise<AnalyticsDashboardData> {
    // Validierung
    this.validateDateRange(startDate, endDate);

    // Alles parallel laden
    const [
      overview,
      dailyStats,
      topPages,
      topReferrers,
      breakdowns,
      realtimeVisitors,
    ] = await Promise.all([
      this.analyticsService.getOverview(tenantId, startDate, endDate),
      this.analyticsService.getDailyStats(tenantId, startDate, endDate),
      this.analyticsService.getTopPages(tenantId, startDate, endDate, 10),
      this.analyticsService.getTopReferrers(tenantId, startDate, endDate, 10),
      this.analyticsService.getBreakdowns(tenantId, startDate, endDate),
      this.analyticsService.getRealtimeVisitors(tenantId),
    ]);

    return {
      overview,
      dailyStats,
      topPages,
      topReferrers,
      breakdowns,
      realtimeVisitors,
    };
  }

  // ===== Einzelne Queries (für granulare Abfragen) =====

  @Query(() => AnalyticsOverview)
  @UseGuards(GqlAuthGuard)
  async analyticsOverview(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @TenantId() tenantId: string,
  ): Promise<AnalyticsOverview> {
    this.validateDateRange(startDate, endDate);
    return this.analyticsService.getOverview(tenantId, startDate, endDate);
  }

  @Query(() => [AnalyticsDailyPoint])
  @UseGuards(GqlAuthGuard)
  async analyticsDailyStats(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @TenantId() tenantId: string,
  ): Promise<AnalyticsDailyPoint[]> {
    this.validateDateRange(startDate, endDate);
    return this.analyticsService.getDailyStats(tenantId, startDate, endDate);
  }

  @Query(() => [TopPageEntry])
  @UseGuards(GqlAuthGuard)
  async analyticsTopPages(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @TenantId() tenantId: string,
  ): Promise<TopPageEntry[]> {
    this.validateDateRange(startDate, endDate);
    return this.analyticsService.getTopPages(
      tenantId,
      startDate,
      endDate,
      limit,
    );
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async analyticsRealtimeVisitors(
    @TenantId() tenantId: string,
  ): Promise<number> {
    return this.analyticsService.getRealtimeVisitors(tenantId);
  }

  // ===== HELPER =====

  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Ungültiges Datumsformat. Nutze YYYY-MM-DD.');
    }

    if (start > end) {
      throw new Error('startDate muss vor endDate liegen');
    }

    // Max 365 Tage
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      throw new Error('Maximaler Zeitraum: 365 Tage');
    }
  }
}
