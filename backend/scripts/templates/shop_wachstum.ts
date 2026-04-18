// 📂 PFAD: backend/scripts/templates/shop_wachstum.ts
// Paket: shop_wachstum — Streetwear Brand "MVRK", Berlin
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Streetwear Shop (shop_wachstum)';

async function main() {
  const force = process.argv.includes('--force');
  const [ex] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (ex && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (ex) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, ex.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Streetwear Brand mit Drop-System, Blog und Newsletter-Community',
    category: 'shop_wachstum', thumbnailUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'shop_wachstum', niche: 'streetwear', colors: { primary: '#111111', secondary: '#222222', accent: '#f5f5f5', background: '#111111', text: '#ffffff' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'MVRK — Made in Berlin', subheading: 'Streetwear ohne Kompromisse. Limited Drops, Organic Cotton, Handmade Details. Für die die wissen was sie wollen.', buttonText: 'Shop Now', buttonLink: '/shop', imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1400&h=700&fit=crop', badge: '🔥 DROP #23 — Limited 200 Stück' }, styling: { backgroundColor: '#111111', textColor: '#ffffff' } },
    { pageId: home.id, name: 'Produkte', type: 'features', order: 1, content: { heading: 'Aktueller Drop', subtitle: 'DROP #23 — "URBAN DECAY" KOLLEKTION', items: [
      { title: 'MVRK Hoodie "Urban"', description: 'Heavy-Weight 380g/m² Organic Cotton · Oversized Fit · Washed Black', price: '89€', badge: '🔥 Nur noch 34 Stück', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732d2?w=400&h=400&fit=crop' },
      { title: 'MVRK Tee "Decay"', description: '200g/m² Organic Cotton · Boxy Fit · Distressed Print · 5 Farben', price: '49€', badge: '⭐ Bestseller', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop' },
      { title: 'MVRK Cargo Pants', description: '100% Organic Cotton Canvas · Relaxed Fit · 8 Pockets', price: '119€', badge: '🆕 Neu', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop' },
    ], ctaText: 'Alle Produkte →', ctaLink: '/shop' }},
    { pageId: home.id, name: 'Story', type: 'about', order: 2, content: { heading: 'Warum MVRK?', text: '<p>2020 gegründet von zwei Berliner Grafikdesignern die von Fast Fashion frustriert waren. Kein Massenprodukt, kein Greenwashing. Echte Limited Drops in echten Stückzahlen.</p><p>Jedes Stück wird in Portugal unter fairen Bedingungen gefertigt. 100% Organic Cotton, GOTS-zertifiziert. Wir drucken nur auf Bestellung — kein Overstock, kein Abfall.</p>', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop', highlights: ['100% Organic Cotton', 'GOTS-zertifiziert', 'Hergestellt in Portugal', 'Limited Drops'] }},
    { pageId: home.id, name: 'Newsletter', type: 'contact', order: 3, content: { heading: 'Drop-Benachrichtigung', subheading: 'Verpasse keinen Drop mehr. Wir informieren dich 24h vorher.', buttonText: 'Anmelden', isNewsletter: true, incentive: 'FIRSTDROP10' }, styling: { backgroundColor: '#222222', textColor: '#ffffff' } },
  ]);

  const [shop] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Shop', slug: '/shop', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: shop.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Shop', subheading: 'Alle verfügbaren Drops', minimal: true }, styling: { backgroundColor: '#111111', textColor: '#ffffff' } },
    { pageId: shop.id, name: 'Alle Produkte', type: 'features', order: 1, content: { heading: 'DROP #23 — Urban Decay', items: [
      { title: 'Hoodie "Urban"', description: 'Heavy-Weight · Washed Black', price: '89€' },
      { title: 'Hoodie "Urban"', description: 'Heavy-Weight · Stone Grey', price: '89€' },
      { title: 'Tee "Decay"', description: 'Boxy Fit · Black', price: '49€' },
      { title: 'Tee "Decay"', description: 'Boxy Fit · Cream', price: '49€' },
      { title: 'Cargo Pants', description: 'Relaxed · Olive', price: '119€' },
      { title: 'Cap "MVRK"', description: 'Structured · Black', price: '39€' },
    ]}},
  ]);

  console.log('✅ shop_wachstum — Streetwear MVRK, Berlin');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
