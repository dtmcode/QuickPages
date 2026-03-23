"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteBuilderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const website_builder_service_1 = require("./website-builder.service");
const template_entity_1 = require("./entities/template.entity");
const page_entity_1 = require("./entities/page.entity");
const section_entity_1 = require("./entities/section.entity");
const wb_global_template_entity_1 = require("./entities/wb-global-template.entity");
const create_template_input_1 = require("./dto/create-template.input");
const update_template_input_1 = require("./dto/update-template.input");
const create_page_input_1 = require("./dto/create-page.input");
const update_page_input_1 = require("./dto/update-page.input");
const create_section_input_1 = require("./dto/create-section.input");
const update_section_input_1 = require("./dto/update-section.input");
const wb_global_section_entity_1 = require("./entities/wb-global-section.entity");
let WebsiteBuilderResolver = class WebsiteBuilderResolver {
    service;
    constructor(service) {
        this.service = service;
    }
    async getGlobalTemplates(limit) {
        return this.service.findAllGlobalTemplates(limit);
    }
    async getGlobalTemplate(id) {
        return this.service.findOneGlobalTemplate(id);
    }
    async cloneGlobalTemplate(globalTemplateId, tenantId) {
        return this.service.cloneGlobalTemplate(globalTemplateId, tenantId);
    }
    async getTemplates(tenantId) {
        return this.service.findAllTemplates(tenantId);
    }
    async getTemplate(id, tenantId) {
        return this.service.findOneTemplate(id, tenantId);
    }
    async getDefaultTemplate(tenantId) {
        return this.service.findDefaultTemplate(tenantId);
    }
    async createTemplate(input, tenantId) {
        return this.service.createTemplate(tenantId, input);
    }
    async updateTemplate(id, input, tenantId) {
        return this.service.updateTemplate(id, tenantId, input);
    }
    async deleteTemplate(id, tenantId) {
        return this.service.deleteTemplate(id, tenantId);
    }
    async cloneTemplate(id, tenantId, newName) {
        return this.service.cloneTemplate(id, tenantId, newName);
    }
    async setDefaultTemplate(id, tenantId) {
        return this.service.setAsDefaultTemplate(id, tenantId);
    }
    async getPages(tenantId, templateId) {
        return this.service.findAllPages(tenantId, templateId);
    }
    async getPage(id, tenantId) {
        return this.service.findOnePage(id, tenantId);
    }
    async getPageBySlug(slug, tenantId, templateId) {
        return this.service.findPageBySlug(slug, tenantId, templateId);
    }
    async getHomepage(tenantId, templateId) {
        return this.service.findHomepage(tenantId, templateId);
    }
    async createPage(input, tenantId) {
        return this.service.createPage(tenantId, input);
    }
    async updatePage(id, input, tenantId) {
        return this.service.updatePage(id, tenantId, input);
    }
    async deletePage(id, tenantId) {
        return this.service.deletePage(id, tenantId);
    }
    async reorderSections(pageId, sectionIds, tenantId) {
        return this.service.reorderSections(pageId, tenantId, sectionIds);
    }
    async getSections(tenantId, pageId) {
        return this.service.findAllSections(tenantId, pageId);
    }
    async getSection(id, tenantId) {
        return this.service.findOneSection(id, tenantId);
    }
    async createSection(input, tenantId) {
        return this.service.createSection(tenantId, input);
    }
    async updateSection(id, input, tenantId) {
        return this.service.updateSection(id, tenantId, input);
    }
    async deleteSection(id, tenantId) {
        return this.service.deleteSection(id, tenantId);
    }
    async duplicateSection(id, tenantId) {
        return this.service.duplicateSection(id, tenantId);
    }
    async toggleSectionVisibility(id, tenantId) {
        return this.service.toggleSectionVisibility(id, tenantId);
    }
    async moveSection(id, targetPageId, tenantId) {
        return this.service.moveSection(id, tenantId, targetPageId);
    }
    async getGlobalSections() {
        return this.service.findAllGlobalSections();
    }
    async getGlobalSection(id) {
        return this.service.findOneGlobalSection(id);
    }
    async cloneGlobalSection(globalSectionId, pageId, tenantId) {
        return this.service.cloneGlobalSection(globalSectionId, pageId, tenantId);
    }
};
exports.WebsiteBuilderResolver = WebsiteBuilderResolver;
__decorate([
    (0, graphql_1.Query)(() => [wb_global_template_entity_1.WbGlobalTemplate], { name: 'wbGlobalTemplates' }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getGlobalTemplates", null);
__decorate([
    (0, graphql_1.Query)(() => wb_global_template_entity_1.WbGlobalTemplate, { name: 'wbGlobalTemplate', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getGlobalTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => template_entity_1.Template),
    __param(0, (0, graphql_1.Args)('globalTemplateId')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "cloneGlobalTemplate", null);
__decorate([
    (0, graphql_1.Query)(() => [template_entity_1.Template], { name: 'wbTemplates' }),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getTemplates", null);
__decorate([
    (0, graphql_1.Query)(() => template_entity_1.Template, { name: 'wbTemplate', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getTemplate", null);
__decorate([
    (0, graphql_1.Query)(() => template_entity_1.Template, { name: 'wbDefaultTemplate', nullable: true }),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getDefaultTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => template_entity_1.Template),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_input_1.CreateTemplateInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "createTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => template_entity_1.Template),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_input_1.UpdateTemplateInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "updateTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "deleteTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => template_entity_1.Template),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __param(2, (0, graphql_1.Args)('newName', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "cloneTemplate", null);
__decorate([
    (0, graphql_1.Mutation)(() => template_entity_1.Template),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "setDefaultTemplate", null);
__decorate([
    (0, graphql_1.Query)(() => [page_entity_1.Page], { name: 'wbPages' }),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __param(1, (0, graphql_1.Args)('templateId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getPages", null);
__decorate([
    (0, graphql_1.Query)(() => page_entity_1.Page, { name: 'wbPage', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getPage", null);
__decorate([
    (0, graphql_1.Query)(() => page_entity_1.Page, { name: 'wbPageBySlug', nullable: true }),
    __param(0, (0, graphql_1.Args)('slug')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __param(2, (0, graphql_1.Args)('templateId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getPageBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => page_entity_1.Page, { name: 'wbHomepage', nullable: true }),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __param(1, (0, graphql_1.Args)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getHomepage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_entity_1.Page),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_input_1.CreatePageInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "createPage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_entity_1.Page),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_page_input_1.UpdatePageInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "updatePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "deletePage", null);
__decorate([
    (0, graphql_1.Mutation)(() => page_entity_1.Page),
    __param(0, (0, graphql_1.Args)('pageId')),
    __param(1, (0, graphql_1.Args)('sectionIds', { type: () => [String] })),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "reorderSections", null);
__decorate([
    (0, graphql_1.Query)(() => [section_entity_1.Section], { name: 'wbSections' }),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __param(1, (0, graphql_1.Args)('pageId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getSections", null);
__decorate([
    (0, graphql_1.Query)(() => section_entity_1.Section, { name: 'wbSection', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_section_input_1.CreateSectionInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "createSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_section_input_1.UpdateSectionInput, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "updateSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "deleteSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "duplicateSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "toggleSectionVisibility", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('targetPageId')),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "moveSection", null);
__decorate([
    (0, graphql_1.Query)(() => [wb_global_section_entity_1.WbGlobalSection], { name: 'wbGlobalSections' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getGlobalSections", null);
__decorate([
    (0, graphql_1.Query)(() => wb_global_section_entity_1.WbGlobalSection, { name: 'wbGlobalSection', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "getGlobalSection", null);
__decorate([
    (0, graphql_1.Mutation)(() => section_entity_1.Section),
    __param(0, (0, graphql_1.Args)('globalSectionId')),
    __param(1, (0, graphql_1.Args)('pageId')),
    __param(2, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WebsiteBuilderResolver.prototype, "cloneGlobalSection", null);
exports.WebsiteBuilderResolver = WebsiteBuilderResolver = __decorate([
    (0, graphql_1.Resolver)(() => template_entity_1.Template),
    __metadata("design:paramtypes", [website_builder_service_1.WebsiteBuilderService])
], WebsiteBuilderResolver);
//# sourceMappingURL=website-builder.resolver.js.map