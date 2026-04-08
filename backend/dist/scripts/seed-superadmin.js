"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../src/drizzle/schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const SLUG = 'myquickpages';
const EMAIL = 'admin@myquickpages.de';
const PASSWORD_HASH = '$2b$12$dDHSWJcYn9WKYQkcm.hJ5ujRmpwl.ax91dORc7WlzQAp9QwaIDFue';
const ALL_ADDONS = [
    'shop_module',
    'shop_business',
    'shop_pro',
    'extra_products',
    'extra_ai_credits',
    'newsletter',
    'booking',
    'ai_content',
    'form_builder',
    'i18n',
    'extra_users',
    'email_starter',
    'email_business',
];
async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   QuickPages Super-Admin Seed                ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    console.log('🧹 Cleanup...');
    const existing = await db
        .select({ id: schema_1.tenants.id })
        .from(schema_1.tenants)
        .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, SLUG))
        .limit(1);
    if (existing.length) {
        const tenantId = existing[0].id;
        await db.delete(schema_1.tenantAddons).where((0, drizzle_orm_1.eq)(schema_1.tenantAddons.tenantId, tenantId));
        await db.delete(schema_1.subscriptions).where((0, drizzle_orm_1.eq)(schema_1.subscriptions.tenantId, tenantId));
        await db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.tenantId, tenantId));
        await db.delete(schema_1.tenants).where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        console.log('   ✓ Alter Admin-Account entfernt');
    }
    else {
        console.log('   ✓ Kein bestehender Account gefunden');
    }
    console.log('\n📦 Erstelle Platform-Tenant...');
    const [tenant] = await db
        .insert(schema_1.tenants)
        .values({
        name: 'MyQuickPages Platform',
        slug: SLUG,
        package: 'enterprise',
        settings: {
            isSuperAdmin: true,
            platformAdmin: true,
            modules: {
                cms: true,
                shop: true,
                email: true,
                landing: true,
                booking: true,
                newsletter: true,
                analytics: true,
                ai: true,
                members: true,
                forms: true,
                i18n: true,
            },
            limits: {
                users: 999999,
                products: 999999,
                emails: 999999,
                posts: 999999,
                pages: 999999,
                subscribers: 999999,
            },
        },
        isActive: true,
    })
        .returning();
    console.log(`   ✓ Tenant: ${tenant.name} (${tenant.id})`);
    console.log('\n💳 Erstelle Subscription...');
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 10);
    const [sub] = await db
        .insert(schema_1.subscriptions)
        .values({
        tenantId: tenant.id,
        package: 'enterprise',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
    })
        .returning();
    console.log(`   ✓ Subscription aktiv bis: ${periodEnd.toLocaleDateString('de-DE')}`);
    console.log('\n👤 Erstelle Super-Admin User...');
    const [user] = await db
        .insert(schema_1.users)
        .values({
        tenantId: tenant.id,
        email: EMAIL,
        passwordHash: PASSWORD_HASH,
        role: 'owner',
        firstName: 'Platform',
        lastName: 'Admin',
        isActive: true,
        emailVerified: true,
    })
        .returning();
    console.log(`   ✓ User: ${user.email} [${user.role}]`);
    console.log('\n🔌 Aktiviere alle Add-ons...');
    for (const addonType of ALL_ADDONS) {
        await db
            .insert(schema_1.tenantAddons)
            .values({
            tenantId: tenant.id,
            addonType: addonType,
            quantity: 1,
            isActive: true,
            activatedAt: new Date(),
        });
        console.log(`   ✓ ${addonType}`);
    }
    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ Super-Admin Account erstellt:\n');
    console.log(`   🌐 URL:       http://localhost:3001 (oder deine Domain)`);
    console.log(`   📧 E-Mail:    ${EMAIL}`);
    console.log(`   🔑 Passwort:  QuickPages2025!`);
    console.log(`   📦 Paket:     enterprise (isSuperAdmin bypass)`);
    console.log(`   ⏰ Gültig:    bis ${periodEnd.toLocaleDateString('de-DE')}`);
    console.log(`   🔌 Add-ons:   ${ALL_ADDONS.length} aktiv\n`);
    console.log('   ⚠️  Passwort nach dem ersten Login ändern!\n');
    await pool.end();
}
main().catch(err => {
    console.error('❌ Fehler:', err.message);
    process.exit(1);
});
//# sourceMappingURL=seed-superadmin.js.map