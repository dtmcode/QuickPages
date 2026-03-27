// 📂 PFAD: backend/scripts/seed-global-templates-v2.ts
// Run: npx ts-node -r tsconfig-paths/register scripts/seed-global-templates-v2.ts

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  wbGlobalTemplates,
  wbGlobalTemplatePages,
  wbGlobalTemplateSections,
} from '../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ==================== VALID SECTION TYPES ====================
// Muss exakt dem SectionType Enum entsprechen (schema.gql)
type ValidSectionType =
  | 'hero' | 'features' | 'about' | 'services' | 'gallery'
  | 'testimonials' | 'team' | 'pricing' | 'cta' | 'contact'
  | 'faq' | 'blog' | 'stats' | 'video' | 'text' | 'html' | 'custom';

interface SectionDef {
  name: string;
  type: ValidSectionType; // ← strict typed, kein string
  order: number;
  content: Record<string, unknown>;
  styling?: Record<string, unknown>;
}

interface PageDef {
  name: string;
  slug: string;
  isHomepage: boolean;
  order: number;
  sections: SectionDef[];
}

interface TemplateDef {
  name: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  isPremium: boolean;
  settings: Record<string, unknown>;
  pages: PageDef[];
}

// ==================== HELPER ====================

async function createTemplate(data: TemplateDef) {
  const [template] = await db.insert(wbGlobalTemplates).values({
    name: data.name,
    description: data.description,
    category: data.category,
    thumbnailUrl: data.thumbnailUrl,
    isActive: true,
    isPremium: data.isPremium,
    settings: data.settings,
  }).returning();

  for (const pageData of data.pages) {
    const [page] = await db.insert(wbGlobalTemplatePages).values({
      templateId: template.id,
      name: pageData.name,
      slug: pageData.slug,
      isHomepage: pageData.isHomepage,
      order: pageData.order,
    }).returning();

    if (pageData.sections.length > 0) {
      await db.insert(wbGlobalTemplateSections).values(
        pageData.sections.map((s) => ({
          pageId: page.id,
          name: s.name,
          type: s.type, // ← korrekt typisiert, kein cast nötig
          order: s.order,
          isActive: true,
          content: s.content,
          styling: s.styling ?? {},
        }))
      );
    }
  }

  console.log(`  ✅ ${data.name} (${data.category}${data.isPremium ? ' ⭐ Premium' : ''})`);
  return template;
}

// ==================== SEED DATA ====================
// HINWEIS: 'newsletter' existiert NICHT im SectionType Enum!
// Newsletter-Anmeldung → 'contact' type verwenden
// (PublicSiteRenderer erkennt contact-Sections mit newsletter-spezifischem content)

