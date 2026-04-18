// 📂 PFAD: backend/scripts/templates/cleanup-old.ts
//
// Löscht alle Templates aus v1 und v2 (falsche Kategorien)
// Behält v3 (website/blog/business/shop/members) und v4 (landing/branchen)
//
// Run:
//   npx ts-node -r tsconfig-paths/register scripts/templates/cleanup-old.ts
//   npx ts-node -r tsconfig-paths/register scripts/templates/cleanup-old.ts --dry-run

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { inArray, notInArray } from 'drizzle-orm';
import { wbGlobalTemplates } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Kategorien die BEHALTEN werden (v3 + v4 + Paket-Demo-Templates)
const KEEP_CATEGORIES = [
  'website', 'blog', 'business', 'shop', 'members',   // v3
  'landing',                                            // v4
  'friseur', 'arzt', 'restaurant', 'fitness',          // v4 Branchen
  'immobilien', 'kanzlei', 'handwerk', 'therapie',     // v4 Branchen
  // Paket-Demo-Templates (falls bereits geseeded)
  'website_micro', 'website_standard', 'website_pro',
  'blog_personal', 'blog_publisher', 'blog_magazine',
  'business_starter', 'business_professional', 'business_agency',
  'shop_mini', 'shop_wachstum', 'shop_premium',
  'members_community', 'members_kurse', 'members_academy',
];

// Kategorien aus v1 + v2 die gelöscht werden
const DELETE_CATEGORIES = [
  'creative',   // v1
  'ecommerce',  // v1
  'portfolio',  // v1
  'onepage',    // v2
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Cleanup: v1 + v2 Templates entfernen           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (dryRun) console.log('🔍 DRY-RUN — es wird nichts gelöscht\n');

  // Templates die gelöscht werden
  const toDelete = await db
    .select({ id: wbGlobalTemplates.id, name: wbGlobalTemplates.name, category: wbGlobalTemplates.category })
    .from(wbGlobalTemplates)
    .where(inArray(wbGlobalTemplates.category, DELETE_CATEGORIES));

  if (toDelete.length === 0) {
    console.log('✅ Keine alten Templates gefunden — DB ist bereits sauber.\n');
    await pool.end();
    return;
  }

  console.log(`🗑️  Templates die gelöscht werden (${toDelete.length}):\n`);
  toDelete.forEach(t => console.log(`   ❌ "${t.name}" [${t.category}]`));

  // Templates die behalten werden
  const toKeep = await db
    .select({ id: wbGlobalTemplates.id, name: wbGlobalTemplates.name, category: wbGlobalTemplates.category })
    .from(wbGlobalTemplates)
    .where(notInArray(wbGlobalTemplates.category, DELETE_CATEGORIES));

  console.log(`\n✅ Templates die behalten werden (${toKeep.length}):\n`);
  const byCategory = toKeep.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(20)} ${count} Template(s)`);
  });

  if (dryRun) {
    console.log('\n🔍 DRY-RUN abgeschlossen — keine Änderungen.\n');
    await pool.end();
    return;
  }

  console.log('\n');
  const deleted = await db
    .delete(wbGlobalTemplates)
    .where(inArray(wbGlobalTemplates.category, DELETE_CATEGORIES))
    .returning({ name: wbGlobalTemplates.name });

  console.log(`✅ ${deleted.length} Templates gelöscht.\n`);

  const total = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates);
  console.log(`📊 Templates in der DB: ${total.length}\n`);

  await pool.end();
}

main().catch(err => { console.error('❌', err); process.exit(1); });
