import { Module } from '@nestjs/common';
import { PlatformPaymentsResolver } from './platform-payments.resolver';

@Module({
  providers: [PlatformPaymentsResolver],
  exports: [PlatformPaymentsResolver],
})
export class PlatformPaymentsModule {}