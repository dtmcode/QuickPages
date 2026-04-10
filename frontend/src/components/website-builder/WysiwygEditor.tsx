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
  hero: { blocks: [
    { id: 'b1', type: 'badge', text: '🔥 Neu', align: 'center', order: 0 },
    { id: 'b2', type: 'heading', text: 'Deine Überschrift hier', level: 'h1', align: 'center', order: 1 },
    { id: 'b3', type: 'text', html: '<p>Eine überzeugende Unterüberschrift die deine Besucher begeistert.</p>', align: 'center', order: 2 },
    { id: 'b4', type: 'button', text: 'Jetzt starten', link: '#', style: 'primary', align: 'center', order: 3 },
  ]},
  cta: { blocks: [
    { id: 'b1', type: 'heading', text: 'Bereit loszulegen?', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Starte noch heute kostenlos — kein Risiko.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'button', text: 'Jetzt starten', link: '#', style: 'primary', align: 'center', order: 2 },
  ]},
  text: { blocks: [
    { id: 'b1', type: 'heading', text: 'Überschrift', level: 'h2', align: 'left', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Dein Text hier.</p>', align: 'left', order: 1 },
  ]},
  spacer: { blocks: [
    { id: 'b1', type: 'spacer', height: '80px', order: 0 },
  ]},
  about: { blocks: [
    { id: 'b1', type: 'heading', text: 'Über uns', level: 'h2', align: 'left', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Hier steht eine kurze Beschreibung über euch.</p>', align: 'left', order: 1 },
    { id: 'b3', type: 'button', text: 'Mehr erfahren', link: '#', style: 'outline', align: 'left', order: 2 },
  ]},
  features: { blocks: [
    { id: 'b1', type: 'heading', text: 'Unsere Features', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Was uns besonders macht.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'feature-grid', columns: 3, items: [
      { icon: '⚡', title: 'Feature 1', description: 'Kurze Beschreibung.' },
      { icon: '🎯', title: 'Feature 2', description: 'Kurze Beschreibung.' },
      { icon: '🔥', title: 'Feature 3', description: 'Kurze Beschreibung.' },
    ], order: 2 },
  ]},
  services: { blocks: [
    { id: 'b1', type: 'heading', text: 'Unsere Leistungen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'feature-grid', columns: 3, items: [
      { icon: '🛠️', title: 'Service 1', description: 'Beschreibung', price: 'ab €99' },
      { icon: '💡', title: 'Service 2', description: 'Beschreibung', price: 'ab €149' },
      { icon: '🚀', title: 'Service 3', description: 'Beschreibung', price: 'ab €199' },
    ], order: 1 },
  ]},
  stats: { blocks: [
    { id: 'b1', type: 'heading', text: 'In Zahlen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'stat-grid', columns: 4, items: [
      { value: '1.000+', label: 'Kunden', description: 'Weltweit' },
      { value: '99%', label: 'Zufriedenheit', description: 'Bewertung' },
      { value: '24/7', label: 'Support', description: 'Erreichbar' },
      { value: '5+', label: 'Jahre', description: 'Erfahrung' },
    ], order: 1 },
  ]},
  testimonials: { blocks: [
    { id: 'b1', type: 'heading', text: 'Was unsere Kunden sagen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'testimonial-grid', columns: 2, items: [
      { name: 'Max Müller', role: 'CEO', text: 'Absolut empfehlenswert!', image: '' },
      { name: 'Anna Schmidt', role: 'Designerin', text: 'Super einfach zu bedienen.', image: '' },
    ], order: 1 },
  ]},
  team: { blocks: [
    { id: 'b1', type: 'heading', text: 'Unser Team', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'team-grid', columns: 3, items: [
      { name: 'Max Müller', role: 'CEO', bio: 'Gründer & Visionär', image: '' },
      { name: 'Anna Schmidt', role: 'CTO', bio: 'Technik-Expertin', image: '' },
    ], order: 1 },
  ]},
  gallery: { blocks: [
    { id: 'b1', type: 'heading', text: 'Galerie', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'image-grid', columns: 3, images: [
      { url: '', alt: 'Bild 1' },
      { url: '', alt: 'Bild 2' },
      { url: '', alt: 'Bild 3' },
    ], order: 1 },
  ]},
  pricing: { blocks: [
    { id: 'b1', type: 'heading', text: 'Unsere Preise', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'pricing-grid', columns: 2, items: [
      { title: 'Starter', price: '€9', interval: 'Monat', features: ['Feature 1', 'Feature 2'], buttonText: 'Jetzt starten', highlighted: false },
      { title: 'Pro', price: '€29', interval: 'Monat', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Jetzt starten', highlighted: true },
    ], order: 1 },
  ]},
  contact: { blocks: [
    { id: 'b1', type: 'heading', text: 'Kontakt aufnehmen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Wir freuen uns auf deine Nachricht.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'contact-form', buttonText: 'Senden', order: 2 },
  ]},
  faq: { blocks: [
    { id: 'b1', type: 'heading', text: 'Häufige Fragen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'faq-list', items: [
      { question: 'Wie funktioniert das?', answer: 'Ganz einfach...' },
      { question: 'Was kostet es?', answer: 'Ab €9 pro Monat.' },
    ], order: 1 },
  ]},
  video: { blocks: [
    { id: 'b1', type: 'heading', text: '', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'video', url: '', align: 'center', order: 1 },
  ]},
  html: { blocks: [
    { id: 'b1', type: 'text', html: '<div style="padding:2rem;text-align:center"><h2>Dein HTML hier</h2></div>', align: 'left', order: 0 },
  ]},
  blog: { blocks: [
    { id: 'b1', type: 'heading', text: 'Neueste Beiträge', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'blog-feed', count: 3, order: 1 },
  ]},
  newsletter: { blocks: [
    { id: 'b1', type: 'heading', text: 'Newsletter abonnieren', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Erhalte die neuesten Updates direkt in dein Postfach.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'newsletter-form', buttonText: 'Abonnieren', placeholder: 'deine@email.de', order: 2 },
  ]},
  whatsapp: { blocks: [
    { id: 'b1', type: 'whatsapp-btn', phone: '+49 151 12345678', message: 'Hallo, ich hätte eine Frage...', position: 'right', label: 'WhatsApp schreiben', order: 0 },
  ]},
  before_after: { blocks: [
    { id: 'b1', type: 'before-after', beforeImage: '', afterImage: '', beforeLabel: 'Vorher', afterLabel: 'Nachher', order: 0 },
  ]},
  booking: { blocks: [
    { id: 'b1', type: 'heading', text: 'Termin buchen', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Buche jetzt deinen Wunschtermin.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'button', text: 'Termin buchen', link: '/booking', style: 'primary', align: 'center', order: 2 },
  ]},
  social: { blocks: [
    { id: 'b1', type: 'heading', text: 'Folge uns', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'social-links', links: [
      { platform: 'Instagram', url: 'https://instagram.com/', icon: '📷' },
      { platform: 'Facebook', url: 'https://facebook.com/', icon: '👍' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/', icon: '💼' },
    ], order: 1 },
  ]},
  map: { blocks: [
    { id: 'b1', type: 'heading', text: 'So findest du uns', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'map-embed', address: 'Musterstraße 1, 12345 Musterstadt', embedUrl: '', order: 1 },
  ]},
  countdown: { blocks: [
    { id: 'b1', type: 'heading', text: 'Nur noch bis...', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'countdown-timer', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], text: 'Verpasse nicht unser Angebot!', order: 1 },
  ]},
  freestyle: { blocks: [
    { id: 'b1', type: 'heading', text: 'Deine Überschrift', level: 'h2', align: 'center', order: 0 },
    { id: 'b2', type: 'text', html: '<p>Dein Text hier.</p>', align: 'center', order: 1 },
    { id: 'b3', type: 'button', text: 'Jetzt starten', link: '#', style: 'primary', align: 'center', order: 2 },
  ]},
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
  // Basis
  { type: 'heading', label: 'Überschrift', icon: 'H', category: 'basis' },
  { type: 'text', label: 'Text', icon: '¶', category: 'basis' },
  { type: 'button', label: 'Button', icon: '🔘', category: 'basis' },
  { type: 'image', label: 'Bild', icon: '🖼️', category: 'basis' },
  { type: 'badge', label: 'Badge', icon: '🏷️', category: 'basis' },
  { type: 'divider', label: 'Trennlinie', icon: '—', category: 'basis' },
  { type: 'spacer', label: 'Abstand', icon: '↕', category: 'basis' },
  { type: 'icon', label: 'Icon/Emoji', icon: '⭐', category: 'basis' },
  { type: 'list', label: 'Liste', icon: '☰', category: 'basis' },
  { type: 'video', label: 'Video', icon: '▶️', category: 'basis' },
  { type: 'columns', label: '2 Spalten', icon: '⬛⬛', category: 'basis' },
  // Komplex
  { type: 'feature-grid', label: 'Feature Grid', icon: '✨', category: 'komplex' },
  { type: 'pricing-grid', label: 'Preis Grid', icon: '💰', category: 'komplex' },
  { type: 'testimonial-grid', label: 'Bewertungen', icon: '💬', category: 'komplex' },
  { type: 'team-grid', label: 'Team Grid', icon: '👥', category: 'komplex' },
  { type: 'stat-grid', label: 'Statistiken', icon: '📊', category: 'komplex' },
  { type: 'faq-list', label: 'FAQ Liste', icon: '❓', category: 'komplex' },
  { type: 'image-grid', label: 'Bild Grid', icon: '🖼️', category: 'komplex' },
  { type: 'contact-form', label: 'Kontaktformular', icon: '📬', category: 'komplex' },
  { type: 'newsletter-form', label: 'Newsletter Form', icon: '📧', category: 'komplex' },
  { type: 'blog-feed', label: 'Blog Feed', icon: '📰', category: 'komplex' },
  { type: 'social-links', label: 'Social Links', icon: '🌐', category: 'komplex' },
  { type: 'map-embed', label: 'Karte', icon: '🗺️', category: 'komplex' },
  { type: 'countdown-timer', label: 'Countdown', icon: '⏱️', category: 'komplex' },
  { type: 'before-after', label: 'Before/After', icon: '↔️', category: 'komplex' },
  { type: 'whatsapp-btn', label: 'WhatsApp', icon: '💬', category: 'komplex' },
];

