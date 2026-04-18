// 📂 PFAD: backend/scripts/templates/business_starter.ts
// Paket: business_starter — Friseur Salon Bella, Frankfurt
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Friseursalon (business_starter)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Friseursalon mit Online-Terminbuchung, Preisliste und Team',
    category: 'business_starter', thumbnailUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'business_starter', niche: 'friseur', colors: { primary: '#be185d', secondary: '#9d174d', accent: '#fce7f3', background: '#fffbfe', text: '#1a1a1a' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Salon Bella — Ihr Friseursalon in Frankfurt-Sachsenhausen', subheading: 'Haarschnitte, Colorationen, Hochzeitsstyling und Pflege. Online Termin buchen — in 60 Sekunden.', buttonText: 'Termin online buchen', buttonLink: '#termin', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1400&h=600&fit=crop', badge: '⭐ 4,9 Google · Über 500 Bewertungen' }, styling: { backgroundColor: '#be185d', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Leistungen', type: 'features', order: 1, content: { heading: 'Unsere Leistungen', items: [
      { icon: '✂️', title: 'Damenschnitt', description: 'Waschen, Schneiden, Föhnen. Mit Beratung und Stilempfehlung.', price: 'ab 45€', imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop' },
      { icon: '🎨', title: 'Coloration', description: 'Ansatzfarbe, Foliensträhnen, Balayage, Ombre. Alle Techniken.', price: 'ab 65€', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop' },
      { icon: '💍', title: 'Hochzeitsstyling', description: 'Braut-Styling mit Testtermin. Haare + Make-up oder nur Haare.', price: 'ab 150€', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop' },
      { icon: '💆', title: 'Haarkur & Pflege', description: 'Olaplex, Kerabehandlung und Tiefenpflege für geschädigtes Haar.', price: 'ab 35€', imageUrl: 'https://images.unsplash.com/photo-1527799820374-87036dcd41a?w=400&h=250&fit=crop' },
    ]}},
    { pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 2, content: { heading: 'Was unsere Kundinnen sagen', items: [
      { title: 'Laura M., Sachsenhausen', subtitle: '⭐⭐⭐⭐⭐', description: 'Seit 3 Jahren meine Stammfriseurin. Isabella versteht sofort was man will und das Ergebnis ist immer besser als vorgestellt. Die Online-Buchung ist praktisch!' },
      { title: 'Melina K., Braut 2024', subtitle: '⭐⭐⭐⭐⭐', description: 'Mein Hochsteck-Frisur war perfekt und hat den ganzen Tag gehalten. Der Testtermin hat sich absolut gelohnt. Ich fühlte mich wie eine Prinzessin.' },
    ]} },
    { pageId: home.id, name: 'Termin & Kontakt', type: 'contact', order: 3, content: { heading: 'Termin buchen', subheading: 'Online oder telefonisch — wir sind für euch da.', buttonText: 'Jetzt Termin buchen', details: { phone: '+49 69 776655', email: 'hallo@salon-bella-frankfurt.de', address: 'Schweizer Str. 12, 60594 Frankfurt-Sachsenhausen', hours: 'Di–Fr 9–18 Uhr · Sa 9–15 Uhr · Mo geschlossen' } }, styling: { backgroundColor: '#be185d', textColor: '#ffffff' } },
  ]);

  const [preise] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Preisliste', slug: '/preisliste', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: preise.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Unsere Preisliste', subheading: 'Alle Preise inkl. MwSt.', minimal: true }, styling: { backgroundColor: '#be185d', textColor: '#ffffff' } },
    { pageId: preise.id, name: 'Damen', type: 'features', order: 1, content: { heading: 'Damen', items: [
      { title: 'Waschen, Schneiden, Föhnen', description: 'Inkl. Beratung und Styling', price: '45–75€' },
      { title: 'Ansatzfarbe', description: 'Bis 3cm Ansatz', price: '65€' },
      { title: 'Foliensträhnen', description: 'Komplett', price: 'ab 95€' },
      { title: 'Balayage', description: 'Handbemalt, individuell', price: 'ab 120€' },
      { title: 'Hochsteckfrisur', description: 'Mit Testtermin', price: '85€ + 45€ Test' },
    ]}},
    { pageId: preise.id, name: 'Herren', type: 'features', order: 2, content: { heading: 'Herren', items: [
      { title: 'Herrenschnitt', description: 'Waschen, Schneiden, Föhnen', price: '35€' },
      { title: 'Bartpflege', description: 'Trimmen und formen', price: '20€' },
      { title: 'Schnitt + Bart', description: 'Kombi-Angebot', price: '50€' },
    ]}},
  ]);

  console.log('✅ business_starter — Salon Bella, Frankfurt');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
