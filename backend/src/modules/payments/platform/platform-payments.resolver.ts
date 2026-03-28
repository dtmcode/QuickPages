// 📂 PFAD: backend/src/modules/payments/platform/platform-payments.resolver.ts

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { ObjectType, Field } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../../core/auth/strategies/jwt.strategy';
import { PlatformPaymentsService } from './platform-payments.service';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { tenants, users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

// ==================== TYPES ====================

@ObjectType()
class PlatformPaymentStatus {
  @Field()
  stripeConfigured: boolean;

  @Field()
  message: string;
}

@ObjectType()
class CheckoutSessionResult {
  @Field()
  url: string;

  @Field()
  isDirect: boolean;
}

// ==================== RESOLVER ====================

@Resolver()
export class PlatformPaymentsResolver {
  constructor(
    private readonly platformPaymentsService: PlatformPaymentsService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  // ===== STATUS =====

  @Query(() => PlatformPaymentStatus)
  @UseGuards(GqlAuthGuard)
  async platformPaymentStatus(
    @TenantId() _tenantId: string,
  ): Promise<PlatformPaymentStatus> {
    const configured = this.platformPaymentsService.isStripeConfigured();
    return {
      stripeConfigured: configured,
      message: configured
        ? 'Stripe ist aktiv und konfiguriert.'
        : 'Stripe-Integration in Vorbereitung. Bitte STRIPE_SECRET_KEY in .env setzen.',
    };
  }

  // ===== PAKET WECHSELN → Stripe Checkout oder direkt =====

  @Mutation(() => CheckoutSessionResult)
  @UseGuards(GqlAuthGuard)
  async changePackage(
    @Args('targetPackage') targetPackage: string,
    @Args('successUrl', { nullable: true, defaultValue: '' })
    successUrl: string,
    @Args('cancelUrl', { nullable: true, defaultValue: '' }) cancelUrl: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CheckoutSessionResult> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann das Paket ändern');

    // User Email holen
    const [dbUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    const email = dbUser?.email || '';

    const result = await this.platformPaymentsService.createPackageCheckout({
      tenantId,
      targetPackage,
      userEmail: email,
      successUrl:
        successUrl ||
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/packages?success=true&package=${targetPackage}`,
      cancelUrl:
        cancelUrl ||
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/packages?cancelled=true`,
    });

    return result;
  }

  // ===== ADD-ON KAUFEN → Stripe Checkout oder direkt =====

  @Mutation(() => CheckoutSessionResult)
  @UseGuards(GqlAuthGuard)
  async createAddonCheckout(
    @Args('addonType') addonType: string,
    @Args('successUrl', { nullable: true, defaultValue: '' })
    successUrl: string,
    @Args('cancelUrl', { nullable: true, defaultValue: '' }) cancelUrl: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CheckoutSessionResult> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann Add-ons kaufen');

    const [dbUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, user.sub))
      .limit(1);

    const result = await this.platformPaymentsService.createAddonCheckout({
      tenantId,
      addonType,
      userEmail: dbUser?.email || '',
      successUrl:
        successUrl ||
        `${process.env.FRONTEND_URL}/dashboard/packages?addon_success=true&addon=${addonType}`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/dashboard/packages`,
    });

    return result;
  }

  // ===== BILLING PORTAL (Rechnungen, Zahlungsmethode) =====

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async createBillingPortalSession(
    @Args('returnUrl') returnUrl: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<string> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann das Billing Portal öffnen');
    return this.platformPaymentsService.createBillingPortalSession(
      tenantId,
      returnUrl,
    );
  }

  // ===== ABO KÜNDIGEN =====

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cancelSubscription(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner') throw new Error('Nur der Owner kann kündigen');
    await this.platformPaymentsService.cancelAtPeriodEnd(tenantId);
    return true;
  }

  // ===== KÜNDIGUNG RÜCKGÄNGIG =====

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async reactivateSubscription(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann reaktivieren');
    await this.platformPaymentsService.reactivate(tenantId);
    return true;
  }

  // ===== DIREKTES ADD-ON AKTIVIEREN/DEAKTIVIEREN (Admin) =====

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async activateAddon(
    @Args('addonType') addonType: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann Add-ons aktivieren');
    await this.platformPaymentsService.directActivateAddon(tenantId, addonType);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deactivateAddon(
    @Args('addonType') addonType: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner')
      throw new Error('Nur der Owner kann Add-ons deaktivieren');
    await this.platformPaymentsService.directDeactivateAddon(
      tenantId,
      addonType,
    );
    return true;
  }
}
