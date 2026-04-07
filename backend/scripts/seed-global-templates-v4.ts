// 📂 PFAD: backend/scripts/seed-global-templates-v4.ts
//
// Ergänzt v3 — NUR neue Templates (Landing + Branchen)
// Löscht nichts aus v3.
//
// Run:
//   npx ts-node -r tsconfig-paths/register scripts/seed-global-templates-v4.ts
//   npx ts-node -r tsconfig-paths/register scripts/seed-global-templates-v4.ts --force
//   npx ts-node -r tsconfig-paths/register scripts/seed-global-templates-v4.ts --category=landing
//   npx ts-node -r tsconfig-paths/register scripts/seed-global-templates-v4.ts --category=friseur

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import {
  wbGlobalTemplates,
  wbGlobalTemplatePages,
  wbGlobalTemplateSections,
} from '../src/drizzle/website-builder.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db   = drizzle(pool);

// ==================== TYPES ====================

type SectionType =
  | 'hero' | 'features' | 'about' | 'services' | 'gallery'
  | 'testimonials' | 'team' | 'pricing' | 'cta' | 'contact'
  | 'faq' | 'blog' | 'stats' | 'video' | 'text' | 'html' | 'custom';

interface SectionDef {
  name:     string;
  type:     SectionType;
  order:    number;
  content:  Record<string, unknown>;
  styling?: Record<string, unknown>;
}

interface PageDef {
  name: string; slug: string; isHomepage: boolean; order: number;
  sections: SectionDef[];
}

interface TemplateDef {
  name: string; description: string; category: string;
  thumbnailUrl: string; isPremium: boolean;
  settings: Record<string, unknown>;
  pages: PageDef[];
}

// ==================== HELPERS ====================

const S = {
  dark:    (c = '#111827') => ({ backgroundColor: c, textColor: '#f9fafb' }),
  primary: (c: string)     => ({ backgroundColor: c, textColor: '#ffffff' }),
  muted:   ()              => ({ backgroundColor: '#f3f4f6', textColor: '#374151' }),
  custom:  (bg: string, text: string) => ({ backgroundColor: bg, textColor: text }),
};

async function templateExists(name: string): Promise<boolean> {
  const r = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates)
    .where(eq(wbGlobalTemplates.name, name)).limit(1);
  return r.length > 0;
}

async function deleteTemplate(name: string): Promise<void> {
  const r = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates)
    .where(eq(wbGlobalTemplates.name, name)).limit(1);
  if (!r.length) return;
  await db.delete(wbGlobalTemplates).where(eq(wbGlobalTemplates.id, r[0].id));
}

async function createTemplate(data: TemplateDef, force: boolean): Promise<void> {
  if (await templateExists(data.name)) {
    if (!force) { console.log(`   ⏭️  "${data.name}" existiert — übersprungen`); return; }
    await deleteTemplate(data.name);
  }

  const [tpl] = await db.insert(wbGlobalTemplates).values({
    name: data.name, description: data.description, category: data.category,
    thumbnailUrl: data.thumbnailUrl, isActive: true, isPremium: data.isPremium,
    settings: data.settings,
  }).returning();

  for (const pg of data.pages) {
    const [page] = await db.insert(wbGlobalTemplatePages).values({
      templateId: tpl.id, name: pg.name, slug: pg.slug,
      isHomepage: pg.isHomepage, order: pg.order,
    }).returning();

    if (pg.sections.length) {
      await db.insert(wbGlobalTemplateSections).values(
        pg.sections.map(s => ({
          pageId: page.id, name: s.name, type: s.type,
          order: s.order, content: s.content, styling: s.styling ?? {},
        })),
      );
    }
  }

  const badge = data.isPremium ? '⭐ Premium' : 'Free';
  console.log(`   ✅  ${data.name} [${data.category}] — ${badge}`);
}

// ==================== TEMPLATES ====================