const DEFAULT_BLOCK: Record<string, any> = {
  // Basis
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
  // Komplex
  'feature-grid': { columns: 3, items: [
    { icon: '⚡', title: 'Feature 1', description: 'Beschreibung' },
    { icon: '🎯', title: 'Feature 2', description: 'Beschreibung' },
    { icon: '🔥', title: 'Feature 3', description: 'Beschreibung' },
  ]},
  'pricing-grid': { columns: 2, items: [
    { title: 'Starter', price: '€9', interval: 'Monat', features: ['Feature 1', 'Feature 2'], buttonText: 'Jetzt starten', highlighted: false },
    { title: 'Pro', price: '€29', interval: 'Monat', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Jetzt starten', highlighted: true },
  ]},
  'testimonial-grid': { columns: 2, items: [
    { name: 'Max Müller', role: 'CEO', text: 'Absolut empfehlenswert!', image: '' },
    { name: 'Anna Schmidt', role: 'Designerin', text: 'Super einfach zu bedienen.', image: '' },
  ]},
  'team-grid': { columns: 3, items: [
    { name: 'Max Müller', role: 'CEO', bio: 'Gründer & Visionär', image: '' },
    { name: 'Anna Schmidt', role: 'CTO', bio: 'Technik-Expertin', image: '' },
  ]},
  'stat-grid': { columns: 4, items: [
    { value: '1.000+', label: 'Kunden', description: 'Weltweit' },
    { value: '99%', label: 'Zufriedenheit', description: 'Bewertung' },
    { value: '24/7', label: 'Support', description: 'Erreichbar' },
    { value: '5+', label: 'Jahre', description: 'Erfahrung' },
  ]},
  'faq-list': { items: [
    { question: 'Wie funktioniert das?', answer: 'Ganz einfach...' },
    { question: 'Was kostet es?', answer: 'Ab €9 pro Monat.' },
  ]},
  'image-grid': { columns: 3, images: [
    { url: '', alt: 'Bild 1' },
    { url: '', alt: 'Bild 2' },
    { url: '', alt: 'Bild 3' },
  ]},
  'contact-form': { buttonText: 'Senden' },
  'newsletter-form': { buttonText: 'Abonnieren', placeholder: 'deine@email.de' },
  'blog-feed': { count: 3 },
  'social-links': { links: [
    { platform: 'Instagram', url: 'https://instagram.com/', icon: '📷' },
    { platform: 'Facebook', url: 'https://facebook.com/', icon: '👍' },
  ]},
  'map-embed': { address: '', embedUrl: '' },
  'countdown-timer': { targetDate: '', text: '' },
  'before-after': { beforeImage: '', afterImage: '', beforeLabel: 'Vorher', afterLabel: 'Nachher' },
  'whatsapp-btn': { phone: '', message: '', position: 'right', label: 'WhatsApp schreiben' },
};
function generateBlockId() {
  return 'b' + Math.random().toString(36).substr(2, 9);
}


// ==================== FREESTYLE EDITOR ====================
function FreestyleEditor({ content, onChange, externalSelectedBlockId, onPickMedia, availableForms, availableBookingServices }: {

  content: SectionContent;
  onChange: (c: SectionContent) => void;
  externalSelectedBlockId?: string | null;
  onPickMedia?: (cb: (url: string) => void) => void;
   availableForms?: { id: string; name: string; slug: string }[];
  availableBookingServices?: { id: string; name: string; duration: number; price: number }[];
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
// Sync external selection (Canvas click → Panel)
useEffect(() => {
  if (externalSelectedBlockId !== undefined && externalSelectedBlockId !== null) {
    setSelectedBlockId(externalSelectedBlockId);
    // Scroll to block in list
    setTimeout(() => {
      document.getElementById(`block-item-${externalSelectedBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
}, [externalSelectedBlockId]);
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
  id={`block-item-${block.id}`}
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
     {/* Block hinzufügen — kategorisiert */}
{showAddMenu ? (
  <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 10, marginBottom: 12 }}>
    <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Basis-Elemente</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 10 }}>
      {FREESTYLE_BLOCK_TYPES.filter(bt => bt.category === 'basis').map(bt => (
        <button key={bt.type} onClick={() => addBlock(bt.type)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 6, cursor: 'pointer', background: '#161b22', border: '1px solid #21262d', color: '#c9d1d9', fontSize: '0.68rem', fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262d')}>
          <span style={{ fontSize: '1rem' }}>{bt.icon}</span>
          <span>{bt.label}</span>
        </button>
      ))}
    </div>
    <p style={{ fontSize: '0.68rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Komplex</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
      {FREESTYLE_BLOCK_TYPES.filter(bt => bt.category === 'komplex').map(bt => (
        <button key={bt.type} onClick={() => addBlock(bt.type)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 6, cursor: 'pointer', background: '#161b22', border: '1px solid rgba(88,166,255,0.2)', color: '#c9d1d9', fontSize: '0.68rem', fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(88,166,255,0.2)')}>
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
      <label style={labelStyle}>Schriftgröße</label>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {[{ v: '0.75rem', l: 'XS' }, { v: '1rem', l: 'S' }, { v: '1.25rem', l: 'M' }, { v: '1.5rem', l: 'L' }, { v: '2rem', l: 'XL' }].map(s => (
          <button key={s.v} onClick={() => updateBlock(selectedBlock.id, { fontSize: s.v })}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: (selectedBlock.fontSize || '') === s.v ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.fontSize || '') === s.v ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.fontSize || '') === s.v ? '#fff' : '#8b949e' }}>
            {s.l}
          </button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Textfarbe</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={selectedBlock.color || '#000000'}
          onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })}
          style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
        <input type="text" value={selectedBlock.color || ''}
          onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })}
          style={{ ...inputStyle, flex: 1 }} placeholder="#000000" />
      </div>
    </div>
  </>
)}

        {selectedBlock.type === 'text' && (
  <>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Text (HTML erlaubt)</label>
      <textarea value={selectedBlock.html || ''} onChange={e => updateBlock(selectedBlock.id, { html: e.target.value })}
        rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
    </div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Schriftgröße</label>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {[{ v: '0.75rem', l: 'XS' }, { v: '1rem', l: 'S' }, { v: '1.125rem', l: 'M' }, { v: '1.25rem', l: 'L' }, { v: '1.5rem', l: 'XL' }].map(s => (
          <button key={s.v} onClick={() => updateBlock(selectedBlock.id, { fontSize: s.v })}
            style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: (selectedBlock.fontSize || '') === s.v ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.fontSize || '') === s.v ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.fontSize || '') === s.v ? '#fff' : '#8b949e' }}>
            {s.l}
          </button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Textfarbe</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={selectedBlock.color || '#000000'}
          onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })}
          style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid #30363d', cursor: 'pointer', padding: 2 }} />
        <input type="text" value={selectedBlock.color || ''}
          onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })}
          style={{ ...inputStyle, flex: 1 }} placeholder="#000000" />
      </div>
    </div>
  </>
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
            {selectedBlock.link?.startsWith('/booking') && (
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Buchungs-Service</label>
        <select value={selectedBlock.serviceId || ''} onChange={e => updateBlock(selectedBlock.id, { serviceId: e.target.value })}
          style={inputStyle}>
          <option value="">— Kein Service verknüpft —</option>
          {(availableBookingServices || []).map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.duration}min — €{s.price}</option>
          ))}
        </select>
      </div>
    )}
  </>
)}

     {selectedBlock.type === 'image' && (
  <>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Bild URL</label>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="text" value={selectedBlock.url || ''} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} style={{ ...inputStyle, flex: 1 }} placeholder="https://..." />
        {onPickMedia && (
          <button onClick={() => onPickMedia(url => updateBlock(selectedBlock.id, { url }))}
            style={{ background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 10px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🖼️
          </button>
        )}
      </div>
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
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Aufteilung</label>
      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
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

    {/* Linke Spalte */}
    <div style={{ marginBottom: 12 }}>
      <label style={{ ...labelStyle, color: '#58a6ff' }}>⬛ Linke Spalte</label>
      {(selectedBlock.leftBlocks || []).map((lb: any, i: number) => (
        <div key={lb.id || i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', marginBottom: 3, background: '#0d1117', border: '1px solid #21262d', borderRadius: 5 }}>
          <span style={{ fontSize: '0.75rem', flex: 1, color: '#c9d1d9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lb.text || lb.html?.replace(/<[^>]*>/g, '') || lb.type}
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6e7681' }}>{lb.type}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { leftBlocks: (selectedBlock.leftBlocks || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
      ))}
      {/* Inline Text/Heading hinzufügen */}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input type="text" placeholder="Text eingeben..."
          style={{ ...inputStyle, flex: 1, fontSize: '0.72rem' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
              const val = (e.target as HTMLInputElement).value;
              updateBlock(selectedBlock.id, { leftBlocks: [...(selectedBlock.leftBlocks || []), { id: generateBlockId(), type: 'text', html: `<p>${val}</p>`, align: 'left', order: (selectedBlock.leftBlocks || []).length }] });
              (e.target as HTMLInputElement).value = '';
            }
          }} />
        <button onClick={() => updateBlock(selectedBlock.id, { leftBlocks: [...(selectedBlock.leftBlocks || []), { id: generateBlockId(), type: 'image', url: '', alt: '', width: '100%', align: 'center', order: (selectedBlock.leftBlocks || []).length }] })}
          style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>🖼️</button>
        <button onClick={() => updateBlock(selectedBlock.id, { leftBlocks: [...(selectedBlock.leftBlocks || []), { id: generateBlockId(), type: 'heading', text: 'Überschrift', level: 'h3', align: 'left', order: (selectedBlock.leftBlocks || []).length }] })}
          style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>H</button>
      </div>
    </div>

    {/* Rechte Spalte */}
    <div>
      <label style={{ ...labelStyle, color: '#58a6ff' }}>⬛ Rechte Spalte</label>
      {(selectedBlock.rightBlocks || []).map((rb: any, i: number) => (
        <div key={rb.id || i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', marginBottom: 3, background: '#0d1117', border: '1px solid #21262d', borderRadius: 5 }}>
          <span style={{ fontSize: '0.75rem', flex: 1, color: '#c9d1d9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rb.text || rb.html?.replace(/<[^>]*>/g, '') || rb.type}
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6e7681' }}>{rb.type}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { rightBlocks: (selectedBlock.rightBlocks || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input type="text" placeholder="Text eingeben..."
          style={{ ...inputStyle, flex: 1, fontSize: '0.72rem' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
              const val = (e.target as HTMLInputElement).value;
              updateBlock(selectedBlock.id, { rightBlocks: [...(selectedBlock.rightBlocks || []), { id: generateBlockId(), type: 'text', html: `<p>${val}</p>`, align: 'left', order: (selectedBlock.rightBlocks || []).length }] });
              (e.target as HTMLInputElement).value = '';
            }
          }} />
        <button onClick={() => updateBlock(selectedBlock.id, { rightBlocks: [...(selectedBlock.rightBlocks || []), { id: generateBlockId(), type: 'image', url: '', alt: '', width: '100%', align: 'center', order: (selectedBlock.rightBlocks || []).length }] })}
          style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>🖼️</button>
        <button onClick={() => updateBlock(selectedBlock.id, { rightBlocks: [...(selectedBlock.rightBlocks || []), { id: generateBlockId(), type: 'heading', text: 'Überschrift', level: 'h3', align: 'left', order: (selectedBlock.rightBlocks || []).length }] })}
          style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>H</button>
      </div>
    </div>
  </div>
   )}
          
 {selectedBlock.type === 'feature-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 3) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 3) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 3) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    <label style={labelStyle}>Items ({(selectedBlock.items || []).length})</label>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['icon', 'title', 'description', 'price'].map(f => (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { icon: '⭐', title: 'Neu', description: '' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Item
    </button>
  </div>
)}

{selectedBlock.type === 'stat-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 4) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 4) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 4) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['value', 'label', 'description'].map(f => (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { value: '0', label: 'Neu', description: '' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Stat
    </button>
  </div>
)}

{selectedBlock.type === 'testimonial-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 2) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 2) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 2) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['name', 'role', 'text', 'image'].map(f => (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { name: 'Name', role: 'Rolle', text: 'Bewertung', image: '' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Bewertung
    </button>
  </div>
)}

{selectedBlock.type === 'team-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 3) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 3) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 3) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['name', 'role', 'bio', 'image'].map(f => (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { name: 'Name', role: 'Rolle', bio: '', image: '' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Person
    </button>
  </div>
)}

{selectedBlock.type === 'pricing-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[2, 3].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 2) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 2) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 2) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1} {item.highlighted ? '⭐ Highlighted' : ''}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['title', 'price', 'interval', 'buttonText'].map(f => (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
        <textarea placeholder="Features (eine pro Zeile)"
          value={(item.features || []).join('\n')}
          onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], features: e.target.value.split('\n') }; updateBlock(selectedBlock.id, { items: u }); }}
          rows={3} style={{ ...inputStyle, resize: 'vertical', marginBottom: 3, fontSize: '0.72rem' }} />
        <button onClick={() => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], highlighted: !u[i].highlighted }; updateBlock(selectedBlock.id, { items: u }); }}
          style={{ width: '100%', padding: '4px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
            background: item.highlighted ? '#1f6feb' : '#161b22',
            border: `1px solid ${item.highlighted ? '#1f6feb' : '#30363d'}`,
            color: item.highlighted ? '#fff' : '#8b949e' }}>
          {item.highlighted ? '⭐ Highlighted' : 'Als Highlighted markieren'}
        </button>
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { title: 'Paket', price: '€0', interval: 'Monat', features: ['Feature'], buttonText: 'Wählen', highlighted: false }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Paket
    </button>
  </div>
)}

{selectedBlock.type === 'faq-list' && (
  <div>
    {(selectedBlock.items || []).map((item: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { items: (selectedBlock.items || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        <input type="text" placeholder="Frage" value={item.question || ''}
          onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], question: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
          style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        <textarea placeholder="Antwort" value={item.answer || ''}
          onChange={e => { const u = [...(selectedBlock.items || [])]; u[i] = { ...u[i], answer: e.target.value }; updateBlock(selectedBlock.id, { items: u }); }}
          rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: '0.72rem' }} />
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { items: [...(selectedBlock.items || []), { question: 'Frage?', answer: 'Antwort.' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + FAQ
    </button>
  </div>
)}

{selectedBlock.type === 'image-grid' && (
  <div>
    <div style={{ marginBottom: 8 }}>
      <label style={labelStyle}>Spalten</label>
      <div style={{ display: 'flex', gap: 5 }}>
        {[2, 3, 4].map(n => (
          <button key={n} onClick={() => updateBlock(selectedBlock.id, { columns: n })}
            style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: (selectedBlock.columns || 3) === n ? '#1f6feb' : '#161b22',
              border: `1px solid ${(selectedBlock.columns || 3) === n ? '#1f6feb' : '#30363d'}`,
              color: (selectedBlock.columns || 3) === n ? '#fff' : '#8b949e' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
    {(selectedBlock.images || []).map((img: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>#{i + 1}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { images: (selectedBlock.images || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        <input type="text" placeholder="Bild URL" value={img.url || ''}
          onChange={e => { const u = [...(selectedBlock.images || [])]; u[i] = { ...u[i], url: e.target.value }; updateBlock(selectedBlock.id, { images: u }); }}
          style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        <input type="text" placeholder="Alt-Text" value={img.alt || ''}
          onChange={e => { const u = [...(selectedBlock.images || [])]; u[i] = { ...u[i], alt: e.target.value }; updateBlock(selectedBlock.id, { images: u }); }}
          style={{ ...inputStyle, fontSize: '0.72rem' }} />
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { images: [...(selectedBlock.images || []), { url: '', alt: '' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Bild
    </button>
  </div>
)}
{selectedBlock.type === 'contact-form' && (
  <div>
    <label style={labelStyle}>Formular verknüpfen</label>
    <select value={selectedBlock.formSlug || ''} onChange={e => updateBlock(selectedBlock.id, { formSlug: e.target.value })}
      style={{ ...inputStyle, marginBottom: 8 }}>
      <option value="">— Standard Kontaktformular —</option>
      {(availableForms || []).map(f => (
        <option key={f.id} value={f.slug}>{f.name}</option>
      ))}
    </select>
    <label style={labelStyle}>Button Text</label>
    <input type="text" value={selectedBlock.buttonText || 'Senden'}
      onChange={e => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
      style={{ ...inputStyle, marginBottom: 8 }} />
  </div>
)}

{selectedBlock.type === 'newsletter-form' && (
  <div>
    <label style={labelStyle}>Button Text</label>
    <input type="text" value={selectedBlock.buttonText || 'Abonnieren'}
      onChange={e => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
      style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Placeholder</label>
    <input type="text" value={selectedBlock.placeholder || 'deine@email.de'}
      onChange={e => updateBlock(selectedBlock.id, { placeholder: e.target.value })}
      style={inputStyle} />
  </div>
)}

{selectedBlock.type === 'blog-feed' && (
  <div>
    <label style={labelStyle}>Anzahl Posts</label>
    <div style={{ display: 'flex', gap: 5 }}>
      {[3, 6, 9].map(n => (
        <button key={n} onClick={() => updateBlock(selectedBlock.id, { count: n })}
          style={{ flex: 1, padding: '5px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
            background: (selectedBlock.count || 3) === n ? '#1f6feb' : '#161b22',
            border: `1px solid ${(selectedBlock.count || 3) === n ? '#1f6feb' : '#30363d'}`,
            color: (selectedBlock.count || 3) === n ? '#fff' : '#8b949e' }}>
          {n}
        </button>
      ))}
    </div>
  </div>
)}

{selectedBlock.type === 'social-links' && (
  <div>
    {(selectedBlock.links || []).map((link: any, i: number) => (
      <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#6e7681' }}>{link.platform || `Link ${i+1}`}</span>
          <button onClick={() => updateBlock(selectedBlock.id, { links: (selectedBlock.links || []).filter((_: any, j: number) => j !== i) })}
            style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
        </div>
        {['platform', 'url', 'icon'].map(f => (
          <input key={f} type="text" placeholder={f} value={link[f] || ''}
            onChange={e => { const u = [...(selectedBlock.links || [])]; u[i] = { ...u[i], [f]: e.target.value }; updateBlock(selectedBlock.id, { links: u }); }}
            style={{ ...inputStyle, marginBottom: 3, fontSize: '0.72rem' }} />
        ))}
      </div>
    ))}
    <button onClick={() => updateBlock(selectedBlock.id, { links: [...(selectedBlock.links || []), { platform: 'Instagram', url: '', icon: '📷' }] })}
      style={{ width: '100%', padding: '6px', background: 'transparent', border: '1px dashed #30363d', borderRadius: 6, color: '#6e7681', fontSize: '0.75rem', cursor: 'pointer' }}>
      + Link
    </button>
  </div>
)}

{selectedBlock.type === 'map-embed' && (
  <div>
    <label style={labelStyle}>Adresse</label>
    <input type="text" value={selectedBlock.address || ''} onChange={e => updateBlock(selectedBlock.id, { address: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Google Maps Embed URL</label>
    <input type="text" value={selectedBlock.embedUrl || ''} onChange={e => updateBlock(selectedBlock.id, { embedUrl: e.target.value })} style={inputStyle} placeholder="https://maps.google.com/..." />
  </div>
)}

{selectedBlock.type === 'countdown-timer' && (
  <div>
    <label style={labelStyle}>Zieldatum</label>
    <input type="date" value={selectedBlock.targetDate || ''} onChange={e => updateBlock(selectedBlock.id, { targetDate: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Text darunter</label>
    <input type="text" value={selectedBlock.text || ''} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} style={inputStyle} />
  </div>
)}

{selectedBlock.type === 'before-after' && (
  <div>
    <label style={labelStyle}>Vorher-Bild URL</label>
    <input type="text" value={selectedBlock.beforeImage || ''} onChange={e => updateBlock(selectedBlock.id, { beforeImage: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Nachher-Bild URL</label>
    <input type="text" value={selectedBlock.afterImage || ''} onChange={e => updateBlock(selectedBlock.id, { afterImage: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Labels</label>
    <div style={{ display: 'flex', gap: 6 }}>
      <input type="text" value={selectedBlock.beforeLabel || 'Vorher'} onChange={e => updateBlock(selectedBlock.id, { beforeLabel: e.target.value })} style={{ ...inputStyle, flex: 1 }} placeholder="Vorher" />
      <input type="text" value={selectedBlock.afterLabel || 'Nachher'} onChange={e => updateBlock(selectedBlock.id, { afterLabel: e.target.value })} style={{ ...inputStyle, flex: 1 }} placeholder="Nachher" />
    </div>
  </div>
)}

{selectedBlock.type === 'whatsapp-btn' && (
  <div>
    <label style={labelStyle}>Telefon</label>
    <input type="text" value={selectedBlock.phone || ''} onChange={e => updateBlock(selectedBlock.id, { phone: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} placeholder="+49 151..." />
    <label style={labelStyle}>Button Text</label>
    <input type="text" value={selectedBlock.label || ''} onChange={e => updateBlock(selectedBlock.id, { label: e.target.value })} style={{ ...inputStyle, marginBottom: 8 }} />
    <label style={labelStyle}>Vorausgefüllte Nachricht</label>
    <textarea value={selectedBlock.message || ''} onChange={e => updateBlock(selectedBlock.id, { message: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
  </div>
)}       
    </div>
      )}
    </div>
  );
}
// ==================== FLOATING BLOCK TOOLBAR ====================

function FloatingBlockToolbar({ block, onUpdate, onDelete, onDuplicate }: {
  block: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const btn = (active = false, danger = false): React.CSSProperties => ({
    background: active ? '#1f6feb' : 'transparent',
    border: 'none', borderRadius: 4,
    color: danger ? '#f85149' : active ? '#fff' : '#8b949e',
    padding: '3px 7px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1,
  });
  const sep = <div style={{ width: 1, height: 16, background: '#30363d', margin: '0 2px' }} />;

  const SIZES = [
    { l: 'XS', v: '0.75rem' }, { l: 'S', v: '1rem' }, { l: 'M', v: '1.25rem' },
    { l: 'L', v: '1.5rem' }, { l: 'XL', v: '2rem' },
  ];

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: -44, left: '50%', transform: 'translateX(-50%)',
        background: '#1c2128', border: '1px solid #30363d', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 2, padding: '4px 8px',
        zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        flexWrap: 'wrap', maxWidth: 480,
      }}
    >
      {/* Ausrichtung — für alle außer spacer/divider */}
      {block.align !== undefined && (
        <>
          {['left', 'center', 'right'].map(a => (
            <button key={a} onClick={() => onUpdate({ align: a })} style={btn(block.align === a)} title={a}>
              {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
            </button>
          ))}
          {sep}
        </>
      )}

      {/* HEADING spezifisch */}
      {block.type === 'heading' && (
        <>
          {['h1', 'h2', 'h3', 'h4'].map(l => (
            <button key={l} onClick={() => onUpdate({ level: l })} style={btn(block.level === l)}>
              {l.toUpperCase()}
            </button>
          ))}
          {sep}
          {SIZES.map(s => (
            <button key={s.v} onClick={() => onUpdate({ fontSize: s.v })} style={btn(block.fontSize === s.v)} title={s.v}>
              {s.l}
            </button>
          ))}
          {sep}
          <input
            type="color"
            value={block.color || '#000000'}
            onChange={e => onUpdate({ color: e.target.value })}
            title="Textfarbe"
            style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #30363d', cursor: 'pointer', padding: 1, background: 'none' }}
          />
          {sep}
        </>
      )}

      {/* TEXT spezifisch */}
      {block.type === 'text' && (
        <>
          {[
            { cmd: 'bold', l: 'B', s: { fontWeight: 700 } },
            { cmd: 'italic', l: 'I', s: { fontStyle: 'italic' } },
            { cmd: 'underline', l: 'U', s: { textDecoration: 'underline' } },
          ].map(f => (
            <button key={f.cmd}
              onClick={() => { document.execCommand(f.cmd); }}
              style={{ ...btn(), ...f.s }}
              title={f.cmd}>
              {f.l}
            </button>
          ))}
          {sep}
          <input
            type="color"
            value={block.color || '#000000'}
            onChange={e => {
              onUpdate({ color: e.target.value });
              document.execCommand('foreColor', false, e.target.value);
            }}
            title="Textfarbe"
            style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #30363d', cursor: 'pointer', padding: 1, background: 'none' }}
          />
          {sep}
          {SIZES.map(s => (
            <button key={s.v} onClick={() => onUpdate({ fontSize: s.v })} style={btn(block.fontSize === s.v)} title={s.v}>
              {s.l}
            </button>
          ))}
          {sep}
        </>
      )}

      {/* BUTTON spezifisch */}
      {block.type === 'button' && (
        <>
          {[{ v: 'primary', l: 'P' }, { v: 'outline', l: 'O' }, { v: 'ghost', l: 'G' }].map(o => (
            <button key={o.v} onClick={() => onUpdate({ style: o.v })} style={btn(block.style === o.v)} title={o.v}>{o.l}</button>
          ))}
          {sep}
          {[{ v: 'sm', l: 'S' }, { v: 'md', l: 'M' }, { v: 'lg', l: 'L' }].map(s => (
            <button key={s.v} onClick={() => onUpdate({ size: s.v })} style={btn(block.size === s.v)}>{s.l}</button>
          ))}
          {sep}
          <input
            type="color"
            value={block.bgColor || '#3b82f6'}
            onChange={e => onUpdate({ bgColor: e.target.value })}
            title="Button-Farbe"
            style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #30363d', cursor: 'pointer', padding: 1, background: 'none' }}
          />
          {sep}
        </>
      )}

      {/* IMAGE spezifisch */}
      {block.type === 'image' && (
        <>
          {['25%', '50%', '75%', '100%'].map(w => (
            <button key={w} onClick={() => onUpdate({ width: w })} style={btn(block.width === w)}>{w}</button>
          ))}
          {sep}
        </>
      )}

      {/* Badge Farbe */}
      {block.type === 'badge' && (
        <>
          <input
            type="color"
            value={block.color || '#3b82f6'}
            onChange={e => onUpdate({ color: e.target.value })}
            title="Farbe"
            style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #30363d', cursor: 'pointer', padding: 1 }}
          />
          {sep}
        </>
      )}

      {/* Icon Größe */}
      {block.type === 'icon' && (
        <>
          {[{ v: '2rem', l: 'S' }, { v: '3rem', l: 'M' }, { v: '4rem', l: 'L' }, { v: '6rem', l: 'XL' }].map(s => (
            <button key={s.v} onClick={() => onUpdate({ size: s.v })} style={btn(block.size === s.v)}>{s.l}</button>
          ))}
          {sep}
        </>
      )}

      {/* Duplizieren + Löschen */}
      <button onClick={onDuplicate} style={btn()} title="Duplizieren">⧉</button>
      <button onClick={onDelete} style={btn(false, true)} title="Löschen">✕</button>
    </div>
  );
}
function InlineAddBlock({ sectionId, onAdd }: { sectionId: string; onAdd: (sectionId: string, type: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = FREESTYLE_BLOCK_TYPES.filter(b =>
    !search || b.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
        <button
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          style={{
            background: 'rgba(88,166,255,0.08)', border: '1px dashed rgba(88,166,255,0.4)',
            borderRadius: 8, color: '#58a6ff', padding: '6px 20px', fontSize: '0.75rem',
            fontWeight: 600, cursor: 'pointer', width: '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(88,166,255,0.08)'}
        >
          + Element hinzufügen
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setSearch(''); } }}
        >
          <div style={{
            background: '#1c2128', border: '1px solid #30363d', borderRadius: 12,
            padding: 16, width: 480, maxWidth: '95vw', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>Element hinzufügen</p>
              <button onClick={() => { setOpen(false); setSearch(''); }}
                style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="🔍 Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: '#0d1117', border: '1px solid #30363d',
                borderRadius: 6, color: '#c9d1d9', padding: '8px 12px', fontSize: '0.8rem',
                outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            {!search && (
              <>
                <p style={{ fontSize: '0.65rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Basis</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
                  {FREESTYLE_BLOCK_TYPES.filter(bt => bt.category === 'basis').map(bt => (
                    <button key={bt.type}
                      onClick={() => { onAdd(sectionId, bt.type); setOpen(false); setSearch(''); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', background: '#0d1117', border: '1px solid #21262d', color: '#c9d1d9', fontSize: '0.7rem', fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.background = '#161b22'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = '#0d1117'; }}>
                      <span style={{ fontSize: '1.25rem' }}>{bt.icon}</span>
                      <span>{bt.label}</span>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.65rem', color: '#6e7681', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Komplex</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, overflowY: 'auto' }}>
                  {FREESTYLE_BLOCK_TYPES.filter(bt => bt.category === 'komplex').map(bt => (
                    <button key={bt.type}
                      onClick={() => { onAdd(sectionId, bt.type); setOpen(false); setSearch(''); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', background: 'rgba(88,166,255,0.04)', border: '1px solid rgba(88,166,255,0.15)', color: '#c9d1d9', fontSize: '0.7rem', fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.background = 'rgba(88,166,255,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(88,166,255,0.15)'; e.currentTarget.style.background = 'rgba(88,166,255,0.04)'; }}>
                      <span style={{ fontSize: '1.25rem' }}>{bt.icon}</span>
                      <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{bt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {search && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, overflowY: 'auto' }}>
                {filtered.map(bt => (
                  <button key={bt.type}
                    onClick={() => { onAdd(sectionId, bt.type); setOpen(false); setSearch(''); }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', background: '#0d1117', border: '1px solid #21262d', color: '#c9d1d9', fontSize: '0.7rem', fontWeight: 600 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#58a6ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; }}>
                    <span style={{ fontSize: '1.25rem' }}>{bt.icon}</span>
                    <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{bt.label}</span>
                  </button>
                ))}
                {filtered.length === 0 && <p style={{ color: '#6e7681', fontSize: '0.75rem', gridColumn: 'span 4', textAlign: 'center', padding: '1rem 0' }}>Nichts gefunden</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
// ==================== FLOATING ITEM EDITOR ====================
function FloatingItemEditor({ block, itemIndex, onUpdate, onClose }: {
  block: any;
  itemIndex: number;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}) {
  const item = (block.items || [])[itemIndex];
  if (!item) return null;

  const inp: React.CSSProperties = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 5, color: '#c9d1d9', padding: '5px 8px', fontSize: '0.72rem',
    outline: 'none', boxSizing: 'border-box', marginBottom: 4,
  };

  const updateItem = (field: string, val: any) => {
    const items = [...(block.items || [])];
    items[itemIndex] = { ...items[itemIndex], [field]: val };
    onUpdate({ items });
  };

  const fields: Record<string, string[]> = {
    'feature-grid': ['icon', 'title', 'description', 'price'],
    'stat-grid': ['value', 'label', 'description'],
    'testimonial-grid': ['name', 'role', 'text', 'image'],
    'team-grid': ['name', 'role', 'bio', 'image'],
    'pricing-grid': ['title', 'price', 'interval', 'buttonText'],
    'faq-list': ['question', 'answer'],
  };
  const fieldList = fields[block.type] || [];

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, background: '#1c2128', border: '1px solid #58a6ff',
        borderRadius: 10, padding: 10, minWidth: 220, maxWidth: 280,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.68rem', color: '#58a6ff', fontWeight: 700 }}>✎ Item #{itemIndex + 1}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>✕</button>
      </div>
      {fieldList.map(f => (
        f === 'answer' || f === 'bio' || f === 'text' ? (
          <textarea key={f} placeholder={f} value={item[f] || ''}
            onChange={e => updateItem(f, e.target.value)}
            rows={2} style={{ ...inp, resize: 'vertical' }} />
        ) : (
          <input key={f} type="text" placeholder={f} value={item[f] || ''}
            onChange={e => updateItem(f, e.target.value)}
            style={inp} />
        )
      ))}
      {block.type === 'pricing-grid' && (
        <button
          onClick={() => { const items = [...(block.items || [])]; items[itemIndex] = { ...items[itemIndex], highlighted: !items[itemIndex].highlighted }; onUpdate({ items }); }}
          style={{ width: '100%', padding: '4px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', background: item.highlighted ? '#1f6feb' : '#161b22', border: `1px solid ${item.highlighted ? '#1f6feb' : '#30363d'}`, color: item.highlighted ? '#fff' : '#8b949e' }}>
          {item.highlighted ? '⭐ Highlighted' : 'Als Highlighted markieren'}
        </button>
      )}
    </div>
  );
}
// ==================== CANVAS SECTION PREVIEW ====================

function CanvasSectionPreview({ section, isSelected, onClick, settings, deviceMode, selectedBlockId, onBlockClick, onBlockUpdate, onAddBlock }: {
  section: Section; isSelected: boolean; onClick: () => void;
  settings: TemplateSettings; deviceMode: 'desktop' | 'tablet' | 'mobile';
  selectedBlockId?: string | null;
  onBlockClick?: (blockId: string) => void;
  onBlockUpdate?: (sectionId: string, blockId: string, updates: any) => void;
  onAddBlock?: (sectionId: string, blockType: string) => void;
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
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);

  const renderBlock = (block: any): React.ReactNode => {
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
      <Tag style={{ 
        fontSize: block.fontSize || sizes[block.level || 'h2'],  // ← block.fontSize hat Vorrang
        fontWeight: 700, 
        margin: 0,
        color: block.color || 'inherit',  // ← block.color
      }}>
        {block.text || 'Überschrift'}
      </Tag>
    </div>
  );
}

case 'text':
  return (
    <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
      <div dangerouslySetInnerHTML={{ __html: block.html || '<p>Text...</p>' }} 
        style={{ 
          lineHeight: 1.6,
          fontSize: block.fontSize || 'inherit',  // ← block.fontSize
          color: block.color || 'inherit',         // ← block.color
        }} />
    </div>
  );
    case 'button':
      return (
        <div key={block.id} style={{ ...alignStyle, marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
            background: block.style === 'primary' ? btnBg : block.style === 'outline' ? 'transparent' : 'rgba(0,0,0,0.06)',
            color: block.style === 'primary' ? btnText : primary,
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
case 'columns': {
  const splitMap: Record<string, string> = { '50/50': '1fr 1fr', '60/40': '3fr 2fr', '40/60': '2fr 3fr', '70/30': '7fr 3fr' };
  const cols = splitMap[block.split || '50/50'] || '1fr 1fr';
  return (
    <div key={block.id} style={{ display: 'grid', gridTemplateColumns: cols, gap: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', padding: '0.75rem', minHeight: 60, border: '1px dashed rgba(0,0,0,0.12)' }}>
        {(block.leftBlocks || []).length > 0
          ? (block.leftBlocks || []).map((b: any) => renderBlock(b))
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,0.25)', fontSize: '0.72rem' }}>Linke Spalte</div>
        }
      </div>
      <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '0.5rem', padding: '0.75rem', minHeight: 60, border: '1px dashed rgba(0,0,0,0.12)' }}>
        {(block.rightBlocks || []).length > 0
          ? (block.rightBlocks || []).map((b: any) => renderBlock(b))
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(0,0,0,0.25)', fontSize: '0.72rem' }}>Rechte Spalte</div>
        }
      </div>
    </div>
  );
}

    // ── KOMPLEX ──
case 'feature-grid':
  return (
    <div key={block.id} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${block.columns || 3}, 1fr)`, gap: '1rem' }}>
        {(block.items || []).map((item: any, i: number) => {
          const itemKey = `${block.id}:${i}`;
          const isItemSelected = selectedItemKey === itemKey;
          return (
            <div key={i} style={{ position: 'relative' }}
              onClick={e => { e.stopPropagation(); setSelectedItemKey(isItemSelected ? null : itemKey); }}>
              {isItemSelected && onBlockUpdate && (
                <FloatingItemEditor
                  block={block}
                  itemIndex={i}
                  onUpdate={updates => onBlockUpdate(section.id, block.id, updates)}
                  onClose={() => setSelectedItemKey(null)}
                />
              )}
              <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: isItemSelected ? 'rgba(88,166,255,0.1)' : 'rgba(0,0,0,0.05)', textAlign: 'center', outline: isItemSelected ? '2px solid #58a6ff' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.1s' }}
                onMouseEnter={e => { if (!isItemSelected) (e.currentTarget as HTMLElement).style.outline = '2px dashed rgba(88,166,255,0.3)'; }}
                onMouseLeave={e => { if (!isItemSelected) (e.currentTarget as HTMLElement).style.outline = '2px solid transparent'; }}>
                {item.icon && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>}
                <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>{item.description}</p>
                {item.price && <p style={{ fontWeight: 700, color: primary, marginTop: '0.5rem', fontSize: '0.9rem' }}>{item.price}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

    case 'stat-grid':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : `repeat(${block.columns || 4}, 1fr)`, gap: '1.5rem', textAlign: 'center' }}>
            {(block.items || []).map((item: any, i: number) => (
              <div key={i}>
                <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: primary }}>{item.value}</div>
                <div style={{ fontWeight: 600, margin: '0.2rem 0 0.1rem', fontSize: '0.9rem' }}>{item.label}</div>
                {item.description && <div style={{ opacity: 0.6, fontSize: '0.75rem' }}>{item.description}</div>}
              </div>
            ))}
          </div>
        </div>
      );

case 'testimonial-grid':
  return (
    <div key={block.id} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${block.columns || 2}, 1fr)`, gap: '1rem' }}>
        {(block.items || []).map((item: any, i: number) => {
          const itemKey = `${block.id}:${i}`;
          const isItemSelected = selectedItemKey === itemKey;
          return (
            <div key={i} style={{ position: 'relative' }}
              onClick={e => { e.stopPropagation(); setSelectedItemKey(isItemSelected ? null : itemKey); }}>
              {isItemSelected && onBlockUpdate && (
                <FloatingItemEditor block={block} itemIndex={i}
                  onUpdate={updates => onBlockUpdate(section.id, block.id, updates)}
                  onClose={() => setSelectedItemKey(null)} />
              )}
              <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: isItemSelected ? 'rgba(88,166,255,0.1)' : 'rgba(0,0,0,0.05)', fontStyle: 'italic', outline: isItemSelected ? '2px solid #58a6ff' : '2px solid transparent', cursor: 'pointer' }}
                onMouseEnter={e => { if (!isItemSelected) (e.currentTarget as HTMLElement).style.outline = '2px dashed rgba(88,166,255,0.3)'; }}
                onMouseLeave={e => { if (!isItemSelected) (e.currentTarget as HTMLElement).style.outline = '2px solid transparent'; }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem' }}>„{item.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.image && <div style={{ width: 36, height: 36, borderRadius: '50%', background: primary, overflow: 'hidden', flexShrink: 0 }}><img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                  <div>
                    <p style={{ fontWeight: 600, fontStyle: 'normal', margin: 0, fontSize: '0.85rem' }}>{item.name}</p>
                    {item.role && <p style={{ opacity: 0.6, fontStyle: 'normal', margin: 0, fontSize: '0.75rem' }}>{item.role}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
    case 'team-grid':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : `repeat(${block.columns || 3}, 1fr)`, gap: '1.5rem', textAlign: 'center' }}>
            {(block.items || []).map((item: any, i: number) => (
              <div key={i}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: primary, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', overflow: 'hidden' }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <h3 style={{ fontWeight: 600, margin: '0 0 0.15rem', fontSize: '0.9rem' }}>{item.name}</h3>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', margin: 0 }}>{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'pricing-grid':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${block.columns || 2}, 1fr)`, gap: '1rem' }}>
            {(block.items || []).map((item: any, i: number) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: '0.75rem', background: item.highlighted ? primary : 'rgba(0,0,0,0.05)', color: item.highlighted ? '#fff' : 'inherit', border: `2px solid ${item.highlighted ? primary : 'transparent'}` }}>
                <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem' }}>{item.title}</h3>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.75rem' }}>{item.price}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/{item.interval}</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
                  {(item.features || []).map((f: string, fi: number) => <li key={fi} style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>✓ {f}</li>)}
                </ul>
                <div style={{ background: item.highlighted ? 'rgba(255,255,255,0.2)' : btnBg, color: item.highlighted ? '#fff' : btnText, borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                  {item.buttonText || 'Jetzt starten'}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'faq-list':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          {(block.items || []).map((item: any, i: number) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '0.875rem 0' }}>
              <h4 style={{ fontWeight: 600, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>{item.question}</h4>
              <p style={{ fontSize: '0.82rem', opacity: 0.7, margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      );

    case 'image-grid':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : `repeat(${block.columns || 3}, 1fr)`, gap: '0.75rem' }}>
            {(block.images || []).map((img: any, i: number) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '1.75rem' }}>
                {img?.url ? <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🖼️'}
              </div>
            ))}
          </div>
        </div>
      );

    case 'contact-form':
      return (
        <div key={block.id} style={{ maxWidth: 440, margin: '0 auto 1rem', textAlign: 'center' }}>
          {['Name', 'E-Mail', 'Nachricht'].map((f, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', textAlign: 'left', color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>{f}</div>
          ))}
          <div style={{ background: btnBg, color: btnText, borderRadius: '0.5rem', padding: '0.75rem', fontWeight: 600 }}>{block.buttonText || 'Absenden'}</div>
        </div>
      );

    case 'newsletter-form':
      return (
        <div key={block.id} style={{ maxWidth: 400, margin: '0 auto 1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.06)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>{block.placeholder || 'deine@email.de'}</div>
            <div style={{ background: btnBg, color: btnText, borderRadius: '0.5rem', padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{block.buttonText || 'Abonnieren'}</div>
          </div>
        </div>
      );

    case 'blog-feed':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '1rem' }}>
            {Array(block.count || 3).fill(null).map((_, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.2)', fontSize: '1.25rem' }}>📰</div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem' }}>Blog-Post Titel</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Kurze Beschreibung...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'social-links':
      return (
        <div key={block.id} style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(block.links || []).map((l: any, i: number) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{l.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{l.platform}</span>
            </div>
          ))}
        </div>
      );

    case 'map-embed':
      return (
        <div key={block.id} style={{ marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.75rem', aspectRatio: '16/7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.35)', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🗺️</span>
            <span style={{ fontSize: '0.8rem' }}>{block.address || 'Adresse eingeben'}</span>
          </div>
        </div>
      );

    case 'countdown-timer':
      return (
        <div key={block.id} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {['Tage', 'Std', 'Min', 'Sek'].map(u => (
              <div key={u} style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '0.5rem', padding: '0.75rem', minWidth: 56 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>00</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>{u}</div>
              </div>
            ))}
          </div>
          {block.text && <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>{block.text}</p>}
        </div>
      );

    case 'before-after':
      return (
        <div key={block.id} style={{ position: 'relative', width: '100%', paddingBottom: '40%', borderRadius: '0.75rem', overflow: 'hidden', background: 'rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
            {block.beforeImage ? <img src={block.beforeImage} alt="Vorher" style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>Vorher</div>}
            {block.beforeLabel && <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600 }}>{block.beforeLabel}</div>}
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: '50%', overflow: 'hidden' }}>
            {block.afterImage ? <img src={block.afterImage} alt="Nachher" style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '0.8rem' }}>Nachher</div>}
            {block.afterLabel && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600 }}>{block.afterLabel}</div>}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 3, background: '#fff', transform: 'translateX(-50%)', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#374151', boxShadow: '0 1px 6px rgba(0,0,0,0.2)' }}>↔</div>
          </div>
        </div>
      );

    case 'whatsapp-btn':
      return (
        <div key={block.id} style={{ textAlign: 'center', padding: '1rem 0', marginBottom: '0.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#25D366', color: '#fff', borderRadius: '3rem', fontWeight: 600, fontSize: '0.9rem' }}>
            💬 {block.label || 'WhatsApp schreiben'}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.4rem' }}>{block.phone}</p>
        </div>
      );

    default:
      return <div key={block.id} style={{ opacity: 0.4, fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>[{block.type}]</div>;
  }
};

