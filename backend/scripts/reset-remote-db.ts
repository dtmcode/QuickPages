import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetRemoteDatabase() {
  console.log('🔗 Verbinde mit Remote-Datenbank...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('🔍 Liste alle Tabellen auf...');
    
    // Alle User-Tabellen finden
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log('Gefundene Tabellen:', tablesResult.rows.map(r => r.tablename));
    console.log('');

    console.log('🗑️  Droppe ALLE Tabellen...');
    
    // Alle Tabellen in einer Query droppen
    for (const row of tablesResult.rows) {
      await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
      console.log(`  ✓ ${row.tablename}`);
    }
    
    console.log('');
    console.log('🗑️  Droppe ALLE Enums...');
    
    // Alle Enums finden und droppen
    const enumsResult = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
    `);
    
    for (const row of enumsResult.rows) {
      await pool.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
      console.log(`  ✓ ${row.typname}`);
    }
    
    console.log('');
    console.log('✅ Datenbank ist jetzt komplett leer!');
    console.log('');
    console.log('👉 Nächster Schritt: npm run db:push');
    
  } catch (error) {
    console.error('❌ Fehler beim Reset:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetRemoteDatabase();