// 📂 PFAD: backend/scripts/templates/website_standard.ts
// Paket: website_standard — Physiotherapie Praxis Dr. Klein, Düsseldorf
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/website_standard.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Physiotherapie (website_standard)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME,
    description: 'Professionelle Physiotherapie-Praxis mit Leistungsübersicht, Team und Kontakt',
    category: 'website_standard',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'website_standard', niche: 'physiotherapie', colors: { primary: '#0077b6', secondary: '#005f8c', accent: '#90e0ef', background: '#ffffff', text: '#1a1a1a' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Physiotherapie Dr. Klein — Bewegt. Gesund. Stark.', subheading: 'Moderne Physiotherapie in Düsseldorf-Pempelfort. Kassenärztlich zugelassen. GKV + PKV + Selbstzahler.', buttonText: 'Termin vereinbaren', buttonLink: '#kontakt', secondaryButtonText: 'Leistungen', secondaryButtonLink: '/leistungen', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=600&fit=crop', badge: '✅ Kassenärztlich zugelassen · Ø Wartezeit 48h' }, styling: { backgroundColor: '#0077b6', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Stats', type: 'stats', order: 1, content: { items: [{ value: '15+', label: 'Jahre Erfahrung', description: 'Seit 2009' }, { value: '3.500+', label: 'Patienten/Jahr', description: 'In Düsseldorf' }, { value: '4', label: 'Therapeuten', description: 'Alle mit Fachzusatz' }, { value: '4.9★', label: 'Google', description: 'Aus 310+ Bewertungen' }] }, styling: { backgroundColor: '#caf0f8', textColor: '#0077b6' } },
    {
      pageId: home.id, name: 'Leistungen', type: 'features', order: 2,
      content: {
        heading: 'Unsere Therapieangebote',
        items: [
          { icon: '🦴', title: 'Manuelle Therapie', description: 'Gelenkmobilisation nach Maitland/Kaltenborn. Wirksam bei Rücken-, Nacken- und Gelenkbeschwerden.', imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=250&fit=crop' },
          { icon: '🏃', title: 'Sportphysiotherapie', description: 'Rehabilitation nach OP und Sportverletzungen. Für Amateure und Profisportler.', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop' },
          { icon: '🧠', title: 'Neurologische Reha', description: 'Bobath-zertifiziert. Behandlung nach Schlaganfall, Parkinson, MS.', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop' },
          { icon: '🤱', title: 'Beckenbodentherapie', description: 'Spezialisiert bei Inkontinenz, nach Geburten und Beckenbodendysfunktionen.', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=250&fit=crop' },
        ],
      },
    },
    {
      pageId: home.id, name: 'Bewertungen', type: 'testimonials', order: 3,
      content: {
        heading: 'Patientenstimmen',
        items: [
          { title: 'Andrea F., 52', subtitle: '⭐⭐⭐⭐⭐', description: 'Nach meiner Hüft-OP hat Dr. Klein und ihr Team das Unmögliche möglich gemacht. In 3 Monaten wieder voll mobil. Professionell und menschlich zugleich.' },
          { title: 'Marcus B., Hobbyläufer', subtitle: '⭐⭐⭐⭐⭐', description: 'Knieschmerzen seit Jahren. Drei andere Physios ohne Erfolg. Hier wurde die Ursache gefunden — nach 6 Wochen wieder schmerzfrei.' },
        ],
      },
      styling: { backgroundColor: '#f0f9ff', textColor: '#1a1a1a' },
    },
    { pageId: home.id, name: 'Kontakt', type: 'contact', order: 4, content: { heading: 'Termin vereinbaren', subheading: 'Wir melden uns innerhalb von 24h.', buttonText: 'Nachricht senden', details: { phone: '+49 211 334455', email: 'praxis@physio-klein-duesseldorf.de', address: 'Grafenberger Allee 120, 40237 Düsseldorf', hours: 'Mo/Mi/Fr 8–18 Uhr · Di/Do 8–20 Uhr · Sa 9–13 Uhr' } }, styling: { backgroundColor: '#0077b6', textColor: '#ffffff' } },
  ]);

  const [leistungen] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Leistungen', slug: '/leistungen', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: leistungen.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Alle Therapieangebote', subheading: 'Kassenleistungen und Selbstzahler', minimal: true }, styling: { backgroundColor: '#0077b6', textColor: '#ffffff' } },
    { pageId: leistungen.id, name: 'GKV', type: 'features', order: 1, content: { heading: 'Kassenleistungen', items: [{ title: 'Krankengymnastik', description: 'Aktive Übungstherapie auf Rezept', price: 'GKV/PKV' }, { title: 'Manuelle Therapie', description: 'Mit Fachzusatz · auf Rezept', price: 'GKV/PKV' }, { title: 'KG-Gerät (MTT)', description: 'Gerätegestützte Therapie §43 SGB V', price: 'GKV/PKV' }] } },
    { pageId: leistungen.id, name: 'Selbstzahler', type: 'features', order: 2, content: { heading: 'Selbstzahlerleistungen', items: [{ title: 'Sportmassage', description: '30 Min. nach dem Training', price: '55€' }, { title: 'Präventionskurs Rücken', description: '10 Einheiten · §20 SGB V', price: '120€' }, { title: 'Körperanalyse', description: 'Haltung, Bewegung, Bericht', price: '85€' }] } },
  ]);

  const [ueber] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2 }).returning();
  await db.insert(wbGlobalTemplateSections).values({ pageId: ueber.id, name: 'Team', type: 'about', order: 0, content: { heading: 'Dr. Sabine Klein & Team', text: '<p>Dr. Sabine Klein, Physiotherapeutin und promovierte Sportwissenschaftlerin, gründete die Praxis 2009. Heute arbeiten 4 spezialisierte Therapeutinnen mit Fachzusatzqualifikationen.</p>', imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop', highlights: ['Promovierte Leiterin', '4 Fachtherapeuten', 'VPT-Mitglied', 'Alle Kassen'] } });

  console.log('✅ website_standard — Physiotherapie Dr. Klein, Düsseldorf');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
