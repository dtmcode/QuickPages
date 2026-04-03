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
exports.TenantPaymentsService = void 0;
const common_1 = require("@nestjs/common");
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
    return `${iv.toString('hex')}:${encrypted}`;
}
function maskKey(key) {
    if (!key || key.length < 8)
        return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}
let TenantPaymentsService = class TenantPaymentsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPaymentSettings(tenantId) {
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
    async updateStripeSettings(tenantId, input) {
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
    async updatePaypalSettings(tenantId, input) {
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
        if (input.clientId)
            updateData.paypalClientId = input.clientId;
        if (input.secret)
            updateData.paypalSecretEncrypted = encrypt(input.secret);
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
    async updateBankTransferSettings(tenantId, input) {
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
exports.TenantPaymentsService = TenantPaymentsService;
exports.TenantPaymentsService = TenantPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], TenantPaymentsService);
//# sourceMappingURL=tenant-payments.service.js.map