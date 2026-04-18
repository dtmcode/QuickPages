"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Reiseblog (blog_personal)';
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
        name: TEMPLATE_NAME, description: 'Persönlicher Reiseblog mit Stories, Tipps und Reiseinspiration',
        category: 'blog_personal', thumbnailUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'blog_personal', niche: 'reiseblog', colors: { primary: '#e76f51', secondary: '#c85a3c', accent: '#fef4ef', background: '#fafaf8', text: '#1a1a1a' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Fernweh — Reisen. Erleben. Erzählen.', subheading: 'Ich bin Anna, 31, und seit 4 Jahren lebe ich aus einem 65L-Rucksack. Hier teile ich ehrliche Reiseberichte, praktische Tipps und alles was du brauchst um loszulegen.', buttonText: 'Neueste Artikel', buttonLink: '/blog', imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&h=700&fit=crop', badge: '🌍 Bereits in 47 Ländern' }, styling: { backgroundColor: '#e76f51', textColor: '#ffffff' } },
        { pageId: home.id, name: 'Kategorien', type: 'features', order: 1, content: { heading: 'Beliebte Kategorien', items: [
                    { icon: '🏔️', title: 'Trekking & Natur', description: 'Von Patagonien bis Nepal — Trekking-Berichte, Packlisten und was du wirklich brauchst.', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop' },
                    { icon: '🏙️', title: 'Städtereisen', description: 'Geheimtipps für Bangkok, Istanbul, Buenos Aires — abseits der üblichen Touristenpfade.', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop' },
                    { icon: '💰', title: 'Budget Reisen', description: 'Wie ich 6 Monate in Südamerika mit 1.800€ gereist bin. Echte Zahlen, keine Märchen.', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop' },
                ] }, },
        { pageId: home.id, name: 'Aktuelle Artikel', type: 'features', order: 2, content: { heading: 'Aktuelle Artikel', items: [
                    { title: '14 Tage Nepal: Annapurna Circuit ohne Agentur', description: 'Permit, Route, Unterkunft und Kosten — alles was du für den Annapurna Circuit brauchst ohne teure Agentur.', price: '8 Min. Lesezeit', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop' },
                    { title: 'Istanbul in 4 Tagen: Was ich beim 3. Mal erst entdeckt habe', description: 'Kapalıçarşı kennt jeder. Aber das Fener-Viertel, die Prinzeninseln und dieser Fischmarkt...', price: '6 Min. Lesezeit', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=250&fit=crop' },
                    { title: 'Meine ehrliche Packliste nach 47 Ländern', description: 'Was ich heute einpacke vs. was ich als Anfängerin dachte zu brauchen. Spoiler: Viel weniger.', price: '5 Min. Lesezeit', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop' },
                ], ctaText: 'Alle Artikel →', ctaLink: '/blog' }, },
        { pageId: home.id, name: 'Über mich', type: 'about', order: 3, content: { heading: 'Hallo, ich bin Anna!', text: '<p>2020 habe ich meinen Job als Marketingmanagerin in Frankfurt gekündigt, meine Wohnung aufgelöst und bin mit einem One-Way-Ticket nach Bangkok geflogen. Seitdem bin ich nicht mehr "richtig" wohnsesshaft.</p><p>Auf Fernweh schreibe ich ehrlich: Über wunderschöne Momente, aber auch über Durchfall in Peru, Betrug in Marokko und warum ich manchmal weine und trotzdem weitermache. Kein Hochglanz-Travel, echtes Leben.</p>', imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop', highlights: ['47 bereiste Länder', '4 Jahre Vollzeit-Reisen', 'Solo-Reisende seit 2020', '15.000 Newsletter-Leser'] }, },
        { pageId: home.id, name: 'Newsletter', type: 'contact', order: 4, content: { heading: 'Kein Artikel verpassen', subheading: 'Jeden Montag: Ein ehrlicher Reisebericht, ein Tipp der wirklich hilft und manchmal ein Einblick hinter die Kulissen.', buttonText: 'Abonnieren', isNewsletter: true }, styling: { backgroundColor: '#e76f51', textColor: '#ffffff' } },
    ]);
    const [ueber] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Über mich', slug: '/ueber-mich', isHomepage: false, order: 1 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values({ pageId: ueber.id, name: 'Story', type: 'about', order: 0, content: { heading: 'Meine Geschichte', text: '<p>Ich war nie jemand der "reist". Urlaub hieß Pauschalreise nach Mallorca. Dann kam 2019, ein Burnout und die Frage: Wofür arbeitest du eigentlich?</p><p>Ein Jahr später: Bangkok, allein, mit mehr Angst als Aufregung. Heute, 47 Länder später, ist Reisen meine Art zu leben — und Fernweh mein Weg das zu teilen.</p>', imageUrl: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=800&h=500&fit=crop' } });
    console.log('✅ blog_personal — Reiseblog Fernweh');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=blog_personal.js.map