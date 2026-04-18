"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Fine Dining (restaurant_premium)';
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
        description: 'Elegantes Fine-Dining-Restaurant mit mehrgängigen Menüs und Online-Reservierung',
        category: 'restaurant_premium',
        thumbnailUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'restaurant_premium', niche: 'fine-dining', colors: { primary: '#2c2c2c', secondary: '#1a1a1a', accent: '#c9a84c', background: '#fafaf8', text: '#2c2c2c' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'Restaurant Goldener Karpfen',
                subheading: 'Nordeuropäische Fine Cuisine in der Hamburger HafenCity. Saisonale Produkte von Hamburger Erzeugern, interpretiert mit moderner Präzision.',
                buttonText: 'Tisch reservieren', buttonLink: '/reservierung',
                secondaryButtonText: 'Menüs entdecken', secondaryButtonLink: '/menue',
                imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=700&fit=crop',
                badge: '⭐ 2 Michelin-Sterne · Ausgezeichnet seit 2019',
            },
            styling: { backgroundColor: '#2c2c2c', textColor: '#f5f5f0' },
        },
        {
            pageId: home.id, name: 'Auszeichnungen', type: 'stats', order: 1,
            content: {
                items: [
                    { value: '2★', label: 'Michelin-Sterne', description: 'Seit 2019 ausgezeichnet' },
                    { value: '18', label: 'Gault&Millau-Punkte', description: 'Höchste Kategorie' },
                    { value: '8', label: 'Gang Menü', description: 'Saisonales Degustationsmenü' },
                    { value: '400+', label: 'Weinpositionen', description: 'Kuratierte Weinkarte' },
                ],
            },
            styling: { backgroundColor: '#c9a84c', textColor: '#2c2c2c' },
        },
        {
            pageId: home.id, name: 'Menüs', type: 'features', order: 2,
            content: {
                heading: 'Unsere Menüs',
                subtitle: 'Alle Menüs mit korrespondierenden Weinbegleitungen erhältlich',
                items: [
                    { icon: '🌿', title: 'Signature Menü', description: '8 Gänge · Chefkoch Lars Petersens Interpretation der nordeuropäischen Küche mit Hamburger Saisonprodukten', price: '185€ p.P.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' },
                    { icon: '🌱', title: 'Garten Menü', description: '7 Gänge · Vollständig pflanzlich · Gemüse und Kräuter aus unserem Partnergarten in Vierlanden', price: '165€ p.P.', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
                    { icon: '🍷', title: 'Klassiker Menü', description: '5 Gänge · Bewährte Kompositionen für Einsteiger in die nordeuropäische Fine Cuisine', price: '125€ p.P.', imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop' },
                ],
            },
        },
        {
            pageId: home.id, name: 'Küchenchef', type: 'about', order: 3,
            content: {
                heading: 'Lars Petersen — Küchenchef',
                text: `<p>Lars Petersen, geboren in Flensburg, hat seine Ausbildung unter René Redzepi im Noma absolviert und drei Jahre im elBulli gearbeitet, bevor er 2015 zurück nach Hamburg kam.</p>
<p>Seine Philosophie: <strong>Regionale Produkte, globale Technik, lokale Seele.</strong> Jedes Gericht erzählt eine Geschichte — von Hamburger Hafen, von Schleswig-Holsteinischen Feldern, von der Nordsee.</p>
<p>2019 erhielt der Goldene Karpfen unter seiner Leitung den zweiten Michelin-Stern. 2023 kürte ihn der Gault&Millau zum Koch des Jahres.</p>`,
                imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=500&fit=crop',
            },
        },
        {
            pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 4,
            content: {
                heading: 'Gästestimmen',
                items: [
                    { title: 'The Financial Times', subtitle: 'Restaurantkritik · ★★★★★', description: 'Petersen has done something rare: he has created a restaurant that feels unmistakably Hamburg while achieving a level of technical precision that rivals the best in Europe.', date: '2024' },
                    { title: 'Feinschmecker Magazin', subtitle: 'Restaurantkritik · 5/5', description: 'Das Garten-Menü ist eine Offenbarung. Wer glaubt, pflanzliche Küche sei Verzicht, hat den Goldenen Karpfen noch nicht besucht.', date: 'Januar 2024' },
                    { title: 'Dr. Christina M., Hamburg', subtitle: '⭐⭐⭐⭐⭐', description: 'Unser 20. Hochzeitstag war unvergesslich. Der Service ist diskret und herzlich zugleich, das Essen auf einem Niveau das mich sprachlos gemacht hat.', date: 'Dezember 2023' },
                ],
            },
            styling: { backgroundColor: '#fafaf8', textColor: '#2c2c2c' },
        },
        {
            pageId: home.id, name: 'Reservierung', type: 'contact', order: 5,
            content: {
                heading: 'Reservierung',
                subheading: 'Tische werden bis zu 90 Tage im Voraus vergeben. Für Privatevents und exklusive Abende sprechen Sie uns bitte direkt an.',
                buttonText: 'Reservierungsanfrage',
                details: {
                    phone: '+49 40 654321', email: 'reservierung@goldener-karpfen.de',
                    address: 'Am Kaiserkai 12, 20457 Hamburg',
                    hours: 'Di–Sa ab 18:30 Uhr · Sonntags & Montags geschlossen',
                },
            },
            styling: { backgroundColor: '#2c2c2c', textColor: '#f5f5f0' },
        },
    ]);
    console.log('✅ restaurant_premium — Goldener Karpfen Fine Dining, Hamburg');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=restaurant_premium.js.map