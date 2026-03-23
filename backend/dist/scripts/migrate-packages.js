"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
async function migrate() {
    const client = await pool.connect();
    console.log('🔄 Starting package migration...');
    try {
        await client.query(`ALTER TYPE "package" ADD VALUE IF NOT EXISTS 'page'`);
        await client.query(`ALTER TYPE "package" ADD VALUE IF NOT EXISTS 'creator'`);
        await client.query(`ALTER TYPE "package" ADD VALUE IF NOT EXISTS 'shop'`);
        await client.query(`ALTER TYPE "package" ADD VALUE IF NOT EXISTS 'professional'`);
        console.log('✅ Package enum: 4 neue Werte');
        const r1 = await client.query(`UPDATE tenants SET package = 'page' WHERE package = 'starter'`);
        const r2 = await client.query(`UPDATE tenants SET package = 'professional' WHERE package = 'enterprise'`);
        console.log(`✅ Tenants: ${r1.rowCount} starter→page, ${r2.rowCount} enterprise→professional`);
        await client.query(`UPDATE subscriptions SET package = 'page' WHERE package = 'starter'`);
        await client.query(`UPDATE subscriptions SET package = 'professional' WHERE package = 'enterprise'`);
        console.log('✅ Subscriptions migriert');
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'shop_module'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'newsletter'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'booking'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'ai_content'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'form_builder'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'i18n'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'extra_products'`);
        await client.query(`ALTER TYPE "addon_type" ADD VALUE IF NOT EXISTS 'extra_ai_credits'`);
        console.log('✅ Addon enum: 8 neue Werte');
        console.log('\n🎉 Migration fertig!');
    }
    finally {
        client.release();
        await pool.end();
    }
}
migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-packages.js.map