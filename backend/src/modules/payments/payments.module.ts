import { Module } from '@nestjs/common';
import { TenantPaymentsModule } from './tenant/tenant-payments.module';
import { PlatformPaymentsModule } from './platform/platform-payments.module';

@Module({
  imports: [TenantPaymentsModule, PlatformPaymentsModule],
  exports: [TenantPaymentsModule, PlatformPaymentsModule],
})
export class PaymentsModule {}
