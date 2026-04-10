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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = exports.SectionType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const page_entity_1 = require("./page.entity");
var SectionType;
(function (SectionType) {
    SectionType["hero"] = "hero";
    SectionType["features"] = "features";
    SectionType["about"] = "about";
    SectionType["services"] = "services";
    SectionType["gallery"] = "gallery";
    SectionType["testimonials"] = "testimonials";
    SectionType["team"] = "team";
    SectionType["pricing"] = "pricing";
    SectionType["cta"] = "cta";
    SectionType["contact"] = "contact";
    SectionType["faq"] = "faq";
    SectionType["blog"] = "blog";
    SectionType["stats"] = "stats";
    SectionType["video"] = "video";
    SectionType["text"] = "text";
    SectionType["html"] = "html";
    SectionType["custom"] = "custom";
    SectionType["newsletter"] = "newsletter";
    SectionType["booking"] = "booking";
    SectionType["map"] = "map";
    SectionType["countdown"] = "countdown";
    SectionType["social"] = "social";
    SectionType["spacer"] = "spacer";
    SectionType["before_after"] = "before_after";
    SectionType["whatsapp"] = "whatsapp";
    SectionType["freestyle"] = "freestyle";
})(SectionType || (exports.SectionType = SectionType = {}));
(0, graphql_1.registerEnumType)(SectionType, {
    name: 'SectionType',
    description: 'Type of section',
});
let Section = class Section {
    id;
    tenantId;
    pageId;
    name;
    type;
    order;
    isActive;
    content;
    styling;
    page;
    createdAt;
    updatedAt;
};
exports.Section = Section;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Section.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Section.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Section.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => SectionType),
    __metadata("design:type", String)
], Section.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Section.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Section.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], Section.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], Section.prototype, "styling", void 0);
__decorate([
    (0, graphql_1.Field)(() => page_entity_1.Page, { nullable: true }),
    __metadata("design:type", page_entity_1.Page)
], Section.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Section.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Section.prototype, "updatedAt", void 0);
exports.Section = Section = __decorate([
    (0, graphql_1.ObjectType)()
], Section);
//# sourceMappingURL=section.entity.js.map