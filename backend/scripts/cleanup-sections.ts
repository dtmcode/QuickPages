// 📂 PFAD: backend/scripts/cleanup-sections.ts
/**
 * 🧹 CLEANUP: Löscht alle Section-Daten vor Schema-Migration
 *
 * Ausführen mit:
 *   npx ts-node backend/scripts/cleanup-sections.ts
 *
 * Dieses Script:
 * - Löscht ALLE wb_sections (Tenant-Sections)
 * - Löscht ALLE wb_global_template_sections (Demo-Sections)
 * - Lässt wb_pages, wb_templates, wb_global_templates intakt
 *
 * Danach können die 18 Seed-Scripts neu laufen + createDefaultTemplate bei neuen Tenants greift.
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('🧹 Cleanup Sections — START');

  // Zähle vor dem Löschen
  const before = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM wb_sections) AS tenant_sections,
      (SELECT COUNT(*) FROM wb_global_template_sections) AS global_sections,
      (SELECT COUNT(*) FROM wb_pages) AS pages,
      (SELECT COUNT(*) FROM wb_templates) AS templates
  `);
  console.log('📊 Vorher:', before.rows[0]);

  // Löschen
  const r1 = await db.execute(sql`DELETE FROM wb_sections`);
  console.log(`✅ wb_sections: ${r1.rowCount} Rows gelöscht`);

  const r2 = await db.execute(sql`DELETE FROM wb_global_template_sections`);
  console.log(`✅ wb_global_template_sections: ${r2.rowCount} Rows gelöscht`);

  const after = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM wb_sections) AS tenant_sections,
      (SELECT COUNT(*) FROM wb_global_template_sections) AS global_sections
  `);
  console.log('📊 Nachher:', after.rows[0]);

  console.log('✅ Cleanup DONE. Du kannst jetzt die Migration ausführen.');
  await pool.end();
}

main().catch(err => {
  console.error('❌ Cleanup fehlgeschlagen:', err);
  process.exit(1);
});