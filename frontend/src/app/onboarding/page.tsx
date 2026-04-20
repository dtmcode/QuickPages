'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';

// ==================== TYPES ====================

type Goal = 'leads' | 'shop' | 'booking' | 'portfolio' | 'blog' | 'restaurant';
type Industry =
  | 'handwerk' | 'gastronomie' | 'einzelhandel' | 'dienstleistung'
  | 'gesundheit' | 'bildung' | 'immobilien' | 'technologie' | 'kreativ' | 'sonstiges';

interface DayHours { open: boolean; from: string; to: string; }
interface OpeningHours {
  monday: DayHours; tuesday: DayHours; wednesday: DayHours; thursday: DayHours;
  friday: DayHours; saturday: DayHours; sunday: DayHours;
}

interface WizardData {
  companyName: string;
  industry: Industry;
  description: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
  contactEmail: string;
  openingHours: OpeningHours;
  primaryColor: string;
  logoUrl: string;
  fontFamily: string;
  goal: Goal | null;
  globalTemplateId: string;
}

interface GlobalTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
}

interface WbSection { id: string; type: string; content: Record<string, unknown>; }
interface WbPage { id: string; name: string; isHomepage: boolean; sections: WbSection[]; }

// ==================== PROGRESS PERSISTENCE ====================

const STORAGE_KEY = 'onboarding_progress';

interface SavedProgress {
  step: number;
  data: WizardData;
  completedSteps: number[];
  savedAt: string;
}

function saveProgress(step: number, data: WizardData, completedSteps: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data, completedSteps, savedAt: new Date().toISOString() }));
  } catch {}
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearOnboardingProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ==================== CONSTANTS ====================

const DEFAULT_HOURS: OpeningHours = {
  monday:    { open: true,  from: '08:00', to: '16:30' },
  tuesday:   { open: true,  from: '08:00', to: '16:30' },
  wednesday: { open: true,  from: '08:00', to: '16:30' },
  thursday:  { open: true,  from: '08:00', to: '16:30' },
  friday:    { open: true,  from: '08:00', to: '16:30' },
  saturday:  { open: false, from: '09:00', to: '14:00' },
  sunday:    { open: false, from: '09:00', to: '14:00' },
};

const INITIAL_DATA: WizardData = {
  companyName: '', industry: 'dienstleistung', description: '',
  address: '', zip: '', city: '', phone: '', contactEmail: '',
  openingHours: DEFAULT_HOURS,
  primaryColor: '#3b82f6', logoUrl: '', fontFamily: "'Inter', sans-serif",
  goal: null, globalTemplateId: '',
};

const COLOR_PRESETS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#10b981', '#ef4444', '#0ea5e9', '#6366f1',
  '#f59e0b', '#84cc16', '#14b8a6', '#1f2937',
];

const FONT_OPTIONS = [
  { label: 'Inter',            value: "'Inter', sans-serif",           google: 'Inter:wght@400;600;700' },
  { label: 'Poppins',          value: "'Poppins', sans-serif",         google: 'Poppins:wght@400;600;700' },
  { label: 'Montserrat',       value: "'Montserrat', sans-serif",      google: 'Montserrat:wght@400;600;700' },
  { label: 'Playfair Display', value: "'Playfair Display', serif",     google: 'Playfair+Display:wght@400;700' },
  { label: 'Raleway',          value: "'Raleway', sans-serif",         google: 'Raleway:wght@400;600;700' },
  { label: 'Lato',             value: "'Lato', sans-serif",            google: 'Lato:wght@400;700' },
];

