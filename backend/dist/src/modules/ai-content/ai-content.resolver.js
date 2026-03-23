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
exports.AiContentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const ai_content_service_1 = require("./ai-content.service");
let AiResultType = class AiResultType {
    content;
    title;
    excerpt;
    metaTitle;
    metaDescription;
    tags;
    tokensUsed;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AiResultType.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiResultType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiResultType.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiResultType.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiResultType.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AiResultType.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AiResultType.prototype, "tokensUsed", void 0);
AiResultType = __decorate([
    (0, graphql_1.ObjectType)()
], AiResultType);
let AiGenerateInput = class AiGenerateInput {
    type;
    prompt;
    context;
    keywords;
    tone;
    language;
    maxLength;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AiGenerateInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiGenerateInput.prototype, "prompt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiGenerateInput.prototype, "context", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AiGenerateInput.prototype, "keywords", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiGenerateInput.prototype, "tone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AiGenerateInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AiGenerateInput.prototype, "maxLength", void 0);
AiGenerateInput = __decorate([
    (0, graphql_1.InputType)()
], AiGenerateInput);
let AiContentResolver = class AiContentResolver {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async aiGenerate(input, tid) {
        return this.aiService.generate(tid, input);
    }
    async aiSuggest(type, input, count, tid) {
        return this.aiService.suggest(tid, type, input, count);
    }
    async aiImprove(content, instruction, tid) {
        return this.aiService.improve(tid, content, instruction);
    }
    async aiTranslate(content, lang, tid) {
        return this.aiService.translateContent(tid, content, lang);
    }
};
exports.AiContentResolver = AiContentResolver;
__decorate([
    (0, graphql_1.Mutation)(() => AiResultType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AiGenerateInput, String]),
    __metadata("design:returntype", Promise)
], AiContentResolver.prototype, "aiGenerate", null);
__decorate([
    (0, graphql_1.Mutation)(() => [String]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('type')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Args)('count', { defaultValue: 5 })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], AiContentResolver.prototype, "aiSuggest", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('content')),
    __param(1, (0, graphql_1.Args)('instruction')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AiContentResolver.prototype, "aiImprove", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('content')),
    __param(1, (0, graphql_1.Args)('targetLanguage')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AiContentResolver.prototype, "aiTranslate", null);
exports.AiContentResolver = AiContentResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [ai_content_service_1.AiContentService])
], AiContentResolver);
//# sourceMappingURL=ai-content.resolver.js.map