// backend\src\modules\funnels\funnels.module.ts

import { Module } from '@nestjs/common';
import { FunnelsResolver } from './funnels.resolver';
import { FunnelsService } from './funnels.service';
import { DrizzleModule } from '../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [FunnelsResolver, FunnelsService],
  exports: [FunnelsService],
})
export class FunnelsModule {}
