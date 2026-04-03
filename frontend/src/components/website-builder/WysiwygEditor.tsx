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
  // Custom CSS
  customCss?: string;
  // Mobile-spezifisch
  mobile?: MobileOverrides;
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
    ],
  },
];

const DEFAULT_CONTENT: Record<string, SectionContent> = {
  hero:         { heading: 'Deine Überschrift hier', subheading: 'Eine überzeugende Unterüberschrift', buttonText: 'Jetzt starten', buttonLink: '#' },
  cta:          { heading: 'Bereit loszulegen?', subheading: 'Starte noch heute kostenlos.', buttonText: 'Jetzt starten', buttonLink: '#' },
  text:         { heading: 'Überschrift', text: '<p>Dein Text hier.</p>' },
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
  newsletter:   { heading: 'Newsletter abonnieren', text: 'Erhalte die neuesten Updates direkt in dein Postfach.', buttonText: 'Abonnieren', placeholder: 'deine@email.de' },
  booking:      { heading: 'Termin buchen', text: 'Buche jetzt deinen Wunschtermin.', buttonText: 'Termin buchen', buttonLink: '/booking' },
  social:       { heading: 'Folge uns', links: [{ platform: 'Instagram', url: 'https://instagram.com/', icon: '📷' }, { platform: 'Facebook', url: 'https://facebook.com/', icon: '👍' }, { platform: 'LinkedIn', url: 'https://linkedin.com/', icon: '💼' }] },
  map:          { heading: 'So findest du uns', address: 'Musterstraße 1, 12345 Musterstadt', embedUrl: '' },
  countdown:    { heading: 'Nur noch bis...', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], text: 'Verpasse nicht unser Angebot!' },
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

// ==================== CANVAS SECTION PREVIEW ====================

function CanvasSectionPreview({ section, isSelected, onClick, settings, deviceMode }: {
  section: Section; isSelected: boolean; onClick: () => void;
  settings: TemplateSettings; deviceMode: 'desktop' | 'tablet' | 'mobile';
}) {
  const { type, content, styling } = section;
  const primary = settings?.colors?.primary || '#3b82f6';
  const isMobile = deviceMode !== 'desktop';
  const mob = styling?.mobile || {};

  const headingSize = (isMobile && mob.headingSize) ? mob.headingSize : (styling?.headingSize || 'clamp(1.75rem, 4vw, 3rem)');
  const wrapStyle: React.CSSProperties = {
    ...getSectionStyle(styling, deviceMode),
    position: 'relative',
    cursor: 'pointer',
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
    const getItems = (): any[] => content.items || content.plans || content.members || content.testimonials || content.faqs || content.stats || [];

    switch (type) {
      case 'hero':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            <h1 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 800, margin: '0 0 1rem', lineHeight: 1.2 }}>{content.heading || 'Hero Überschrift'}</h1>
            {content.subheading && <p style={{ fontSize: styling?.bodySize || '1.2rem', marginBottom: '1.5rem', opacity: 0.85 }}>{content.subheading}</p>}
            {content.buttonText && <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: primary, color: '#fff', borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>}
          </div>
        );
      case 'cta':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, margin: '0 0 0.75rem' }}>{h || 'Call to Action'}</h2>
            {content.subheading && <p style={{ marginBottom: '1.25rem', opacity: 0.85 }}>{content.subheading}</p>}
            {content.buttonText && <span style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#ffffff', color: '#0f172a', borderRadius: '0.5rem', fontWeight: 600 }}>{content.buttonText}</span>}
          </div>
        );
      case 'features': case 'services':
        return (
          <div style={innerWidth}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 2rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {(content.items || []).slice(0, 3).map((item: any, i: number) => (
                <div key={i} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  {item.icon && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>}
                  <h3 style={{ fontWeight: 600, margin: '0 0 0.25rem', fontSize: styling?.bodySize || 'inherit' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{item.description}</p>
                  {item.price && <p style={{ fontWeight: 700, color: primary, margin: '0.5rem 0 0' }}>{item.price}</p>}
                </div>
              ))}
            </div>
          </div>
        );
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
              <div style={{ background: primary, color: '#fff', borderRadius: '0.5rem', padding: '0.75rem', fontWeight: 600 }}>{content.buttonText || 'Absenden'}</div>
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
            {h && <h2 style={{ fontSize: headingSize, fontWeight: styling?.fontWeight || 700, textAlign: 'center', margin: '0 0 1.5rem' }}>{h}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {(content.images?.length > 0 ? content.images.slice(0, 6) : Array(3).fill(null)).map((img: any, i: number) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '2rem' }}>
                  {img?.url ? <img src={img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🖼️'}
                </div>
              ))}
            </div>
          </div>
        );
      case 'video':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 1.5rem' }}>{h}</h2>}
            <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '0.75rem', aspectRatio: '16/9', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.35)', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem' }}>{content.videoUrl ? '▶️' : '📹'}</span>
              {!content.videoUrl && <span style={{ fontSize: '0.85rem' }}>Video URL eingeben</span>}
            </div>
          </div>
        );
      case 'newsletter':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 0.75rem' }}>{h}</h2>}
            {content.text && <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{content.text}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.06)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>{content.placeholder || 'deine@email.de'}</div>
              <div style={{ background: primary, color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{content.buttonText || 'Abonnieren'}</div>
            </div>
          </div>
        );
      case 'booking':
        return (
          <div style={{ ...innerWidth, textAlign: 'center' }}>
            {h && <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: '0 0 0.75rem' }}>{h}</h2>}
            {content.text && <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{content.text}</p>}
            <span style={{ display: 'inline-block', background: primary, color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 2rem', fontWeight: 600 }}>{content.buttonText || 'Jetzt buchen'}</span>
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
        return <div style={innerWidth} dangerouslySetInnerHTML={{ __html: content.html || '<p style="opacity:0.5">HTML Bereich</p>' }} />;
      default:
        return <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.875rem' }}>[{type.toUpperCase()}] {section.name}</div>;
    }
  };

  return (
    <div style={wrapStyle} onClick={onClick}>
      {/* Injiziere Custom CSS der Section */}
      {styling?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: `/* Section ${section.id} */ ${styling.customCss}` }} />
      )}
      {isSelected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#58a6ff', color: '#fff', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', zIndex: 10, textTransform: 'uppercase' }}>
          ● {section.name}
        </div>
      )}
      {renderContent()}
    </div>
  );
}