async function seedGlobalTemplatesV2() {
  console.log('\n🌱 Seeding Global Templates v2...\n');

  // ================================================
  // ONE-PAGE
  // ================================================
  console.log('📄 One-Page Templates:');

  await createTemplate({
    name: 'Freelancer Clean',
    description: 'Minimalistischer One-Pager für Freelancer und Solopreneure',
    category: 'onepage',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'onepage',
      colors: { primary: '#0f172a', secondary: '#475569', accent: '#3b82f6', background: '#ffffff', text: '#1e293b' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Ich bin [Dein Name]', subheading: 'Freelancer für Web & Design', buttonText: 'Kontakt aufnehmen', buttonLink: '#kontakt' },
          styling: { backgroundColor: '#0f172a', textColor: '#ffffff' } },
        { name: 'Über mich', type: 'about', order: 1,
          content: { heading: 'Über mich', text: '<p>Ich helfe Unternehmen dabei, ihre digitale Präsenz zu stärken. Mit über 5 Jahren Erfahrung in Web-Design und Entwicklung.</p>' } },
        { name: 'Services', type: 'services', order: 2,
          content: { heading: 'Was ich anbiete', items: [
            { icon: '🎨', title: 'Web Design', description: 'Moderne, responsive Websites', price: 'ab 799€' },
            { icon: '💻', title: 'Entwicklung', description: 'Clean Code & Performance', price: 'ab 999€' },
            { icon: '📈', title: 'SEO', description: 'Mehr Sichtbarkeit im Web', price: 'ab 299€' },
          ]}},
        { name: 'Kontakt', type: 'contact', order: 3,
          content: { heading: 'Schreib mir', subheading: 'Ich antworte innerhalb von 24h', buttonText: 'Nachricht senden' } },
      ],
    }],
  });

  await createTemplate({
    name: 'Business Card',
    description: 'Digitale Visitenkarte — kompakt, professionell, überzeugend',
    category: 'onepage',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'onepage',
      colors: { primary: '#6d28d9', secondary: '#4c1d95', accent: '#ddd6fe', background: '#faf5ff', text: '#1f2937' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Max Mustermann', subheading: 'CEO & Gründer von MusterGmbH', buttonText: 'LinkedIn', buttonLink: '#' },
          styling: { backgroundColor: '#6d28d9', textColor: '#ffffff' } },
        { name: 'In Zahlen', type: 'stats', order: 1,
          content: { heading: 'In Zahlen', items: [
            { value: '10+', title: 'Jahre', description: 'Erfahrung' },
            { value: '200+', title: 'Projekte', description: 'Erfolgreich' },
            { value: '50+', title: 'Kunden', description: 'Weltweit' },
          ]}},
        { name: 'Kontakt', type: 'contact', order: 2,
          content: { heading: 'Kontakt', buttonText: 'Nachricht senden' } },
      ],
    }],
  });

  await createTemplate({
    name: 'Agentur Premium',
    description: 'Premium One-Pager für Agenturen mit Testimonials und Preisen',
    category: 'onepage',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    isPremium: true,
    settings: {
      siteType: 'onepage',
      colors: { primary: '#111827', secondary: '#374151', accent: '#f59e0b', background: '#ffffff', text: '#111827' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Ergebnisse, die zählen', subheading: 'Die Full-Service Agentur für deinen Wachstum', buttonText: 'Kostenlos beraten', buttonLink: '#kontakt' },
          styling: { backgroundColor: '#111827', textColor: '#ffffff' } },
        { name: 'Features', type: 'features', order: 1,
          content: { heading: 'Warum wir?', items: [
            { icon: '🏆', title: 'Erfahrung', description: '10+ Jahre Branchenerfahrung' },
            { icon: '📊', title: 'Datengetrieben', description: 'Entscheidungen auf Basis echter Zahlen' },
            { icon: '🤝', title: 'Partnership', description: 'Langfristige Partnerschaft statt Einzelprojekte' },
          ]}},
        { name: 'Testimonials', type: 'testimonials', order: 2,
          content: { heading: 'Was Kunden sagen', items: [
            { title: 'Sarah K.', subtitle: 'CEO, TechStart GmbH', description: 'Die beste Investition für unser Unternehmen. Umsatz +40% nach 6 Monaten.' },
            { title: 'Michael B.', subtitle: 'Founder, E-Shop AG', description: 'Endlich eine Agentur die liefert was sie verspricht. Klare Empfehlung!' },
          ]}},
        { name: 'Preise', type: 'pricing', order: 3,
          content: { heading: 'Einfache Preise', items: [
            { title: 'Starter', price: '999€', description: 'Ideal für den Einstieg', features: ['Website Erstellung', 'SEO Grundlagen', '3 Monate Support'], buttonText: 'Jetzt starten' },
            { title: 'Growth', price: '1.999€', description: 'Für ambitionierte Ziele', features: ['Alles in Starter', 'Content Marketing', 'Analytics Setup', '12 Monate Support'], buttonText: 'Wachsen' },
          ]}},
        { name: 'CTA', type: 'cta', order: 4,
          content: { heading: 'Bereit für mehr Wachstum?', text: 'Erstgespräch kostenlos und unverbindlich', buttonText: 'Termin buchen', buttonLink: '#kontakt' },
          styling: { backgroundColor: '#f59e0b', textColor: '#111827' } },
      ],
    }],
  });

  // ================================================
  // BLOG
  // ================================================
  console.log('\n✍️  Blog Templates:');

  await createTemplate({
    name: 'Personal Blog',
    description: 'Minimalistischer Blog für Autoren, Creator und Journalisten',
    category: 'blog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'blog',
      colors: { primary: '#16a34a', secondary: '#15803d', accent: '#86efac', background: '#f9fafb', text: '#111827' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Mein Blog', subheading: 'Gedanken, Tipps und Erfahrungen aus meinem Alltag', buttonText: 'Artikel lesen', buttonLink: '/blog' },
            styling: { backgroundColor: '#16a34a', textColor: '#ffffff' } },
          { name: 'Neueste Beiträge', type: 'blog', order: 1,
            content: { heading: 'Neueste Beiträge' } },
          // Newsletter-Anmeldung → contact type mit newsletter-spezifischem content
          { name: 'Newsletter Anmeldung', type: 'contact', order: 2,
            content: { heading: 'Kein Artikel verpassen', subheading: 'Wöchentlich neue Inhalte direkt ins Postfach', buttonText: 'Abonnieren', isNewsletter: true } },
        ]},
      { name: 'Blog', slug: 'blog', isHomepage: false, order: 1, sections: [] },
      { name: 'Über mich', slug: 'ueber-mich', isHomepage: false, order: 2,
        sections: [
          { name: 'Über mich', type: 'about', order: 0,
            content: { heading: 'Hi, ich bin [Name]!', text: '<p>Ich schreibe über Themen die mich bewegen. Ehrlich, direkt und aus eigener Erfahrung.</p>' } },
        ]},
    ],
  });

  await createTemplate({
    name: 'Magazine Style',
    description: 'Professionelles Magazine-Layout für News, Reviews und Reportagen',
    category: 'blog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'blog',
      colors: { primary: '#dc2626', secondary: '#991b1b', accent: '#fca5a5', background: '#ffffff', text: '#111827' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Breaking News & Trends', subheading: 'Aktuelle Berichte, Analysen und Meinungen', buttonText: 'Alle Artikel', buttonLink: '/blog' },
            styling: { backgroundColor: '#dc2626', textColor: '#ffffff' } },
          { name: 'Kategorien', type: 'features', order: 1,
            content: { heading: 'Themen', items: [
              { icon: '💼', title: 'Business', description: 'Wirtschaft & Unternehmen' },
              { icon: '💻', title: 'Tech', description: 'Technologie & Innovation' },
              { icon: '🌍', title: 'Society', description: 'Gesellschaft & Kultur' },
            ]}},
          { name: 'Newsletter', type: 'contact', order: 2,
            content: { heading: 'Täglich informiert', subheading: 'Der Newsletter für Entscheider', buttonText: 'Kostenlos abonnieren', isNewsletter: true } },
        ]},
      { name: 'Blog', slug: 'blog', isHomepage: false, order: 1, sections: [] },
    ],
  });

  await createTemplate({
    name: 'Tech Blog Pro',
    description: 'Für Developer, Tech-Blogger und Tutorials — mit Code-Focus',
    category: 'blog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    isPremium: true,
    settings: {
      siteType: 'blog',
      colors: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#7dd3fc', background: '#0f172a', text: '#f1f5f9' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Code. Learn. Build.', subheading: 'Tutorials und Deep Dives für Developer', buttonText: 'Tutorials lesen', buttonLink: '/blog' },
            styling: { backgroundColor: '#0f172a', textColor: '#f1f5f9' } },
          { name: 'Topics', type: 'features', order: 1,
            content: { heading: 'Themen', items: [
              { icon: '⚛️', title: 'React & Next.js', description: 'Modern Frontend Development' },
              { icon: '🐍', title: 'Backend & APIs', description: 'Node.js, NestJS, GraphQL' },
              { icon: '☁️', title: 'DevOps', description: 'Docker, CI/CD, Cloud' },
            ]}},
          { name: 'Newsletter', type: 'contact', order: 2,
            content: { heading: 'Developer Newsletter', subheading: 'Wöchentlich: neue Tutorials, Tools und Tipps', buttonText: 'Abonnieren', isNewsletter: true } },
        ]},
      { name: 'Blog', slug: 'blog', isHomepage: false, order: 1, sections: [] },
    ],
  });

  // ================================================
  // LANDING PAGES
  // ================================================
  console.log('\n🚀 Landing Page Templates:');

  await createTemplate({
    name: 'Lead Magnet',
    description: 'Klassische Opt-in Page für E-Books, Checklisten und Free Downloads',
    category: 'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'landing',
      colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#ddd6fe', background: '#faf5ff', text: '#1f2937' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Kostenloser Guide: [Dein Thema]', subheading: 'Das komplette Handbuch — Schritt für Schritt erklärt', buttonText: 'Jetzt kostenlos downloaden', buttonLink: '#optin' },
          styling: { backgroundColor: '#7c3aed', textColor: '#ffffff' } },
        { name: 'Was du bekommst', type: 'features', order: 1,
          content: { heading: 'Das ist drin', items: [
            { icon: '✅', title: '20+ Seiten Guide', description: 'Vollständig und sofort anwendbar' },
            { icon: '✅', title: 'Checkliste', description: 'Schritt-für-Schritt zum Erfolg' },
            { icon: '✅', title: 'Bonus Templates', description: 'Sofort einsatzbereit' },
          ]}},
        { name: 'Opt-in Formular', type: 'contact', order: 2,
          content: { heading: 'Jetzt kostenlos anfordern', subheading: 'Kein Spam. Jederzeit abmeldbar.', buttonText: '📥 Kostenlos downloaden', isNewsletter: true } },
        { name: 'Trust', type: 'stats', order: 3,
          content: { heading: '', items: [
            { value: '10.000+', title: 'Downloads', description: 'Zufriedene Leser' },
            { value: '4.9/5', title: 'Bewertung', description: 'Durchschnitt' },
            { value: '100%', title: 'Kostenlos', description: 'Kein Haken' },
          ]}},
      ],
    }],
  });

  await createTemplate({
    name: 'Webinar Anmeldung',
    description: 'Hochkonvertierende Webinar-Registrierungsseite mit Social Proof',
    category: 'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'landing',
      colors: { primary: '#0891b2', secondary: '#0e7490', accent: '#67e8f9', background: '#f0f9ff', text: '#0c4a6e' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Kostenloses Live-Webinar: [Thema]', subheading: 'Am [Datum] — 60 Minuten die dein Business verändern', buttonText: 'Jetzt kostenlos anmelden', buttonLink: '#anmeldung' },
          styling: { backgroundColor: '#0891b2', textColor: '#ffffff' } },
        { name: 'Was du lernst', type: 'features', order: 1,
          content: { heading: 'Das lernst du', items: [
            { icon: '🎯', title: 'Strategie', description: 'Den richtigen Plan entwickeln' },
            { icon: '⚡', title: 'Umsetzung', description: 'Sofort anwendbare Techniken' },
            { icon: '📈', title: 'Ergebnisse', description: 'Messbare Verbesserungen' },
          ]}},
        { name: 'Anmeldung', type: 'contact', order: 2,
          content: { heading: 'Sichere deinen Platz', subheading: 'Nur begrenzte Plätze verfügbar!', buttonText: '🎯 Kostenlos anmelden', isNewsletter: true } },
        { name: 'Über den Host', type: 'about', order: 3,
          content: { heading: 'Dein Host', text: '<p>Experte mit 10+ Jahren Erfahrung. Hat bereits über 500 Unternehmen geholfen.</p>' } },
      ],
    }],
  });

  await createTemplate({
    name: 'Produkt Launch',
    description: 'Professionelle Launch-Page für neue Produkte, Software oder Kurse',
    category: 'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
    isPremium: true,
    settings: {
      siteType: 'landing',
      colors: { primary: '#f97316', secondary: '#ea580c', accent: '#fed7aa', background: '#fff7ed', text: '#1c1917' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: '[Produktname] — Jetzt verfügbar', subheading: 'Die Lösung für [Problem]. Endlich einfach.', buttonText: '🔥 Jetzt kaufen — Early Bird Preis', buttonLink: '#kaufen' },
          styling: { backgroundColor: '#f97316', textColor: '#ffffff' } },
        { name: 'Problem / Lösung', type: 'features', order: 1,
          content: { heading: 'Erkennst du das?', items: [
            { icon: '😤', title: 'Das Problem', description: 'Du kämpfst täglich mit [Problem]' },
            { icon: '💡', title: 'Die Lösung', description: '[Produktname] löst das für dich' },
            { icon: '✨', title: 'Das Ergebnis', description: 'Mehr Zeit, weniger Stress, bessere Ergebnisse' },
          ]}},
        { name: 'Testimonials', type: 'testimonials', order: 2,
          content: { heading: 'Das sagen Beta-Tester', items: [
            { title: 'Anna S.', subtitle: 'Marketing Manager', description: 'Hat meine Arbeitszeit halbiert. Kann ich nur empfehlen!' },
            { title: 'Tom W.', subtitle: 'Freelancer', description: 'Endlich eine Lösung die wirklich funktioniert.' },
          ]}},
        { name: 'Preise', type: 'pricing', order: 3,
          content: { heading: 'Early Bird — nur noch 48h', items: [
            { title: 'Starter', price: '49€', description: 'Einmalig, kein Abo', features: ['Vollzugang', '1 Jahr Updates', 'Email Support'], buttonText: 'Jetzt kaufen' },
            { title: 'Pro', price: '99€', description: 'Einmalig, kein Abo', features: ['Alles in Starter', 'Priority Support', 'Lifetime Updates', 'Team-Lizenz'], buttonText: 'Pro kaufen' },
          ]}},
        { name: 'CTA', type: 'cta', order: 4,
          content: { heading: 'Starte noch heute', text: '30 Tage Geld-zurück-Garantie — kein Risiko', buttonText: 'Jetzt kaufen', buttonLink: '#kaufen' },
          styling: { backgroundColor: '#f97316', textColor: '#ffffff' } },
      ],
    }],
  });

  await createTemplate({
    name: 'Waitlist / Coming Soon',
    description: 'Sammle Interessenten bevor dein Produkt live geht',
    category: 'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489844097929-c8d5b91c456e?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'landing',
      colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', background: '#0f172a', text: '#f1f5f9' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: 'home', isHomepage: true, order: 0,
      sections: [
        { name: 'Hero', type: 'hero', order: 0,
          content: { heading: 'Kommt bald. Sei dabei.', subheading: '[Produktname] — Werde Teil der ersten 500 Nutzer und spare 50%', buttonText: '🚀 Auf die Waitlist', buttonLink: '#waitlist' },
          styling: { backgroundColor: '#0f172a', textColor: '#f1f5f9' } },
        { name: 'Was kommt', type: 'features', order: 1,
          content: { heading: 'Was dich erwartet', items: [
            { icon: '⚡', title: 'Feature 1', description: 'Kurzbeschreibung was kommen wird' },
            { icon: '🎯', title: 'Feature 2', description: 'Kurzbeschreibung was kommen wird' },
            { icon: '🔮', title: 'Feature 3', description: 'Kurzbeschreibung was kommen wird' },
          ]}},
        { name: 'Waitlist', type: 'contact', order: 2,
          content: { heading: 'Sichere deinen Early-Access', subheading: 'Early-Bird Nutzer sparen 50% auf den Launch-Preis', buttonText: '📧 Auf die Liste setzen', isNewsletter: true } },
        { name: 'Counter', type: 'stats', order: 3,
          content: { heading: '', items: [
            { value: '483', title: 'Bereits angemeldet', description: '' },
            { value: '50%', title: 'Early-Bird Rabatt', description: '' },
            { value: 'Q1 2025', title: 'Launch geplant', description: '' },
          ]}},
      ],
    }],
  });

  // ================================================
  // SHOP
  // ================================================
  console.log('\n🛒 Shop Templates:');

  await createTemplate({
    name: 'Fashion Store',
    description: 'Eleganter Online-Shop für Mode, Accessoires und Lifestyle',
    category: 'shop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'shop',
      colors: { primary: '#18181b', secondary: '#27272a', accent: '#f4f4f5', background: '#ffffff', text: '#18181b' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'New Collection', subheading: 'Entdecke die neueste Kollektion', buttonText: 'Shop Now', buttonLink: '/shop' },
            styling: { backgroundColor: '#18181b', textColor: '#ffffff' } },
          { name: 'Kategorien', type: 'features', order: 1,
            content: { heading: 'Kategorien', items: [
              { icon: '👗', title: 'Damen', description: 'Neue Kollektion' },
              { icon: '👔', title: 'Herren', description: 'Premium Auswahl' },
              { icon: '👟', title: 'Schuhe', description: 'Trends 2025' },
            ]}},
          { name: 'Newsletter', type: 'contact', order: 2,
            content: { heading: '10% Rabatt auf die erste Bestellung', subheading: 'Für Newsletter-Abonnenten', buttonText: 'Rabatt sichern', isNewsletter: true } },
        ]},
      { name: 'Shop', slug: 'shop', isHomepage: false, order: 1, sections: [] },
    ],
  });

  await createTemplate({
    name: 'Digital Products',
    description: 'Verkaufe E-Books, Kurse, Templates und digitale Downloads',
    category: 'shop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'shop',
      colors: { primary: '#4f46e5', secondary: '#4338ca', accent: '#a5b4fc', background: '#fafafa', text: '#1f2937' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Digitale Produkte für deinen Erfolg', subheading: 'E-Books, Templates und Kurse — sofort verfügbar', buttonText: 'Produkte ansehen', buttonLink: '/shop' },
            styling: { backgroundColor: '#4f46e5', textColor: '#ffffff' } },
          { name: 'Produkt-Typen', type: 'features', order: 1,
            content: { heading: 'Was du bekommst', items: [
              { icon: '📚', title: 'E-Books', description: 'Sofort-Download als PDF' },
              { icon: '🎨', title: 'Templates', description: 'Für Figma, Notion und mehr' },
              { icon: '🎓', title: 'Video-Kurse', description: 'Lerne in deinem Tempo' },
            ]}},
          { name: 'Testimonials', type: 'testimonials', order: 2,
            content: { heading: 'Kundenstimmen', items: [
              { title: 'Laura M.', subtitle: 'Designer', description: 'Das Template hat mir Stunden gespart. Absolute Kaufempfehlung!' },
              { title: 'Kai T.', subtitle: 'Unternehmer', description: 'Der Kurs hat mein Business komplett verändert.' },
            ]}},
        ]},
      { name: 'Shop', slug: 'shop', isHomepage: false, order: 1, sections: [] },
    ],
  });

  await createTemplate({
    name: 'Premium Shop',
    description: 'High-End Shop-Experience mit Storytelling und Marken-Positionierung',
    category: 'shop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
    isPremium: true,
    settings: {
      siteType: 'shop',
      colors: { primary: '#b45309', secondary: '#92400e', accent: '#fde68a', background: '#fffbeb', text: '#1c1917' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Handgemacht. Einzigartig. Deins.', subheading: 'Premium Produkte mit Seele — jedes einzeln gefertigt', buttonText: 'Kollektion entdecken', buttonLink: '/shop' },
            styling: { backgroundColor: '#b45309', textColor: '#ffffff' } },
          { name: 'Story', type: 'about', order: 1,
            content: { heading: 'Unsere Geschichte', text: '<p>Seit 2010 fertigen wir ausschließlich handgemachte Produkte aus nachhaltigen Materialien. Jedes Stück ist ein Unikat.</p>' } },
          { name: 'Testimonials', type: 'testimonials', order: 2,
            content: { heading: 'Unsere Kunden lieben es', items: [
              { title: 'Maria H.', subtitle: 'Stammkundin seit 2020', description: 'Qualität die man spürt. Habe schon 5 Produkte verschenkt.' },
            ]}},
          { name: 'CTA', type: 'cta', order: 3,
            content: { heading: 'Werde VIP-Kunde', text: 'Exklusive Rabatte und neue Produkte als Erster erfahren', buttonText: 'VIP werden', buttonLink: '#vip' },
            styling: { backgroundColor: '#b45309', textColor: '#ffffff' } },
        ]},
      { name: 'Shop', slug: 'shop', isHomepage: false, order: 1, sections: [] },
      { name: 'Über uns', slug: 'ueber-uns', isHomepage: false, order: 2,
        sections: [
          { name: 'Über uns', type: 'about', order: 0,
            content: { heading: 'Wer wir sind', text: '<p>Ein kleines, leidenschaftliches Team aus [Stadt]. Wir glauben an Qualität statt Quantität.</p>' } },
          { name: 'Team', type: 'team', order: 1,
            content: { heading: 'Das Team', items: [
              { title: 'Max M.', subtitle: 'Gründer & Handwerksmeister', description: '15 Jahre Erfahrung in traditioneller Handwerkskunst' },
            ]}},
        ]},
    ],
  });

  // ================================================
  // MULTI-PAGE / BUSINESS
  // ================================================
  console.log('\n🌐 Business / Multi-Page Templates:');

  await createTemplate({
    name: 'Dienstleister Pro',
    description: 'Klassische Business-Website für Dienstleister und Berater',
    category: 'business',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'multipage',
      colors: { primary: '#2563eb', secondary: '#1d4ed8', accent: '#bfdbfe', background: '#ffffff', text: '#1f2937' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Professionelle Beratung für Ihr Unternehmen', subheading: 'Strategische Lösungen für nachhaltigen Erfolg', buttonText: 'Beratungsgespräch vereinbaren', buttonLink: '/kontakt' },
            styling: { backgroundColor: '#2563eb', textColor: '#ffffff' } },
          { name: 'Leistungen', type: 'features', order: 1,
            content: { heading: 'Unsere Kernleistungen', items: [
              { icon: '📊', title: 'Strategie', description: 'Unternehmensberatung & Planung' },
              { icon: '⚙️', title: 'Prozesse', description: 'Optimierung & Digitalisierung' },
              { icon: '📈', title: 'Wachstum', description: 'Skalierung & Expansion' },
            ]}},
          { name: 'CTA', type: 'cta', order: 2,
            content: { heading: 'Erstes Gespräch kostenlos', text: 'Unverbindliche Beratung in 30 Minuten', buttonText: 'Termin buchen', buttonLink: '/kontakt' },
            styling: { backgroundColor: '#1d4ed8', textColor: '#ffffff' } },
        ]},
      { name: 'Über uns', slug: 'ueber-uns', isHomepage: false, order: 1,
        sections: [
          { name: 'Story', type: 'about', order: 0,
            content: { heading: 'Über uns', text: '<p>Seit 2010 beraten wir mittelständische Unternehmen auf dem Weg zu nachhaltigem Wachstum.</p>' } },
          { name: 'Team', type: 'team', order: 1,
            content: { heading: 'Unser Team', items: [
              { title: 'Dr. Sarah M.', subtitle: 'Geschäftsführerin', description: '20 Jahre Beratungserfahrung' },
            ]}},
        ]},
      { name: 'Leistungen', slug: 'leistungen', isHomepage: false, order: 2,
        sections: [
          { name: 'Services', type: 'services', order: 0,
            content: { heading: 'Unsere Leistungen', items: [
              { icon: '📊', title: 'Strategieberatung', description: 'Langfristige Unternehmensplanung', price: 'ab 2.000€/Tag' },
              { icon: '🔄', title: 'Prozessoptimierung', description: 'Effizienz und Automatisierung', price: 'Projektbasiert' },
            ]}},
          { name: 'Preise', type: 'pricing', order: 1,
            content: { heading: 'Pakete', items: [
              { title: 'Workshop', price: '999€', description: 'Halbtägiger Workshop', features: ['4h Beratung', 'Dokumentation', 'Aktionsplan'], buttonText: 'Buchen' },
              { title: 'Projekt', price: 'auf Anfrage', description: 'Individuelle Lösung', features: ['Vollumfängliche Beratung', 'Implementierung', 'Erfolgsmessung'], buttonText: 'Anfragen' },
            ]}},
        ]},
      { name: 'Kontakt', slug: 'kontakt', isHomepage: false, order: 3,
        sections: [
          { name: 'Kontakt', type: 'contact', order: 0,
            content: { heading: 'Nehmen Sie Kontakt auf', subheading: 'Wir melden uns innerhalb von 24 Stunden', buttonText: 'Anfrage senden' } },
        ]},
    ],
  });

  await createTemplate({
    name: 'Startup Modern',
    description: 'Modernes Template für Startups mit Pricing, Team und FAQ',
    category: 'business',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    isPremium: false,
    settings: {
      siteType: 'multipage',
      colors: { primary: '#059669', secondary: '#047857', accent: '#a7f3d0', background: '#ecfdf5', text: '#064e3b' },
      fonts: { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      { name: 'Startseite', slug: 'home', isHomepage: true, order: 0,
        sections: [
          { name: 'Hero', type: 'hero', order: 0,
            content: { heading: 'Die Zukunft beginnt hier', subheading: 'Wir lösen [Problem] für [Zielgruppe] — einfach, schnell, skalierbar', buttonText: 'Kostenlos testen', buttonLink: '#signup' },
            styling: { backgroundColor: '#059669', textColor: '#ffffff' } },
          { name: 'Features', type: 'features', order: 1,
            content: { heading: 'Warum [Startup]?', items: [
              { icon: '⚡', title: '10x schneller', description: 'Als bisherige Lösungen' },
              { icon: '💰', title: '60% günstiger', description: 'Bei vollem Funktionsumfang' },
              { icon: '🎯', title: 'Einfach', description: 'Keine technischen Kenntnisse nötig' },
            ]}},
          { name: 'CTA', type: 'cta', order: 2,
            content: { heading: 'Early Access sichern', text: 'Werde Teil unserer Beta-Community', buttonText: 'Zugang sichern', buttonLink: '#signup' },
            styling: { backgroundColor: '#059669', textColor: '#ffffff' } },
        ]},
      { name: 'Preise', slug: 'preise', isHomepage: false, order: 1,
        sections: [
          { name: 'Pricing', type: 'pricing', order: 0,
            content: { heading: 'Einfache Preise', items: [
              { title: 'Free', price: '0€', description: 'Für immer kostenlos', features: ['3 Projekte', 'Community Support', 'Basis-Features'], buttonText: 'Kostenlos starten' },
              { title: 'Pro', price: '19€/Monat', description: 'Für Professionals', features: ['Unbegrenzte Projekte', 'Priority Support', 'Alle Features', 'API Zugang'], buttonText: 'Pro testen' },
            ]}},
          { name: 'FAQ', type: 'faq', order: 1,
            content: { heading: 'Häufige Fragen', items: [
              { title: 'Gibt es eine kostenlose Testversion?', description: 'Ja! Unser Free-Plan ist dauerhaft kostenlos.' },
              { title: 'Kann ich jederzeit kündigen?', description: 'Ja, monatliche Kündigung jederzeit möglich.' },
            ]}},
        ]},
      { name: 'Kontakt', slug: 'kontakt', isHomepage: false, order: 2,
        sections: [
          { name: 'Kontakt', type: 'contact', order: 0,
            content: { heading: 'Sprich mit uns', subheading: 'Wir antworten innerhalb von 24h', buttonText: 'Nachricht senden' } },
        ]},
    ],
  });

  // ==================== DONE ====================
  console.log('\n✅ Seeding v2 abgeschlossen!');
  console.log('📊 Erstellt:');
  console.log('   📄 One-Page: 3 Templates (2 kostenlos, 1 Premium)');
  console.log('   ✍️  Blog:     3 Templates (2 kostenlos, 1 Premium)');
  console.log('   🚀 Landing:  4 Templates (3 kostenlos, 1 Premium)');
  console.log('   🛒 Shop:     3 Templates (2 kostenlos, 1 Premium)');
  console.log('   🌐 Business: 2 Templates (beide kostenlos)');
  console.log('   Total: 15 Templates (11 kostenlos, 4 Premium)');
  console.log('\n💡 newsletter sections → contact type mit isNewsletter:true im content\n');

  await pool.end();
}

seedGlobalTemplatesV2().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});