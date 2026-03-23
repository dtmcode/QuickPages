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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormBuilderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const form_builder_service_1 = require("./form-builder.service");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let FormType = class FormType {
    id;
    name;
    slug;
    description;
    fields;
    settings;
    submitButtonText;
    successMessage;
    redirectUrl;
    notificationEmail;
    isActive;
    submissionsCount;
    createdAt;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FormType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], FormType.prototype, "fields", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], FormType.prototype, "settings", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormType.prototype, "submitButtonText", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormType.prototype, "successMessage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FormType.prototype, "redirectUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FormType.prototype, "notificationEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FormType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FormType.prototype, "submissionsCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], FormType.prototype, "createdAt", void 0);
FormType = __decorate([
    (0, graphql_1.ObjectType)()
], FormType);
let FormSubmissionType = class FormSubmissionType {
    id;
    formId;
    data;
    isRead;
    isStarred;
    notes;
    createdAt;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormSubmissionType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FormSubmissionType.prototype, "formId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], FormSubmissionType.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FormSubmissionType.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], FormSubmissionType.prototype, "isStarred", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], FormSubmissionType.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], FormSubmissionType.prototype, "createdAt", void 0);
FormSubmissionType = __decorate([
    (0, graphql_1.ObjectType)()
], FormSubmissionType);
let CreateFormInput = class CreateFormInput {
    name;
    description;
    fields;
    settings;
    submitButtonText;
    successMessage;
    redirectUrl;
    notificationEmail;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateFormInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], CreateFormInput.prototype, "fields", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateFormInput.prototype, "settings", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "submitButtonText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "successMessage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "redirectUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateFormInput.prototype, "notificationEmail", void 0);
CreateFormInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFormInput);
let FormBuilderResolver = class FormBuilderResolver {
    formService;
    constructor(formService) {
        this.formService = formService;
    }
    async forms(tid) {
        const rows = await this.formService.getForms(tid);
        return rows.map((r) => this.mapForm(r));
    }
    async form(id, tid) {
        const r = await this.formService.getForm(tid, id);
        return r ? this.mapForm(r) : null;
    }
    async createForm(input, tid) {
        return this.mapForm(await this.formService.createForm(tid, input));
    }
    async updateForm(id, input, tid) {
        return this.mapForm(await this.formService.updateForm(tid, id, input));
    }
    async deleteForm(id, tid) {
        return this.formService.deleteForm(tid, id);
    }
    async formSubmissions(formId, tid) {
        const rows = await this.formService.getSubmissions(tid, formId);
        return rows.map((r) => ({
            id: r.id,
            formId: r.form_id,
            data: r.data,
            isRead: r.is_read,
            isStarred: r.is_starred,
            notes: r.notes,
            createdAt: r.created_at,
        }));
    }
    async markSubmissionRead(id, read, tid) {
        return this.formService.markRead(tid, id, read);
    }
    async deleteSubmission(id, tid) {
        return this.formService.deleteSubmission(tid, id);
    }
    mapForm(r) {
        return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            fields: r.fields,
            settings: r.settings,
            submitButtonText: r.submit_button_text,
            successMessage: r.success_message,
            redirectUrl: r.redirect_url,
            notificationEmail: r.notification_email,
            isActive: r.is_active,
            submissionsCount: r.submissions_count,
            createdAt: r.created_at,
        };
    }
};
exports.FormBuilderResolver = FormBuilderResolver;
__decorate([
    (0, graphql_1.Query)(() => [FormType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "forms", null);
__decorate([
    (0, graphql_1.Query)(() => FormType, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "form", null);
__decorate([
    (0, graphql_1.Mutation)(() => FormType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateFormInput, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "createForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => FormType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateFormInput, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "updateForm", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "deleteForm", null);
__decorate([
    (0, graphql_1.Query)(() => [FormSubmissionType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('formId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "formSubmissions", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('read')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "markSubmissionRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FormBuilderResolver.prototype, "deleteSubmission", null);
exports.FormBuilderResolver = FormBuilderResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [form_builder_service_1.FormBuilderService])
], FormBuilderResolver);
//# sourceMappingURL=form-builder.resolver.js.map