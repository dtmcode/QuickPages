// 📂 PFAD: backend/scripts/seed-superadmin.ts
//
// Erstellt den MyQuickPages Platform-Admin Account
// Login: admin@myquickpages.de / QuickPages2025!
//
// Run:
//   npx ts-node -r tsconfig-paths/register scripts/seed-superadmin.ts
//
// Passwort ändern:
//   node -e "require('bcrypt').hash('NeuesPasswort',12).then(console.log)"
//   → neuen Hash in PASSWORD_HASH eintragen

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool }    from 'pg';
import { eq }      from 'drizzle-orm';
import {
  tenants,
  users,
  subscriptions,
  tenantAddons,
} from '../src/drizzle/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool);

// ==================== CONFIG ====================

const SLUG         = 'myquickpages';
const EMAIL        = 'admin@myquickpages.de';
// Passwort: QuickPages2025!
const PASSWORD_HASH = '$2b$12$dDHSWJcYn9WKYQkcm.hJ5ujRmpwl.ax91dORc7WlzQAp9QwaIDFue';

// Nur Typen die im addonTypeEnum der DB existieren:
// 'shop_business' | 'shop_pro' | 'email_starter' | 'email_business' |
// 'extra_users' | 'shop_module' | 'newsletter' | 'booking' |
// 'ai_content' | 'form_builder' | 'i18n' | 'extra_products' | 'extra_ai_credits'
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
] as const;

// ==================== MAIN ====================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   QuickPages Super-Admin Seed                ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // ── 1. CLEANUP ──────────────────────────────────────

  console.log('🧹 Cleanup...');

  const existing = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, SLUG))
    .limit(1);

  if (existing.length) {
    const tenantId = existing[0].id;

    // Add-ons, Subscriptions, Users löschen (Cascade wäre schöner aber sicher ist sicher)
    await db.delete(tenantAddons).where(eq(tenantAddons.tenantId, tenantId));
    await db.delete(subscriptions).where(eq(subscriptions.tenantId, tenantId));
    await db.delete(users).where(eq(users.tenantId, tenantId));
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    console.log('   ✓ Alter Admin-Account entfernt');
  } else {
    console.log('   ✓ Kein bestehender Account gefunden');
  }

  // ── 2. TENANT ───────────────────────────────────────

  console.log('\n📦 Erstelle Platform-Tenant...');

  const [tenant] = await db
    .insert(tenants)
    .values({
      name:    'MyQuickPages Platform',
      slug:    SLUG,
      package: 'enterprise' as any, // Bypass — isSuperAdmin greift
      settings: {
        isSuperAdmin:  true,
        platformAdmin: true,
        modules: {
          cms:         true,
          shop:        true,
          email:       true,
          landing:     true,
          booking:     true,
          newsletter:  true,
          analytics:   true,
          ai:          true,
          members:     true,
          forms:       true,
          i18n:        true,
        },
        limits: {
          users:       999999,
          products:    999999,
          emails:      999999,
          posts:       999999,
          pages:       999999,
          subscribers: 999999,
        },
      } as any,
      isActive: true,
    })
    .returning();

  console.log(`   ✓ Tenant: ${tenant.name} (${tenant.id})`);

  // ── 3. SUBSCRIPTION ─────────────────────────────────

  console.log('\n💳 Erstelle Subscription...');

  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 10); // 10 Jahre

  const [sub] = await db
    .insert(subscriptions)
    .values({
      tenantId:           tenant.id,
      package:            'enterprise' as any,
      status:             'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd:   periodEnd,
      cancelAtPeriodEnd:  false,
    })
    .returning();

  console.log(`   ✓ Subscription aktiv bis: ${periodEnd.toLocaleDateString('de-DE')}`);

  // ── 4. USER ─────────────────────────────────────────

  console.log('\n👤 Erstelle Super-Admin User...');

  const [user] = await db
    .insert(users)
    .values({
      tenantId:      tenant.id,
      email:         EMAIL,
      passwordHash:  PASSWORD_HASH,
      role:          'owner',
      firstName:     'Platform',
      lastName:      'Admin',
      isActive:      true,
      emailVerified: true,
    })
    .returning();

  console.log(`   ✓ User: ${user.email} [${user.role}]`);

  // ── 5. ADD-ONS ──────────────────────────────────────

  console.log('\n🔌 Aktiviere alle Add-ons...');

  for (const addonType of ALL_ADDONS) {
    await db
      .insert(tenantAddons)
      .values({
        tenantId:    tenant.id,
        addonType:   addonType as any,
        quantity:    1,
        isActive:    true,
        activatedAt: new Date(),
      });
    console.log(`   ✓ ${addonType}`);
  }

  // ── 6. VERIFY ───────────────────────────────────────

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