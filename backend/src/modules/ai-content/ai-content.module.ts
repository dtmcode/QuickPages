import { Module } from '@nestjs/common';
import { AiContentService } from './ai-content.service';
import { AiContentResolver } from './ai-content.resolver';

@Module({
  providers: [AiContentService, AiContentResolver],
  exports: [AiContentService],
})
export class AiContentModule {}
