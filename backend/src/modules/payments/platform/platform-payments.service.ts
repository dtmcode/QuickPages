// 📂 PFAD: backend/src/modules/payments/platform/platform-payments.service.ts
// Zuständig für: QuickPages Paket-Abonnements, Checkout, Webhook, Portal

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { tenants, subscriptions, tenantAddons, users } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// ==================== CONSTANTS ====================

// Slugs die changePackage ohne Stripe nutzen dürfen
const BYPASS_SLUGS = ['myquickpages', 'platform-admin', 'demo-quickpages'];

// Mapping: package_key → env variable mit Stripe Price ID
const PACKAGE_PRICE_ENV: Record<string, string> = {
  website_micro:         'STRIPE_PRICE_WEBSITE_MICRO',
  website_standard:      'STRIPE_PRICE_WEBSITE_STANDARD',
  website_pro:           'STRIPE_PRICE_WEBSITE_PRO',
  blog_personal:         'STRIPE_PRICE_BLOG_PERSONAL',
  blog_publisher:        'STRIPE_PRICE_BLOG_PUBLISHER',
  blog_magazine:         'STRIPE_PRICE_BLOG_MAGAZINE',
  business_starter:      'STRIPE_PRICE_BUSINESS_STARTER',
  business_professional: 'STRIPE_PRICE_BUSINESS_PROFESSIONAL',
  business_agency:       'STRIPE_PRICE_BUSINESS_AGENCY',
  shop_mini:             'STRIPE_PRICE_SHOP_MINI',
  shop_wachstum:         'STRIPE_PRICE_SHOP_WACHSTUM',
  shop_premium:          'STRIPE_PRICE_SHOP_PREMIUM',
  members_community:     'STRIPE_PRICE_MEMBERS_COMMUNITY',
  members_kurse:         'STRIPE_PRICE_MEMBERS_KURSE',
  members_academy:       'STRIPE_PRICE_MEMBERS_ACADEMY',
};

const ADDON_PRICE_ENV: Record<string, string> = {
  shop_module:      'STRIPE_PRICE_ADDON_SHOP_MODULE',
  booking_module:   'STRIPE_PRICE_ADDON_BOOKING_MODULE',
  blog_module:      'STRIPE_PRICE_ADDON_BLOG_MODULE',
  members_module:   'STRIPE_PRICE_ADDON_MEMBERS_MODULE',
  newsletter_extra: 'STRIPE_PRICE_ADDON_NEWSLETTER_EXTRA',
  ai_content:       'STRIPE_PRICE_ADDON_AI_CONTENT',
  extra_pages:      'STRIPE_PRICE_ADDON_EXTRA_PAGES',
  extra_users:      'STRIPE_PRICE_ADDON_EXTRA_USERS',
  i18n:             'STRIPE_PRICE_ADDON_I18N',
};

// ==================== INTERFACES ====================

export interface CheckoutResult {
  url: string;
  isDirect: boolean; // true = Super-Admin/Demo, direkt gewechselt
}

// ==================== SERVICE ====================

