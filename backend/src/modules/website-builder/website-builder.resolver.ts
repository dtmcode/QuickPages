// 📂 PFAD: backend/src/modules/website-builder/website-builder.resolver.ts

/**
 * 🎨 WEBSITE BUILDER RESOLVER
 * GraphQL Resolver
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WebsiteBuilderService } from './website-builder.service';
import { Template } from './entities/template.entity';
import { Page } from './entities/page.entity';
import { Section } from './entities/section.entity';
import { WbGlobalTemplate } from './entities/wb-global-template.entity';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
import { WbGlobalSection } from './entities/wb-global-section.entity';

@Resolver(() => Template)
export class WebsiteBuilderResolver {
  constructor(private readonly service: WebsiteBuilderService) {}

  // ==================== GLOBAL TEMPLATES ====================

  @Query(() => [WbGlobalTemplate], { name: 'wbGlobalTemplates' })
  async getGlobalTemplates(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.service.findAllGlobalTemplates(limit);
  }

  @Query(() => WbGlobalTemplate, { name: 'wbGlobalTemplate', nullable: true })
  async getGlobalTemplate(@Args('id') id: string) {
    return this.service.findOneGlobalTemplate(id);
  }

  @Mutation(() => Template)
  async cloneGlobalTemplate(
    @Args('globalTemplateId') globalTemplateId: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.cloneGlobalTemplate(globalTemplateId, tenantId);
  }

  // ==================== TEMPLATES ====================

  @Query(() => [Template], { name: 'wbTemplates' })
  async getTemplates(@Args('tenantId') tenantId: string) {
    return this.service.findAllTemplates(tenantId);
  }

  @Query(() => Template, { name: 'wbTemplate', nullable: true })
  async getTemplate(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.findOneTemplate(id, tenantId);
  }

  @Query(() => Template, { name: 'wbDefaultTemplate', nullable: true })
  async getDefaultTemplate(@Args('tenantId') tenantId: string) {
    return this.service.findDefaultTemplate(tenantId);
  }

  @Mutation(() => Template)
  async createTemplate(
    @Args('input') input: CreateTemplateInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.createTemplate(tenantId, input);
  }

  @Mutation(() => Template)
  async updateTemplate(
    @Args('id') id: string,
    @Args('input') input: UpdateTemplateInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.updateTemplate(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteTemplate(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.deleteTemplate(id, tenantId);
  }

  @Mutation(() => Template)
  async cloneTemplate(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('newName', { nullable: true }) newName?: string,
  ) {
    return this.service.cloneTemplate(id, tenantId, newName);
  }

  @Mutation(() => Template)
  async setDefaultTemplate(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.setAsDefaultTemplate(id, tenantId);
  }

  // ==================== PAGES ====================

  @Query(() => [Page], { name: 'wbPages' })
  async getPages(
    @Args('tenantId') tenantId: string,
    @Args('templateId', { nullable: true }) templateId?: string,
  ) {
    return this.service.findAllPages(tenantId, templateId);
  }

  @Query(() => Page, { name: 'wbPage', nullable: true })
  async getPage(@Args('id') id: string, @Args('tenantId') tenantId: string) {
    return this.service.findOnePage(id, tenantId);
  }

  @Query(() => Page, { name: 'wbPageBySlug', nullable: true })
  async getPageBySlug(
    @Args('slug') slug: string,
    @Args('tenantId') tenantId: string,
    @Args('templateId', { nullable: true }) templateId?: string,
  ) {
    return this.service.findPageBySlug(slug, tenantId, templateId);
  }

  @Query(() => Page, { name: 'wbHomepage', nullable: true })
  async getHomepage(
    @Args('tenantId') tenantId: string,
    @Args('templateId') templateId: string,
  ) {
    return this.service.findHomepage(tenantId, templateId);
  }

  @Mutation(() => Page)
  async createPage(
    @Args('input') input: CreatePageInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.createPage(tenantId, input);
  }

  @Mutation(() => Page)
  async updatePage(
    @Args('id') id: string,
    @Args('input') input: UpdatePageInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.updatePage(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deletePage(@Args('id') id: string, @Args('tenantId') tenantId: string) {
    return this.service.deletePage(id, tenantId);
  }

  @Mutation(() => Page)
  async reorderSections(
    @Args('pageId') pageId: string,
    @Args('sectionIds', { type: () => [String] }) sectionIds: string[],
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.reorderSections(pageId, tenantId, sectionIds);
  }

  // ==================== SECTIONS ====================

  @Query(() => [Section], { name: 'wbSections' })
  async getSections(
    @Args('tenantId') tenantId: string,
    @Args('pageId', { nullable: true }) pageId?: string,
  ) {
    return this.service.findAllSections(tenantId, pageId);
  }

  @Query(() => Section, { name: 'wbSection', nullable: true })
  async getSection(@Args('id') id: string, @Args('tenantId') tenantId: string) {
    return this.service.findOneSection(id, tenantId);
  }

  @Mutation(() => Section)
  async createSection(
    @Args('input') input: CreateSectionInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.createSection(tenantId, input);
  }

  @Mutation(() => Section)
  async updateSection(
    @Args('id') id: string,
    @Args('input') input: UpdateSectionInput,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.updateSection(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteSection(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.deleteSection(id, tenantId);
  }

  @Mutation(() => Section)
  async duplicateSection(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.duplicateSection(id, tenantId);
  }

  @Mutation(() => Section)
  async toggleSectionVisibility(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.toggleSectionVisibility(id, tenantId);
  }

  @Mutation(() => Section)
  async moveSection(
    @Args('id') id: string,
    @Args('targetPageId') targetPageId: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.moveSection(id, tenantId, targetPageId);
  }
  // ==================== GLOBAL SECTIONS ====================

  @Query(() => [WbGlobalSection], { name: 'wbGlobalSections' })
  async getGlobalSections() {
    return this.service.findAllGlobalSections();
  }

  @Query(() => WbGlobalSection, { name: 'wbGlobalSection', nullable: true })
  async getGlobalSection(@Args('id') id: string) {
    return this.service.findOneGlobalSection(id);
  }

  @Mutation(() => Section)
  async cloneGlobalSection(
    @Args('globalSectionId') globalSectionId: string,
    @Args('pageId') pageId: string,
    @Args('tenantId') tenantId: string,
  ) {
    return this.service.cloneGlobalSection(globalSectionId, pageId, tenantId);
  }
}