const TEMPLATES: TemplateDef[] = [

  // ╔══════════════════════════════════════════════════════╗
  // ║  LANDING PAGES (4)                                   ║
  // ║  category: 'landing'  — paket-unabhängig             ║
  // ╚══════════════════════════════════════════════════════╝

  {
    name:        'Landing — Lead Magnet',
    description: 'Opt-in Page für E-Books, Checklisten und kostenlose Downloads',
    category:    'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#ede9fe', background: '#faf5ff', text: '#1f2937' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: '/', isHomepage: true, order: 0,
      sections: [
        {
          name: 'Hero', type: 'hero', order: 0,
          content: {
            heading:    'Kostenloser Guide: In 7 Schritten zu mehr Kunden',
            subheading: 'Das komplette Handbuch für Selbstständige und kleine Unternehmen — sofort als PDF.',
            buttonText: 'Jetzt kostenlos downloaden',
            buttonLink: '#download',
          },
          styling: S.primary('#7c3aed'),
        },
        {
          name: 'Was du bekommst', type: 'features', order: 1,
          content: {
            heading: 'Das ist drin',
            items: [
              { icon: '📄', title: '24-seitiger PDF-Guide',    description: 'Schritt für Schritt erklärt — sofort umsetzbar' },
              { icon: '✅', title: 'Checkliste zum Abhaken',   description: 'Damit du nichts vergisst' },
              { icon: '🎯', title: '3 Bonus-Templates',       description: 'Für E-Mail, Angebot und Erstgespräch' },
            ],
          },
        },
        {
          name: 'Social Proof', type: 'stats', order: 2,
          content: {
            items: [
              { value: '12.400+', label: 'Downloads',     description: 'Zufriedene Leser' },
              { value: '4.9 / 5', label: 'Bewertung',     description: 'Durchschnitt' },
              { value: '100%',    label: 'Kostenlos',      description: 'Kein Haken, kein Abo' },
            ],
          },
          styling: S.muted(),
        },
        {
          name: 'Download-Formular', type: 'contact', order: 3,
          content: {
            heading:     'Wo sollen wir den Guide hinschicken?',
            subheading:  'Kein Spam. Jederzeit abmeldbar. Nur der Guide + gelegentliche Tipps.',
            buttonText:  '📥 Jetzt kostenlos herunterladen',
            isNewsletter: true,
          },
          styling: S.primary('#6d28d9'),
        },
        {
          name: 'Testimonials', type: 'testimonials', order: 4,
          content: {
            heading: 'Was andere sagen',
            items: [
              { title: 'Andrea K.', subtitle: 'Freelance Designerin',  description: 'Endlich ein Guide der wirklich auf den Punkt kommt. Ich habe direkt 3 neue Kunden gewonnen.' },
              { title: 'Marco S.',  subtitle: 'Selbstständiger Berater', description: 'Sehr praxisnah. Kein theoretisches Blabla — echte Tipps die funktionieren.' },
            ],
          },
        },
      ],
    }],
  },

  {
    name:        'Landing — Webinar-Anmeldung',
    description: 'Hochkonvertierende Anmeldeseite für Live-Webinare und Online-Events',
    category:    'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#0891b2', secondary: '#0e7490', accent: '#cffafe', background: '#f0f9ff', text: '#0c4a6e' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: '/', isHomepage: true, order: 0,
      sections: [
        {
          name: 'Hero', type: 'hero', order: 0,
          content: {
            heading:    'Live-Webinar: Wie du in 90 Tagen 10 neue Wunschkunden gewinnst',
            subheading: 'Kostenlos · Dienstag, 15. Oktober · 19:00 Uhr · Online via Zoom',
            buttonText: 'Jetzt kostenlos anmelden',
            buttonLink: '#anmeldung',
          },
          styling: S.primary('#0891b2'),
        },
        {
          name: 'Was du lernst', type: 'features', order: 1,
          content: {
            heading: 'Das lernst du in diesem Webinar',
            items: [
              { icon: '🎯', title: 'Die richtige Positionierung',      description: 'Warum die meisten scheitern und wie du es besser machst' },
              { icon: '📣', title: 'Kunden ansprechen ohne Kaltakquise', description: 'So kommen Kunden von selbst zu dir' },
              { icon: '💬', title: 'Das Erstgespräch führen',          description: 'Konvertiere Interessenten zu zahlenden Kunden' },
            ],
          },
        },
        {
          name: 'Über den Host', type: 'about', order: 2,
          content: {
            heading: 'Dein Host: Markus Weber',
            text: '<p>Markus Weber ist Business-Coach mit über 12 Jahren Erfahrung. Er hat mehr als 800 Selbstständige und Unternehmer dabei begleitet, nachhaltig neue Kunden zu gewinnen. Bekannt aus Focus Online, Gründerszene und dem Podcast "Business Klartext".</p>',
          },
        },
        {
          name: 'Anmeldeformular', type: 'contact', order: 3,
          content: {
            heading:     'Platz sichern — kostenlos & unverbindlich',
            subheading:  'Nur 200 Plätze verfügbar. Nach Anmeldung erhältst du sofort den Zoom-Link.',
            buttonText:  '🎯 Jetzt kostenlos anmelden',
            isNewsletter: true,
          },
          styling: S.primary('#0891b2'),
        },
        {
          name: 'FAQ', type: 'faq', order: 4,
          content: {
            heading: 'Häufige Fragen',
            items: [
              { title: 'Ist das Webinar wirklich kostenlos?',  description: 'Ja, vollständig kostenlos. Kein versteckter Upsell am Ende.' },
              { title: 'Was wenn ich nicht live dabei bin?',   description: 'Du erhältst 48h nach dem Webinar die Aufzeichnung.' },
              { title: 'Für wen ist das Webinar geeignet?',   description: 'Für Selbstständige, Freelancer und kleine Unternehmen die mehr Kunden gewinnen wollen.' },
            ],
          },
        },
      ],
    }],
  },

  {
    name:        'Landing — Produkt-Launch',
    description: 'Launch-Page für neue Produkte, Kurse oder Software — mit Countdown-Energie',
    category:    'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
    isPremium:   true,
    settings: {
      colors: { primary: '#ea580c', secondary: '#c2410c', accent: '#fed7aa', background: '#fff7ed', text: '#1c1917' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: '/', isHomepage: true, order: 0,
      sections: [
        {
          name: 'Hero', type: 'hero', order: 0,
          content: {
            heading:    'Flowmatic ist jetzt verfügbar.',
            subheading: 'Das Tool das deinen Arbeitsalltag revolutioniert — jetzt zum Early-Bird-Preis.',
            buttonText: '🔥 Jetzt kaufen — nur noch 72 Stunden',
            buttonLink: '#kaufen',
          },
          styling: S.primary('#ea580c'),
        },
        {
          name: 'Problem', type: 'features', order: 1,
          content: {
            heading: 'Kennst du das?',
            items: [
              { icon: '😤', title: 'Zu viele Tools',       description: 'Du jonglierst 10 verschiedene Apps und verlierst den Überblick' },
              { icon: '⏰', title: 'Keine Zeit',            description: 'Administrative Aufgaben fressen deine produktive Zeit' },
              { icon: '💸', title: 'Zu hohe Kosten',       description: 'Monatliche Abo-Gebühren die sich addieren' },
            ],
          },
        },
        {
          name: 'Lösung', type: 'about', order: 2,
          content: {
            heading: 'Flowmatic löst das.',
            text: '<p>Flowmatic verbindet alle deine Arbeitsabläufe in einer einzigen Oberfläche. Kein Switching zwischen Apps. Kein manuelles Übertragen von Daten. Nur Fokus auf das was wirklich zählt.</p><p><strong>Ergebnis unserer Beta-Nutzer: Im Schnitt 8 Stunden gespart pro Woche.</strong></p>',
          },
        },
        {
          name: 'Features', type: 'features', order: 3,
          content: {
            heading: 'Was Flowmatic kann',
            items: [
              { icon: '🔄', title: 'Automatische Workflows',    description: 'Einmal einrichten, für immer sparen' },
              { icon: '📊', title: 'Echtzeit-Dashboard',       description: 'Alle wichtigen Zahlen auf einen Blick' },
              { icon: '🤝', title: 'Team-Kollaboration',       description: 'Gemeinsam arbeiten ohne Chaos' },
              { icon: '🔌', title: '200+ Integrationen',       description: 'Verbinde deine bestehenden Tools' },
            ],
          },
        },
        {
          name: 'Testimonials', type: 'testimonials', order: 4,
          content: {
            heading: 'Beta-Tester über Flowmatic',
            items: [
              { title: 'Anna P.',  subtitle: 'Freelance Texterin',       description: 'Ich spare wöchentlich 6 Stunden. Das entspricht einem kompletten Arbeitstag mehr pro Woche.' },
              { title: 'Jonas K.', subtitle: 'Startup Founder',          description: 'Unser Team war von Tag 1 begeistert. Onboarding dauerte 20 Minuten.' },
              { title: 'Sandra M.', subtitle: 'Online-Marketing-Managerin', description: 'Endlich ein Tool das hält was es verspricht. Klare Kaufempfehlung.' },
            ],
          },
        },
        {
          name: 'Preise', type: 'pricing', order: 5,
          content: {
            heading: 'Early-Bird — nur noch 72 Stunden',
            items: [
              {
                title:       'Starter',
                price:       '49€',
                description: 'Einmalig · kein Abo',
                features:    ['1 Nutzer', 'Alle Grundfunktionen', '50 Workflows/Monat', '1 Jahr Updates', 'E-Mail Support'],
                buttonText:  'Jetzt kaufen',
              },
              {
                title:       'Pro',
                price:       '129€',
                description: 'Einmalig · kein Abo',
                features:    ['5 Nutzer', 'Alle Funktionen', 'Unbegrenzte Workflows', 'Lifetime Updates', 'Priority Support', 'Onboarding-Call'],
                buttonText:  'Pro kaufen',
                highlighted: true,
              },
            ],
          },
        },
        {
          name: 'Garantie', type: 'cta', order: 6,
          content: {
            heading:    '30 Tage Geld-zurück-Garantie.',
            text:       'Wenn Flowmatic nicht das hält was wir versprechen — volle Rückerstattung. Kein Wenn und Aber.',
            buttonText: 'Jetzt kaufen',
            buttonLink: '#kaufen',
          },
          styling: S.muted(),
        },
      ],
    }],
  },

  {
    name:        'Landing — Waitlist',
    description: 'Coming-Soon-Page für Produkte in der Entwicklung — sammle Interessenten',
    category:    'landing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1489844097929-c8d5b91c456e?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', background: '#0f172a', text: '#f8fafc' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [{
      name: 'Landing Page', slug: '/', isHomepage: true, order: 0,
      sections: [
        {
          name: 'Hero', type: 'hero', order: 0,
          content: {
            heading:    'Etwas Großes kommt.',
            subheading: 'Wir bauen das Tool das du dir immer gewünscht hast. Trag dich ein — Early-Access-Nutzer sparen 40%.',
            buttonText: '🚀 Early Access sichern',
            buttonLink: '#waitlist',
          },
          styling: S.dark('#0f172a'),
        },
        {
          name: 'Was kommt', type: 'features', order: 1,
          content: {
            heading: 'Was dich erwartet',
            items: [
              { icon: '⚡', title: 'Funktion A', description: 'Kurze Beschreibung was dieses Feature für den User bedeutet' },
              { icon: '🎯', title: 'Funktion B', description: 'Kurze Beschreibung was dieses Feature für den User bedeutet' },
              { icon: '🔮', title: 'Funktion C', description: 'Kurze Beschreibung was dieses Feature für den User bedeutet' },
            ],
          },
          styling: S.custom('#1e293b', '#f1f5f9'),
        },
        {
          name: 'Anmeldung', type: 'contact', order: 2,
          content: {
            heading:     'Auf die Waitlist eintragen',
            subheading:  'Early-Access-Nutzer werden als erste informiert und erhalten 40% Rabatt zum Launch.',
            buttonText:  '📧 Platz reservieren',
            isNewsletter: true,
          },
          styling: S.dark('#0f172a'),
        },
        {
          name: 'Counter', type: 'stats', order: 3,
          content: {
            items: [
              { value: '1.240',   label: 'Bereits angemeldet',  description: '' },
              { value: '40%',     label: 'Early-Bird-Rabatt',   description: '' },
              { value: 'Q1 2025', label: 'Launch geplant',      description: '' },
            ],
          },
          styling: S.custom('#1e293b', '#f1f5f9'),
        },
      ],
    }],
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  BRANCHEN-TEMPLATES (8)                              ║
  // ║  Fertig ausgefüllt — minimal anpassen               ║
  // ╚══════════════════════════════════════════════════════╝

  // ── FRISEUR ──────────────────────────────────────────

  {
    name:        'Branche — Friseur & Kosmetik',
    description: 'Fertig ausgefüllte Website für Friseursalons, Kosmetik und Nagelstudios',
    category:    'friseur',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#be185d', secondary: '#9d174d', accent: '#fce7f3', background: '#fff0f7', text: '#1f2937' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Ihr Friseur in Musterstadt',
              subheading: 'Haarschnitte, Farbe & Styling — für Damen, Herren und Kinder. Termin online buchen.',
              buttonText: 'Termin online buchen',
              buttonLink: '/termin',
            },
            styling: S.primary('#be185d'),
          },
          {
            name: 'Leistungen', type: 'services', order: 1,
            content: {
              heading: 'Unsere Preisliste',
              items: [
                { icon: '✂️', title: 'Damenschnitt',          description: 'Waschen, schneiden, föhnen',      price: 'ab 45€' },
                { icon: '✂️', title: 'Herrenschnitt',         description: 'Waschen, schneiden, stylen',      price: 'ab 28€' },
                { icon: '🎨', title: 'Coloration',            description: 'Ansatz oder komplett',            price: 'ab 55€' },
                { icon: '💆', title: 'Strähnen / Balayage',   description: 'Folien oder Freehand',            price: 'ab 80€' },
                { icon: '✨', title: 'Hochzeitsstyling',       description: 'Inkl. Probestyling',              price: 'ab 120€' },
                { icon: '👧', title: 'Kinderschnitt',          description: 'Bis 12 Jahre',                   price: 'ab 18€' },
              ],
            },
          },
          {
            name: 'Galerie', type: 'gallery', order: 2,
            content: {
              heading: 'Unsere Arbeiten',
              images: [
                { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', alt: 'Balayage' },
                { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', alt: 'Coloration' },
                { url: 'https://images.unsplash.com/photo-1595499176693-10f0fc3e6e48?w=600', alt: 'Styling' },
              ],
            },
          },
          {
            name: 'Über uns', type: 'about', order: 3,
            content: {
              heading: 'Salon Bella Musterstadt',
              text: '<p>Seit 2008 verwöhnen wir unsere Kunden im Herzen von Musterstadt. Unser 5-köpfiges Team aus zertifizierten Friseurmeistern steht für Qualität, Beratung auf Augenhöhe und aktuelle Trends. Alle unsere Produkte sind paraben- und sulfatfrei.</p>',
            },
          },
          {
            name: 'Stimmen', type: 'testimonials', order: 4,
            content: {
              heading: 'Das sagen unsere Kunden',
              items: [
                { title: 'Sandra H.', subtitle: '⭐⭐⭐⭐⭐ — Google Review', description: 'Seit Jahren mein Lieblingssalon. Die Beratung ist top, das Ergebnis immer besser als erwartet.' },
                { title: 'Thomas B.', subtitle: '⭐⭐⭐⭐⭐ — Google Review', description: 'Endlich ein Friseur der zuhört. Mein Schnitt sitzt perfekt.' },
              ],
            },
          },
          {
            name: 'Newsletter', type: 'contact', order: 5,
            content: {
              heading:     'Aktionen & Angebote',
              subheading:  'Keine Werbung — nur exklusive Angebote für Stammkunden.',
              buttonText:  'Anmelden',
              isNewsletter: true,
            },
            styling: S.muted(),
          },
        ],
      },
      {
        name: 'Termin buchen', slug: '/termin', isHomepage: false, order: 1,
        sections: [{
          name: 'Terminbuchung', type: 'contact', order: 0,
          content: {
            heading:    'Termin online anfragen',
            subheading: 'Wähle deine Leistung, deinen Wunschtermin und deinen Stylisten.',
            buttonText: 'Termin anfragen',
          },
        }],
      },
      {
        name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 2,
        sections: [{
          name: 'Kontakt & Öffnungszeiten', type: 'contact', order: 0,
          content: {
            heading:    'Besuchen Sie uns',
            subheading: 'Musterstraße 12 · 12345 Musterstadt · Tel: 0123 456789\nMo–Fr: 9–19 Uhr · Sa: 9–17 Uhr',
            buttonText: 'Nachricht senden',
          },
        }],
      },
    ],
  },

  // ── ARZTPRAXIS ───────────────────────────────────────

  {
    name:        'Branche — Arztpraxis & Zahnarzt',
    description: 'Seriöse und einladende Website für Arzt-, Zahnarzt- und Therapeutenpraxen',
    category:    'arzt',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#0369a1', secondary: '#075985', accent: '#e0f2fe', background: '#f0f9ff', text: '#0c4a6e' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Praxis Dr. Müller — Allgemeinmedizin',
              subheading: 'Ihr vertrauensvoller Hausarzt in Musterstadt. Online-Terminbuchung jetzt möglich.',
              buttonText: 'Termin online buchen',
              buttonLink: '/termin',
            },
            styling: S.primary('#0369a1'),
          },
          {
            name: 'Leistungen', type: 'services', order: 1,
            content: {
              heading: 'Unsere Leistungen',
              items: [
                { icon: '🩺', title: 'Allgemeinmedizin',       description: 'Vorsorge, Diagnostik, Behandlung' },
                { icon: '💉', title: 'Impfungen',              description: 'Alle Standardimpfungen & Reiseimpfungen' },
                { icon: '📋', title: 'Vorsorgeuntersuchungen', description: 'Check-up, Krebsvorsorge, Blutbild' },
                { icon: '🏥', title: 'Hausbesuche',            description: 'Für Patienten mit eingeschränkter Mobilität' },
                { icon: '🩸', title: 'Labordiagnostik',        description: 'Blutuntersuchungen & Schnelltests' },
                { icon: '📄', title: 'Atteste & Gutachten',   description: 'Krankschreibungen, Führerschein u.a.' },
              ],
            },
          },
          {
            name: 'Über die Praxis', type: 'about', order: 2,
            content: {
              heading: 'Dr. med. Thomas Müller',
              text: '<p>Facharzt für Allgemeinmedizin mit über 20 Jahren Erfahrung. Weiterbildungen in Sportmedizin und Palliativmedizin. Ich nehme mir Zeit für meine Patienten — weil gute Medizin Vertrauen braucht.</p><p><strong>Kassenpatienten & Privatpatienten willkommen.</strong></p>',
            },
          },
          {
            name: 'Öffnungszeiten', type: 'stats', order: 3,
            content: {
              items: [
                { value: 'Mo–Mi',   label: '8–13 & 15–18 Uhr',  description: '' },
                { value: 'Do',      label: '8–13 & 15–19 Uhr',  description: '' },
                { value: 'Fr',      label: '8–13 Uhr',           description: '' },
              ],
            },
            styling: S.muted(),
          },
          {
            name: 'FAQ', type: 'faq', order: 4,
            content: {
              heading: 'Häufige Fragen',
              items: [
                { title: 'Nehmen Sie neue Patienten an?',          description: 'Ja, wir freuen uns über neue Patienten. Bitte bringen Sie bei Ihrem ersten Besuch Ihre Krankenversichertenkarte mit.' },
                { title: 'Wie buche ich einen Termin online?',     description: 'Nutzen Sie unser Online-Buchungsformular oder rufen Sie uns an: 0123 456789.' },
                { title: 'Was tue ich in einem Notfall?',          description: 'Außerhalb der Sprechzeiten wenden Sie sich an den ärztlichen Bereitschaftsdienst: 116 117.' },
              ],
            },
          },
        ],
      },
      {
        name: 'Termin buchen', slug: '/termin', isHomepage: false, order: 1,
        sections: [{
          name: 'Terminanfrage', type: 'contact', order: 0,
          content: {
            heading:    'Termin online anfragen',
            subheading: 'Nennen Sie uns Ihr Anliegen und Ihren Wunschtermin. Wir bestätigen innerhalb von 2 Stunden.',
            buttonText: 'Termin anfragen',
          },
        }],
      },
    ],
  },

  // ── RESTAURANT ────────────────────────────────────────

  {
    name:        'Branche — Restaurant & Café',
    description: 'Appetitliche Website für Restaurants, Cafés und Bistros mit Menü und Reservierung',
    category:    'restaurant',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#92400e', secondary: '#78350f', accent: '#fde68a', background: '#fffbeb', text: '#1c1917' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Ristorante Bella Italia',
              subheading: 'Authentische italienische Küche — mit Liebe zubereitet seit 1994. Tisch reservieren.',
              buttonText: 'Tisch reservieren',
              buttonLink: '/reservierung',
            },
            styling: S.primary('#92400e'),
          },
          {
            name: 'Über uns', type: 'about', order: 1,
            content: {
              heading: 'La Famiglia',
              text: '<p>Willkommen in unserem Ristorante — einem Stück Italien mitten in Musterstadt. Seit 1994 kochen wir nach den Originalrezepten meiner Nonna aus Neapel. Frische Zutaten, echte Pasta, hausgemachtes Tiramisu. <strong>Cucina vera.</strong></p>',
            },
          },
          {
            name: 'Speisekarte', type: 'services', order: 2,
            content: {
              heading: 'Unsere Favoriten',
              items: [
                { icon: '🍕', title: 'Pizza Margherita',     description: 'Tomaten, Mozzarella, Basilikum',         price: '12,90€' },
                { icon: '🍕', title: 'Pizza Prosciutto',     description: 'Tomaten, Mozzarella, Schinken, Rucola',  price: '15,90€' },
                { icon: '🍝', title: 'Spaghetti Carbonara',  description: 'Guanciale, Ei, Pecorino, Pfeffer',       price: '14,90€' },
                { icon: '🍝', title: 'Penne all\'Arrabbiata', description: 'Tomaten, Chili, Knoblauch, Basilikum',  price: '12,90€' },
                { icon: '🥩', title: 'Saltimbocca alla Romana', description: 'Kalbfleisch, Salbei, Parma-Schinken', price: '22,90€' },
                { icon: '🍮', title: 'Tiramisù',              description: 'Hausgemacht nach Nonna-Rezept',         price: '7,50€' },
              ],
            },
          },
          {
            name: 'Galerie', type: 'gallery', order: 3,
            content: {
              heading: 'Bilder aus unserem Restaurant',
              images: [
                { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', alt: 'Gerichte' },
                { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', alt: 'Ambiente' },
                { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600', alt: 'Pizza' },
              ],
            },
          },
          {
            name: 'Stimmen', type: 'testimonials', order: 4,
            content: {
              heading: 'Was unsere Gäste sagen',
              items: [
                { title: 'Familie Weber', subtitle: '⭐⭐⭐⭐⭐ — TripAdvisor', description: 'Das beste Tiramisu in der ganzen Stadt! Wir kommen seit 10 Jahren hierher und es wird immer besser.' },
                { title: 'Marcus K.',     subtitle: '⭐⭐⭐⭐⭐ — Google',      description: 'Authentisch, herzlich, lecker. Wie bei Mamas daheim — nur besser.' },
              ],
            },
          },
          {
            name: 'Öffnungszeiten', type: 'stats', order: 5,
            content: {
              items: [
                { value: 'Di–Fr',   label: '12–14 & 18–22 Uhr', description: '' },
                { value: 'Sa–So',   label: '12–22 Uhr',          description: '' },
                { value: 'Mo',      label: 'Ruhetag',             description: '' },
              ],
            },
            styling: S.muted(),
          },
        ],
      },
      {
        name: 'Reservierung', slug: '/reservierung', isHomepage: false, order: 1,
        sections: [{
          name: 'Tisch reservieren', type: 'contact', order: 0,
          content: {
            heading:    'Tisch reservieren',
            subheading: 'Datum, Uhrzeit, Personenanzahl und ggf. besondere Wünsche — wir bestätigen innerhalb von 2 Stunden.',
            buttonText: 'Reservierung anfragen',
          },
        }],
      },
      {
        name: 'Menü', slug: '/menu', isHomepage: false, order: 2,
        sections: [
          {
            name: 'Vorspeisen', type: 'services', order: 0,
            content: {
              heading: 'Vorspeisen',
              items: [
                { icon: '🧀', title: 'Bruschetta al Pomodoro', description: 'Geröstetes Brot, Tomaten, Knoblauch, Basilikum', price: '7,90€' },
                { icon: '🥗', title: 'Insalata Mista',         description: 'Gemischter Salat mit Olivenöl-Dressing',        price: '8,50€' },
              ],
            },
          },
          {
            name: 'Hauptgerichte', type: 'services', order: 1,
            content: {
              heading: 'Pasta & Pizza',
              items: [
                { icon: '🍕', title: 'Pizza Quattro Stagioni', description: 'Artischocken, Schinken, Champignons, Oliven', price: '16,90€' },
                { icon: '🍝', title: 'Rigatoni al Ragù',      description: 'Hausgemachtes Bolognese, Parmesan',           price: '15,90€' },
                { icon: '🍝', title: 'Gnocchi al Gorgonzola', description: 'Hausgemachte Gnocchi, Gorgonzola-Sauce',     price: '14,90€' },
              ],
            },
          },
        ],
      },
    ],
  },

  // ── FITNESS & YOGA ───────────────────────────────────

  {
    name:        'Branche — Fitnessstudio & Yoga',
    description: 'Motivierende Website für Fitnessstudios, Yoga-Studios und Personal Trainer',
    category:    'fitness',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#16a34a', secondary: '#15803d', accent: '#d1fae5', background: '#f0fdf4', text: '#14532d' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Dein Körper. Dein Ziel. Unsere Unterstützung.',
              subheading: 'FitLife Studio Musterstadt — modernes Training, persönliche Betreuung, echte Ergebnisse.',
              buttonText: 'Kostenlos reinschnuppern',
              buttonLink: '/probetraining',
            },
            styling: S.primary('#16a34a'),
          },
          {
            name: 'Angebote', type: 'services', order: 1,
            content: {
              heading: 'Unser Angebot',
              items: [
                { icon: '💪', title: 'Gerätetraining',       description: '800m² Trainingsfläche, modernste Geräte' },
                { icon: '🧘', title: 'Yoga & Pilates',       description: '20+ Kurse pro Woche für alle Levels' },
                { icon: '🏋️', title: 'Gruppentraining',     description: 'HIIT, Zumba, Spinning und mehr' },
                { icon: '👤', title: 'Personal Training',    description: '1:1 Betreuung für maximale Ergebnisse' },
                { icon: '🥗', title: 'Ernährungsberatung',  description: 'Dein individueller Ernährungsplan' },
                { icon: '♨️', title: 'Sauna & Wellness',    description: 'Entspannung nach dem Training' },
              ],
            },
          },
          {
            name: 'Mitgliedschaft', type: 'pricing', order: 2,
            content: {
              heading: 'Mitgliedschaft',
              items: [
                {
                  title:       'Flex',
                  price:       '39€/Monat',
                  description: 'Monatlich kündbar',
                  features:    ['Gerätetraining', 'Gruppentraining', 'Sauna & Umkleide', 'App-Zugang'],
                  buttonText:  'Jetzt anmelden',
                },
                {
                  title:       'Premium',
                  price:       '59€/Monat',
                  description: 'Monatlich kündbar',
                  features:    ['Alles in Flex', '2x Personal Training', 'Ernährungsberatung', 'Gäste-Tagespass'],
                  buttonText:  'Premium starten',
                  highlighted: true,
                },
              ],
            },
          },
          {
            name: 'Ergebnisse', type: 'testimonials', order: 3,
            content: {
              heading: 'Echte Ergebnisse',
              items: [
                { title: 'Nicole F.', subtitle: 'Mitglied seit 8 Monaten', description: 'Minus 12 kg und so fit wie seit Jahren nicht mehr. Das Team ist unfassbar motivierend.' },
                { title: 'Stefan B.', subtitle: 'Mitglied seit 1 Jahr',    description: 'Ich trainiere 4x pro Woche und fühle mich wie ein anderer Mensch. Absolut empfehlenswert.' },
              ],
            },
          },
          {
            name: 'Newsletter', type: 'contact', order: 4,
            content: {
              heading:     'Kostenloser Probetraining',
              subheading:  'Trag dich ein und wir melden uns für deinen kostenlosen Schnuppertag.',
              buttonText:  'Probetraining anfragen',
              isNewsletter: false,
            },
            styling: S.primary('#16a34a'),
          },
        ],
      },
      {
        name: 'Probetraining', slug: '/probetraining', isHomepage: false, order: 1,
        sections: [{
          name: 'Probetraining buchen', type: 'contact', order: 0,
          content: {
            heading:    'Probetraining vereinbaren',
            subheading: 'Dein erstes Training ist kostenlos. Überzeuge dich selbst — ohne Verpflichtung.',
            buttonText: 'Jetzt anfragen',
          },
        }],
      },
      {
        name: 'Kurse', slug: '/kurse', isHomepage: false, order: 2,
        sections: [{
          name: 'Kursplan', type: 'features', order: 0,
          content: {
            heading: 'Wochenkursplan',
            items: [
              { icon: '🧘', title: 'Yoga (alle Levels)', description: 'Mo & Mi 18:30 Uhr · Sa 10:00 Uhr' },
              { icon: '🔥', title: 'HIIT',               description: 'Di & Do 19:00 Uhr · Sa 9:00 Uhr' },
              { icon: '💃', title: 'Zumba',              description: 'Mi 19:30 Uhr · So 11:00 Uhr' },
              { icon: '🚴', title: 'Spinning',           description: 'Di & Do 6:30 Uhr · Fr 18:00 Uhr' },
            ],
          },
        }],
      },
    ],
  },

  // ── IMMOBILIEN ────────────────────────────────────────

  {
    name:        'Branche — Immobilienmakler',
    description: 'Vertrauenserweckende Website für Immobilienmakler und -agenturen',
    category:    'immobilien',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
    isPremium:   true,
    settings: {
      colors: { primary: '#1e3a5f', secondary: '#1e40af', accent: '#dbeafe', background: '#f8faff', text: '#1e293b' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Ihr Immobilienexperte in Musterstadt',
              subheading: 'Kaufen, verkaufen, vermieten — wir begleiten Sie von der ersten Besichtigung bis zur Schlüsselübergabe.',
              buttonText: 'Kostenlose Bewertung anfragen',
              buttonLink: '/bewertung',
            },
            styling: S.primary('#1e3a5f'),
          },
          {
            name: 'Zahlen', type: 'stats', order: 1,
            content: {
              items: [
                { value: '320+',  label: 'Vermittlungen',         description: 'Erfolgreich abgeschlossen' },
                { value: '18',    label: 'Jahre Erfahrung',       description: 'In der Region' },
                { value: '98%',   label: 'Weiterempfehlung',      description: 'Unserer Kunden' },
              ],
            },
            styling: S.muted(),
          },
          {
            name: 'Leistungen', type: 'services', order: 2,
            content: {
              heading: 'Unsere Leistungen',
              items: [
                { icon: '🏡', title: 'Immobilienverkauf',        description: 'Marktgerechte Preisfindung, professionelle Vermarktung, sichere Abwicklung' },
                { icon: '🔑', title: 'Immobilienkauf',           description: 'Wir finden Ihre Traumimmobilie — diskret und effizient' },
                { icon: '📋', title: 'Vermietung',               description: 'Seriöse Mieterauswahl, rechtssichere Mietverträge' },
                { icon: '📊', title: 'Kostenlose Bewertung',     description: 'Marktpreisanalyse für Ihre Immobilie — unverbindlich' },
              ],
            },
          },
          {
            name: 'Über uns', type: 'about', order: 3,
            content: {
              heading: 'Markus Weber Immobilien',
              text: '<p>Als gebürtiger Musterstädter kenne ich den lokalen Immobilienmarkt seit über 18 Jahren. Mein Versprechen: Transparenz, Ehrlichkeit und ein Preis der stimmt. Kein Druck, keine versteckten Kosten — nur professionelle Beratung.</p>',
            },
          },
          {
            name: 'Stimmen', type: 'testimonials', order: 4,
            content: {
              heading: 'Das sagen unsere Kunden',
              items: [
                { title: 'Familie Schneider', subtitle: 'Käufer 2023',    description: 'Herr Weber hat uns unser Traumhaus gefunden. Professionell, geduldig und immer erreichbar.' },
                { title: 'Petra L.',           subtitle: 'Verkäuferin 2023', description: 'Innerhalb von 3 Wochen verkauft — zum Wunschpreis. Absolute Empfehlung!' },
              ],
            },
          },
          {
            name: 'CTA', type: 'cta', order: 5,
            content: {
              heading:    'Wie viel ist Ihre Immobilie wert?',
              text:       'Kostenlose und unverbindliche Marktwertanalyse — in der Regel innerhalb von 48 Stunden.',
              buttonText: 'Kostenlose Bewertung anfragen',
              buttonLink: '/bewertung',
            },
            styling: S.primary('#1e3a5f'),
          },
        ],
      },
      {
        name: 'Bewertung', slug: '/bewertung', isHomepage: false, order: 1,
        sections: [{
          name: 'Bewertungsanfrage', type: 'contact', order: 0,
          content: {
            heading:    'Kostenlose Immobilienbewertung',
            subheading: 'Beschreiben Sie Ihre Immobilie — wir melden uns innerhalb von 24 Stunden mit einer ersten Einschätzung.',
            buttonText: 'Bewertung anfragen',
          },
        }],
      },
      {
        name: 'Über uns', slug: '/ueber-uns', isHomepage: false, order: 2,
        sections: [
          { name: 'Story', type: 'about', order: 0, content: { heading: 'Wer wir sind', text: '<p>Weber Immobilien steht seit 2006 für verlässliche Immobilienvermittlung im Raum Musterstadt. Unser Team aus 4 erfahrenen Maklern kennt jeden Winkel der Region.</p>' } },
          { name: 'Team',  type: 'team',  order: 1, content: { heading: 'Das Team', items: [{ title: 'Markus Weber', subtitle: 'Geschäftsführer & Makler', description: '18 Jahre Erfahrung, zertifizierter Immobilienmakler (IHK)' }, { title: 'Sandra Koch', subtitle: 'Maklerin', description: 'Spezialistin für Wohnimmobilien & Neubauprojekte' }] } },
        ],
      },
      {
        name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 3,
        sections: [{
          name: 'Kontakt', type: 'contact', order: 0,
          content: { heading: 'Kontakt aufnehmen', subheading: 'Musterstraße 45 · 12345 Musterstadt · Tel: 0123 456789', buttonText: 'Nachricht senden' },
        }],
      },
    ],
  },

  // ── RECHTSANWALT ──────────────────────────────────────

  {
    name:        'Branche — Rechtsanwalt & Kanzlei',
    description: 'Seriöse und kompetente Website für Anwaltskanzleien und Steuerberater',
    category:    'kanzlei',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#1c2e4a', secondary: '#1e3a5f', accent: '#e2e8f0', background: '#f8faff', text: '#1e293b' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Rechtsanwaltskanzlei Müller & Partner',
              subheading: 'Kompetente Rechtsberatung für Privatpersonen und Unternehmen — persönlich, verlässlich, ergebnisorientiert.',
              buttonText: 'Erstberatung vereinbaren',
              buttonLink: '/kontakt',
            },
            styling: S.dark('#1c2e4a'),
          },
          {
            name: 'Rechtsgebiete', type: 'services', order: 1,
            content: {
              heading: 'Unsere Rechtsgebiete',
              items: [
                { icon: '⚖️', title: 'Arbeitsrecht',          description: 'Kündigung, Abmahnung, Abfindung, Diskriminierung' },
                { icon: '🏠', title: 'Mietrecht',             description: 'Mieterhöhung, Kündigung, Kaution, Nebenkosten' },
                { icon: '👨‍👩‍👧', title: 'Familienrecht',    description: 'Scheidung, Unterhalt, Sorgerecht, Erbrecht' },
                { icon: '🚗', title: 'Verkehrsrecht',         description: 'Unfallregulierung, Führerschein, Bußgeld' },
                { icon: '💼', title: 'Vertragsrecht',         description: 'Vertragsgestaltung, -prüfung, -streitigkeiten' },
                { icon: '🏢', title: 'Gesellschaftsrecht',    description: 'Gründung, Umstrukturierung, Gesellschafterstreit' },
              ],
            },
          },
          {
            name: 'Über die Kanzlei', type: 'about', order: 2,
            content: {
              heading: 'Ihre Anwälte in Musterstadt',
              text: '<p>Seit 2001 beraten und vertreten wir Mandanten in allen rechtlichen Belangen. Unser Team aus 4 spezialisierten Rechtsanwälten steht für kompetente Beratung, transparente Kosten und persönliches Engagement. Erstberatung: <strong>90 Minuten für 90€</strong>.</p>',
            },
          },
          {
            name: 'Team', type: 'team', order: 3,
            content: {
              heading: 'Ihre Anwälte',
              items: [
                { title: 'RA Dr. Thomas Müller',  subtitle: 'Fachanwalt für Arbeitsrecht',   description: 'Zulassung seit 2001 · Mitglied DAV' },
                { title: 'RAin Sandra Partner',   subtitle: 'Fachanwältin für Familienrecht', description: 'Zulassung seit 2008 · Mediatorin' },
              ],
            },
          },
          {
            name: 'FAQ', type: 'faq', order: 4,
            content: {
              heading: 'Häufige Fragen',
              items: [
                { title: 'Was kostet eine Erstberatung?',        description: '90 Minuten Erstberatung für 90€ (inkl. MwSt.). Die Kosten werden auf spätere Mandate angerechnet.' },
                { title: 'Übernimmt meine Rechtsschutzversicherung?', description: 'In den meisten Fällen ja. Wir prüfen kostenfrei ob Ihre Versicherung greift.' },
                { title: 'Sind Telefon-Beratungen möglich?',    description: 'Ja, Erstberatungen sind auch telefonisch oder per Videocall möglich.' },
              ],
            },
          },
        ],
      },
      {
        name: 'Kontakt', slug: '/kontakt', isHomepage: false, order: 1,
        sections: [{
          name: 'Mandantenanfrage', type: 'contact', order: 0,
          content: {
            heading:    'Erstberatung vereinbaren',
            subheading: 'Schildern Sie kurz Ihr Anliegen — wir melden uns innerhalb von 24 Stunden und vereinbaren einen Termin.',
            buttonText: 'Anfrage senden',
          },
        }],
      },
      {
        name: 'Rechtsgebiete', slug: '/rechtsgebiete', isHomepage: false, order: 2,
        sections: [{
          name: 'Alle Rechtsgebiete', type: 'services', order: 0,
          content: {
            heading: 'Alle Rechtsgebiete im Detail',
            items: [
              { icon: '⚖️', title: 'Arbeitsrecht', description: 'Wir vertreten Arbeitnehmer und Arbeitgeber bei Kündigungsschutzklagen, Abmahnungen, Abfindungsverhandlungen und Diskriminierungsfällen.' },
              { icon: '🏠', title: 'Mietrecht',    description: 'Beratung bei Mieterhöhungen, ordentlicher und außerordentlicher Kündigung, Nebenkostenabrechnungen und Wohnungsmängeln.' },
            ],
          },
        }],
      },
    ],
  },

  // ── HANDWERKER ────────────────────────────────────────

  {
    name:        'Branche — Handwerker & Handwerksbetrieb',
    description: 'Solide Website für Elektriker, Maler, Klempner und andere Handwerksbetriebe',
    category:    'handwerk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#b45309', secondary: '#92400e', accent: '#fef3c7', background: '#fffbeb', text: '#1c1917' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Elektro Müller — Ihr Elektriker in Musterstadt',
              subheading: 'Zuverlässig, pünktlich, sauber. Für Privat und Gewerbe — seit über 25 Jahren.',
              buttonText: 'Kostenlos anfragen',
              buttonLink: '/anfrage',
            },
            styling: S.primary('#b45309'),
          },
          {
            name: 'Leistungen', type: 'services', order: 1,
            content: {
              heading: 'Unsere Leistungen',
              items: [
                { icon: '💡', title: 'Elektroinstallation',    description: 'Neuinstallation, Sanierung, Erweiterung' },
                { icon: '🔌', title: 'Smart Home',             description: 'KNX, Loxone, Philips Hue — alles vernetzt' },
                { icon: '🔋', title: 'Photovoltaik & Batterie', description: 'Beratung, Installation, Wartung' },
                { icon: '🚿', title: 'Badezimmer',             description: 'Elektrik im Nassbereich, GFCI-Absicherung' },
                { icon: '🏭', title: 'Gewerbe & Industrie',   description: 'Betriebselektrik, Schaltschränke, Wartung' },
                { icon: '🛠️', title: 'Reparaturen',           description: 'Kurzschluss, Ausfall, Fehlersuche — 24h Notdienst' },
              ],
            },
          },
          {
            name: 'Über uns', type: 'about', order: 2,
            content: {
              heading: 'Meisterbetrieb seit 1999',
              text: '<p>Elektro Müller ist ein inhabergeführter Meisterbetrieb mit 8 Mitarbeitern. Wir arbeiten ausschließlich nach DIN VDE-Normen und bieten 5 Jahre Gewährleistung auf alle unsere Installationen. Notdienst 24/7 — auch an Wochenenden und Feiertagen.</p>',
            },
          },
          {
            name: 'Zahlen', type: 'stats', order: 3,
            content: {
              items: [
                { value: '25+', label: 'Jahre Erfahrung',  description: '' },
                { value: '8',   label: 'Mitarbeiter',      description: '' },
                { value: '24/7', label: 'Notdienst',       description: '' },
              ],
            },
            styling: S.muted(),
          },
          {
            name: 'Stimmen', type: 'testimonials', order: 4,
            content: {
              heading: 'Kundenstimmen',
              items: [
                { title: 'Klaus S.', subtitle: 'Privatkunde',    description: 'Pünktlich, sauber und fair im Preis. Die Werkzeuge werden immer mitgebracht, nie ein zweiter Termin nötig.' },
                { title: 'Bau GmbH', subtitle: 'Gewerbekunde',  description: 'Verlässlicher Partner für alle unsere Bauprojekte. Immer termingerecht und nach Norm.' },
              ],
            },
          },
        ],
      },
      {
        name: 'Anfrage', slug: '/anfrage', isHomepage: false, order: 1,
        sections: [{
          name: 'Kostenlose Anfrage', type: 'contact', order: 0,
          content: {
            heading:    'Kostenlos anfragen',
            subheading: 'Beschreiben Sie kurz Ihr Vorhaben — wir melden uns innerhalb von 2 Stunden und vereinbaren einen Termin.',
            buttonText: 'Anfrage senden',
          },
        }],
      },
    ],
  },

  // ── COACHING / THERAPIE ───────────────────────────────

  {
    name:        'Branche — Therapeut & Heilpraktiker',
    description: 'Einfühlsame Website für Therapeuten, Heilpraktiker und Naturheilkunde',
    category:    'therapie',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    isPremium:   false,
    settings: {
      colors: { primary: '#0d9488', secondary: '#0f766e', accent: '#ccfbf1', background: '#f0fdfa', text: '#134e4a' },
      fonts:  { heading: 'Inter', body: 'Inter' },
    },
    pages: [
      {
        name: 'Startseite', slug: '/', isHomepage: true, order: 0,
        sections: [
          {
            name: 'Hero', type: 'hero', order: 0,
            content: {
              heading:    'Praxis für Naturheilkunde & Psychotherapie',
              subheading: 'Sandra Koch · Heilpraktikerin & systemische Therapeutin · Musterstadt',
              buttonText: 'Erstgespräch vereinbaren',
              buttonLink: '/termin',
            },
            styling: S.primary('#0d9488'),
          },
          {
            name: 'Angebote', type: 'services', order: 1,
            content: {
              heading: 'Mein Angebot',
              items: [
                { icon: '🧠', title: 'Psychotherapie',         description: 'Systemische Therapie, Gesprächstherapie, Traumabegleitung', price: '90€ / 50 Min.' },
                { icon: '🌿', title: 'Naturheilkunde',         description: 'Homöopathie, Akupunktur, Phytotherapie',                    price: 'ab 75€' },
                { icon: '🧘', title: 'Stressmanagement',       description: 'MBSR, Achtsamkeitstraining, Burnout-Prävention',            price: '80€ / 50 Min.' },
                { icon: '👫', title: 'Paarberatung',           description: 'Kommunikation, Konflikte, Neustart',                       price: '110€ / 60 Min.' },
              ],
            },
          },
          {
            name: 'Über mich', type: 'about', order: 2,
            content: {
              heading: 'Sandra Koch — Heilpraktikerin',
              text: '<p>Ich begleite Menschen in herausfordernden Lebensphasen — mit Empathie, Fachwissen und ganzheitlichem Blick. Meine Ausbildungen umfassen systemische Therapie, Traumapädagogik und Naturheilkunde. Der erste Schritt ist oft der schwerste — ich bin da.</p>',
            },
          },
          {
            name: 'FAQ', type: 'faq', order: 3,
            content: {
              heading: 'Häufige Fragen',
              items: [
                { title: 'Übernimmt die Krankenkasse die Kosten?',  description: 'Als Heilpraktikerin rechne ich privat ab. Viele private Krankenversicherungen und Zusatzversicherungen übernehmen die Kosten anteilig.' },
                { title: 'Wie läuft das Erstgespräch ab?',          description: '30 Minuten kostenlos und unverbindlich — wir schauen gemeinsam ob mein Angebot zu Ihrem Anliegen passt.' },
                { title: 'Bieten Sie auch Online-Sitzungen an?',    description: 'Ja, alle Therapieformen sind auch per Videocall möglich — für maximale Flexibilität.' },
              ],
            },
          },
          {
            name: 'CTA', type: 'cta', order: 4,
            content: {
              heading:    'Der erste Schritt beginnt mit einem Gespräch.',
              text:       '30 Minuten Kennenlerngespräch — kostenlos, vertraulich, unverbindlich.',
              buttonText: 'Termin vereinbaren',
              buttonLink: '/termin',
            },
            styling: S.primary('#0d9488'),
          },
        ],
      },
      {
        name: 'Termin', slug: '/termin', isHomepage: false, order: 1,
        sections: [{
          name: 'Termin vereinbaren', type: 'contact', order: 0,
          content: {
            heading:    'Erstgespräch vereinbaren',
            subheading: 'Schreiben Sie mir — ich melde mich innerhalb von 24 Stunden für einen Wunschtermin.',
            buttonText: 'Nachricht senden',
          },
        }],
      },
    ],
  },

];

