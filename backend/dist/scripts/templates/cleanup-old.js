"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const KEEP_CATEGORIES = [
    'website', 'blog', 'business', 'shop', 'members',
    'landing',
    'friseur', 'arzt', 'restaurant', 'fitness',
    'immobilien', 'kanzlei', 'handwerk', 'therapie',
    'website_micro', 'website_standard', 'website_pro',
    'blog_personal', 'blog_publisher', 'blog_magazine',
    'business_starter', 'business_professional', 'business_agency',
    'shop_mini', 'shop_wachstum', 'shop_premium',
    'members_community', 'members_kurse', 'members_academy',
];
const DELETE_CATEGORIES = [
    'creative',
    'ecommerce',
    'portfolio',
    'onepage',
];
async function main() {
    const dryRun = process.argv.includes('--dry-run');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  Cleanup: v1 + v2 Templates entfernen           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    if (dryRun)
        console.log('🔍 DRY-RUN — es wird nichts gelöscht\n');
    const toDelete = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id, name: website_builder_schema_1.wbGlobalTemplates.name, category: website_builder_schema_1.wbGlobalTemplates.category })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.inArray)(website_builder_schema_1.wbGlobalTemplates.category, DELETE_CATEGORIES));
    if (toDelete.length === 0) {
        console.log('✅ Keine alten Templates gefunden — DB ist bereits sauber.\n');
        await pool.end();
        return;
    }
    console.log(`🗑️  Templates die gelöscht werden (${toDelete.length}):\n`);
    toDelete.forEach(t => console.log(`   ❌ "${t.name}" [${t.category}]`));
    const toKeep = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id, name: website_builder_schema_1.wbGlobalTemplates.name, category: website_builder_schema_1.wbGlobalTemplates.category })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.notInArray)(website_builder_schema_1.wbGlobalTemplates.category, DELETE_CATEGORIES));
    console.log(`\n✅ Templates die behalten werden (${toKeep.length}):\n`);
    const byCategory = toKeep.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
    }, {});
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
        .delete(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.inArray)(website_builder_schema_1.wbGlobalTemplates.category, DELETE_CATEGORIES))
        .returning({ name: website_builder_schema_1.wbGlobalTemplates.name });
    console.log(`✅ ${deleted.length} Templates gelöscht.\n`);
    const total = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates);
    console.log(`📊 Templates in der DB: ${total.length}\n`);
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=cleanup-old.js.map