const renderContent = () => {
  const blocks = [...(content.blocks || [])].sort((a: any, b: any) => a.order - b.order);

  // ── Neues Format mit blocks ──
  if (blocks.length > 0) {
    return (
      <div style={{ ...innerWidth, position: 'relative' }}>
        {blocks.map(block => (
          <div
            key={block.id}
            onClick={e => { e.stopPropagation(); onBlockClick?.(block.id); }}
            style={{
              position: 'relative',
              outline: selectedBlockId === block.id ? '2px solid #58a6ff' : 'none',
              outlineOffset: 2,
              borderRadius: 4,
              cursor: onBlockClick ? 'pointer' : 'inherit',
              transition: 'outline 0.1s',
            }}
            onMouseEnter={e => { if (onBlockClick && selectedBlockId !== block.id) e.currentTarget.style.outline = '1px dashed rgba(88,166,255,0.3)'; }}
            onMouseLeave={e => { if (selectedBlockId !== block.id) e.currentTarget.style.outline = 'none'; }}
          >
            {selectedBlockId === block.id && onBlockUpdate && (
              <FloatingBlockToolbar
                block={block}
                onUpdate={updates => onBlockUpdate(section.id, block.id, updates)}
                onDelete={() => onBlockUpdate(section.id, block.id, { _action: 'delete' })}
                onDuplicate={() => onBlockUpdate(section.id, block.id, { _action: 'duplicate' })}
              />
            )}
            {/* Inline Text Editing für heading */}
            {block.type === 'heading' && selectedBlockId === block.id ? (() => {
              const Tag = (block.level || 'h2') as any;
              const sizes: Record<string, string> = { h1: headingSize, h2: '1.75rem', h3: '1.25rem', h4: '1rem' };
              return (
                <div style={{ textAlign: (block.align || 'center') as any, marginBottom: '0.75rem' }}>
                  <Tag
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e: React.FocusEvent<HTMLElement>) => onBlockUpdate?.(section.id, block.id, { text: e.currentTarget.textContent || '' })}
                    style={{ fontSize: sizes[block.level || 'h2'], fontWeight: 700, margin: 0, outline: 'none', cursor: 'text', minWidth: 40, display: 'inline-block' }}
                    dangerouslySetInnerHTML={{ __html: block.text || 'Überschrift' }}
                  />
                </div>
              );
            })() : block.type === 'text' && selectedBlockId === block.id ? (
              <div style={{ textAlign: (block.align || 'left') as any, marginBottom: '0.75rem' }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e: React.FocusEvent<HTMLElement>) => onBlockUpdate?.(section.id, block.id, { html: e.currentTarget.innerHTML })}
                  style={{ lineHeight: 1.6, outline: 'none', cursor: 'text', minWidth: 40 }}
                  dangerouslySetInnerHTML={{ __html: block.html || '<p>Text...</p>' }}
                />
              </div>
            ) : renderBlock(block)}
          </div>
        ))}
          {onAddBlock && <InlineAddBlock sectionId={section.id} onAdd={onAddBlock} />}
      </div>
    );
  }

  // ── Fallback für alte Sections ohne blocks ──
  const h = content.heading || content.title || '';
  const getItems = (): any[] => content.items || content.plans || content.stats || [];
  const hasOldContent = h || content.text || content.subheading || getItems().length > 0 || content.images?.length > 0;

  if (hasOldContent) {
    return (
      <div style={{ ...innerWidth, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -10, right: 0, background: '#f0883e', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '2px 8px', borderRadius: '2rem', zIndex: 10 }}>
          ⚠ ALT — Inhalt-Tab öffnen
        </div>
        {h && <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: 0 }}>{h}</h2>
        </div>}
        {content.subheading && <p style={{ textAlign: 'center', opacity: 0.75, marginBottom: '1rem' }}>{content.subheading}</p>}
        {content.text && <div dangerouslySetInnerHTML={{ __html: content.text }} style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }} />}
        {content.buttonText && <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ display: 'inline-block', padding: '0.6rem 1.5rem', background: btnBg, color: btnText, borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>
        </div>}
        {getItems().length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {getItems().slice(0, 4).map((item: any, i: number) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', textAlign: 'center' }}>
                {item.icon && <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{item.icon}</div>}
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title || item.name || item.value || item.label}</div>
                {item.description && <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>{item.description}</div>}
              </div>
            ))}
          </div>
        )}
        {content.images?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
            {content.images.slice(0, 3).map((img: any, i: number) => (
              <div key={i} style={{ aspectRatio: '1', background: 'rgba(0,0,0,0.08)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {img.url && <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Wirklich leer
  return (
    <div style={{ ...innerWidth, textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.25)', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '0.75rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>Elemente hinzufügen</p>
    </div>
  );
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
function ContentEditor({ section, onChange, availableForms, availableBookingServices, externalSelectedBlockId, onPickMedia }: {
  section: Section;
  onChange: (c: SectionContent) => void;
  availableForms: { id: string; name: string; slug: string }[];
  availableBookingServices: { id: string; name: string; duration: number; price: number }[];
  externalSelectedBlockId?: string | null;
  onPickMedia?: (cb: (url: string) => void) => void;
}) {
  const hasBlocks = Array.isArray(section.content.blocks) && section.content.blocks.length > 0;
  const hasOldContent = !hasBlocks && (
    section.content.heading || section.content.title ||
    section.content.items || section.content.text || section.content.images
  );

  if (hasOldContent) {
    const migrateContent = () => {
      const blocks: any[] = [];
      let order = 0;
      const g = generateBlockId;
      if (section.content.heading || section.content.title) {
        blocks.push({ id: g(), type: 'heading', text: section.content.heading || section.content.title, level: 'h2', align: 'center', order: order++ });
      }
      if (section.content.subheading) {
        blocks.push({ id: g(), type: 'text', html: `<p>${section.content.subheading}</p>`, align: 'center', order: order++ });
      }
      if (section.content.text) {
        blocks.push({ id: g(), type: 'text', html: section.content.text, align: 'left', order: order++ });
      }
      if (section.content.items?.length) {
        const type = section.type === 'stats' ? 'stat-grid'
          : section.type === 'testimonials' ? 'testimonial-grid'
          : section.type === 'team' ? 'team-grid'
          : section.type === 'pricing' ? 'pricing-grid'
          : section.type === 'faq' ? 'faq-list'
          : 'feature-grid';
        if (type === 'faq-list') {
          blocks.push({ id: g(), type, items: (section.content.items || []).map((i: any) => ({ question: i.title || i.question || '', answer: i.description || i.answer || '' })), order: order++ });
        } else if (type === 'stat-grid') {
          blocks.push({ id: g(), type, columns: 4, items: (section.content.items || []).map((i: any) => ({ value: i.value || '', label: i.title || i.label || '', description: i.description || '' })), order: order++ });
        } else if (type === 'testimonial-grid') {
          blocks.push({ id: g(), type, columns: 2, items: (section.content.items || []).map((i: any) => ({ name: i.title || i.name || '', role: i.subtitle || i.role || '', text: i.description || i.text || '', image: i.image || '' })), order: order++ });
        } else if (type === 'team-grid') {
          blocks.push({ id: g(), type, columns: 3, items: (section.content.items || []).map((i: any) => ({ name: i.title || i.name || '', role: i.subtitle || i.role || '', bio: i.description || i.bio || '', image: i.image || '' })), order: order++ });
        } else {
          blocks.push({ id: g(), type, columns: 3, items: section.content.items, order: order++ });
        }
      }
      if (section.content.images?.length) {
        blocks.push({ id: g(), type: 'image-grid', columns: 3, images: section.content.images, order: order++ });
      }
      if (section.content.links?.length) {
        blocks.push({ id: g(), type: 'social-links', links: section.content.links, order: order++ });
      }
      if (section.content.buttonText) {
        blocks.push({ id: g(), type: 'button', text: section.content.buttonText, link: section.content.buttonLink || '#', style: 'primary', align: 'center', order: order++ });
      }
      onChange({ blocks });
    };

    return (
      <div>
        <div style={{ background: 'rgba(240,136,62,0.1)', border: '1px solid rgba(240,136,62,0.4)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
          <p style={{ fontSize: '0.75rem', color: '#f0883e', fontWeight: 600, margin: '0 0 4px' }}>⚠ Alte Section</p>
          <p style={{ fontSize: '0.7rem', color: '#8b949e', margin: '0 0 10px', lineHeight: 1.5 }}>
            Diese Section wurde vor dem Update erstellt. Bitte konvertieren um den Editor zu nutzen.
          </p>
          <button
            onClick={migrateContent}
            style={{ width: '100%', padding: '8px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginBottom: 6 }}
          >
            ✨ Inhalt übernehmen + konvertieren
          </button>
          <button
            onClick={() => { const d = DEFAULT_CONTENT[section.type]; if (d) onChange(d); }}
            style={{ width: '100%', padding: '8px', background: '#f0883e', border: 'none', borderRadius: 6, color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            🔄 Mit Default-Inhalt neu starten
          </button>
        </div>
      </div>
    );
  }

return <FreestyleEditor 
  content={section.content} 
  onChange={onChange} 
  externalSelectedBlockId={externalSelectedBlockId} 
  onPickMedia={onPickMedia}
  availableForms={availableForms}
  availableBookingServices={availableBookingServices}
/>;
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
            {/* Im Buttons TAB nach "Stil Presets": */}
<span style={sLbl}>Quick-Presets</span>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 14 }}>
  {BUTTON_PRESETS.map(p => (
    <button key={p.label}
      onClick={() => setButtonConfig({ style: p.style as any, radius: p.radius, size: p.size as any })}
      style={{ padding: '6px 4px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
        background: '#0d1117', border: '1px solid #30363d', color: '#8b949e' }}>
      {p.label}
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
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
      if (e.key === 'Escape') { setSelectedId(null); setSelectedBlockId(null); }

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
// eslint-disable-next-line react-hooks/exhaustive-deps
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
const handleCanvasBlockUpdate = (sectionId: string, blockId: string, updates: any) => {
  if (updates._action === 'delete') {
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, content: { ...s.content, blocks: (s.content.blocks || []).filter((b: any) => b.id !== blockId) } }
      : s
    ));
  } else if (updates._action === 'duplicate') {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      const blocks = [...(s.content.blocks || [])];
      const idx = blocks.findIndex((b: any) => b.id === blockId);
      if (idx === -1) return s;
      const copy = { ...blocks[idx], id: generateBlockId(), order: blocks[idx].order + 0.5 };
      blocks.splice(idx + 1, 0, copy);
      return { ...s, content: { ...s.content, blocks: blocks.map((b, i) => ({ ...b, order: i })) } };
    }));
  } else {
    setSections(prev => prev.map(s => s.id === sectionId
      ? { ...s, content: { ...s.content, blocks: (s.content.blocks || []).map((b: any) => b.id === blockId ? { ...b, ...updates } : b) } }
      : s
    ));
  }
  setIsDirty(true);
  };
  
  const handleCanvasAddBlock = (sectionId: string, blockType: string) => {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return;
  const blocks = section.content.blocks || [];
  const newBlock = {
    id: generateBlockId(),
    type: blockType,
    order: blocks.length,
    ...DEFAULT_BLOCK[blockType],
  };
  setSections(prev => prev.map(s => s.id === sectionId
    ? { ...s, content: { ...s.content, blocks: [...blocks, newBlock] } }
    : s
  ));
  setSelectedId(sectionId);
  setSelectedBlockId(newBlock.id);
  setRightTab('content');
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
                  <CanvasSectionPreview
  section={section}
  isSelected={selectedId === section.id}
  onClick={() => {
    setSelectedId(section.id);
    setSelectedNavId(null);
    setSelectedBlockId(null);
    setRightTab('content');
  }}
  settings={templateSettings}
  deviceMode={deviceMode}
  selectedBlockId={selectedId === section.id ? selectedBlockId : null}
  onBlockClick={(blockId) => {
    setSelectedId(section.id);
    setSelectedNavId(null);
    setSelectedBlockId(blockId);
    setRightTab('content');
  }}
     onBlockUpdate={handleCanvasBlockUpdate}
     onAddBlock={handleCanvasAddBlock} 
/>
                    
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
                   {rightTab === 'content' && (
  <ContentEditor
    section={selectedSection}
    onChange={handleContentChange}
    availableForms={availableForms}
    availableBookingServices={availableBookingServices}
    externalSelectedBlockId={selectedBlockId}
    onPickMedia={(cb) => setMediaPicker({ onSelect: cb })}
  />
)}
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