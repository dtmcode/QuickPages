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
exports.I18nResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const i18n_service_1 = require("./i18n.service");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let LocaleSettingsType = class LocaleSettingsType {
    defaultLocale;
    enabledLocales;
    supportedLocales;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LocaleSettingsType.prototype, "defaultLocale", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], LocaleSettingsType.prototype, "enabledLocales", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], LocaleSettingsType.prototype, "supportedLocales", void 0);
LocaleSettingsType = __decorate([
    (0, graphql_1.ObjectType)()
], LocaleSettingsType);
let TranslationType = class TranslationType {
    entityType;
    entityId;
    locale;
    field;
    value;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TranslationType.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TranslationType.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TranslationType.prototype, "locale", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TranslationType.prototype, "field", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TranslationType.prototype, "value", void 0);
TranslationType = __decorate([
    (0, graphql_1.ObjectType)()
], TranslationType);
let I18nResolver = class I18nResolver {
    i18nService;
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    async localeSettings(tid) {
        return this.i18nService.getLocaleSettings(tid);
    }
    async updateLocaleSettings(dl, el, tid) {
        return this.i18nService.updateLocaleSettings(tid, dl, el);
    }
    async translations(et, eid, locale, tid) {
        const rows = await this.i18nService.getTranslations(tid, et, eid, locale);
        return rows.map((r) => ({
            entityType: r.entity_type,
            entityId: r.entity_id,
            locale: r.locale,
            field: r.field,
            value: r.value,
        }));
    }
    async setTranslation(et, eid, locale, field, value, tid) {
        return this.i18nService.setTranslation(tid, et, eid, locale, field, value);
    }
    async setTranslationsBatch(et, eid, locale, translations, tid) {
        return this.i18nService.setTranslationsBatch(tid, et, eid, locale, translations);
    }
    async deleteTranslations(et, eid, locale, tid) {
        return this.i18nService.deleteTranslations(tid, et, eid, locale);
    }
    async uiTranslations(locale, tid) {
        return this.i18nService.getUiTranslations(tid, locale);
    }
    async allUiTranslations(tid) {
        return this.i18nService.getAllUiTranslations(tid);
    }
    async setUiTranslation(locale, key, value, tid) {
        return this.i18nService.setUiTranslation(tid, locale, key, value);
    }
};
exports.I18nResolver = I18nResolver;
__decorate([
    (0, graphql_1.Query)(() => LocaleSettingsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "localeSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('defaultLocale')),
    __param(1, (0, graphql_1.Args)({ name: 'enabledLocales', type: () => [String] })),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "updateLocaleSettings", null);
__decorate([
    (0, graphql_1.Query)(() => [TranslationType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Args)('locale', { nullable: true })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "translations", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Args)('locale')),
    __param(3, (0, graphql_1.Args)('field')),
    __param(4, (0, graphql_1.Args)('value')),
    __param(5, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "setTranslation", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Args)('locale')),
    __param(3, (0, graphql_1.Args)({ name: 'translations', type: () => graphql_type_json_1.default })),
    __param(4, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "setTranslationsBatch", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('entityType')),
    __param(1, (0, graphql_1.Args)('entityId')),
    __param(2, (0, graphql_1.Args)('locale', { nullable: true })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "deleteTranslations", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('locale')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "uiTranslations", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "allUiTranslations", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('locale')),
    __param(1, (0, graphql_1.Args)('key')),
    __param(2, (0, graphql_1.Args)('value')),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], I18nResolver.prototype, "setUiTranslation", null);
exports.I18nResolver = I18nResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [i18n_service_1.I18nService])
], I18nResolver);
//# sourceMappingURL=i18n.resolver.js.map