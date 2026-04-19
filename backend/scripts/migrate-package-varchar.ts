// 📂 PFAD: backend/scripts/migrate-package-varchar.ts
// Konvertiert package enum → varchar(50) damit neue Pakete funktionieren
// Run: npx ts-node --transpile-only -r tsconfig-paths/register scripts/migrate-package-varchar.ts

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Migration: package enum → varchar(50)              ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // ── 1. Prüfen ob Enum noch existiert ──────────────────────────────
    const enumCheck = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'package';
    `);

    if (enumCheck.rows.length === 0) {
      console.log('✅ package Enum existiert nicht mehr — Migration bereits abgeschlossen.\n');

      // Trotzdem Default prüfen
      const colCheck = await client.query(`
        SELECT column_default FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'package';
      `);
      console.log(`   Aktueller Default: ${colCheck.rows[0]?.column_default}`);
      return;
    }

    console.log('🔍 package Enum gefunden — starte Migration...\n');

    // ── 2. Aktuellen Stand zeigen ──────────────────────────────────────
    const tenantCount = await client.query(`SELECT COUNT(*) FROM tenants;`);
    const subCount    = await client.query(`SELECT COUNT(*) FROM subscriptions;`);
    console.log(`   Tenants:       ${tenantCount.rows[0].count}`);
    console.log(`   Subscriptions: ${subCount.rows[0].count}\n`);

    // ── 3. Migration ausführen ─────────────────────────────────────────
    await client.query('BEGIN');

    // tenants.package → varchar
    console.log('1. tenants.package → varchar(50)...');
    await client.query(`
      ALTER TABLE tenants
        ALTER COLUMN package TYPE varchar(50) USING package::text;
    `);
    console.log('   ✅ Done');

    // subscriptions.package → varchar
    console.log('2. subscriptions.package → varchar(50)...');
    await client.query(`
      ALTER TABLE subscriptions
        ALTER COLUMN package TYPE varchar(50) USING package::text;
    `);
    console.log('   ✅ Done');

    // Default setzen
    console.log('3. Default auf website_micro setzen...');
    await client.query(`
      ALTER TABLE tenants
        ALTER COLUMN package SET DEFAULT 'website_micro';
    `);
    console.log('   ✅ Done');

    // Enum droppen
    console.log('4. Alten package Enum droppen...');
    await client.query(`DROP TYPE IF EXISTS "package" CASCADE;`);
    console.log('   ✅ Done');

    await client.query('COMMIT');

    // ── 4. Verifizieren ────────────────────────────────────────────────
    const verify = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'tenants' AND column_name = 'package';
    `);

    const col = verify.rows[0];
    console.log('\n✅ Migration erfolgreich!\n');
    console.log(`   Spalte:  ${col.column_name}`);
    console.log(`   Typ:     ${col.data_type}`);
    console.log(`   Default: ${col.column_default}\n`);

    if (col.data_type !== 'character varying') {
      throw new Error(`Unerwarteter Typ: ${col.data_type}`);
    }

    // ── 5. Bestehende Tenants zeigen ───────────────────────────────────
    const tenants = await client.query(`
      SELECT slug, package FROM tenants ORDER BY created_at LIMIT 10;
    `);

    if (tenants.rows.length > 0) {
      console.log('📊 Bestehende Tenants (erste 10):');
      tenants.rows.forEach((t: any) => {
        console.log(`   ${t.slug.padEnd(30)} ${t.package}`);
      });
      console.log('');
    }

    console.log('🎉 Registrierung mit website_micro, blog_personal etc. funktioniert jetzt!\n');

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Migration fehlgeschlagen:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

main().finally(() => pool.end());