// 📂 PFAD: backend/src/modules/payments/platform/platform-payments.module.ts

import { Module } from '@nestjs/common';
import { PlatformPaymentsResolver } from './platform-payments.resolver';
import { PlatformPaymentsService } from './platform-payments.service';
import { DrizzleModule } from '../../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [PlatformPaymentsResolver, PlatformPaymentsService],
  exports: [PlatformPaymentsService],
})
export class PlatformPaymentsModule {}