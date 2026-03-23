/**
 * ==================== DOMAIN MODULE ====================
 *
 * ANLEITUNG: Zu app.module.ts hinzufügen:
 *
 * import { DomainModule } from './modules/domain/domain.module';
 *
 * @Module({
 *   imports: [
 *     ScheduleModule.forRoot(),  // Falls nicht schon vorhanden (für Analytics)
 *     DomainModule,
 *   ],
 * })
 */

import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainResolver } from './domain.resolver';
import { DomainController } from './domain.controller';

@Module({
  controllers: [DomainController],
  providers: [DomainService, DomainResolver],
  exports: [DomainService],
})
export class DomainModule {}