const GOALS: { id: Goal; label: string; icon: string; description: string; categories: string[] }[] = [
  { id: 'leads',      label: 'Kunden gewinnen',    icon: '🎯', description: 'Anfragen & Kontakte',    categories: ['business', 'dienstleistung', 'leads'] },
  { id: 'shop',       label: 'Produkte verkaufen', icon: '🛒', description: 'Online-Shop aufbauen',   categories: ['shop', 'ecommerce', 'retail'] },
  { id: 'booking',    label: 'Termine buchen',     icon: '📅', description: 'Buchungssystem',         categories: ['booking', 'service', 'gesundheit'] },
  { id: 'portfolio',  label: 'Portfolio zeigen',   icon: '🎨', description: 'Arbeiten präsentieren',  categories: ['portfolio', 'kreativ', 'creative'] },
  { id: 'blog',       label: 'Blog / Inhalte',     icon: '📝', description: 'Artikel veröffentlichen', categories: ['blog', 'content', 'news'] },
  { id: 'restaurant', label: 'Restaurant / Café',  icon: '🍽️', description: 'Speisekarte & Tische',   categories: ['restaurant', 'gastronomie', 'food'] },
];

const INDUSTRIES: { value: Industry; label: string; categories: string[] }[] = [
  { value: 'handwerk',       label: 'Handwerk & Bau',         categories: ['handwerk', 'business', 'service'] },
  { value: 'gastronomie',    label: 'Gastronomie & Hotel',    categories: ['restaurant', 'gastronomie', 'food'] },
  { value: 'einzelhandel',   label: 'Einzelhandel & Retail',  categories: ['shop', 'retail', 'ecommerce'] },
  { value: 'dienstleistung', label: 'Dienstleistung',         categories: ['business', 'dienstleistung', 'service'] },
  { value: 'gesundheit',     label: 'Gesundheit & Beauty',    categories: ['gesundheit', 'beauty', 'booking'] },
  { value: 'bildung',        label: 'Bildung & Coaching',     categories: ['bildung', 'education', 'blog'] },
  { value: 'immobilien',     label: 'Immobilien',             categories: ['immobilien', 'business', 'leads'] },
  { value: 'technologie',    label: 'Technologie & IT',       categories: ['tech', 'portfolio', 'business'] },
  { value: 'kreativ',        label: 'Kreativ & Design',       categories: ['portfolio', 'kreativ', 'creative'] },
  { value: 'sonstiges',      label: 'Sonstiges',              categories: [] },
];

const DAY_LABELS: { key: keyof OpeningHours; label: string }[] = [
  { key: 'monday', label: 'Mo' }, { key: 'tuesday', label: 'Di' },
  { key: 'wednesday', label: 'Mi' }, { key: 'thursday', label: 'Do' },
  { key: 'friday', label: 'Fr' }, { key: 'saturday', label: 'Sa' },
  { key: 'sunday', label: 'So' },
];

const GOAL_HERO_BUTTON: Record<Goal, string> = {
  leads: 'Jetzt anfragen', shop: 'Zum Shop', booking: 'Termin buchen',
  portfolio: 'Arbeiten ansehen', blog: 'Zum Blog', restaurant: 'Tisch reservieren',
};

const BUILD_MESSAGES = [
  'Website wird aufgebaut …',
  'Template wird geladen …',
  'Inhalte werden befüllt …',
  'Impressum & Datenschutz werden erstellt …',
  'Design wird angewendet …',
  'Fast fertig …',
];

const STEP_LABELS = ['Unternehmen', 'Design', 'Ziel', 'Template'] as const;

// ==================== LEGAL CONTENT GENERATOR ====================
// Generiert Impressum und Datenschutz mit echten Onboarding-Daten

