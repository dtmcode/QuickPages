// ==================== i18n-public.controller.ts ====================
import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nService } from './i18n.service';

@Controller('api/public/:tenant/i18n')
export class I18nPublicController {
  constructor(private i18nService: I18nService) {}

  /** GET /api/public/:tenant/i18n?locale=en — UI Translations für Sprache */
  @Get()
  async getTranslations(
    @Param('tenant') slug: string,
    @Query('locale') locale: string,
  ) {
    return this.i18nService.getPublicTranslations(slug, locale || 'de');
  }
}
