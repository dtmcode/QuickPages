// 📂 PFAD: backend/scripts/templates/website_pro.ts
// Paket: website_pro — Fotografin Laura Becker, Berlin
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/website_pro.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Fotografin (website_pro)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Portfolio-Website einer Fotografin mit Galerie, Preisen und Buchung',
    category: 'website_pro', thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'website_pro', niche: 'fotografie', colors: { primary: '#1a1a1a', secondary: '#2c2c2c', accent: '#e8d5b7', background: '#fafaf8', text: '#1a1a1a' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Laura Becker Photography', subheading: 'Hochzeiten · Portraits · Editorials. Berlin & weltweit. Ich fotografiere Momente die bleiben.', buttonText: 'Portfolio ansehen', buttonLink: '/portfolio', secondaryButtonText: 'Anfrage stellen', secondaryButtonLink: '#kontakt', imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400&h=700&fit=crop' }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Kategorien', type: 'features', order: 1, content: { heading: 'Meine Spezialgebiete', items: [
      { icon: '💍', title: 'Hochzeitsfotografie', description: 'Euer Tag. Eure Geschichte. Ich halte die echten Momente fest — nicht die gestellten.', price: 'ab 2.400€', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop' },
      { icon: '👤', title: 'Portrait & Business', description: 'Bewerbungsfotos, LinkedIn-Portraits, Personal Branding. Studio oder bei dir vor Ort.', price: 'ab 350€', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop' },
      { icon: '📸', title: 'Editorial & Werbung', description: 'Produktfotografie, Magazin-Editorials, Kampagnen für Brands und Agenturen.', price: 'Auf Anfrage', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop' },
    ]}},
    { pageId: home.id, name: 'Galerie', type: 'gallery', order: 2, content: { heading: 'Ausgewählte Arbeiten', images: [
      { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', alt: 'Hochzeit', title: 'Hochzeit · Potsdam' },
      { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop', alt: 'Portrait', title: 'Portrait · Berlin' },
      { url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop', alt: 'Editorial', title: 'Editorial · Vogue Germany' },
      { url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=400&fit=crop', alt: 'Fashion', title: 'Fashion · Berlin Fashion Week' },
      { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop', alt: 'Hochzeit 2', title: 'Hochzeit · Schloss Charlottenburg' },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', alt: 'Business Portrait', title: 'Business Portrait · Startup' },
    ]}},
    { pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 3, content: { heading: 'Was Kunden sagen', items: [
      { title: 'Sophie & Jan, Hochzeitspaar', subtitle: '⭐⭐⭐⭐⭐', description: 'Laura hat unsere Hochzeit so eingefangen wie wir sie in Erinnerung haben — lebendig, warm, echt. Wir hängen drei Bilder an der Wand und weinen jedes Mal fast vor Freude.' },
      { title: 'Dr. Mia Schulz, Unternehmerin', subtitle: '⭐⭐⭐⭐⭐', description: 'Meine neuen Business-Portraits haben mein LinkedIn-Profil transformiert. Mehr Anfragen, mehr Credibility. Laura versteht es Menschen so zu fotografieren wie sie wirken wollen.' },
    ]} },
    { pageId: home.id, name: 'Kontakt', type: 'contact', order: 4, content: { heading: 'Anfrage stellen', subheading: 'Erzähl mir von deinem Projekt — ich melde mich innerhalb von 48 Stunden.', buttonText: 'Anfrage senden', details: { email: 'hallo@laura-becker-photo.de', address: 'Berlin-Mitte (Studio) · Weltweit auf Anfrage', hours: 'Anfragen jederzeit · Beratung Mo–Fr 10–18 Uhr' } }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  ]);

  const [portfolio] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Portfolio', slug: '/portfolio', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: portfolio.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Portfolio', subheading: 'Eine Auswahl meiner Arbeiten aus den letzten Jahren', minimal: true }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
    { pageId: portfolio.id, name: 'Hochzeiten', type: 'gallery', order: 1, content: { heading: 'Hochzeiten', images: [
      { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', alt: 'Hochzeit Berlin', title: 'Berlin 2024' },
      { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop', alt: 'Hochzeit Potsdam', title: 'Potsdam 2023' },
      { url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop', alt: 'Hochzeit Hamburg', title: 'Hamburg 2023' },
    ]}},
  ]);

  const [preise] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Preise', slug: '/preise', isHomepage: false, order: 2 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: preise.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Preise & Pakete', subheading: 'Transparente Preise ohne versteckte Kosten', minimal: true }, styling: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
    { pageId: preise.id, name: 'Pakete', type: 'features', order: 1, content: { heading: 'Hochzeitspakete', items: [
      { title: 'Silber', description: '4 Stunden · 200 Fotos bearbeitet · Download-Galerie', price: '2.400€' },
      { title: 'Gold', description: '8 Stunden · 400 Fotos · Galerie + USB-Stick + 3 Prints', price: '3.200€' },
      { title: 'Platin', description: 'Ganztag + Vortag-Shooting · 600 Fotos · Galerie + Fotobuch', price: '4.800€' },
    ]}},
    { pageId: preise.id, name: 'Portraits', type: 'features', order: 2, content: { heading: 'Portraits & Business', items: [
      { title: 'Mini-Shooting', description: '30 Min. · 15 Fotos bearbeitet', price: '350€' },
      { title: 'Business-Paket', description: '90 Min. · 40 Fotos · LinkedIn + Website Lizenz', price: '590€' },
      { title: 'Personal Branding', description: 'Halbtag · 100 Fotos · Vollständige Nutzungsrechte', price: '1.200€' },
    ]}},
  ]);

  console.log('✅ website_pro — Fotografin Laura Becker, Berlin');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
