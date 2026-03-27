import { Module } from '@nestjs/common';
import { TenantPaymentsResolver } from './tenant-payments.resolver';
import { TenantPaymentsService } from './tenant-payments.service';

@Module({
  providers: [TenantPaymentsResolver, TenantPaymentsService],
  exports: [TenantPaymentsService],
})
export class TenantPaymentsModule {}