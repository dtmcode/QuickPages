// 📂 PFAD: backend/scripts/templates/local_starter.ts
// Paket: local_starter — Bäckerei Müller, Köln-Nippes
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/local_starter.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Bäckerei (local_starter)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME,
    description: 'Handwerksbäckerei mit Click & Collect — online vorbestellen, frisch abholen',
    category: 'local_starter',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'local_starter', niche: 'baeckerei', colors: { primary: '#8b5e3c', secondary: '#6b4423', accent: '#fef3e2', background: '#fffef9', text: '#2d1b0e' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: home.id, name: 'Hero', type: 'hero', order: 0,
      content: {
        heading: 'Bäckerei Müller — Handwerk seit 1962',
        subheading: 'Sauerteigbrote, Croissants und Konditorei aus Köln-Nippes. Jetzt online vorbestellen und frisch abholen — kein Warten, keine leeren Regale.',
        buttonText: 'Jetzt vorbestellen', buttonLink: '/bestellen',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&h=600&fit=crop',
        badge: '🥖 Täglich frisch gebacken ab 6:00 Uhr',
      },
      styling: { backgroundColor: '#8b5e3c', textColor: '#fef3e2' },
    },
    {
      pageId: home.id, name: 'Vorteile Click & Collect', type: 'features', order: 1,
      content: {
        heading: 'So einfach geht\'s',
        items: [
          { icon: '📱', title: '1. Online bestellen', description: 'Wähle deine Lieblingsbrote und Backwaren bis 20:00 Uhr für den nächsten Morgen.' },
          { icon: '⏰', title: '2. Abholzeit wählen', description: 'Wähle deinen Wunschtermin zwischen 6:00 und 13:00 Uhr. Wir bereiten alles vor.' },
          { icon: '🛍️', title: '3. Frisch abholen', description: 'Deine Bestellung liegt fertig verpackt bereit — du gehst direkt an die Kasse.' },
        ],
      },
      styling: { backgroundColor: '#fef3e2', textColor: '#2d1b0e' },
    },
    {
      pageId: home.id, name: 'Produkte', type: 'features', order: 2,
      content: {
        heading: 'Unsere Backwaren',
        subtitle: 'Täglich frisch — aus Zutaten von regionalen Partnerbetrieben',
        items: [
          { icon: '🍞', title: 'Kölner Sauerteigbrot', description: 'Unser Signatur-Brot: 36h Sauerteig, Roggenvollkornmehl, knusprige Kruste', price: '4,90€/Laib', imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop' },
          { icon: '🥐', title: 'Butter-Croissant', description: 'Klassisches Croissant mit 64 Teigschichten und AOC-Normand-Butter aus der Normandie', price: '2,20€', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
          { icon: '🎂', title: 'Sonntagstorte', description: 'Freitags und samstags: saisonale Torten auf Vorbestellung — Erdbeere, Schwarzwälder, Käsesahne', price: 'ab 28€', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop' },
          { icon: '🥨', title: 'Frühstückspaket', description: 'Assortiment für 2–4 Personen: 4 Brötchen, 2 Croissants, 1 Brot nach Wahl, Butter', price: '12,90€', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop' },
        ],
        ctaText: 'Alle Produkte & Vorbestellung →', ctaLink: '/bestellen',
      },
    },
    {
      pageId: home.id, name: 'Über uns', type: 'about', order: 3,
      content: {
        heading: 'Familie Müller — Drei Generationen Bäckerhandwerk',
        text: `<p>Was 1962 mit Opa Heinrich Müller in einer kleinen Backstube in Nippes begann, führt heute seine Enkelin Katharina Müller mit dem gleichen Herzblut weiter. Keine Fertigmischungen, keine Ketten-Logik — nur echtes Handwerk.</p>
<p>Unser Sauerteig "Hermann" ist seit 1968 am Leben und wird täglich gefüttert. Unsere Mehle kommen von der Mühle Schermer in der Eifel, unsere Eier vom Hof Berger in Hürth.</p>
<p>Seit 2023 bieten wir Click & Collect an, damit auch Berufstätige in den Genuss frischer Backwaren kommen — ohne Schlange, ohne leere Regale.</p>`,
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
        highlights: ['Sauerteig "Hermann" seit 1968', 'Regionale Zutaten aus NRW', 'Keine Fertigmischungen', 'Click & Collect ab 6:00 Uhr'],
      },
    },
    {
      pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 5,
      content: {
        heading: 'Was Stammkunden sagen',
        items: [
          { title: 'Petra H., Nippes', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich bestelle jeden Freitag das Frühstückspaket für das Wochenende. Seitdem es Click & Collect gibt, spare ich 20 Minuten Wartezeit. Das Sauerteigbrot ist einfach unersetzlich.', date: 'April 2024' },
          { title: 'Familie Schäfer, Köln', subtitle: '⭐⭐⭐⭐⭐', description: 'Die Sonntagstorte für Mutters 70. Geburtstag war ein Traum. Katharina hat sogar einen besonderen Wunsch erfüllt und Erdbeeren mit Rhabarber kombiniert. Bäckerei des Herzens!', date: 'März 2024' },
        ],
      },
      styling: { backgroundColor: '#fef3e2', textColor: '#2d1b0e' },
    },
    {
      pageId: home.id, name: 'Info', type: 'contact', order: 6,
      content: {
        heading: 'Besuche uns',
        subheading: 'Oder bestell bequem online und hole deinen Abholtermin.',
        buttonText: 'Jetzt vorbestellen',
        details: {
          phone: '+49 221 654321', email: 'hallo@baeckerei-mueller-koeln.de',
          address: 'Neusser Str. 88, 50733 Köln-Nippes',
          hours: 'Mo–Fr 6:00–18:00 · Sa 6:00–14:00 · So 7:00–12:00',
        },
      },
      styling: { backgroundColor: '#8b5e3c', textColor: '#fef3e2' },
    },
  ]);

  console.log('✅ local_starter — Bäckerei Müller, Köln');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
