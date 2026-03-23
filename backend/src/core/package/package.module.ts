import { Module } from '@nestjs/common';
import { PackageGuard } from './guards/package.guard';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';

@Module({
  providers: [PackageGuard, SubscriptionService, SubscriptionResolver],
  exports: [PackageGuard, SubscriptionService],
})
export class PackageModule {}
