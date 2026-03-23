// 📂 PFAD: frontend/src/components/website-builder/SectionLibrary.tsx

'use client';

import { useState } from 'react';
import { SectionType, CreateSectionDto, Section } from '@/types/website-builder.types';

interface SectionLibraryProps {
  pageId: string;
  onCreateSection: (data: CreateSectionDto) => Promise<Section>;
  onClose?: () => void;
  mode?: 'modal' | 'sidebar';
}

interface SectionTemplate {
  type: SectionType;
  name: string;
  icon: string;
  description: string;
  category: 'content' | 'marketing' | 'media' | 'advanced';
  preview?: string;
  defaultContent: Record<string, unknown>;
}

const SECTION_TEMPLATES: SectionTemplate[] = [
  // Content
  {
    type: SectionType.HERO,
    name: 'Hero',
    icon: '🎯',
    description: 'Großer Header-Bereich mit Bild, Text und CTA Button',
    category: 'content',
    defaultContent: {
      heading: 'Willkommen',
      subheading: 'Ihr Untertitel hier',
      buttonText: 'Mehr erfahren',
      buttonLink: '#',
    },
  },
  {
    type: SectionType.ABOUT,
    name: 'Über uns',
    icon: '📖',
    description: 'Stellen Sie Ihr Unternehmen oder Team vor',
    category: 'content',
    defaultContent: {
      title: 'Über uns',
      description: 'Erzählen Sie Ihre Geschichte hier...',
    },
  },
  {
    type: SectionType.TEXT,
    name: 'Textblock',
    icon: '📝',
    description: 'Einfacher Textbereich für beliebigen Content',
    category: 'content',
    defaultContent: {
      title: 'Titel',
      text: 'Ihr Text hier...',
    },
  },
  {
    type: SectionType.FAQ,
    name: 'FAQ',
    icon: '❓',
    description: 'Häufig gestellte Fragen mit Antworten',
    category: 'content',
    defaultContent: {
      title: 'Häufige Fragen',
      faqs: [
        { id: '1', question: 'Beispielfrage?', answer: 'Beispielantwort.' },
      ],
    },
  },

  // Marketing
  {
    type: SectionType.FEATURES,
    name: 'Features',
    icon: '⭐',
    description: 'Feature-Grid mit Icons und Beschreibungen',
    category: 'marketing',
    defaultContent: {
      title: 'Unsere Features',
      items: [
        { id: '1', title: 'Schnell', description: 'Blitzschnelle Performance', icon: '⚡' },
        { id: '2', title: 'Sicher', description: 'Enterprise-grade Security', icon: '🔒' },
        { id: '3', title: 'Einfach', description: 'Intuitives Interface', icon: '✨' },
      ],
    },
  },
  {
    type: SectionType.SERVICES,
    name: 'Services',
    icon: '🛠️',
    description: 'Dienstleistungen oder Angebote darstellen',
    category: 'marketing',
    defaultContent: {
      title: 'Unsere Services',
      items: [],
    },
  },
  {
    type: SectionType.CTA,
    name: 'Call to Action',
    icon: '🎪',
    description: 'Aufforderung zum Handeln mit Button',
    category: 'marketing',
    defaultContent: {
      heading: 'Bereit loszulegen?',
      subheading: 'Starten Sie jetzt Ihre Reise mit uns.',
      buttonText: 'Jetzt starten',
      buttonLink: '#',
    },
  },
  {
    type: SectionType.PRICING,
    name: 'Preise',
    icon: '💰',
    description: 'Preispläne und Pakete vergleichen',
    category: 'marketing',
    defaultContent: {
      title: 'Unsere Preise',
      plans: [],
    },
  },
  {
    type: SectionType.TESTIMONIALS,
    name: 'Testimonials',
    icon: '💬',
    description: 'Kundenbewertungen und Erfahrungsberichte',
    category: 'marketing',
    defaultContent: {
      title: 'Was Kunden sagen',
      testimonials: [],
    },
  },
  {
    type: SectionType.CONTACT,
    name: 'Kontakt',
    icon: '📧',
    description: 'Kontaktformular mit Informationen',
    category: 'marketing',
    defaultContent: {
      title: 'Kontaktiere uns',
    },
  },
  {
    type: SectionType.STATS,
    name: 'Statistiken',
    icon: '📊',
    description: 'Zahlen und Fakten ansprechend darstellen',
    category: 'marketing',
    defaultContent: {
      title: 'In Zahlen',
      stats: [
        { id: '1', value: '100+', label: 'Kunden' },
        { id: '2', value: '50K', label: 'Nutzer' },
        { id: '3', value: '99%', label: 'Zufriedenheit' },
      ],
    },
  },

  // Media
  {
    type: SectionType.GALLERY,
    name: 'Galerie',
    icon: '🖼️',
    description: 'Bilder-Galerie im Grid-Layout',
    category: 'media',
    defaultContent: {
      title: 'Galerie',
      images: [],
    },
  },
  {
    type: SectionType.VIDEO,
    name: 'Video',
    icon: '🎬',
    description: 'YouTube oder Vimeo Video einbetten',
    category: 'media',
    defaultContent: {
      title: 'Video',
      videoUrl: '',
    },
  },
  {
    type: SectionType.TEAM,
    name: 'Team',
    icon: '👥',
    description: 'Team-Mitglieder mit Fotos und Rollen',
    category: 'media',
    defaultContent: {
      title: 'Unser Team',
      members: [],
    },
  },
  {
    type: SectionType.BLOG,
    name: 'Blog Feed',
    icon: '📰',
    description: 'Automatisch letzte Blog-Posts anzeigen',
    category: 'media',
    defaultContent: {
      title: 'Neueste Beiträge',
    },
  },

  // Advanced
  {
    type: SectionType.HTML,
    name: 'Custom HTML',
    icon: '🧩',
    description: 'Eigenen HTML-Code einbetten',
    category: 'advanced',
    defaultContent: {
      html: '<div style="padding: 40px; text-align: center;"><p>Ihr HTML hier</p></div>',
    },
  },
  {
    type: SectionType.CUSTOM,
    name: 'Custom Section',
    icon: '⚙️',
    description: 'Benutzerdefinierte Section mit JSON-Konfiguration',
    category: 'advanced',
    defaultContent: {
      title: 'Custom Section',
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Alle', icon: '📦' },
  { id: 'content', label: 'Content', icon: '📝' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'media', label: 'Media', icon: '🖼️' },
  { id: 'advanced', label: 'Advanced', icon: '🧩' },
];

export function SectionLibrary({
  pageId,
  onCreateSection,
  onClose,
  mode = 'modal',
}: SectionLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const filtered = SECTION_TEMPLATES.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (template: SectionTemplate) => {
    setIsCreating(template.type);
    try {
      await onCreateSection({
        pageId,
        name: template.name,
        type: template.type,
        content: template.defaultContent as any,
        isActive: true,
      });
      onClose?.();
    } catch (error) {
      alert('Fehler beim Erstellen der Section');
    } finally {
      setIsCreating(null);
    }
  };

  const content = (
    <div className={mode === 'sidebar' ? 'h-full flex flex-col' : ''}>
      {/* Header */}
      <div className={`${mode === 'modal' ? 'mb-6' : 'p-4 border-b border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Section hinzufügen</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Section suchen..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-3"
        />

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={`${mode === 'sidebar' ? 'flex-1 overflow-y-auto p-4' : ''}`}>
        <div className={`grid ${mode === 'modal' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-3`}>
          {filtered.map((template) => (
            <button
              key={template.type}
              onClick={() => handleCreate(template)}
              disabled={isCreating !== null}
              className={`text-left p-4 border-2 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 ${
                isCreating === template.type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 bg-white dark:bg-gray-800'
              } disabled:opacity-60 disabled:cursor-wait`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{template.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
              {isCreating === template.type && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">Wird erstellt...</div>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>Keine Sections gefunden für &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}