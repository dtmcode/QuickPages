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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const drizzle_module_1 = require("../database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const email_service_1 = require("../email/email.service");
const website_builder_service_1 = require("../../modules/website-builder/website-builder.service");
let AuthService = class AuthService {
    db;
    jwtService;
    configService;
    emailService;
    websiteBuilderService;
    constructor(db, jwtService, configService, emailService, websiteBuilderService) {
        this.db = db;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.websiteBuilderService = websiteBuilderService;
    }
    async register(input) {
        const result = await this.db.transaction(async (tx) => {
            const existingUser = await tx
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email))
                .limit(1);
            if (existingUser.length > 0) {
                throw new common_1.ConflictException('E-Mail bereits registriert');
            }
            const baseSlug = input.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const existingSlug = await tx
                .select()
                .from(schema_1.tenants)
                .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, baseSlug))
                .limit(1);
            if (existingSlug.length > 0) {
                const suggestion = `${baseSlug}-${Math.random().toString(36).substr(2, 4)}`;
                throw new common_1.ConflictException(`Die Subdomain "${baseSlug}" ist bereits vergeben. Alternativ: "${suggestion}"`);
            }
            const [tenant] = await tx
                .insert(schema_1.tenants)
                .values({
                name: input.companyName,
                slug: baseSlug,
                package: 'page',
            })
                .returning();
            const passwordHash = await bcrypt.hash(input.password, 10);
            const [user] = await tx
                .insert(schema_1.users)
                .values({
                tenantId: tenant.id,
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                role: 'owner',
            })
                .returning();
            await tx.insert(schema_1.auditLogs).values({
                tenantId: tenant.id,
                userId: user.id,
                action: 'REGISTER',
                resource: 'AUTH',
            });
            const tokens = await this.generateTokens(tx, user.id, tenant.id, user.role);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName ?? undefined,
                    lastName: user.lastName ?? undefined,
                    role: user.role,
                    isActive: user.isActive ?? true,
                    emailVerified: user.emailVerified ?? false,
                    lastLoginAt: user.lastLoginAt ?? undefined,
                    createdAt: user.createdAt ?? new Date(),
                },
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    slug: tenant.slug,
                    domain: tenant.domain ?? undefined,
                    package: tenant.package,
                    isActive: tenant.isActive ?? true,
                    createdAt: tenant.createdAt ?? new Date(),
                },
                ...tokens,
            };
        });
        try {
            await this.websiteBuilderService.createDefaultTemplate(result.tenant.id, result.tenant.name, result.tenant.package);
            console.log(`✅ Default template created for tenant: ${result.tenant.id}`);
        }
        catch (error) {
            console.error('⚠️ Failed to create default template:', error instanceof Error ? error.message : error);
        }
        try {
            await this.sendVerificationEmail(result.user.id, result.user.email, result.user.firstName);
        }
        catch (error) {
            console.error('⚠️ Failed to send verification email:', error instanceof Error ? error.message : error);
        }
        return result;
    }
    async login(input) {
        const result = await this.db
            .select({ user: schema_1.users, tenant: schema_1.tenants })
            .from(schema_1.users)
            .innerJoin(schema_1.tenants, (0, drizzle_orm_1.eq)(schema_1.users.tenantId, schema_1.tenants.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.email, input.email), (0, drizzle_orm_1.eq)(schema_1.users.isActive, true), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        }
        const { user, tenant } = result[0];
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        }
        await this.db
            .update(schema_1.users)
            .set({ lastLoginAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        const tokens = await this.generateTokens(this.db, user.id, tenant.id, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                role: user.role,
                isActive: user.isActive ?? true,
                emailVerified: user.emailVerified ?? false,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: user.createdAt ?? new Date(),
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain ?? undefined,
                package: tenant.package,
                isActive: tenant.isActive ?? true,
                createdAt: tenant.createdAt ?? new Date(),
            },
            ...tokens,
        };
    }
    async refreshToken(token) {
        const storedToken = await this.db
            .select()
            .from(schema_1.refreshTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.token, token))
            .limit(1);
        if (storedToken.length === 0 || storedToken[0].expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Ungültiges Refresh Token');
        }
        const result = await this.db
            .select({ user: schema_1.users, tenant: schema_1.tenants })
            .from(schema_1.users)
            .innerJoin(schema_1.tenants, (0, drizzle_orm_1.eq)(schema_1.users.tenantId, schema_1.tenants.id))
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, storedToken[0].userId))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.UnauthorizedException('User nicht gefunden');
        }
        const { user, tenant } = result[0];
        await this.db
            .delete(schema_1.refreshTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.id, storedToken[0].id));
        const tokens = await this.generateTokens(this.db, user.id, tenant.id, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                role: user.role,
                isActive: user.isActive ?? true,
                emailVerified: user.emailVerified ?? false,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: user.createdAt ?? new Date(),
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain ?? undefined,
                package: tenant.package,
                isActive: tenant.isActive ?? true,
                createdAt: tenant.createdAt ?? new Date(),
            },
            ...tokens,
        };
    }
    async forgotPassword(input) {
        const result = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email))
            .limit(1);
        if (result.length === 0) {
            console.log(`⚠️ Password reset requested for unknown email: ${input.email}`);
            return {
                success: true,
                message: 'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
            };
        }
        const user = result[0];
        await this.db
            .update(schema_1.passwordResetTokens)
            .set({ used: true, usedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.userId, user.id), (0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.used, false)));
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.db.insert(schema_1.passwordResetTokens).values({
            userId: user.id,
            token,
            expiresAt,
        });
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        try {
            await this.emailService.sendPasswordReset({
                firstName: user.firstName || 'Nutzer',
                email: user.email,
                resetUrl,
            });
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
        }
        return {
            success: true,
            message: 'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
        };
    }
    async resetPassword(input) {
        const tokenResult = await this.db
            .select()
            .from(schema_1.passwordResetTokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.token, input.token), (0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.used, false)))
            .limit(1);
        if (tokenResult.length === 0) {
            throw new common_1.BadRequestException('Ungültiger oder bereits verwendeter Reset-Link.');
        }
        const resetToken = tokenResult[0];
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.');
        }
        const passwordHash = await bcrypt.hash(input.newPassword, 10);
        await this.db
            .update(schema_1.users)
            .set({
            passwordHash,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, resetToken.userId));
        await this.db
            .update(schema_1.passwordResetTokens)
            .set({ used: true, usedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.passwordResetTokens.id, resetToken.id));
        const user = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, resetToken.userId))
            .limit(1);
        if (user.length > 0) {
            await this.db.insert(schema_1.auditLogs).values({
                tenantId: user[0].tenantId,
                userId: user[0].id,
                action: 'PASSWORD_RESET',
                resource: 'AUTH',
            });
        }
        return {
            success: true,
            message: 'Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.',
        };
    }
    async generateTokens(db, userId, tenantId, role) {
        const payload = { userId, tenantId, role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = (0, crypto_1.randomUUID)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await db.insert(schema_1.refreshTokens).values({
            userId,
            token: refreshToken,
            expiresAt,
        });
        return { accessToken, refreshToken };
    }
    async sendVerificationEmail(userId, email, firstName) {
        await this.db
            .update(schema_1.emailVerificationTokens)
            .set({ used: true, usedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.used, false)));
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await this.db
            .insert(schema_1.emailVerificationTokens)
            .values({ userId, token, expiresAt });
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
        const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
        await this.emailService.sendVerificationEmail({
            firstName: firstName ?? 'Nutzer',
            email,
            verifyUrl,
        });
    }
    async verifyEmail(input) {
        const [tokenResult] = await this.db
            .select()
            .from(schema_1.emailVerificationTokens)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.token, input.token), (0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.used, false)))
            .limit(1);
        if (!tokenResult)
            throw new common_1.BadRequestException('Ungültiger oder bereits verwendeter Verifizierungs-Link.');
        if (tokenResult.expiresAt < new Date())
            throw new common_1.BadRequestException('Der Link ist abgelaufen.');
        await this.db
            .update(schema_1.users)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, tokenResult.userId));
        await this.db
            .update(schema_1.emailVerificationTokens)
            .set({ used: true, usedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.id, tokenResult.id));
        return {
            success: true,
            message: 'Deine E-Mail-Adresse wurde erfolgreich bestätigt.',
        };
    }
    async resendVerificationEmail(userId) {
        const [user] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .limit(1);
        if (!user)
            throw new common_1.BadRequestException('User nicht gefunden.');
        if (user.emailVerified)
            return { success: true, message: 'E-Mail ist bereits verifiziert.' };
        await this.sendVerificationEmail(user.id, user.email, user.firstName ?? undefined);
        return {
            success: true,
            message: 'Verifizierungs-Email wurde erneut gesendet.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        website_builder_service_1.WebsiteBuilderService])
], AuthService);
//# sourceMappingURL=auth.service.js.map