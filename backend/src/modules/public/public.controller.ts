// 📂 PFAD: backend/src/modules/public/public.controller.ts

import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PublicService } from './public.service';

interface TenantSettings {
  defaultTemplateId?: string;
  modules?: Record<string, boolean>;
  limits?: Record<string, number>;
  [key: string]: unknown;
}

@Controller('api/public/:tenant')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // ==================== TENANT ====================
  @Get('settings')
  async getTenantSettings(@Param('tenant') tenantSlug: string) {
    return this.publicService.getTenantSettings(tenantSlug);
  }

  // ==================== CMS PAGES ====================
  @Get('pages')
  async getPages(@Param('tenant') tenantSlug: string) {
    return this.publicService.getPublishedPages(tenantSlug);
  }

  @Get('pages/:slug')
  async getPage(
    @Param('tenant') tenantSlug: string,
    @Param('slug') pageSlug: string,
  ) {
    return this.publicService.getPageBySlug(tenantSlug, pageSlug);
  }

  // ==================== NAVIGATION ====================
  @Get('navigation/:location')
  async getNavigation(
    @Param('tenant') tenantSlug: string,
    @Param('location') location: string,
  ) {
    return this.publicService.getNavigation(tenantSlug, location);
  }

  // ==================== SHOP ====================
  @Get('products')
  async getProducts(@Param('tenant') tenantSlug: string) {
    return this.publicService.getProducts(tenantSlug);
  }

  @Get('products/:slug')
  async getProduct(
    @Param('tenant') tenantSlug: string,
    @Param('slug') productSlug: string,
  ) {
    return this.publicService.getProductBySlug(tenantSlug, productSlug);
  }

  // ==================== BLOG ====================
  @Get('posts')
  async getPosts(@Param('tenant') tenantSlug: string) {
    return this.publicService.getPublishedPosts(tenantSlug);
  }

  @Get('posts/:slug')
  async getPost(
    @Param('tenant') tenantSlug: string,
    @Param('slug') postSlug: string,
  ) {
    return this.publicService.getPostBySlug(tenantSlug, postSlug);
  }

  // ==================== CATEGORIES ====================
  @Get('categories')
  async getCategories(@Param('tenant') tenantSlug: string) {
    return this.publicService.getCategories(tenantSlug);
  }

  // ==================== WEBSITE BUILDER ====================
  @Get('wb/homepage')
  async getWbHomepage(@Param('tenant') tenantSlug: string) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);

    if (!templateId) {
      throw new NotFoundException('No default template found');
    }

    return this.publicService.getWbHomepage(tenantSlug, templateId);
  }

  @Get('wb/pages')
  async getWbPages(@Param('tenant') tenantSlug: string) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);

    if (!templateId) {
      return [];
    }

    return this.publicService.getPublishedWbPages(tenantSlug, templateId);
  }

  @Get('wb/pages/:slug')
  async getWbPage(
    @Param('tenant') tenantSlug: string,
    @Param('slug') pageSlug: string,
  ) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);

    if (!templateId) {
      throw new NotFoundException('No default template found');
    }

    return this.publicService.getWbPageBySlug(tenantSlug, templateId, pageSlug);
  }

  // ==================== HELPER ====================
  private async getDefaultTemplateId(
    tenantSlug: string,
  ): Promise<string | null> {
    try {
      const tenant = await this.publicService.getTenantSettings(tenantSlug);

      // ✅ FIX: Proper type instead of 'as any'
      const settings = tenant.settings as TenantSettings | null;

      if (settings?.defaultTemplateId) {
        return settings.defaultTemplateId;
      }

      return await this.publicService.getDefaultTemplateId(tenantSlug);
    } catch {
      return null;
    }
  }
}
