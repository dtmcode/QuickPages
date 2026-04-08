"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
async function templateExists(name) {
    const rows = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, name))
        .limit(1);
    return rows.length > 0;
}
async function deleteTemplate(name) {
    const rows = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, name))
        .limit(1);
    if (!rows.length)
        return;
    await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, rows[0].id));
}
async function createTemplate(data, force) {
    if (await templateExists(data.name)) {
        if (!force) {
            console.log(`   ⏭️  "${data.name}" existiert bereits — übersprungen`);
            return;
        }
        await deleteTemplate(data.name);
    }
    const [template] = await db
        .insert(website_builder_schema_1.wbGlobalTemplates)
        .values({
        name: data.name,
        description: data.description,
        category: data.category,
        thumbnailUrl: data.thumbnailUrl,
        isActive: true,
        isPremium: data.isPremium,
        settings: data.settings,
    })
        .returning();
    for (const pageData of data.pages) {
        const [page] = await db
            .insert(website_builder_schema_1.wbGlobalTemplatePages)
            .values({
            templateId: template.id,
            name: pageData.name,
            slug: pageData.slug,
            isHomepage: pageData.isHomepage,
            order: pageData.order,
        })
            .returning();
        if (pageData.sections.length > 0) {
            await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values(pageData.sections.map((s) => ({
                pageId: page.id,
                name: s.name,
                type: s.type,
                order: s.order,
                content: s.content,
                styling: s.styling ?? {},
            })));
        }
    }
    const label = data.isPremium ? '⭐ Premium' : 'Free';
    console.log(`   ✅  ${data.name} [${data.category}] — ${label}`);
}
const S = {
    dark: (c = '#111827') => ({ backgroundColor: c, textColor: '#f9fafb' }),
    light: (c = '#f9fafb') => ({ backgroundColor: c, textColor: '#111827' }),
    primary: (c) => ({ backgroundColor: c, textColor: '#ffffff' }),
    muted: () => ({ backgroundColor: '#f3f4f6', textColor: '#374151' }),
};
const TEMPLATES = [
    {
        name: 'Website — Visitenkarte',
        description: 'Kompakter One-Pager für Handwerker, Freiberufler und lokale Unternehmen',
        category: 'website',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#1e40af', secondary: '#1e3a8a', accent: '#93c5fd', background: '#ffffff', text: '#1e293b' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [{
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Professionell. Zuverlässig. Lokal.',
                            subheading: '[Dein Beruf] in [Deine Stadt] — Kontaktiere mich für ein kostenloses Angebot',
                            buttonText: 'Jetzt Kontakt aufnehmen',
                            buttonLink: '#kontakt',
                        },
                        styling: S.primary('#1e40af'),
                    },
                    {
                        name: 'Über mich', type: 'about', order: 1,
                        content: {
                            heading: 'Über mich',
                            text: '<p>Ich bin [Dein Name] und biete seit über 10 Jahren professionelle Dienstleistungen in [Deine Stadt] und Umgebung an. Qualität und Kundenzufriedenheit stehen bei mir an erster Stelle.</p>',
                        },
                    },
                    {
                        name: 'Leistungen', type: 'services', order: 2,
                        content: {
                            heading: 'Meine Leistungen',
                            items: [
                                { icon: '🔧', title: 'Leistung 1', description: 'Kurze Beschreibung', price: 'auf Anfrage' },
                                { icon: '⚡', title: 'Leistung 2', description: 'Kurze Beschreibung', price: 'auf Anfrage' },
                                { icon: '✅', title: 'Leistung 3', description: 'Kurze Beschreibung', price: 'auf Anfrage' },
                            ],
                        },
                    },
                    {
                        name: 'Kontakt', type: 'contact', order: 3,
                        content: {
                            heading: 'Kontakt aufnehmen',
                            subheading: 'Ich melde mich innerhalb von 24 Stunden',
                            buttonText: 'Nachricht senden',
                        },
                        styling: S.muted(),
                    },
                ],
            }],
    },
    {
        name: 'Website — Dienstleister',
        description: 'Professionelle Website für Agenturen, Berater und Dienstleister mit eigener Domain',
        category: 'website',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', background: '#ffffff', text: '#0f172a' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Ergebnisse die zählen.',
                            subheading: 'Wir helfen Unternehmen dabei, online zu wachsen — messbar und nachhaltig.',
                            buttonText: 'Kostenlos beraten lassen',
                            buttonLink: '/kontakt',
                        },
                        styling: S.dark('#0f172a'),
                    },
                    {
                        name: 'Leistungen', type: 'features', order: 1,
                        content: {
                            heading: 'Was wir bieten',
                            items: [
                                { icon: '🎯', title: 'Strategie', description: 'Klare Roadmap für Ihr Wachstum' },
                                { icon: '⚙️', title: 'Umsetzung', description: 'Schnell, sauber, termingerecht' },
                                { icon: '📊', title: 'Reporting', description: 'Transparente Ergebnisse' },
                            ],
                        },
                    },
                    {
                        name: 'Referenzen', type: 'stats', order: 2,
                        content: {
                            items: [
                                { value: '150+', label: 'Projekte', description: 'Erfolgreich abgeschlossen' },
                                { value: '98%', label: 'Kundenzufriedenheit', description: 'Bewertungsdurchschnitt' },
                                { value: '10+', label: 'Jahre', description: 'Branchenerfahrung' },
                            ],
                        },
                        styling: S.muted(),
                    },
                    {
                        name: 'CTA', type: 'cta', order: 3,
                        content: {
                            heading: 'Bereit für den nächsten Schritt?',
                            text: 'Erstgespräch kostenlos und unverbindlich — 30 Minuten reichen.',
                            buttonText: 'Termin vereinbaren',
                            buttonLink: '/kontakt',
                        },
                        styling: S.dark('#0f172a'),
                    },
                ],
            },
            {
                name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Story', type: 'about', order: 0,
                        content: {
                            heading: 'Wer wir sind',
                            text: '<p>Seit 2014 unterstützen wir kleine und mittelständische Unternehmen beim digitalen Wachstum. Unser Team aus erfahrenen Experten kennt die Herausforderungen des Mittelstands aus eigener Erfahrung.</p>',
                        },
                    },
                    {
                        name: 'Team', type: 'team', order: 1,
                        content: {
                            heading: 'Das Team',
                            items: [
                                { title: 'Max Müller', subtitle: 'Geschäftsführer', description: '15 Jahre in der Branche' },
                                { title: 'Sarah Koch', subtitle: 'Projektleiterin', description: 'Expertin für digitale Strategie' },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 2,
                sections: [{
                        name: 'Kontakt', type: 'contact', order: 0,
                        content: {
                            heading: 'Sprechen wir.',
                            subheading: 'Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
                            buttonText: 'Anfrage senden',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Website — Portfolio Pro',
        description: 'Elegantes Portfolio für Fotografen, Designer und Kreative',
        category: 'website',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
        isPremium: true,
        settings: {
            colors: { primary: '#18181b', secondary: '#27272a', accent: '#a1a1aa', background: '#fafafa', text: '#18181b' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Visuals that speak.',
                            subheading: 'Fotografie & Design — kommerziell, editorial, authentisch.',
                            buttonText: 'Portfolio ansehen',
                            buttonLink: '/portfolio',
                        },
                        styling: S.dark('#18181b'),
                    },
                    {
                        name: 'Galerie', type: 'gallery', order: 1,
                        content: {
                            heading: 'Ausgewählte Arbeiten',
                            images: [
                                { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Projekt 1' },
                                { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', alt: 'Projekt 2' },
                                { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', alt: 'Projekt 3' },
                            ],
                        },
                    },
                    {
                        name: 'Services', type: 'services', order: 2,
                        content: {
                            heading: 'Was ich anbiete',
                            items: [
                                { icon: '📸', title: 'Produkt-Fotografie', description: 'E-Commerce & Lookbook', price: 'ab 490€' },
                                { icon: '🎨', title: 'Brand Design', description: 'Logo, CI, Styleguide', price: 'ab 890€' },
                                { icon: '🎥', title: 'Video Content', description: 'Reels, Ads, Imagefilm', price: 'ab 790€' },
                            ],
                        },
                    },
                    {
                        name: 'Testimonials', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Feedback',
                            items: [
                                { title: 'Anna S.', subtitle: 'Boutique-Inhaberin', description: 'Die Produktfotos haben unseren Umsatz im Shop sofort gesteigert.' },
                                { title: 'Tom W.', subtitle: 'Startup Gründer', description: 'Genau die Bildsprache die wir für unsere Marke gesucht haben.' },
                            ],
                        },
                    },
                    {
                        name: 'Kontakt', type: 'contact', order: 4,
                        content: {
                            heading: 'Projekt anfragen',
                            subheading: 'Erzähl mir von deiner Idee — kostenloses Erstgespräch',
                            buttonText: 'Projekt anfragen',
                        },
                        styling: S.dark('#18181b'),
                    },
                ],
            },
            {
                name: 'Portfolio', slug: '/portfolio', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Portfolio Galerie', type: 'gallery', order: 0,
                        content: {
                            heading: 'Alle Arbeiten',
                            images: [
                                { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Landschaft' },
                                { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', alt: 'Portrait' },
                                { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800', alt: 'Editorial' },
                                { url: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800', alt: 'Architektur' },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        name: 'Blog — Personal',
        description: 'Minimalistischer Blog für Autoren und Content Creator',
        category: 'blog',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#16a34a', secondary: '#15803d', accent: '#86efac', background: '#f9fafb', text: '#111827' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Hallo, ich bin [Name].',
                            subheading: 'Ich schreibe über [Thema] — ehrlich, direkt, aus eigener Erfahrung.',
                            buttonText: 'Artikel lesen',
                            buttonLink: '/blog',
                        },
                        styling: S.primary('#16a34a'),
                    },
                    {
                        name: 'Neueste Artikel', type: 'blog', order: 1,
                        content: { heading: 'Neueste Beiträge' },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 2,
                        content: {
                            heading: 'Kein Artikel verpassen',
                            subheading: 'Wöchentlich neue Inhalte — kein Spam, jederzeit abmeldbar.',
                            buttonText: 'Kostenlos abonnieren',
                            isNewsletter: true,
                        },
                        styling: S.muted(),
                    },
                ],
            },
            {
                name: 'Blog', slug: '/blog', isHomepage: false, order: 1,
                sections: [{
                        name: 'Alle Artikel', type: 'blog', order: 0,
                        content: { heading: 'Alle Beiträge' },
                    }],
            },
            {
                name: 'Über mich', slug: '/ueber-mich', isHomepage: false, order: 2,
                sections: [{
                        name: 'Über mich', type: 'about', order: 0,
                        content: {
                            heading: 'Über mich',
                            text: '<p>Ich bin [Name], [Beruf] aus [Stadt]. Auf diesem Blog teile ich meine Erfahrungen, Learnings und Gedanken zu [Thema]. Keine Copy-Paste-Ratschläge — nur echte Erfahrungen.</p>',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Blog — Publisher',
        description: 'Professioneller Blog mit Newsletter und mehreren Autoren',
        category: 'blog',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#9333ea', secondary: '#7e22ce', accent: '#e9d5ff', background: '#faf5ff', text: '#1e1b4b' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: '[Dein Blog-Name]',
                            subheading: 'Expertenwissen zu [Thema] — für Macher, Denker und Neugierige.',
                            buttonText: 'Zum Blog',
                            buttonLink: '/blog',
                        },
                        styling: S.primary('#9333ea'),
                    },
                    {
                        name: 'Themen', type: 'features', order: 1,
                        content: {
                            heading: 'Themen',
                            items: [
                                { icon: '💡', title: 'Kategorie 1', description: 'Beschreibung worum es geht' },
                                { icon: '🚀', title: 'Kategorie 2', description: 'Beschreibung worum es geht' },
                                { icon: '🎯', title: 'Kategorie 3', description: 'Beschreibung worum es geht' },
                            ],
                        },
                    },
                    {
                        name: 'Neueste Artikel', type: 'blog', order: 2,
                        content: { heading: 'Neueste Beiträge' },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 3,
                        content: {
                            heading: 'Der [Thema]-Newsletter',
                            subheading: 'Jeden [Wochentag] die besten Insights direkt ins Postfach.',
                            buttonText: 'Jetzt abonnieren',
                            isNewsletter: true,
                        },
                        styling: S.primary('#7e22ce'),
                    },
                ],
            },
            {
                name: 'Blog', slug: '/blog', isHomepage: false, order: 1,
                sections: [{ name: 'Alle Artikel', type: 'blog', order: 0, content: { heading: 'Alle Beiträge' } }],
            },
            {
                name: 'Über', slug: '/ueber', isHomepage: false, order: 2,
                sections: [
                    {
                        name: 'Über', type: 'about', order: 0,
                        content: {
                            heading: 'Über diesen Blog',
                            text: '<p>Gegründet von [Name], wird dieser Blog regelmäßig mit neuen Beiträgen zu [Thema] aktualisiert.</p>',
                        },
                    },
                    {
                        name: 'Team', type: 'team', order: 1,
                        content: {
                            heading: 'Autoren',
                            items: [
                                { title: '[Autor 1]', subtitle: 'Chefredakteur', description: 'Experte für [Thema]' },
                                { title: '[Autor 2]', subtitle: 'Gastautor', description: 'Schreibt über [Teilthema]' },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        name: 'Blog — Magazin',
        description: 'Online-Magazin mit Kategorien, Team und vollständigem Redaktionslayout',
        category: 'blog',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
        isPremium: true,
        settings: {
            colors: { primary: '#dc2626', secondary: '#b91c1c', accent: '#fca5a5', background: '#ffffff', text: '#111827' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: '[Magazin Name] — Deine Quelle für [Thema]',
                            subheading: 'Täglich neue Berichte, Analysen und Interviews.',
                            buttonText: 'Jetzt lesen',
                            buttonLink: '/magazin',
                        },
                        styling: S.primary('#dc2626'),
                    },
                    {
                        name: 'Ressorts', type: 'features', order: 1,
                        content: {
                            heading: 'Ressorts',
                            items: [
                                { icon: '💼', title: 'Business', description: 'Wirtschaft & Unternehmen' },
                                { icon: '💻', title: 'Technologie', description: 'Digital & Innovation' },
                                { icon: '🌍', title: 'Gesellschaft', description: 'Kultur & Trends' },
                                { icon: '💚', title: 'Nachhaltigkeit', description: 'Green Economy' },
                            ],
                        },
                    },
                    {
                        name: 'Aktuelle Artikel', type: 'blog', order: 2,
                        content: { heading: 'Aktuell' },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 3,
                        content: {
                            heading: 'Der tägliche Briefing',
                            subheading: 'Die wichtigsten Meldungen kompakt — jeden Morgen um 7 Uhr.',
                            buttonText: 'Kostenlos abonnieren',
                            isNewsletter: true,
                        },
                        styling: S.dark('#111827'),
                    },
                ],
            },
            {
                name: 'Magazin', slug: '/magazin', isHomepage: false, order: 1,
                sections: [{ name: 'Alle Artikel', type: 'blog', order: 0, content: { heading: 'Alle Beiträge' } }],
            },
            {
                name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2,
                sections: [
                    {
                        name: 'Redaktion', type: 'about', order: 0,
                        content: {
                            heading: 'Über die Redaktion',
                            text: '<p>Unser Redaktionsteam aus [N] festangestellten Journalisten und [N] freien Autoren berichtet täglich über [Thema]. Gegründet [Jahr], inzwischen mit [Zahl] monatlichen Lesern.</p>',
                        },
                    },
                    {
                        name: 'Team', type: 'team', order: 1,
                        content: {
                            heading: 'Chefredaktion',
                            items: [
                                { title: '[Name]', subtitle: 'Chefredakteur', description: 'Verantwortlich für [Ressort]' },
                                { title: '[Name]', subtitle: 'Stv. Chefredakteur', description: 'Leitet das [Ressort]-Ressort' },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 3,
                sections: [{
                        name: 'Pressekontakt', type: 'contact', order: 0,
                        content: {
                            heading: 'Pressekontakt & Feedback',
                            subheading: 'Für Presseanfragen, Gastbeiträge und Kooperationen.',
                            buttonText: 'Nachricht senden',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Business — Lokal',
        description: 'Für Friseure, Ärzte, Handwerker und lokale Dienstleister mit Terminbuchung',
        category: 'business',
        thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#0369a1', secondary: '#075985', accent: '#bae6fd', background: '#f0f9ff', text: '#0c4a6e' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Ihr [Beruf] in [Stadt]',
                            subheading: 'Professionell, freundlich, zuverlässig — vereinbaren Sie noch heute einen Termin.',
                            buttonText: 'Termin buchen',
                            buttonLink: '/termin',
                        },
                        styling: S.primary('#0369a1'),
                    },
                    {
                        name: 'Leistungen', type: 'services', order: 1,
                        content: {
                            heading: 'Unsere Leistungen',
                            items: [
                                { icon: '✂️', title: 'Leistung A', description: 'Kurze Beschreibung', price: '45€' },
                                { icon: '💆', title: 'Leistung B', description: 'Kurze Beschreibung', price: '65€' },
                                { icon: '✨', title: 'Leistung C', description: 'Kurze Beschreibung', price: '85€' },
                            ],
                        },
                    },
                    {
                        name: 'Über uns', type: 'about', order: 2,
                        content: {
                            heading: 'Über uns',
                            text: '<p>Unser [Betrieb] steht seit [Jahr] für erstklassige Qualität und persönlichen Service. Wir legen Wert auf eine angenehme Atmosphäre und individuelle Beratung.</p>',
                        },
                    },
                    {
                        name: 'Stimmen', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Das sagen unsere Kunden',
                            items: [
                                { title: 'Maria H.', subtitle: 'Stammkundin seit 5 Jahren', description: 'Immer top zufrieden! Bestes Preis-Leistungs-Verhältnis in der Stadt.' },
                                { title: 'Klaus B.', subtitle: 'Kunde', description: 'Super freundlich und immer pünktlich. Kann ich nur weiterempfehlen.' },
                            ],
                        },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 4,
                        content: {
                            heading: 'Aktionen & Neuigkeiten',
                            subheading: 'Keine Werbung — nur exklusive Angebote für Stammkunden.',
                            buttonText: 'Anmelden',
                            isNewsletter: true,
                        },
                        styling: S.muted(),
                    },
                ],
            },
            {
                name: 'Termin buchen', slug: '/termin', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Terminbuchung', type: 'contact', order: 0,
                        content: {
                            heading: 'Termin vereinbaren',
                            subheading: 'Wählen Sie Ihre Leistung und Ihren Wunschtermin.',
                            buttonText: 'Termin anfragen',
                        },
                    },
                ],
            },
            {
                name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 2,
                sections: [{
                        name: 'Kontakt & Anfahrt', type: 'contact', order: 0,
                        content: {
                            heading: 'Besuchen Sie uns',
                            subheading: '[Straße] · [PLZ Stadt] · Tel: [Nummer]',
                            buttonText: 'Nachricht senden',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Business — Coach & Berater',
        description: 'Für Coaches, Therapeuten und Berater — mit Testimonials, Preisen und Terminbuchung',
        category: 'business',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#ede9fe', background: '#faf5ff', text: '#1f2937' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Dein Leben. Deine Entscheidung. Meine Unterstützung.',
                            subheading: 'Als [Berufsbezeichnung] helfe ich dir dabei, [Ziel] zu erreichen — nachhaltig und authentisch.',
                            buttonText: 'Erstgespräch buchen (kostenlos)',
                            buttonLink: '/termin',
                        },
                        styling: S.primary('#7c3aed'),
                    },
                    {
                        name: 'Methode', type: 'features', order: 1,
                        content: {
                            heading: 'Mein Ansatz',
                            items: [
                                { icon: '🎯', title: 'Klarheit', description: 'Herausfinden was du wirklich willst' },
                                { icon: '🛠️', title: 'Strategie', description: 'Konkreter Plan mit klaren Schritten' },
                                { icon: '🚀', title: 'Umsetzung', description: 'Begleitung bis zum messbaren Ergebnis' },
                            ],
                        },
                    },
                    {
                        name: 'Angebote', type: 'pricing', order: 2,
                        content: {
                            heading: 'Meine Angebote',
                            items: [
                                {
                                    title: 'Schnellstart',
                                    price: '297€',
                                    description: 'Einzelsitzung · 90 Minuten',
                                    features: ['Tiefenanalyse deiner Situation', 'Klarer Aktionsplan', 'Follow-up per E-Mail'],
                                    buttonText: 'Termin buchen',
                                },
                                {
                                    title: '3-Monats-Programm',
                                    price: '1.497€',
                                    description: '12 Sessions · Vollbegleitung',
                                    features: ['12 Coaching-Sitzungen', 'Unbegrenzte E-Mail-Unterstützung', 'Workbooks & Materialien', 'WhatsApp-Support'],
                                    buttonText: 'Beratungsgespräch',
                                    highlighted: true,
                                },
                            ],
                        },
                    },
                    {
                        name: 'Testimonials', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Ergebnisse meiner Klienten',
                            items: [
                                { title: 'Julia M.', subtitle: 'Unternehmerin', description: 'In 3 Monaten habe ich mehr erreicht als in den 3 Jahren davor. Absolut transformierend.' },
                                { title: 'Michael T.', subtitle: 'Führungskraft', description: 'Endlich Klarheit über meinen nächsten Karriereschritt. Vielen Dank!' },
                                { title: 'Sophie R.', subtitle: 'Selbstständige', description: 'Die Investition hat sich schon im ersten Monat rentiert.' },
                            ],
                        },
                    },
                    {
                        name: 'FAQ', type: 'faq', order: 4,
                        content: {
                            heading: 'Häufige Fragen',
                            items: [
                                { title: 'Für wen ist das Coaching geeignet?', description: 'Für alle die beruflich oder persönlich weiterkommen wollen und bereit sind, aktiv daran zu arbeiten.' },
                                { title: 'Wie läuft ein Erstgespräch ab?', description: '30 Minuten kostenlos und unverbindlich — wir schauen gemeinsam ob wir zueinander passen.' },
                                { title: 'Gibt es eine Geld-zurück-Garantie?', description: 'Ja, innerhalb der ersten zwei Sessions volle Rückerstattung wenn du nicht zufrieden bist.' },
                            ],
                        },
                    },
                    {
                        name: 'CTA', type: 'cta', order: 5,
                        content: {
                            heading: 'Bereit für den ersten Schritt?',
                            text: '30 Minuten Erstgespräch — kostenlos, unverbindlich, vertraulich.',
                            buttonText: 'Jetzt Termin buchen',
                            buttonLink: '/termin',
                        },
                        styling: S.primary('#7c3aed'),
                    },
                ],
            },
            {
                name: 'Über mich', slug: '/ueber-mich', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Story', type: 'about', order: 0,
                        content: {
                            heading: 'Wer bin ich?',
                            text: '<p>Ich bin [Name], zertifizierter [Berufsbezeichnung] mit über [N] Jahren Erfahrung. Meine eigene Geschichte hat mich dazu gebracht, anderen dabei zu helfen, ihr volles Potenzial zu entfalten.</p>',
                        },
                    },
                    {
                        name: 'Ausbildung', type: 'stats', order: 1,
                        content: {
                            items: [
                                { value: '[N]+', label: 'Klienten', description: 'erfolgreich begleitet' },
                                { value: '[N]+', label: 'Zertifizierungen', description: 'internationale Abschlüsse' },
                                { value: '[N]+', label: 'Jahre', description: 'Berufserfahrung' },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Termin', slug: '/termin', isHomepage: false, order: 2,
                sections: [{
                        name: 'Termin buchen', type: 'contact', order: 0,
                        content: {
                            heading: 'Kostenloses Erstgespräch buchen',
                            subheading: '30 Minuten · Kostenlos · Unverbindlich · Online oder telefonisch',
                            buttonText: 'Wunschtermin anfragen',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Business — Agentur',
        description: 'Full-Service Agentur-Website mit Portfolio, Team und Preistabelle',
        category: 'business',
        thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
        isPremium: true,
        settings: {
            colors: { primary: '#111827', secondary: '#1f2937', accent: '#f59e0b', background: '#ffffff', text: '#111827' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Wir machen Marken.',
                            subheading: 'Full-Service Agentur für Brand Strategy, Design & Digital Marketing — seit [Jahr].',
                            buttonText: 'Projekt anfragen',
                            buttonLink: '/kontakt',
                        },
                        styling: S.dark('#111827'),
                    },
                    {
                        name: 'Zahlen', type: 'stats', order: 1,
                        content: {
                            items: [
                                { value: '200+', label: 'Projekte', description: 'Erfolgreich umgesetzt' },
                                { value: '85+', label: 'Kunden', description: 'Langfristige Partnerschaften' },
                                { value: '12', label: 'Awards', description: 'Nationale & internationale Auszeichnungen' },
                            ],
                        },
                        styling: S.muted(),
                    },
                    {
                        name: 'Leistungen', type: 'services', order: 2,
                        content: {
                            heading: 'Was wir können',
                            items: [
                                { icon: '🎨', title: 'Brand & Design', description: 'Markenstrategie, CI, Logo, Styleguide' },
                                { icon: '💻', title: 'Digital & Web', description: 'Website, Shop, App' },
                                { icon: '📣', title: 'Marketing & Kampagnen', description: 'SEO, Social, Performance' },
                                { icon: '📷', title: 'Content Produktion', description: 'Foto, Video, Copy' },
                            ],
                        },
                    },
                    {
                        name: 'Referenzen', type: 'gallery', order: 3,
                        content: {
                            heading: 'Ausgewählte Projekte',
                            images: [
                                { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', alt: 'Projekt A', title: 'Rebranding TechCo' },
                                { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600', alt: 'Projekt B', title: 'Website Launch' },
                            ],
                        },
                    },
                    {
                        name: 'Testimonials', type: 'testimonials', order: 4,
                        content: {
                            heading: 'Kunden über uns',
                            items: [
                                { title: 'Sarah M.', subtitle: 'CEO, Scale-Up AG', description: 'Mit Abstand die beste Zusammenarbeit seit Jahren. Professionell, kreativ und immer on-time.' },
                                { title: 'Tom K.', subtitle: 'CMO, Retail GmbH', description: 'Die Kampagne hat unsere Erwartungen bei weitem übertroffen. +65% Conversion.' },
                            ],
                        },
                    },
                    {
                        name: 'CTA', type: 'cta', order: 5,
                        content: {
                            heading: 'Lass uns über dein Projekt sprechen.',
                            text: 'Kostenloses Erstgespräch · Keine Verpflichtungen · 48h Antwortzeit',
                            buttonText: 'Jetzt anfragen',
                            buttonLink: '/kontakt',
                        },
                        styling: { backgroundColor: '#f59e0b', textColor: '#111827' },
                    },
                ],
            },
            {
                name: 'Leistungen', slug: '/leistungen', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Leistungsübersicht', type: 'services', order: 0,
                        content: {
                            heading: 'Alle Leistungen',
                            items: [
                                { icon: '🎨', title: 'Brand Strategy', description: 'Positionierung, Zielgruppenanalyse, Markenwerte', price: 'ab 3.500€' },
                                { icon: '🖌️', title: 'Corporate Design', description: 'Logo, CI, Geschäftsausstattung, Styleguide', price: 'ab 2.500€' },
                                { icon: '💻', title: 'Website & Shop', description: 'Custom Design, CMS, E-Commerce', price: 'ab 5.000€' },
                                { icon: '📣', title: 'Performance Marketing', description: 'Google Ads, Meta Ads, SEO', price: 'ab 1.500€/Monat' },
                            ],
                        },
                    },
                    {
                        name: 'Pakete', type: 'pricing', order: 1,
                        content: {
                            heading: 'Komplett-Pakete',
                            items: [
                                {
                                    title: 'Starter',
                                    price: '4.900€',
                                    description: 'Für Neugründungen',
                                    features: ['Logo & CI (3 Varianten)', 'Website (5 Seiten)', '3 Monate SEO-Setup'],
                                    buttonText: 'Paket anfragen',
                                },
                                {
                                    title: 'Growth',
                                    price: '9.900€',
                                    description: 'Für etablierte Unternehmen',
                                    features: ['Vollständiges Rebranding', 'Custom Website + Shop', 'Performance Marketing Setup', '6 Monate Betreuung'],
                                    buttonText: 'Paket anfragen',
                                    highlighted: true,
                                },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Team', slug: '/team', isHomepage: false, order: 2,
                sections: [{
                        name: 'Team', type: 'team', order: 0,
                        content: {
                            heading: 'Das Team',
                            items: [
                                { title: '[Name]', subtitle: 'Creative Director', description: '[N] Jahre Agenturerfahrung' },
                                { title: '[Name]', subtitle: 'Head of Strategy', description: 'Ex-[Unternehmen], [N] Jahre' },
                                { title: '[Name]', subtitle: 'Lead Developer', description: 'Full-Stack & Performance-Spezialist' },
                            ],
                        },
                    }],
            },
            {
                name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 3,
                sections: [{
                        name: 'Projekt anfragen', type: 'contact', order: 0,
                        content: {
                            heading: 'Projekt anfragen',
                            subheading: 'Erzähl uns von deinem Projekt — wir melden uns innerhalb von 48 Stunden.',
                            buttonText: 'Anfrage senden',
                        },
                    }],
            },
        ],
    },
    {
        name: 'Shop — Einstieg',
        description: 'Sauberer Online-Shop Einstieg für bis zu 100 Produkte',
        category: 'shop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#059669', secondary: '#047857', accent: '#d1fae5', background: '#f9fafb', text: '#111827' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Willkommen im [Shop-Name]',
                            subheading: '[Kurze Beschreibung was du verkaufst] — direkt vom Hersteller.',
                            buttonText: 'Jetzt shoppen',
                            buttonLink: '/shop',
                        },
                        styling: S.primary('#059669'),
                    },
                    {
                        name: 'Highlights', type: 'features', order: 1,
                        content: {
                            heading: 'Warum bei uns kaufen?',
                            items: [
                                { icon: '🚚', title: 'Schnelle Lieferung', description: '1–3 Werktage innerhalb Deutschlands' },
                                { icon: '💳', title: 'Sichere Zahlung', description: 'Stripe · PayPal · Vorkasse' },
                                { icon: '↩️', title: '30 Tage Rückgabe', description: 'Kein Risiko, volle Zufriedenheit' },
                            ],
                        },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 2,
                        content: {
                            heading: '10% Rabatt auf die erste Bestellung',
                            subheading: 'Für alle Newsletter-Abonnenten — einmal anmelden, dauerhaft sparen.',
                            buttonText: 'Rabatt sichern',
                            isNewsletter: true,
                        },
                        styling: S.muted(),
                    },
                ],
            },
            {
                name: 'Shop', slug: '/shop', isHomepage: false, order: 1,
                sections: [{ name: 'Alle Produkte', type: 'features', order: 0, content: { heading: 'Alle Produkte' } }],
            },
        ],
    },
    {
        name: 'Shop — Fashion & Lifestyle',
        description: 'Eleganter Shop für Mode, Accessoires und Lifestyle-Produkte',
        category: 'shop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#18181b', secondary: '#27272a', accent: '#e4e4e7', background: '#ffffff', text: '#18181b' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'New Collection.',
                            subheading: 'Entdecke die neue Kollektion [Saison/Jahr].',
                            buttonText: 'Zur Kollektion',
                            buttonLink: '/shop',
                        },
                        styling: S.dark('#18181b'),
                    },
                    {
                        name: 'Kategorien', type: 'features', order: 1,
                        content: {
                            heading: 'Kollektionen',
                            items: [
                                { icon: '👗', title: 'Damen', description: 'Neuheiten entdecken' },
                                { icon: '👔', title: 'Herren', description: 'Premium Selection' },
                                { icon: '👟', title: 'Accessoires', description: 'Das passende Dazu' },
                            ],
                        },
                    },
                    {
                        name: 'Story', type: 'about', order: 2,
                        content: {
                            heading: 'Über uns',
                            text: '<p>Wir glauben, dass gute Mode nicht kompliziert sein muss. Seit [Jahr] stehen wir für zeitlose Designs aus nachhaltigen Materialien.</p>',
                        },
                    },
                    {
                        name: 'Kundenstimmen', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Das sagen unsere Kunden',
                            items: [
                                { title: 'Lisa M.', subtitle: 'Stammkundin', description: 'Qualität die man anfassen kann. Bestelle seit 3 Jahren ausschließlich hier.' },
                                { title: 'Jana K.', subtitle: 'Kundin', description: 'Superschnelle Lieferung und top Verarbeitung!' },
                            ],
                        },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 4,
                        content: {
                            heading: 'Bleib auf dem neuesten Stand.',
                            subheading: 'Neue Kollektionen, exklusive Angebote und Style-Tipps.',
                            buttonText: 'Newsletter abonnieren',
                            isNewsletter: true,
                        },
                        styling: S.muted(),
                    },
                ],
            },
            {
                name: 'Shop', slug: '/shop', isHomepage: false, order: 1,
                sections: [],
            },
            {
                name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2,
                sections: [
                    {
                        name: 'Brand Story', type: 'about', order: 0,
                        content: {
                            heading: 'Unsere Geschichte',
                            text: '<p>Was als kleines Projekt in [Stadt] begann, ist heute eine der bekanntesten [Nische]-Marken Deutschlands. Handgemacht, nachhaltig, mit Liebe.</p>',
                        },
                    },
                    {
                        name: 'Werte', type: 'features', order: 1,
                        content: {
                            heading: 'Unsere Werte',
                            items: [
                                { icon: '🌱', title: 'Nachhaltig', description: 'Nur zertifizierte Materialien' },
                                { icon: '🤝', title: 'Fair', description: 'Faire Produktion & Löhne' },
                                { icon: '♻️', title: 'Kreislauf', description: 'Recycling & Upcycling Programm' },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        name: 'Shop — Premium & Handmade',
        description: 'Hochwertige Markenpräsenz für Premium-Produkte und Handmade-Shops',
        category: 'shop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
        isPremium: true,
        settings: {
            colors: { primary: '#a16207', secondary: '#854d0e', accent: '#fef3c7', background: '#fffbeb', text: '#1c1917' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Handgemacht. Einzigartig. Deins.',
                            subheading: 'Jedes Stück ein Unikat — gefertigt mit Leidenschaft und Präzision in [Ort].',
                            buttonText: 'Kollektion entdecken',
                            buttonLink: '/shop',
                        },
                        styling: { backgroundColor: '#a16207', textColor: '#ffffff' },
                    },
                    {
                        name: 'Versprechen', type: 'stats', order: 1,
                        content: {
                            items: [
                                { value: '100%', label: 'Handarbeit', description: 'Jedes Stück individuell gefertigt' },
                                { value: '14 Tage', label: 'Lieferzeit', description: 'Hergestellt auf Bestellung' },
                                { value: 'Lifetime', label: 'Garantie', description: 'Auf alle Produkte' },
                            ],
                        },
                        styling: S.muted(),
                    },
                    {
                        name: 'Prozess', type: 'features', order: 2,
                        content: {
                            heading: 'Vom Material zum Meisterwerk',
                            items: [
                                { icon: '🌿', title: 'Auswahl', description: 'Nur die besten Materialien, sorgfältig ausgewählt' },
                                { icon: '🔨', title: 'Fertigung', description: 'Handgefertigt in unserem Atelier in [Ort]' },
                                { icon: '📦', title: 'Versand', description: 'Liebevoll verpackt und sicher geliefert' },
                            ],
                        },
                    },
                    {
                        name: 'Galerie', type: 'gallery', order: 3,
                        content: {
                            heading: 'Unsere Arbeiten',
                            images: [
                                { url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600', alt: 'Produkt 1' },
                                { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', alt: 'Produkt 2' },
                                { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', alt: 'Produkt 3' },
                            ],
                        },
                    },
                    {
                        name: 'Kundenstimmen', type: 'testimonials', order: 4,
                        content: {
                            heading: 'Was unsere Kunden sagen',
                            items: [
                                { title: 'Maria H.', subtitle: 'Stammkundin', description: 'Das schönste Geschenk das ich je gemacht habe. Qualität die man spürt.' },
                                { title: 'Kai B.', subtitle: 'Käufer', description: 'Schnelle Lieferung, perfekte Verarbeitung, absolut zu empfehlen!' },
                            ],
                        },
                    },
                    {
                        name: 'VIP', type: 'contact', order: 5,
                        content: {
                            heading: 'Werde Teil unserer Community',
                            subheading: 'Exklusive Neuheiten, Early Access und VIP-Rabatte für Newsletter-Abonnenten.',
                            buttonText: 'VIP-Zugang sichern',
                            isNewsletter: true,
                        },
                        styling: { backgroundColor: '#a16207', textColor: '#ffffff' },
                    },
                ],
            },
            {
                name: 'Shop', slug: '/shop', isHomepage: false, order: 1,
                sections: [],
            },
            {
                name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2,
                sections: [
                    { name: 'Story', type: 'about', order: 0, content: { heading: 'Die Geschichte hinter der Marke', text: '<p>Alles begann [Jahr] in einem kleinen Atelier in [Ort]. Was als Hobby begann, wurde zur Berufung.</p>' } },
                    { name: 'Team', type: 'team', order: 1, content: { heading: 'Das Team', items: [{ title: '[Name]', subtitle: 'Gründer & Handwerksmeister', description: '[N] Jahre Erfahrung' }] } },
                ],
            },
            {
                name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 3,
                sections: [{ name: 'Kontakt', type: 'contact', order: 0, content: { heading: 'Kontakt & Sonderanfertigungen', subheading: 'Individuelle Wünsche? Sprechen wir darüber.', buttonText: 'Anfrage stellen' } }],
            },
        ],
    },
    {
        name: 'Members — Community',
        description: 'Geschlossene Community mit Mitgliederbereich und Download-Bereich',
        category: 'members',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#ec4899', secondary: '#db2777', accent: '#fce7f3', background: '#fff0f7', text: '#1f2937' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: 'Werde Teil von [Community-Name].',
                            subheading: 'Exklusive Inhalte, Ressourcen und Austausch mit Gleichgesinnten — für [Zielgruppe].',
                            buttonText: 'Jetzt beitreten',
                            buttonLink: '/mitglied-werden',
                        },
                        styling: S.primary('#ec4899'),
                    },
                    {
                        name: 'Was du bekommst', type: 'features', order: 1,
                        content: {
                            heading: 'Was die Mitgliedschaft beinhaltet',
                            items: [
                                { icon: '📁', title: 'Exklusive Ressourcen', description: 'Templates, Guides & Downloads nur für Mitglieder' },
                                { icon: '💬', title: 'Community Forum', description: 'Austausch, Fragen, Feedback — eine echte Community' },
                                { icon: '🎯', title: 'Monatliche Challenges', description: 'Gemeinsam wachsen mit konkreten Aufgaben' },
                            ],
                        },
                    },
                    {
                        name: 'Mitgliedschaft', type: 'pricing', order: 2,
                        content: {
                            heading: 'Mitgliedschaft',
                            items: [
                                {
                                    title: 'Monatlich',
                                    price: '[Preis]€',
                                    description: 'Monatlich kündbar',
                                    features: ['Vollständiger Zugang', 'Alle Ressourcen', 'Community-Zugang', 'Monatlich kündbar'],
                                    buttonText: 'Jetzt beitreten',
                                },
                                {
                                    title: 'Jährlich',
                                    price: '[Preis]€',
                                    description: '2 Monate kostenlos',
                                    features: ['Vollständiger Zugang', 'Alle Ressourcen', 'Community-Zugang', '2 Monate gespart', 'Priority Support'],
                                    buttonText: 'Jetzt sparen',
                                    highlighted: true,
                                },
                            ],
                        },
                    },
                    {
                        name: 'Stimmen', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Was Mitglieder sagen',
                            items: [
                                { title: 'Lisa T.', subtitle: 'Mitglied seit [Jahr]', description: 'Die Community hat mein Business komplett verändert. So viel Mehrwert!' },
                                { title: 'Marc K.', subtitle: 'Mitglied', description: 'Endlich eine Community die wirklich gibt statt nimmt.' },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Mitglied werden', slug: '/mitglied-werden', isHomepage: false, order: 1,
                sections: [{
                        name: 'Anmeldung', type: 'contact', order: 0,
                        content: {
                            heading: 'Mitglied werden',
                            subheading: 'Wähle deinen Plan und tritt noch heute bei.',
                            buttonText: 'Jetzt registrieren',
                        },
                    }],
            },
            {
                name: 'Über', slug: '/ueber', isHomepage: false, order: 2,
                sections: [{ name: 'Über die Community', type: 'about', order: 0, content: { heading: 'Wer steckt dahinter?', text: '<p>Ich bin [Name] und habe [Community-Name] gegründet weil [Grund]. Heute sind wir [Zahl] Mitglieder.</p>' } }],
            },
        ],
    },
    {
        name: 'Members — Online-Kurse',
        description: 'Komplette Kursplattform mit Kursübersicht, Curriculum und Anmeldung',
        category: 'members',
        thumbnailUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
        isPremium: false,
        settings: {
            colors: { primary: '#2563eb', secondary: '#1d4ed8', accent: '#dbeafe', background: '#eff6ff', text: '#1e3a8a' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: '[Dein Wissen]. Dein Tempo. Deine Transformation.',
                            subheading: 'Online-Kurse zu [Thema] — praxisnah, strukturiert, sofort anwendbar.',
                            buttonText: 'Alle Kurse ansehen',
                            buttonLink: '/kurse',
                        },
                        styling: S.primary('#2563eb'),
                    },
                    {
                        name: 'Kurse', type: 'features', order: 1,
                        content: {
                            heading: 'Aktuelle Kurse',
                            items: [
                                { icon: '🎓', title: '[Kurs 1 Name]', description: '[Kurzbeschreibung] · [Dauer] · [Level]' },
                                { icon: '🎓', title: '[Kurs 2 Name]', description: '[Kurzbeschreibung] · [Dauer] · [Level]' },
                                { icon: '🎓', title: '[Kurs 3 Name]', description: '[Kurzbeschreibung] · [Dauer] · [Level]' },
                            ],
                        },
                    },
                    {
                        name: 'Für wen', type: 'about', order: 2,
                        content: {
                            heading: 'Für wen sind diese Kurse?',
                            text: '<p>Meine Kurse richten sich an <strong>[Zielgruppe]</strong> die [Ziel erreichen wollen], aber [aktuelles Problem]. Kein Vorwissen nötig — ich führe dich Schritt für Schritt.</p>',
                        },
                    },
                    {
                        name: 'Testimonials', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Ergebnisse meiner Studenten',
                            items: [
                                { title: 'Anna M.', subtitle: 'Absolventin Kurs 1', description: 'In 4 Wochen mehr gelernt als in einem ganzen Semester. Absolut empfehlenswert!' },
                                { title: 'Jonas T.', subtitle: 'Absolvent Kurs 2', description: 'Der Kurs hat mir geholfen, direkt in der Praxis Ergebnisse zu erzielen.' },
                            ],
                        },
                    },
                    {
                        name: 'FAQ', type: 'faq', order: 4,
                        content: {
                            heading: 'Häufige Fragen',
                            items: [
                                { title: 'Wie lange habe ich Zugang?', description: 'Dauerhaft — einmal kaufen, für immer lernen.' },
                                { title: 'Welches Vorwissen brauche ich?', description: 'Keines! Die Kurse starten von Grund auf.' },
                                { title: 'Gibt es eine Garantie?', description: 'Ja, 30 Tage Geld-zurück ohne Wenn und Aber.' },
                            ],
                        },
                    },
                    {
                        name: 'Newsletter', type: 'contact', order: 5,
                        content: {
                            heading: 'Kostenlose Lernmaterialien',
                            subheading: 'Regelmäßig neue Ressourcen, Tipps und Rabatte für Newsletter-Abonnenten.',
                            buttonText: 'Kostenlos anmelden',
                            isNewsletter: true,
                        },
                        styling: S.muted(),
                    },
                ],
            },
            {
                name: 'Kurse', slug: '/kurse', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Kursübersicht', type: 'features', order: 0,
                        content: {
                            heading: 'Alle Kurse',
                            items: [
                                { icon: '🎓', title: '[Kurs 1]', description: '[Beschreibung] · [N] Lektionen · [Dauer]' },
                                { icon: '🎓', title: '[Kurs 2]', description: '[Beschreibung] · [N] Lektionen · [Dauer]' },
                            ],
                        },
                    },
                    {
                        name: 'Preise', type: 'pricing', order: 1,
                        content: {
                            heading: 'Preise',
                            items: [
                                {
                                    title: 'Einzelkurs',
                                    price: '[Preis]€',
                                    description: 'Einmalig, dauerhafter Zugang',
                                    features: ['Vollzugang zum Kurs', 'Downloadbare Materialien', 'Community-Zugang', '30 Tage Garantie'],
                                    buttonText: 'Kurs kaufen',
                                },
                                {
                                    title: 'All-Access',
                                    price: '[Preis]€/Monat',
                                    description: 'Alle Kurse, monatlich kündbar',
                                    features: ['Zugang zu allen Kursen', 'Neue Inhalte inklusive', 'Priority Support', '1:1 Q&A Session/Monat'],
                                    buttonText: 'All-Access starten',
                                    highlighted: true,
                                },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Über mich', slug: '/ueber-mich', isHomepage: false, order: 2,
                sections: [
                    { name: 'Instructor', type: 'about', order: 0, content: { heading: 'Dein Instructor', text: '<p>Ich bin [Name], [Qualifikation], und helfe seit [Jahr] Menschen dabei, [Ziel] zu erreichen. In meinen Kursen teile ich das Wissen aus [N]+ Jahren Berufserfahrung.</p>' } },
                    { name: 'Zahlen', type: 'stats', order: 1, content: { items: [{ value: '[N]+', label: 'Studenten', description: '' }, { value: '[N]', label: 'Kurse', description: '' }, { value: '[N]%', label: 'Abschlussrate', description: '' }] } },
                ],
            },
        ],
    },
    {
        name: 'Members — Akademie',
        description: 'Vollständige Online-Akademie mit mehreren Kursen, Zertifikaten und Coaching',
        category: 'members',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=300&fit=crop',
        isPremium: true,
        settings: {
            colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', background: '#0f172a', text: '#f8fafc' },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
        pages: [
            {
                name: 'Startseite', slug: '/', isHomepage: true, order: 0,
                sections: [
                    {
                        name: 'Hero', type: 'hero', order: 0,
                        content: {
                            heading: '[Akademie-Name] — Dein Sprungbrett.',
                            subheading: 'Strukturierte Ausbildungen, Zertifikate und persönliches Coaching für [Zielgruppe].',
                            buttonText: 'Akademie entdecken',
                            buttonLink: '/akademie',
                        },
                        styling: S.dark('#0f172a'),
                    },
                    {
                        name: 'Zahlen', type: 'stats', order: 1,
                        content: {
                            items: [
                                { value: '[N]+', label: 'Absolventen', description: 'Erfolgreiche Abschlüsse' },
                                { value: '[N]', label: 'Ausbildungen', description: 'Strukturierte Programme' },
                                { value: '[N]%', label: 'Weiterempfehlung', description: 'Unserer Absolventen' },
                            ],
                        },
                        styling: { backgroundColor: '#1e293b', textColor: '#f8fafc' },
                    },
                    {
                        name: 'Ausbildungen', type: 'features', order: 2,
                        content: {
                            heading: 'Unsere Ausbildungen',
                            items: [
                                { icon: '🏆', title: '[Ausbildung 1]', description: '[Dauer] · [Abschluss] · [Nächster Start]' },
                                { icon: '🏆', title: '[Ausbildung 2]', description: '[Dauer] · [Abschluss] · [Nächster Start]' },
                                { icon: '🏆', title: '[Ausbildung 3]', description: '[Dauer] · [Abschluss] · [Nächster Start]' },
                            ],
                        },
                    },
                    {
                        name: 'Testimonials', type: 'testimonials', order: 3,
                        content: {
                            heading: 'Absolventenstimmen',
                            items: [
                                { title: 'Sandra K.', subtitle: 'Absolventin [Ausbildung 1]', description: 'Die Ausbildung hat mein Leben verändert. Heute arbeite ich bei [Unternehmen].' },
                                { title: 'Tobias M.', subtitle: 'Absolvent [Ausbildung 2]', description: 'Bestmögliche Vorbereitung auf die Praxis. Klare Empfehlung!' },
                            ],
                        },
                    },
                    {
                        name: 'CTA', type: 'cta', order: 4,
                        content: {
                            heading: 'Nächster Kursstart: [Datum]',
                            text: 'Sichere dir jetzt deinen Platz — begrenzte Teilnehmerzahl.',
                            buttonText: 'Platz sichern',
                            buttonLink: '/anmeldung',
                        },
                        styling: { backgroundColor: '#38bdf8', textColor: '#0f172a' },
                    },
                ],
            },
            {
                name: 'Akademie', slug: '/akademie', isHomepage: false, order: 1,
                sections: [
                    {
                        name: 'Alle Ausbildungen', type: 'pricing', order: 0,
                        content: {
                            heading: 'Ausbildungen & Preise',
                            items: [
                                {
                                    title: '[Ausbildung 1]',
                                    price: '[Preis]€',
                                    description: '[Dauer] · Zertifikat',
                                    features: ['[N] Module', 'Persönliches Coaching', 'Zertifikat', 'Alumni-Netzwerk'],
                                    buttonText: 'Jetzt anmelden',
                                },
                                {
                                    title: '[Ausbildung 2]',
                                    price: '[Preis]€',
                                    description: '[Dauer] · Zertifikat',
                                    features: ['[N] Module', '[N]x Einzel-Coaching', 'Zertifikat', 'Job-Vermittlung'],
                                    buttonText: 'Jetzt anmelden',
                                    highlighted: true,
                                },
                            ],
                        },
                    },
                    {
                        name: 'FAQ', type: 'faq', order: 1,
                        content: {
                            heading: 'Häufige Fragen',
                            items: [
                                { title: 'Ist das Zertifikat anerkannt?', description: 'Ja, unsere Zertifikate sind [Akkreditierungsstelle]-akkreditiert.' },
                                { title: 'Kann ich neben dem Job lernen?', description: 'Ja, alle Ausbildungen sind für Berufstätige konzipiert.' },
                                { title: 'Gibt es Finanzierungsmöglichkeiten?', description: 'Ja, wir bieten Ratenzahlung und Bildungsgutscheine (AZAV) an.' },
                            ],
                        },
                    },
                ],
            },
            {
                name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2,
                sections: [
                    { name: 'Mission', type: 'about', order: 0, content: { heading: 'Unsere Mission', text: '<p>[Akademie-Name] wurde [Jahr] gegründet mit einer klaren Mission: [Zielgruppe] die beste Ausbildung für [Bereich] zu bieten.</p>' } },
                    { name: 'Team', type: 'team', order: 1, content: { heading: 'Dozenten & Team', items: [{ title: '[Name]', subtitle: '[Titel/Position]', description: '[Qualifikation], [N] Jahre Erfahrung' }] } },
                ],
            },
            {
                name: 'Anmeldung', slug: '/anmeldung', isHomepage: false, order: 3,
                sections: [{
                        name: 'Anmeldung', type: 'contact', order: 0,
                        content: {
                            heading: 'Jetzt anmelden',
                            subheading: 'Wähle deine Ausbildung und schick uns deine Anfrage — wir melden uns innerhalb von 24h.',
                            buttonText: 'Anmeldung absenden',
                        },
                    }],
            },
        ],
    },
];
async function main() {
    const force = process.argv.includes('--force');
    const catArg = process.argv.find(a => a.startsWith('--category='))?.split('=')[1];
    const nameArg = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   QuickPages Global Templates Seed v3         ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    let templates = TEMPLATES;
    if (catArg)
        templates = templates.filter(t => t.category === catArg);
    if (nameArg)
        templates = templates.filter(t => t.name.toLowerCase().includes(nameArg.toLowerCase()));
    if (force)
        console.log('🔄 --force: Vorhandene Templates werden überschrieben\n');
    const categories = [...new Set(templates.map(t => t.category))];
    for (const cat of categories) {
        const catEmojis = {
            website: '🌐', blog: '✍️', business: '💼', shop: '🛒', members: '🔐',
        };
        console.log(`\n${catEmojis[cat] ?? '📦'} Kategorie: ${cat.toUpperCase()}`);
        for (const tpl of templates.filter(t => t.category === cat)) {
            await createTemplate(tpl, force);
        }
    }
    console.log('\n' + '═'.repeat(50));
    console.log('\n📊 Templates in der DB:\n');
    for (const cat of ['website', 'blog', 'business', 'shop', 'members']) {
        const rows = await db
            .select({ id: website_builder_schema_1.wbGlobalTemplates.id })
            .from(website_builder_schema_1.wbGlobalTemplates)
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.category, cat));
        if (rows.length)
            console.log(`   ${cat.padEnd(12)} ${rows.length} Templates`);
    }
    const total = await db.select({ id: website_builder_schema_1.wbGlobalTemplates.id }).from(website_builder_schema_1.wbGlobalTemplates);
    console.log(`\n   GESAMT:     ${total.length} Templates\n`);
    console.log('✅ Fertig!\n');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=seed-global-templates-v3.js.map