// ==================== CONTENT EDITOR ====================

function ContentEditor({ section, onChange }: { section: Section; onChange: (c: SectionContent) => void }) {
  const { type, content } = section;
  const update = (key: string, val: any) => onChange({ ...content, [key]: val });

  const inputStyle: React.CSSProperties = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '8px 10px', fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' };
  const taStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: 4, fontWeight: 600, letterSpacing: '0.03em' };
  const wrapStyle: React.CSSProperties = { marginBottom: '1rem' };

  const Field = ({ label, field, multi = false, rows = 3 }: { label: string; field: string; multi?: boolean; rows?: number }) => (
    <div style={wrapStyle}>
      <label style={labelStyle}>{label}</label>
      {multi
        ? <textarea value={content[field] || ''} onChange={e => update(field, e.target.value)} rows={rows} style={taStyle} />
        : <input type="text" value={content[field] || ''} onChange={e => update(field, e.target.value)} style={inputStyle} />
      }
    </div>
  );

  const ListEditor = ({ field, schema }: { field: string; schema: { key: string; label: string }[] }) => {
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
  };

switch (type) {
    case 'hero': case 'cta':
      return (<><Field label="Überschrift" field="heading" /><Field label="Unterüberschrift" field="subheading" multi rows={3} /><Field label="Button Text" field="buttonText" /><Field label="Button Link" field="buttonLink" /></>);
    case 'text': case 'about':
      return (<><Field label="Überschrift" field="heading" /><Field label="Text (HTML erlaubt)" field="text" multi rows={6} /></>);
    case 'features': case 'services':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'icon', label: 'Icon (Emoji)' }, { key: 'title', label: 'Titel' }, { key: 'description', label: 'Beschreibung' }, ...(type === 'services' ? [{ key: 'price', label: 'Preis' }] : [])]} /></>);
    case 'stats':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'value', label: 'Wert' }, { key: 'title', label: 'Bezeichnung' }, { key: 'description', label: 'Beschreibung' }]} /></>);
    case 'testimonials':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'title', label: 'Name' }, { key: 'subtitle', label: 'Rolle' }, { key: 'description', label: 'Bewertungstext' }]} /></>);
    case 'team':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'title', label: 'Name' }, { key: 'subtitle', label: 'Position' }, { key: 'description', label: 'Bio' }, { key: 'image', label: 'Bild URL' }]} /></>);
    case 'pricing':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'title', label: 'Paket-Name' }, { key: 'price', label: 'Preis' }, { key: 'interval', label: 'Intervall' }, { key: 'buttonText', label: 'Button Text' }]} /></>);
    case 'gallery':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="images" schema={[{ key: 'url', label: 'Bild URL' }, { key: 'alt', label: 'Alt-Text' }]} /></>);
    case 'faq':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="items" schema={[{ key: 'title', label: 'Frage' }, { key: 'description', label: 'Antwort' }]} /></>);
    case 'video':
      return (<><Field label="Überschrift" field="heading" /><Field label="Video URL (YouTube/Vimeo)" field="videoUrl" /><Field label="Poster Bild URL" field="videoPoster" /></>);
    case 'newsletter':
      return (<><Field label="Überschrift" field="heading" /><Field label="Beschreibung" field="text" multi rows={3} /><Field label="Button Text" field="buttonText" /><Field label="Placeholder (E-Mail)" field="placeholder" /></>);
    case 'booking':
      return (<><Field label="Überschrift" field="heading" /><Field label="Beschreibung" field="text" multi rows={3} /><Field label="Button Text" field="buttonText" /><Field label="Button Link" field="buttonLink" /></>);
    case 'map':
      return (<><Field label="Überschrift" field="heading" /><Field label="Adresse" field="address" /><Field label="Google Maps Embed URL" field="embedUrl" /></>);
    case 'countdown':
      return (<><Field label="Überschrift" field="heading" /><Field label="Zieldatum (YYYY-MM-DD)" field="targetDate" /><Field label="Beschreibung" field="text" /></>);
    case 'social':
      return (<><Field label="Überschrift" field="heading" /><ListEditor field="links" schema={[{ key: 'platform', label: 'Plattform' }, { key: 'url', label: 'URL' }, { key: 'icon', label: 'Icon (Emoji)' }]} /></>);
    case 'blog':
      return (
        <>
          <Field label="Überschrift" field="heading" />
          <div style={wrapStyle}>
            <label style={labelStyle}>Anzahl Posts</label>
            <select value={content.count || 3} onChange={e => update('count', Number(e.target.value))} style={{ ...inputStyle, width: '100%' }}>
              {[3, 6, 9].map(n => <option key={n} value={n}>{n} Posts</option>)}
            </select>
          </div>
        </>
      );
    case 'html':
      return (
        <div style={wrapStyle}>
          <label style={labelStyle}>HTML Code</label>
          <textarea value={content.html || ''} onChange={e => update('html', e.target.value)} rows={14} spellCheck={false}
            style={{ ...taStyle, fontFamily: '"SF Mono", monospace', fontSize: '0.73rem', color: '#79c0ff' }} />
        </div>
      );
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
  return (
    <div onClick={onClick} style={{
      background: isFooter ? '#1f2937' : '#ffffff',
      color: isFooter ? '#f9fafb' : '#1f2937',
      borderTop: isFooter ? '1px solid #374151' : 'none',
      borderBottom: isFooter ? 'none' : '1px solid #e5e7eb',
      padding: '0 1.5rem', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', position: 'relative',
      outline: isSelected ? '2px solid #58a6ff' : 'none',
      outlineOffset: '-2px', opacity: nav.isActive ? 1 : 0.4,
    }}>
      {isSelected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#58a6ff', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', zIndex: 10, textTransform: 'uppercase' }}>
          🧭 {nav.name}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>S</div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Site</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {items.slice(0, 5).map(item => (
          <span key={item.id} style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.8 }}>{item.label}</span>
        ))}
        {items.length === 0 && <span style={{ fontSize: '0.75rem', opacity: 0.4, fontStyle: 'italic' }}>Keine Items — klicken zum Bearbeiten</span>}
      </div>
    </div>
  );
}
function NavEditorPanel({ nav, onRefresh, createNavItem, updateNavItem, deleteNavItem }: {
  nav: NavData; onRefresh: () => void;
  createNavItem: any; updateNavItem: any; deleteNavItem: any;
}) {
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [form, setForm] = useState({ label: '', type: 'custom', url: '', openInNewTab: false });

  const inp: React.CSSProperties = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '7px 10px', fontSize: '0.78rem', boxSizing: 'border-box', outline: 'none' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.68rem', color: '#8b949e', marginBottom: 4, fontWeight: 600 };

  const items = (nav.items || []).filter(i => !i.parentId).sort((a, b) => a.order - b.order);

  const startEdit = (item: NavItem) => {
    setEditingItem(item);
    setForm({ label: item.label, type: item.type, url: item.url || '', openInNewTab: item.openInNewTab });
    setAddingItem(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) return;
    if (editingItem) {
      await updateNavItem({ variables: { itemId: editingItem.id, input: { label: form.label, type: form.type, url: form.url, openInNewTab: form.openInNewTab } } });
    } else {
      await createNavItem({ variables: { navigationId: nav.id, input: { label: form.label, type: form.type, url: form.url, openInNewTab: form.openInNewTab, order: items.length } } });
    }
    setAddingItem(false);
    setEditingItem(null);
    setForm({ label: '', type: 'custom', url: '', openInNewTab: false });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteNavItem({ variables: { itemId: id } });
    onRefresh();
  };

  return (
    <div>
      {/* Nav Info */}
      <div style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
        <p style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600, margin: 0 }}>
          🧭 {nav.name} — {nav.location === 'header' ? 'Header' : nav.location === 'footer' ? 'Footer' : nav.location}
        </p>
      </div>

      {/* Items Liste */}
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

      {/* Add/Edit Form */}
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
            <button onClick={handleSave} style={{ flex: 1, background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
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
  );
}

