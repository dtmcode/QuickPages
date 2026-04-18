"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Lead Funnel (funnels_starter)';
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
        description: 'Immobilien-Lead-Funnel mit Opt-in und automatischer Follow-up-Sequenz',
        category: 'funnels_starter',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'funnels_starter', niche: 'immobilien', colors: { primary: '#1e3a5f', secondary: '#152b47', accent: '#f0c040', background: '#ffffff', text: '#1a1a1a' } },
    }).returning();
    const [optin] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Lead Magnet', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: optin.id, name: 'Hero Opt-in', type: 'hero', order: 0,
            content: {
                heading: 'Der kostenlose Immobilien-Ratgeber 2024',
                subheading: 'Erfahre die 7 häufigsten Fehler beim Immobilienkauf — und wie du sie vermeidest. PDF sofort zum Download nach Anmeldung.',
                buttonText: 'Ratgeber kostenlos herunterladen', buttonLink: '#optin',
                imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&h=600&fit=crop',
                badge: '📥 Sofort-Download · Kein Spam · Jederzeit abmeldbar',
            },
            styling: { backgroundColor: '#1e3a5f', textColor: '#ffffff' },
        },
        {
            pageId: optin.id, name: 'Was du bekommst', type: 'features', order: 1,
            content: {
                heading: 'Im kostenlosen Ratgeber:',
                items: [
                    { icon: '❌', title: 'Fehler #1: Falsche Lagebeurteilung', description: 'Warum "gute Lage" nicht gleich "gute Investition" ist — und wie du wirklich bewertest.' },
                    { icon: '💰', title: 'Fehler #2: Finanzierungsfallen', description: 'Die 3 versteckten Kosten die 80% der Käufer unterschätzen.' },
                    { icon: '📋', title: 'Fehler #3: Checkliste Besichtigung', description: 'Was du unbedingt prüfen musst — bevor du ein Angebot machst.' },
                    { icon: '🔑', title: 'BONUS: Verhandlungsskript', description: 'Wie du 5–15% vom Kaufpreis verhandelst — mit echten Beispielsätzen.' },
                ],
            },
            styling: { backgroundColor: '#f8f9fa', textColor: '#1a1a1a' },
        },
        {
            pageId: optin.id, name: 'Opt-in Formular', type: 'contact', order: 2,
            content: {
                heading: 'Ratgeber jetzt herunterladen',
                subheading: 'Gib deine E-Mail-Adresse ein — wir senden dir den Link sofort zu.',
                buttonText: 'Jetzt kostenlos herunterladen', isNewsletter: true,
                incentive: 'PDF-RATGEBER-2024',
            },
            styling: { backgroundColor: '#f0c040', textColor: '#1e3a5f' },
        },
        {
            pageId: optin.id, name: 'Social Proof', type: 'testimonials', order: 3,
            content: {
                heading: 'Was andere sagen',
                items: [
                    { title: 'Michael K., Stuttgart', subtitle: '⭐⭐⭐⭐⭐', description: 'Dank des Ratgebers habe ich beim Kauf meiner Wohnung 18.000€ verhandelt. Der Verhandlungsleitfaden allein ist Gold wert.' },
                    { title: 'Sabrina M., Frankfurt', subtitle: '⭐⭐⭐⭐⭐', description: 'Als Erstkäuferin hatte ich keine Ahnung von Immobilien. Dieser Ratgeber hat mir in 2 Stunden mehr beigebracht als 10 YouTube-Videos.' },
                ],
            },
        },
    ]);
    const [danke] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Danke', slug: '/danke', isHomepage: false, order: 1 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values({
        pageId: danke.id, name: 'Danke Hero', type: 'hero', order: 0,
        content: {
            heading: '✅ Du bekommst eine E-Mail in den nächsten 2 Minuten!',
            subheading: 'Schau auch in deinen Spam-Ordner. Während du wartest: Folge uns auf LinkedIn für tägliche Immobilien-Tipps.',
            buttonText: 'Auf LinkedIn folgen', buttonLink: '#',
        },
        styling: { backgroundColor: '#1e3a5f', textColor: '#ffffff' },
    });
    console.log('✅ funnels_starter — Immobilien Lead Funnel');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=funnels_starter.js.map