@Injectable()
export class PlatformPaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key) {
      console.warn('⚠️  STRIPE_SECRET_KEY nicht gesetzt — Stripe deaktiviert');
    }
    this.stripe = new Stripe(key || 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    });
  }

  // ==================== STATUS ====================

  isStripeConfigured(): boolean {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    return !!(key && !key.includes('placeholder'));
  }

  isBypassTenant(tenant: any): boolean {
    if (!tenant) return false;
    if (BYPASS_SLUGS.includes(tenant.slug)) return true;
    const s = tenant.settings as Record<string, unknown> | null;
    return s?.isSuperAdmin === true || s?.platformAdmin === true || s?.isDemo === true;
  }

  // ==================== STRIPE CUSTOMER ====================

  private async getOrCreateCustomer(tenant: any, userEmail: string): Promise<string> {
    const settings = (tenant.settings as any) || {};

    if (settings.stripeCustomerId) {
      return settings.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: userEmail,
      metadata: { tenantId: tenant.id, tenantSlug: tenant.slug },
    });

    // Customer ID im tenant.settings speichern
    await this.db.update(tenants).set({
      settings: { ...settings, stripeCustomerId: customer.id },
      updatedAt: new Date(),
    }).where(eq(tenants.id, tenant.id));

    return customer.id;
  }

  // ==================== CHECKOUT: PAKET ====================

  async createPackageCheckout(params: {
    tenantId: string;
    targetPackage: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult> {
    const { tenantId, targetPackage, userEmail, successUrl, cancelUrl } = params;

    const [tenant] = await this.db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant) throw new Error('Tenant nicht gefunden');

    // Bypass für Super-Admin / Demo → direkt wechseln
    if (this.isBypassTenant(tenant)) {
      await this.directChangePackage(tenantId, targetPackage);
      return { url: '', isDirect: true };
    }

    // Stripe konfiguriert?
    if (!this.isStripeConfigured()) {
      throw new Error('Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY in .env setzen.');
    }

    // Price ID aus .env
    const priceEnvKey = PACKAGE_PRICE_ENV[targetPackage];
    if (!priceEnvKey) throw new Error(`Unbekanntes Paket: ${targetPackage}`);

    const priceId = this.config.get<string>(priceEnvKey);
    if (!priceId) throw new Error(`Stripe Price für "${targetPackage}" fehlt. Bitte ${priceEnvKey} in .env eintragen.`);

    const customerId = await this.getOrCreateCustomer(tenant, userEmail);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&package=${targetPackage}`,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        targetPackage,
        previousPackage: tenant.package,
        type: 'package',
      },
      subscription_data: {
        metadata: { tenantId, targetPackage },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'de',
    });

    return { url: session.url!, isDirect: false };
  }

  // ==================== CHECKOUT: ADD-ON ====================

  async createAddonCheckout(params: {
    tenantId: string;
    addonType: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult> {
    const { tenantId, addonType, userEmail, successUrl, cancelUrl } = params;

    const [tenant] = await this.db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant) throw new Error('Tenant nicht gefunden');

    // Bypass
    if (this.isBypassTenant(tenant)) {
      await this.directActivateAddon(tenantId, addonType);
      return { url: '', isDirect: true };
    }

    if (!this.isStripeConfigured()) {
      throw new Error('Stripe ist noch nicht konfiguriert.');
    }

    const priceEnvKey = ADDON_PRICE_ENV[addonType];
    if (!priceEnvKey) throw new Error(`Unbekanntes Add-on: ${addonType}`);

    const priceId = this.config.get<string>(priceEnvKey);
    if (!priceId) throw new Error(`Stripe Price für Add-on "${addonType}" fehlt. Bitte ${priceEnvKey} in .env eintragen.`);

    const customerId = await this.getOrCreateCustomer(tenant, userEmail);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}?addon=${addonType}&activated=true`,
      cancel_url: cancelUrl,
      metadata: { tenantId, addonType, type: 'addon' },
      allow_promotion_codes: true,
      locale: 'de',
    });

    return { url: session.url!, isDirect: false };
  }

  // ==================== BILLING PORTAL ====================

  async createBillingPortalSession(tenantId: string, returnUrl: string): Promise<string> {
    const [tenant] = await this.db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenant) throw new Error('Tenant nicht gefunden');

    const customerId = (tenant.settings as any)?.stripeCustomerId;
    if (!customerId) {
      throw new Error('Noch kein Stripe-Kunde. Bitte zuerst ein Paket abonnieren.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  // ==================== WEBHOOK ====================

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET nicht konfiguriert');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err: any) {
      throw new Error(`Webhook Signatur ungültig: ${err.message}`);
    }

    console.log(`📨 Stripe Webhook: ${event.type}`);

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { tenantId, targetPackage, addonType, type } = session.metadata || {};
        if (!tenantId) break;

        if (type === 'addon' && addonType) {
          await this.directActivateAddon(tenantId, addonType, session.subscription as string);
          console.log(`✅ Add-on aktiviert: ${addonType} für Tenant ${tenantId}`);
        } else if (targetPackage) {
          await this.directChangePackage(tenantId, targetPackage, session.subscription as string);
          console.log(`✅ Paket gewechselt: ${targetPackage} für Tenant ${tenantId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const { tenantId } = sub.metadata || {};
        if (!tenantId) break;

        await this.db.update(subscriptions).set({
          status: this.mapStatus(sub.status),
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        }).where(eq(subscriptions.stripeSubscriptionId, sub.id));

        console.log(`🔄 Subscription aktualisiert: Tenant ${tenantId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const sub = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
        const { tenantId } = sub.metadata || {};
        if (!tenantId) break;

        await this.db.update(subscriptions).set({
          status: 'past_due',
          updatedAt: new Date(),
        }).where(eq(subscriptions.stripeSubscriptionId, sub.id));

        console.log(`⚠️  Zahlung fehlgeschlagen: Tenant ${tenantId}`);
        // TODO: Email an Owner senden
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const { tenantId } = sub.metadata || {};
        if (!tenantId) break;

        await this.db.update(subscriptions).set({
          status: 'cancelled',
          updatedAt: new Date(),
        }).where(eq(subscriptions.stripeSubscriptionId, sub.id));

        // Auf kleinstes Paket zurücksetzen
        await this.db.update(tenants).set({
          package: 'website_micro' as any,
          updatedAt: new Date(),
        }).where(eq(tenants.id, tenantId));

        console.log(`❌ Abo gekündigt: Tenant ${tenantId} → website_micro`);
        break;
      }

      default:
        break;
    }
  }

  // ==================== DIREKTE ÄNDERUNGEN (kein Stripe) ====================

  async directChangePackage(
    tenantId: string,
    targetPackage: string,
    stripeSubscriptionId?: string,
  ): Promise<void> {
    // Tenant Package updaten
    await this.db.update(tenants).set({
      package: targetPackage as any,
      updatedAt: new Date(),
    }).where(eq(tenants.id, tenantId));

    // Subscription in DB anlegen/updaten
    const [existing] = await this.db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId)).limit(1);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    let stripeDetails = {};
    if (stripeSubscriptionId) {
      try {
        const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
        stripeDetails = {
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          stripeSubscriptionId,
        };
      } catch { /* Stripe nicht verfügbar */ }
    }

    const subData = {
      package: targetPackage as any,
      status: 'active' as const,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      ...stripeDetails,
      updatedAt: now,
    };

    if (existing) {
      await this.db.update(subscriptions).set(subData).where(eq(subscriptions.id, existing.id));
    } else {
      await this.db.insert(subscriptions).values({ tenantId, ...subData });
    }
  }

  async directActivateAddon(
    tenantId: string,
    addonType: string,
    stripeSubscriptionId?: string,
  ): Promise<void> {
    const [existing] = await this.db.select().from(tenantAddons)
      .where(and(eq(tenantAddons.tenantId, tenantId), eq(tenantAddons.addonType, addonType as any)))
      .limit(1);

    if (existing) {
      await this.db.update(tenantAddons).set({
        isActive: true,
        ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
      }).where(eq(tenantAddons.id, existing.id));
    } else {
      await this.db.insert(tenantAddons).values({
        tenantId,
        addonType: addonType as any,
        quantity: 1,
        isActive: true,
        ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
        activatedAt: new Date(),
      });
    }
  }

  async directDeactivateAddon(tenantId: string, addonType: string): Promise<void> {
    await this.db.update(tenantAddons).set({ isActive: false })
      .where(and(eq(tenantAddons.tenantId, tenantId), eq(tenantAddons.addonType, addonType as any)));
  }

  async cancelAtPeriodEnd(tenantId: string): Promise<void> {
    const [sub] = await this.db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId)).limit(1);

    if (!sub?.stripeSubscriptionId) throw new Error('Keine aktive Stripe-Subscription gefunden');

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    await this.db.update(subscriptions).set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));
  }

  async reactivate(tenantId: string): Promise<void> {
    const [sub] = await this.db.select().from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId)).limit(1);

    if (!sub?.stripeSubscriptionId) throw new Error('Keine Subscription gefunden');

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: false });
    await this.db.update(subscriptions).set({ cancelAtPeriodEnd: false, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));
  }

  // ==================== HELPERS ====================

  private mapStatus(status: string): 'active' | 'cancelled' | 'past_due' | 'trialing' {
    return ({
      active: 'active', trialing: 'trialing',
      past_due: 'past_due', canceled: 'cancelled',
      incomplete: 'past_due', incomplete_expired: 'cancelled',
      unpaid: 'past_due',
    } as any)[status] || 'active';
  }
}