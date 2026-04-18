"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — SaaS Launch Funnel (funnels_premium)';
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
        description: 'Vollständiger SaaS-Launch-Funnel mit Waitlist, Sales Page, Upsell und Onboarding',
        category: 'funnels_premium',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'funnels_premium', niche: 'saas', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#3b82f6', background: '#ffffff', text: '#0f172a' } },
    }).returning();
    const [waitlist] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Waitlist', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: waitlist.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'CloudDesk — Das Projektmanagement-Tool das endlich funktioniert',
                subheading: 'Asana ist zu komplex. Trello zu simpel. CloudDesk ist genau richtig — für Teams zwischen 5 und 50 Personen die einfach Dinge erledigen wollen.',
                buttonText: 'Waitlist beitreten — kostenlos', buttonLink: '#waitlist',
                imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=600&fit=crop',
                badge: '🚀 Beta-Launch Q2 2024 · 2.847 auf der Waitlist',
            },
            styling: { backgroundColor: '#0f172a', textColor: '#ffffff' },
        },
        {
            pageId: waitlist.id, name: 'Problem', type: 'features', order: 1,
            content: {
                heading: 'Kennst du das?',
                items: [
                    { icon: '😤', title: 'Asana-Chaos', description: 'Du bezahlst 800€/Monat für Features die du nie nutzt und dein Team benutzt es trotzdem nicht richtig.' },
                    { icon: '📧', title: 'E-Mail-Hölle', description: 'Wichtige Entscheidungen sind irgendwo in E-Mail-Threads begraben. Niemand findet was.' },
                    { icon: '🤦', title: 'Meeting-Wahn', description: 'Stundenlange Status-Meetings weil niemand weiß was der andere gerade macht.' },
                ],
            },
            styling: { backgroundColor: '#fef2f2', textColor: '#0f172a' },
        },
        {
            pageId: waitlist.id, name: 'Lösung', type: 'features', order: 2,
            content: {
                heading: 'CloudDesk löst das',
                items: [
                    { icon: '⚡', title: '2-Minuten Setup', description: 'Projekt anlegen, Team einladen, loslegen. Keine Onboarding-Sessions, keine IT-Abteilung nötig.' },
                    { icon: '🎯', title: 'Fokus-Board', description: 'Jeder sieht genau seine 3 wichtigsten Tasks für heute. Kein Information-Overload.' },
                    { icon: '🤖', title: 'AI-Assistent', description: 'Meetings automatisch transkribieren, Action Items extrahieren und Tasks zuweisen. Niemals mehr manuell.' },
                    { icon: '📊', title: 'Echtzeit-Dashboard', description: 'Projektfortschritt auf einen Blick. Keine Status-Updates, keine Meetings mehr.' },
                ],
            },
        },
        {
            pageId: waitlist.id, name: 'Waitlist Formular', type: 'contact', order: 3,
            content: {
                heading: 'Waitlist beitreten',
                subheading: 'Sei dabei wenn wir launchen. Waitlist-Mitglieder erhalten 50% Rabatt im ersten Jahr.',
                buttonText: 'Kostenlosen Platz sichern', isNewsletter: true,
                urgency: 'Nur die ersten 500 erhalten den Launch-Rabatt',
            },
            styling: { backgroundColor: '#3b82f6', textColor: '#ffffff' },
        },
        {
            pageId: waitlist.id, name: 'Social Proof', type: 'stats', order: 4,
            content: {
                items: [
                    { value: '2.847', label: 'Auf der Waitlist', description: 'Aus 34 Ländern' },
                    { value: '4.9★', label: 'Beta-Bewertung', description: 'Von 120 Beta-Testern' },
                    { value: '68%', label: 'Weniger Meetings', description: 'Laut Beta-Feedback' },
                    { value: '€0', label: 'Waitlist-Kosten', description: 'Jetzt anmelden ist gratis' },
                ],
            },
            styling: { backgroundColor: '#0f172a', textColor: '#ffffff' },
        },
    ]);
    const [pricing] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Pricing', slug: '/pricing', isHomepage: false, order: 1 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: pricing.id, name: 'Pricing Hero', type: 'hero', order: 0,
            content: { heading: 'Einfaches Pricing', subheading: 'Kein Verwirrspiel. Kein verstecktes Kleingedrucktes.', minimal: true },
            styling: { backgroundColor: '#0f172a', textColor: '#ffffff' },
        },
        {
            pageId: pricing.id, name: 'Pakete', type: 'features', order: 1,
            content: {
                heading: '',
                items: [
                    { title: 'Starter', description: 'Bis 5 Nutzer · 10 Projekte · 5 GB Speicher · E-Mail-Support', price: '29€/Monat' },
                    { title: 'Team', description: 'Bis 20 Nutzer · Unbegrenzte Projekte · 50 GB · AI-Assistent · Priority-Support', price: '79€/Monat', badge: '⭐ Empfohlen' },
                    { title: 'Business', description: 'Unbegrenzte Nutzer · SSO · API · Dedicated Account Manager · SLA', price: '199€/Monat' },
                ],
            },
        },
    ]);
    const [upsell] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Danke + Upsell', slug: '/danke', isHomepage: false, order: 2 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: upsell.id, name: 'Danke Hero', type: 'hero', order: 0,
            content: {
                heading: '✅ Du bist auf der Waitlist!',
                subheading: 'Wir informieren dich sobald CloudDesk launcht. Schau in dein Postfach — wir haben dir eine Bestätigung geschickt.',
                buttonText: 'Founding Member werden (Einmalangebot)', buttonLink: '#founding',
            },
            styling: { backgroundColor: '#0f172a', textColor: '#ffffff' },
        },
        {
            pageId: upsell.id, name: 'Upsell', type: 'cta', order: 1,
            content: {
                heading: '⚡ Einmalangebot — nur für dich',
                subheading: 'Als Founding Member zahlst du einmalig 299€ und hast lebenslangen Zugang zum Team-Plan (Wert: 79€/Monat). Das Angebot gilt nur jetzt.',
                buttonText: 'Founding Member werden — einmalig 299€', buttonLink: '#',
                badge: '⏳ Angebot läuft in 15 Minuten ab',
            },
            styling: { backgroundColor: '#3b82f6', textColor: '#ffffff' },
        },
    ]);
    console.log('✅ funnels_premium — SaaS Launch Funnel CloudDesk');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=funnels_premium.js.map