function buildImpressumText(d: WizardData): string {
  const addr = [d.address, [d.zip, d.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const name = d.companyName || '[Firmenname]';
  const email = d.contactEmail || '[E-Mail-Adresse]';
  const phone = d.phone || '[Telefonnummer]';

  return `# Impressum

**Angaben gemäß § 5 TMG**

${name}
${d.address || '[Straße und Hausnummer]'}
${[d.zip, d.city].filter(Boolean).join(' ') || '[PLZ Ort]'}

**Kontakt:**
Telefon: ${phone}
E-Mail: ${email}

---

**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**
${name}
${addr || '[Adresse]'}

---

**Haftungsausschluss:**
Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen werden.

> ⚠️ Bitte ergänze fehlende Pflichtangaben (z.B. Handelsregisternummer, USt-IdNr.) und lasse das Impressum bei Bedarf rechtlich prüfen.`;
}

function buildDatenschutzText(d: WizardData): string {
  const name = d.companyName || '[Firmenname]';
  const email = d.contactEmail || '[E-Mail-Adresse]';
  const addr = [d.address, [d.zip, d.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  return `# Datenschutzerklärung

## 1. Verantwortlicher

${name}
${addr || '[Adresse]'}
E-Mail: ${email}

## 2. Erhebung und Verarbeitung personenbezogener Daten

Wir erheben personenbezogene Daten nur, soweit dies für die Bereitstellung unserer Dienste erforderlich ist.

**Server-Log-Dateien:**
Beim Aufruf dieser Website speichert der Hosting-Anbieter automatisch folgende Daten: IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit des Zugriffs. Diese Daten dienen ausschließlich der technischen Bereitstellung der Website.

**Kontaktformular:**
Bei Kontaktaufnahme über unser Formular werden die übermittelten Daten zur Bearbeitung Ihrer Anfrage gespeichert.

## 3. Ihre Rechte

Sie haben das Recht auf:
- **Auskunft** über Ihre gespeicherten Daten (Art. 15 DSGVO)
- **Berichtigung** unrichtiger Daten (Art. 16 DSGVO)
- **Löschung** Ihrer Daten (Art. 17 DSGVO)
- **Widerspruch** gegen die Verarbeitung (Art. 21 DSGVO)

Kontakt für Datenschutzanfragen: ${email}

## 4. Cookies

Diese Website verwendet keine Tracking-Cookies.

---

> ⚠️ Diese Datenschutzerklärung ist ein Ausgangspunkt. Bitte passe sie an deine tatsächliche Datenverarbeitung an und lasse sie bei Unsicherheiten rechtlich prüfen.`;
}

// ==================== GRAPHQL ====================

const GET_GLOBAL_TEMPLATES = gql`
  query OnboardingGlobalTemplates {
    wbGlobalTemplates { id name description thumbnailUrl category }
  }
`;

const CLONE_GLOBAL_TEMPLATE = gql`
  mutation OnboardingCloneTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) { id name }
  }
`;

const GET_PAGES_WITH_SECTIONS = gql`
  query OnboardingGetPages($templateId: String!, $tenantId: String!) {
    wbPages(templateId: $templateId, tenantId: $tenantId) { id name slug isHomepage }
  }
`;

const GET_PAGE_SECTIONS = gql`
  query OnboardingGetSections($id: String!, $tenantId: String!) {
    wbPage(id: $id, tenantId: $tenantId) { id sections { id type content } }
  }
`;

const UPDATE_SECTION = gql`
  mutation OnboardingUpdateSection($id: String!, $input: UpdateSectionInput!, $tenantId: String!) {
    updateSection(id: $id, input: $input, tenantId: $tenantId) { id }
  }
`;

const CREATE_PAGE = gql`
  mutation OnboardingCreatePage($input: CreatePageInput!, $tenantId: String!) {
    createPage(input: $input, tenantId: $tenantId) { id slug }
  }
`;

const CREATE_SECTION = gql`
  mutation OnboardingCreateSection($input: CreateSectionInput!, $tenantId: String!) {
    createSection(input: $input, tenantId: $tenantId) { id }
  }
`;

const UPDATE_TEMPLATE_SETTINGS = gql`
  mutation OnboardingUpdateTemplate($id: String!, $input: UpdateTemplateInput!, $tenantId: String!) {
    updateTemplate(id: $id, input: $input, tenantId: $tenantId) { id settings }
  }
`;

const SET_DEFAULT_TEMPLATE = gql`
  mutation OnboardingSetDefault($id: String!, $tenantId: String!) {
    setDefaultTemplate(id: $id, tenantId: $tenantId) { id isDefault }
  }
`;

const UPDATE_BRANDING = gql`
  mutation OnboardingUpdateBranding($input: UpdateBrandingInput!) {
    updateBranding(input: $input) { primaryColor logoUrl }
  }
`;

// ==================== HELPERS ====================

function buildHeroContent(data: WizardData): Record<string, unknown> {
  return {
    heading: data.companyName || 'Willkommen',
    subheading: data.description || `Ihr Partner für ${data.industry}`,
    buttonText: data.goal ? GOAL_HERO_BUTTON[data.goal] : 'Mehr erfahren',
    buttonLink: '#contact',
  };
}

function buildContactContent(data: WizardData): Record<string, unknown> {
  const hoursText = DAY_LABELS
    .filter(({ key }) => data.openingHours[key].open)
    .map(({ label, key }) => { const h = data.openingHours[key]; return `${label}: ${h.from}–${h.to}`; })
    .join(' | ');
  return {
    title: 'Kontakt aufnehmen',
    address: [data.address, `${data.zip} ${data.city}`].filter(Boolean).join(', '),
    phone: data.phone,
    email: data.contactEmail,
    openingHours: hoursText,
  };
}

function buildAboutContent(data: WizardData): Record<string, unknown> {
  return {
    title: `Über ${data.companyName || 'uns'}`,
    description: data.description || 'Hier steht eine kurze Beschreibung Ihres Unternehmens.',
  };
}

function getTemplateScore(template: GlobalTemplate, data: WizardData): number {
  if (!template.category) return 0;
  const cat = template.category.toLowerCase();
  const industry = INDUSTRIES.find(i => i.value === data.industry);
  const goal = GOALS.find(g => g.id === data.goal);
  let score = 0;
  if (industry?.categories.some(c => cat.includes(c) || c.includes(cat))) score += 2;
  if (goal?.categories.some(c => cat.includes(c) || c.includes(cat))) score += 3;
  return score;
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

// ==================== STEPS ====================

function Step1Company({ data, onChange }: { data: WizardData; onChange: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  const updateHours = useCallback((day: keyof OpeningHours, field: keyof DayHours, value: string | boolean) => {
    onChange('openingHours', { ...data.openingHours, [day]: { ...data.openingHours[day], [field]: value } });
  }, [data.openingHours, onChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Firmenname *</label>
          <input type="text" className={inputCls} placeholder="Mustermann GmbH" value={data.companyName} onChange={e => onChange('companyName', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Branche</label>
          <select className={selectCls} value={data.industry} onChange={e => onChange('industry', e.target.value as Industry)}>
            {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Kurzbeschreibung</label>
        <textarea className={inputCls} rows={3} placeholder="Was macht Ihr Unternehmen?" value={data.description} onChange={e => onChange('description', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Straße & Hausnummer</label>
        <input type="text" className={inputCls} placeholder="Musterstraße 12" value={data.address} onChange={e => onChange('address', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>PLZ</label>
          <input type="text" className={inputCls} placeholder="50667" value={data.zip} onChange={e => onChange('zip', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Stadt</label>
          <input type="text" className={inputCls} placeholder="Köln" value={data.city} onChange={e => onChange('city', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Telefon</label>
          <input type="tel" className={inputCls} placeholder="+49 221 123456" value={data.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Kontakt E-Mail</label>
          <input type="email" className={inputCls} placeholder="info@mustermann.de" value={data.contactEmail} onChange={e => onChange('contactEmail', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Öffnungszeiten</label>
        <p className="text-xs text-gray-400 mb-3">Vorausgefüllt mit Mo–Fr 08:00–16:30. Einfach anpassen.</p>
        <div className="space-y-2">
          {DAY_LABELS.map(({ key, label }) => {
            const day = data.openingHours[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 text-sm font-semibold text-gray-500">{label}</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={day.open} onChange={e => updateHours(key, 'open', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-sm text-gray-600 w-24">{day.open ? 'Geöffnet' : 'Geschlossen'}</span>
                </label>
                {day.open && (
                  <>
                    <input type="time" value={day.from} onChange={e => updateHours(key, 'from', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    <span className="text-gray-400 text-sm">bis</span>
                    <input type="time" value={day.to} onChange={e => updateHours(key, 'to', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step2Design({ data, onChange }: { data: WizardData; onChange: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  useEffect(() => {
    const font = FONT_OPTIONS.find(f => f.value === data.fontFamily);
    if (!font) return;
    const existing = document.querySelector(`link[data-font="${font.google}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
    link.setAttribute('data-font', font.google);
    document.head.appendChild(link);
  }, [data.fontFamily]);

  return (
    <div className="space-y-8">
      <div>
        <label className={labelCls}>Primärfarbe</label>
        <p className="text-xs text-gray-400 mb-3">Wird für Buttons, Links und Akzente verwendet.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COLOR_PRESETS.map(color => (
            <button key={color} type="button" onClick={() => onChange('primaryColor', color)}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-lg transition-all ${data.primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'hover:scale-105'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={data.primaryColor} onChange={e => onChange('primaryColor', e.target.value)}
            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1 bg-white" />
          <span className="text-sm text-gray-600 font-mono">{data.primaryColor}</span>
        </div>
      </div>
      <div>
        <label className={labelCls}>Logo URL (optional)</label>
        <input type="url" className={inputCls} placeholder="https://..." value={data.logoUrl} onChange={e => onChange('logoUrl', e.target.value)} />
        {data.logoUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img src={data.logoUrl} alt="Logo" className="h-12 object-contain rounded border border-gray-100" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs text-green-600">Logo geladen ✓</span>
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>Schriftart</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FONT_OPTIONS.map(font => (
            <button key={font.value} type="button" onClick={() => onChange('fontFamily', font.value)}
              style={{ fontFamily: font.value }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${data.fontFamily === font.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              <div className="text-lg font-bold text-gray-900 mb-0.5">Aa</div>
              <div className="text-xs text-gray-500">{font.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-6 text-center" style={{ fontFamily: data.fontFamily }}>
        <div className="text-xs text-gray-400 mb-3">Live-Vorschau</div>
        <div className="text-2xl font-bold mb-2" style={{ color: data.primaryColor }}>
          {data.companyName || 'Dein Firmenname'}
        </div>
        <p className="text-gray-600 text-sm mb-4">{data.description || 'Deine kurze Beschreibung.'}</p>
        <span className="inline-block px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: data.primaryColor }}>
          Jetzt anfragen
        </span>
      </div>
    </div>
  );
}

function Step3Goal({ data, onChange }: { data: WizardData; onChange: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Wähle das Hauptziel deiner Website.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {GOALS.map(goal => (
          <button key={goal.id} type="button" onClick={() => onChange('goal', goal.id)}
            className={`p-5 rounded-xl border-2 text-left transition-all ${data.goal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
            <div className="text-3xl mb-3">{goal.icon}</div>
            <div className="font-semibold text-gray-900 text-sm mb-1">{goal.label}</div>
            <div className="text-xs text-gray-500">{goal.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4Template({ data, onChange, templates, loading }: {
  data: WizardData; onChange: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void;
  templates: GlobalTemplate[]; loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Templates werden geladen …</p>
        </div>
      </div>
    );
  }

  const sorted = [...templates].sort((a, b) => getTemplateScore(b, data) - getTemplateScore(a, data));
  const hasRelevant = sorted.some(t => getTemplateScore(t, data) > 0);
  const displayed = sorted.length > 0 ? sorted : [
    { id: '__blank', name: 'Leeres Template', description: 'Starte mit einer leeren Seite', thumbnailUrl: null, category: null },
  ];
  const industryLabel = INDUSTRIES.find(i => i.value === data.industry)?.label;
  const goalLabel = GOALS.find(g => g.id === data.goal)?.label;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Alle Inhalte werden mit deinen Daten befüllt — inkl. Impressum und Datenschutz.</p>
      {hasRelevant && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          ✨ Passende Templates für <strong>{industryLabel}</strong>{goalLabel ? ` · ${goalLabel}` : ''} zuerst
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map(template => {
          const score = getTemplateScore(template, data);
          return (
            <button key={template.id} type="button" onClick={() => onChange('globalTemplateId', template.id)}
              className={`rounded-xl border-2 text-left overflow-hidden transition-all relative ${data.globalTemplateId === template.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
              {score > 0 && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">✨ Empfohlen</div>
              )}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {template.thumbnailUrl
                  ? <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-300">🎨</div>
                }
                {data.globalTemplateId === template.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 text-sm mb-1">{template.name}</div>
                {template.description && <div className="text-xs text-gray-500 line-clamp-2">{template.description}</div>}
                {template.category && <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{template.category}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BuildingScreen({ messageIndex, companyName, primaryColor }: { messageIndex: number; companyName: string; primaryColor: string }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold" style={{ backgroundColor: primaryColor }}>
          {companyName?.[0]?.toUpperCase() || '✦'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Deine Website wird gebaut</h2>
        <p className="text-gray-500 mb-8">Wir richten alles für {companyName || 'dich'} ein …</p>
        <div className="flex justify-center gap-2 mb-6">
          {BUILD_MESSAGES.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all duration-500"
              style={{ width: i <= messageIndex ? 24 : 8, backgroundColor: i <= messageIndex ? primaryColor : '#e5e7eb' }} />
          ))}
        </div>
        <p className="text-sm text-gray-400 animate-pulse">{BUILD_MESSAGES[Math.min(messageIndex, BUILD_MESSAGES.length - 1)]}</p>
      </div>
    </div>
  );
}

// ==================== MAIN ====================

export default function OnboardingPage(): React.ReactElement {
  const router = useRouter();
  const { tenant } = useAuth();
  const client = useApolloClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [cloneTemplate] = useMutation(CLONE_GLOBAL_TEMPLATE);
  const [updateSection] = useMutation(UPDATE_SECTION);
  const [updateTemplateMut] = useMutation(UPDATE_TEMPLATE_SETTINGS);
  const [updateBranding] = useMutation(UPDATE_BRANDING);
  const [createPage] = useMutation(CREATE_PAGE);
  const [createSection] = useMutation(CREATE_SECTION);
  const [setDefaultTemplate] = useMutation(SET_DEFAULT_TEMPLATE);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setData(saved.data);
      setStep(saved.step as 1 | 2 | 3 | 4);
      setCompletedSteps(saved.completedSteps || []);
    }
  }, []);

  const onChange = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: value };
      saveProgress(step, next, completedSteps);
      return next;
    });
  }, [step, completedSteps]);

  useEffect(() => {
    if (step !== 4 || templates.length > 0) return;
    setTemplatesLoading(true);
    client.query<{ wbGlobalTemplates: GlobalTemplate[] }>({
      query: GET_GLOBAL_TEMPLATES, fetchPolicy: 'network-only',
    }).then(r => setTemplates(r.data?.wbGlobalTemplates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false));
  }, [step, client, templates.length]);

  const canProceed = (): boolean => {
    if (step === 1) return data.companyName.trim().length > 0;
    if (step === 2) return data.primaryColor.length > 0 && data.fontFamily.length > 0;
    if (step === 3) return data.goal !== null;
    if (step === 4) return data.globalTemplateId.length > 0;
    return false;
  };

  const goToStep = (newStep: 1 | 2 | 3 | 4) => {
    const newCompleted = [...new Set([...completedSteps, step])];
    setCompletedSteps(newCompleted);
    setStep(newStep);
    saveProgress(newStep, data, newCompleted);
  };

  const nextStep = () => { if (step < 4) goToStep((step + 1) as 1 | 2 | 3 | 4); };
  const prevStep = () => { if (step > 1) goToStep((step - 1) as 1 | 2 | 3 | 4); };

  const skipStep = () => {
    if (step < 4) goToStep((step + 1) as 1 | 2 | 3 | 4);
    else { clearOnboardingProgress(); router.push('/dashboard'); }
  };

  // ─── Legal Page Creator ────────────────────────────────────────────────────
  async function ensureLegalPages(templateId: string, existingPages: { id: string; slug: string; name: string }[]) {
    const legalPages = [
      { slug: 'impressum', name: 'Impressum', getText: buildImpressumText },
      { slug: 'datenschutz', name: 'Datenschutz', getText: buildDatenschutzText },
    ];

    for (let i = 0; i < legalPages.length; i++) {
      const lp = legalPages[i];
      // Prüfe ob Seite bereits existiert (z.B. aus geklontem Template)
      const existing = existingPages.find(p => p.slug === lp.slug);

      let pageId: string;

      if (existing) {
        pageId = existing.id;
      } else {
        try {
          const res = await createPage({
            variables: {
              input: {
                templateId,
                name: lp.name,
                slug: lp.slug,
                isActive: true,
                isHomepage: false,
                order: 100 + i, // ans Ende
              },
              tenantId: tenant!.id,
            },
          });
          pageId = res.data?.createPage?.id;
        } catch {
          continue; // Slug conflict — überspringen
        }
      }

      if (!pageId!) continue;

      // Section mit echtem Content anlegen
      try {
        await createSection({
          variables: {
            input: {
              pageId,
              templateId,
              name: lp.name,
              type: 'text',
              order: 0,
              isActive: true,
              // ✅ Echter Content mit Onboarding-Daten
              content: { text: lp.getText(data) },
            },
            tenantId: tenant!.id,
          },
        });
      } catch {
        // Section konnte nicht erstellt werden — nicht kritisch
      }
    }
  }

  // ─── Build ────────────────────────────────────────────────────────────────
  const handleBuild = async (): Promise<void> => {
    if (!tenant?.id) return;
    setError(null);
    setIsBuilding(true);
    setBuildStep(0);

    try {
      // 1. Branding
      try {
        await updateBranding({
          variables: { input: { primaryColor: data.primaryColor, logoUrl: data.logoUrl || null, platformName: data.companyName } },
        });
      } catch {}

      setBuildStep(1);

      // 2. Template klonen
      const globalTemplateId = data.globalTemplateId === '__blank' ? null : data.globalTemplateId;
      let newTemplateId: string | null = null;

      if (globalTemplateId) {
        const res = await cloneTemplate({
          variables: { globalTemplateId, tenantId: tenant.id },
        });
        newTemplateId = res.data?.cloneGlobalTemplate?.id ?? null;
      }

      setBuildStep(2);

      // 3. Template-Settings (Farbe & Font)
      if (newTemplateId) {
        try {
       await updateTemplateMut({
  variables: {
    id: newTemplateId,
    input: {
      settings: {
        colors: {
          primary: data.primaryColor,
          secondary: data.primaryColor,
          accent: data.primaryColor,
          background: '#ffffff',
          text: '#1f2937',
        },
        fonts: {
          body: data.fontFamily,
          heading: data.fontFamily,
        },
        button: {
          style: 'filled',
          radius: '0.5rem',
          size: 'md',
        },
        logo: {
          url: data.logoUrl || '',
          text: data.companyName || 'Site',
        },
      },
    },
    tenantId: tenant.id,
  },
});
        } catch {}
      }

      setBuildStep(3);

      // 4. Sections befüllen + Legal Pages erstellen
      if (newTemplateId) {
        // Vorhandene Seiten laden
        const pagesResult = await client.query<{ wbPages: { id: string; name: string; slug: string; isHomepage: boolean }[] }>({
          query: GET_PAGES_WITH_SECTIONS,
          variables: { templateId: newTemplateId, tenantId: tenant.id },
          fetchPolicy: 'network-only',
        });

        const pages = pagesResult.data?.wbPages ?? [];
        const homepage = pages.find(p => p.isHomepage) ?? pages[0] ?? null;

        // Hero/Contact/About Sections der Homepage befüllen
        if (homepage) {
          const pageResult = await client.query<{ wbPage: WbPage }>({
            query: GET_PAGE_SECTIONS,
            variables: { id: homepage.id, tenantId: tenant.id },
            fetchPolicy: 'network-only',
          });

          const sections = pageResult.data?.wbPage?.sections ?? [];
          const updates: Promise<unknown>[] = [];

          for (const section of sections) {
            if (section.type === 'hero') {
              updates.push(updateSection({ variables: { id: section.id, input: { content: buildHeroContent(data) }, tenantId: tenant.id } }));
            } else if (section.type === 'contact') {
              updates.push(updateSection({ variables: { id: section.id, input: { content: buildContactContent(data) }, tenantId: tenant.id } }));
            } else if (section.type === 'about') {
              updates.push(updateSection({ variables: { id: section.id, input: { content: buildAboutContent(data) }, tenantId: tenant.id } }));
            }
          }

          await Promise.all(updates);
        }

        // ✅ NEU: Impressum & Datenschutz mit echten Daten anlegen
        await ensureLegalPages(newTemplateId, pages);

        // Als Standard setzen (erste Website)
        await setDefaultTemplate({ variables: { id: newTemplateId, tenantId: tenant.id } }).catch(() => {});
      }

      setBuildStep(4);
      await new Promise(r => setTimeout(r, 600));
      setBuildStep(5);
      await new Promise(r => setTimeout(r, 400));

      clearOnboardingProgress();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setIsBuilding(false);
    }
  };

  if (isBuilding) {
    return <BuildingScreen messageIndex={buildStep} companyName={data.companyName} primaryColor={data.primaryColor} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: data.primaryColor }}>
                {data.companyName?.[0]?.toUpperCase() || '✦'}
              </div>
              <span className="font-semibold text-gray-900 text-sm">{data.companyName || 'Deine Website einrichten'}</span>
            </div>
            <span className="text-xs text-gray-400">Schritt {step} / 4</span>
          </div>
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const stepNum = (i + 1) as 1 | 2 | 3 | 4;
              const isDone = completedSteps.includes(stepNum);
              const isCurrent = stepNum === step;
              const isClickable = isDone || stepNum < step;
              return (
                <div key={label} className="flex-1">
                  <button
                    type="button"
                    onClick={() => isClickable ? goToStep(stepNum) : undefined}
                    className={`w-full h-1.5 rounded-full transition-all duration-300 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{ backgroundColor: i + 1 <= step ? data.primaryColor : '#e5e7eb' }}
                  />
                  <div className={`text-xs mt-1.5 text-center transition-colors ${isCurrent ? 'text-gray-900 font-semibold' : isDone ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isDone && !isCurrent ? '✓ ' : ''}{label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Erzähl uns von deinem Unternehmen'}
              {step === 2 && 'Wie soll deine Website aussehen?'}
              {step === 3 && 'Was ist das Ziel deiner Website?'}
              {step === 4 && 'Wähle dein Template'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 && 'Diese Daten erscheinen direkt auf deiner Website und im Impressum.'}
              {step === 2 && 'Farbe und Schrift werden auf deiner Website übernommen.'}
              {step === 3 && 'Wir zeigen dir passende Templates für dein Ziel.'}
              {step === 4 && 'Das Template ist dein Startpunkt — alles lässt sich danach bearbeiten.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="font-semibold">Fehler:</span> {error}
              <button onClick={() => setError(null)} className="ml-3 text-red-500 hover:text-red-700 underline">Schließen</button>
            </div>
          )}

          {step === 1 && <Step1Company data={data} onChange={onChange} />}
          {step === 2 && <Step2Design data={data} onChange={onChange} />}
          {step === 3 && <Step3Goal data={data} onChange={onChange} />}
          {step === 4 && <Step4Template data={data} onChange={onChange} templates={templates} loading={templatesLoading} />}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                ← Zurück
              </button>
            )}
            <button type="button" onClick={skipStep} className="px-4 py-3 rounded-xl text-gray-400 font-medium text-sm hover:text-gray-600 transition">
              {step === 4 ? 'Ohne Template starten →' : 'Überspringen →'}
            </button>
          </div>
          {step < 4 ? (
            <button type="button" onClick={nextStep} disabled={!canProceed()}
              className="px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: canProceed() ? data.primaryColor : '#9ca3af' }}>
              Weiter →
            </button>
          ) : (
            <button type="button" onClick={handleBuild} disabled={!canProceed()}
              className="px-8 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: canProceed() ? data.primaryColor : '#9ca3af' }}>
              ✦ Website jetzt erstellen
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Dein Fortschritt wird automatisch gespeichert
        </p>
      </div>
    </div>
  );
}