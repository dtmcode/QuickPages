"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Online Magazin (blog_magazine)';
async function main() {
    const force = process.argv.includes('--force');
    const [existing] = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
    if (existing && !force) {
        console.log('⏭️  Existiert bereits.');
        await pool.end();
        return;
    }
    if (existing)
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, existing.id));
    const [t] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME, description: 'Professionelles Online-Magazin mit Redaktion, Newsletter und mehrsprachigem Content',
        category: 'blog_magazine', thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'blog_magazine', niche: 'nachhaltigkeit', colors: { primary: '#2d6a4f', secondary: '#1b4332', accent: '#52b788', background: '#fafff9', text: '#1a2e1a' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Grüne Wende — Das Magazin für nachhaltiges Leben', subheading: 'Klimajournalismus der wirkt. Lösungen statt Apokalypse. Von unserer 8-köpfigen Redaktion, für 45.000 Leser täglich.', buttonText: 'Neueste Artikel', buttonLink: '/blog', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&h=600&fit=crop', badge: '🌿 45.000 tägliche Leser · 5.000 Newsletter-Abonnenten' }, styling: { backgroundColor: '#1b4332', textColor: '#d8f3dc' } },
        { pageId: home.id, name: 'Ressorts', type: 'features', order: 1, content: { heading: 'Ressorts', items: [
                    { icon: '⚡', title: 'Energie & Klima', description: 'Erneuerbare Energien, Klimapolitik und was du selbst tun kannst.' },
                    { icon: '🥦', title: 'Ernährung', description: 'Pflanzliche Ernährung, Lebensmittelverschwendung, nachhaltige Landwirtschaft.' },
                    { icon: '🏙️', title: 'Städte & Wohnen', description: 'Nachhaltige Architektur, urbane Gärten, klimaneutrale Städte.' },
                    { icon: '💼', title: 'Wirtschaft', description: 'Green Finance, nachhaltige Investments, ESG-Ratings.' },
                ] } },
        { pageId: home.id, name: 'Titelgeschichten', type: 'features', order: 2, content: { heading: 'Titelgeschichten dieser Woche', items: [
                    { title: 'Warum Wasserstoff nicht die Lösung ist — und was stattdessen kommt', description: 'Eine kritische Analyse des Wasserstoff-Hypes und welche Technologien wirklich skalieren können.', price: 'Energie · 15 Min.', imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop' },
                    { title: 'Interview: "Die Agrarwende ist machbar — aber nicht so wie geplant"', description: 'Landwirtin Maria Kern über Biobauernhöfe, EU-Agrarpolitik und was Verbraucher wirklich bewirken können.', price: 'Ernährung · 11 Min.', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=250&fit=crop' },
                    { title: 'Die 10 nachhaltigsten Städte Deutschlands 2024', description: 'Von Freiburg bis Münster — welche Kommunen wirklich liefern und was andere davon lernen können.', price: 'Städte · 9 Min.', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop' },
                ], ctaText: 'Alle Artikel →', ctaLink: '/blog' } },
        { pageId: home.id, name: 'Newsletter', type: 'contact', order: 3, content: { heading: 'Grüne Wende Newsletter', subheading: 'Die 5 wichtigsten Nachhaltigkeitsnews der Woche — jeden Freitag, kostenlos.', buttonText: 'Abonnieren', isNewsletter: true }, styling: { backgroundColor: '#d8f3dc', textColor: '#1b4332' } },
    ]);
    console.log('✅ blog_magazine — Grüne Wende Online-Magazin');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=blog_magazine.js.map