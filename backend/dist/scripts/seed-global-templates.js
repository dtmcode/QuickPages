"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const website_builder_schema_1 = require("../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = (0, node_postgres_1.drizzle)(pool);
async function seedGlobalTemplates() {
    console.log('🌱 Seeding Global Templates...');
    const [businessTemplate] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: 'Business Pro',
        description: 'Professionelles Business Template mit Hero, Features und CTA',
        category: 'business',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        isActive: true,
        isPremium: false,
        settings: {
            colors: {
                primary: '#2563eb',
                secondary: '#7c3aed',
                accent: '#f59e0b',
            },
        },
    }).returning();
    console.log('✅ Global Template: Business Pro');
    const [businessHome] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: businessTemplate.id,
        name: 'Home',
        slug: 'home',
        description: 'Business Homepage',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: businessHome.id,
            name: 'Hero Section',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Wachse dein Business mit uns',
                subheading: 'Die moderne Lösung für dein Unternehmen',
                text: '<p>Professionelle Dienstleistungen für maximalen Erfolg</p>',
                buttonText: 'Jetzt starten',
                buttonLink: '#contact',
            },
            styling: {
                backgroundColor: '#2563eb',
                textColor: '#ffffff',
            },
        },
        {
            pageId: businessHome.id,
            name: 'Features',
            type: 'features',
            order: 1,
            content: {
                heading: 'Unsere Vorteile',
                items: [
                    { icon: '⚡', title: 'Schnell', description: 'Blitzschnelle Performance' },
                    { icon: '🔒', title: 'Sicher', description: 'Höchste Sicherheitsstandards' },
                    { icon: '💎', title: 'Premium', description: 'Erstklassige Qualität' },
                ],
            },
        },
        {
            pageId: businessHome.id,
            name: 'Call to Action',
            type: 'cta',
            order: 2,
            content: {
                heading: 'Bereit durchzustarten?',
                text: 'Starte heute und erlebe den Unterschied',
                buttonText: 'Kostenlos testen',
                buttonLink: '#signup',
            },
            styling: {
                backgroundColor: '#7c3aed',
                textColor: '#ffffff',
            },
        },
    ]);
    const [creativeTemplate] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: 'Creative Agency',
        description: 'Kreatives Template für Agenturen und Designer',
        category: 'creative',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
        isActive: true,
        isPremium: false,
        settings: {
            colors: {
                primary: '#ec4899',
                secondary: '#8b5cf6',
            },
        },
    }).returning();
    console.log('✅ Global Template: Creative Agency');
    const [creativeHome] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: creativeTemplate.id,
        name: 'Home',
        slug: 'home',
        description: 'Creative Homepage',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: creativeHome.id,
            name: 'Hero',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Kreativität trifft Innovation',
                subheading: 'Wir bringen deine Vision zum Leben',
                buttonText: 'Portfolio ansehen',
                buttonLink: '#portfolio',
            },
            styling: {
                backgroundColor: '#ec4899',
                textColor: '#ffffff',
            },
        },
        {
            pageId: creativeHome.id,
            name: 'Services',
            type: 'services',
            order: 1,
            content: {
                heading: 'Unsere Services',
                items: [
                    { icon: '🎨', title: 'Design', description: 'Modernes UI/UX Design', price: 'ab 999€' },
                    { icon: '💻', title: 'Development', description: 'Webentwicklung & Apps', price: 'ab 1499€' },
                    { icon: '📱', title: 'Branding', description: 'Corporate Identity', price: 'ab 799€' },
                ],
            },
        },
    ]);
    const [ecomTemplate] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: 'E-Commerce',
        description: 'Perfekt für Online-Shops und Produktverkauf',
        category: 'ecommerce',
        thumbnailUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
        isActive: true,
        isPremium: false,
    }).returning();
    console.log('✅ Global Template: E-Commerce');
    const [ecomHome] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: ecomTemplate.id,
        name: 'Home',
        slug: 'home',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: ecomHome.id,
            name: 'Hero',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Dein Premium Online Shop',
                subheading: 'Hochwertige Produkte zu fairen Preisen',
                buttonText: 'Jetzt shoppen',
                buttonLink: '/shop',
            },
            styling: {
                backgroundColor: '#059669',
                textColor: '#ffffff',
            },
        },
        {
            pageId: ecomHome.id,
            name: 'Featured Products',
            type: 'features',
            order: 1,
            content: {
                heading: 'Bestseller',
                items: [
                    { icon: '⭐', title: 'Produkt 1', description: 'Premium Qualität' },
                    { icon: '🔥', title: 'Produkt 2', description: 'Top Angebot' },
                    { icon: '💎', title: 'Produkt 3', description: 'Neu eingetroffen' },
                ],
            },
        },
    ]);
    const [portfolioTemplate] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: 'Portfolio',
        description: 'Showcase deine Arbeit mit Style',
        category: 'portfolio',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
        isActive: true,
        isPremium: false,
    }).returning();
    console.log('✅ Global Template: Portfolio');
    const [portfolioHome] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: portfolioTemplate.id,
        name: 'Home',
        slug: 'home',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: portfolioHome.id,
            name: 'Hero',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Hi, ich bin Designer',
                subheading: 'Kreative Lösungen für digitale Produkte',
                buttonText: 'Projekte ansehen',
                buttonLink: '#work',
            },
            styling: {
                backgroundColor: '#1e293b',
                textColor: '#ffffff',
            },
        },
        {
            pageId: portfolioHome.id,
            name: 'About Me',
            type: 'about',
            order: 1,
            content: {
                heading: 'Über mich',
                text: '<p>Ich bin ein leidenschaftlicher Designer mit über 10 Jahren Erfahrung in der Gestaltung digitaler Produkte.</p>',
            },
        },
    ]);
    const [restaurantTemplate] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: 'Restaurant',
        description: 'Appetitliches Template für Gastronomie',
        category: 'restaurant',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        isActive: true,
        isPremium: false,
    }).returning();
    console.log('✅ Global Template: Restaurant');
    const [restaurantHome] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: restaurantTemplate.id,
        name: 'Home',
        slug: 'home',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: restaurantHome.id,
            name: 'Hero',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Willkommen im Bella Vista',
                subheading: 'Authentische italienische Küche',
                buttonText: 'Reservieren',
                buttonLink: '#booking',
            },
            styling: {
                backgroundColor: '#dc2626',
                textColor: '#ffffff',
            },
        },
        {
            pageId: restaurantHome.id,
            name: 'About',
            type: 'about',
            order: 1,
            content: {
                heading: 'Unsere Geschichte',
                text: '<p>Seit 1985 verwöhnen wir unsere Gäste mit traditioneller italienischer Küche und familiärer Atmosphäre.</p>',
            },
        },
    ]);
    console.log('\n✅ Seeding completed!');
    console.log('📊 Created 5 global templates with pages and sections');
    console.log('🌍 These templates are available for ALL tenants\n');
    await pool.end();
}
seedGlobalTemplates().catch((err) => {
    console.error('❌ Error seeding templates:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-global-templates.js.map