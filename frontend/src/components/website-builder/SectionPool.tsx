// 📂 PFAD: frontend/src/components/website-builder/SectionPool.tsx
// Ersetzt den alten AddSectionModal in SectionsList.tsx

'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';

// ==================== TYPES ====================

interface SectionPoolProps {
  pageId: string;
  tenantId: string;
  onCreated?: () => void;
  onClose?: () => void;
  mode?: 'modal' | 'sidebar';
}

interface SectionTemplate {
  type: string;
  name: string;
  icon: string;
  description: string;
  category: 'content' | 'marketing' | 'media' | 'advanced';
  defaultContent: Record<string, unknown>;
}

// ==================== GRAPHQL ====================

const CREATE_SECTION = gql`
  mutation CreateSection($tenantId: String!, $input: CreateSectionInput!) {
    createSection(tenantId: $tenantId, input: $input) {
      id
      name
      type
      order
      isActive
    }
  }
`;

// ==================== SECTION TEMPLATES ====================

const SECTION_TEMPLATES: SectionTemplate[] = [
  // Content
  {
    type: 'hero',
    name: 'Hero',
    icon: '🎯',
    description: 'Großer Header mit Titel, Untertitel und CTA Button',
    category: 'content',
    defaultContent: {
      heading: 'Willkommen',
      subheading: 'Ihre professionelle Online-Präsenz',
      buttonText: 'Mehr erfahren',
      buttonLink: '#',
    },
  },
  {
    type: 'about',
    name: 'Über uns',
    icon: '📖',
    description: 'Stellen Sie Ihr Unternehmen oder Projekt vor',
    category: 'content',
    defaultContent: {
      heading: 'Über uns',
      text: '<p>Erzählen Sie hier Ihre Geschichte...</p>',
    },
  },
  {
    type: 'text',
    name: 'Textblock',
    icon: '📝',
    description: 'Freier Textbereich mit Rich-Text Formatierung',
    category: 'content',
    defaultContent: {
      heading: 'Titel',
      text: '<p>Ihr Text hier...</p>',
    },
  },
  {
    type: 'faq',
    name: 'FAQ',
    icon: '❓',
    description: 'Häufig gestellte Fragen mit aufklappbaren Antworten',
    category: 'content',
    defaultContent: {
      heading: 'Häufige Fragen',
      items: [
        { title: 'Was bieten Sie an?', description: 'Wir bieten professionelle Lösungen für...' },
        { title: 'Wie kann ich Sie kontaktieren?', description: 'Sie erreichen uns per Email oder Telefon.' },
        { title: 'Was kostet es?', description: 'Unsere Preise finden Sie auf der Preise-Seite.' },
      ],
    },
  },

  // Marketing
  {
    type: 'features',
    name: 'Features',
    icon: '⭐',
    description: 'Feature-Grid mit Icons und Beschreibungen',
    category: 'marketing',
    defaultContent: {
      heading: 'Unsere Vorteile',
      items: [
        { icon: '⚡', title: 'Schnell', description: 'Blitzschnelle Performance' },
        { icon: '🔒', title: 'Sicher', description: 'Höchste Sicherheitsstandards' },
        { icon: '✨', title: 'Premium', description: 'Erstklassige Qualität' },
      ],
    },
  },
  {
    type: 'services',
    name: 'Services',
    icon: '🛠️',
    description: 'Dienstleistungen mit Preisen und Details',
    category: 'marketing',
    defaultContent: {
      heading: 'Unsere Services',
      items: [
        { icon: '🎨', title: 'Webdesign', description: 'Modernes, responsives Design', price: 'Ab €499' },
        { icon: '💻', title: 'Entwicklung', description: 'Custom Softwarelösungen', price: 'Ab €999' },
        { icon: '📈', title: 'Marketing', description: 'Online Marketing & SEO', price: 'Ab €299' },
      ],
    },
  },
  {
    type: 'cta',
    name: 'Call to Action',
    icon: '🎪',
    description: 'Auffälliger Bereich mit Handlungsaufforderung',
    category: 'marketing',
    defaultContent: {
      heading: 'Bereit loszulegen?',
      text: 'Starten Sie jetzt Ihr Projekt mit uns.',
      buttonText: 'Jetzt starten',
      buttonLink: '#kontakt',
    },
  },
  {
    type: 'pricing',
    name: 'Preise',
    icon: '💰',
    description: 'Preispläne und Pakete im Vergleich',
    category: 'marketing',
    defaultContent: {
      heading: 'Unsere Preise',
      items: [
        { title: 'Starter', price: '€9/Monat', description: 'Perfekt zum Einstieg', features: ['5 Seiten', 'SSL Zertifikat', 'Email Support'], buttonText: 'Wählen' },
        { title: 'Business', price: '€29/Monat', description: 'Für wachsende Teams', features: ['Unbegrenzt Seiten', 'Shop', 'Priority Support'], buttonText: 'Wählen' },
        { title: 'Enterprise', price: '€99/Monat', description: 'Volle Power', features: ['Alles in Business', 'Custom Domain', '24/7 Support'], buttonText: 'Wählen' },
      ],
    },
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    icon: '💬',
    description: 'Kundenbewertungen und Erfahrungsberichte',
    category: 'marketing',
    defaultContent: {
      heading: 'Was Kunden sagen',
      items: [
        { title: 'Max Mustermann', subtitle: 'CEO, TechCorp', description: 'Absolut professioneller Service. Die Website wurde pünktlich und über unseren Erwartungen geliefert.' },
        { title: 'Anna Schmidt', subtitle: 'Designerin', description: 'Einfach zu bedienen und das Ergebnis sieht fantastisch aus. Klare Empfehlung!' },
      ],
    },
  },
  {
    type: 'contact',
    name: 'Kontakt',
    icon: '📧',
    description: 'Kontaktformular mit Email-Versand',
    category: 'marketing',
    defaultContent: {
      heading: 'Kontaktiere uns',
      subheading: 'Wir freuen uns auf Ihre Nachricht',
      buttonText: 'Nachricht senden',
    },
  },
  {
    type: 'newsletter',
    name: 'Newsletter',
    icon: '📬',
    description: 'Newsletter-Anmeldung mit Email-Feld',
    category: 'marketing',
    defaultContent: {
      heading: 'Newsletter abonnieren',
      text: 'Erhalte die neuesten Updates direkt in dein Postfach.',
      buttonText: 'Abonnieren',
    },
  },
  {
    type: 'stats',
    name: 'Statistiken',
    icon: '📊',
    description: 'Zahlen und Fakten ansprechend darstellen',
    category: 'marketing',
    defaultContent: {
      heading: 'In Zahlen',
      items: [
        { value: '500+', title: 'Kunden', description: 'Weltweit' },
        { value: '99%', title: 'Zufriedenheit', description: 'Bewertung' },
        { value: '24/7', title: 'Support', description: 'Erreichbar' },
        { value: '10+', title: 'Jahre', description: 'Erfahrung' },
      ],
    },
  },

  // Media
  {
    type: 'gallery',
    name: 'Galerie',
    icon: '🖼️',
    description: 'Bilder-Galerie im responsiven Grid',
    category: 'media',
    defaultContent: {
      heading: 'Galerie',
      images: [],
    },
  },
  {
    type: 'video',
    name: 'Video',
    icon: '🎬',
    description: 'YouTube oder Vimeo Video einbetten',
    category: 'media',
    defaultContent: {
      heading: 'Video',
      videoUrl: '',
    },
  },
  {
    type: 'team',
    name: 'Team',
    icon: '👥',
    description: 'Team-Mitglieder mit Fotos und Rollen',
    category: 'media',
    defaultContent: {
      heading: 'Unser Team',
      items: [
        { title: 'Max Mustermann', subtitle: 'CEO & Gründer', description: 'Visionär mit 10+ Jahren Erfahrung' },
        { title: 'Anna Schmidt', subtitle: 'Head of Design', description: 'Kreativkopf für alle visuellen Projekte' },
        { title: 'Tom Weber', subtitle: 'Lead Developer', description: 'Full-Stack Entwickler aus Leidenschaft' },
      ],
    },
  },
{
  type: 'freestyle',
  name: 'Freestyle Block',
  icon: '✦',
  description: 'Freie Element-Komposition — alles selbst anordnen',
  category: 'advanced',
  defaultContent: {
    blocks: [
      { id: 'b1', type: 'heading', text: 'Deine Überschrift', level: 'h2', align: 'center', order: 0 },
      { id: 'b2', type: 'text', html: '<p>Dein Text hier.</p>', align: 'center', order: 1 },
      { id: 'b3', type: 'button', text: 'Jetzt starten', link: '#', style: 'primary', align: 'center', order: 2 },
    ],
  },
},
  // Advanced
  {
    type: 'html',
    name: 'Custom HTML',
    icon: '🧩',
    description: 'Beliebigen HTML-Code einbetten (Maps, Widgets, etc.)',
    category: 'advanced',
    defaultContent: {
      html: '<div style="padding: 40px; text-align: center; background: #f3f4f6; border-radius: 12px;"><p style="font-size: 1.25rem;">Ihr HTML hier einfügen</p></div>',
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Alle', icon: '📦', count: SECTION_TEMPLATES.length },
  { id: 'content', label: 'Content', icon: '📝', count: SECTION_TEMPLATES.filter(t => t.category === 'content').length },
  { id: 'marketing', label: 'Marketing', icon: '📢', count: SECTION_TEMPLATES.filter(t => t.category === 'marketing').length },
  { id: 'media', label: 'Media', icon: '🖼️', count: SECTION_TEMPLATES.filter(t => t.category === 'media').length },
  { id: 'advanced', label: 'Advanced', icon: '🧩', count: SECTION_TEMPLATES.filter(t => t.category === 'advanced').length },
];

// ==================== COMPONENT ====================

export function SectionPool({
  pageId,
  tenantId,
  onCreated,
  onClose,
  mode = 'modal',
}: SectionPoolProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState<string | null>(null);

  const [createSection] = useMutation(CREATE_SECTION);

  // Filter
  const filtered = SECTION_TEMPLATES.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Create handler
  const handleCreate = async (template: SectionTemplate) => {
    setCreating(template.type);
    try {
      await createSection({
        variables: {
          tenantId,
          input: {
            pageId,
            name: template.name,
            type: template.type,
            content: template.defaultContent,
            isActive: true,
          },
        },
      });
      onCreated?.();
      onClose?.();
    } catch (error: any) {
      alert(`Fehler: ${error.message}`);
    } finally {
      setCreating(null);
    }
  };

  const content = (
    <div className={mode === 'sidebar' ? 'h-full flex flex-col' : ''}>
      {/* Header */}
      <div className={mode === 'modal' ? 'mb-6' : 'p-5 border-b border-gray-200 dark:border-gray-700'}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Section Pool</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} Sections verfügbar</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Section suchen..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section Grid */}
      <div className={mode === 'sidebar' ? 'flex-1 overflow-y-auto p-4' : ''}>
        <div className={`grid ${mode === 'modal' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-3`}>
          {filtered.map((template) => (
            <button
              key={template.type}
              onClick={() => handleCreate(template)}
              disabled={creating !== null}
              className={`group text-left rounded-xl border-2 transition-all duration-200 ${
                creating === template.type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.98]'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5'
              } disabled:opacity-50 disabled:cursor-wait`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {template.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Loading indicator */}
                {creating === template.type && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Wird erstellt...
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Keine Sections für &quot;{search}&quot; gefunden
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); }}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Modal wrapper
  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}