"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Burger Restaurant (restaurant_pro)';
async function main() {
    const force = process.argv.includes('--force');
    const [existing] = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
    if (existing && !force) {
        console.log('⏭️  Existiert bereits. --force zum Überschreiben.');
        await pool.end();
        return;
    }
    if (existing)
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, existing.id));
    const [t] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME,
        description: 'Modernes Burger-Restaurant mit Online-Bestellung, Lieferung & Abholung',
        category: 'restaurant_pro',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'restaurant_pro', niche: 'burger', colors: { primary: '#1a1a1a', secondary: '#e63946', accent: '#ffd60a', background: '#ffffff', text: '#1a1a1a' }, fonts: { heading: 'Inter', body: 'Inter' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'Bulldog Burgers — Craft Burger in Berlin-Mitte',
                subheading: '100% Dry-Aged-Beef, hausgemachte Saucen, 15 Minuten Lieferung. Jetzt online bestellen oder abholen.',
                buttonText: 'Jetzt bestellen', buttonLink: '/bestellen',
                secondaryButtonText: 'Speisekarte', secondaryButtonLink: '/speisekarte',
                imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&h=700&fit=crop',
                badge: '🔥 15 Min. Lieferung · Täglich 11–23 Uhr',
            },
            styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' },
        },
        {
            pageId: home.id, name: 'USPs', type: 'features', order: 1,
            content: {
                heading: 'Warum Bulldog?',
                items: [
                    { icon: '🥩', title: 'Dry-Aged Beef', description: '30 Tage gereiftes Rindfleisch vom Brandenburger Hof — kein Tiefkühl, nie.' },
                    { icon: '🍔', title: 'Handgemacht', description: 'Jeder Patty wird von Hand geformt, jede Sauce selbst gekocht. Kein Fertigkram.' },
                    { icon: '⚡', title: '15 Min. Lieferung', description: 'Unser E-Cargo-Team liefert in Berlin-Mitte und Prenzlauer Berg in 15 Minuten.' },
                    { icon: '🌱', title: 'Plant-Based Option', description: 'Unser Beyond-Bulldog ist auch für Veganer gemacht — ohne Kompromisse beim Geschmack.' },
                ],
            },
            styling: { backgroundColor: '#ffd60a', textColor: '#1a1a1a' },
        },
        {
            pageId: home.id, name: 'Bestseller', type: 'features', order: 2,
            content: {
                heading: 'Die Bulldogs',
                subtitle: 'Unsere meistbestellten Burger',
                items: [
                    { icon: '🏆', title: 'The OG Bulldog', description: 'Doppelter Dry-Aged-Patty, American Cheese, Bulldog-Sauce, Gurke, Zwiebel, Brioche-Bun', price: '14,90€', badge: '🔥 Bestseller', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
                    { icon: '🌶️', title: 'Diablo Bulldog', description: 'Single Patty, Habanero-Sauce, Jalapeños, Pepper-Jack, karamellisierte Zwiebeln', price: '13,90€', badge: '🌶️ Scharf', imageUrl: 'https://images.unsplash.com/photo-1561758033-7e924f619b47?w=400&h=300&fit=crop' },
                    { icon: '🌱', title: 'Beyond Bulldog', description: 'Beyond Meat Patty, veganer Cheddar, Avocado, Sprossen, Sriracha-Mayo, Sourdough-Bun', price: '13,90€', badge: '🌱 Vegan', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop' },
                ],
                ctaText: 'Alle Burger ansehen →', ctaLink: '/speisekarte',
            },
        },
        {
            pageId: home.id, name: 'Bestell-Info', type: 'stats', order: 3,
            content: {
                items: [
                    { value: '15 Min', label: 'Lieferzeit', description: 'In Berlin-Mitte & Prenzlauer Berg' },
                    { value: '0€', label: 'Lieferkosten', description: 'Ab 20€ Bestellwert' },
                    { value: '11–23', label: 'Öffnungszeiten', description: 'Täglich, auch Feiertags' },
                    { value: '4.9★', label: 'Lieferbewertung', description: 'Aus 850+ Bewertungen' },
                ],
            },
            styling: { backgroundColor: '#e63946', textColor: '#ffffff' },
        },
        {
            pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 4,
            content: {
                heading: 'Berlinern gefällt\'s',
                items: [
                    { title: 'Tom B., Prenzlauer Berg', subtitle: '⭐⭐⭐⭐⭐', description: 'Der OG Bulldog ist der beste Burger den ich je gegessen habe — und ich sage das als jemand der regelmäßig nach New York fliegt. 14,90€ für so ein Qualitätsniveau ist unschlagbar.', date: 'April 2024' },
                    { title: 'Anna K., Mitte', subtitle: '⭐⭐⭐⭐⭐', description: 'Als Veganerin bin ich selten begeistert von Burger-Läden. Der Beyond Bulldog hat mich komplett umgehauen. Geliefert in 13 Minuten, noch heiß. Respekt!', date: 'März 2024' },
                    { title: 'Marcus H., Startup-Gründer', subtitle: '⭐⭐⭐⭐⭐', description: 'Unser Team bestellt fast täglich bei Bulldog. Die Qualität ist konsistent, die Lieferung pünktlich. Für Firmenessen ist das unser Go-To.', date: 'Februar 2024' },
                ],
            },
        },
        {
            pageId: home.id, name: 'Kontakt & Standorte', type: 'contact', order: 5,
            content: {
                heading: 'Besuche uns',
                subheading: 'Zwei Standorte in Berlin — oder bestell direkt online.',
                buttonText: 'Online bestellen',
                details: {
                    phone: '+49 30 987654', email: 'hallo@bulldog-burgers.de',
                    address: 'Rosenthaler Str. 40, 10178 Berlin (Mitte) + Kastanienallee 82, 10435 Berlin (Prenzlauer Berg)',
                    hours: 'Täglich 11:00–23:00 Uhr',
                },
            },
            styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' },
        },
    ]);
    const [menu] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Speisekarte', slug: '/speisekarte', isHomepage: false, order: 1 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: menu.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Speisekarte', subheading: 'Alle Burger werden frisch zubereitet. Wartezeit ca. 8–12 Min.', minimal: true }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
        { pageId: menu.id, name: 'Burger', type: 'features', order: 1, content: { heading: 'Die Bulldogs', items: [
                    { title: 'The OG Bulldog', description: 'Doppelpatty Dry-Aged, American Cheese, Bulldog-Sauce, Gurke, Zwiebel', price: '14,90€' },
                    { title: 'Diablo Bulldog', description: 'Patty, Habanero-Sauce, Jalapeños, Pepper-Jack, karamellisierte Zwiebeln', price: '13,90€' },
                    { title: 'BBQ Bulldog', description: 'Patty, BBQ-Sauce, Bacon, Cheddar, Zwiebelringe, Brioche', price: '14,90€' },
                    { title: 'Beyond Bulldog', description: 'Beyond Meat, veganer Cheddar, Avocado, Sprossen, Sriracha-Mayo', price: '13,90€' },
                    { title: 'Mushroom Bulldog', description: 'Portobello-Pilz, Ziegenkäse, Rucola, Trüffel-Mayo (vegetarisch)', price: '12,90€' },
                ] } },
        { pageId: menu.id, name: 'Beilagen & Drinks', type: 'features', order: 2, content: { heading: 'Beilagen & Drinks', items: [
                    { title: 'Bulldog Fries', description: 'Hausgemachte Pommes mit Bulldog-Gewürzmischung', price: '4,50€' },
                    { title: 'Sweet Potato Fries', description: 'Süßkartoffelpommes mit Chipotle-Dip', price: '5,50€' },
                    { title: 'Craft Beer', description: 'Rotierendes Angebot lokaler Berliner Brauereien (0,33l)', price: '3,90€' },
                    { title: 'Bulldog Shake', description: 'Vanilla, Chocolate oder Strawberry — hausgemacht', price: '5,90€' },
                ] } },
    ]);
    console.log('✅ restaurant_pro — Bulldog Burgers, Berlin');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=restaurant_pro.js.map