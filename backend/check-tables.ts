import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://postgres:56fa5337e1f1eebf@5.181.50.243:5434/saas_platform"
});

pool.query(`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
`).then(res => {
  console.log('\n📋 Vorhandene Tabellen:\n');
  res.rows.forEach(r => console.log('  ✅', r.table_name));
  console.log('\nGesamt:', res.rows.length, 'Tabellen');
  pool.end();
}).catch(err => {
  console.error('❌ Fehler:', err.message);
  pool.end();
});