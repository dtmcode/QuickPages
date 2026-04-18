"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Pizzeria (restaurant_starter)';
async function main() {
    const force = process.argv.includes('--force');
    const [existing] = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
    if (existing && !force) {
        console.log(`⏭️  Existiert bereits. --force zum Überschreiben.`);
        await pool.end();
        return;
    }
    if (existing)
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, existing.id));
    const [t] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME,
        description: 'Fertige Pizzeria-Website mit Speisekarte, Öffnungszeiten und Reservierungsformular',
        category: 'restaurant_starter',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
        isActive: true, isPremium: false,
        settings: { package: 'restaurant_starter', niche: 'pizzeria', colors: { primary: '#c0392b', secondary: '#922b21', accent: '#f9e4e4', background: '#fffaf9', text: '#1a1a1a' }, fonts: { heading: 'Inter', body: 'Inter' } },
    }).returning();
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id, name: 'Hero', type: 'hero', order: 0,
            content: {
                heading: 'Pizzeria Da Marco — Echte Neapolitanische Pizza in München',
                subheading: 'Seit 1987 backen wir unsere Pizzen im Holzofen. Frische Zutaten, traditionelle Rezepte, herzliche Atmosphäre in Schwabing.',
                buttonText: 'Tisch reservieren', buttonLink: '#reservierung',
                secondaryButtonText: 'Speisekarte ansehen', secondaryButtonLink: '/speisekarte',
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&h=700&fit=crop',
                badge: '🍕 Holzofen-Pizza seit 1987',
            },
            styling: { backgroundColor: '#c0392b', textColor: '#ffffff' },
        },
        {
            pageId: home.id, name: 'Highlights', type: 'stats', order: 1,
            content: {
                items: [
                    { value: '35+', label: 'Jahre Erfahrung', description: 'Familienrezepte seit 1987' },
                    { value: '48', label: 'Pizzasorten', description: 'Klassisch & kreativ' },
                    { value: '4.8★', label: 'Google Bewertung', description: 'Aus 420+ Rezensionen' },
                    { value: '450°', label: 'Ofentemperatur', description: 'Echter Holzofengeschmack' },
                ],
            },
            styling: { backgroundColor: '#1a1a1a', textColor: '#f5f5f5' },
        },
        {
            pageId: home.id, name: 'Speisekarte Auszug', type: 'features', order: 2,
            content: {
                heading: 'Unsere Klassiker',
                subtitle: 'Alle Pizzen mit selbstgemachter Tomatensauce und 48h-gereiftem Teig',
                items: [
                    { icon: '🍕', title: 'Margherita DOP', description: 'San-Marzano-Tomaten, Fior di Latte, frisches Basilikum, Olivenöl extra vergine', price: '13,90€', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop' },
                    { icon: '🍕', title: 'Diavola', description: 'Tomatensauce, Mozzarella, scharfe Salami, Chili, Olivenöl', price: '15,90€', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
                    { icon: '🍕', title: 'Quattro Stagioni', description: 'Tomatensauce, Mozzarella, Champignons, Artischocken, Schinken, Oliven', price: '16,90€', imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop' },
                    { icon: '🍕', title: 'Burrata e Prosciutto', description: 'Tomatensauce, Burrata fresca, Parmaschinken 24 Monate, Rucola, Parmigiano', price: '18,90€', imageUrl: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=400&h=300&fit=crop' },
                    { icon: '🍝', title: 'Spaghetti Carbonara', description: 'Guanciale, Pecorino Romano DOP, Eigelb, schwarzer Pfeffer — nach Original-Römer-Rezept', price: '14,90€', imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop' },
                    { icon: '🥗', title: 'Insalata Caprese', description: 'Büffelmozzarella DOP, Tomaten, frisches Basilikum, Balsamico di Modena', price: '12,90€', imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop' },
                ],
                ctaText: 'Vollständige Speisekarte →', ctaLink: '/speisekarte',
            },
        },
        {
            pageId: home.id, name: 'Über uns', type: 'about', order: 3,
            content: {
                heading: 'Familie Marco — Drei Generationen Leidenschaft',
                text: `<p>Was 1987 mit einem kleinen Holzofen und den Rezepten von Nonnas Marco begann, ist heute Münchens bekannteste Pizzeria in Schwabing. Inhaber Antonio Marco, geboren in Neapel, hat sein Handwerk in der Pizzeria-Schule in Neapel gelernt und bringt echte neapolitanische Tradition nach Bayern.</p>
<p>Unser Teig reift <strong>48 Stunden</strong> bei kontrollierter Temperatur, unsere San-Marzano-Tomaten kommen direkt aus der Kampagne und unser Holzofen erreicht <strong>450°C</strong> — nur so gelingt die perfekte Pizza mit dem typischen leopardierten Rand.</p>
<p>Bei uns isst die ganze Familie: Kinder lieben unsere Junior-Pizzen, Erwachsene genießen unsere Weinauswahl aus kleinen italienischen Weingütern.</p>`,
                imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=500&fit=crop',
                highlights: ['Holzofen 450°C', '48h-Teig-Reifung', 'San-Marzano-Tomaten original', 'Familienrezepte seit 1987'],
            },
        },
        {
            pageId: home.id, name: 'Galerie', type: 'gallery', order: 4,
            content: {
                heading: 'Einblicke in unsere Küche',
                images: [
                    { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop', alt: 'Pizza aus dem Holzofen', title: 'Holzofen-Pizza' },
                    { url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop', alt: 'Pizzabäcker', title: 'Handwerk' },
                    { url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop', alt: 'Margherita', title: 'Margherita DOP' },
                    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', alt: 'Restaurant Atmosphäre', title: 'Gemütliches Ambiente' },
                    { url: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=600&h=400&fit=crop', alt: 'Burrata Pizza', title: 'Burrata e Prosciutto' },
                    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop', alt: 'Diavola', title: 'Diavola' },
                ],
            },
        },
        {
            pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 5,
            content: {
                heading: 'Was unsere Gäste sagen',
                source: 'Google Bewertungen · Ø 4,8 von 5',
                items: [
                    { title: 'Sarah M., München-Maxvorstadt', subtitle: '⭐⭐⭐⭐⭐', description: 'Die beste Pizza in München, ohne jeden Zweifel. Der Teig ist perfekt — außen knusprig, innen zart. Und die Burrata-Pizza ist ein absolutes Highlight. Wir kommen jede Woche!', date: 'März 2024' },
                    { title: 'Klaus & Familie, Bogenhausen', subtitle: '⭐⭐⭐⭐⭐', description: 'Antonio und sein Team sind einfach herzlich. Die Kinder haben ihre Junior-Pizzen geliebt, wir Eltern den Chianti. Atmosphäre wie in Italien. Reservierung unbedingt empfohlen!', date: 'Februar 2024' },
                    { title: 'Luca R., Tourist aus Florenz', subtitle: '⭐⭐⭐⭐⭐', description: 'Als Italiener war ich skeptisch — aber diese Pizza hält echtem Vergleich stand. Der Holzofen, die San-Marzano-Tomaten, der Teig... bravo Antonio!', date: 'Januar 2024' },
                ],
            },
            styling: { backgroundColor: '#fffaf9', textColor: '#1a1a1a' },
        },
        {
            pageId: home.id, name: 'Reservierung & Info', type: 'contact', order: 6,
            content: {
                heading: 'Tisch reservieren',
                subheading: 'Für Gruppen ab 6 Personen bitte telefonisch reservieren. Online-Reservierung für 2–5 Personen.',
                buttonText: 'Reservierung anfragen',
                details: {
                    phone: '+49 89 123456', email: 'info@pizzeria-damarco.de',
                    address: 'Leopoldstraße 42, 80802 München',
                    hours: 'Mo–Fr 11:30–14:30 & 17:30–23:00 · Sa–So 11:30–23:00',
                },
            },
            styling: { backgroundColor: '#c0392b', textColor: '#ffffff' },
        },
    ]);
    const [speisekarte] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({ templateId: t.id, name: 'Speisekarte', slug: '/speisekarte', isHomepage: false, order: 1 }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        { pageId: speisekarte.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Unsere Speisekarte', subheading: 'Alle Preise inkl. MwSt. · Allergene auf Anfrage', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&h=300&fit=crop', minimal: true }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
        { pageId: speisekarte.id, name: 'Pizzen', type: 'features', order: 1, content: { heading: 'Pizzen aus dem Holzofen', items: [
                    { title: 'Margherita DOP', description: 'San-Marzano, Fior di Latte, Basilikum', price: '13,90€' },
                    { title: 'Marinara', description: 'Tomatensauce, Knoblauch, Oregano, Olivenöl (vegan)', price: '11,90€' },
                    { title: 'Diavola', description: 'Tomatensauce, Mozzarella, scharfe Salami, Chili', price: '15,90€' },
                    { title: 'Prosciutto e Funghi', description: 'Tomatensauce, Mozzarella, Schinken, Champignons', price: '15,90€' },
                    { title: 'Quattro Stagioni', description: 'Tomatensauce, Mozzarella, Champignons, Artischocken, Schinken, Oliven', price: '16,90€' },
                    { title: 'Burrata e Prosciutto', description: 'Tomatensauce, Burrata, Parmaschinken, Rucola, Parmigiano', price: '18,90€' },
                ] } },
        { pageId: speisekarte.id, name: 'Pasta & Salate', type: 'features', order: 2, content: { heading: 'Pasta & Salate', items: [
                    { title: 'Spaghetti Carbonara', description: 'Guanciale, Pecorino, Eigelb, Pfeffer', price: '14,90€' },
                    { title: 'Rigatoni all\'Amatriciana', description: 'Guanciale, San-Marzano, Pecorino', price: '14,90€' },
                    { title: 'Insalata Caprese', description: 'Büffelmozzarella DOP, Tomaten, Basilikum, Balsamico', price: '12,90€' },
                    { title: 'Insalata Verde', description: 'Gemischter Salat, Olivenöl, Zitrone (vegan)', price: '8,90€' },
                ] } },
    ]);
    console.log('✅ restaurant_starter — Pizzeria Da Marco, München');
    console.log('   Seiten: Startseite (7 Sections) + Speisekarte');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=restaurant_starter.js.map