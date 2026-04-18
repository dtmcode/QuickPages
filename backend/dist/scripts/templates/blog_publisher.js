"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Finance Blog (blog_publisher)';
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
        name: TEMPLATE_NAME, description: 'Personal Finance Blog mit Newsletter, Autoren und professionellem Layout',
        category: 'blog_publisher', thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'blog_publisher', niche: 'finanzen', colors: { primary: '#1d3557', secondary: '#163041', accent: '#a8dadc', background: '#ffffff', text: '#1a1a1a' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Klug Sparen — Finanzen einfach erklärt', subheading: 'ETF-Sparpläne, Budgeting, Steuertipps für Angestellte und Selbstständige. Ohne Finanzlatein. Ohne versteckte Produktempfehlungen.', buttonText: 'Zum Blog', buttonLink: '/blog', secondaryButtonText: 'Newsletter abonnieren', secondaryButtonLink: '#newsletter', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&h=600&fit=crop', badge: '📊 18.500 Newsletter-Abonnenten' }, styling: { backgroundColor: '#1d3557', textColor: '#ffffff' } },
        { pageId: home.id, name: 'Kategorien', type: 'features', order: 1, content: { heading: 'Themen', items: [
                    { icon: '📈', title: 'ETF & Aktien', description: 'Wie du mit einem einfachen ETF-Sparplan langfristig Vermögen aufbaust — ohne Finanzberater.' },
                    { icon: '💳', title: 'Budgeting', description: 'Die 50-30-20-Regel in der Praxis. Budgetvorlagen die wirklich funktionieren.' },
                    { icon: '🏠', title: 'Immobilien', description: 'Kaufen oder mieten? Rechenbeispiele für deutsche Städte. Ohne Märchen.' },
                    { icon: '📋', title: 'Steuern', description: 'Steuererklärung für Angestellte: Welche Absetzungen du wahrscheinlich vergisst.' },
                ] } },
        { pageId: home.id, name: 'Neueste Artikel', type: 'features', order: 2, content: { heading: 'Neueste Artikel', items: [
                    { title: 'ETF-Sparplan 2024: Der komplette Leitfaden', description: 'Von der Wahl des Brokers bis zur ersten Order. Schritt für Schritt für Einsteiger.', price: '12 Min.', imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop' },
                    { title: 'Meine Steuererklärung: 1.840€ Erstattung mit diesen 8 Tipps', description: 'Homeoffice-Pauschale, Arbeitsmittel, Fortbildungskosten — was du als Angestellter absetzen kannst.', price: '9 Min.', imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop' },
                    { title: 'Kaufen oder Mieten in München 2024: Die ehrliche Rechnung', description: 'Mit realen Zahlen durchgerechnet. Das Ergebnis hat mich überrascht.', price: '7 Min.', imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop' },
                ], ctaText: 'Alle Artikel →', ctaLink: '/blog' } },
        { pageId: home.id, name: 'Newsletter', type: 'contact', order: 3, content: { heading: 'Jeden Montag: Ein Finanztipp der wirklich hilft', subheading: '18.500 Leser bekommen wöchentlich konkrete Tipps zu ETFs, Steuern und Budgeting — ohne Spam, ohne Produktwerbung.', buttonText: 'Kostenlos abonnieren', isNewsletter: true }, styling: { backgroundColor: '#a8dadc', textColor: '#1d3557' } },
        { pageId: home.id, name: 'Autoren', type: 'about', order: 4, content: { heading: 'Über Klug Sparen', text: '<p><strong>Tim Hoffmann</strong>, ehemaliger Steuerberater, gründete Klug Sparen 2020 aus Frustration: Seine Klienten zahlten für Finanzberatung und bekamen trotzdem schlechte Tipps.</p><p>Heute schreibt das Team aus 3 Autoren — alle mit Fachausbildung in Finance, Steuerrecht oder Wirtschaft. Keine Produktprovisionen, keine bezahlten Empfehlungen. Nur ehrliche Recherche.</p>', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', highlights: ['18.500 Abonnenten', 'Ehemaliger Steuerberater', 'Keine Provision', '3 Fach-Autoren'] } },
    ]);
    console.log('✅ blog_publisher — Klug Sparen Finance Blog');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=blog_publisher.js.map