//backend\src\core\package\guards\package.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { REQUIRE_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { hasFeature, PackageType } from '../package.helper';

import { DRIZZLE } from '../../database/drizzle.module';
import { Inject } from '@nestjs/common';
import type { DrizzleDB } from '../../database/drizzle.module';
import { tenants } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

const SUPERADMIN_SLUGS = ['myquickpages', 'platform-admin'];

@Injectable()
export class PackageGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) return true;

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const tenantId = request.user?.tenantId;

    if (!tenantId) throw new Error('Tenant ID nicht gefunden');

    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) throw new Error('Tenant nicht gefunden');

    // ===== SUPER-ADMIN BYPASS =====
    if (SUPERADMIN_SLUGS.includes(tenant.slug)) return true;

    const settings = tenant.settings as Record<string, unknown> | null;
    if (settings?.isSuperAdmin === true || settings?.platformAdmin === true)
      return true;
    // ===== END BYPASS =====

    // Coupons implizit erlauben wenn transaktionale Module aktiv sind
    if (requiredFeature === 'coupons') {
      const f = tenant.package as PackageType;
      const implicitCoupons =
        hasFeature(f, 'shop') ||
        hasFeature(f, 'restaurant') ||
        hasFeature(f, 'localStore') ||
        hasFeature(f, 'courses');
      if (implicitCoupons) return true;
    }

    const hasAccess = hasFeature(
      tenant.package as PackageType,
      requiredFeature as any,
    );

    if (!hasAccess) {
      throw new Error(
        `Diese Funktion ist in deinem ${tenant.package.toUpperCase()} Package nicht verfügbar.`,
      );
    }
    return true;
  }
}
