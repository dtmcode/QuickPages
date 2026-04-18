// 📂 PFAD: backend/scripts/templates/business_professional.ts
// Paket: business_professional — Zahnarztpraxis Dr. Weber, München
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Zahnarztpraxis (business_professional)';

async function main() {
  const force = process.argv.includes('--force');
  const [ex] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (ex && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (ex) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, ex.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Zahnarztpraxis mit Leistungsübersicht, Team, Blog und Online-Terminbuchung',
    category: 'business_professional', thumbnailUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'business_professional', niche: 'zahnarzt', colors: { primary: '#0284c7', secondary: '#0369a1', accent: '#e0f2fe', background: '#ffffff', text: '#0c1b2d' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Zahnarztpraxis Dr. Weber — Ihr Lächeln in guten Händen', subheading: 'Moderne Zahnmedizin in München-Schwabing. Angstpatienten willkommen. Online-Termin in 60 Sekunden.', buttonText: 'Termin online buchen', buttonLink: '#termin', secondaryButtonText: 'Leistungen', secondaryButtonLink: '/leistungen', imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1400&h=600&fit=crop', badge: '😊 Zahnarzt des Jahres München 2023 · Focus Gesundheit' }, styling: { backgroundColor: '#0284c7', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Highlights', type: 'stats', order: 1, content: { items: [{ value: '20+', label: 'Jahre Erfahrung', description: 'Seit 2004 in Schwabing' }, { value: '8.000+', label: 'Patienten', description: 'Aktive Patienten' }, { value: '4.9★', label: 'jameda', description: 'Aus 240+ Bewertungen' }, { value: '0€', label: 'Angst', description: 'Sanfte Behandlung garantiert' }] }, styling: { backgroundColor: '#e0f2fe', textColor: '#0284c7' } },
    { pageId: home.id, name: 'Leistungen', type: 'features', order: 2, content: { heading: 'Unsere Leistungen', items: [
      { icon: '🦷', title: 'Prophylaxe & Reinigung', description: 'Professionelle Zahnreinigung und individuelle Prophylaxeberatung.', price: 'ab 80€ (GKV Zuschuss möglich)', imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=250&fit=crop' },
      { icon: '✨', title: 'Bleaching & Ästhetik', description: 'Professionelles Zahnbleaching im Stuhl oder als Home-Kit. Ergebnis: 4–8 Nuancen heller.', price: 'ab 299€', imageUrl: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=400&h=250&fit=crop' },
      { icon: '🔧', title: 'Implantate', description: 'Titan- und Keramikimplantate. 10 Jahre Garantie auf alle Implantate.', price: 'ab 1.200€ pro Implantat', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop' },
      { icon: '😰', title: 'Angstpatienten', description: 'Lachgas-Sedierung, Hypnose und besonders einfühlsame Behandlung für Angstpatienten.', price: 'Individuelle Beratung', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop' },
    ]}},
    { pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 3, content: { heading: 'Patientenstimmen', source: 'jameda · Ø 4,9 von 5', items: [
      { title: 'Stefanie H., 38', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich hatte jahrelange Zahnarztangst. Dr. Weber hat mich so ruhig und einfühlsam behandelt, dass ich heute keine Angst mehr habe. Das Bleaching-Ergebnis ist fantastisch.' },
      { title: 'Michael B., 54', subtitle: '⭐⭐⭐⭐⭐', description: '3 Implantate in 6 Monaten. Die Kommunikation war immer klar, Wartezeiten minimal, Ergebnis perfekt. Endlich wieder richtig beißen können.' },
    ]} },
    { pageId: home.id, name: 'Kontakt', type: 'contact', order: 4, content: { heading: 'Termin vereinbaren', subheading: 'Online buchen oder anrufen. Wir antworten innerhalb von 4 Stunden.', buttonText: 'Termin online buchen', details: { phone: '+49 89 445566', email: 'praxis@zahnarzt-weber-muenchen.de', address: 'Leopoldstr. 88, 80802 München-Schwabing', hours: 'Mo–Fr 8–18 Uhr · Do 8–20 Uhr · Sa 9–13 Uhr (auf Anfrage)' } }, styling: { backgroundColor: '#0284c7', textColor: '#ffffff' } },
  ]);

  const [leistungen] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Leistungen', slug: '/leistungen', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values({ pageId: leistungen.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Unsere Leistungen', subheading: 'GKV, PKV und Selbstzahlerleistungen', minimal: true }, styling: { backgroundColor: '#0284c7', textColor: '#ffffff' } });

  const [team] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Team', slug: '/team', isHomepage: false, order: 2 }).returning();
  await db.insert(wbGlobalTemplateSections).values({ pageId: team.id, name: 'Team', type: 'about', order: 0, content: { heading: 'Dr. Klaus Weber & Team', text: '<p>Dr. Klaus Weber, Zahnarzt und Oralchirurg, hat nach seinem Studium in Wien und einer Assistenzzeit in Zürich 2004 seine eigene Praxis in München eröffnet. Heute arbeiten 3 Zahnärztinnen und 6 Prophylaxeassistentinnen im Team.</p><p>Schwerpunkte: Implantologie, ästhetische Zahnheilkunde und Behandlung von Angstpatienten.</p>', imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=500&fit=crop', highlights: ['Oralchirurg · Implantologe', 'Zahnarzt des Jahres 2023', 'Lachgas-Sedierung', 'Angstpatienten-Sprechstunde'] } });

  console.log('✅ business_professional — Zahnarzt Dr. Weber, München');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
