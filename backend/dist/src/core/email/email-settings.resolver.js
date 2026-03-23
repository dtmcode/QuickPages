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
exports.EmailSettingsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const email_settings_service_1 = require("./email-settings.service");
const email_service_1 = require("./email.service");
const email_settings_types_1 = require("./dto/email-settings.types");
let EmailSettingsResolver = class EmailSettingsResolver {
    emailSettingsService;
    emailService;
    constructor(emailSettingsService, emailService) {
        this.emailSettingsService = emailSettingsService;
        this.emailService = emailService;
    }
    async emailSettings(tenantId) {
        return this.emailSettingsService.getSettings(tenantId);
    }
    async updateEmailSettings(input, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Email-Einstellungen ändern');
        }
        return this.emailSettingsService.upsertSettings(tenantId, input);
    }
    async deleteEmailSettings(tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Email-Einstellungen löschen');
        }
        await this.emailSettingsService.deleteSettings(tenantId);
        return true;
    }
    async testEmailSettings(testTo, tenantId, user) {
        if (user.role !== 'owner') {
            throw new Error('Nur der Owner kann Email-Einstellungen testen');
        }
        const settings = await this.emailSettingsService.getSettings(tenantId);
        if (settings) {
            const testResult = await this.emailSettingsService.testConnection(tenantId);
            if (!testResult.success) {
                return testResult;
            }
        }
        return this.emailService.sendTestEmail(tenantId, testTo);
    }
};
exports.EmailSettingsResolver = EmailSettingsResolver;
__decorate([
    (0, graphql_1.Query)(() => email_settings_types_1.EmailSettings, { nullable: true }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailSettingsResolver.prototype, "emailSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_settings_types_1.EmailSettings),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_settings_types_1.EmailSettingsInput, String, Object]),
    __metadata("design:returntype", Promise)
], EmailSettingsResolver.prototype, "updateEmailSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailSettingsResolver.prototype, "deleteEmailSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => email_settings_types_1.TestEmailResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('testTo')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailSettingsResolver.prototype, "testEmailSettings", null);
exports.EmailSettingsResolver = EmailSettingsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [email_settings_service_1.EmailSettingsService,
        email_service_1.EmailService])
], EmailSettingsResolver);
//# sourceMappingURL=email-settings.resolver.js.map