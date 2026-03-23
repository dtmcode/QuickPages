/**
 * ==================== ANALYTICS MODULE ====================
 *
 * ANLEITUNG: Zu app.module.ts hinzufügen:
 *
 * import { ScheduleModule } from '@nestjs/schedule';
 * import { AnalyticsModule } from './modules/analytics/analytics.module';
 *
 * @Module({
 *   imports: [
 *     ScheduleModule.forRoot(),  // ← Für Cron Jobs (Aggregation)
 *     AnalyticsModule,
 *   ],
 * })
 *
 * npm install @nestjs/schedule
 */

import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsTrackingController } from './analytics-tracking.controller';

@Module({
  controllers: [AnalyticsTrackingController],
  providers: [AnalyticsService, AnalyticsResolver],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