export function WysiwygEditor({ pageId, templateId }: WysiwygEditorProps) {
  const { tenant } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [leftPanel, setLeftPanel] = useState<'blocks' | 'layers'>('blocks');
  const [rightTab, setRightTab] = useState<'content' | 'style' | 'layout' | 'css'>('content');
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
  const [selectedNavId, setSelectedNavId] = useState<string | null>(null);
const [navigations, setNavigations] = useState<NavData[]>([]);
const { refetch: refetchNavs } = useQuery(GET_NAVIGATIONS, {
  onCompleted: (data) => { if (data?.navigations) setNavigations(data.navigations); },
});
const [createNavItemMut] = useMutation(CREATE_NAV_ITEM);
const [updateNavItemMut] = useMutation(UPDATE_NAV_ITEM);
  const [deleteNavItemMut] = useMutation(DELETE_NAV_ITEM);
  const [updateNavigationMut] = useMutation(UPDATE_NAVIGATION);


  const dragItemIdx = useRef<number | null>(null);

  const selectedSection = sections.find(s => s.id === selectedId) || null;

  const { loading } = useQuery(GET_PAGE_WITH_SECTIONS, {
    variables: { id: pageId, tenantId: tenant?.id },
    skip: !tenant?.id || !pageId,
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
            pageId,
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
    await reorderMut({ variables: { pageId, sectionIds: ns.map(s => s.id), tenantId: tenant?.id } }).catch(console.error);
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
          pageId,
          name: `${section.name} (Kopie)`,
          type: section.type,
          order: section.order + 1,
          isActive: section.isActive,
          content: section.content,
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
    await reorderMut({ variables: { pageId, sectionIds: ns.map(s => s.id), tenantId: tenant?.id } }).catch(console.error);
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
        <div style={{ width: 1, height: 20, background: C.border }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageName || 'WYSIWYG Editor'}</span>
          {isDirty && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f0883e', flexShrink: 0 }} title="Ungespeicherte Änderungen" />}
        </div>

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
        <div style={{ width: 256, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
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
              ))
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
           
             <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
  <div style={{
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
          )}
        </div>

        
        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ width: 300, background: C.panel, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
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
                ].map(tab => (
                  <button key={tab.id} onClick={() => setRightTab(tab.id as any)} title={tab.title}
                    style={{ flex: 1, padding: '9px 4px', background: rightTab === tab.id ? '#0d1117' : 'transparent', border: 'none', borderBottom: `2px solid ${rightTab === tab.id ? C.accent : 'transparent'}`, cursor: 'pointer', color: rightTab === tab.id ? C.accent : C.muted, fontSize: rightTab === tab.id ? '0.75rem' : '0.85rem', fontWeight: 600 }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Panel */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                {rightTab === 'content' && <ContentEditor section={selectedSection} onChange={handleContentChange} />}
                {rightTab === 'style' && <StylePanel section={selectedSection} onChange={handleStylingChange} onPickMedia={(cb) => setMediaPicker({ onSelect: cb })} />}
                {rightTab === 'layout' && <LayoutPanel section={selectedSection} onChange={handleStylingChange} deviceMode={deviceMode} />}
                {rightTab === 'css' && <CssPanel section={selectedSection} onChange={handleStylingChange} />}
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
      {showNavEditor && <NavigationEditor onClose={() => setShowNavEditor(false)} />}
    </div>
  );
}