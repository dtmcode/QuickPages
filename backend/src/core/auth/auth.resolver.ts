// 📂 PFAD: backend/src/core/auth/auth.resolver.ts

import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  CurrentUserResponse,
  SuccessResponse,
} from './dto/auth.types';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './dto/auth.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { TenantId } from './decorators/tenant-id.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import { users, tenants } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  UserRole,
  PackageType,
  UpdateBrandingInput,
  BrandingResult,
} from './dto/auth.types';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  // ==================== PUBLIC QUERIES ====================

  @Query(() => String)
  hello(): string {
    return 'Hello from GraphQL API!';
  }

  // ==================== PUBLIC MUTATIONS ====================

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return await this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return await this.authService.login(input);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ): Promise<AuthResponse> {
    return await this.authService.refreshToken(input.refreshToken);
  }

  // ✅ NEU: Passwort vergessen
  @Mutation(() => SuccessResponse)
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<SuccessResponse> {
    return await this.authService.forgotPassword(input);
  }

  // ✅ NEU: Passwort zurücksetzen
  @Mutation(() => SuccessResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<SuccessResponse> {
    return await this.authService.resetPassword(input);
  }
  @Mutation(() => SuccessResponse)
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
  ): Promise<SuccessResponse> {
    return await this.authService.verifyEmail(input);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard)
  async resendVerificationEmail(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<SuccessResponse> {
    return await this.authService.resendVerificationEmail(currentUser.userId);
  }
  // ==================== PROTECTED QUERIES ====================

  @Query(() => CurrentUserResponse)
  @UseGuards(GqlAuthGuard)
  async me(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<CurrentUserResponse> {
    const result = await this.db
      .select({ user: users, tenant: tenants })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User nicht gefunden');
    }

    const { user, tenant } = result[0];

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
        shopTemplate: tenant.shopTemplate ?? undefined,
        isActive: tenant.isActive ?? true,
        createdAt: tenant.createdAt ?? new Date(),
      },
    };
  }

  @Query(() => CurrentUserResponse)
  @UseGuards(GqlAuthGuard)
  async currentTenant(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<CurrentUserResponse> {
    const result = await this.db
      .select({ user: users, tenant: tenants })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (result.length === 0) {
      throw new Error('Tenant nicht gefunden');
    }

    const { user, tenant } = result[0];

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
        shopTemplate: tenant.shopTemplate ?? undefined,
        isActive: tenant.isActive ?? true,
        createdAt: tenant.createdAt ?? new Date(),
      },
    };
  }

  // ==================== PROTECTED MUTATIONS ====================

  @Mutation(() => CurrentUserResponse)
  @UseGuards(GqlAuthGuard)
  async updateShopTemplate(
    @Args('template') template: string,
    @TenantId() tenantId: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<CurrentUserResponse> {
    if (currentUser.role !== 'owner') {
      throw new Error('Nur der Owner kann das Shop-Template ändern');
    }

    await this.db
      .update(tenants)
      .set({
        shopTemplate: template as any,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    const result = await this.db
      .select({ user: users, tenant: tenants })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (result.length === 0) {
      throw new Error('Tenant nicht gefunden');
    }

    const { user, tenant } = result[0];

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
        shopTemplate: tenant.shopTemplate ?? undefined,
        isActive: tenant.isActive ?? true,
        createdAt: tenant.createdAt ?? new Date(),
      },
    };
  }
  @Mutation(() => BrandingResult)
  @UseGuards(GqlAuthGuard)
  async updateBranding(
    @Args('input') input: UpdateBrandingInput,
    @TenantId() tenantId: string,
  ): Promise<BrandingResult> {
    const current = await this.db
      .select({ branding: tenants.branding })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const existingBranding =
      (current[0]?.branding as Record<string, unknown>) ?? {};

    await this.db
      .update(tenants)
      .set({
        branding: {
          ...existingBranding,
          ...(input.primaryColor && { primaryColor: input.primaryColor }),
          ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
          ...(input.platformName && { platformName: input.platformName }),
        },
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    return {
      primaryColor: input.primaryColor,
      logoUrl: input.logoUrl ?? undefined,
    };
  }
}
