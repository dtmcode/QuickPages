// 📂 PFAD: backend/scripts/templates/shop_mini.ts
//
// Demo-Template für Paket: shop_mini
// Nische: AURYN — Handgemachter Silberschmuck aus Hamburg
//
// Run:
//   npx ts-node -r tsconfig-paths/register scripts/templates/shop_mini.ts
//   npx ts-node -r tsconfig-paths/register scripts/templates/shop_mini.ts --force

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import {
  wbGlobalTemplates,
  wbGlobalTemplatePages,
  wbGlobalTemplateSections,
} from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool);

const TEMPLATE_NAME = 'Demo — Schmuck Shop (shop_mini)';

async function deleteIfExists(name: string) {
  const [existing] = await db
    .select({ id: wbGlobalTemplates.id })
    .from(wbGlobalTemplates)
    .where(eq(wbGlobalTemplates.name, name))
    .limit(1);
  if (existing) {
    await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));
    console.log('   🗑️  Altes Template gelöscht');
  }
}

async function main() {
  const force = process.argv.includes('--force');

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Demo-Template: shop_mini — Schmuck Shop                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const [existing] = await db
    .select({ id: wbGlobalTemplates.id })
    .from(wbGlobalTemplates)
    .where(eq(wbGlobalTemplates.name, TEMPLATE_NAME))
    .limit(1);

  if (existing && !force) {
    console.log(`⏭️  "${TEMPLATE_NAME}" existiert bereits. Nutze --force.\n`);
    await pool.end();
    return;
  }

  if (existing && force) await deleteIfExists(TEMPLATE_NAME);

  // ─── Template ───────────────────────────────────────────────────────────────

  const [template] = await db.insert(wbGlobalTemplates).values({
    name:         TEMPLATE_NAME,
    description:  'Eleganter Mini-Shop für handgefertigte Produkte — bereit zum Verkaufen ab Tag 1',
    category:     'shop_mini',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
    isActive:     true,
    isPremium:    false,
    settings: {
      package:  'shop_mini',
      niche:    'schmuck',
      colors: {
        primary:    '#44403c',   // Warmes Dunkelbraun — edel, handmade
        secondary:  '#292524',
        accent:     '#d4af37',   // Gold-Akzent
        background: '#fafaf9',
        text:       '#1c1917',
      },
      fonts: { heading: "'Playfair Display', serif", body: 'Inter' },
    },
  }).returning();

  console.log(`✅ Template angelegt: ${template.id}\n`);

  // ─── STARTSEITE ─────────────────────────────────────────────────────────────

  const [home] = await db.insert(wbGlobalTemplatePages).values({
    templateId: template.id,
    name:       'Startseite',
    slug:       '/',
    isHomepage: true,
    order:      0,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values([

    // ── HERO ────────────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Hero',
      type:    'hero',
      order:   0,
      content: {
        heading:    'Schmuck der bleibt.',
        subheading: 'AURYN — handgefertigter Silberschmuck aus Hamburg. Jedes Stück ein Unikat, jede Bestellung mit Liebe verpackt.',
        buttonText: 'Kollektion entdecken',
        buttonLink: '/shop',
        secondaryButtonText: 'Unsere Geschichte',
        secondaryButtonLink: '/ueber-uns',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&h=700&fit=crop',
        overlay:  true,
      },
      styling: { backgroundColor: '#1c1917', textColor: '#fafaf9' },
    },

    // ── USPs ─────────────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Versprechen',
      type:    'features',
      order:   1,
      content: {
        heading: '',
        items: [
          {
            icon:        '🔨',
            title:       '100% Handarbeit',
            description: 'Jedes Stück wird von Hand gefertigt — kein Massenartikel, kein Industrieschmuck.',
          },
          {
            icon:        '♻️',
            title:       'Recyceltes Silber 925',
            description: 'Wir verwenden ausschließlich recyceltes Sterlingsilber aus zertifizierten Quellen.',
          },
          {
            icon:        '📦',
            title:       'Liebevolle Verpackung',
            description: 'Jede Bestellung kommt in einer wiederverwendbaren Geschenkbox aus Bambus.',
          },
          {
            icon:        '↩️',
            title:       '30 Tage Rückgabe',
            description: 'Nicht verliebt? Kein Problem — volle Rückerstattung innerhalb von 30 Tagen.',
          },
        ],
      },
      styling: { backgroundColor: '#fafaf9', textColor: '#1c1917' },
    },

    // ── BESTSELLER ───────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Bestseller',
      type:    'features',
      order:   2,
      content: {
        heading:  'Unsere Bestseller',
        subtitle: 'Die am meisten geliebten Stücke aus unserer Werkstatt',
        items: [
          {
            icon:        '🌿',
            title:       'Lorbeer-Ring',
            description: 'Handgravierter Ring aus 925er Sterlingsilber. Erhältlich in den Größen 50–62.',
            price:       '89€',
            imageUrl:    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
            badge:       '🔥 Bestseller',
            buttonText:  'Jetzt kaufen',
            buttonLink:  '/shop',
          },
          {
            icon:        '✨',
            title:       'Mondstein-Anhänger',
            description: 'Zarter Silberanhänger mit echtem Mondstein (Cabochon). Kommt mit Silberkette 45cm.',
            price:       '124€',
            imageUrl:    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
            badge:       '❤️ Favorit',
            buttonText:  'Jetzt kaufen',
            buttonLink:  '/shop',
          },
          {
            icon:        '🌊',
            title:       'Wellen-Armband',
            description: 'Fein gehämmertes Armband in Wellenform. Minimalistisch, elegant, zeitlos.',
            price:       '67€',
            imageUrl:    'https://images.unsplash.com/photo-1573408301185-9519f94f93d4?w=400&h=400&fit=crop',
            badge:       '🆕 Neu',
            buttonText:  'Jetzt kaufen',
            buttonLink:  '/shop',
          },
        ],
        ctaText: 'Alle Produkte ansehen →',
        ctaLink: '/shop',
      },
    },

    // ── BRAND STORY ──────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Unsere Geschichte',
      type:    'about',
      order:   3,
      content: {
        heading: 'Entstanden aus einer Leidenschaft',
        text: `<p>AURYN — das ist Goldschmiedin <strong>Nele Hartmann</strong> und ihre kleine Werkstatt in Hamburg-Ottensen. Was 2019 als Hobby an einem alten Küchentisch begann, ist heute eine der gefragtesten Handmade-Schmuckmarken des Nordens.</p>
<p>Jedes Stück entsteht in Handarbeit: vom Entwurf auf Papier über das Hämmern und Feilen bis zum finalen Polieren. Nele verarbeitet ausschließlich recyceltes Sterlingsilber und bezieht Edelsteine von kleinen, ethischen Händlern aus Europa.</p>
<blockquote><em>"Ich möchte, dass jeder der ein AURYN-Stück trägt, spürt wie viel Herzblut darin steckt."</em> — Nele Hartmann</blockquote>`,
        imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f94f93d4?w=800&h=600&fit=crop',
      },
      styling: { backgroundColor: '#f9f5f0', textColor: '#1c1917' },
    },

    // ── GALERIE ──────────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Galerie',
      type:    'gallery',
      order:   4,
      content: {
        heading: 'Aus der Werkstatt',
        images: [
          { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop', alt: 'Silberringe', title: 'Ringe' },
          { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', alt: 'Mondstein-Anhänger', title: 'Anhänger & Ketten' },
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop', alt: 'Werkstatt', title: 'Die Werkstatt' },
          { url: 'https://images.unsplash.com/photo-1573408301185-9519f94f93d4?w=600&h=600&fit=crop', alt: 'Armbänder', title: 'Armbänder' },
          { url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop', alt: 'Verpackung', title: 'Verpackung' },
          { url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=600&fit=crop', alt: 'Detailaufnahme', title: 'Details' },
        ],
      },
    },

    // ── TESTIMONIALS ─────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Kundenstimmen',
      type:    'testimonials',
      order:   5,
      content: {
        heading: 'Was unsere Kunden sagen',
        items: [
          {
            title:       'Mia S. aus Berlin',
            subtitle:    '⭐⭐⭐⭐⭐ — verifizierter Kauf',
            description: 'Den Mondstein-Anhänger habe ich mir zum Geburtstag geschenkt und ich trage ihn jeden Tag. Die Qualität ist außergewöhnlich und die Verpackung war ein Erlebnis an sich.',
            imageUrl:    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          },
          {
            title:       'Thomas K. aus München',
            subtitle:    '⭐⭐⭐⭐⭐ — verifizierter Kauf',
            description: 'Habe den Lorbeer-Ring als Jahrestaggeschenk für meine Frau bestellt. Sie war zu Tränen gerührt. Nele hat sogar eine kleine handgeschriebene Notiz beigelegt.',
            imageUrl:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          },
          {
            title:       'Sarah P. aus Hamburg',
            subtitle:    '⭐⭐⭐⭐⭐ — verifizierter Kauf',
            description: 'Ich kaufe hier seit 3 Jahren regelmäßig. Jedes Mal ist die Qualität tadellos, die Lieferung schnell und der Service herzlich. AURYN ist einfach etwas Besonderes.',
            imageUrl:    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          },
        ],
      },
      styling: { backgroundColor: '#f9f5f0', textColor: '#1c1917' },
    },

    // ── NEWSLETTER ───────────────────────────────────────────────────────────
    {
      pageId:  home.id,
      name:    'Newsletter',
      type:    'contact',
      order:   6,
      content: {
        heading:     '10% Rabatt auf deine erste Bestellung',
        subheading:  'Trag dich in unseren Newsletter ein und erhalte sofort einen Rabattcode. Dazu: Einblicke aus der Werkstatt, neue Kollektionen und exklusive Angebote.',
        buttonText:  'Rabatt sichern',
        isNewsletter: true,
        incentive:   'WILLKOMMEN10',
      },
      styling: { backgroundColor: '#44403c', textColor: '#fafaf9' },
    },

  ]);

  // ─── SHOP SEITE ─────────────────────────────────────────────────────────────

  const [shop] = await db.insert(wbGlobalTemplatePages).values({
    templateId: template.id,
    name:       'Shop',
    slug:       '/shop',
    isHomepage: false,
    order:      1,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId:  shop.id,
      name:    'Shop Header',
      type:    'hero',
      order:   0,
      content: {
        heading:    'Alle Kollektionen',
        subheading: 'Handgefertigter Schmuck aus Hamburg — jedes Stück ein Unikat',
        imageUrl:   'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1400&h=400&fit=crop',
        minimal:    true,
      },
      styling: { backgroundColor: '#1c1917', textColor: '#fafaf9' },
    },
    {
      pageId:  shop.id,
      name:    'Produkte',
      type:    'features',
      order:   1,
      content: {
        heading: 'Ringe',
        items: [
          { title: 'Lorbeer-Ring', description: 'Sterling Silber 925, handgraviert', price: '89€', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop' },
          { title: 'Hammered-Ring', description: 'Sterling Silber 925, gehämmert, minimalistisch', price: '74€', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop' },
          { title: 'Organic-Ring', description: 'Sterling Silber 925, organische Form, Einzelstück', price: '112€', imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop' },
        ],
      },
    },
    {
      pageId:  shop.id,
      name:    'Anhänger & Ketten',
      type:    'features',
      order:   2,
      content: {
        heading: 'Anhänger & Ketten',
        items: [
          { title: 'Mondstein-Anhänger', description: 'Silber 925 + echter Mondstein, mit Kette 45cm', price: '124€', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop' },
          { title: 'Labradorit-Kette', description: 'Silber 925 + Labradorit-Stein, Kette 42cm', price: '138€', imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop' },
          { title: 'Minimal Tropfen', description: 'Feiner Tropfen-Anhänger, Sterling Silber 925', price: '59€', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop' },
        ],
      },
    },
  ]);

  // ─── ÜBER UNS SEITE ─────────────────────────────────────────────────────────

  const [about] = await db.insert(wbGlobalTemplatePages).values({
    templateId: template.id,
    name:       'Über uns',
    slug:       '/ueber-uns',
    isHomepage: false,
    order:      2,
  }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId:  about.id,
      name:    'Story',
      type:    'about',
      order:   0,
      content: {
        heading: 'Nele Hartmann — Goldschmiedin',
        text: `<p>Ich bin Nele, 34 Jahre alt, gelernte Goldschmiedin und leidenschaftliche Minimalistin aus Hamburg-Ottensen. Nach 8 Jahren im Schmuckatelier einer größeren Manufaktur habe ich 2019 den Schritt in die Selbstständigkeit gewagt — und bereue ihn keine Sekunde.</p>
<p>In meiner kleinen Werkstatt entstehen alle Stücke von Hand: Entwerfen, sägen, hämmern, feilen, löten, polieren. Ein Ring braucht im Schnitt 4–6 Stunden. Ein Anhänger mit Stein bis zu 8 Stunden. Das ist echte Handarbeit — und das sieht man.</p>
<p>Ich verwende ausschließlich recyceltes Sterlingsilber (925/1000) und beziehe alle Edelsteine direkt bei kleinen, ethischen Händlern in Deutschland und der Schweiz. Kein Blut-Diamant, kein Dumpingpreis auf Kosten der Erde.</p>`,
        imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f94f93d4?w=800&h=600&fit=crop',
      },
    },
    {
      pageId:  about.id,
      name:    'Werte',
      type:    'features',
      order:   1,
      content: {
        heading: 'Was uns antreibt',
        items: [
          { icon: '🌱', title: 'Nachhaltigkeit', description: 'Recyceltes Silber, ethische Steine, plastikfreie Verpackung — Umweltschutz ist kein Trend sondern Haltung.' },
          { icon: '🔨', title: 'Handwerkskunst', description: 'Wir lehnen industrielle Massenproduktion ab. Jedes Stück entsteht in Handarbeit mit Werkzeugen die ihre Vorfahren schon benutzten.' },
          { icon: '❤️', title: 'Langlebigkeit', description: 'Wir bauen keinen Modeschmuck der nach einer Saison verblasst. AURYN-Stücke sind für die Ewigkeit gemacht.' },
        ],
      },
    },
  ]);

  // ─── IMPRESSUM / DATENSCHUTZ ────────────────────────────────────────────────

  for (const [name, slug, order, text] of [
    ['Impressum', '/impressum', 100, `# Impressum\n\n**AURYN Schmuck**\nNele Hartmann\nOttensenweg 12\n22765 Hamburg\n\nTel: +49 40 123456\nE-Mail: hallo@auryn-schmuck.de\n\n> ⚠️ Bitte ersetze alle Angaben mit deinen echten Daten.`],
    ['Datenschutz', '/datenschutz', 101, `# Datenschutzerklärung\n\n**Verantwortliche:** Nele Hartmann, AURYN Schmuck, Ottensenweg 12, 22765 Hamburg\n\nWir verarbeiten personenbezogene Daten nur zur Bestellabwicklung und auf Grundlage Ihrer Einwilligung (Newsletter). Ihre Daten werden nicht an Dritte weitergegeben.\n\n> ⚠️ Bitte passe diese Erklärung an deine tatsächliche Datenverarbeitung an.`],
  ] as const) {
    const [page] = await db.insert(wbGlobalTemplatePages).values({
      templateId: template.id, name, slug, isHomepage: false, order,
    }).returning();
    await db.insert(wbGlobalTemplateSections).values({
      pageId: page.id, name, type: 'text', order: 0, content: { text },
    });
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  console.log('📄 Seiten angelegt:');
  console.log('   ✅  Startseite (7 Sections: Hero, Features, Bestseller, Story, Gallery, Testimonials, Newsletter)');
  console.log('   ✅  Shop (Ringe + Anhänger)');
  console.log('   ✅  Über uns');
  console.log('   ✅  Impressum');
  console.log('   ✅  Datenschutz');
  console.log('\n🎯 Paket: shop_mini');
  console.log('🏭 Nische: AURYN — Handgemachter Silberschmuck, Hamburg');
  console.log('🎨 Farbe: Dunkelbraun #44403c + Gold-Akzent\n');

  await pool.end();
}

main().catch(err => { console.error('❌', err); process.exit(1); });
