// 📂 PFAD: backend/scripts/templates/shop_premium.ts
// Paket: shop_premium — Specialty Coffee "Röstwerk Hamburg"
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { wbGlobalTemplates, wbGlobalTemplatePages, wbGlobalTemplateSections } from '../../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
const TEMPLATE_NAME = 'Demo — Kaffeerösterei (shop_premium)';

async function main() {
  const force = process.argv.includes('--force');
  const [ex] = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates).where(eq(wbGlobalTemplates.name, TEMPLATE_NAME)).limit(1);
  if (ex && !force) { console.log('⏭️  Existiert bereits.'); await pool.end(); return; }
  if (ex) await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, ex.id));

  const [t] = await db.insert(wbGlobalTemplates).values({
    name: TEMPLATE_NAME, description: 'Specialty Coffee Rösterei mit Abo-System, Blog und Kaffeewissen',
    category: 'shop_premium', thumbnailUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
    isActive: true, isPremium: false,
    settings: { package: 'shop_premium', niche: 'kaffee', colors: { primary: '#3d1c02', secondary: '#2c1501', accent: '#d4a574', background: '#faf7f4', text: '#1a0e05' } },
  }).returning();

  const [home] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Startseite', slug: '/', isHomepage: true, order: 0 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: home.id, name: 'Hero', type: 'hero', order: 0, content: { heading: 'Röstwerk Hamburg — Specialty Coffee direkt ab Rösterei', subheading: 'Single Origin Kaffees aus Äthiopien, Kolumbien und Brasilien. Wöchentlich frisch geröstet, direkt zu dir nach Hause.', buttonText: 'Kaffee entdecken', buttonLink: '/shop', secondaryButtonText: 'Abo-Kiste', secondaryButtonLink: '/abo', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1400&h=600&fit=crop', badge: '☕ Wöchentlich frisch geröstet · Versand Mo–Fr' }, styling: { backgroundColor: '#3d1c02', textColor: '#f5efe8' } },
    { pageId: home.id, name: 'Produkte', type: 'features', order: 1, content: { heading: 'Aktuelle Röstungen', subtitle: 'Alle Kaffees mit Brew-Guide und Herkunftsinfo', items: [
      { icon: '🌿', title: 'Ethiopia Yirgacheffe Natural', description: 'Beeren, Jasmin, dunkle Schokolade · Filter & Espresso · Ernte 2023/24', price: '18,90€/250g', badge: '❤️ Favorit', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop' },
      { icon: '🍊', title: 'Colombia Huila Washed', description: 'Rote Johannisbeere, Aprikose, karamell · Espresso empfohlen', price: '17,90€/250g', badge: '🆕 Neu', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop' },
      { icon: '🍫', title: 'Brazil Cerrado Natural', description: 'Nuss, Milchschokolade, süße Früchte · Perfekt für Espresso & Cappuccino', price: '15,90€/250g', imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&h=400&fit=crop' },
    ], ctaText: 'Alle Röstungen →', ctaLink: '/shop' }},
    { pageId: home.id, name: 'Abo', type: 'cta', order: 2, content: { heading: 'Kaffee-Abo: Immer frischer Kaffee, nie wieder ausgehen', subheading: '250g oder 500g · Wöchentlich, zweiwöchentlich oder monatlich · Jederzeit pausierbar · 10% Abo-Rabatt', buttonText: 'Abo konfigurieren', buttonLink: '/abo', badge: '📦 Über 800 aktive Abonnenten' }, styling: { backgroundColor: '#d4a574', textColor: '#1a0e05' } },
    { pageId: home.id, name: 'Story', type: 'about', order: 3, content: { heading: 'Unsere Rösterei', text: '<p>2018 von Barista-Weltmeister-Finalist Kai Brandt in Hamburg-Altona gegründet. Was als Hobby in der Garage begann, ist heute eine der angesehensten Specialty-Röstereien Norddeutschlands.</p><p>Wir rösten nur Kaffees mit einem Cup Score über 85 Punkte. Alle Bauern werden direkt bezahlt — immer über Fairtrade-Preisen.</p>', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop', highlights: ['Cup Score 85+', 'Direkthandel mit Bauern', 'Wöchentlich frisch geröstet', 'SCA-zertifiziert'] }},
    { pageId: home.id, name: 'Newsletter', type: 'contact', order: 4, content: { heading: '10€ Rabatt auf deine erste Bestellung', subheading: 'Newsletter abonnieren und sofort einen Rabattcode erhalten. Plus: Röstberichte, Brew-Guides und neue Arrivals.', buttonText: 'Rabatt sichern', isNewsletter: true, incentive: 'ROESTWERK10' }, styling: { backgroundColor: '#3d1c02', textColor: '#f5efe8' } },
  ]);

  const [shopPage] = await db.insert(wbGlobalTemplatePages).values({ templateId: t.id, name: 'Shop', slug: '/shop', isHomepage: false, order: 1 }).returning();
  await db.insert(wbGlobalTemplateSections).values([
    { pageId: shopPage.id, name: 'Header', type: 'hero', order: 0, content: { heading: 'Alle Röstungen', subheading: 'Frisch geröstet, versandfertig in 24h', minimal: true }, styling: { backgroundColor: '#3d1c02', textColor: '#f5efe8' } },
    { pageId: shopPage.id, name: 'Produkte', type: 'features', order: 1, content: { heading: 'Single Origins', items: [
      { title: 'Ethiopia Yirgacheffe Natural', description: 'Beeren · Jasmin · Schokolade', price: '18,90€/250g' },
      { title: 'Colombia Huila Washed', description: 'Johannisbeere · Aprikose · Karamell', price: '17,90€/250g' },
      { title: 'Brazil Cerrado Natural', description: 'Nuss · Milchschokolade · Früchte', price: '15,90€/250g' },
      { title: 'Guatemala Huehuetenango', description: 'Limette · Brown Sugar · Mandel', price: '16,90€/250g' },
      { title: 'Kenya AA Washed', description: 'Schwarze Johannisbeere · Grapefruit · Langpfeffer', price: '19,90€/250g' },
    ]}},
  ]);

  console.log('✅ shop_premium — Röstwerk Hamburg');
  await pool.end();
}
main().catch(err => { console.error('❌', err); process.exit(1); });
