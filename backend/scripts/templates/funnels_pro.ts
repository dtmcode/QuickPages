// 📂 PFAD: backend/scripts/templates/funnels_pro.ts
// Paket: funnels_pro — Sales Funnel "Finanzielle Freiheit Akademie"
// Run: npx ts-node -r tsconfig-paths/register scripts/templates/funnels_pro.ts [--force]

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Sales Funnel Kurs (funnels_pro)';

async function main() {
  const force = process.argv.includes('--force');
  const [existing] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (existing && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (existing) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, existing.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME,
    description: 'Online-Kurs Sales Funnel mit Webinar-Opt-in, Sales Page und Upsell',
    category: 'funnels_pro',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'funnels_pro', niche: 'online-kurs', colors: { primary: '#7209b7', secondary: '#560bad', accent: '#f72585', background: '#ffffff', text: '#1a1a1a' } },
  }).returning();

  // Seite 1: Webinar Opt-in
  const [optin] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Webinar Opt-in', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: optin.id, name: 'Hero', type: 'hero', order: 0,
      content: {
        heading: 'KOSTENLOSES WEBINAR: In 90 Minuten zur finanziellen Freiheit',
        subheading: 'Erfahre wie 847 Menschen in den letzten 12 Monaten ihren Job gekündigt haben — mit einem System das du in 30 Tagen aufbauen kannst.',
        buttonText: 'Jetzt kostenlos anmelden', buttonLink: '#anmeldung',
        imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1400&h=600&fit=crop',
        badge: '🔴 LIVE · Nächster Termin: Dienstag, 19:00 Uhr',
        countdown: true,
      },
      styling: { backgroundColor: '#7209b7', textColor: '#ffffff' },
    },
    {
      pageId: optin.id, name: 'Was du lernst', type: 'features', order: 1,
      content: {
        heading: 'In diesem kostenlosen Webinar lernst du:',
        items: [
          { icon: '💡', title: 'Das 3-Säulen-System', description: 'Wie du passive Einkommensquellen aufbaust ohne Startkapital oder technisches Wissen.' },
          { icon: '⚡', title: 'Der 30-Tage-Fahrplan', description: 'Der genaue Schritt-für-Schritt Plan von 0€ zu deinen ersten 1.000€/Monat.' },
          { icon: '🎯', title: 'Nischen-Analyse live', description: 'Wir analysieren LIVE 3 profitable Nischen für 2024 — und du siehst wie ich sie identifiziere.' },
          { icon: '❓', title: 'Live Q&A', description: '30 Minuten offene Fragerunde — stelle deine Fragen direkt dem Coach.' },
        ],
      },
    },
    {
      pageId: optin.id, name: 'Anmeldung', type: 'contact', order: 2,
      content: {
        heading: 'Sichere dir deinen kostenlosen Platz',
        subheading: 'Nur 200 Plätze verfügbar. Melde dich jetzt an.',
        buttonText: 'Jetzt kostenlos anmelden', isNewsletter: true,
        urgency: 'Noch 47 Plätze verfügbar',
      },
      styling: { backgroundColor: '#f72585', textColor: '#ffffff' },
    },
    {
      pageId: optin.id, name: 'Über den Coach', type: 'about', order: 3,
      content: {
        heading: 'Dein Coach: Markus Berger',
        text: `<p>Markus Berger war 8 Jahre Unternehmensberater bei McKinsey, bevor er 2019 kündigte und sein erstes Online-Business aufbaute. Heute verdient er 25.000€/Monat passiv — ohne Büro, ohne Chef, ohne feste Arbeitszeiten.</p>
<p>In seiner Akademie hat er bereits <strong>847 Studenten</strong> dabei geholfen, ihre eigene finanzielle Freiheit zu erreichen.</p>`,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        highlights: ['847 erfolgreiche Studenten', '25.000€/Monat passives Einkommen', 'Ex-McKinsey Berater', '4.9★ Bewertung'],
      },
    },
    {
      pageId: optin.id, name: 'Social Proof', type: 'testimonials', order: 4,
      content: {
        heading: 'Das sagen unsere Studenten',
        items: [
          { title: 'Lisa T., 34, Hannover', subtitle: '⭐⭐⭐⭐⭐', description: 'Nach 4 Monaten verdiene ich 2.300€ nebenbei. Nach 8 Monaten habe ich meinen Job in Teilzeit reduziert. Markus System funktioniert wirklich.', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
          { title: 'Stefan K., 41, München', subtitle: '⭐⭐⭐⭐⭐', description: 'Ich war skeptisch — "noch ein Guru". Aber das 3-Säulen-System ist konkret, umsetzbar und hat mir in 6 Monaten 18.000€ Zusatzeinkommen gebracht.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
        ],
      },
    },
  ]);

  // Seite 2: Sales Page
  const [sales] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Sales Page', slug: '/kurs', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    {
      pageId: sales.id, name: 'Sales Hero', type: 'hero', order: 0,
      content: {
        heading: 'Finanzielle Freiheit Akademie — Das komplette System',
        subheading: 'Alles was du brauchst um in 12 Monaten dein erstes passives Einkommen aufzubauen. 12 Module, 80+ Lektionen, lebenslanger Zugang.',
        buttonText: 'Jetzt für 997€ kaufen', buttonLink: '#kaufen',
        badge: '🔥 Nur noch 3 Plätze zum Einführungspreis',
      },
      styling: { backgroundColor: '#7209b7', textColor: '#ffffff' },
    },
    {
      pageId: sales.id, name: 'Was enthalten', type: 'features', order: 1,
      content: {
        heading: 'Was du bekommst',
        items: [
          { icon: '📚', title: '12 Module · 80+ Lektionen', description: 'Von Nischenfindung bis zu ersten 10.000€/Monat. Alles strukturiert und umsetzbar.', price: 'Wert: 2.997€' },
          { icon: '📞', title: '4x Gruppen-Coaching', description: 'Monatliche Live-Calls mit Markus. Fragen stellen, Feedback bekommen, Probleme lösen.', price: 'Wert: 1.200€' },
          { icon: '👥', title: 'Private Community', description: 'Zugang zur exklusiven Facebook-Gruppe mit 800+ aktiven Studenten.', price: 'Wert: 497€' },
          { icon: '♾️', title: 'Lebenslanger Zugang', description: 'Alle Updates inklusive. Kurs wächst mit dir — für immer.', price: 'Wert: unbezahlbar' },
        ],
        ctaText: 'Jetzt kaufen — nur 997€', ctaLink: '#kaufen',
      },
    },
  ]);

  console.log('✅ funnels_pro — Online Kurs Sales Funnel');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
