// 📂 PFAD: frontend/src/components/website-builder/WysiwygEditor.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { NavigationEditor } from './NavigationEditor';
import { MediaPicker } from './MediaPicker';

// ==================== GRAPHQL ====================

const GET_PAGE_WITH_SECTIONS = gql`
  query WysiwygGetPage($id: String!, $tenantId: String!) {
    wbPage(id: $id, tenantId: $tenantId) {
      id name slug templateId isHomepage
      sections { id name type order isActive content styling }
    }
  }
`;

const GET_TEMPLATE_SETTINGS = gql`
  query WysiwygGetTemplate($id: String!, $tenantId: String!) {
    wbTemplate(id: $id, tenantId: $tenantId) { id name settings }
  }
`;


const UPDATE_SECTION = gql`
  mutation WysiwygUpdateSection($id: String!, $input: UpdateSectionInput!, $tenantId: String!) {
    updateSection(id: $id, input: $input, tenantId: $tenantId) { id name type content styling isActive order }
  }
`;

const CREATE_SECTION = gql`
  mutation WysiwygCreateSection($input: CreateSectionInput!, $tenantId: String!) {
    createSection(input: $input, tenantId: $tenantId) { id name type order isActive content styling }
  }
`;

const DELETE_SECTION = gql`
  mutation WysiwygDeleteSection($id: String!, $tenantId: String!) {
    deleteSection(id: $id, tenantId: $tenantId)
  }
`;

const REORDER_SECTIONS = gql`
  mutation WysiwygReorderSections($pageId: String!, $sectionIds: [String!]!, $tenantId: String!) {
    reorderSections(pageId: $pageId, sectionIds: $sectionIds, tenantId: $tenantId) { id order }
  }
`;
const GET_NAVIGATIONS = gql`
  query WysiwygGetNavigations {
    navigations {
      id name location isActive
      settings
      items {
        id label type url order openInNewTab parentId
        children { id label type url order openInNewTab }
      }
    }
  }
`;
const CREATE_NAV_ITEM = gql`
  mutation WysiwygCreateNavItem($navigationId: String!, $input: CreateNavigationItemInput!) {
    createNavigationItem(navigationId: $navigationId, input: $input) { id label type url order openInNewTab }
  }
`;
const UPDATE_NAV_ITEM = gql`
  mutation WysiwygUpdateNavItem($itemId: String!, $input: UpdateNavigationItemInput!) {
    updateNavigationItem(itemId: $itemId, input: $input) { id label type url order openInNewTab }
  }
`;
const DELETE_NAV_ITEM = gql`
  mutation WysiwygDeleteNavItem($itemId: String!) {
    deleteNavigationItem(itemId: $itemId)
  }
`;
const UPDATE_NAVIGATION = gql`
  mutation WysiwygUpdateNavigation($id: String!, $input: UpdateNavigationInput!) {
    updateNavigation(id: $id, input: $input) { id settings }
  }
`;
const GET_TEMPLATE_PAGES = gql`
  query WysiwygGetTemplatePages($templateId: String!, $tenantId: String!) {
    wbPages(templateId: $templateId, tenantId: $tenantId) { id name slug }
  }
`;

const UPDATE_TEMPLATE_SETTINGS = gql`
  mutation WysiwygUpdateTemplate($id: String!, $input: UpdateTemplateInput!, $tenantId: String!) {
    updateTemplate(id: $id, input: $input, tenantId: $tenantId) { id settings }
  }
`;
// ==================== TYPES ====================

interface SectionContent { [key: string]: any; }

interface MobileOverrides {
  padding?: { top?: string; right?: string; bottom?: string; left?: string };
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  fontSize?: string;
  headingSize?: string;
}

interface SectionStyling {
  // Hintergrund
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  // Layout
  padding?: { top?: string; right?: string; bottom?: string; left?: string };
  containerWidth?: 'narrow' | 'normal' | 'full';
  textAlign?: 'left' | 'center' | 'right';
  // Typografie
  fontFamily?: string;
  headingSize?: string;
  bodySize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
customCss?: string;
  backgroundVideo?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  animation?: { type?: string; duration?: string; delay?: string; };
  isLocked?: boolean;
  mobile?: MobileOverrides;
  buttonColor?: string;
buttonTextColor?: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  order: number;
  isActive: boolean;
  content: SectionContent;
  styling?: SectionStyling;
}

interface TemplateSettings {
  colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
  fonts?: { heading?: string; body?: string };
  button?: {
    style?: 'filled' | 'outline' | 'ghost' | 'pill';
    radius?: string;
    size?: 'sm' | 'md' | 'lg';
    shadowColor?: string;
  };
}
interface NavItem {
  id: string; label: string; type: string; url?: string;
  order: number; openInNewTab: boolean; parentId?: string;
  children?: NavItem[];
}
interface NavData {
  id: string; name: string; location: string; isActive: boolean;
  items?: NavItem[];
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    itemsAlign?: 'left' | 'center' | 'right';
    logoText?: string;
    sticky?: boolean;
  };
}
// ==================== FONT PRESETS ====================

const FONT_PRESETS = [
  { label: 'Standard (System)', value: 'system-ui, sans-serif', google: null },
  { label: 'Inter', value: "'Inter', sans-serif", google: 'Inter:wght@400;600;700;800' },
  { label: 'Roboto', value: "'Roboto', sans-serif", google: 'Roboto:wght@400;700;900' },
  { label: 'Playfair Display', value: "'Playfair Display', serif", google: 'Playfair+Display:wght@400;700;900' },
  { label: 'Montserrat', value: "'Montserrat', sans-serif", google: 'Montserrat:wght@400;600;700;800' },
  { label: 'Poppins', value: "'Poppins', sans-serif", google: 'Poppins:wght@400;600;700;800' },
  { label: 'Lato', value: "'Lato', sans-serif", google: 'Lato:wght@400;700;900' },
  { label: 'Oswald', value: "'Oswald', sans-serif", google: 'Oswald:wght@400;600;700' },
  { label: 'Raleway', value: "'Raleway', sans-serif", google: 'Raleway:wght@400;600;700;800' },
  { label: 'Nunito', value: "'Nunito', sans-serif", google: 'Nunito:wght@400;600;700;800' },
  { label: 'Source Serif 4', value: "'Source Serif 4', serif", google: 'Source+Serif+4:wght@400;700;900' },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", google: 'Space+Grotesk:wght@400;600;700' },
  { label: 'DM Sans', value: "'DM Sans', sans-serif", google: 'DM+Sans:wght@400;600;700;800' },
  { label: 'Geist', value: "'Geist', sans-serif", google: 'Geist:wght@400;600;700' },
];

// Dynamisch Google Fonts laden
const loadedFonts = new Set<string>();
function loadGoogleFont(googleParam: string | null) {
  if (!googleParam || loadedFonts.has(googleParam)) return;
  loadedFonts.add(googleParam);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
  document.head.appendChild(link);
}

// ==================== BLOCK DEFINITIONS ====================

const BLOCK_CATEGORIES = [
  {
    label: 'Grundlagen', icon: '⬛',
    blocks: [
      { type: 'hero', label: 'Hero', icon: '🌟', description: 'Großer Einstiegsbereich' },
      { type: 'cta', label: 'Call to Action', icon: '📢', description: 'Conversion-Bereich' },
      { type: 'text', label: 'Text', icon: '📝', description: 'Freier Textbereich' },
      { type: 'spacer', label: 'Spacer / Divider', icon: '↕️', description: 'Abstand oder Trennlinie' },
    ],
  },
  {
    label: 'Inhalt', icon: '📦',
    blocks: [
      { type: 'about', label: 'Über uns', icon: '👋', description: 'Über-uns-Bereich' },
      { type: 'features', label: 'Features', icon: '✨', description: 'Feature-Liste' },
      { type: 'services', label: 'Leistungen', icon: '⚙️', description: 'Services/Angebote' },
      { type: 'stats', label: 'Statistiken', icon: '📊', description: 'Zahlen & Fakten' },
    ],
  },
  {
    label: 'Social Proof', icon: '⭐',
    blocks: [
      { type: 'testimonials', label: 'Bewertungen', icon: '💬', description: 'Kundenstimmen' },
      { type: 'team', label: 'Team', icon: '👥', description: 'Team-Mitglieder' },
      { type: 'gallery', label: 'Galerie', icon: '🖼️', description: 'Bildergalerie' },
    ],
  },
  {
    label: 'Conversion', icon: '🎯',
    blocks: [
      { type: 'pricing', label: 'Preise', icon: '💰', description: 'Preis-Pakete' },
      { type: 'contact', label: 'Kontakt', icon: '📬', description: 'Kontaktformular' },
      { type: 'faq', label: 'FAQ', icon: '❓', description: 'Häufige Fragen' },
    ],
  },
  {
    label: 'Medien', icon: '🎬',
    blocks: [
      { type: 'video', label: 'Video', icon: '▶️', description: 'Video-Einbettung' },
      { type: 'before_after', label: 'Before / After', icon: '↔️', description: 'Bildvergleich mit Slider' },
      { type: 'blog', label: 'Blog Feed', icon: '📰', description: 'Letzte Blog-Posts' },
      { type: 'html', label: 'HTML', icon: '⌨️', description: 'Freies HTML' },
    ],
  },
  {
    label: 'Marketing', icon: '📣',
    blocks: [
      { type: 'newsletter', label: 'Newsletter', icon: '📬', description: 'Newsletter-Anmeldung' },
      { type: 'booking', label: 'Buchung', icon: '📅', description: 'Terminbuchungs-Widget' },
      { type: 'social', label: 'Social Media', icon: '🌐', description: 'Social Media Links' },
      { type: 'map', label: 'Karte', icon: '🗺️', description: 'Google Maps Einbettung' },
      { type: 'countdown', label: 'Countdown', icon: '⏱️', description: 'Countdown-Timer' },
      { type: 'whatsapp', label: 'WhatsApp Button', icon: '💬', description: 'Floating WhatsApp Button' },
    ],
  },
  {
  label: 'Freestyle', icon: '✦',
  blocks: [
    { type: 'freestyle', label: 'Freestyle Block', icon: '✦', description: 'Freie Element-Komposition — alles selbst anordnen' },
  ],
},
];

const DEFAULT_CONTENT: Record<string, SectionContent> = {
  hero:         { heading: 'Deine Überschrift hier', subheading: 'Eine überzeugende Unterüberschrift', buttonText: 'Jetzt starten', buttonLink: '#' },
  cta:          { heading: 'Bereit loszulegen?', subheading: 'Starte noch heute kostenlos.', buttonText: 'Jetzt starten', buttonLink: '#' },
  text: { heading: 'Überschrift', text: '<p>Dein Text hier.</p>' },
  spacer: { height: '80px', showLine: false, lineColor: '#e5e7eb', lineStyle: 'solid', lineThickness: '1px' },
  about:        { heading: 'Über uns', text: '<p>Hier steht eine kurze Beschreibung.</p>' },
  features:     { heading: 'Unsere Features', items: [{ icon: '⚡', title: 'Feature 1', description: 'Kurze Beschreibung' }, { icon: '🎯', title: 'Feature 2', description: 'Kurze Beschreibung' }, { icon: '🔥', title: 'Feature 3', description: 'Kurze Beschreibung' }] },
  services:     { heading: 'Unsere Leistungen', items: [{ icon: '🛠️', title: 'Service 1', description: 'Beschreibung', price: 'ab €99' }, { icon: '💡', title: 'Service 2', description: 'Beschreibung', price: 'ab €149' }] },
  stats:        { heading: 'In Zahlen', items: [{ value: '1.000+', title: 'Kunden', description: 'Weltweit' }, { value: '99%', title: 'Zufriedenheit', description: 'Bewertung' }, { value: '24/7', title: 'Support', description: 'Erreichbar' }, { value: '5+', title: 'Jahre', description: 'Erfahrung' }] },
  testimonials: { heading: 'Was unsere Kunden sagen', items: [{ title: 'Max Müller', subtitle: 'CEO', description: 'Absolut empfehlenswert!' }, { title: 'Anna Schmidt', subtitle: 'Designerin', description: 'Super einfach zu bedienen.' }] },
  team:         { heading: 'Unser Team', items: [{ title: 'Max Müller', subtitle: 'CEO', description: 'Gründer & Visionär', image: '' }, { title: 'Anna Schmidt', subtitle: 'CTO', description: 'Technik-Expertin', image: '' }] },
  gallery:      { heading: 'Galerie', images: [{ url: '', alt: 'Bild 1' }, { url: '', alt: 'Bild 2' }, { url: '', alt: 'Bild 3' }] },
  pricing:      { heading: 'Unsere Preise', items: [{ title: 'Starter', price: '€9', interval: 'Monat', features: ['Feature 1', 'Feature 2'], buttonText: 'Jetzt starten' }, { title: 'Pro', price: '€29', interval: 'Monat', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Jetzt starten', highlighted: true }] },
  contact:      { heading: 'Kontakt aufnehmen', subheading: 'Wir freuen uns auf deine Nachricht.', buttonText: 'Senden' },
  faq:          { heading: 'Häufige Fragen', items: [{ title: 'Wie funktioniert das?', description: 'Ganz einfach...' }, { title: 'Was kostet es?', description: 'Ab €9 pro Monat.' }] },
  video:        { heading: '', videoUrl: '', videoPoster: '' },
  html:         { html: '<div style="padding: 2rem; text-align: center;"><h2>Dein HTML hier</h2></div>' },
  blog:         { heading: 'Neueste Beiträge', count: 3 },
  newsletter: { heading: 'Newsletter abonnieren', text: 'Erhalte die neuesten Updates direkt in dein Postfach.', buttonText: 'Abonnieren', placeholder: 'deine@email.de' },
  whatsapp: { phone: '+49 151 12345678', message: 'Hallo, ich hätte eine Frage...', position: 'right', label: 'WhatsApp schreiben' },
before_after: { heading: '', beforeImage: '', afterImage: '', beforeLabel: 'Vorher', afterLabel: 'Nachher' },
  booking:      { heading: 'Termin buchen', text: 'Buche jetzt deinen Wunschtermin.', buttonText: 'Termin buchen', buttonLink: '/booking' },
  social:       { heading: 'Folge uns', links: [{ platform: 'Instagram', url: 'https://instagram.com/', icon: '📷' }, { platform: 'Facebook', url: 'https://facebook.com/', icon: '👍' }, { platform: 'LinkedIn', url: 'https://linkedin.com/', icon: '💼' }] },
  map:          { heading: 'So findest du uns', address: 'Musterstraße 1, 12345 Musterstadt', embedUrl: '' },
  countdown: { heading: 'Nur noch bis...', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], text: 'Verpasse nicht unser Angebot!' },
  freestyle: {
  blocks: [
    { id: 'b1', type: 'heading', text: 'Deine Überschrift', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Dein Text hier.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'button', text: 'Jetzt starten', link: '#', style: 'primary', align: 'center', order: 2 },
  ]
},
};

const BG_PRESETS = [
  { label: 'Weiß', bg: '#ffffff', text: '#1f2937' },
  { label: 'Grau', bg: '#f9fafb', text: '#1f2937' },
  { label: 'Dunkel', bg: '#0f172a', text: '#f8fafc' },
  { label: 'Blau', bg: '#1e40af', text: '#ffffff' },
  { label: 'Violett', bg: '#7c3aed', text: '#ffffff' },
  { label: 'Grün', bg: '#15803d', text: '#ffffff' },
  { label: 'Rot', bg: '#dc2626', text: '#ffffff' },
  { label: 'Orange', bg: '#ea580c', text: '#ffffff' },
  { label: '◐ Blau', bg: 'linear-gradient(135deg, #1e40af, #7c3aed)', text: '#ffffff' },
  { label: '◐ Grün', bg: 'linear-gradient(135deg, #059669, #0ea5e9)', text: '#ffffff' },
  { label: '◐ Coral', bg: 'linear-gradient(135deg, #f43f5e, #f97316)', text: '#ffffff' },
  { label: '◐ Dark', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', text: '#f8fafc' },
];

// ==================== HELPERS ====================

function getSectionStyle(styling: SectionStyling | undefined, deviceMode: 'desktop' | 'tablet' | 'mobile'): React.CSSProperties {
  if (!styling) return {};
  const isMobile = deviceMode !== 'desktop';
  const mob = styling.mobile || {};

  const bg = (isMobile && mob.backgroundColor) ? mob.backgroundColor : styling.backgroundColor;
  const pad = isMobile && mob.padding ? mob.padding : (styling.padding || {});

  return {
    backgroundColor: bg?.startsWith('linear') ? undefined : (bg || 'transparent'),
    backgroundImage: bg?.startsWith('linear')
      ? bg
      : styling.backgroundImage
        ? `url(${styling.backgroundImage})`
        : undefined,
    backgroundSize: styling.backgroundSize || 'cover',
    backgroundPosition: styling.backgroundPosition || 'center',
    color: styling.textColor || 'inherit',
    paddingTop: pad.top || '3rem',
    paddingBottom: pad.bottom || '3rem',
    paddingLeft: pad.left || '1rem',
    paddingRight: pad.right || '1rem',
    textAlign: ((isMobile && mob.textAlign) ? mob.textAlign : styling.textAlign) as any || 'left',
    fontFamily: styling.fontFamily || 'inherit',
    fontSize: (isMobile && mob.fontSize) ? mob.fontSize : (styling.bodySize || 'inherit'),
    lineHeight: styling.lineHeight || 'inherit',
    letterSpacing: styling.letterSpacing || 'inherit',
  };
}
// ==================== LAYOUT TOGGLE ====================

const LAYOUT_OPTIONS: Record<string, { id: string; label: string; icon: string; description: string }[]> = {
  hero: [
    { id: 'center', label: 'Zentriert', icon: '↔', description: 'Text und Button zentriert' },
    { id: 'left', label: 'Text Links', icon: '📄▶🖼', description: 'Text links, Bild rechts' },
    { id: 'right', label: 'Text Rechts', icon: '🖼◀📄', description: 'Bild links, Text rechts' },
    { id: 'split', label: 'Split', icon: '⬛⬛', description: 'Gleichmäßig aufgeteilt' },
  ],
  cta: [
    { id: 'center', label: 'Zentriert', icon: '↔', description: 'Alles zentriert' },
    { id: 'left', label: 'Links', icon: '⬅', description: 'Text links, Button rechts' },
    { id: 'banner', label: 'Banner', icon: '▬', description: 'Schmaler Banner-Stil' },
  ],
  text: [
    { id: 'center', label: 'Zentriert', icon: '↔', description: 'Text zentriert' },
    { id: 'left', label: 'Links', icon: '⬅', description: 'Text linksbündig' },
    { id: 'image-right', label: 'Bild rechts', icon: '📄▶🖼', description: 'Text links, Bild rechts' },
    { id: 'image-left', label: 'Bild links', icon: '🖼◀📄', description: 'Bild links, Text rechts' },
  ],
  about: [
    { id: 'center', label: 'Zentriert', icon: '↔', description: 'Text zentriert' },
    { id: 'left', label: 'Links', icon: '⬅', description: 'Text linksbündig' },
    { id: 'image-right', label: 'Bild rechts', icon: '📄▶🖼', description: 'Text links, Bild rechts' },
    { id: 'image-left', label: 'Bild links', icon: '🖼◀📄', description: 'Bild links, Text rechts' },
  ],
  features: [
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'grid-4', label: '4 Spalten', icon: '⬛⬛⬛⬛', description: '4er Grid' },
    { id: 'list', label: 'Liste', icon: '☰', description: 'Vertikale Liste' },
    { id: 'alternating', label: 'Abwechselnd', icon: '↕', description: 'Links/Rechts abwechselnd' },
  ],
  services: [
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'list', label: 'Liste', icon: '☰', description: 'Vertikale Liste mit Preis' },
    { id: 'cards', label: 'Cards', icon: '🃏', description: 'Große Karten' },
  ],
  testimonials: [
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'single', label: 'Einzeln groß', icon: '⬛', description: 'Große Einzel-Karte' },
  ],
  pricing: [
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'table', label: 'Tabelle', icon: '⊞', description: 'Vergleichstabelle' },
  ],
  stats: [
    { id: 'grid-4', label: '4 Spalten', icon: '⬛⬛⬛⬛', description: '4er Grid' },
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'banner', label: 'Banner', icon: '▬', description: 'Horizontal in einer Zeile' },
  ],
  team: [
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'grid-4', label: '4 Spalten', icon: '⬛⬛⬛⬛', description: '4er Grid' },
    { id: 'horizontal', label: 'Horizontal', icon: '☰', description: 'Foto + Text nebeneinander' },
  ],
  faq: [
    { id: 'accordion', label: 'Accordion', icon: '☰', description: 'Aufklappbar' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: 'Zwei Spalten offen' },
    { id: 'open', label: 'Offen', icon: '📄', description: 'Alle offen sichtbar' },
  ],
  gallery: [
    { id: 'grid-3', label: '3 Spalten', icon: '⬛⬛⬛', description: '3er Grid quadratisch' },
    { id: 'grid-2', label: '2 Spalten', icon: '⬛⬛', description: '2er Grid' },
    { id: 'masonry', label: 'Masonry', icon: '🧱', description: 'Unterschiedliche Höhen' },
    { id: 'wide', label: 'Breit', icon: '▬', description: 'Breite Bilder 16:9' },
  ],
};

