"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Online Kurs (members_kurse)';
async function main() {
    const force = process.argv.includes('--force');
    const [ex] = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
    if (ex && !force) {
        console.log('⏭️  Existiert bereits. --force zum Überschreiben.');
        await pool.end();
        return;
    }
    if (ex)
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, ex.id));
    const [t] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME,
        description: 'Online-Kurs Plattform für Digital Marketing mit Videos, Downloads und Community',
        category: 'members_kurse',
        thumbnailUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: {
            package: 'members_kurse', niche: 'online-kurs-marketing',
            colors: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#e0f2fe', background: '#ffffff', text: '#0c1b2d' },
        },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'Digital Marketing Masterclass — Von 0 auf 10.000 Kunden',
                subheading: 'Der komplette Kurs für selbstständige Unternehmer und Marketing-Einsteiger. SEO, Social Media, Email-Marketing und bezahlte Werbung — in 8 Wochen.',
                buttonText: 'Jetzt einschreiben', buttonLink: '#einschreibung',
                secondaryButtonText: 'Curriculum ansehen', secondaryButtonLink: '/curriculum',
                imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1400&h=600&fit=crop',
                badge: '🎓 1.240 Absolventen · Ø Bewertung 4,8/5',
            },
            styling: { backgroundColor: '#0ea5e9', textColor: '#ffffff' },
        },
        {
            pageId: home.id, name: 'Ergebnisse', type: 'stats', order: 1,
            content: {
                items: [
                    { value: '1.240', label: 'Absolventen', description: 'Seit 2021' },
                    { value: '8 Wo', label: 'Kursdauer', description: '2–4h pro Woche' },
                    { value: '4.8★', label: 'Bewertung', description: 'Aus 380 Rezensionen' },
                    { value: '+340%', label: 'Ø Traffic', description: 'Absolventen nach 6 Monaten' },
                ],
            },
            styling: { backgroundColor: '#e0f2fe', textColor: '#0c1b2d' },
        },
        {
            pageId: home.id, name: 'Kursinhalt', type: 'features', order: 2,
            content: {
                heading: 'Was du lernst',
                subtitle: '8 Module · 60+ Lektionen · 12h Videomaterial',
                items: [
                    { icon: '🎯', title: 'Modul 1–2: Strategie & Zielgruppe', description: 'Buyer Persona, Marktanalyse, Positionierung. Ohne Fundament kein Marketing.' },
                    { icon: '🔍', title: 'Modul 3: SEO von Grund auf', description: 'Keyword-Recherche, On-Page, Backlinks. Organisch wachsen ohne Werbebudget.' },
                    { icon: '📱', title: 'Modul 4: Social Media Systeme', description: 'Content-Strategie, Redaktionsplanung, Algorithmen — für Instagram, LinkedIn und TikTok.' },
                    { icon: '📧', title: 'Modul 5: Email Marketing', description: 'Liste aufbauen, Sequenzen schreiben, automatisieren. Das rentabelste Kanal.' },
                    { icon: '💰', title: 'Modul 6–7: Google & Meta Ads', description: 'Kampagnen aufsetzen, optimieren, skalieren. Mit echten Budget-Beispielen.' },
                    { icon: '📊', title: 'Modul 8: Analytics & Optimierung', description: 'Google Analytics 4, Conversion-Tracking, datenbasierte Entscheidungen.' },
                ],
                ctaText: 'Vollständiges Curriculum →', ctaLink: '/curriculum',
            },
        },
        {
            pageId: home.id, name: 'Über den Instructor', type: 'about', order: 3,
            content: {
                heading: 'Jonas Krause — dein Instructor',
                text: `<p>Jonas Krause ist Head of Growth bei einem Berliner SaaS-Unternehmen und hat nebenbei Marketing-Teams für über 80 KMUs aufgebaut. 2021 hat er sein Wissen in diesen Kurs gepackt — weil er zu viel Geld für schlechte Kurse verschwendet hat.</p>
<p>Kein Theorie-Overhead, keine 4h-Lectures. Jede Lektion hat eine konkrete Aufgabe die du sofort umsetzen kannst. Ergebnis nach 8 Wochen: ein komplettes Marketing-System das läuft.</p>`,
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                highlights: ['80+ betreute Unternehmen', 'Head of Growth · Berliner SaaS', '1.240 Kurs-Absolventen', '15 Jahre Marketing-Erfahrung'],
            },
        },
        {
            pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 4,
            content: {
                heading: 'Was Absolventen sagen',
                items: [
                    { title: 'Sandra L., Inhaberin Blumenatelier', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich hatte kein Marketing-Budget und keine Ahnung. Nach 8 Wochen: 340% mehr Website-Besucher, erste Kunden über Instagram, Email-Liste mit 800 Personen. Der Kurs hat sich in 2 Monaten amortisiert.', date: 'März 2024' },
                    { title: 'Markus F., Freelance Designer', subtitle: '⭐⭐⭐⭐⭐', description: 'Das SEO-Modul allein war den Kaufpreis wert. Meine Hauptseite rankt jetzt auf Position 3 für "Webdesigner Frankfurt". Das sind 4–6 qualifizierte Anfragen pro Monat.', date: 'Januar 2024' },
                    { title: 'Petra M., Online-Shop Inhaberin', subtitle: '⭐⭐⭐⭐⭐', description: 'Endlich ein Kurs der nicht einfach Screenshots von Tools zeigt, sondern erklärt WARUM man was macht. Nach Meta Ads Modul: ROAS von 1,2 auf 3,8 verbessert.', date: 'Februar 2024' },
                ],
            },
            styling: { backgroundColor: '#f0f9ff', textColor: '#0c1b2d' },
        },
        {
            pageId: home.id, name: 'Einschreibung', type: 'features', order: 5,
            content: {
                heading: 'Jetzt einschreiben',
                subtitle: 'Wähle deinen Zugang',
                items: [
                    { icon: '📚', title: 'Kurs Only', description: '60+ Lektionen · 12h Video · Lifetime-Zugang · Downloads & Templates', price: '497€' },
                    { icon: '👥', title: 'Kurs + Community', description: 'Alles aus Kurs Only + Private Slack-Community + monatliche Gruppen-Calls', price: '697€', badge: '⭐ Empfohlen' },
                    { icon: '🎯', title: 'Kurs + 1:1 Coaching', description: 'Alles aus Community + 3× 60min 1:1 mit Jonas', price: '1.297€' },
                ],
            },
        },
        {
            pageId: home.id, name: 'FAQ', type: 'faq', order: 6,
            content: {
                heading: 'Häufige Fragen',
                items: [
                    { question: 'Für wen ist der Kurs geeignet?', answer: 'Für Selbstständige, Freelancer und Angestellte die Marketing-Verantwortung übernehmen. Keine Vorkenntnisse nötig — wir starten bei 0.' },
                    { question: 'Wie lange habe ich Zugang?', answer: 'Lifetime. Alle Updates und neues Lektionen inklusive — für immer.' },
                    { question: 'Gibt es eine Geld-zurück-Garantie?', answer: 'Ja. 30 Tage Geld-zurück-Garantie ohne Fragen. Wenn der Kurs nichts für dich ist, bekommst du alles zurück.' },
                    { question: 'Wie viel Zeit brauche ich pro Woche?', answer: '2–4 Stunden reichen. Der Kurs ist für Leute designed die nebenbei lernen.' },
                ],
            },
        },
    ]);
    const [curriculum] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: t.id, name: 'Curriculum', slug: '/curriculum', isHomepage: false, order: 1,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: curriculum.id, name: 'Header', type: 'hero', order: 0,
            content: { heading: 'Kurs-Curriculum', subheading: '8 Module · 60+ Lektionen · 12 Stunden Videomaterial', minimal: true },
            styling: { backgroundColor: '#0ea5e9', textColor: '#ffffff' },
        },
        {
            pageId: curriculum.id, name: 'Module', type: 'features', order: 1,
            content: {
                heading: 'Alle Module im Überblick',
                items: [
                    { title: 'Modul 1: Marketing Mindset & Strategie', description: '8 Lektionen · 90 Min. · Positionierung, Ziele, Mindset' },
                    { title: 'Modul 2: Zielgruppe & Buyer Persona', description: '6 Lektionen · 75 Min. · Interviews, Research, Templates' },
                    { title: 'Modul 3: SEO von Null', description: '10 Lektionen · 150 Min. · KW-Recherche, On-Page, Backlinks' },
                    { title: 'Modul 4: Social Media Systeme', description: '8 Lektionen · 120 Min. · Instagram, LinkedIn, TikTok, Content-Planung' },
                    { title: 'Modul 5: Email Marketing', description: '8 Lektionen · 110 Min. · Liste aufbauen, Sequenzen, Automations' },
                    { title: 'Modul 6: Google Ads', description: '8 Lektionen · 120 Min. · Search, Display, Shopping' },
                    { title: 'Modul 7: Meta Ads', description: '7 Lektionen · 105 Min. · Facebook, Instagram, Retargeting' },
                    { title: 'Modul 8: Analytics & Skalierung', description: '5 Lektionen · 75 Min. · GA4, Tracking, Datenkultur' },
                ],
            },
        },
    ]);
    console.log('✅ members_kurse — Digital Marketing Masterclass');
    console.log('   Seiten: Startseite (7 Sections) + Curriculum');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=members_kurse.js.map