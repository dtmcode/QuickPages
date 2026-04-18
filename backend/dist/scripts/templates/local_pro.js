"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Apotheke (local_pro)';
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
        name: TEMPLATE_NAME,
        description: 'Apotheke mit Online-Vorbestellung, Lieferung und Beratungsservice',
        category: 'local_pro',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'local_pro', niche: 'apotheke', colors: { primary: '#006D77', secondary: '#005a62', accent: '#E8F4F5', background: '#ffffff', text: '#1a1a1a' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'Apotheke am Markt Frankfurt — Ihre Gesundheit, unser Auftrag',
                subheading: 'Medikamente online vorbestellen, abholen oder liefern lassen. Persönliche Beratung durch unsere Apothekerinnen — vor Ort oder per Video.',
                buttonText: 'Medikament vorbestellen', buttonLink: '/bestellen',
                secondaryButtonText: 'Beratungstermin buchen', secondaryButtonLink: '/beratung',
                imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1400&h=600&fit=crop',
                badge: '💊 Lieferung innerhalb von 2 Stunden · Mo–Sa',
            },
            styling: { backgroundColor: '#006D77', textColor: '#ffffff' },
        },
        {
            pageId: home.id, name: 'Services', type: 'features', order: 1,
            content: {
                heading: 'Unsere Services',
                items: [
                    { icon: '📦', title: 'Click & Collect', description: 'Medikament online reservieren, innerhalb von 30 Minuten abholen. Kein Warten mehr!' },
                    { icon: '🚚', title: 'Heimlieferung', description: 'Lieferung in Frankfurt und Umgebung (10km) innerhalb von 2 Stunden. Versandkostenfrei ab 15€.' },
                    { icon: '📹', title: 'Video-Beratung', description: 'Bequeme Beratung durch unsere Apothekerinnen per Video — Termin in 24h verfügbar.' },
                    { icon: '💉', title: 'Impfservice', description: 'Grippe, COVID, Reiseimpfungen — direkt in der Apotheke, ohne Arztbesuch.' },
                ],
            },
            styling: { backgroundColor: '#E8F4F5', textColor: '#1a1a1a' },
        },
        {
            pageId: home.id, name: 'Kategorien', type: 'features', order: 2,
            content: {
                heading: 'Sortiment',
                subtitle: 'Über 20.000 Produkte — rezeptpflichtig und frei verkäuflich',
                items: [
                    { icon: '💊', title: 'Rezeptpflichtige Medikamente', description: 'E-Rezept per App oder Foto einreichen — wir bereiten alles vor.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=250&fit=crop' },
                    { icon: '🌿', title: 'Naturheilkunde & Homöopathie', description: 'Große Auswahl an Kräutermedizin, Bachblüten und pflanzlichen Präparaten.', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop' },
                    { icon: '🧴', title: 'Kosmetik & Dermatologie', description: 'Pharmazeutische Hautpflege von La Roche-Posay, Eucerin, Avène und mehr.', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop' },
                    { icon: '👶', title: 'Baby & Familie', description: 'Alles für Schwangerschaft, Stillzeit und die ersten Lebensjahre.', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=250&fit=crop' },
                ],
            },
        },
        {
            pageId: home.id, name: 'Team', type: 'about', order: 3,
            content: {
                heading: 'Ihr Team',
                text: `<p>Apothekerin Dr. Sabine Hartmann leitet die Apotheke am Markt seit 2008 mit einem Team aus 8 Apothekerinnen und PTAs. Der Fokus liegt auf persönlicher Beratung — nicht auf Massenverkauf.</p>
<p>Wir sind eine unabhängige Apotheke ohne Kettenzugehörigkeit. Das bedeutet: Wir empfehlen was hilft, nicht was am meisten Marge bringt.</p>
<p>Seit 2024 bieten wir Video-Beratungen und 2-Stunden-Lieferung an — weil Gesundheit nicht bis morgen warten sollte.</p>`,
                imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&h=500&fit=crop',
                highlights: ['Unabhängig · Keine Kettenbindung', '8 approbierte Apothekerinnen', 'Video-Beratung verfügbar', 'E-Rezept akzeptiert'],
            },
        },
        {
            pageId: home.id, name: 'Kontakt', type: 'contact', order: 4,
            content: {
                heading: 'Kontakt & Öffnungszeiten',
                subheading: 'Oder bestell direkt online mit 2-Stunden-Lieferung.',
                buttonText: 'Jetzt bestellen',
                details: {
                    phone: '+49 69 112233', email: 'info@apotheke-am-markt-ffm.de',
                    address: 'Konstablerwache 14, 60313 Frankfurt am Main',
                    hours: 'Mo–Fr 8:00–19:00 · Sa 8:30–16:00',
                },
            },
            styling: { backgroundColor: '#006D77', textColor: '#ffffff' },
        },
    ]);
    console.log('✅ local_pro — Apotheke am Markt, Frankfurt');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=local_pro.js.map