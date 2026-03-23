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
exports.SeoMetaInput = exports.SeoMeta = void 0;
const graphql_1 = require("@nestjs/graphql");
let SeoMeta = class SeoMeta {
    id;
    metaTitle;
    metaDescription;
    metaKeywords;
    ogTitle;
    ogDescription;
    ogImage;
    canonicalUrl;
    noindex;
    nofollow;
};
exports.SeoMeta = SeoMeta;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SeoMeta.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "ogTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "ogDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "ogImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMeta.prototype, "canonicalUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SeoMeta.prototype, "noindex", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SeoMeta.prototype, "nofollow", void 0);
exports.SeoMeta = SeoMeta = __decorate([
    (0, graphql_1.ObjectType)()
], SeoMeta);
let SeoMetaInput = class SeoMetaInput {
    metaTitle;
    metaDescription;
    metaKeywords;
    ogTitle;
    ogDescription;
    ogImage;
    canonicalUrl;
    noindex;
    nofollow;
};
exports.SeoMetaInput = SeoMetaInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "ogTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "ogDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "ogImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeoMetaInput.prototype, "canonicalUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], SeoMetaInput.prototype, "noindex", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], SeoMetaInput.prototype, "nofollow", void 0);
exports.SeoMetaInput = SeoMetaInput = __decorate([
    (0, graphql_1.InputType)()
], SeoMetaInput);
//# sourceMappingURL=seo.types.js.map