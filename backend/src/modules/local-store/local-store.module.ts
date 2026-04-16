import { Module } from '@nestjs/common';
import { LocalStoreResolver } from './local-store.resolver';
import { LocalStoreService } from './local-store.service';
import { DrizzleModule } from '../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [LocalStoreResolver, LocalStoreService],
  exports: [LocalStoreService],
})
export class LocalStoreModule {}
