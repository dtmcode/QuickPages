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
exports.PlatformPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const BYPASS_SLUGS = ['myquickpages', 'platform-admin', 'demo-quickpages'];
const PACKAGE_PRICE_ENV = {
    website_micro: 'STRIPE_PRICE_WEBSITE_MICRO',
    website_standard: 'STRIPE_PRICE_WEBSITE_STANDARD',
    website_pro: 'STRIPE_PRICE_WEBSITE_PRO',
    blog_personal: 'STRIPE_PRICE_BLOG_PERSONAL',
    blog_publisher: 'STRIPE_PRICE_BLOG_PUBLISHER',
    blog_magazine: 'STRIPE_PRICE_BLOG_MAGAZINE',
    business_starter: 'STRIPE_PRICE_BUSINESS_STARTER',
    business_professional: 'STRIPE_PRICE_BUSINESS_PROFESSIONAL',
    business_agency: 'STRIPE_PRICE_BUSINESS_AGENCY',
    shop_mini: 'STRIPE_PRICE_SHOP_MINI',
    shop_wachstum: 'STRIPE_PRICE_SHOP_WACHSTUM',
    shop_premium: 'STRIPE_PRICE_SHOP_PREMIUM',
    members_community: 'STRIPE_PRICE_MEMBERS_COMMUNITY',
    members_kurse: 'STRIPE_PRICE_MEMBERS_KURSE',
    members_academy: 'STRIPE_PRICE_MEMBERS_ACADEMY',
};
const ADDON_PRICE_ENV = {
    shop_module: 'STRIPE_PRICE_ADDON_SHOP_MODULE',
    booking_module: 'STRIPE_PRICE_ADDON_BOOKING_MODULE',
    blog_module: 'STRIPE_PRICE_ADDON_BLOG_MODULE',
    members_module: 'STRIPE_PRICE_ADDON_MEMBERS_MODULE',
    newsletter_extra: 'STRIPE_PRICE_ADDON_NEWSLETTER_EXTRA',
    ai_content: 'STRIPE_PRICE_ADDON_AI_CONTENT',
    extra_pages: 'STRIPE_PRICE_ADDON_EXTRA_PAGES',
    extra_users: 'STRIPE_PRICE_ADDON_EXTRA_USERS',
    i18n: 'STRIPE_PRICE_ADDON_I18N',
};
let PlatformPaymentsService = class PlatformPaymentsService {
    config;
    db;
    stripe;
    constructor(config, db) {
        this.config = config;
        this.db = db;
        const key = this.config.get('STRIPE_SECRET_KEY');
        if (!key) {
            console.warn('⚠️  STRIPE_SECRET_KEY nicht gesetzt — Stripe deaktiviert');
        }
        this.stripe = new stripe_1.default(key || 'sk_test_placeholder');
    }
    isStripeConfigured() {
        const key = this.config.get('STRIPE_SECRET_KEY');
        return !!(key && !key.includes('placeholder'));
    }
    isBypassTenant(tenant) {
        if (!tenant)
            return false;
        if (BYPASS_SLUGS.includes(tenant.slug))
            return true;
        const s = tenant.settings;
        return (s?.isSuperAdmin === true ||
            s?.platformAdmin === true ||
            s?.isDemo === true);
    }
    async getOrCreateCustomer(tenant, userEmail) {
        const settings = tenant.settings || {};
        if (settings.stripeCustomerId) {
            return settings.stripeCustomerId;
        }
        const customer = await this.stripe.customers.create({
            email: userEmail,
            metadata: { tenantId: tenant.id, tenantSlug: tenant.slug },
        });
        await this.db
            .update(schema_1.tenants)
            .set({
            settings: { ...settings, stripeCustomerId: customer.id },
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenant.id));
        return customer.id;
    }
    async createPackageCheckout(params) {
        const { tenantId, targetPackage, userEmail, successUrl, cancelUrl } = params;
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        if (this.isBypassTenant(tenant)) {
            await this.directChangePackage(tenantId, targetPackage);
            return { url: '', isDirect: true };
        }
        if (!this.isStripeConfigured()) {
            throw new Error('Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY in .env setzen.');
        }
        const priceEnvKey = PACKAGE_PRICE_ENV[targetPackage];
        if (!priceEnvKey)
            throw new Error(`Unbekanntes Paket: ${targetPackage}`);
        const priceId = this.config.get(priceEnvKey);
        if (!priceId)
            throw new Error(`Stripe Price für "${targetPackage}" fehlt. Bitte ${priceEnvKey} in .env eintragen.`);
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
        return { url: session.url, isDirect: false };
    }
    async createAddonCheckout(params) {
        const { tenantId, addonType, userEmail, successUrl, cancelUrl } = params;
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        if (this.isBypassTenant(tenant)) {
            await this.directActivateAddon(tenantId, addonType);
            return { url: '', isDirect: true };
        }
        if (!this.isStripeConfigured()) {
            throw new Error('Stripe ist noch nicht konfiguriert.');
        }
        const priceEnvKey = ADDON_PRICE_ENV[addonType];
        if (!priceEnvKey)
            throw new Error(`Unbekanntes Add-on: ${addonType}`);
        const priceId = this.config.get(priceEnvKey);
        if (!priceId)
            throw new Error(`Stripe Price für Add-on "${addonType}" fehlt. Bitte ${priceEnvKey} in .env eintragen.`);
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
        return { url: session.url, isDirect: false };
    }
    async createBillingPortalSession(tenantId, returnUrl) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        const customerId = tenant.settings?.stripeCustomerId;
        if (!customerId) {
            throw new Error('Noch kein Stripe-Kunde. Bitte zuerst ein Paket abonnieren.');
        }
        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return session.url;
    }
    async handleWebhook(rawBody, signature) {
        const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!secret)
            throw new Error('STRIPE_WEBHOOK_SECRET nicht konfiguriert');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
        }
        catch (err) {
            throw new Error(`Webhook Signatur ungültig: ${err.message}`);
        }
        console.log(`📨 Stripe Webhook: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { tenantId, targetPackage, addonType, type } = session.metadata || {};
                if (!tenantId)
                    break;
                if (type === 'addon' && addonType) {
                    await this.directActivateAddon(tenantId, addonType, session.subscription);
                    console.log(`✅ Add-on aktiviert: ${addonType} für Tenant ${tenantId}`);
                }
                else if (targetPackage) {
                    await this.directChangePackage(tenantId, targetPackage, session.subscription);
                    console.log(`✅ Paket gewechselt: ${targetPackage} für Tenant ${tenantId}`);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const { tenantId } = sub.metadata || {};
                if (!tenantId)
                    break;
                await this.db
                    .update(schema_1.subscriptions)
                    .set({
                    status: this.mapStatus(sub.status),
                    currentPeriodStart: new Date(sub.current_period_start * 1000),
                    currentPeriodEnd: new Date(sub.current_period_end * 1000),
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.stripeSubscriptionId, sub.id));
                console.log(`🔄 Subscription aktualisiert: Tenant ${tenantId}`);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const invoiceAny = invoice;
                if (!invoiceAny.subscription)
                    break;
                const sub = await this.stripe.subscriptions.retrieve(invoiceAny.subscription);
                const { tenantId } = sub.metadata || {};
                if (!tenantId)
                    break;
                await this.db
                    .update(schema_1.subscriptions)
                    .set({
                    status: 'past_due',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.stripeSubscriptionId, sub.id));
                console.log(`⚠️  Zahlung fehlgeschlagen: Tenant ${tenantId}`);
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                const { tenantId } = sub.metadata || {};
                if (!tenantId)
                    break;
                await this.db
                    .update(schema_1.subscriptions)
                    .set({
                    status: 'cancelled',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.stripeSubscriptionId, sub.id));
                await this.db
                    .update(schema_1.tenants)
                    .set({
                    package: 'website_micro',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
                console.log(`❌ Abo gekündigt: Tenant ${tenantId} → website_micro`);
                break;
            }
            default:
                break;
        }
    }
    async directChangePackage(tenantId, targetPackage, stripeSubscriptionId) {
        await this.db
            .update(schema_1.tenants)
            .set({
            package: targetPackage,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        const [existing] = await this.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId))
            .limit(1);
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        let stripeDetails = {};
        if (stripeSubscriptionId) {
            try {
                const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
                const stripeSubAny = stripeSub;
                stripeDetails = {
                    currentPeriodStart: new Date(stripeSubAny.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubAny.current_period_end * 1000),
                    cancelAtPeriodEnd: stripeSubAny.cancel_at_period_end,
                    stripeSubscriptionId,
                };
            }
            catch {
            }
        }
        const subData = {
            package: targetPackage,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            ...stripeDetails,
            updatedAt: now,
        };
        if (existing) {
            await this.db
                .update(schema_1.subscriptions)
                .set(subData)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, existing.id));
        }
        else {
            await this.db.insert(schema_1.subscriptions).values({ tenantId, ...subData });
        }
    }
    async directActivateAddon(tenantId, addonType, stripeSubscriptionId) {
        const [existing] = await this.db
            .select()
            .from(schema_1.tenantAddons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.addonType, addonType)))
            .limit(1);
        if (existing) {
            await this.db
                .update(schema_1.tenantAddons)
                .set({
                isActive: true,
                ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tenantAddons.id, existing.id));
        }
        else {
            await this.db.insert(schema_1.tenantAddons).values({
                tenantId,
                addonType: addonType,
                quantity: 1,
                isActive: true,
                ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
                activatedAt: new Date(),
            });
        }
    }
    async directDeactivateAddon(tenantId, addonType) {
        await this.db
            .update(schema_1.tenantAddons)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.tenantAddons.addonType, addonType)));
    }
    async cancelAtPeriodEnd(tenantId) {
        const [sub] = await this.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId))
            .limit(1);
        if (!sub?.stripeSubscriptionId)
            throw new Error('Keine aktive Stripe-Subscription gefunden');
        await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
        await this.db
            .update(schema_1.subscriptions)
            .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, sub.id));
    }
    async reactivate(tenantId) {
        const [sub] = await this.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId))
            .limit(1);
        if (!sub?.stripeSubscriptionId)
            throw new Error('Keine Subscription gefunden');
        await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: false,
        });
        await this.db
            .update(schema_1.subscriptions)
            .set({ cancelAtPeriodEnd: false, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, sub.id));
    }
    mapStatus(status) {
        return ({
            active: 'active',
            trialing: 'trialing',
            past_due: 'past_due',
            canceled: 'cancelled',
            incomplete: 'past_due',
            incomplete_expired: 'cancelled',
            unpaid: 'past_due',
        }[status] || 'active');
    }
};
exports.PlatformPaymentsService = PlatformPaymentsService;
exports.PlatformPaymentsService = PlatformPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], PlatformPaymentsService);
//# sourceMappingURL=platform-payments.service.js.map