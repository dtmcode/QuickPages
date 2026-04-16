// backend\src\modules\coupons\coupons.module.ts

import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsResolver } from './coupons.resolver';
import { DrizzleModule } from '../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [CouponsService, CouponsResolver],
  exports: [CouponsService], // damit Shop/Restaurant/LocalStore es importieren können
})
export class CouponsModule {}
