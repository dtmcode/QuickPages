/**
 * Sections List Component
 * Zeigt alle Sections einer Page mit Drag & Drop
 */

'use client';

import { useState } from 'react';
import { useSections } from '@/lib/hooks';
import { Page, Section, SectionType, CreateSectionDto } from '@/types/website-builder.types';

interface SectionsListProps {
  page: Page;
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
}

export function SectionsList({ page, selectedSection, onSelectSection }: SectionsListProps) {
  const {
    sections,
    createSection,
    updateSection,
    deleteSection,
    duplicateSection,
    toggleVisibility,
  } = useSections(page.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const handleDragStart = (section: Section) => {
    setDraggedSection(section);
  };

  const handleDragOver = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) return;

    // Hier würdest du die Reihenfolge aktualisieren
    // const newOrder = sections.map(...)
    // await pagesApi.reorderSections(page.id, newOrder)
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  const handleDuplicate = async (section: Section) => {
    try {
      const duplicated = await duplicateSection(section.id);
      onSelectSection(duplicated);
    } catch (error) {
      alert('Fehler beim Duplizieren');
    }
  };

  const handleDelete = async (section: Section) => {
    if (!confirm(`Section "${section.name}" wirklich löschen?`)) return;

    try {
      await deleteSection(section.id);
      if (selectedSection?.id === section.id) {
        onSelectSection(sections[0] || null);
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

  const handleToggleVisibility = async (section: Section) => {
    try {
      await toggleVisibility(section.id);
    } catch (error) {
      alert('Fehler beim Umschalten');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{page.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedSections.length} Sections
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Section
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedSections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mb-4">Noch keine Sections vorhanden</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Erste Section hinzufügen
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSections.map((section) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section)}
                onDragOver={(e) => handleDragOver(e, section)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectSection(section)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSection?.id === section.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${draggedSection?.id === section.id ? 'opacity-50' : ''} ${
                  !section.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move pt-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{section.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {section.type}
                      </span>
                      {!section.isActive && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Hidden
                        </span>
                      )}
                    </div>

                    {section.content.heading && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {section.content.heading}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(section);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={section.isActive ? 'Verbergen' : 'Anzeigen'}
                    >
                      {section.isActive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(section);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Duplizieren"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(section);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Löschen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          pageId={page.id}
          onClose={() => setShowAddModal(false)}
          onCreate={createSection}
          onSelect={onSelectSection}
        />
      )}
    </div>
  );
}

// ==================== ADD SECTION MODAL ====================

interface AddSectionModalProps {
  pageId: string;
  onClose: () => void;
  onCreate: (data: CreateSectionDto) => Promise<Section>;
  onSelect: (section: Section) => void;
}

const SECTION_TEMPLATES = [
  { type: SectionType.HERO, name: 'Hero', icon: '🎯', description: 'Großer Header mit Bild' },
  { type: SectionType.FEATURES, name: 'Features', icon: '⭐', description: 'Feature-Grid' },
  { type: SectionType.ABOUT, name: 'About', icon: '📖', description: 'Über uns Section' },
  { type: SectionType.SERVICES, name: 'Services', icon: '🛠️', description: 'Services-Grid' },
  { type: SectionType.GALLERY, name: 'Gallery', icon: '🖼️', description: 'Bilder-Galerie' },
  { type: SectionType.TESTIMONIALS, name: 'Testimonials', icon: '💬', description: 'Kundenmeinungen' },
  { type: SectionType.TEAM, name: 'Team', icon: '👥', description: 'Team-Mitglieder' },
  { type: SectionType.PRICING, name: 'Pricing', icon: '💰', description: 'Preispläne' },
  { type: SectionType.CTA, name: 'Call to Action', icon: '🎪', description: 'Handlungsaufforderung' },
  { type: SectionType.CONTACT, name: 'Contact', icon: '📧', description: 'Kontaktformular' },
  { type: SectionType.FAQ, name: 'FAQ', icon: '❓', description: 'Häufige Fragen' },
  { type: SectionType.TEXT, name: 'Text', icon: '📝', description: 'Textblock' },
];

function AddSectionModal({ pageId, onClose, onCreate, onSelect }: AddSectionModalProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectType = async (type: SectionType, name: string) => {
    setIsCreating(true);
    try {
      const newSection = await onCreate({
        pageId,
        name,
        type,
        content: getDefaultContent(type),
        isActive: true,
      });
      onSelect(newSection);
      onClose();
    } catch (error) {
      alert('Fehler beim Erstellen');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Section hinzufügen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SECTION_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => handleSelectType(template.type, template.name)}
              disabled={isCreating}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Default Content helper
function getDefaultContent(type: SectionType): Record<string, unknown> {
  const defaults: Record<SectionType, Record<string, unknown>> = {
    [SectionType.HERO]: {
      heading: 'Willkommen',
      subheading: 'Ihr Untertitel hier',
      buttonText: 'Mehr erfahren',
      buttonLink: '#',
    },
    [SectionType.FEATURES]: {
      title: 'Unsere Features',
      items: [],
    },
    [SectionType.ABOUT]: {
      title: 'Über uns',
      description: 'Beschreibung hier',
    },
    [SectionType.SERVICES]: {
      title: 'Unsere Services',
      items: [],
    },
    [SectionType.GALLERY]: {
      title: 'Galerie',
      images: [],
    },
    [SectionType.TESTIMONIALS]: {
      title: 'Was Kunden sagen',
      testimonials: [],
    },
    [SectionType.TEAM]: {
      title: 'Unser Team',
      members: [],
    },
    [SectionType.PRICING]: {
      title: 'Preise',
      plans: [],
    },
    [SectionType.CTA]: {
      heading: 'Bereit loszulegen?',
      buttonText: 'Jetzt starten',
      buttonLink: '#',
    },
    [SectionType.CONTACT]: {
      title: 'Kontakt',
    },
    [SectionType.FAQ]: {
      title: 'Häufige Fragen',
      faqs: [],
    },
    [SectionType.BLOG]: {
      title: 'Blog',
    },
    [SectionType.STATS]: {
      title: 'Statistiken',
      stats: [],
    },
    [SectionType.VIDEO]: {
      title: 'Video',
    },
    [SectionType.TEXT]: {
      text: 'Ihr Text hier',
    },
    [SectionType.HTML]: {
      html: '<p>Ihr HTML hier</p>',
    },
    [SectionType.CUSTOM]: {
      title: 'Custom Section',
    },
  };

  return defaults[type] || {};
}
