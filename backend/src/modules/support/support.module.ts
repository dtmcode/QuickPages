import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportResolver } from './support.resolver';
import { SupportPublicController } from './support-public.controller';

@Module({
  controllers: [SupportPublicController],
  providers: [SupportService, SupportResolver],
  exports: [SupportService],
})
export class SupportModule {}
