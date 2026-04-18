// 📂 PFAD: backend/scripts/templates/local_premium.ts
// Paket: local_premium — Biomarkt "Grüne Erde", Stuttgart-Mitte
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/local_premium.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Biomarkt (local_premium)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME,
    description: 'Regionaler Biomarkt mit Click & Collect, Abo-Kisten und Lieferservice',
    category: 'local_premium',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'local_premium', niche: 'biomarkt', colors: { primary: '#2d6a4f', secondary: '#1b4332', accent: '#d8f3dc', background: '#fafff9', text: '#1a2e1a' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();

  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: home.id, name: 'Hero', type: 'hero', order: 0,
      content: {
        heading: 'Grüne Erde — Ihr regionaler Biomarkt in Stuttgart',
        subheading: '100% Bio, 80% regional, 0% Kompromisse. Bestell deine Wochenkiste online oder komm direkt vorbei — wir bringen dir die Natur in die Stadt.',
        buttonText: 'Wochenkiste bestellen', buttonLink: '/kisten',
        secondaryButtonText: 'Sortiment entdecken', secondaryButtonLink: '/produkte',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&h=600&fit=crop',
        badge: '🌿 100% Bio · 30+ Partnerbetriebe aus BW',
      },
      styling: { backgroundColor: '#2d6a4f', textColor: '#d8f3dc' },
    },
    {
      pageId: home.id, name: 'Zahlen', type: 'stats', order: 1,
      content: {
        items: [
          { value: '30+', label: 'Partnerhöfe', description: 'Alle aus Baden-Württemberg' },
          { value: '2.500+', label: 'Produkte', description: 'Frisch, getrocknet, tiefgekühlt' },
          { value: '15km', label: 'Max. Herkunft', description: 'Für Gemüse & Obst saisonal' },
          { value: '500+', label: 'Abo-Kisten/Wo', description: 'Werden wöchentlich geliefert' },
        ],
      },
      styling: { backgroundColor: '#1b4332', textColor: '#d8f3dc' },
    },
    {
      pageId: home.id, name: 'Kisten', type: 'features', order: 2,
      content: {
        heading: 'Unsere Abo-Kisten',
        subtitle: 'Wöchentlich, flexibel kündbar, immer saisonal',
        items: [
          { icon: '🥦', title: 'Gemüsekiste Klein', description: '6–8 Gemüsesorten saisonal von Stuttgarter Partnerbetrieben. Für 1–2 Personen.', price: '18,90€/Woche', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
          { icon: '🥕', title: 'Gemüsekiste Groß', description: '10–12 Gemüsesorten + Salate und Kräuter. Für Familien oder bewusste Esser.', price: '28,90€/Woche', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop' },
          { icon: '🍎', title: 'Obst & Gemüse Kombi', description: 'Gemischte Kiste mit 6 Gemüse- und 4 Obstsorten. Perfekt für die ganze Familie.', price: '32,90€/Woche', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop' },
        ],
        ctaText: 'Kiste konfigurieren & bestellen →', ctaLink: '/kisten',
      },
    },
    {
      pageId: home.id, name: 'Partnerhöfe', type: 'gallery', order: 3,
      content: {
        heading: 'Unsere Partnerhöfe',
        images: [
          { url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', alt: 'Hof Berger', title: 'Hof Berger, Leinfelden — Gemüse' },
          { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop', alt: 'Obstgut Maier', title: 'Obstgut Maier, Esslingen' },
          { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', alt: 'Demeter Hof', title: 'Demeter Hof Wagner, Backnang' },
          { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop', alt: 'Marktstand', title: 'Unser Marktstand' },
        ],
      },
    },
    {
      pageId: home.id, name: 'Newsletter', type: 'contact', order: 4,
      content: {
        heading: 'Was wächst diese Woche?',
        subheading: 'Kistenpläne, saisonale Rezepte und Angebote direkt in dein Postfach.',
        buttonText: 'Newsletter abonnieren', isNewsletter: true,
      },
      styling: { backgroundColor: '#d8f3dc', textColor: '#1b4332' },
    },
    {
      pageId: home.id, name: 'Kontakt', type: 'contact', order: 5,
      content: {
        heading: 'Besuche uns',
        buttonText: 'Kiste bestellen',
        details: {
          phone: '+49 711 445566', email: 'hallo@gruene-erde-stuttgart.de',
          address: 'Tübinger Str. 55, 70178 Stuttgart-Mitte',
          hours: 'Mo–Fr 8:00–19:00 · Sa 8:00–17:00',
        },
      },
      styling: { backgroundColor: '#2d6a4f', textColor: '#d8f3dc' },
    },
  ]);

  console.log('✅ local_premium — Biomarkt Grüne Erde, Stuttgart');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
