"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Yoga Community (members_community)';
async function main() {
    const force = process.argv.includes('--force');
    const [ex] = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
    if (ex && !force) {
        console.log('⏭️  Existiert bereits.');
        await pool.end();
        return;
    }
    if (ex)
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, ex.id));
    const [t] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME, description: 'Geschlossene Yoga-Community mit Mitgliederbereich, Downloads und Events',
        category: 'members_community', thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'members_community', niche: 'yoga', colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#ede9fe', background: '#fdfcff', text: '#1a1a2e' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Prana Circle — Deine Yoga & Wellness Community', subheading: 'Geführte Meditationen, Yoga-Flows, Atemübungen und eine Community die dich trägt. Alles an einem Ort, für dich und deinen Alltag.', buttonText: 'Mitglied werden', buttonLink: '#mitgliedschaft', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&h=600&fit=crop', badge: '🧘 85 aktive Mitglieder · Täglich neue Inhalte' }, styling: { backgroundColor: '#7c3aed', textColor: '#ffffff' } },
        { pageId: home.id, name: 'Was du bekommst', type: 'features', order: 1, content: { heading: 'Was die Mitgliedschaft beinhaltet', items: [
                    { icon: '🧘', title: 'Yoga für jeden Level', description: 'Von sanftem Yin bis dynamischem Vinyasa — 40+ Videos in deinem Mitgliederbereich.' },
                    { icon: '🫁', title: 'Atemarbeit & Pranayama', description: 'Breathwork-Sessions die du morgens, abends oder in der Mittagspause machen kannst.' },
                    { icon: '🧠', title: 'Geführte Meditationen', description: '10 bis 45 Minuten. Schlafmeditation, Fokus, Angstbewältigung und vieles mehr.' },
                    { icon: '👥', title: 'Community & Live-Events', description: 'Monatliche Zoom-Circles, Challenges und eine aktive WhatsApp-Gruppe.' },
                ] } },
        { pageId: home.id, name: 'Über Saranya', type: 'about', order: 2, content: { heading: 'Saranya Krishnan — deine Lehrerin', text: '<p>Saranya hat Yoga in Mysore bei BKS Iyengar gelernt und unterrichtet seit 2014 in Berlin. 2021 gründete sie den Prana Circle als digitale Erweiterung ihres Studios.</p><p>Ihre Unterrichtsstil verbindet traditionelle indische Yogaphilosophie mit moderner Neuropsychologie — praxisnah, ohne esoterischen Overhead.</p>', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', highlights: ['12 Jahre Unterrichtserfahrung', 'Ausgebildet in Mysore', '85 Community-Mitglieder', '200+ Stunden Content'] } },
        { pageId: home.id, name: 'Mitgliedschaft', type: 'features', order: 3, content: { heading: 'Werde Mitglied', items: [
                    { title: 'Monatlich', description: 'Zugang zu allen Inhalten, Community und Live-Events. Monatlich kündbar.', price: '29€/Monat' },
                    { title: 'Jährlich', description: 'Alle Vorteile + 2 Monate gratis. Einmaliger Jahrsbeitrag.', price: '249€/Jahr', badge: '⭐ Empfohlen' },
                ] } },
        { pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 4, content: { heading: 'Community-Stimmen', items: [
                    { title: 'Maria H., Berlin', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich habe 3 andere Yoga-Apps ausprobiert. Prana Circle ist anders — Saranya redet nicht um den heißen Brei herum. Konkret, warm, alltagstauglich.' },
                    { title: 'Thomas R., Hamburg', subtitle: '⭐⭐⭐⭐⭐', description: 'Als Mann war ich skeptisch. Aber die Community ist super divers und die Meditationen haben meinen Schlaf tatsächlich verbessert. Nach 3 Monaten würde ich es nicht mehr missen.' },
                ] } },
        { pageId: home.id, name: 'Kontakt', type: 'contact', order: 5, content: { heading: 'Fragen zur Mitgliedschaft?', subheading: 'Ich beantworte alle Fragen persönlich.', buttonText: 'Nachricht schreiben', details: { email: 'hallo@prana-circle.de' } }, styling: { backgroundColor: '#7c3aed', textColor: '#ffffff' } },
    ]);
    console.log('✅ members_community — Prana Circle Yoga Community');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=members_community.js.map