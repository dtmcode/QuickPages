"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const drizzle_orm_1 = require("drizzle-orm");
const website_builder_schema_1 = require("../../src/drizzle/website-builder.schema");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
const TEMPLATE_NAME = 'Demo — Elektriker (website_micro)';
async function deleteIfExists(name) {
    const [existing] = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, name))
        .limit(1);
    if (existing) {
        await db.delete(website_builder_schema_1.wbGlobalTemplates).where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, existing.id));
        console.log(`   🗑️  Altes Template gelöscht`);
    }
}
async function main() {
    const force = process.argv.includes('--force');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  Demo-Template: website_micro — Elektriker              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    const [existing] = await db
        .select({ id: website_builder_schema_1.wbGlobalTemplates.id })
        .from(website_builder_schema_1.wbGlobalTemplates)
        .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.name, TEMPLATE_NAME))
        .limit(1);
    if (existing && !force) {
        console.log(`⏭️  "${TEMPLATE_NAME}" existiert bereits.\n`);
        console.log('Nutze --force zum Überschreiben.\n');
        await pool.end();
        return;
    }
    if (existing && force)
        await deleteIfExists(TEMPLATE_NAME);
    const [template] = await db.insert(website_builder_schema_1.wbGlobalTemplates).values({
        name: TEMPLATE_NAME,
        description: 'Fertig ausgefüllte One-Page für Handwerker und lokale Dienstleister — zeigt direkt was möglich ist',
        category: 'website_micro',
        thumbnailUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
        isActive: true,
        isPremium: false,
        settings: {
            package: 'website_micro',
            niche: 'handwerk',
            colors: {
                primary: '#f97316',
                secondary: '#ea580c',
                accent: '#fef3c7',
                background: '#ffffff',
                text: '#1c1917',
            },
            fonts: { heading: 'Inter', body: 'Inter' },
        },
    }).returning();
    console.log(`✅ Template angelegt: ${template.id}\n`);
    const [home] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: template.id,
        name: 'Startseite',
        slug: '/',
        isHomepage: true,
        order: 0,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values([
        {
            pageId: home.id,
            name: 'Hero',
            type: 'hero',
            order: 0,
            content: {
                heading: 'Elektro Hoffmann — Ihr Elektriker in Köln',
                subheading: 'Installations-, Reparatur- und Smart-Home-Arbeiten für Privat und Gewerbe. Meisterbetrieb seit 1998. Kostenlose Beratung.',
                buttonText: 'Jetzt kostenlos anfragen',
                buttonLink: '#kontakt',
                imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&h=600&fit=crop',
                badge: '⚡ 24h Notdienst verfügbar',
            },
            styling: { backgroundColor: '#f97316', textColor: '#ffffff' },
        },
        {
            pageId: home.id,
            name: 'Vertrauen',
            type: 'stats',
            order: 1,
            content: {
                items: [
                    { value: '25+', label: 'Jahre Erfahrung', description: 'Meisterbetrieb seit 1998' },
                    { value: '1.200+', label: 'Aufträge/Jahr', description: 'In Köln und Umgebung' },
                    { value: '4.9★', label: 'Google Bewertung', description: 'Aus 180+ Rezensionen' },
                    { value: '24/7', label: 'Notdienst', description: 'Auch an Wochenenden' },
                ],
            },
            styling: { backgroundColor: '#1c1917', textColor: '#f5f5f4' },
        },
        {
            pageId: home.id,
            name: 'Leistungen',
            type: 'services',
            order: 2,
            content: {
                heading: 'Was wir für Sie tun',
                subtitle: 'Vom einfachen Steckdosen-Tausch bis zur kompletten Hausinstallation',
                items: [
                    {
                        icon: '🔌',
                        title: 'Elektroinstallation',
                        description: 'Neuinstallation, Erweiterung und Sanierung von Elektrik in Wohn- und Gewerbegebäuden. Alle Arbeiten nach VDE-Norm.',
                        price: 'ab 89€/h',
                        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
                    },
                    {
                        icon: '🏠',
                        title: 'Smart Home',
                        description: 'KNX, Loxone, Philips Hue, automatische Rollläden, intelligente Heizungssteuerung — wir vernetzen Ihr Zuhause.',
                        price: 'ab 1.200€',
                        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=250&fit=crop',
                    },
                    {
                        icon: '☀️',
                        title: 'Photovoltaik & Batterie',
                        description: 'Planung, Installation und Inbetriebnahme von PV-Anlagen bis 30 kWp inkl. Batteriespeicher und Wallbox.',
                        price: 'Angebot auf Anfrage',
                        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop',
                    },
                    {
                        icon: '🛠️',
                        title: 'Reparaturen & Notdienst',
                        description: 'Kurzschluss, Leitungsbruch, defekte Sicherung — wir sind innerhalb von 2 Stunden bei Ihnen. 24/7, 365 Tage.',
                        price: '119€ Anfahrtspauschale',
                        imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=250&fit=crop',
                    },
                    {
                        icon: '🚿',
                        title: 'Bad & Küche',
                        description: 'Elektrik im Nassbereich, GFCI-Absicherung, Einbau von Elektrogeräten, Dunstabzugshauben und Beleuchtung.',
                        price: 'ab 149€',
                        imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=250&fit=crop',
                    },
                    {
                        icon: '🏢',
                        title: 'Gewerbe & Industrie',
                        description: 'Schaltschrankbau, Betriebselektrik, Wartungsverträge und DGUV-Prüfungen für Betriebe aller Größen.',
                        price: 'Pauschalpreise auf Anfrage',
                        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=250&fit=crop',
                    },
                ],
            },
        },
        {
            pageId: home.id,
            name: 'Über uns',
            type: 'about',
            order: 3,
            content: {
                heading: 'Familie Hoffmann — Elektriker aus Leidenschaft',
                text: `<p>Was 1998 als Einzelbetrieb begann, ist heute ein Team aus 12 Elektrikern und Meistern, das täglich rund 200 Aufträge in Köln und dem Rhein-Erft-Kreis betreut.</p>
<p>Inhaber Klaus Hoffmann, Elektromeister und gebürtiger Kölner, legt Wert auf drei Dinge: <strong>Pünktlichkeit, saubere Arbeit und ehrliche Preise</strong>. Alle unsere Monteure sind fest angestellt, kontinuierlich weitergebildet und kennen die Eigenheiten der Kölner Altbauten wie kaum jemand sonst.</p>
<p>Wir arbeiten ausschließlich nach DIN VDE 0100 und bieten <strong>5 Jahre Gewährleistung</strong> auf alle unsere Installationen.</p>`,
                imageUrl: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=800&h=500&fit=crop',
                highlights: [
                    'Meisterbetrieb · Eintrag in der Handwerksrolle',
                    'VDE-geprüfte Fachkräfte',
                    '5 Jahre Gewährleistung',
                    'Festpreisangebote auf Anfrage',
                ],
            },
        },
        {
            pageId: home.id,
            name: 'Unsere Arbeiten',
            type: 'gallery',
            order: 4,
            content: {
                heading: 'Einblick in unsere Projekte',
                images: [
                    { url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop', alt: 'Schaltschrank Neubau', title: 'Schaltschrank Installation' },
                    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', alt: 'Unterverteilung', title: 'Unterverteilung Einfamilienhaus' },
                    { url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', alt: 'PV-Anlage', title: 'PV-Anlage 15 kWp' },
                    { url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop', alt: 'Smart Home', title: 'KNX Smart Home Penthouse' },
                    { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', alt: 'Notdienst', title: '24h Notdienst Einsatz' },
                    { url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop', alt: 'Gewerbebetrieb', title: 'Betriebselektrik Lagerhalle' },
                ],
            },
        },
        {
            pageId: home.id,
            name: 'Bewertungen',
            type: 'testimonials',
            order: 5,
            content: {
                heading: 'Das sagen unsere Kunden',
                source: 'Google Bewertungen · Ø 4,9 von 5',
                items: [
                    {
                        title: 'Familie Becker, Köln-Ehrenfeld',
                        subtitle: '⭐⭐⭐⭐⭐',
                        description: 'Herr Hoffmann hat unser gesamtes Altbau-Haus neu verkabelt. Trotz der komplexen Bausubstanz wurde alles pünktlich und ordentlich abgeschlossen. Preis war fair und genau wie im Angebot.',
                        date: 'März 2024',
                    },
                    {
                        title: 'Restaurant Palazzo, Köln-Innenstadt',
                        subtitle: '⭐⭐⭐⭐⭐',
                        description: 'Notdienst Einsatz um 23 Uhr — innerhalb von 90 Minuten war der Monteur da, hat den Fehler gefunden und behoben. Für ein Restaurant ist so eine Reaktionszeit Gold wert.',
                        date: 'Januar 2024',
                    },
                    {
                        title: 'Thomas K., Frechen',
                        subtitle: '⭐⭐⭐⭐⭐',
                        description: 'Smart Home Installation inklusive PV-Anlage. Alles aus einer Hand, super Beratung, keine versteckten Kosten. Ich spare jetzt 80% meiner Stromrechnung.',
                        date: 'November 2023',
                    },
                ],
            },
            styling: { backgroundColor: '#f9fafb', textColor: '#1c1917' },
        },
        {
            pageId: home.id,
            name: 'FAQ',
            type: 'faq',
            order: 6,
            content: {
                heading: 'Häufige Fragen',
                items: [
                    {
                        title: 'Wie schnell können Sie einen Termin anbieten?',
                        description: 'Für normale Aufträge vergeben wir in der Regel Termine innerhalb von 2–5 Werktagen. Für Notdienst-Einsätze sind wir 24/7 erreichbar und innerhalb von 2 Stunden vor Ort.',
                    },
                    {
                        title: 'Geben Sie Festpreisangebote?',
                        description: 'Ja, für größere Projekte (ab ca. 500€) erstellen wir gerne ein verbindliches Festpreisangebot nach einer kostenlosen Vor-Ort-Besichtigung. Für Kleinaufträge rechnen wir nach Aufwand ab.',
                    },
                    {
                        title: 'Arbeiten Sie auch in Altbauten?',
                        description: 'Absolut — das ist sogar eine unserer Spezialitäten. Wir kennen die typischen Herausforderungen Kölner Altbauten (Knob-and-Tube-Verkabelung, enge Kabelwege) aus jahrelanger Erfahrung.',
                    },
                    {
                        title: 'Welche Garantie geben Sie auf Ihre Arbeit?',
                        description: '5 Jahre Gewährleistung auf alle Installationsarbeiten, die wir ausführen. Materialien mit Herstellergarantie kommen noch obendrauf.',
                    },
                ],
            },
        },
        {
            pageId: home.id,
            name: 'Kontakt',
            type: 'contact',
            order: 7,
            content: {
                heading: 'Kostenlos anfragen',
                subheading: 'Beschreiben Sie kurz Ihr Vorhaben — wir melden uns innerhalb von 2 Stunden mit einem unverbindlichen Angebot.',
                buttonText: 'Anfrage senden',
                details: {
                    phone: '+49 221 123456',
                    email: 'info@elektro-hoffmann.de',
                    address: 'Hansaring 88, 50670 Köln',
                    hours: 'Mo–Fr 7–18 Uhr · Sa 8–14 Uhr · Notdienst 24/7',
                },
                mapEmbed: 'https://maps.google.com/?q=Hansaring+88+Köln',
            },
            styling: { backgroundColor: '#f97316', textColor: '#ffffff' },
        },
    ]);
    const [impressum] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: template.id,
        name: 'Impressum',
        slug: '/impressum',
        isHomepage: false,
        order: 100,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values({
        pageId: impressum.id,
        name: 'Impressum',
        type: 'text',
        order: 0,
        content: {
            text: `# Impressum

**Elektro Hoffmann GmbH & Co. KG**
Hansaring 88
50670 Köln

**Kontakt:**
Telefon: +49 221 123456
E-Mail: info@elektro-hoffmann.de

**Handelsregister:** HRA 12345, Amtsgericht Köln
**USt-IdNr.:** DE123456789

**Vertreten durch:**
Klaus Hoffmann, Geschäftsführer

> ⚠️ Bitte ersetze alle Angaben mit deinen echten Unternehmensdaten.`,
        },
    });
    const [datenschutz] = await db.insert(website_builder_schema_1.wbGlobalTemplatePages).values({
        templateId: template.id,
        name: 'Datenschutz',
        slug: '/datenschutz',
        isHomepage: false,
        order: 101,
    }).returning();
    await db.insert(website_builder_schema_1.wbGlobalTemplateSections).values({
        pageId: datenschutz.id,
        name: 'Datenschutz',
        type: 'text',
        order: 0,
        content: {
            text: `# Datenschutzerklärung

## 1. Verantwortlicher

Elektro Hoffmann GmbH & Co. KG
Hansaring 88, 50670 Köln
E-Mail: info@elektro-hoffmann.de

## 2. Erhebung personenbezogener Daten

Wir erheben Daten nur soweit für die Bereitstellung unserer Dienste nötig. Beim Aufruf dieser Website speichert unser Hosting-Anbieter Server-Log-Dateien (IP-Adresse, Browsertyp, Zugriffszeit). Kontaktanfragen werden zur Bearbeitung gespeichert und nach 6 Monaten gelöscht.

## 3. Ihre Rechte

Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Widerspruch (Art. 21 DSGVO). Kontakt: info@elektro-hoffmann.de

## 4. Cookies

Diese Website setzt keine Tracking-Cookies.

> ⚠️ Bitte passe diese Erklärung an deine tatsächliche Datenverarbeitung an.`,
        },
    });
    console.log('📄 Seiten angelegt:');
    console.log('   ✅  Startseite (8 Sections: Hero, Stats, Services, About, Gallery, Testimonials, FAQ, Contact)');
    console.log('   ✅  Impressum');
    console.log('   ✅  Datenschutz');
    console.log('\n🎯 Paket: website_micro');
    console.log('🏭 Nische: Elektro Hoffmann — Elektriker in Köln');
    console.log('🎨 Farbe: Orange #f97316\n');
    await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
//# sourceMappingURL=website_micro.js.map