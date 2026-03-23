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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WbGlobalTemplateSection = exports.WbGlobalTemplatePage = exports.WbGlobalTemplate = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let WbGlobalTemplate = class WbGlobalTemplate {
    id;
    name;
    description;
    thumbnailUrl;
    category;
    isActive;
    isPremium;
    settings;
    previewUrl;
    demoUrl;
    createdAt;
    updatedAt;
};
exports.WbGlobalTemplate = WbGlobalTemplate;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], WbGlobalTemplate.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], WbGlobalTemplate.prototype, "isPremium", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], WbGlobalTemplate.prototype, "settings", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "previewUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplate.prototype, "demoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplate.prototype, "updatedAt", void 0);
exports.WbGlobalTemplate = WbGlobalTemplate = __decorate([
    (0, graphql_1.ObjectType)()
], WbGlobalTemplate);
let WbGlobalTemplatePage = class WbGlobalTemplatePage {
    id;
    templateId;
    name;
    slug;
    description;
    isHomepage;
    order;
    createdAt;
    updatedAt;
};
exports.WbGlobalTemplatePage = WbGlobalTemplatePage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], WbGlobalTemplatePage.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplatePage.prototype, "templateId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplatePage.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplatePage.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WbGlobalTemplatePage.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], WbGlobalTemplatePage.prototype, "isHomepage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], WbGlobalTemplatePage.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplatePage.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplatePage.prototype, "updatedAt", void 0);
exports.WbGlobalTemplatePage = WbGlobalTemplatePage = __decorate([
    (0, graphql_1.ObjectType)()
], WbGlobalTemplatePage);
let WbGlobalTemplateSection = class WbGlobalTemplateSection {
    id;
    pageId;
    name;
    type;
    order;
    content;
    styling;
    createdAt;
    updatedAt;
};
exports.WbGlobalTemplateSection = WbGlobalTemplateSection;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], WbGlobalTemplateSection.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplateSection.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplateSection.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], WbGlobalTemplateSection.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], WbGlobalTemplateSection.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    __metadata("design:type", Object)
], WbGlobalTemplateSection.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], WbGlobalTemplateSection.prototype, "styling", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplateSection.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], WbGlobalTemplateSection.prototype, "updatedAt", void 0);
exports.WbGlobalTemplateSection = WbGlobalTemplateSection = __decorate([
    (0, graphql_1.ObjectType)()
], WbGlobalTemplateSection);
//# sourceMappingURL=wb-global-template.entity.js.map