function LayoutToggle({ type, content, update }: {
  type: string;
  content: SectionContent;
  update: (key: string, val: any) => void;
}) {
  const options = LAYOUT_OPTIONS[type];
  if (!options) return null;

  const current = content._layout || options[0].id;

  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #21262d' }}>
      <p style={{ fontSize: '0.65rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        🗂 Layout
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => update('_layout', opt.id)}
            title={opt.description}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: current === opt.id ? 'rgba(88,166,255,0.15)' : '#0d1117',
              border: `1px solid ${current === opt.id ? '#58a6ff' : '#30363d'}`,
              color: current === opt.id ? '#58a6ff' : '#6e7681',
            }}>
            <span style={{ fontSize: '0.9rem' }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
// ==================== FREESTYLE BLOCK TYPES ====================

const FREESTYLE_BLOCK_TYPES = [
  { type: 'heading', label: 'Überschrift', icon: 'H' },
  { type: 'text', label: 'Text', icon: '¶' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'image', label: 'Bild', icon: '🖼️' },
  { type: 'badge', label: 'Badge', icon: '🏷️' },
  { type: 'divider', label: 'Trennlinie', icon: '—' },
  { type: 'spacer', label: 'Abstand', icon: '↕' },
  { type: 'icon', label: 'Icon/Emoji', icon: '⭐' },
  { type: 'list', label: 'Liste', icon: '☰' },
  { type: 'video', label: 'Video', icon: '▶️' },
  { type: 'columns', label: '2 Spalten', icon: '⬛⬛' },
];

function generateBlockId() {
  return 'b' + Math.random().toString(36).substr(2, 9);
}

const DEFAULT_BLOCK: Record<string, any> = {
  heading: { text: 'Neue Überschrift', level: 'h2', align: 'center' },
  text: { html: '<p>Dein Text hier.</p>', align: 'left' },
  button: { text: 'Button Text', link: '#', style: 'primary', align: 'center' },
  image: { url: '', alt: '', width: '100%', align: 'center' },
  badge: { text: '🔥 Neu', align: 'center' },
  divider: { color: '#e5e7eb', thickness: '1px', style: 'solid' },
  spacer: { height: '2rem' },
  icon: { emoji: '⭐', size: '3rem', align: 'center' },
  list: { items: ['Punkt 1', 'Punkt 2', 'Punkt 3'], style: 'check', align: 'left' },
  video: { url: '', align: 'center' },
  columns: { left: [], right: [], split: '50/50' },
};

// ==================== FREESTYLE EDITOR ====================

function FreestyleEditor({ content, onChange }: {
  content: SectionContent;
  onChange: (c: SectionContent) => void;
}) {
  const blocks: any[] = content.blocks || [];
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null);
const dragBlockIdx = useRef<number | null>(null);

  const updateBlocks = (newBlocks: any[]) => {
    onChange({ ...content, blocks: newBlocks });
  };

  const addBlock = (type: string) => {
    const newBlock = {
      id: generateBlockId(),
      type,
      order: blocks.length,
      ...DEFAULT_BLOCK[type],
    };
    updateBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setShowAddMenu(false);
  };

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= blocks.length) return;
    const nb = [...blocks];
    [nb[idx], nb[swapIdx]] = [nb[swapIdx], nb[idx]];
    updateBlocks(nb);
  };

  const updateBlock = (id: string, updates: any) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.78rem',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.68rem', color: '#8b949e',
    marginBottom: 4, fontWeight: 600, letterSpacing: '0.03em',
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: '0 0 2px' }}>✦ Freestyle Block</p>
        <p style={{ fontSize: '0.7rem', color: '#8b949e', margin: 0 }}>
          Füge beliebige Elemente hinzu und ordne sie frei an.
        </p>
      </div>

      {/* Block Liste */}
      <div style={{ marginBottom: 10 }}>
        {blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6e7681', fontSize: '0.8rem', border: '1px dashed #30363d', borderRadius: 8 }}>
            Noch keine Elemente. Füge deinen ersten Block hinzu.
          </div>
        )}
        {[...blocks].sort((a, b) => a.order - b.order).map((block, idx) => (

         <div key={block.id}
  draggable
  onDragStart={() => { dragBlockIdx.current = idx; }}
  onDragOver={e => { e.preventDefault(); setDragOverBlockIdx(idx); }}
  onDrop={e => {
    e.preventDefault();
    if (dragBlockIdx.current === null || dragBlockIdx.current === idx) { setDragOverBlockIdx(null); return; }
    const nb = [...blocks];
    const [moved] = nb.splice(dragBlockIdx.current, 1);
    nb.splice(idx, 0, moved);
    // order neu setzen
    updateBlocks(nb.map((b, i) => ({ ...b, order: i })));
    setDragOverBlockIdx(null);
    dragBlockIdx.current = null;
  }}
  onDragEnd={() => setDragOverBlockIdx(null)}
  onClick={() => setSelectedBlockId(block.id === selectedBlockId ? null : block.id)}
  style={{
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px',
    marginBottom: 4, borderRadius: 6, cursor: 'grab',
    background: selectedBlockId === block.id ? '#1c2128' : '#0d1117',
    border: `1px solid ${dragOverBlockIdx === idx ? '#58a6ff' : selectedBlockId === block.id ? '#58a6ff' : '#21262d'}`,
    borderTop: dragOverBlockIdx === idx ? '2px solid #58a6ff' : undefined,
  }}>
            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>
              {FREESTYLE_BLOCK_TYPES.find(t => t.type === block.type)?.icon || '⬛'}
            </span>
            <span style={{ flex: 1, fontSize: '0.75rem', color: '#c9d1d9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {block.text || block.html?.replace(/<[^>]*>/g, '') || block.type}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#6e7681', background: '#161b22', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>
              {block.type}
            </span>
            <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
              disabled={idx === 0}
              style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#3d444d' : '#8b949e', fontSize: '0.75rem', padding: '1px 3px', flexShrink: 0 }}>↑</button>
            <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
              disabled={idx === blocks.length - 1}
              style={{ background: 'none', border: 'none', cursor: idx === blocks.length - 1 ? 'not-allowed' : 'pointer', color: idx === blocks.length - 1 ? '#3d444d' : '#8b949e', fontSize: '0.75rem', padding: '1px 3px', flexShrink: 0 }}>↓</button>
            <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', fontSize: '0.75rem', padding: '1px 3px', flexShrink: 0 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Block hinzufügen */}
      {showAddMenu ? (
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Element hinzufügen
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
            {FREESTYLE_BLOCK_TYPES.map(bt => (
              <button key={bt.type} onClick={() => addBlock(bt.type)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 6, cursor: 'pointer', background: '#161b22', border: '1px solid #21262d', color: '#c9d1d9', fontSize: '0.68rem', fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262d')}>
                <span style={{ fontSize: '1rem' }}>{bt.icon}</span>
                <span>{bt.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddMenu(false)}
            style={{ width: '100%', marginTop: 8, background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#6e7681', padding: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
            Abbrechen
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAddMenu(true)}
          style={{ width: '100%', padding: '7px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.78rem', cursor: 'pointer', marginBottom: 12 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}>
          + Element hinzufügen
        </button>
      )}

      {/* Ausgewählter Block Editor */}
      {selectedBlock && (
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12 }}>
          <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: '0 0 10px' }}>
            ✎ {FREESTYLE_BLOCK_TYPES.find(t => t.type === selectedBlock.type)?.label} bearbeiten
          </p>

          {/* Align für alle Blöcke */}
          {selectedBlock.type !== 'divider' && selectedBlock.type !== 'spacer' && selectedBlock.type !== 'columns' && (
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Ausrichtung</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {[{ v: 'left', l: '⬅' }, { v: 'center', l: '↔' }, { v: 'right', l: '➡' }].map(o => (
                  <button key={o.v} onClick={() => updateBlock(selectedBlock.id, { align: o.v })}
                    style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer',
                      background: (selectedBlock.align || 'center') === o.v ? '#1f6feb' : '#161b22',
                      border: `1px solid ${(selectedBlock.align || 'center') === o.v ? '#1f6feb' : '#30363d'}`,
                      color: (selectedBlock.align || 'center') === o.v ? '#fff' : '#8b949e' }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type-spezifische Felder */}
          {selectedBlock.type === 'heading' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Text</label>
                <input type="text" value={selectedBlock.text || ''} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Ebene</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['h1', 'h2', 'h3', 'h4'].map(l => (
                    <button key={l} onClick={() => updateBlock(selectedBlock.id, { level: l })}
                      style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        background: (selectedBlock.level || 'h2') === l ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.level || 'h2') === l ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.level || 'h2') === l ? '#fff' : '#8b949e' }}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedBlock.type === 'text' && (
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Text (HTML erlaubt)</label>
              <textarea value={selectedBlock.html || ''} onChange={e => updateBlock(selectedBlock.id, { html: e.target.value })}
                rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          )}

          {selectedBlock.type === 'button' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Button Text</label>
                <input type="text" value={selectedBlock.text || ''} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Link</label>
                <input type="text" value={selectedBlock.link || ''} onChange={e => updateBlock(selectedBlock.id, { link: e.target.value })} style={inputStyle} placeholder="https://... oder /seite" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Stil</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[{ v: 'primary', l: 'Primär' }, { v: 'secondary', l: 'Sekundär' }, { v: 'outline', l: 'Outline' }, { v: 'ghost', l: 'Ghost' }].map(o => (
                    <button key={o.v} onClick={() => updateBlock(selectedBlock.id, { style: o.v })}
                      style={{ flex: 1, padding: '4px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                        background: (selectedBlock.style || 'primary') === o.v ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.style || 'primary') === o.v ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.style || 'primary') === o.v ? '#fff' : '#8b949e' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedBlock.type === 'image' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Bild URL</label>
                <input type="text" value={selectedBlock.url || ''} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Alt-Text</label>
                <input type="text" value={selectedBlock.alt || ''} onChange={e => updateBlock(selectedBlock.id, { alt: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Breite</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['25%', '50%', '75%', '100%'].map(w => (
                    <button key={w} onClick={() => updateBlock(selectedBlock.id, { width: w })}
                      style={{ flex: 1, padding: '4px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                        background: (selectedBlock.width || '100%') === w ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.width || '100%') === w ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.width || '100%') === w ? '#fff' : '#8b949e' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedBlock.type === 'badge' && (
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Badge Text</label>
              <input type="text" value={selectedBlock.text || ''} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} style={inputStyle} />
            </div>
          )}

          {selectedBlock.type === 'icon' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Emoji / Icon</label>
                <input type="text" value={selectedBlock.emoji || ''} onChange={e => updateBlock(selectedBlock.id, { emoji: e.target.value })} style={inputStyle} placeholder="z.B. ⭐ 🚀 💡" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Größe</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[{ v: '2rem', l: 'S' }, { v: '3rem', l: 'M' }, { v: '4rem', l: 'L' }, { v: '6rem', l: 'XL' }].map(o => (
                    <button key={o.v} onClick={() => updateBlock(selectedBlock.id, { size: o.v })}
                      style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        background: (selectedBlock.size || '3rem') === o.v ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.size || '3rem') === o.v ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.size || '3rem') === o.v ? '#fff' : '#8b949e' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedBlock.type === 'spacer' && (
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Höhe</label>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                {['0.5rem', '1rem', '2rem', '3rem', '4rem', '6rem'].map(h => (
                  <button key={h} onClick={() => updateBlock(selectedBlock.id, { height: h })}
                    style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                      background: (selectedBlock.height || '2rem') === h ? '#1f6feb' : '#161b22',
                      border: `1px solid ${(selectedBlock.height || '2rem') === h ? '#1f6feb' : '#30363d'}`,
                      color: (selectedBlock.height || '2rem') === h ? '#fff' : '#8b949e' }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedBlock.type === 'divider' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Farbe</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={selectedBlock.color || '#e5e7eb'} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })}
                    style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
                  <input type="text" value={selectedBlock.color || '#e5e7eb'} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Stil</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['solid', 'dashed', 'dotted'].map(s => (
                    <button key={s} onClick={() => updateBlock(selectedBlock.id, { style: s })}
                      style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                        background: (selectedBlock.style || 'solid') === s ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.style || 'solid') === s ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.style || 'solid') === s ? '#fff' : '#8b949e' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedBlock.type === 'list' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Listen-Stil</label>
                <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                  {[{ v: 'check', l: '✓ Check' }, { v: 'bullet', l: '• Bullet' }, { v: 'number', l: '1. Nummer' }, { v: 'arrow', l: '→ Pfeil' }].map(o => (
                    <button key={o.v} onClick={() => updateBlock(selectedBlock.id, { style: o.v })}
                      style={{ flex: 1, padding: '4px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                        background: (selectedBlock.style || 'check') === o.v ? '#1f6feb' : '#161b22',
                        border: `1px solid ${(selectedBlock.style || 'check') === o.v ? '#1f6feb' : '#30363d'}`,
                        color: (selectedBlock.style || 'check') === o.v ? '#fff' : '#8b949e' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <label style={labelStyle}>Punkte (einer pro Zeile)</label>
              <textarea
                value={(selectedBlock.items || []).join('\n')}
                onChange={e => updateBlock(selectedBlock.id, { items: e.target.value.split('\n') })}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Punkt 1&#10;Punkt 2&#10;Punkt 3" />
            </>
          )}

          {selectedBlock.type === 'video' && (
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Video URL (YouTube/Vimeo)</label>
              <input type="text" value={selectedBlock.url || ''} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} style={inputStyle} placeholder="https://youtube.com/..." />
            </div>
          )}

          {selectedBlock.type === 'columns' && (
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Aufteilung</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {[{ v: '50/50', l: '50/50' }, { v: '60/40', l: '60/40' }, { v: '40/60', l: '40/60' }, { v: '70/30', l: '70/30' }].map(o => (
                  <button key={o.v} onClick={() => updateBlock(selectedBlock.id, { split: o.v })}
                    style={{ flex: 1, padding: '4px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                      background: (selectedBlock.split || '50/50') === o.v ? '#1f6feb' : '#161b22',
                      border: `1px solid ${(selectedBlock.split || '50/50') === o.v ? '#1f6feb' : '#30363d'}`,
                      color: (selectedBlock.split || '50/50') === o.v ? '#fff' : '#8b949e' }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ==================== CANVAS SECTION PREVIEW ====================

function CanvasSectionPreview({ section, isSelected, onClick, settings, deviceMode }: {
  section: Section; isSelected: boolean; onClick: () => void;
  settings: TemplateSettings; deviceMode: 'desktop' | 'tablet' | 'mobile';
}) {
  const { type, content, styling } = section;
  const primary = settings?.colors?.primary || '#3b82f6';
  const btnBg = styling?.buttonColor || primary;
const btnText = styling?.buttonTextColor || '#ffffff';
  const isMobile = deviceMode !== 'desktop';
  const mob = styling?.mobile || {};
  const isLocked = !!styling?.isLocked;

  const headingSize = (isMobile && mob.headingSize) ? mob.headingSize : (styling?.headingSize || 'clamp(1.75rem, 4vw, 3rem)');
  const wrapStyle: React.CSSProperties = {
    ...getSectionStyle(styling, deviceMode),
    position: 'relative',
    overflow: 'hidden',
    cursor: isLocked ? 'not-allowed' : 'pointer',
    outline: isSelected ? '2px solid #58a6ff' : 'none',
    outlineOffset: '-2px',
    opacity: section.isActive ? 1 : 0.4,
    transition: 'outline 0.1s',
  };

  const innerWidth = styling?.containerWidth === 'narrow' ? { maxWidth: '768px', margin: '0 auto' }
    : styling?.containerWidth === 'full' ? {}
    : { maxWidth: '1100px', margin: '0 auto' };

  const renderContent = () => {
    const h = content.heading || content.title || '';
    const opt = content._optional || {}; 
    const getItems = (): any[] => content.items || content.plans || content.members || content.testimonials || content.faqs || content.stats || [];
    
    switch (type) {
     case 'hero': {
  const layout = content._layout || 'center';
  return (
    <div style={{ ...innerWidth, textAlign: layout === 'center' ? 'center' : 'left', display: layout !== 'center' ? 'flex' : 'block', gap: '2rem', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 800, margin: '0 0 1rem', lineHeight: 1.2 }}>{content.heading || 'Hero Überschrift'}</h1>
        {content.subheading && <p style={{ fontSize: styling?.bodySize || '1.2rem', marginBottom: '1.5rem', opacity: 0.85 }}>{content.subheading}</p>}
        {content.buttonText && <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: btnBg, color: btnText, borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>}
      </div>
      {(layout === 'left' || layout === 'right' || layout === 'split') && content.heroImage && (
        <div style={{ flex: 1, order: layout === 'right' ? -1 : 1 }}>
          <img src={content.heroImage} style={{ width: '100%', borderRadius: '0.5rem' }} />
        </div>
      )}
    </div>
  );
}
      case 'cta': {
  const layout = content._layout || 'center';
  return (
    <div style={{ ...innerWidth, textAlign: layout === 'center' ? 'center' : 'left', display: layout === 'left' ? 'flex' : 'block', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 0.75rem' }}>{h || 'Call to Action'}</h2>
        {content.subheading && layout !== 'left' && <p style={{ marginBottom: '1.25rem', opacity: 0.85 }}>{content.subheading}</p>}
      </div>
      {content.buttonText && <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#ffffff', color: '#0f172a', borderRadius: '0.5rem', fontWeight: 600, flexShrink: 0 }}>{content.buttonText}</span>}
    </div>
  );
}
     case 'features': case 'services': {
  const layout = content._layout || 'grid-3';
  const cols = layout === 'grid-2' ? 2 : layout === 'grid-4' ? 4 : 3;
  return (
    <div style={innerWidth}>
      {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 2rem' }}>{h}</h2>}
      <div style={{ display: layout === 'list' ? 'flex' : 'grid', flexDirection: layout === 'list' ? 'column' : undefined, gridTemplateColumns: layout === 'list' ? undefined : isMobile ? '1fr' : `repeat(${cols}, 1fr)`, gap: '1.5rem' }}>
        {(content.items || []).slice(0, layout === 'grid-4' ? 4 : 3).map((item: any, i: number) => (
          <div key={i} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.06)', textAlign: layout === 'list' ? 'left' : 'center', display: layout === 'list' ? 'flex' : 'block', gap: '1rem', alignItems: 'center' }}>
            {item.icon && <div style={{ fontSize: '2rem', marginBottom: layout === 'list' ? 0 : '0.5rem', flexShrink: 0 }}>{item.icon}</div>}
            <div>
              <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
      case 'about': case 'text':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 1rem' }}>{h}</h2>}
            <p style={{ lineHeight: 1.75, opacity: 0.8, margin: 0 }}>{(content.text || '').replace(/<[^>]*>/g, '') || 'Text hier...'}</p>
          </div>
        );
      case 'stats':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 2rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${Math.min(getItems().length || 4, 4)}, 1fr)`, gap: '2rem' }}>
              {getItems().map((s: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 800, color: primary }}>{s.value}</div>
                  <div style={{ fontWeight: 600, margin: '0.25rem 0 0.1rem' }}>{s.title || s.label}</div>
                  {s.description && <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 2rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {getItems().slice(0, 2).map((t: any, i: number) => (
                <div key={i} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.05)', fontStyle: 'italic' }}>
                  <p style={{ margin: '0 0 0.75rem' }}>„{t.description || t.text}"</p>
                  <p style={{ fontWeight: 600, fontStyle: 'normal', opacity: 0.7, margin: 0 }}>— {t.title || t.name}{(t.subtitle || t.role) ? `, ${t.subtitle || t.role}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'team':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 2rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
              {getItems().slice(0, isMobile ? 2 : 3).map((m: any, i: number) => (
                <div key={i}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: primary, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.75rem', overflow: 'hidden' }}>
                    {m.image ? <img src={m.image} alt={m.title || m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <h3 style={{ fontWeight: 600, margin: '0 0 0.15rem' }}>{m.title || m.name}</h3>
                  <p style={{ opacity: 0.6, fontSize: '0.875rem', margin: 0 }}>{m.subtitle || m.role}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 2rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(getItems().length || 2, 3)}, 1fr)`, gap: '1.5rem' }}>
              {getItems().slice(0, 3).map((p: any, i: number) => (
                <div key={i} style={{ padding: '1.5rem', borderRadius: '0.75rem', background: p.highlighted ? primary : 'rgba(0,0,0,0.05)', color: p.highlighted ? '#fff' : 'inherit', border: `2px solid ${p.highlighted ? primary : 'transparent'}` }}>
                  <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem' }}>{p.title || p.name}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem' }}>{p.price}<span style={{ fontSize: '0.875rem', fontWeight: 400 }}>/{p.interval}</span></div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
                    {(p.features || []).map((f: string, fi: number) => <li key={fi} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>✓ {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 1.5rem' }}>{h || 'Kontakt'}</h2>
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
              {['Name', 'E-Mail', 'Nachricht'].map((f, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', textAlign: 'left', color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>{f}</div>
              ))}
              <div style={{ background: btnBg, color: btnText, borderRadius: '0.5rem', padding: '0.75rem', fontWeight: 600 }}>{content.buttonText || 'Absenden'}</div>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 1.5rem' }}>{h}</h2>}
            {getItems().map((f: any, i: number) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '1rem 0' }}>
                <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>{f.title || f.question}</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{f.description || f.answer}</p>
              </div>
            ))}
          </div>
        );
      case 'gallery':
        return (
          <div style={innerWidth}>
            {(opt.heading ?? true) && h && (
              <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 1.5rem' }}>{h}</h2>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {(content.images?.length > 0 ? content.images.slice(0, 6) : Array(3).fill(null)).map((img: any, i: number) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '2rem', position: 'relative' }}>
                  {img?.url ? <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🖼️'}
                  {(opt.caption ?? false) && img?.caption && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px 8px', fontSize: '0.7rem' }}>{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
            {(opt.button ?? false) && content.buttonText && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: btnBg, color: btnText, borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {(opt.heading ?? true) && h && (
              <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 1.5rem' }}>{h}</h2>
            )}
            <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '0.75rem', aspectRatio: '16/9', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.35)', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem' }}>{content.videoUrl ? '▶️' : '📹'}</span>
              {!content.videoUrl && <span style={{ fontSize: '0.85rem' }}>Video URL eingeben</span>}
            </div>
            {(opt.description ?? false) && content.text && (
              <p style={{ marginTop: '1rem', opacity: 0.75, maxWidth: 500, margin: '1rem auto 0' }}>{content.text}</p>
            )}
            {(opt.button ?? false) && content.buttonText && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: btnBg, color: btnText, borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>
              </div>
            )}
          </div>
        );

      case 'newsletter':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 0.75rem' }}>{h}</h2>}
            {(opt.incentive ?? false) && content.incentiveText && (
              <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 12px', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', border: '1px solid rgba(245,158,11,0.3)' }}>
                {content.incentiveText}
              </div>
            )}
            {(opt.subtext ?? true) && content.text && (
              <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{content.text}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.06)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
                {content.placeholder || 'deine@email.de'}
              </div>
              <div style={{ background: btnBg, color: btnText, borderRadius: '0.5rem', padding: '0.75rem 1.25rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {content.buttonText || 'Abonnieren'}
              </div>
            </div>
            {(opt.gdpr ?? true) && (
              <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.75rem' }}>
                🔒 {content.gdprText || 'Deine Daten sind sicher. Kein Spam.'}
              </p>
            )}
            {(opt.doubleOptIn ?? false) && (
              <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.25rem' }}>
                ✉️ {content.doubleOptInText || 'Du erhältst eine Bestätigungs-E-Mail.'}
              </p>
            )}
          </div>
        );

      case 'booking':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 0.75rem' }}>{h}</h2>}
            {(opt.description ?? true) && content.text && (
              <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{content.text}</p>
            )}
            {(opt.services ?? false) && (content.serviceList || []).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 400, margin: '0 auto 1.5rem', textAlign: 'left' }}>
                {(content.serviceList || []).map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    <span>{s.name}</span>
                    <span style={{ opacity: 0.6 }}>
                      {(opt.duration ?? false) && s.duration && `${s.duration} · `}
                      {(opt.price ?? false) && s.price && s.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <span style={{ display: 'inline-block', background: btnBg, color: btnText, borderRadius: '0.5rem', padding: '0.75rem 2rem', fontWeight: 600 }}>
              {content.buttonText || 'Jetzt buchen'}
            </span>
            {(opt.phone ?? false) && content.contactPhone && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', opacity: 0.6 }}>
                oder ruf an: <strong>{content.contactPhone}</strong>
              </p>
            )}
          </div>
        );
      case 'map':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, textAlign: 'center', margin: '0 0 1.5rem' }}>{h}</h2>}
            <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.75rem', aspectRatio: '16/7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.35)', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <span style={{ fontSize: '0.875rem' }}>{content.address || 'Adresse eingeben'}</span>
            </div>
          </div>
        );
      case 'countdown':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 1rem' }}>{h}</h2>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {['Tage', 'Std', 'Min', 'Sek'].map(u => (
                <div key={u} style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.5rem', padding: '1rem', minWidth: 64 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800 }}>00</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{u}</div>
                </div>
              ))}
            </div>
            {content.text && <p style={{ opacity: 0.7 }}>{content.text}</p>}
          </div>
        );
      case 'social':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 1.5rem' }}>{h}</h2>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {(content.links || []).map((l: any, i: number) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{l.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.platform}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'blog':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, textAlign: 'center', margin: '0 0 1.5rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {Array(content.count || 3).fill(null).map((_, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.2)', fontSize: '1.5rem' }}>📰</div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Blog-Post Titel</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Kurze Beschreibung...</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
     case 'html':
        return (
          <div style={innerWidth}>
            {(opt.heading ?? false) && h && (
              <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 1rem' }}>{h}</h2>
            )}
            {(opt.description ?? false) && content.text && (
              <p style={{ opacity: 0.75, marginBottom: '1rem' }}>{content.text}</p>
            )}
            <div dangerouslySetInnerHTML={{ __html: content.html || '<p style="opacity:0.5">HTML Bereich</p>' }} />
          </div>
        );

      case 'spacer':
        return (
          <div style={{ height: content.height || '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {(opt.line ?? false)
              ? <div style={{ width: '80%', height: 0, borderTop: `${content.lineThickness || '1px'} ${content.lineStyle || 'solid'} ${content.lineColor || '#e5e7eb'}` }} />
              : <span style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(0,0,0,0.12)', padding: '2px 10px', borderRadius: 4 }}>
                  Spacer — {content.height || '80px'}
                </span>
            }
          </div>
        );

      case 'whatsapp':
        return (
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem', background: '#25D366', color: '#fff', borderRadius: '3rem', fontWeight: 600, fontSize: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {(opt.label ?? true) ? (content.label || 'WhatsApp schreiben') : '💬'}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', marginTop: '0.5rem' }}>{content.phone}</p>
            {(opt.tooltip ?? false) && content.tooltip && (
              <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.25rem' }}>💡 {content.tooltip}</p>
            )}
            <p style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.2rem' }}>
              Floating-Button erscheint {content.position === 'left' ? 'unten links' : 'unten rechts'} auf der Website
            </p>
          </div>
        );

      case 'before_after':
        return (
          <div style={innerWidth}>
            {(opt.heading ?? false) && h && (
              <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 1rem', textAlign: 'center' }}>{h}</h2>
            )}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '0.75rem', overflow: 'hidden', background: 'rgba(0,0,0,0.08)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
                {content.beforeImage
                  ? <img src={content.beforeImage} alt="Vorher" style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Vorher-Bild</div>
                }
                {(opt.labels ?? true) && content.beforeLabel && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>{content.beforeLabel}</div>
                )}
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: '50%', overflow: 'hidden' }}>
                {content.afterImage
                  ? <img src={content.afterImage} alt="Nachher" style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '0.875rem' }}>Nachher-Bild</div>
                }
                {(opt.labels ?? true) && content.afterLabel && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>{content.afterLabel}</div>
                )}
              </div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, background: '#fff', transform: 'translateX(-50%)', zIndex: 10 }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 28, height: 28, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#374151', boxShadow: '0 1px 6px rgba(0,0,0,0.2)' }}>↔</div>
              </div>
            </div>
            {(opt.description ?? false) && content.text && (
              <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem', fontSize: '0.875rem' }}>{content.text}</p>
            )}
            {(opt.button ?? false) && content.buttonText && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: btnBg, color: btnText, borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>
              </div>
            )}
          </div>
        );
      case 'freestyle': {
 const blocks: any[] = [...(content.blocks || [])].sort((a: any, b: any) => a.order - b.order);


  const renderBlock = (block: any) => {
    const alignStyle: React.CSSProperties = {
      textAlign: (block.align || 'center') as any,
      display: 'block',
    };

    switch (block.type) {
      case 'heading': {
        const Tag = (block.level || 'h2') as any;
        const sizes: Record<string, string> = { h1: headingSize, h2: '1.75rem', h3: '1.25rem', h4: '1rem' };
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <Tag style={{ fontSize: sizes[block.level || 'h2'], fontWeight: 700, margin: 0 }}>{block.text || 'Überschrift'}</Tag>
          </div>
        );
      }
      case 'text':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <div dangerouslySetInnerHTML={{ __html: block.html || '<p>Text...</p>' }} style={{ lineHeight: 1.6 }} />
          </div>
        );
      case 'button':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <span style={{
              display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
              background: block.style === 'primary' ? primary : block.style === 'outline' ? 'transparent' : 'rgba(0,0,0,0.06)',
              color: block.style === 'primary' ? '#fff' : primary,
              border: block.style === 'outline' ? `2px solid ${primary}` : 'none',
            }}>{block.text || 'Button'}</span>
          </div>
        );
      case 'image':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            {block.url
              ? <img src={block.url} alt={block.alt || ''} style={{ width: block.width || '100%', maxWidth: '100%', borderRadius: '0.5rem', display: 'inline-block' }} />
              : <div style={{ width: block.width || '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.08)', borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '2rem' }}>🖼️</div>
            }
          </div>
        );
      case 'badge':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(88,166,255,0.15)', color: '#58a6ff', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(88,166,255,0.3)' }}>
              {block.text || '🏷️ Badge'}
            </span>
          </div>
        );
      case 'icon':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <span style={{ fontSize: block.size || '3rem', display: 'inline-block' }}>{block.emoji || '⭐'}</span>
          </div>
        );
      case 'spacer':
        return <div key={block.id} style={{ height: block.height || '2rem' }} />;
      case 'divider':
        return (
          <div key={block.id} style={{ marginBottom: '0.75rem' }}>
            <hr style={{ border: 'none', borderTop: `${block.thickness || '1px'} ${block.style || 'solid'} ${block.color || '#e5e7eb'}`, margin: 0 }} />
          </div>
        );
      case 'list': {
        const icons: Record<string, string> = { check: '✓', bullet: '•', arrow: '→', number: '' };
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            {(block.items || []).map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', justifyContent: block.align === 'center' ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start' }}>
                <span style={{ color: primary, fontWeight: 700, flexShrink: 0 }}>
                  {block.style === 'number' ? `${i + 1}.` : icons[block.style || 'check']}
                </span>
                <span style={{ fontSize: '0.875rem' }}>{item}</span>
              </div>
            ))}
          </div>
        );
      }
      case 'video':
        return (
          <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.75rem', aspectRatio: '16/9', maxWidth: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '2rem' }}>
              {block.url ? '▶️' : '📹'}
            </div>
          </div>
        );
      case 'columns':
        return (
          <div key={block.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', padding: '1rem', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', border: '1px dashed rgba(0,0,0,0.15)' }}>
              Linke Spalte
            </div>
            <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', padding: '1rem', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '0.75rem', border: '1px dashed rgba(0,0,0,0.15)' }}>
              Rechte Spalte
            </div>
          </div>
        );
      default:
        return <div key={block.id} style={{ opacity: 0.4, fontSize: '0.75rem', textAlign: 'center' }}>[{block.type}]</div>;
    }
  };

  return (
    <div style={{ ...innerWidth, position: 'relative' }}>
      {/* Freestyle Badge */}
      <div style={{ position: 'absolute', top: -8, right: 0, background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '2px 8px', borderRadius: '2rem', letterSpacing: '0.06em' }}>
        ✦ FREESTYLE
      </div>
      {blocks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.25)', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '0.75rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✦</div>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Freestyle Block — Elemente hinzufügen</p>
        </div>
      ) : (
        <div>{blocks.map(block => renderBlock(block))}</div>
      )}
    </div>
  );
}
      default:
        return <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.875rem' }}>[{type.toUpperCase()}] {section.name}</div>;
    }
  };

return (
    <div style={wrapStyle} onClick={isLocked ? undefined : onClick}>
      {styling?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: `/* Section ${section.id} */ ${styling.customCss}` }} />
      )}

      {/* Hintergrundvideo */}
      {styling?.backgroundVideo && (
        <video autoPlay muted loop playsInline src={styling.backgroundVideo}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      )}

      {/* Farb-Overlay */}
      {styling?.overlayColor && (styling?.overlayOpacity ?? 0) > 0 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: styling.overlayColor, opacity: (styling.overlayOpacity ?? 50) / 100, pointerEvents: 'none' }} />
      )}

      {/* Selection Label */}
      {isSelected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#58a6ff', color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', zIndex: 20, textTransform: 'uppercase' }}>
          ● {section.name}
        </div>
      )}

      {/* Lock Badge */}
      {isLocked && (
        <div style={{ position: 'absolute', top: 4, right: 4, background: '#f0883e', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, zIndex: 20 }}>
          🔒 Gesperrt
        </div>
      )}

      {/* Animation Badge */}
      {styling?.animation?.type && styling.animation.type !== 'none' && (
        <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(88,166,255,0.12)', color: '#58a6ff', fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, zIndex: 15, border: '1px solid rgba(88,166,255,0.25)' }}>
          ✨ {styling.animation.type}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {renderContent()}
      </div>
    </div>
  );
}
// ==================== ELEMENT TOGGLE HELPER ====================

function ElementToggleBar({ 
  elements, content, update 
}: { 
  elements: { key: string; label: string; icon: string; defaultOn?: boolean }[];
  content: SectionContent;
  update: (key: string, val: any) => void;
}) {
  const opt = content._optional || {};
  const isOn = (key: string, defaultOn = true) => opt[key] ?? defaultOn;
  const toggle = (key: string, defaultOn = true) => {
    update('_optional', { ...opt, [key]: !isOn(key, defaultOn) });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: '0.65rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        Elemente ein/ausblenden
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {elements.map(el => {
          const on = isOn(el.key, el.defaultOn ?? false);
          return (
            <button key={el.key} onClick={() => toggle(el.key, el.defaultOn ?? false)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                background: on ? 'rgba(88,166,255,0.15)' : '#0d1117',
                border: `1px solid ${on ? '#58a6ff' : '#30363d'}`,
                color: on ? '#58a6ff' : '#6e7681' }}>
              <span>{el.icon}</span>
              <span>{el.label}</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{on ? '✓' : '+'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// ==================== LIST EDITOR (außerhalb ContentEditor!) ====================

function ListEditor({ field, schema, content, update, inputStyle, labelStyle, wrapStyle }: {
  field: string;
  schema: { key: string; label: string }[];
  content: SectionContent;
  update: (key: string, val: any) => void;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  wrapStyle: React.CSSProperties;
}) {
  const items: any[] = content[field] || [];
  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={labelStyle}>Items ({items.length})</label>
        <button onClick={() => update(field, [...items, Object.fromEntries(schema.map(f => [f.key, '']))])}
          style={{ fontSize: '0.72rem', color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          + Hinzufügen
        </button>
      </div>
      {items.map((item: any, i: number) => (
        <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '10px', marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 600 }}># {i + 1}</span>
            <button onClick={() => update(field, items.filter((_: any, j: number) => j !== i))}
              style={{ fontSize: '0.68rem', color: '#f85149', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          {schema.map(f => (
            <input key={f.key} type="text" placeholder={f.label} value={item[f.key] || ''}
              onChange={e => { const u = [...items]; u[i] = { ...u[i], [f.key]: e.target.value }; update(field, u); }}
              style={{ ...inputStyle, marginBottom: 4, fontSize: '0.75rem' }} />
          ))}
        </div>
      ))}
    </div>
  );
}
// ==================== CONTENT EDITOR ====================

function ContentEditor({ section, onChange, availableForms, availableBookingServices }: {
  section: Section;
  onChange: (c: SectionContent) => void;
  availableForms: { id: string; name: string; slug: string }[];
  availableBookingServices: { id: string; name: string; duration: number; price: number }[];
}) {
  const { type, content } = section;
  const update = (key: string, val: any) => onChange({ ...content, [key]: val });

  const inputStyle: React.CSSProperties = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '8px 10px', fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' };
  const taStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: 4, fontWeight: 600, letterSpacing: '0.03em' };
  const wrapStyle: React.CSSProperties = { marginBottom: '1rem' };

  const Field = (label: string, field: string, multi = false, rows = 3) => (
  <div key={field} style={wrapStyle}>
    <label style={labelStyle}>{label}</label>
    {multi
      ? <textarea value={content[field] || ''} onChange={e => update(field, e.target.value)} rows={rows} style={taStyle} />
      : <input type="text" value={content[field] || ''} onChange={e => update(field, e.target.value)} style={inputStyle} />
    }
  </div>
);

  switch (type) {
  
  case 'hero':
    return (
      <>
        <LayoutToggle type={type} content={content} update={update} /> 
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'subheading', label: 'Unterüberschrift', icon: '📝', defaultOn: true },
          { key: 'button', label: 'Button', icon: '🔘', defaultOn: true },
          { key: 'secondButton', label: '2. Button', icon: '🔘', defaultOn: false },
          { key: 'badge', label: 'Badge', icon: '🏷️', defaultOn: false },
          { key: 'image', label: 'Bild', icon: '🖼️', defaultOn: false },
          { key: 'trustbar', label: 'Trust Bar', icon: '⭐', defaultOn: false },
        ]} />
      {Field("Überschrift", "heading")}
{(content._optional?.subheading ?? true) && Field("Unterüberschrift", "subheading", true, 3)}
{(content._optional?.badge ?? false) && Field("Badge Text (z.B. 🔥 Neu)", "badge")}
{(content._optional?.button ?? true) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
{(content._optional?.secondButton ?? false) && <>{Field("2. Button Text", "button2Text")}{Field("2. Button Link", "button2Link")}</>}
{(content._optional?.image ?? false) && Field("Bild URL", "heroImage")}
{(content._optional?.trustbar ?? false) && Field("Trust Text", "trustText")}
      </>
    );

  case 'cta':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'subheading', label: 'Untertext', icon: '📝', defaultOn: true },
          { key: 'button', label: 'Button', icon: '🔘', defaultOn: true },
          { key: 'secondButton', label: '2. Button', icon: '🔘', defaultOn: false },
          { key: 'guarantee', label: 'Garantie-Text', icon: '🛡️', defaultOn: false },
        ]} />
       {Field("Überschrift", "heading")}
{(content._optional?.subheading ?? true) && Field("Unterüberschrift", "subheading", true, 2)}
{(content._optional?.button ?? true) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
{(content._optional?.secondButton ?? false) && <>{Field("2. Button Text", "button2Text")}{Field("2. Button Link", "button2Link")}</>}
{(content._optional?.guarantee ?? false) && Field("Garantie Text", "guaranteeText")}

      </>
    );

  case 'text': case 'about':
    
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'button', label: 'Button', icon: '🔘', defaultOn: false },
          { key: 'image', label: 'Bild daneben', icon: '🖼️', defaultOn: false },
          { key: 'checklist', label: 'Checkliste', icon: '✅', defaultOn: false },
          { key: 'signature', label: 'Unterschrift', icon: '✍️', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
{Field("Text (HTML erlaubt)", "text", true, 8)}
{(content._optional?.image ?? false) && Field("Bild URL", "sideImage")}
{(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
{(content._optional?.signature ?? false) && <>{Field("Name / Unterschrift", "signatureName")}{Field("Titel", "signatureRole")}</>}
      </>
    );

  case 'features': case 'services':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'subheading', label: 'Unterüberschrift', icon: '📝', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
          { key: 'link', label: 'Link pro Item', icon: '🔗', defaultOn: false },
        ]} />
       {Field("Überschrift", "heading")}
{(content._optional?.subheading ?? false) && Field("Unterüberschrift", "subheading", true, 2)}
{(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
        <ListEditor field="items" schema={[
          { key: 'icon', label: 'Icon (Emoji)' },
          { key: 'title', label: 'Titel' },
          { key: 'description', label: 'Beschreibung' },
          ...(type === 'services' ? [{ key: 'price', label: 'Preis' }] : []),
          ...((content._optional?.link ?? false) ? [{ key: 'linkUrl', label: 'Link URL' }, { key: 'linkText', label: 'Link Text' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
        {(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
      </>
    );

  case 'testimonials':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'stars', label: 'Sterne', icon: '⭐', defaultOn: false },
          { key: 'platform', label: 'Plattform', icon: '🌐', defaultOn: false },
          { key: 'totalRating', label: 'Gesamt-Bewertung', icon: '📊', defaultOn: false },
        ]} />
      {Field("Überschrift", "heading")}
{(content._optional?.totalRating ?? false) && <>
  {Field("Gesamt-Bewertung (z.B. 4.9)", "ratingValue")}
  {Field("Anzahl Bewertungen", "ratingCount")}
</>}
        <ListEditor field="items" schema={[
          { key: 'title', label: 'Name' },
          { key: 'subtitle', label: 'Rolle / Firma' },
          { key: 'description', label: 'Bewertungstext' },
          ...((content._optional?.stars ?? false) ? [{ key: 'stars', label: 'Sterne (1-5)' }] : []),
          ...((content._optional?.platform ?? false) ? [{ key: 'platform', label: 'Plattform (z.B. Google)' }] : []),
          { key: 'image', label: 'Foto URL (optional)' },
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
      </>
    );

  case 'pricing':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'badge', label: 'Badges', icon: '🏷️', defaultOn: false },
          { key: 'guarantee', label: 'Garantie', icon: '🛡️', defaultOn: false },
        ]} />
       {Field("Überschrift", "heading")}
{(content._optional?.guarantee ?? false) && Field("Garantie Text", "guaranteeText")}
        <ListEditor field="items" schema={[
          { key: 'title', label: 'Paket-Name' },
          { key: 'price', label: 'Preis' },
          { key: 'interval', label: 'Intervall' },
          { key: 'buttonText', label: 'Button Text' },
          ...((content._optional?.badge ?? false) ? [{ key: 'badge', label: 'Badge (z.B. Beliebt ⭐)' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
       </>
    );

  case 'contact':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'phone', label: 'Telefon', icon: '📞', defaultOn: false },
          { key: 'email', label: 'E-Mail', icon: '📧', defaultOn: false },
          { key: 'address', label: 'Adresse', icon: '📍', defaultOn: false },
          { key: 'hours', label: 'Öffnungszeiten', icon: '🕐', defaultOn: false },
          { key: 'gdpr', label: 'DSGVO Checkbox', icon: '🔒', defaultOn: true },
        ]} />
        {availableForms.length > 0 && (
  <div style={wrapStyle}>
    <label style={labelStyle}>Formular aus Form Builder wählen</label>
    <select
      value={content.formSlug || ''}
      onChange={e => update('formSlug', e.target.value)}
      style={{ ...inputStyle, width: '100%' }}
    >
      <option value="">— Standard Kontaktformular —</option>
      {availableForms.map(f => (
        <option key={f.id} value={f.slug}>{f.name}</option>
      ))}
    </select>
    {content.formSlug && (
      <p style={{ fontSize: '0.68rem', color: '#2ea043', marginTop: 4 }}>
        ✓ Formular „{availableForms.find(f => f.slug === content.formSlug)?.name}" wird verwendet
      </p>
    )}
  </div>
)}
      {Field("Überschrift", "heading")}
{Field("Unterüberschrift", "subheading", true, 2)}
{Field("Button Text", "buttonText")}
{(content._optional?.phone ?? false) && Field("Telefonnummer", "contactPhone")}
{(content._optional?.email ?? false) && Field("E-Mail Adresse", "contactEmail")}
{(content._optional?.address ?? false) && Field("Adresse", "contactAddress")}
{(content._optional?.hours ?? false) && Field("Öffnungszeiten", "openingHours", true, 3)}
{(content._optional?.gdpr ?? true) && Field("DSGVO Text", "gdprText")}
      </>
    );
 case 'stats':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'description', label: 'Beschreibung pro Item', icon: '📝', defaultOn: true },
          { key: 'icon', label: 'Icon pro Item', icon: '🎨', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}

        <ListEditor field="items" schema={[
          { key: 'value', label: 'Wert (z.B. 1.000+)' },
          { key: 'title', label: 'Bezeichnung' },
          ...((content._optional?.description ?? true) ? [{ key: 'description', label: 'Beschreibung' }] : []),
          ...((content._optional?.icon ?? false) ? [{ key: 'icon', label: 'Icon (Emoji)' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
       {(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}

      </>
    );

  case 'team':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'bio', label: 'Bio-Text', icon: '📝', defaultOn: true },
          { key: 'image', label: 'Foto', icon: '📷', defaultOn: true },
          { key: 'social', label: 'Social Links', icon: '🌐', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}

        <ListEditor field="items" schema={[
          { key: 'title', label: 'Name' },
          { key: 'subtitle', label: 'Position / Rolle' },
          ...((content._optional?.bio ?? true) ? [{ key: 'description', label: 'Bio' }] : []),
          ...((content._optional?.image ?? true) ? [{ key: 'image', label: 'Foto URL' }] : []),
          ...((content._optional?.social ?? false) ? [{ key: 'linkedin', label: 'LinkedIn URL' }, { key: 'twitter', label: 'Twitter URL' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
       {(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}

      </>
    );

  case 'gallery':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'caption', label: 'Bildunterschrift', icon: '📝', defaultOn: false },
          { key: 'lightbox', label: 'Lightbox', icon: '🔍', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}

        <ListEditor field="images" schema={[
          { key: 'url', label: 'Bild URL' },
          { key: 'alt', label: 'Alt-Text' },
          ...((content._optional?.caption ?? false) ? [{ key: 'caption', label: 'Bildunterschrift' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
        {(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
      </>
    );

  case 'faq':
    return (
      <>
         <LayoutToggle type={type} content={content} update={update} />
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'subheading', label: 'Unterüberschrift', icon: '📝', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
          { key: 'categories', label: 'Kategorien', icon: '🗂️', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
     {(content._optional?.subheading ?? false) && Field("Unterüberschrift", "subheading", true, 2)}
        <ListEditor field="items" schema={[
          { key: 'title', label: 'Frage' },
          { key: 'description', label: 'Antwort' },
          ...((content._optional?.categories ?? false) ? [{ key: 'category', label: 'Kategorie' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
        {(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
      </>
    );

  case 'video':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'description', label: 'Beschreibung', icon: '📝', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
          { key: 'autoplay', label: 'Autoplay', icon: '▶️', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
{Field("Video URL (YouTube/Vimeo/MP4)", "videoUrl")}
{Field("Poster Bild URL", "videoPoster")}
{(content._optional?.description ?? false) && Field("Beschreibung", "text", true, 3)}
{(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
      </>
    );

  case 'newsletter':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'subtext', label: 'Beschreibung', icon: '📝', defaultOn: true },
          { key: 'gdpr', label: 'DSGVO Hinweis', icon: '🔒', defaultOn: true },
          { key: 'nameField', label: 'Vorname-Feld', icon: '👤', defaultOn: false },
          { key: 'doubleOptIn', label: 'Double Opt-In Hinweis', icon: '✉️', defaultOn: false },
          { key: 'incentive', label: 'Lead Magnet Text', icon: '🎁', defaultOn: false },
        ]} />
     {Field("Überschrift", "heading")}
{(content._optional?.subtext ?? true) && Field("Beschreibung", "text", true, 2)}
{(content._optional?.incentive ?? false) && Field("Lead Magnet (z.B. 🎁 Gratis PDF)", "incentiveText")}
{Field("Button Text", "buttonText")}
{Field("Placeholder E-Mail", "placeholder")}
{(content._optional?.gdpr ?? true) && Field("DSGVO Text", "gdprText")}
{(content._optional?.doubleOptIn ?? false) && Field("Double Opt-In Hinweis", "doubleOptInText")}
      </>
    );

  case 'booking':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'description', label: 'Beschreibung', icon: '📝', defaultOn: true },
          { key: 'services', label: 'Service-Liste', icon: '⚙️', defaultOn: false },
          { key: 'phone', label: 'Telefon Alternative', icon: '📞', defaultOn: false },
          { key: 'duration', label: 'Dauer anzeigen', icon: '⏱️', defaultOn: false },
          { key: 'price', label: 'Preis anzeigen', icon: '💶', defaultOn: false },
        ]} />
        {availableBookingServices.length > 0 && (
  <div style={wrapStyle}>
    <label style={labelStyle}>Services aus Booking importieren</label>
    <button
      onClick={() => update('serviceList', availableBookingServices.map(s => ({
        name: s.name,
        duration: `${s.duration} Min`,
        price: s.price ? `€${s.price}` : '',
      })))}
      style={{ width: '100%', padding: '7px', background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
    >
      ↓ {availableBookingServices.length} Services importieren
    </button>
  </div>
)}
      {Field("Überschrift", "heading")}
{(content._optional?.description ?? true) && Field("Beschreibung", "text", true, 3)}
{Field("Button Text", "buttonText")}
{Field("Booking URL / Link", "buttonLink")}
{(content._optional?.phone ?? false) && Field("Telefon als Alternative", "contactPhone")}
        {(content._optional?.services ?? false) && (
          <ListEditor field="serviceList" schema={[
            { key: 'name', label: 'Service Name' },
            ...((content._optional?.duration ?? false) ? [{ key: 'duration', label: 'Dauer (z.B. 60 Min)' }] : []),
            ...((content._optional?.price ?? false) ? [{ key: 'price', label: 'Preis' }] : []),
          ]} content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle} />
        )}
      </>
    );

  case 'map':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'address', label: 'Adresse Text', icon: '📍', defaultOn: true },
          { key: 'hours', label: 'Öffnungszeiten', icon: '🕐', defaultOn: false },
          { key: 'phone', label: 'Telefon', icon: '📞', defaultOn: false },
          { key: 'directions', label: 'Routenplaner Button', icon: '🧭', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
{(content._optional?.address ?? true) && Field("Adresse (Text)", "address")}
{Field("Google Maps Embed URL", "embedUrl")}
{(content._optional?.hours ?? false) && Field("Öffnungszeiten", "openingHours", true, 4)}
{(content._optional?.phone ?? false) && Field("Telefonnummer", "contactPhone")}
{(content._optional?.directions ?? false) && Field("Google Maps Link (für Routenplaner)", "directionsUrl")}
      </>
    );

  case 'countdown':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'subtext', label: 'Beschreibung', icon: '📝', defaultOn: true },
          { key: 'button', label: 'Button', icon: '🔘', defaultOn: false },
          { key: 'expiredText', label: 'Abgelaufen-Text', icon: '⏰', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
{Field("Zieldatum (YYYY-MM-DD)", "targetDate")}
{(content._optional?.subtext ?? true) && Field("Beschreibung", "text")}
{(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
{(content._optional?.expiredText ?? false) && Field("Text wenn abgelaufen", "expiredText")}
      </>
    );

  case 'social':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'followerCount', label: 'Follower-Anzahl', icon: '👥', defaultOn: false },
          { key: 'description', label: 'Beschreibung', icon: '📝', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
{(content._optional?.description ?? false) && Field("Beschreibung", "text", true, 2)}
        <ListEditor field="links" schema={[
          { key: 'platform', label: 'Plattform' },
          { key: 'url', label: 'URL' },
          { key: 'icon', label: 'Icon (Emoji)' },
          ...((content._optional?.followerCount ?? false) ? [{ key: 'followers', label: 'Follower (z.B. 12.4K)' }] : []),
        ]}
        content={content} update={update} inputStyle={inputStyle} labelStyle={labelStyle} wrapStyle={wrapStyle}/>
      </>
    );

  case 'blog':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: true },
          { key: 'button', label: 'Alle anzeigen Button', icon: '🔘', defaultOn: false },
          { key: 'category', label: 'Kategorie-Filter', icon: '🗂️', defaultOn: false },
          { key: 'author', label: 'Autor anzeigen', icon: '👤', defaultOn: false },
        ]} />
        {(content._optional?.heading ?? true) && Field("Überschrift", "heading")}
        <div style={wrapStyle}>
          <label style={labelStyle}>Anzahl Posts</label>
          <select value={content.count || 3} onChange={e => update('count', Number(e.target.value))} style={{ ...inputStyle, width: '100%' }}>
            {[3, 6, 9, 12].map(n => <option key={n} value={n}>{n} Posts</option>)}
          </select>
        </div>
       {(content._optional?.button ?? false) && <>{Field("Button Text (z.B. Alle Beiträge)", "buttonText")}{Field("Button Link", "buttonLink")}</>}

      </>
    );

  case 'html':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: false },
          { key: 'description', label: 'Beschreibung', icon: '📝', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? false) && Field("Überschrift", "heading")}
{(content._optional?.description ?? false) && Field("Beschreibung", "text", true, 2)}
        <div style={wrapStyle}>
          <label style={labelStyle}>HTML Code</label>
          <textarea value={content.html || ''} onChange={e => update('html', e.target.value)} rows={14} spellCheck={false}
            style={{ ...taStyle, fontFamily: '"SF Mono", monospace', fontSize: '0.73rem', color: '#79c0ff' }} />
        </div>
      </>
    );

  case 'before_after':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'heading', label: 'Überschrift', icon: '📌', defaultOn: false },
          { key: 'labels', label: 'Vorher/Nachher Labels', icon: '🏷️', defaultOn: true },
          { key: 'description', label: 'Beschreibung unten', icon: '📝', defaultOn: false },
          { key: 'button', label: 'Button unten', icon: '🔘', defaultOn: false },
        ]} />
       {(content._optional?.heading ?? false) && Field("Überschrift", "heading")}

        <div style={wrapStyle}>
          <label style={labelStyle}>Vorher-Bild URL</label>
          <input type="text" value={content.beforeImage || ''} onChange={e => update('beforeImage', e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
        <div style={wrapStyle}>
          <label style={labelStyle}>Nachher-Bild URL</label>
          <input type="text" value={content.afterImage || ''} onChange={e => update('afterImage', e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
       {(content._optional?.labels ?? true) && <>
  {Field("Vorher-Label", "beforeLabel")}
  {Field("Nachher-Label", "afterLabel")}
</>}
{(content._optional?.description ?? false) && Field("Beschreibung", "text", true, 2)}
{(content._optional?.button ?? false) && <>{Field("Button Text", "buttonText")}{Field("Button Link", "buttonLink")}</>}
      </>
    );

  case 'whatsapp':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'label', label: 'Button Text', icon: '💬', defaultOn: true },
          { key: 'message', label: 'Vorausgefüllte Nachricht', icon: '✉️', defaultOn: true },
          { key: 'pulseAnimation', label: 'Puls-Animation', icon: '✨', defaultOn: false },
          { key: 'tooltip', label: 'Tooltip Text', icon: '💡', defaultOn: false },
        ]} />
        {Field("Telefonnummer (mit Ländercode)", "phone")}
{(content._optional?.message ?? true) && Field("Vorausgefüllte Nachricht", "message", true, 3)}
{(content._optional?.label ?? true) && Field("Button-Text", "label")}
{(content._optional?.tooltip ?? false) && Field("Tooltip Text", "tooltip")}
        <div style={wrapStyle}>
          <label style={labelStyle}>Position auf der Website</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: 'right', l: '➡ Rechts' }, { v: 'left', l: '⬅ Links' }].map(o => (
              <button key={o.v} onClick={() => update('position', o.v)}
                style={{ flex: 1, padding: '6px', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  background: (content.position || 'right') === o.v ? '#1f6feb' : '#0d1117',
                  border: `1px solid ${(content.position || 'right') === o.v ? '#1f6feb' : '#30363d'}`,
                  color: (content.position || 'right') === o.v ? '#fff' : '#8b949e' }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </>
    );

  case 'spacer':
    return (
      <>
        <ElementToggleBar content={content} update={update} elements={[
          { key: 'line', label: 'Trennlinie', icon: '—', defaultOn: false },
          { key: 'gradient', label: 'Gradient Linie', icon: '🌈', defaultOn: false },
        ]} />
        <div style={wrapStyle}>
          <label style={labelStyle}>Höhe</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
            {['40px','60px','80px','100px','120px','160px'].map(h => (
              <button key={h} onClick={() => update('height', h)}
                style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                  background: content.height === h ? '#1f6feb' : '#0d1117',
                  border: `1px solid ${content.height === h ? '#1f6feb' : '#30363d'}`,
                  color: content.height === h ? '#fff' : '#8b949e' }}>
                {h}
              </button>
            ))}
          </div>
          <input type="text" value={content.height || ''} onChange={e => update('height', e.target.value)} placeholder="z.B. 80px" style={inputStyle} />
        </div>
        {(content._optional?.line ?? false) && (
          <>
            <div style={wrapStyle}>
              <label style={labelStyle}>Linienfarbe</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={content.lineColor || '#e5e7eb'} onChange={e => update('lineColor', e.target.value)}
                  style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
                <input type="text" value={content.lineColor || ''} onChange={e => update('lineColor', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={wrapStyle}>
              <label style={labelStyle}>Linienstil</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {['solid','dashed','dotted'].map(s => (
                  <button key={s} onClick={() => update('lineStyle', s)}
                    style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                      background: (content.lineStyle || 'solid') === s ? '#1f6feb' : '#0d1117',
                      border: `1px solid ${(content.lineStyle || 'solid') === s ? '#1f6feb' : '#30363d'}`,
                      color: (content.lineStyle || 'solid') === s ? '#fff' : '#8b949e' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          {Field("Linienstärke", "lineThickness")}
          </>
          
        )}
        

      </>
      );
    
case 'freestyle':
    return <FreestyleEditor content={content} onChange={onChange} />;
  default:
    return <p style={{ color: '#6e7681', fontSize: '0.8rem' }}>Kein Editor für: {type}</p>;
  } 
  } 
// ==================== STYLE PANEL ====================

function StylePanel({ section, onChange, onPickMedia }: { section: Section; onChange: (s: Partial<SectionStyling>) => void; onPickMedia: (cb: (url: string) => void) => void }) {
  const st = section.styling || {};
  const inputStyle: React.CSSProperties = { flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.75rem', outline: 'none' };
  const sectionLabel: React.CSSProperties = { fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, marginTop: 16, display: 'block' };

  return (
    <div>
      {/* Hintergrund Presets */}
      <span style={{ ...sectionLabel, marginTop: 0 }}>Hintergrund-Presets</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 14 }}>
        {BG_PRESETS.map(p => (
          <button key={p.label} title={p.label} onClick={() => onChange({ backgroundColor: p.bg, textColor: p.text })}
            style={{ height: 38, borderRadius: 6, border: `2px solid ${st.backgroundColor === p.bg ? '#58a6ff' : '#21262d'}`, cursor: 'pointer', background: p.bg, position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', fontSize: '0.52rem', color: p.text, fontWeight: 600 }}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Hintergrundfarbe */}
      <span style={sectionLabel}>Hintergrundfarbe</span>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <input type="color" value={st.backgroundColor?.startsWith('#') ? st.backgroundColor : '#ffffff'} onChange={e => onChange({ backgroundColor: e.target.value })}
          style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
        <input type="text" placeholder="#ffffff oder CSS Gradient" value={st.backgroundColor || ''} onChange={e => onChange({ backgroundColor: e.target.value })} style={inputStyle} />
      </div>

      {/* Textfarbe */}
      <span style={sectionLabel}>Textfarbe</span>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <input type="color" value={st.textColor || '#1f2937'} onChange={e => onChange({ textColor: e.target.value })}
          style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
        <input type="text" placeholder="#1f2937" value={st.textColor || ''} onChange={e => onChange({ textColor: e.target.value })} style={inputStyle} />
      </div>

      {/* Hintergrundbild */}
      <span style={sectionLabel}>Hintergrundbild URL</span>
     <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input type="text" placeholder="https://..." value={st.backgroundImage || ''} onChange={e => onChange({ backgroundImage: e.target.value })}
          style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => onPickMedia((url) => onChange({ backgroundImage: url }))}
          style={{ background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          🖼️
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['cover', 'contain', 'auto'] as const).map(s => (
          <button key={s} onClick={() => onChange({ backgroundSize: s })}
            style={{ flex: 1, padding: '5px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: st.backgroundSize === s ? '#1f6feb' : '#0d1117', border: `1px solid ${st.backgroundSize === s ? '#1f6feb' : '#30363d'}`, color: st.backgroundSize === s ? '#fff' : '#8b949e' }}>
            {s}
          </button>
        ))}
      </div>
      {/* ── HINTERGRUNDVIDEO ── */}
      <span style={sectionLabel}>Hintergrundvideo URL</span>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <input type="text" placeholder="https://...mp4" value={st.backgroundVideo || ''} onChange={e => onChange({ backgroundVideo: e.target.value })}
          style={{ ...inputStyle, flex: 1 }} />
        {st.backgroundVideo && (
          <button onClick={() => onChange({ backgroundVideo: '' })}
            style={{ background: '#3d1010', border: '1px solid #f85149', borderRadius: 6, color: '#f85149', padding: '7px 10px', fontSize: '0.72rem', cursor: 'pointer' }}>✕</button>
        )}
      </div>

      {/* ── FARB-OVERLAY ── */}
      <span style={sectionLabel}>Farb-Overlay (über Bild/Video)</span>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
        <input type="color" value={st.overlayColor?.startsWith('#') ? st.overlayColor : '#000000'} onChange={e => onChange({ overlayColor: e.target.value })}
          style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
        <input type="text" placeholder="#000000" value={st.overlayColor || ''} onChange={e => onChange({ overlayColor: e.target.value })} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <input type="range" min={0} max={100} value={st.overlayOpacity ?? 0} onChange={e => onChange({ overlayOpacity: Number(e.target.value) })}
          style={{ flex: 1 }} />
        <span style={{ fontSize: '0.72rem', color: '#8b949e', minWidth: 32, textAlign: 'right' }}>{st.overlayOpacity ?? 0}%</span>
      </div>
      {/* ── BUTTON-FARBEN ── */}
<span style={sectionLabel}>Button-Farbe (diese Section)</span>
<div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
  <input type="color" value={st.buttonColor?.startsWith('#') ? st.buttonColor : '#3b82f6'}
    onChange={e => onChange({ buttonColor: e.target.value })}
    style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
  <input type="text" placeholder="leer = Template-Farbe" value={st.buttonColor || ''}
    onChange={e => onChange({ buttonColor: e.target.value })} style={inputStyle} />
  {st.buttonColor && (
    <button onClick={() => onChange({ buttonColor: '' })}
      style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>✕</button>
  )}
</div>
<span style={sectionLabel}>Button-Textfarbe</span>
<div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
  <input type="color" value={st.buttonTextColor?.startsWith('#') ? st.buttonTextColor : '#ffffff'}
    onChange={e => onChange({ buttonTextColor: e.target.value })}
    style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
  <input type="text" placeholder="leer = #ffffff" value={st.buttonTextColor || ''}
    onChange={e => onChange({ buttonTextColor: e.target.value })} style={inputStyle} />
</div>

      {/* ── TYPOGRAFIE ── */}
      <span style={sectionLabel}>Schriftart</span>
      <select value={st.fontFamily || ''} onChange={e => {
        const font = FONT_PRESETS.find(f => f.value === e.target.value);
        if (font) loadGoogleFont(font.google);
        onChange({ fontFamily: e.target.value });
      }}
        style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '8px 10px', fontSize: '0.8rem', marginBottom: 10, boxSizing: 'border-box', outline: 'none' }}>
        <option value="">— Vom Template erben —</option>
        {FONT_PRESETS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
      </select>

      <span style={sectionLabel}>Überschriften-Größe</span>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {['1.5rem', '2rem', '2.5rem', '3rem', '3.5rem', '4rem', 'clamp(1.75rem,4vw,3rem)'].map(s => (
          <button key={s} onClick={() => onChange({ headingSize: s })}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: st.headingSize === s ? '#1f6feb' : '#0d1117', border: `1px solid ${st.headingSize === s ? '#1f6feb' : '#30363d'}`, color: st.headingSize === s ? '#fff' : '#8b949e' }}>
            {s === 'clamp(1.75rem,4vw,3rem)' ? 'fluid' : s}
          </button>
        ))}
      </div>
      <input type="text" placeholder="z.B. 2.5rem oder clamp(2rem,5vw,4rem)" value={st.headingSize || ''} onChange={e => onChange({ headingSize: e.target.value })}
        style={{ ...inputStyle, width: '100%', marginBottom: 10, boxSizing: 'border-box' }} />

      <span style={sectionLabel}>Fließtext-Größe</span>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {['0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem'].map(s => (
          <button key={s} onClick={() => onChange({ bodySize: s })}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: st.bodySize === s ? '#1f6feb' : '#0d1117', border: `1px solid ${st.bodySize === s ? '#1f6feb' : '#30363d'}`, color: st.bodySize === s ? '#fff' : '#8b949e' }}>
            {s}
          </button>
        ))}
      </div>

      <span style={sectionLabel}>Schriftgewicht</span>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        {[{ v: '300', l: 'Light' }, { v: '400', l: 'Regular' }, { v: '600', l: 'Semi' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extra' }, { v: '900', l: 'Black' }].map(w => (
          <button key={w.v} onClick={() => onChange({ fontWeight: w.v })}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: st.fontWeight === w.v ? '#1f6feb' : '#0d1117', border: `1px solid ${st.fontWeight === w.v ? '#1f6feb' : '#30363d'}`, color: st.fontWeight === w.v ? '#fff' : '#8b949e' }}>
            {w.l}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <span style={sectionLabel}>Zeilenhöhe</span>
          <input type="text" placeholder="1.6" value={st.lineHeight || ''} onChange={e => onChange({ lineHeight: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <span style={sectionLabel}>Buchstabenabstand</span>
          <input type="text" placeholder="0.02em" value={st.letterSpacing || ''} onChange={e => onChange({ letterSpacing: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
  );
}

// ==================== LAYOUT PANEL ====================

function LayoutPanel({ section, onChange, deviceMode }: {
  section: Section; onChange: (s: Partial<SectionStyling>) => void; deviceMode: 'desktop' | 'tablet' | 'mobile';
}) {
  const st = section.styling || {};
  const [mobileMode, setMobileMode] = useState(false);
  const pad = mobileMode ? (st.mobile?.padding || {}) : (st.padding || {});
  const textAlign = mobileMode ? (st.mobile?.textAlign || '') : (st.textAlign || '');

  const updatePad = (field: string, val: string) => {
    if (mobileMode) {
      onChange({ mobile: { ...st.mobile, padding: { ...(st.mobile?.padding || {}), [field]: val } } });
    } else {
      onChange({ padding: { ...(st.padding || {}), [field]: val } });
    }
  };

  const updateAlign = (val: string) => {
    if (mobileMode) {
      onChange({ mobile: { ...st.mobile, textAlign: val as any } });
    } else {
      onChange({ textAlign: val as any });
    }
  };

  const BtnGroup = ({ label, options, value, onSelect }: { label: string; options: { val: string; label: string }[]; value: string; onSelect: (v: string) => void }) => (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', gap: 5 }}>
        {options.map(o => (
          <button key={o.val} onClick={() => onSelect(o.val)}
            style={{ flex: 1, padding: '7px 4px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', background: value === o.val ? '#1f6feb' : '#0d1117', border: `1px solid ${value === o.val ? '#1f6feb' : '#30363d'}`, color: value === o.val ? '#fff' : '#8b949e' }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  const PadInput = ({ field, label }: { field: string; label: string }) => (
    <div style={{ textAlign: 'center' }}>
      <input type="text" placeholder="—" value={(pad as any)[field] || ''} onChange={e => updatePad(field, e.target.value)}
        style={{ width: '100%', background: '#0d1117', border: `1px solid ${mobileMode ? '#f0883e' : '#30363d'}`, borderRadius: 4, color: '#c9d1d9', padding: '6px', fontSize: '0.73rem', textAlign: 'center', boxSizing: 'border-box', outline: 'none' }} />
      <span style={{ fontSize: '0.62rem', color: '#6e7681', display: 'block', marginTop: 2 }}>{label}</span>
    </div>
  );

  return (
    <div>
      {/* Desktop / Mobile Toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#0d1117', borderRadius: 8, padding: 4, border: '1px solid #21262d' }}>
        <button onClick={() => setMobileMode(false)}
          style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: !mobileMode ? '#1f6feb' : 'transparent', border: 'none', color: !mobileMode ? '#fff' : '#6e7681' }}>
          🖥 Desktop
        </button>
        <button onClick={() => setMobileMode(true)}
          style={{ flex: 1, padding: '6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: mobileMode ? '#f0883e' : 'transparent', border: 'none', color: mobileMode ? '#fff' : '#6e7681' }}>
          📱 Mobile
        </button>
      </div>
      {mobileMode && (
        <p style={{ fontSize: '0.7rem', color: '#f0883e', marginBottom: 12, background: 'rgba(240,136,62,0.1)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(240,136,62,0.3)' }}>
          Mobile-spezifische Einstellungen überschreiben Desktop auf kleinen Screens.
        </p>
      )}

      {/* Container-Breite (nur Desktop) */}
      {!mobileMode && (
        <BtnGroup label="Container-Breite" value={st.containerWidth || ''} onSelect={v => onChange({ containerWidth: v as any })}
          options={[{ val: 'narrow', label: 'Schmal' }, { val: 'normal', label: 'Normal' }, { val: 'full', label: 'Voll' }]} />
      )}

      {/* Textausrichtung */}
      <BtnGroup label={mobileMode ? 'Textausrichtung (Mobile)' : 'Textausrichtung'} value={textAlign}
        onSelect={updateAlign} options={[{ val: 'left', label: '⬅ Links' }, { val: 'center', label: '↔ Mitte' }, { val: 'right', label: '➡ Rechts' }]} />

      {/* Mobile Hintergrundfarbe */}
      {mobileMode && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Hintergrundfarbe (Mobile)</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={st.mobile?.backgroundColor?.startsWith('#') ? st.mobile.backgroundColor : '#ffffff'} onChange={e => onChange({ mobile: { ...st.mobile, backgroundColor: e.target.value } })}
              style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
            <input type="text" placeholder="leer = Desktop-Farbe verwenden" value={st.mobile?.backgroundColor || ''} onChange={e => onChange({ mobile: { ...st.mobile, backgroundColor: e.target.value } })}
              style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.75rem', outline: 'none' }} />
          </div>
        </div>
      )}

      {/* Mobile Schriftgröße */}
      {mobileMode && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Fließtext-Größe (Mobile)</p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['0.875rem', '1rem', '1.125rem'].map(s => (
              <button key={s} onClick={() => onChange({ mobile: { ...st.mobile, fontSize: s } })}
                style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: st.mobile?.fontSize === s ? '#f0883e' : '#0d1117', border: `1px solid ${st.mobile?.fontSize === s ? '#f0883e' : '#30363d'}`, color: st.mobile?.fontSize === s ? '#fff' : '#8b949e' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Padding */}
      <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        {mobileMode ? '📱 Innenabstand (Mobile)' : 'Innenabstand (Padding)'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, maxWidth: 180, margin: '0 auto 12px' }}>
        <div /><PadInput field="top" label="Oben" /><div />
        <PadInput field="left" label="Links" />
        <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d444d', fontSize: '1rem' }}>□</div>
        <PadInput field="right" label="Rechts" />
        <div /><PadInput field="bottom" label="Unten" /><div />
      </div>

      {/* Quick Presets */}
      <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, marginBottom: 6 }}>Quick-Presets</p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[{ label: 'Kein', v: '0' }, { label: 'XS', v: '1rem' }, { label: 'S', v: '2rem' }, { label: 'M', v: '3rem' }, { label: 'L', v: '5rem' }, { label: 'XL', v: '8rem' }].map(p => (
          <button key={p.label} onClick={() => {
            const padObj = { top: p.v, bottom: p.v, left: p.v === '0' ? '0' : '1.5rem', right: p.v === '0' ? '0' : '1.5rem' };
            if (mobileMode) onChange({ mobile: { ...st.mobile, padding: padObj } });
            else onChange({ padding: padObj });
          }}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', background: '#0d1117', border: '1px solid #30363d', color: '#8b949e' }}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== CSS PANEL ====================

function CssPanel({ section, onChange }: { section: Section; onChange: (s: Partial<SectionStyling>) => void }) {
  const css = section.styling?.customCss || '';
  const [localCss, setLocalCss] = useState(css);

  // Sync wenn andere Section ausgewählt wird
  useEffect(() => { setLocalCss(section.styling?.customCss || ''); }, [section.id]);

  return (
    <div>
      <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
        <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: '0 0 4px' }}>💡 Custom CSS</p>
        <p style={{ fontSize: '0.7rem', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
          CSS wird direkt auf diese Section angewendet. Nutze <code style={{ background: '#0d1117', padding: '1px 4px', borderRadius: 3 }}>section</code> als Selektor für das Root-Element.
        </p>
      </div>

      <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>CSS Code</p>
      <textarea
        value={localCss}
        onChange={e => setLocalCss(e.target.value)}
        onBlur={() => onChange({ customCss: localCss })}
        rows={18}
        spellCheck={false}
        placeholder={`/* Beispiele: */\n\nh1 { font-size: 4rem; }\n\np { opacity: 0.9; }\n\n@media (max-width: 768px) {\n  h1 { font-size: 2rem; }\n}`}
        style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#79c0ff', padding: '10px', fontSize: '0.72rem', fontFamily: '"SF Mono", "Fira Code", monospace', resize: 'vertical', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }}
      />
      <p style={{ fontSize: '0.68rem', color: '#6e7681', marginTop: 6 }}>
        ↑ Wird beim Verlassen des Feldes gespeichert (Blur).
      </p>

      {/* Snippets */}
      <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 8px' }}>Snippets</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { label: 'Glassmorphism', css: 'background: rgba(255,255,255,0.1) !important;\nbackdrop-filter: blur(10px);\nborder: 1px solid rgba(255,255,255,0.2);' },
          { label: 'Box Shadow', css: 'box-shadow: 0 20px 60px rgba(0,0,0,0.15);' },
          { label: 'Border Radius', css: 'border-radius: 1.5rem;\noverflow: hidden;' },
          { label: 'Responsive Text', css: 'h1 { font-size: clamp(2rem, 5vw, 4rem); }\nh2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }' },
          { label: 'Mobile verstecken', css: '@media (max-width: 768px) {\n  display: none;\n}' },
          { label: 'Animated BG', css: 'background-size: 200% 200% !important;\nanimation: gradientShift 5s ease infinite;\n\n@keyframes gradientShift {\n  0%{background-position:0% 50%}\n  50%{background-position:100% 50%}\n  100%{background-position:0% 50%}\n}' },
        ].map(snippet => (
          <button key={snippet.label} onClick={() => {
            const newCss = localCss ? `${localCss}\n\n/* ${snippet.label} */\n${snippet.css}` : `/* ${snippet.label} */\n${snippet.css}`;
            setLocalCss(newCss);
            onChange({ customCss: newCss });
          }}
            style={{ width: '100%', textAlign: 'left', background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#8b949e', padding: '7px 10px', fontSize: '0.72rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262d')}>
            + {snippet.label}
          </button>
        ))}
      </div>
    </div>
  );
}
// ==================== AnimationPanel ====================
function AnimationPanel({ section, onChange }: { section: Section; onChange: (s: Partial<SectionStyling>) => void }) {
  const anim = section.styling?.animation || {};
  const sLbl: React.CSSProperties = { fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, marginTop: 14, display: 'block' };
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '5px 10px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
    background: active ? '#1f6feb' : '#0d1117',
    border: `1px solid ${active ? '#1f6feb' : '#30363d'}`,
    color: active ? '#fff' : '#8b949e',
  });
  const set = (key: string, val: string) => onChange({ animation: { ...anim, [key]: val } });
  const cur = { type: anim.type || 'none', dur: anim.duration || '0.5s', delay: anim.delay || '0s' };

  return (
    <div>
      <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: '0 0 2px' }}>✨ Scroll-Animationen</p>
        <p style={{ fontSize: '0.7rem', color: '#8b949e', margin: 0 }}>
          Wird beim Einscrollen der Section auf der Website ausgelöst.
        </p>
      </div>

      <span style={{ ...sLbl, marginTop: 0 }}>Animations-Typ</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {[
          { v: 'none', l: 'Keine' }, { v: 'fade-in', l: 'Einblenden' },
          { v: 'slide-up', l: '↑ Slide hoch' }, { v: 'slide-left', l: '← Slide links' }, { v: 'zoom-in', l: '⊕ Zoom' },
        ].map(t => (
          <button key={t.v} onClick={() => set('type', t.v)} style={btn(cur.type === t.v)}>{t.l}</button>
        ))}
      </div>

      {cur.type !== 'none' && (
        <>
          <span style={sLbl}>Dauer</span>
          <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
            {['0.3s','0.5s','0.7s','1s','1.5s'].map(d => (
              <button key={d} onClick={() => set('duration', d)} style={btn(cur.dur === d)}>{d}</button>
            ))}
          </div>

          <span style={sLbl}>Verzögerung</span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {[{ v: '0s', l: 'Kein' }, { v: '0.1s', l: '0.1s' }, { v: '0.2s', l: '0.2s' }, { v: '0.3s', l: '0.3s' }, { v: '0.5s', l: '0.5s' }, { v: '0.8s', l: '0.8s' }].map(d => (
              <button key={d.v} onClick={() => set('delay', d.v)} style={btn(cur.delay === d.v)}>{d.l}</button>
            ))}
          </div>

          <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: '0.68rem', color: '#6e7681', margin: '0 0 4px', fontWeight: 600 }}>Gesetztes Attribut im HTML:</p>
            <code style={{ fontSize: '0.68rem', color: '#79c0ff' }}>
              data-animation="{cur.type}" data-duration="{cur.dur}" data-delay="{cur.delay}"
            </code>
          </div>
        </>
      )}
    </div>
  );
}
// ==================== CONTROL BUTTON ====================
function CopyToPageModal({ section, templateId, tenantId, currentPageId, onClose, createSectionMut }: {
  section: Section; templateId: string | null; tenantId: string;
  currentPageId: string; onClose: () => void; createSectionMut: any;
}) {
  const { data, loading } = useQuery(GET_TEMPLATE_PAGES, {
    variables: { templateId, tenantId },
    skip: !templateId || !tenantId,
  });
  const [copying, setCopying] = useState(false);
  const [done, setDone] = useState(false);
  const pages = (data?.wbPages || []).filter((p: any) => p.id !== currentPageId);
  const C = { panel: '#161b22', border: '#30363d', text: '#c9d1d9', muted: '#8b949e' };

  const handleCopy = async (targetPageId: string) => {
    setCopying(true);
    try {
      await createSectionMut({
        variables: {
          input: { pageId: targetPageId, name: section.name, type: section.type, order: 999, isActive: section.isActive, content: section.content },
          tenantId,
        },
      });
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (e) { console.error(e); }
    finally { setCopying(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, minWidth: 280, maxWidth: 360 }}
        onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 4px' }}>Section kopieren nach...</p>
        <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 14px' }}>„{section.name}"</p>
        {done ? (
          <p style={{ color: '#2ea043', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>✓ Kopiert!</p>
        ) : loading ? (
          <p style={{ color: C.muted, fontSize: '0.8rem' }}>Lade Pages...</p>
        ) : pages.length === 0 ? (
          <p style={{ color: C.muted, fontSize: '0.8rem' }}>Keine anderen Pages vorhanden.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {pages.map((p: any) => (
              <button key={p.id} onClick={() => handleCopy(p.id)} disabled={copying}
                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', opacity: copying ? 0.6 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                📄 {p.name}
              </button>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: 12, background: '#21262d', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '7px', fontSize: '0.8rem', cursor: 'pointer' }}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
// ==================== GlobalColorsPanel ====================
function GlobalColorsPanel({ templateSettings, templateId, tenantId, onUpdate, onClose, updateTemplateMut }: {
  templateSettings: TemplateSettings; templateId: string | null; tenantId: string;
  onUpdate: (s: TemplateSettings) => void; onClose: () => void; updateTemplateMut: any;
}) {
  const [activeTab, setActiveTab] = useState<'colors' | 'buttons' | 'fonts'>('colors');
  const [colors, setColors] = useState({
    primary: templateSettings?.colors?.primary || '#3b82f6',
    secondary: templateSettings?.colors?.secondary || '#6366f1',
    accent: templateSettings?.colors?.accent || '#f59e0b',
    background: templateSettings?.colors?.background || '#ffffff',
    text: templateSettings?.colors?.text || '#1f2937',
  });
  const [buttonConfig, setButtonConfig] = useState({
    style: templateSettings?.button?.style || 'filled',
    radius: templateSettings?.button?.radius || '0.5rem',
    size: templateSettings?.button?.size || 'md',
  });
  const [saving, setSaving] = useState(false);
  const C = { panel: '#161b22', border: '#30363d', text: '#c9d1d9', muted: '#8b949e' };
  const sLbl: React.CSSProperties = { fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'block' };
  const LABELS: Record<string, string> = { primary: 'Primärfarbe', secondary: 'Sekundärfarbe', accent: 'Akzentfarbe', background: 'Hintergrund', text: 'Textfarbe' };

  const previewBtnStyle: React.CSSProperties = {
    padding: buttonConfig.size === 'sm' ? '0.5rem 1rem' : buttonConfig.size === 'lg' ? '1rem 2.5rem' : '0.75rem 2rem',
    borderRadius: buttonConfig.radius,
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    border: buttonConfig.style === 'outline' ? `2px solid ${colors.primary}` : 'none',
    background: buttonConfig.style === 'filled' || buttonConfig.style === 'pill'
      ? colors.primary
      : buttonConfig.style === 'outline' ? 'transparent' : 'rgba(0,0,0,0.05)',
    color: buttonConfig.style === 'filled' || buttonConfig.style === 'pill' ? '#fff' : colors.primary,
  };

const BUTTON_PRESETS = [
  { label: 'Modern', style: 'filled', radius: '0.5rem', size: 'md' },
  { label: 'Pill', style: 'pill', radius: '9999px', size: 'md' },
  { label: 'Outline', style: 'outline', radius: '0.5rem', size: 'md' },
  { label: 'Ghost', style: 'ghost', radius: '0.25rem', size: 'md' },
  { label: 'Eckig', style: 'filled', radius: '0', size: 'md' },
];
  const handleSave = async () => {
    if (!templateId) return;
    setSaving(true);
    try {
      const newSettings = { ...templateSettings, colors, button: buttonConfig };
      await updateTemplateMut({ variables: { id: templateId, input: { settings: newSettings }, tenantId } });
      onUpdate(newSettings);
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, minWidth: 340, maxWidth: 420, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 14px' }}>🎨 Template Design</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#0d1117', borderRadius: 6, padding: 3, border: '1px solid #21262d' }}>
          {[{ id: 'colors', label: '🎨 Farben' }, { id: 'buttons', label: '🔘 Buttons' }, { id: 'fonts', label: '✏️ Schrift' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: activeTab === t.id ? '#1f6feb' : 'transparent', border: 'none', color: activeTab === t.id ? '#fff' : '#6e7681' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── FARBEN TAB ── */}
        {activeTab === 'colors' && (
          <div>
            {Object.entries(colors).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <span style={sLbl}>{LABELS[key]}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={val} onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${C.border}`, cursor: 'pointer', padding: 2 }} />
                  <input type="text" value={val} onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                    style={{ flex: 1, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '7px 10px', fontSize: '0.78rem', outline: 'none' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BUTTONS TAB ── */}
        {activeTab === 'buttons' && (
          <div>
            {/* Live Preview */}
            <div style={{ background: '#0d1117', borderRadius: 8, padding: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '1px solid #21262d' }}>
              <button style={previewBtnStyle}>Primär Button</button>
              <button style={{ ...previewBtnStyle, background: 'transparent', border: `2px solid ${colors.primary}`, color: colors.primary }}>
                Sekundär
              </button>
            </div>

            {/* Stil Presets */}
            <span style={sLbl}>Button-Stil</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
              {[
                { v: 'filled', l: '⬛ Gefüllt' },
                { v: 'pill', l: '⭕ Pill' },
                { v: 'outline', l: '▢ Outline' },
                { v: 'ghost', l: '👻 Ghost' },
              ].map(o => (
                <button key={o.v} onClick={() => setButtonConfig(p => ({ ...p, style: o.v as any }))}
                  style={{ padding: '7px 4px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                    background: buttonConfig.style === o.v ? '#1f6feb' : '#0d1117',
                    border: `1px solid ${buttonConfig.style === o.v ? '#1f6feb' : '#30363d'}`,
                    color: buttonConfig.style === o.v ? '#fff' : '#8b949e' }}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Ecken-Radius */}
            <span style={sLbl}>Ecken-Radius</span>
            <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
              {[{ v: '0', l: 'Eckig' }, { v: '0.25rem', l: 'Klein' }, { v: '0.5rem', l: 'Normal' }, { v: '0.75rem', l: 'Groß' }, { v: '9999px', l: 'Pill' }].map(o => (
                <button key={o.v} onClick={() => setButtonConfig(p => ({ ...p, radius: o.v }))}
                  style={{ padding: '5px 10px', borderRadius: o.v === '9999px' ? '9999px' : 5, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                    background: buttonConfig.radius === o.v ? '#1f6feb' : '#0d1117',
                    border: `1px solid ${buttonConfig.radius === o.v ? '#1f6feb' : '#30363d'}`,
                    color: buttonConfig.radius === o.v ? '#fff' : '#8b949e' }}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Größe */}
            <span style={sLbl}>Größe</span>
            <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
              {[{ v: 'sm', l: 'Klein' }, { v: 'md', l: 'Normal' }, { v: 'lg', l: 'Groß' }].map(o => (
                <button key={o.v} onClick={() => setButtonConfig(p => ({ ...p, size: o.v as any }))}
                  style={{ flex: 1, padding: '6px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                    background: buttonConfig.size === o.v ? '#1f6feb' : '#0d1117',
                    border: `1px solid ${buttonConfig.size === o.v ? '#1f6feb' : '#30363d'}`,
                    color: buttonConfig.size === o.v ? '#fff' : '#8b949e' }}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Benutzerdefinierter Radius */}
            <span style={sLbl}>Eigener Radius</span>
            <input type="text" placeholder="z.B. 0.75rem" value={buttonConfig.radius}
              onChange={e => setButtonConfig(p => ({ ...p, radius: e.target.value }))}
              style={{ width: '100%', background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '7px 10px', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
          </div>
        )}

        {/* ── SCHRIFT TAB ── */}
        {activeTab === 'fonts' && (
          <div>
            <span style={sLbl}>Überschriften-Schrift</span>
            <select value={templateSettings?.fonts?.heading || ''}
              onChange={e => {
                const font = FONT_PRESETS.find(f => f.value === e.target.value);
                if (font) loadGoogleFont(font.google);
                onUpdate({ ...templateSettings, fonts: { ...templateSettings?.fonts, heading: e.target.value } });
              }}
              style={{ width: '100%', background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '8px 10px', fontSize: '0.8rem', marginBottom: 12, boxSizing: 'border-box' as any, outline: 'none' }}>
              <option value="">— Standard —</option>
              {FONT_PRESETS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <span style={sLbl}>Fließtext-Schrift</span>
            <select value={templateSettings?.fonts?.body || ''}
              onChange={e => {
                const font = FONT_PRESETS.find(f => f.value === e.target.value);
                if (font) loadGoogleFont(font.google);
                onUpdate({ ...templateSettings, fonts: { ...templateSettings?.fonts, body: e.target.value } });
              }}
              style={{ width: '100%', background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: '8px 10px', fontSize: '0.8rem', marginBottom: 12, boxSizing: 'border-box' as any, outline: 'none' }}>
              <option value="">— Standard —</option>
              {FONT_PRESETS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '12px', marginTop: 8 }}>
              <p style={{ fontFamily: templateSettings?.fonts?.heading || 'inherit', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: C.text }}>Überschrift Vorschau</p>
              <p style={{ fontFamily: templateSettings?.fonts?.body || 'inherit', fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>Das ist ein Beispieltext für den Fließtext deiner Website. Schriften prägen den Charakter stark.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⟳ Speichern...' : '💾 Speichern'}
          </button>
          <button onClick={onClose}
            style={{ flex: 1, background: '#21262d', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
// ==================== CONTROL BUTTON ====================

function CtrlBtn({ children, onClick, disabled = false, danger = false, title }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean; title?: string;
}) {
  return (
    <button onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }} disabled={disabled} title={title}
      style={{ background: 'transparent', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', color: danger ? '#f85149' : disabled ? '#3d444d' : '#8b949e', fontSize: '0.75rem', padding: '3px 7px', borderRadius: 4, fontWeight: 600 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#21262d'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </button>
  );
}

// ==================== MAIN EDITOR ====================

interface WysiwygEditorProps { pageId: string; templateId?: string; }

function LayerNameEditor({ section, isSelected, onRename }: {
  section: Section; isSelected: boolean; onRename: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(section.name);
  const C = { accent: '#58a6ff', text: '#c9d1d9' };

  useEffect(() => { setVal(section.name); }, [section.name]);

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { onRename(section.id, val || section.name); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onRename(section.id, val || section.name); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        onClick={e => e.stopPropagation()}
        style={{ flex: 1, background: '#0d1117', border: '1px solid #58a6ff', borderRadius: 4, color: '#c9d1d9', padding: '2px 6px', fontSize: '0.75rem', outline: 'none', minWidth: 0 }}
      />
    );
  }

  return (
    <span
      onDoubleClick={e => { e.stopPropagation(); setEditing(true); }}
      title="Doppelklick zum Umbenennen"
      style={{ fontSize: '0.78rem', flex: 1, color: isSelected ? C.accent : C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text' }}
    >
      {section.name}
    </span>
  );
}
function NavBarPreview({ nav, isSelected, onClick, primary }: {
  nav: NavData; isSelected: boolean; onClick: () => void; primary: string;
}) {
  const items = (nav.items || []).filter(i => !i.parentId).sort((a, b) => a.order - b.order);
  const isFooter = nav.location === 'footer';
  const s = nav.settings || {};
  const bg = s.backgroundColor || (isFooter ? '#1f2937' : '#ffffff');
  const color = s.textColor || (isFooter ? '#f9fafb' : '#1f2937');
  const align = s.itemsAlign || 'right';
  const logoText = s.logoText || 'Site';
  const fontFamily = s.fontFamily || 'inherit';

  return (
    <div onClick={onClick} style={{
      background: bg, color, fontFamily,
      borderTop: isFooter ? '1px solid rgba(0,0,0,0.2)' : 'none',
      borderBottom: isFooter ? 'none' : '1px solid rgba(0,0,0,0.1)',
      padding: '0 1.5rem', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', position: 'relative',
      outline: isSelected ? '2px solid #58a6ff' : 'none',
           outlineOffset: '-2px', opacity: nav.isActive ? 1 : 0.4,
    }}>
      {nav.settings?.sticky && (
        <div style={{ position: 'absolute', top: 0, left: 0, background: '#1f6feb', color: '#fff', fontSize: '0.5rem', fontWeight: 700, padding: '1px 6px', letterSpacing: '0.06em' }}>
          STICKY
        </div>
      )}
      {isSelected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#58a6ff', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', zIndex: 10, textTransform: 'uppercase' }}>
          🧭 {nav.name}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
          {logoText[0] || 'S'}
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{logoText}</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end', margin: '0 1rem' }}>
        {items.slice(0, 5).map(item => (
          <span key={item.id} style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.8 }}>{item.label}</span>
        ))}
        {items.length === 0 && <span style={{ fontSize: '0.75rem', opacity: 0.4, fontStyle: 'italic' }}>Keine Items — klicken zum Bearbeiten</span>}
      </div>
    </div>
  );
}
function NavEditorPanel({ nav, onRefresh, createNavItem, updateNavItem, deleteNavItem, updateNav }: {
  nav: NavData; onRefresh: () => void;
  createNavItem: any; updateNavItem: any; deleteNavItem: any; updateNav: any;
}) {
  const [activeTab, setActiveTab] = useState<'items' | 'style'>('items');
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState({ label: '', type: 'custom', url: '', openInNewTab: false });
  const [styleForm, setStyleForm] = useState({
    backgroundColor: nav.settings?.backgroundColor || '',
    textColor: nav.settings?.textColor || '',
    fontFamily: nav.settings?.fontFamily || '',
    itemsAlign: (nav.settings?.itemsAlign || 'right') as 'left' | 'center' | 'right',
    logoText: nav.settings?.logoText || '',
     sticky: nav.settings?.sticky || false,
  });
  const [saving, setSaving] = useState(false);

  const inp: React.CSSProperties = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.78rem', boxSizing: 'border-box', outline: 'none' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.68rem', color: '#8b949e', marginBottom: 4, fontWeight: 600 };
  const sLbl: React.CSSProperties = { fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase' as any, letterSpacing: '0.07em', marginBottom: 6, marginTop: 14, display: 'block' };

  const items = (nav.items || []).filter(i => !i.parentId).sort((a, b) => a.order - b.order);

  const NAV_BG_PRESETS = [
    { label: 'Weiß', bg: '#ffffff', text: '#1f2937' },
    { label: 'Schwarz', bg: '#0f172a', text: '#f8fafc' },
    { label: 'Grau', bg: '#f9fafb', text: '#1f2937' },
    { label: 'Dunkel', bg: '#1f2937', text: '#f9fafb' },
    { label: 'Blau', bg: '#1e40af', text: '#ffffff' },
    { label: 'Violett', bg: '#7c3aed', text: '#ffffff' },
    { label: 'Grün', bg: '#15803d', text: '#ffffff' },
    { label: 'Orange', bg: '#ea580c', text: '#ffffff' },
  ];

  const startEdit = (item: NavItem) => {
    setEditingItem(item);
    setForm({ label: item.label, type: item.type, url: item.url || '', openInNewTab: item.openInNewTab });
    setAddingItem(true);
  };

  const handleSaveItem = async () => {
    if (!form.label.trim()) return;
    if (editingItem) {
      await updateNavItem({ variables: { itemId: editingItem.id, input: { label: form.label, type: form.type, url: form.url, openInNewTab: form.openInNewTab } } });
    } else {
      await createNavItem({ variables: { navigationId: nav.id, input: { label: form.label, type: form.type, url: form.url, openInNewTab: form.openInNewTab, order: items.length } } });
    }
    setAddingItem(false); setEditingItem(null);
    setForm({ label: '', type: 'custom', url: '', openInNewTab: false });
    onRefresh();
  };

  const handleSaveStyle = async () => {
    setSaving(true);
    try {
      await updateNav({ variables: { id: nav.id, input: { settings: styleForm } } });
      onRefresh();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteNavItem({ variables: { itemId: id } });
    onRefresh();
  };

  return (
    <div>
      {/* Info */}
      <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: 0 }}>
          🧭 {nav.name} — {nav.location === 'header' ? 'Header' : 'Footer'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#0d1117', borderRadius: 6, padding: 3, border: '1px solid #21262d' }}>
        {[{ id: 'items', label: '☰ Items' }, { id: 'style', label: '🎨 Stil' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: activeTab === t.id ? '#1f6feb' : 'transparent', border: 'none', color: activeTab === t.id ? '#fff' : '#6e7681' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ITEMS TAB ── */}
      {activeTab === 'items' && (
        <div>
          <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Menu Items ({items.length})
          </p>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', marginBottom: 4, background: '#0d1117', border: '1px solid #21262d', borderRadius: 6 }}>
              <span style={{ flex: 1, fontSize: '0.78rem', color: '#c9d1d9', fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: '0.65rem', color: '#6e7681', background: '#161b22', borderRadius: 3, padding: '1px 5px' }}>{item.url || item.type}</span>
              <button onClick={() => startEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#58a6ff', fontSize: '0.72rem', padding: '1px 4px' }}>✎</button>
              <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', fontSize: '0.72rem', padding: '1px 4px' }}>✕</button>
            </div>
          ))}

          {addingItem ? (
            <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 12, marginTop: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={lbl}>Label</label>
                <input style={inp} value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="z.B. Startseite" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={lbl}>URL</label>
                <input style={inp} value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="/kontakt oder https://..." />
              </div>
              <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="navNewTab" checked={form.openInNewTab} onChange={e => setForm(p => ({ ...p, openInNewTab: e.target.checked }))} />
                <label htmlFor="navNewTab" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>Neuer Tab</label>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleSaveItem} style={{ flex: 1, background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  ✓ {editingItem ? 'Aktualisieren' : 'Hinzufügen'}
                </button>
                <button onClick={() => { setAddingItem(false); setEditingItem(null); }} style={{ flex: 1, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '7px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setForm({ label: '', type: 'custom', url: '', openInNewTab: false }); setAddingItem(true); }}
              style={{ width: '100%', marginTop: 8, padding: '7px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.78rem', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}>
              + Item hinzufügen
            </button>
          )}
        </div>
      )}

      {/* ── STYLE TAB ── */}
      {activeTab === 'style' && (
        <div>
          {/* Hintergrund Presets */}
          <span style={{ ...sLbl, marginTop: 0 }}>Hintergrund-Presets</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 12 }}>
            {NAV_BG_PRESETS.map(p => (
              <button key={p.label} title={p.label}
                onClick={() => setStyleForm(f => ({ ...f, backgroundColor: p.bg, textColor: p.text }))}
                style={{ height: 34, borderRadius: 6, border: `2px solid ${styleForm.backgroundColor === p.bg ? '#58a6ff' : '#21262d'}`, cursor: 'pointer', background: p.bg, position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', bottom: 1, left: 0, right: 0, textAlign: 'center', fontSize: '0.48rem', color: p.text, fontWeight: 700 }}>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Hintergrundfarbe */}
          <span style={sLbl}>Hintergrundfarbe</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <input type="color" value={styleForm.backgroundColor?.startsWith('#') ? styleForm.backgroundColor : '#ffffff'}
              onChange={e => setStyleForm(f => ({ ...f, backgroundColor: e.target.value }))}
              style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
            <input type="text" placeholder="transparent oder #ffffff" value={styleForm.backgroundColor}
              onChange={e => setStyleForm(f => ({ ...f, backgroundColor: e.target.value }))}
              style={{ ...inp, flex: 1 }} />
          </div>

          {/* Textfarbe */}
          <span style={sLbl}>Textfarbe</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <input type="color" value={styleForm.textColor?.startsWith('#') ? styleForm.textColor : '#1f2937'}
              onChange={e => setStyleForm(f => ({ ...f, textColor: e.target.value }))}
              style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
            <input type="text" placeholder="#1f2937" value={styleForm.textColor}
              onChange={e => setStyleForm(f => ({ ...f, textColor: e.target.value }))}
              style={{ ...inp, flex: 1 }} />
          </div>

          {/* Items Ausrichtung */}
          <span style={sLbl}>Items-Position</span>
          <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
            {([['left', '⬅ Links'], ['center', '↔ Mitte'], ['right', '➡ Rechts']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setStyleForm(f => ({ ...f, itemsAlign: val }))}
                style={{ flex: 1, padding: '6px 4px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', background: styleForm.itemsAlign === val ? '#1f6feb' : '#0d1117', border: `1px solid ${styleForm.itemsAlign === val ? '#1f6feb' : '#30363d'}`, color: styleForm.itemsAlign === val ? '#fff' : '#8b949e' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Schriftart */}
          <span style={sLbl}>Schriftart</span>
          <select value={styleForm.fontFamily} onChange={e => setStyleForm(f => ({ ...f, fontFamily: e.target.value }))}
            style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.75rem', marginBottom: 12, boxSizing: 'border-box' as any, outline: 'none' }}>
            <option value="">— Standard —</option>
            {FONT_PRESETS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Logo Text */}
          <span style={sLbl}>Logo-Text</span>
          <input type="text" placeholder="z.B. Mein Shop" value={styleForm.logoText}
            onChange={e => setStyleForm(f => ({ ...f, logoText: e.target.value }))}
            style={{ ...inp, marginBottom: 16 }} />
          {/* Sticky */}
          <span style={sLbl}>Sticky Navigation</span>
          <button onClick={() => setStyleForm(f => ({ ...f, sticky: !f.sticky }))}
            style={{ width: '100%', marginBottom: 12, padding: '8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              background: styleForm.sticky ? '#1f6feb' : '#0d1117',
              border: `1px solid ${styleForm.sticky ? '#1f6feb' : '#30363d'}`,
              color: styleForm.sticky ? '#fff' : '#8b949e' }}>
            {styleForm.sticky ? '📌 Sticky aktiv — bleibt beim Scrollen oben' : '📌 Sticky deaktiviert'}
          </button>

          {/* Speichern */}
          <button onClick={handleSaveStyle} disabled={saving}
            style={{ width: '100%', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⟳ Speichern...' : '💾 Stil speichern'}
          </button>
        </div>
      )}
    </div>
  );
}

export function WysiwygEditor({ pageId: initialPageId, templateId }: WysiwygEditorProps) {
  const { tenant } = useAuth();
  const [currentPageId, setCurrentPageId] = useState(initialPageId);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [leftPanel, setLeftPanel] = useState<'blocks' | 'layers'>('blocks');
 const [rightTab, setRightTab] = useState<'content' | 'style' | 'layout' | 'css' | 'animation'>('content');
  const [undoStack, setUndoStack] = useState<Section[][]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageName, setPageName] = useState('');
  const [resolvedTemplateId, setResolvedTemplateId] = useState<string | null>(templateId || null);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({});
  const [expandedCat, setExpandedCat] = useState<string | null>('Grundlagen');
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNavEditor, setShowNavEditor] = useState(false);
const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [mediaPicker, setMediaPicker] = useState<{ onSelect: (url: string) => void } | null>(null);
const [leftCollapsed, setLeftCollapsed] = useState(false);
const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedNavId, setSelectedNavId] = useState<string | null>(null);
  const [navigations, setNavigations] = useState<NavData[]>([]);
  const [blockSearch, setBlockSearch] = useState('');
  const [recentBlocks, setRecentBlocks] = useState<string[]>([]);
  const [darkPreview, setDarkPreview] = useState(false);
  const [copyToPageSectionId, setCopyToPageSectionId] = useState<string | null>(null);
  const [showGlobalColors, setShowGlobalColors] = useState(false);
  const [availableForms, setAvailableForms] = useState<{ id: string; name: string; slug: string }[]>([]);
const [availableBookingServices, setAvailableBookingServices] = useState<{ id: string; name: string; duration: number; price: number }[]>([]);

useEffect(() => {
  if (!tenant?.slug) return;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  fetch(`${base}/api/public/${tenant.slug}/forms`)
    .then(r => r.json()).then(setAvailableForms).catch(() => {});
  fetch(`${base}/api/public/${tenant.slug}/booking/services`)
    .then(r => r.json()).then(setAvailableBookingServices).catch(() => {});
}, [tenant?.slug]);
const { refetch: refetchNavsQuery } = useQuery(GET_NAVIGATIONS, {
  onCompleted: (data) => { if (data?.navigations) setNavigations(data.navigations); },
});
const refetchNavs = async () => {
  const result = await refetchNavsQuery();
  if (result.data?.navigations) setNavigations(result.data.navigations);
};
const [createNavItemMut] = useMutation(CREATE_NAV_ITEM);
const [updateNavItemMut] = useMutation(UPDATE_NAV_ITEM);
  const [deleteNavItemMut] = useMutation(DELETE_NAV_ITEM);
  const [updateNavigationMut] = useMutation(UPDATE_NAVIGATION);
const [updateTemplateMut] = useMutation(UPDATE_TEMPLATE_SETTINGS);

  const dragItemIdx = useRef<number | null>(null);

  const selectedSection = sections.find(s => s.id === selectedId) || null;

 const { loading } = useQuery(GET_PAGE_WITH_SECTIONS, {
    variables: { id: currentPageId, tenantId: tenant?.id },
    skip: !tenant?.id || !currentPageId,
    onCompleted: (data) => {
      if (data?.wbPage) {
        setSections([...(data.wbPage.sections || [])].sort((a: any, b: any) => a.order - b.order));
        setPageName(data.wbPage.name);
        if (data.wbPage.templateId && !resolvedTemplateId) setResolvedTemplateId(data.wbPage.templateId);
      }
    },
  });

  useQuery(GET_TEMPLATE_SETTINGS, {
    variables: { id: resolvedTemplateId, tenantId: tenant?.id },
    skip: !tenant?.id || !resolvedTemplateId,
    onCompleted: (data) => { if (data?.wbTemplate?.settings) setTemplateSettings(data.wbTemplate.settings); },
  });

const { data: pagesData } = useQuery(GET_TEMPLATE_PAGES, {
    variables: { templateId: resolvedTemplateId, tenantId: tenant?.id },
    skip: !resolvedTemplateId || !tenant?.id,
  });
  const allPages = pagesData?.wbPages || [];
  const [updateSectionMut] = useMutation(UPDATE_SECTION);
  const [createSectionMut] = useMutation(CREATE_SECTION);
  const [deleteSectionMut] = useMutation(DELETE_SECTION);
  const [reorderMut] = useMutation(REORDER_SECTIONS);

  const pushUndo = useCallback((prev: Section[]) => setUndoStack(s => [...s.slice(-29), prev]), []);
  const undo = useCallback(() => {
    setUndoStack(stack => {
      if (!stack.length) return stack;
      setSections(stack[stack.length - 1]);
      setIsDirty(true);
      return stack.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [undo]);

  useEffect(() => {
  if (!isDirty) return;
  const timer = setTimeout(() => {
    handleSave().then(() => setSaveToast('Auto-gespeichert ✓'));
    setTimeout(() => setSaveToast(null), 2500);
  }, 30000);
  return () => clearTimeout(timer);
}, [isDirty, sections]);

  const handleAddBlock = async (type: string) => {
    if (!tenant?.id) {
      setError('Kein Tenant gefunden — bitte Seite neu laden.');
      return;
    }
    const label = BLOCK_CATEGORIES.flatMap(c => c.blocks).find(b => b.type === type)?.label || type;
    setError(null);
    try {
      const res = await createSectionMut({
        variables: {
          input: {
            pageId: currentPageId,
            name: label,
            type,
            order: sections.length,
            isActive: true,
            content: DEFAULT_CONTENT[type] ?? {},
            // styling weglassen — nullable im Backend, verhindert GraphQL-Typfehler
          },
          tenantId: tenant.id,
        },
      });
      if (res.data?.createSection) {
        pushUndo(sections);
        setSections(prev => [...prev, res.data.createSection]);
        setSelectedId(res.data.createSection.id);
        setRecentBlocks(prev => [type, ...prev.filter(t => t !== type)].slice(0, 3));
        setRightTab('content');
        setLeftPanel('layers'); // Ebenen zeigen damit User die neue Section sieht
      } else if (res.errors?.length) {
        setError(`Section konnte nicht erstellt werden: ${res.errors[0].message}`);
      }
   } catch (err: unknown) {
  const apolloErr = err as any;
  // GraphQL Validation-Fehler sind in graphQLErrors[0].extensions.response.message
  const detail = apolloErr?.graphQLErrors?.[0]?.extensions?.response?.message;
  const msg = Array.isArray(detail)
    ? detail.join(' | ')
    : (detail ?? apolloErr?.message ?? String(err));
  setError(`Fehler beim Erstellen von "${label}": ${msg}`);
}
  };

  const handleDelete = async (id: string) => {
    if (!tenant?.id) return;
    pushUndo(sections);
    setSections(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    await deleteSectionMut({ variables: { id, tenantId: tenant.id } }).catch(console.error);
  };

  const handleToggle = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section || !tenant?.id) return;
    pushUndo(sections);
    setSections(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    await updateSectionMut({ variables: { id, input: { isActive: !section.isActive }, tenantId: tenant.id } }).catch(console.error);
  };

  const handleMove = async (id: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    pushUndo(sections);
    const ns = [...sections];
    [ns[idx], ns[swapIdx]] = [ns[swapIdx], ns[idx]];
    setSections(ns);
    await reorderMut({ variables: { pageId: currentPageId, sectionIds: ns.map(s => s.id), tenantId: tenant?.id } }).catch(console.error);
  };

  const handleDuplicate = async (id: string) => {
  if (!tenant?.id) return;
  const section = sections.find(s => s.id === id);
  if (!section) return;
  pushUndo(sections);
  try {
    const res = await createSectionMut({
      variables: {
        input: {
         pageId: currentPageId,
          name: `${section.name} (Kopie)`,
          type: section.type,
          order: section.order + 1,
          isActive: section.isActive,
          content: section.content,
           styling: section.styling || {},
        },
        tenantId: tenant.id,
      },
    });
    if (res.data?.createSection) {
      setSections(prev => {
        const idx = prev.findIndex(s => s.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, { ...res.data.createSection, styling: section.styling });
        return next;
      });
      setSelectedId(res.data.createSection.id);
    }
  } catch (err) { console.error(err); }
};
const handleLock = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    setSections(prev => prev.map(s => s.id === id ? { ...s, styling: { ...s.styling, isLocked: !s.styling?.isLocked } } : s));
    setIsDirty(true);
  };

const handleSwitchPage = (newPageId: string) => {
    if (newPageId === currentPageId) return;
    if (isDirty) {
      handleSave();
    }
    setCurrentPageId(newPageId);
    setSelectedId(null);
    setSelectedNavId(null);
    setSections([]);
  };
const handleContentChange = (content: SectionContent) => {
    if (!selectedId) return;
    pushUndo(sections);
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, content } : s));
    setIsDirty(true);
  };

  const handleStylingChange = (styling: Partial<SectionStyling>) => {
    if (!selectedId) return;
    setSections(prev => prev.map(s => s.id === selectedId ? { ...s, styling: { ...s.styling, ...styling } } : s));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!tenant?.id || isSaving) return;
    setIsSaving(true);
    try {
      await Promise.all(sections.map(s =>
        updateSectionMut({ variables: { id: s.id, input: { name: s.name, content: s.content, styling: s.styling, isActive: s.isActive }, tenantId: tenant.id } })
      ));
      setIsDirty(false);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDragStart = (idx: number) => { dragItemIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = async (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragItemIdx.current === null || dragItemIdx.current === idx) { setDragOverIdx(null); return; }
    pushUndo(sections);
    const ns = [...sections];
    const [d] = ns.splice(dragItemIdx.current, 1);
    ns.splice(idx, 0, d);
    setSections(ns);
    setDragOverIdx(null);
    dragItemIdx.current = null;
    await reorderMut({ variables: { pageId: currentPageId, sectionIds: ns.map(s => s.id), tenantId: tenant?.id } }).catch(console.error);
  };

  const DEVICE_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '390px' };
  const C = { bg: '#010409', panel: '#161b22', border: '#21262d', text: '#c9d1d9', muted: '#6e7681', accent: '#58a6ff', dim: '#8b949e' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>

      {/* ── TOP BAR ── */}
      <div style={{ height: 52, background: C.panel, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
        <Link href={resolvedTemplateId ? `/dashboard/website-builder/website-templates/${resolvedTemplateId}` : '/dashboard/website-builder'}
          style={{ color: C.muted, textDecoration: 'none', fontSize: '0.78rem', padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.border}`, whiteSpace: 'nowrap', fontWeight: 500 }}>
          ← Zurück
        </Link>
        <button onClick={() => setDarkPreview(v => !v)} title="Dark Preview"
          style={{ background: darkPreview ? '#1f6feb' : 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: darkPreview ? '#fff' : C.muted, padding: '5px 10px', fontSize: '0.8rem' }}>
          {darkPreview ? '☀️' : '🌙'}
        </button>
        <button onClick={() => setShowGlobalColors(true)} title="Template-Farben"
          style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: C.muted, padding: '5px 10px', fontSize: '0.8rem' }}>
          🎨
        </button>
        <button onClick={() => setLeftCollapsed(v => !v)} title="Linke Sidebar"
          style={{ background: leftCollapsed ? '#1f6feb' : 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: leftCollapsed ? '#fff' : C.muted, padding: '5px 10px', fontSize: '0.8rem' }}>
          {leftCollapsed ? '▶' : '◀'}
        </button>
        <button onClick={() => setRightCollapsed(v => !v)} title="Rechte Sidebar"
          style={{ background: rightCollapsed ? '#1f6feb' : 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: rightCollapsed ? '#fff' : C.muted, padding: '5px 10px', fontSize: '0.8rem' }}>
          {rightCollapsed ? '◀' : '▶'}
        </button>
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageName || 'WYSIWYG Editor'}</span>
          {isDirty && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f0883e', flexShrink: 0 }} title="Ungespeicherte Änderungen" />}
        </div>

        {/* ── PAGE TABS ── */}
      {allPages.length > 1 && (
        <div style={{ background: '#0d1117', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0, overflowX: 'auto' }}>
          {allPages.map((p: any) => (
            <button
              key={p.id}
              onClick={() => handleSwitchPage(p.id)}
              style={{
                padding: '6px 14px', borderRadius: '6px 6px 0 0', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
                background: currentPageId === p.id ? C.panel : 'transparent',
                color: currentPageId === p.id ? C.accent : C.muted,
                borderBottom: `2px solid ${currentPageId === p.id ? C.accent : 'transparent'}`,
              }}
            >
              {p.slug === '/' || p.slug === '' ? '🏠 ' : '📄 '}
              {p.name}
            </button>
          ))}
        </div>
      )}

        {/* Device Switcher */}
        <div style={{ display: 'flex', background: '#0d1117', borderRadius: 8, padding: 3, border: `1px solid ${C.border}`, gap: 2 }}>
          {[{ id: 'desktop', icon: '🖥', tip: 'Desktop' }, { id: 'tablet', icon: '📋', tip: 'Tablet (768px)' }, { id: 'mobile', icon: '📱', tip: 'Mobile (390px)' }].map(d => (
            <button key={d.id} onClick={() => setDeviceMode(d.id as any)} title={d.tip}
              style={{ background: deviceMode === d.id ? C.border : 'transparent', border: 'none', borderRadius: 5, cursor: 'pointer', padding: '4px 10px', color: deviceMode === d.id ? C.accent : C.muted, fontSize: '0.8rem' }}>
              {d.icon}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px' }}>
          <button onClick={() => setZoom(z => Math.max(40, z - 10))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>−</button>
          <span style={{ fontSize: '0.72rem', color: C.dim, minWidth: 34, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>+</button>
        </div>

        <button onClick={undo} disabled={undoStack.length === 0} title="Ctrl+Z"
          style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed', color: undoStack.length > 0 ? C.dim : '#3d444d', padding: '5px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          ↩ Undo
        </button>

        <span style={{ fontSize: '0.72rem', color: C.muted, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 8px', whiteSpace: 'nowrap' }}>
          {sections.length} Sections
        </span>

        <a href={`/${tenant?.slug}`} target="_blank" rel="noopener noreferrer"
          style={{ background: '#21262d', border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: '0.75rem', padding: '6px 10px', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
          👁 Vorschau
        </a>

        <button onClick={() => setShowNavEditor(true)}
  style={{ background: '#21262d', border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, fontSize: '0.75rem', padding: '6px 10px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
  🧭 Navigation
</button>

<button onClick={() => setShowShortcuts(true)}
  style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: '0.75rem', padding: '6px 8px', cursor: 'pointer' }}
  title="Tastenkürzel">
  ?
</button>

        <button onClick={handleSave} disabled={isSaving} title="Ctrl+S"
          style={{ background: isDirty ? '#238636' : '#161b22', border: `1px solid ${isDirty ? '#2ea043' : C.border}`, borderRadius: 6, cursor: 'pointer', color: isDirty ? '#ffffff' : C.muted, fontSize: '0.78rem', fontWeight: 600, padding: '6px 14px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          {isSaving ? '⟳ Speichern...' : '💾 Speichern'}
        </button>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ width: leftCollapsed ? 0 : 256, overflow: 'hidden', transition: 'width 0.2s ease', background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
            {[{ id: 'blocks', label: '⊞ Blöcke' }, { id: 'layers', label: '☰ Ebenen' }].map(tab => (
              <button key={tab.id} onClick={() => setLeftPanel(tab.id as any)}
                style={{ flex: 1, padding: '10px 0', background: leftPanel === tab.id ? '#0d1117' : 'transparent', border: 'none', borderBottom: `2px solid ${leftPanel === tab.id ? C.accent : 'transparent'}`, cursor: 'pointer', color: leftPanel === tab.id ? C.accent : C.muted, fontSize: '0.75rem', fontWeight: 600 }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
          {leftPanel === 'blocks' ? (
              <>
                {/* Block-Suche */}
                <div style={{ padding: '8px 8px 4px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Block suchen..."
                    value={blockSearch}
                    onChange={e => setBlockSearch(e.target.value)}
                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '6px 10px', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Zuletzt verwendet */}
                {!blockSearch && recentBlocks.length > 0 && (
                  <div>
                    <p style={{ padding: '6px 14px 4px', fontSize: '0.65rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                      Zuletzt verwendet
                    </p>
                    <div style={{ padding: '2px 8px 6px' }}>
                      {recentBlocks.map(rType => {
                        const block = BLOCK_CATEGORIES.flatMap(c => c.blocks).find(b => b.type === rType);
                        if (!block) return null;
                        return (
                          <button key={rType} onClick={() => handleAddBlock(rType)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '6px 9px', marginBottom: 2, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{block.icon}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text }}>{block.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gefilterte oder normale Ansicht */}
                {blockSearch ? (
                  <div style={{ padding: '4px 8px 8px' }}>
                    {BLOCK_CATEGORIES.flatMap(c => c.blocks).filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase()) || b.description.toLowerCase().includes(blockSearch.toLowerCase())).map(block => (
                      <button key={block.type} onClick={() => { handleAddBlock(block.type); setBlockSearch(''); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', marginBottom: 3, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{block.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text }}>{block.label}</div>
                          <div style={{ fontSize: '0.67rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.description}</div>
                        </div>
                      </button>
                    ))}
                    {BLOCK_CATEGORIES.flatMap(c => c.blocks).filter(b => b.label.toLowerCase().includes(blockSearch.toLowerCase()) || b.description.toLowerCase().includes(blockSearch.toLowerCase())).length === 0 && (
                      <p style={{ color: C.muted, fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>Nichts gefunden</p>
                    )}
                  </div>
                ) : (
                  BLOCK_CATEGORIES.map(cat => (
                <div key={cat.label}>
                  <button onClick={() => setExpandedCat(expandedCat === cat.label ? null : cat.label)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    <span>{cat.icon} {cat.label}</span>
                    <span style={{ transform: expandedCat === cat.label ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', fontSize: '0.55rem' }}>▶</span>
                  </button>
                  {expandedCat === cat.label && (
                    <div style={{ padding: '2px 8px 8px' }}>
                      {cat.blocks.map(block => (
                        <button key={block.type} onClick={() => handleAddBlock(block.type)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', marginBottom: 3, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 7, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{block.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text }}>{block.label}</div>
                            <div style={{ fontSize: '0.67rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.description}</div>
                          </div>
                          <span style={{ color: '#30363d', fontSize: '0.9rem', flexShrink: 0 }}>+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                  ))     )}
                     </>
       ) : (
              <div style={{ padding: '8px' }}>
                {sections.length === 0 && <p style={{ color: C.muted, fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0' }}>Noch keine Sections</p>}
                {sections.map((s, idx) => (
                  <div key={s.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDrop={e => handleDrop(e, idx)} onDragEnd={() => setDragOverIdx(null)}
                    onClick={() => setSelectedId(s.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 7px', marginBottom: 2, borderRadius: 6, cursor: 'pointer', background: selectedId === s.id ? '#1c2128' : dragOverIdx === idx ? '#1c2128' : 'transparent', border: `1px solid ${selectedId === s.id ? C.accent : 'transparent'}`, opacity: s.isActive ? 1 : 0.5 }}>
                    <span style={{ cursor: 'grab', color: '#3d444d', fontSize: '0.85rem', userSelect: 'none' }}>⠿</span>
                    <LayerNameEditor
                      section={s}
                      isSelected={selectedId === s.id}
                      onRename={(id, name) => {
                        setSections(prev => prev.map(sec => sec.id === id ? { ...sec, name } : sec));
                        setIsDirty(true);
                      }}
                    />
                    <span style={{ fontSize: '0.6rem', color: C.muted, background: '#0d1117', borderRadius: 3, padding: '2px 4px', flexShrink: 0 }}>{s.type}</span>
                    <button onClick={e => { e.stopPropagation(); handleDuplicate(s.id); }} title="Duplizieren"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d444d', fontSize: '0.72rem', padding: '1px', flexShrink: 0 }}>⧉</button>
                    <button onClick={e => { e.stopPropagation(); handleToggle(s.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isActive ? C.accent : '#3d444d', fontSize: '0.72rem', padding: '1px', flexShrink: 0 }}>
                      {s.isActive ? '👁' : '🙈'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleLock(s.id); }}
                      title={s.styling?.isLocked ? 'Entsperren' : 'Sperren'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.styling?.isLocked ? '#f0883e' : '#3d444d', fontSize: '0.72rem', padding: '1px', flexShrink: 0 }}>
                      {s.styling?.isLocked ? '🔒' : '🔓'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CANVAS ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#010409', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 200px' }}
>
          {/* Error Banner */}
          {error && (
            <div style={{ width: '100%', maxWidth: 700, marginBottom: 16, background: '#3d1010', border: '1px solid #f85149', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: '0.8rem', color: '#f85149' }}>⚠ {error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', fontSize: '1rem', flexShrink: 0 }}>✕</button>
            </div>
          )}
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: 12 }}>⟳</div><p>Lade Seite...</p></div>
            </div>
          ) : (
           
              <>
          {darkPreview && (
            <style dangerouslySetInnerHTML={{ __html: `.wysiwyg-dark-preview { filter: invert(1) hue-rotate(180deg); } .wysiwyg-dark-preview img { filter: invert(1) hue-rotate(180deg); }` }} />
          )}
             <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
   <div className={darkPreview ? 'wysiwyg-dark-preview' : ''} style={{
    width: DEVICE_WIDTHS[deviceMode], maxWidth: '100%',
    transform: `scale(${zoom / 100})`, transformOrigin: 'top left',
    transformBox: 'fill-box',
    background: templateSettings?.colors?.background || '#ffffff',
    color: templateSettings?.colors?.text || '#1f2937',
    minHeight: 500,
    boxShadow: '0 0 0 1px #21262d, 0 24px 64px rgba(0,0,0,0.6)',
    borderRadius: 8, overflow: 'visible',
    fontFamily: templateSettings?.fonts?.body || 'system-ui, sans-serif'
  }}>{navigations.filter(n => n.location === 'header' && n.isActive).map(nav => (
      <NavBarPreview key={nav.id} nav={nav} isSelected={selectedNavId === nav.id}
        onClick={() => { setSelectedNavId(nav.id); setSelectedId(null); }}
        primary={templateSettings?.colors?.primary || '#3b82f6'} />
    ))}
              
                {sections.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 520, color: '#9ca3af', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.5 }}>✦</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px', color: '#6b7280' }}>Seite ist leer</h3>
                  <p style={{ fontSize: '0.875rem', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>Wähle einen Block aus der Sidebar.</p>
                </div>
              ) : (
                sections.map((section, idx) => (
                  <div key={section.id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={e => handleDragOver(e, idx)} onDrop={e => handleDrop(e, idx)} onDragEnd={() => setDragOverIdx(null)}
                    style={{ position: 'relative', borderTop: dragOverIdx === idx ? '3px solid #58a6ff' : '3px solid transparent' }}>
                    <CanvasSectionPreview section={section} isSelected={selectedId === section.id} onClick={() => { setSelectedId(section.id); setSelectedNavId(null); setRightTab('content'); }} settings={templateSettings} deviceMode={deviceMode} />
                    {selectedId === section.id && (
                      <div style={{ position: 'absolute', top: 4, right: 8, display: 'flex', gap: 2, zIndex: 20, background: 'rgba(22,27,34,0.96)', borderRadius: 8, padding: '3px 5px', border: `1px solid ${C.border}` }}>
                        <CtrlBtn onClick={() => handleMove(section.id, 'up')} disabled={idx === 0} title="Nach oben">↑</CtrlBtn>
                        <CtrlBtn onClick={() => handleMove(section.id, 'down')} disabled={idx === sections.length - 1} title="Nach unten">↓</CtrlBtn>
                        <div style={{ width: 1, background: C.border, margin: '2px 2px' }} />
                        <CtrlBtn onClick={() => handleToggle(section.id)} title={section.isActive ? 'Ausblenden' : 'Einblenden'}>{section.isActive ? '👁' : '🙈'}</CtrlBtn>
                        <CtrlBtn onClick={() => handleLock(section.id)} title={section.styling?.isLocked ? 'Entsperren' : 'Sperren'}>{section.styling?.isLocked ? '🔒' : '🔓'}</CtrlBtn>
                        <CtrlBtn onClick={() => setCopyToPageSectionId(section.id)} title="Zu anderer Page kopieren">⧉</CtrlBtn>
                        <CtrlBtn onClick={() => handleDelete(section.id)} danger title="Löschen">✕</CtrlBtn>
                      </div>
                    )}
                  </div>
                ))
               )}
               {navigations.filter(n => n.location === 'footer' && n.isActive).map(nav => (
                <NavBarPreview key={nav.id} nav={nav} isSelected={selectedNavId === nav.id}
                  onClick={() => { setSelectedNavId(nav.id); setSelectedId(null); }}
                  primary={templateSettings?.colors?.primary || '#3b82f6'} />
              ))}
            </div>
        </div>
          </>
          )}
        </div>

        
        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ width: rightCollapsed ? 0 : 300, overflow: 'hidden', transition: 'width 0.2s ease', background: C.panel, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {selectedSection ? (
            <>
              {/* Header */}
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>{selectedSection.type}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{selectedSection.name}</p>
                </div>
                <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem', padding: '3px', flexShrink: 0 }}>✕</button>
              </div>

              {/* 4 Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                {[
               { id: 'content', label: '✎', title: 'Inhalt' },
                  { id: 'style', label: '🎨', title: 'Stil & Typo' },
                  { id: 'layout', label: '⊡', title: 'Layout & Mobile' },
                  { id: 'css', label: '</>', title: 'Custom CSS' },
                  { id: 'animation', label: '✨', title: 'Animation' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setRightTab(tab.id as any)} title={tab.title}
                    style={{ flex: 1, padding: '9px 4px', background: rightTab === tab.id ? '#0d1117' : 'transparent', border: 'none', borderBottom: `2px solid ${rightTab === tab.id ? C.accent : 'transparent'}`, cursor: 'pointer', color: rightTab === tab.id ? C.accent : C.muted, fontSize: rightTab === tab.id ? '0.75rem' : '0.85rem', fontWeight: 600 }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Panel */}
             <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {selectedSection.styling?.isLocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '2rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>🔒</span>
                    <p style={{ color: '#e6edf3', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Section gesperrt</p>
                    <p style={{ color: '#6e7681', fontSize: '0.75rem', margin: 0 }}>Entsperren um zu bearbeiten</p>
                    <button onClick={() => handleLock(selectedSection.id)}
                      style={{ background: '#f0883e', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                      🔓 Entsperren
                    </button>
                  </div>
                ) : (
                  <>
                    {rightTab === 'content' && <ContentEditor section={selectedSection} onChange={handleContentChange} availableForms={availableForms}availableBookingServices={availableBookingServices} />}
                    {rightTab === 'style' && <StylePanel section={selectedSection} onChange={handleStylingChange} onPickMedia={(cb) => setMediaPicker({ onSelect: cb })} />}
                    {rightTab === 'layout' && <LayoutPanel section={selectedSection} onChange={handleStylingChange} deviceMode={deviceMode} />}
                    {rightTab === 'css' && <CssPanel section={selectedSection} onChange={handleStylingChange} />}
                    {rightTab === 'animation' && <AnimationPanel section={selectedSection} onChange={handleStylingChange} />}
                  </>
                )}
              </div>
            </>
         ) : selectedNavId ? (
            <>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', color: C.muted, textTransform: 'uppercase', margin: '0 0 2px' }}>Navigation</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3', margin: 0 }}>{navigations.find(n => n.id === selectedNavId)?.name}</p>
                </div>
                <button onClick={() => setSelectedNavId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem' }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {navigations.find(n => n.id === selectedNavId) && (
                  <NavEditorPanel
  nav={navigations.find(n => n.id === selectedNavId)!}
  onRefresh={refetchNavs}
  createNavItem={createNavItemMut}
  updateNavItem={updateNavItemMut}
  deleteNavItem={deleteNavItemMut}
  updateNav={updateNavigationMut}
/>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.muted, padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14, opacity: 0.4 }}>⬅</div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.dim, margin: '0 0 6px' }}>Section auswählen</p>
              <p style={{ fontSize: '0.75rem', lineHeight: 1.6, margin: 0 }}>Klicke auf eine Section im Canvas um sie zu bearbeiten.</p>
            </div>
          )}
        </div>
      </div>
    {/* Toast */}
      {saveToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#238636', color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: '0.8rem', fontWeight: 600, zIndex: 400, pointerEvents: 'none' }}>
          {saveToast}
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowShortcuts(false)}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 24, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e6edf3', margin: '0 0 16px' }}>⌨️ Tastenkürzel</p>
            {[
              ['Ctrl + S', 'Speichern'],
              ['Ctrl + Z', 'Rückgängig'],
              ['Escape', 'Auswahl aufheben'],
              ['Doppelklick (Ebene)', 'Section umbenennen'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <code style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', color: '#58a6ff' }}>{key}</code>
                <span style={{ fontSize: '0.78rem', color: '#8b949e' }}>{desc}</span>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)}
              style={{ width: '100%', marginTop: 8, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '7px', fontSize: '0.8rem', cursor: 'pointer' }}>
              Schließen
            </button>
          </div>
        </div>
      )}
            {/* MediaPicker */}
      {mediaPicker && <MediaPicker onSelect={mediaPicker.onSelect} onClose={() => setMediaPicker(null)} />}
  

{/* Navigation Overlay */}
      {showNavEditor && <NavigationEditor onClose={async () => { setShowNavEditor(false); await refetchNavs(); }} />}

      {/* Copy to Page Modal */}
      {copyToPageSectionId && (() => {
        const sec = sections.find(s => s.id === copyToPageSectionId);
        return sec ? (
          <CopyToPageModal
            section={sec}
            templateId={resolvedTemplateId}
            tenantId={tenant?.id || ''}
            currentPageId={currentPageId}
            onClose={() => setCopyToPageSectionId(null)}
            createSectionMut={createSectionMut}
          />
        ) : null;
      })()}

      {/* Global Colors Panel */}
      {showGlobalColors && (
        <GlobalColorsPanel
          templateSettings={templateSettings}
          templateId={resolvedTemplateId}
          tenantId={tenant?.id || ''}
          onUpdate={setTemplateSettings}
          onClose={() => setShowGlobalColors(false)}
          updateTemplateMut={updateTemplateMut}
        />
      )}
    </div>
  );
}