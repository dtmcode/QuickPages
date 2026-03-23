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
exports.EmailSettingsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const email_crypto_service_1 = require("./email-crypto.service");
let EmailSettingsService = class EmailSettingsService {
    db;
    cryptoService;
    constructor(db, cryptoService) {
        this.db = db;
        this.cryptoService = cryptoService;
    }
    async getSettings(tenantId) {
        const [settings] = await this.db
            .select()
            .from(schema_1.tenantEmailSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantEmailSettings.tenantId, tenantId))
            .limit(1);
        if (!settings) {
            return null;
        }
        return {
            ...settings,
            smtpPassword: settings.smtpPassword
                ? this.cryptoService.decrypt(settings.smtpPassword)
                : null,
        };
    }
    async upsertSettings(tenantId, input) {
        const existing = await this.getSettings(tenantId);
        const encryptedPassword = input.smtpPassword
            ? this.cryptoService.encrypt(input.smtpPassword)
            : existing?.smtpPassword;
        const data = {
            tenantId,
            provider: input.provider,
            smtpHost: input.smtpHost,
            smtpPort: input.smtpPort || 587,
            smtpSecure: input.smtpSecure || false,
            smtpUser: input.smtpUser,
            smtpPassword: encryptedPassword,
            fromEmail: input.fromEmail,
            fromName: input.fromName,
            replyTo: input.replyTo,
            isEnabled: true,
            isVerified: false,
            updatedAt: new Date(),
        };
        if (existing) {
            await this.db
                .update(schema_1.tenantEmailSettings)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_1.tenantEmailSettings.tenantId, tenantId));
        }
        else {
            await this.db.insert(schema_1.tenantEmailSettings).values(data);
        }
        return this.getSettings(tenantId);
    }
    async deleteSettings(tenantId) {
        await this.db
            .delete(schema_1.tenantEmailSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantEmailSettings.tenantId, tenantId));
    }
    async testConnection(tenantId) {
        const settings = await this.getSettings(tenantId);
        if (!settings) {
            return { success: false, error: 'Keine Email-Einstellungen gefunden' };
        }
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host: settings.smtpHost,
                port: settings.smtpPort,
                secure: settings.smtpSecure,
                auth: {
                    user: settings.smtpUser,
                    pass: settings.smtpPassword,
                },
            });
            await transporter.verify();
            await this.db
                .update(schema_1.tenantEmailSettings)
                .set({
                isVerified: true,
                lastTestedAt: new Date(),
                errorCount: 0,
                lastError: null,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tenantEmailSettings.tenantId, tenantId));
            return { success: true };
        }
        catch (error) {
            await this.db
                .update(schema_1.tenantEmailSettings)
                .set({
                isVerified: false,
                lastError: error.message,
                errorCount: (settings.errorCount || 0) + 1,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tenantEmailSettings.tenantId, tenantId));
            return { success: false, error: error.message };
        }
    }
};
exports.EmailSettingsService = EmailSettingsService;
exports.EmailSettingsService = EmailSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, email_crypto_service_1.EmailCryptoService])
], EmailSettingsService);
//# sourceMappingURL=email-settings.service.js.map