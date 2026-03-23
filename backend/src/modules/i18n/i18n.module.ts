import { Module } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { I18nResolver } from './i18n.resolver';
import { I18nPublicController } from './i18n-public.controller';

@Module({
  controllers: [I18nPublicController],
  providers: [I18nService, I18nResolver],
  exports: [I18nService],
})
export class I18nModule {}
