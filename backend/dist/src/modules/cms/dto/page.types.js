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
exports.UpdatePageInput = exports.CreatePageInput = exports.PagesResponse = exports.Page = exports.PageStatus = exports.PageTemplate = void 0;
const graphql_1 = require("@nestjs/graphql");
var PageTemplate;
(function (PageTemplate) {
    PageTemplate["default"] = "default";
    PageTemplate["landing"] = "landing";
    PageTemplate["contact"] = "contact";
    PageTemplate["about"] = "about";
    PageTemplate["blank"] = "blank";
})(PageTemplate || (exports.PageTemplate = PageTemplate = {}));
(0, graphql_1.registerEnumType)(PageTemplate, { name: 'PageTemplate' });
var PageStatus;
(function (PageStatus) {
    PageStatus["draft"] = "draft";
    PageStatus["published"] = "published";
    PageStatus["archived"] = "archived";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
(0, graphql_1.registerEnumType)(PageStatus, { name: 'PageStatus' });
let Page = class Page {
    id;
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    template;
    status;
    isPublished;
    publishedAt;
    createdAt;
    updatedAt;
};
exports.Page = Page;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Page.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Page.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Page.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageTemplate),
    __metadata("design:type", String)
], Page.prototype, "template", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageStatus),
    __metadata("design:type", String)
], Page.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Page.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Page.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Page.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Page.prototype, "updatedAt", void 0);
exports.Page = Page = __decorate([
    (0, graphql_1.ObjectType)()
], Page);
let PagesResponse = class PagesResponse {
    pages;
    total;
};
exports.PagesResponse = PagesResponse;
__decorate([
    (0, graphql_1.Field)(() => [Page]),
    __metadata("design:type", Array)
], PagesResponse.prototype, "pages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], PagesResponse.prototype, "total", void 0);
exports.PagesResponse = PagesResponse = __decorate([
    (0, graphql_1.ObjectType)()
], PagesResponse);
let CreatePageInput = class CreatePageInput {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    status;
    template;
};
exports.CreatePageInput = CreatePageInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePageInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePageInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePageInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePageInput.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePageInput.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePageInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageStatus, { nullable: true }),
    __metadata("design:type", String)
], CreatePageInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageTemplate, { nullable: true }),
    __metadata("design:type", String)
], CreatePageInput.prototype, "template", void 0);
exports.CreatePageInput = CreatePageInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePageInput);
let UpdatePageInput = class UpdatePageInput {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    status;
    template;
};
exports.UpdatePageInput = UpdatePageInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageStatus, { nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageTemplate, { nullable: true }),
    __metadata("design:type", String)
], UpdatePageInput.prototype, "template", void 0);
exports.UpdatePageInput = UpdatePageInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePageInput);
//# sourceMappingURL=page.types.js.map