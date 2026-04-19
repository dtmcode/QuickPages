// 📂 PFAD: backend/src/modules/i18n/i18n-public.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { I18nService } from './i18n.service';

@Controller('api/public/:tenant/i18n')
export class I18nPublicController {
  constructor(private i18nService: I18nService) {}

  /** GET /api/public/:tenant/i18n?locale=en */
  @Get()
  async getTranslations(
    @Param('tenant') slug: string,
    @Query('locale') locale: string,
  ) {
    return this.i18nService.getPublicTranslations(slug, locale || 'de');
  }

  /**
   * GET /api/public/:tenant/i18n/sections?locale=en&ids=uuid1,uuid2,uuid3
   * Gibt alle Section-Content-Übersetzungen für die angegebenen IDs zurück.
   * Response: { [sectionId]: { heading: "...", text: "...", buttonText: "..." } }
   */
  @Get('sections')
   getSectionTranslations(
    @Param('tenant') slug: string,
    @Query('locale') locale: string,
     @Query('ids') ids: string,
    ): Promise<Record<string, Record<string, string>>> {
    const sectionIds = (ids || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!sectionIds.length) return {};
    return this.i18nService.getPublicSectionTranslations(slug, locale || 'de', sectionIds);
  }
}