// ==================== MAIN ====================

async function main() {
  const force   = process.argv.includes('--force');
  const catArg  = process.argv.find(a => a.startsWith('--category='))?.split('=')[1];
  const nameArg = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];

  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  QuickPages Templates v4 — Landing + Branchen     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let templates = TEMPLATES;
  if (catArg)  templates = templates.filter(t => t.category === catArg);
  if (nameArg) templates = templates.filter(t => t.name.toLowerCase().includes(nameArg.toLowerCase()));
  if (force)   console.log('🔄 --force aktiv — vorhandene Templates werden überschrieben\n');

  const cats = [...new Set(templates.map(t => t.category))];
  const catEmojis: Record<string, string> = {
    landing: '🚀', friseur: '✂️', arzt: '🩺', restaurant: '🍝',
    fitness: '💪', immobilien: '🏠', kanzlei: '⚖️', handwerk: '🔧', therapie: '🧘',
  };

  for (const cat of cats) {
    console.log(`\n${catEmojis[cat] ?? '📦'}  ${cat.toUpperCase()}`);
    for (const tpl of templates.filter(t => t.category === cat)) {
      await createTemplate(tpl, force);
    }
  }

  // Gesamtübersicht
  const total = await db.select({ id: wbGlobalTemplates.id }).from(wbGlobalTemplates);
  console.log('\n' + '═'.repeat(52));
  console.log(`\n📊 Gesamt in der DB: ${total.length} Templates\n`);

  await pool.end();
}

main().catch(err => { console.error('❌', err); process.exit(1); });