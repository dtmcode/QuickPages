import { Module } from '@nestjs/common';
import { WhiteLabelService } from './white-label.service';
import { WhiteLabelResolver } from './white-label.resolver';

@Module({
  providers: [WhiteLabelService, WhiteLabelResolver],
  exports: [WhiteLabelService],
})
export class WhiteLabelModule {}