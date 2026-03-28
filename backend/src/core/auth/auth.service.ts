// 📂 PFAD: backend/src/core/auth/auth.service.ts

import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import {
  users,
  tenants,
  refreshTokens,
  passwordResetTokens,
  emailVerificationTokens,
  auditLogs,
} from '../../drizzle/schema';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  VerifyEmailInput,
  ResetPasswordInput,
} from './dto/auth.input';
import { UserRole, PackageType } from './dto/auth.types';
import { EmailService } from '../email/email.service';
import { WebsiteBuilderService } from '../../modules/website-builder/website-builder.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private websiteBuilderService: WebsiteBuilderService,
  ) {}

  // ==================== REGISTER ====================

  async register(input: RegisterInput) {
    const result = await this.db.transaction(async (tx) => {
      const existingUser = await tx
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictException('E-Mail bereits registriert');
      }

      const baseSlug = input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const existingSlug = await tx
        .select()
        .from(tenants)
        .where(eq(tenants.slug, baseSlug))
        .limit(1);

      if (existingSlug.length > 0) {
        const suggestion = `${baseSlug}-${Math.random().toString(36).substr(2, 4)}`;
        throw new ConflictException(
          `Die Subdomain "${baseSlug}" ist bereits vergeben. Alternativ: "${suggestion}"`,
        );
      }

      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: input.companyName,
          slug: baseSlug,
          package: 'page',
        })
        .returning();

      const passwordHash = await bcrypt.hash(input.password, 10);
      const [user] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: 'owner',
        })
        .returning();

      await tx.insert(auditLogs).values({
        tenantId: tenant.id,
        userId: user.id,
        action: 'REGISTER',
        resource: 'AUTH',
      });

      const tokens = await this.generateTokens(
        tx,
        user.id,
        tenant.id,
        user.role,
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          role: user.role as UserRole,
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
          package: tenant.package as PackageType,
          isActive: tenant.isActive ?? true,
          createdAt: tenant.createdAt ?? new Date(),
        },
        ...tokens,
      };
    });
    try {
      await this.websiteBuilderService.createDefaultTemplate(
        result.tenant.id,
        result.tenant.name,
        result.tenant.package,
      );
      console.log(
        `✅ Default template created for tenant: ${result.tenant.id}`,
      );
    } catch (error: unknown) {
      console.error(
        '⚠️ Failed to create default template:',
        error instanceof Error ? error.message : error,
      );
    }
    // ✅ Verifikations-Email senden
    try {
      await this.sendVerificationEmail(
        result.user.id,
        result.user.email,
        result.user.firstName,
      );
    } catch (error: unknown) {
      console.error(
        '⚠️ Failed to send verification email:',
        error instanceof Error ? error.message : error,
      );
    }

    return result;
  }

  // ==================== LOGIN ====================

  async login(input: LoginInput) {
    const result = await this.db
      .select({ user: users, tenant: tenants })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(
        and(
          eq(users.email, input.email),
          eq(users.isActive, true),
          eq(tenants.isActive, true),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    const { user, tenant } = result[0];

    const isValid = await bcrypt.compare(input.password, user.passwordHash!);
    if (!isValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const tokens = await this.generateTokens(
      this.db,
      user.id,
      tenant.id,
      user.role,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        role: user.role as UserRole,
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
        package: tenant.package as PackageType,
        isActive: tenant.isActive ?? true,
        createdAt: tenant.createdAt ?? new Date(),
      },
      ...tokens,
    };
  }

  // ==================== REFRESH TOKEN ====================

  async refreshToken(token: string) {
    const storedToken = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);

    if (storedToken.length === 0 || storedToken[0].expiresAt < new Date()) {
      throw new UnauthorizedException('Ungültiges Refresh Token');
    }

    const result = await this.db
      .select({ user: users, tenant: tenants })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, storedToken[0].userId))
      .limit(1);

    if (result.length === 0) {
      throw new UnauthorizedException('User nicht gefunden');
    }

    const { user, tenant } = result[0];

    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, storedToken[0].id));

    const tokens = await this.generateTokens(
      this.db,
      user.id,
      tenant.id,
      user.role,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        role: user.role as UserRole,
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
        package: tenant.package as PackageType,
        isActive: tenant.isActive ?? true,
        createdAt: tenant.createdAt ?? new Date(),
      },
      ...tokens,
    };
  }

  // ==================== FORGOT PASSWORD ✅ NEU ====================

  async forgotPassword(input: ForgotPasswordInput) {
    // 🔒 Immer Erfolg zurückgeben — auch wenn Email nicht existiert (Sicherheit!)
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (result.length === 0) {
      // Kein Fehler werfen! Verhindert User-Enumeration
      console.log(
        `⚠️ Password reset requested for unknown email: ${input.email}`,
      );
      return {
        success: true,
        message:
          'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
      };
    }

    const user = result[0];

    // Altes Token invalidieren (falls vorhanden)
    await this.db
      .update(passwordResetTokens)
      .set({ used: true, usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false),
        ),
      );

    // Neues Token generieren
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 Stunde gültig

    await this.db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Reset-URL bauen
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // Email senden
    try {
      await this.emailService.sendPasswordReset({
        firstName: user.firstName || 'Nutzer',
        email: user.email,
        resetUrl,
      });
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      // Trotzdem Erfolg zurückgeben — Email-Fehler nicht leaken
    }

    return {
      success: true,
      message:
        'Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.',
    };
  }

  // ==================== RESET PASSWORD ✅ NEU ====================

  async resetPassword(input: ResetPasswordInput) {
    // Token prüfen
    const tokenResult = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, input.token),
          eq(passwordResetTokens.used, false),
        ),
      )
      .limit(1);

    if (tokenResult.length === 0) {
      throw new BadRequestException(
        'Ungültiger oder bereits verwendeter Reset-Link.',
      );
    }

    const resetToken = tokenResult[0];

    // Ablauf prüfen
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException(
        'Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.',
      );
    }

    // Passwort hashen & aktualisieren
    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    // Token als verwendet markieren
    await this.db
      .update(passwordResetTokens)
      .set({ used: true, usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Audit Log
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, resetToken.userId))
      .limit(1);

    if (user.length > 0) {
      await this.db.insert(auditLogs).values({
        tenantId: user[0].tenantId,
        userId: user[0].id,
        action: 'PASSWORD_RESET',
        resource: 'AUTH',
      });
    }

    return {
      success: true,
      message:
        'Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.',
    };
  }

  // ==================== HELPER ====================

  private async generateTokens(
    db: DrizzleDB | Parameters<Parameters<DrizzleDB['transaction']>[0]>[0],
    userId: string,
    tenantId: string,
    role: string,
  ) {
    const payload = { userId, tenantId, role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
  async sendVerificationEmail(
    userId: string,
    email: string,
    firstName?: string,
  ) {
    await this.db
      .update(emailVerificationTokens)
      .set({ used: true, usedAt: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          eq(emailVerificationTokens.used, false),
        ),
      );

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await this.db
      .insert(emailVerificationTokens)
      .values({ userId, token, expiresAt });

    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    await this.emailService.sendVerificationEmail({
      firstName: firstName ?? 'Nutzer',
      email,
      verifyUrl,
    });
  }

  async verifyEmail(input: VerifyEmailInput) {
    const [tokenResult] = await this.db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, input.token),
          eq(emailVerificationTokens.used, false),
        ),
      )
      .limit(1);

    if (!tokenResult)
      throw new BadRequestException(
        'Ungültiger oder bereits verwendeter Verifizierungs-Link.',
      );
    if (tokenResult.expiresAt < new Date())
      throw new BadRequestException('Der Link ist abgelaufen.');

    await this.db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, tokenResult.userId));
    await this.db
      .update(emailVerificationTokens)
      .set({ used: true, usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, tokenResult.id));

    return {
      success: true,
      message: 'Deine E-Mail-Adresse wurde erfolgreich bestätigt.',
    };
  }

  async resendVerificationEmail(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new BadRequestException('User nicht gefunden.');
    if (user.emailVerified)
      return { success: true, message: 'E-Mail ist bereits verifiziert.' };
    await this.sendVerificationEmail(
      user.id,
      user.email,
      user.firstName ?? undefined,
    );
    return {
      success: true,
      message: 'Verifizierungs-Email wurde erneut gesendet.',
    };
  }
}
