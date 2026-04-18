// 📂 PFAD: backend/scripts/templates/business_agency.ts
// Paket: business_agency — Digital Agentur NOVA, Hamburg
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Digital Agentur (business_agency)';

async function main() {
  const force = process.argv.includes('--force');
  const [ex] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (ex && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (ex) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, ex.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Digital-Agentur mit Portfolio, Leistungen, Blog und Kontakt',
    category: 'business_agency', thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'business_agency', niche: 'agentur', colors: { primary: '#6d28d9', secondary: '#5b21b6', accent: '#ede9fe', background: '#0a0a0a', text: '#ffffff' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'NOVA — Die Digital-Agentur die liefert', subheading: 'Strategie, Design, Entwicklung und Performance Marketing aus einer Hand. Für Startups und Mittelständler die wachsen wollen.', buttonText: 'Projekt anfragen', buttonLink: '#kontakt', secondaryButtonText: 'Arbeiten ansehen', secondaryButtonLink: '/portfolio', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=700&fit=crop', badge: '🚀 150+ erfolgreiche Projekte · Ø 340% ROI' }, styling: { backgroundColor: '#0a0a0a', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Stats', type: 'stats', order: 1, content: { items: [{ value: '150+', label: 'Projekte', description: 'In 7 Jahren' }, { value: '12', label: 'Team-Mitglieder', description: 'Aus 6 Ländern' }, { value: '340%', label: 'Ø ROI', description: 'Für unsere Kunden' }, { value: '4.9★', label: 'Bewertung', description: 'Google & Clutch' }] }, styling: { backgroundColor: '#6d28d9', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Leistungen', type: 'features', order: 2, content: { heading: 'Was wir tun', items: [
      { icon: '🎨', title: 'Brand & Design', description: 'Logo, CI, Websites und App-Designs die konvertieren — nicht nur gut aussehen.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop' },
      { icon: '💻', title: 'Web-Entwicklung', description: 'React, Next.js, headless CMS. Performance-optimiert, barrierefrei, skalierbar.', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop' },
      { icon: '📈', title: 'Performance Marketing', description: 'Google Ads, Meta Ads, SEO. Messbare Ergebnisse, transparentes Reporting.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
      { icon: '🤖', title: 'KI-Integration', description: 'ChatGPT-Integrationen, Automatisierungen und KI-Workflows für dein Business.', imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=250&fit=crop' },
    ]}},
    { pageId: home.id, name: 'Kunden', type: 'testimonials', order: 3, content: { heading: 'Was Kunden sagen', items: [
      { title: 'Jonas Braun, CEO Flowline SaaS', subtitle: '⭐⭐⭐⭐⭐', description: 'NOVA hat unsere Website und das gesamte Marketing in 8 Wochen transformiert. MQLs +280%, CAC -40%. Das sind keine Marketingzahlen — das ist unser tatsächliches CRM.' },
      { title: 'Lisa Müller, CMO RetailTech GmbH', subtitle: '⭐⭐⭐⭐⭐', description: 'Drei andere Agenturen haben versprochen und nicht geliefert. NOVA hat in 12 Wochen unsere Conversion Rate von 1,2% auf 4,1% gebracht. Ich empfehle sie jedem.' },
    ]} },
    { pageId: home.id, name: 'Kontakt', type: 'contact', order: 4, content: { heading: 'Projekt anfragen', subheading: 'Beschreib uns dein Projekt — wir melden uns in 24h mit einem ersten Konzept.', buttonText: 'Anfrage senden', details: { phone: '+49 40 987123', email: 'hallo@nova-digital.de', address: 'Speicherstadt 12, 20457 Hamburg', hours: 'Mo–Fr 9–18 Uhr' } }, styling: { backgroundColor: '#6d28d9', textColor: '#ffffff' } },
  ]);

  console.log('✅ business_agency — Digital Agentur NOVA, Hamburg');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
