"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPaymentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_2 = require("@nestjs/graphql");
const gql_auth_guard_1 = require("../../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../../core/auth/decorators/tenant-id.decorator");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default-key-change-in-production-32ch';
function encrypt(text) {
    if (!text)
        return '';
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
function maskKey(key) {
    if (!key || key.length < 8)
        return '***';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}
let StripeSettingsType = class StripeSettingsType {
    publishableKey;
    secretKeyMasked;
    webhookSecretMasked;
    isActive;
    mode;
};
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsType.prototype, "publishableKey", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsType.prototype, "secretKeyMasked", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsType.prototype, "webhookSecretMasked", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], StripeSettingsType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], StripeSettingsType.prototype, "mode", void 0);
StripeSettingsType = __decorate([
    (0, graphql_2.ObjectType)()
], StripeSettingsType);
let PaypalSettingsType = class PaypalSettingsType {
    clientId;
    secretMasked;
    isActive;
    mode;
};
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaypalSettingsType.prototype, "clientId", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaypalSettingsType.prototype, "secretMasked", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], PaypalSettingsType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], PaypalSettingsType.prototype, "mode", void 0);
PaypalSettingsType = __decorate([
    (0, graphql_2.ObjectType)()
], PaypalSettingsType);
let BankTransferType = class BankTransferType {
    isActive;
    iban;
    bic;
    accountHolder;
    bankName;
    reference;
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], BankTransferType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferType.prototype, "iban", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferType.prototype, "bic", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferType.prototype, "accountHolder", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferType.prototype, "bankName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferType.prototype, "reference", void 0);
BankTransferType = __decorate([
    (0, graphql_2.ObjectType)()
], BankTransferType);
let TenantPaymentSettingsType = class TenantPaymentSettingsType {
    stripe;
    paypal;
    bankTransfer;
};
__decorate([
    (0, graphql_2.Field)(() => StripeSettingsType, { nullable: true }),
    __metadata("design:type", StripeSettingsType)
], TenantPaymentSettingsType.prototype, "stripe", void 0);
__decorate([
    (0, graphql_2.Field)(() => PaypalSettingsType, { nullable: true }),
    __metadata("design:type", PaypalSettingsType)
], TenantPaymentSettingsType.prototype, "paypal", void 0);
__decorate([
    (0, graphql_2.Field)(() => BankTransferType, { nullable: true }),
    __metadata("design:type", BankTransferType)
], TenantPaymentSettingsType.prototype, "bankTransfer", void 0);
TenantPaymentSettingsType = __decorate([
    (0, graphql_2.ObjectType)()
], TenantPaymentSettingsType);
let PaymentUpdateResult = class PaymentUpdateResult {
    isActive;
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", Boolean)
], PaymentUpdateResult.prototype, "isActive", void 0);
PaymentUpdateResult = __decorate([
    (0, graphql_2.ObjectType)()
], PaymentUpdateResult);
let StripeSettingsInput = class StripeSettingsInput {
    publishableKey;
    secretKey;
    webhookSecret;
    mode;
};
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsInput.prototype, "publishableKey", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsInput.prototype, "secretKey", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsInput.prototype, "webhookSecret", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], StripeSettingsInput.prototype, "mode", void 0);
StripeSettingsInput = __decorate([
    (0, graphql_2.InputType)()
], StripeSettingsInput);
let PaypalSettingsInput = class PaypalSettingsInput {
    clientId;
    secret;
    mode;
};
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaypalSettingsInput.prototype, "clientId", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaypalSettingsInput.prototype, "secret", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaypalSettingsInput.prototype, "mode", void 0);
PaypalSettingsInput = __decorate([
    (0, graphql_2.InputType)()
], PaypalSettingsInput);
let BankTransferInput = class BankTransferInput {
    iban;
    bic;
    accountHolder;
    bankName;
    reference;
};
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferInput.prototype, "iban", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferInput.prototype, "bic", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferInput.prototype, "accountHolder", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferInput.prototype, "bankName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], BankTransferInput.prototype, "reference", void 0);
BankTransferInput = __decorate([
    (0, graphql_2.InputType)()
], BankTransferInput);
let TenantPaymentsResolver = class TenantPaymentsResolver {
    db;
    constructor(db) {
        this.db = db;
    }
    async paymentSettings(tenantId) {
        const [settings] = await this.db
            .select()
            .from(schema_1.tenantPaymentSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId))
            .limit(1);
        if (!settings) {
            return {
                stripe: { isActive: false, mode: 'test' },
                paypal: { isActive: false, mode: 'sandbox' },
                bankTransfer: { isActive: false },
            };
        }
        return {
            stripe: {
                publishableKey: settings.stripePublishableKey ?? undefined,
                secretKeyMasked: settings.stripeSecretKeyEncrypted
                    ? maskKey(settings.stripeSecretKeyEncrypted)
                    : undefined,
                webhookSecretMasked: settings.stripeWebhookSecretEncrypted
                    ? maskKey(settings.stripeWebhookSecretEncrypted)
                    : undefined,
                isActive: settings.stripeActive ?? false,
                mode: settings.stripeMode ?? 'test',
            },
            paypal: {
                clientId: settings.paypalClientId ?? undefined,
                secretMasked: settings.paypalSecretEncrypted
                    ? maskKey(settings.paypalSecretEncrypted)
                    : undefined,
                isActive: settings.paypalActive ?? false,
                mode: settings.paypalMode ?? 'sandbox',
            },
            bankTransfer: {
                isActive: settings.bankActive ?? false,
                iban: settings.bankIban ?? undefined,
                bic: settings.bankBic ?? undefined,
                accountHolder: settings.bankAccountHolder ?? undefined,
                bankName: settings.bankName ?? undefined,
                reference: settings.bankReference ?? undefined,
            },
        };
    }
    async updateStripeSettings(input, tenantId) {
        const existing = await this.db
            .select({ id: schema_1.tenantPaymentSettings.id })
            .from(schema_1.tenantPaymentSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId))
            .limit(1);
        const updateData = {
            updatedAt: new Date(),
            stripeActive: true,
            stripeMode: input.mode ?? 'test',
        };
        if (input.publishableKey) {
            updateData.stripePublishableKey = input.publishableKey;
        }
        if (input.secretKey) {
            updateData.stripeSecretKeyEncrypted = encrypt(input.secretKey);
        }
        if (input.webhookSecret) {
            updateData.stripeWebhookSecretEncrypted = encrypt(input.webhookSecret);
        }
        if (existing.length > 0) {
            await this.db
                .update(schema_1.tenantPaymentSettings)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId));
        }
        else {
            await this.db
                .insert(schema_1.tenantPaymentSettings)
                .values({ tenantId, ...updateData });
        }
        return { isActive: true };
    }
    async updatePaypalSettings(input, tenantId) {
        const existing = await this.db
            .select({ id: schema_1.tenantPaymentSettings.id })
            .from(schema_1.tenantPaymentSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId))
            .limit(1);
        const updateData = {
            updatedAt: new Date(),
            paypalActive: true,
            paypalMode: input.mode ?? 'sandbox',
        };
        if (input.clientId) {
            updateData.paypalClientId = input.clientId;
        }
        if (input.secret) {
            updateData.paypalSecretEncrypted = encrypt(input.secret);
        }
        if (existing.length > 0) {
            await this.db
                .update(schema_1.tenantPaymentSettings)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId));
        }
        else {
            await this.db
                .insert(schema_1.tenantPaymentSettings)
                .values({ tenantId, ...updateData });
        }
        return { isActive: true };
    }
    async updateBankTransferSettings(input, tenantId) {
        const existing = await this.db
            .select({ id: schema_1.tenantPaymentSettings.id })
            .from(schema_1.tenantPaymentSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId))
            .limit(1);
        const updateData = {
            updatedAt: new Date(),
            bankActive: true,
            bankIban: input.iban,
            bankBic: input.bic,
            bankAccountHolder: input.accountHolder,
            bankName: input.bankName,
            bankReference: input.reference,
        };
        if (existing.length > 0) {
            await this.db
                .update(schema_1.tenantPaymentSettings)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.tenantPaymentSettings.tenantId, tenantId));
        }
        else {
            await this.db
                .insert(schema_1.tenantPaymentSettings)
                .values({ tenantId, ...updateData });
        }
        return { isActive: true };
    }
};
exports.TenantPaymentsResolver = TenantPaymentsResolver;
__decorate([
    (0, graphql_1.Query)(() => TenantPaymentSettingsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantPaymentsResolver.prototype, "paymentSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => PaymentUpdateResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StripeSettingsInput, String]),
    __metadata("design:returntype", Promise)
], TenantPaymentsResolver.prototype, "updateStripeSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => PaymentUpdateResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaypalSettingsInput, String]),
    __metadata("design:returntype", Promise)
], TenantPaymentsResolver.prototype, "updatePaypalSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => PaymentUpdateResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BankTransferInput, String]),
    __metadata("design:returntype", Promise)
], TenantPaymentsResolver.prototype, "updateBankTransferSettings", null);
exports.TenantPaymentsResolver = TenantPaymentsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], TenantPaymentsResolver);
//# sourceMappingURL=tenant-payments.resolver.js.map