// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/[templateId]/pages/[pageId]/page.tsx

'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { SectionPool } from '@/components/website-builder/SectionPool';

// ==================== QUERIES ====================

const GET_PAGE = gql`
  query GetPage($id: String!, $tenantId: String!) {
    wbPage(id: $id, tenantId: $tenantId) {
      id
      name
      slug
      description
    }
  }
`;

const GET_SECTIONS = gql`
  query GetSections($pageId: String!, $tenantId: String!) {
    wbSections(pageId: $pageId, tenantId: $tenantId) {
      id
      name
      type
      order
      isActive
      content
    }
  }
`;

const GET_GLOBAL_SECTIONS = gql`
  query GetGlobalSections {
    wbGlobalSections {
      id
      name
      type
      description
      category
      thumbnailUrl
      content
    }
  }
`;

// ==================== MUTATIONS ====================

const CLONE_GLOBAL_SECTION = gql`
  mutation CloneGlobalSection($globalSectionId: String!, $pageId: String!, $tenantId: String!) {
    cloneGlobalSection(globalSectionId: $globalSectionId, pageId: $pageId, tenantId: $tenantId) {
      id
      name
    }
  }
`;

const UPDATE_SECTION = gql`
  mutation UpdateSection($id: String!, $input: UpdateSectionInput!, $tenantId: String!) {
    updateSection(id: $id, input: $input, tenantId: $tenantId) {
      id
    }
  }
`;

const DELETE_SECTION = gql`
  mutation DeleteSection($id: String!, $tenantId: String!) {
    deleteSection(id: $id, tenantId: $tenantId)
  }
`;

// ==================== CONSTANTS ====================

const SECTION_ICONS: Record<string, string> = {
  hero: '🎯', features: '⭐', about: '📖', services: '🛠️',
  gallery: '🖼️', testimonials: '💬', team: '👥', pricing: '💰',
  cta: '🎪', contact: '📧', faq: '❓', stats: '📊',
  video: '🎬', text: '📝', html: '🧩', newsletter: '📬',
};

const SECTION_COLORS: Record<string, string> = {
  hero: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10',
  features: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
  cta: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  contact: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
  pricing: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  testimonials: 'border-l-pink-500 bg-pink-50 dark:bg-pink-900/10',
  newsletter: 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/10',
  services: 'border-l-teal-500 bg-teal-50 dark:bg-teal-900/10',
};

// ==================== COMPONENT ====================

export default function PageEditorPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;

  // UI State
  const [showSectionPool, setShowSectionPool] = useState(false);
  const [showGlobalSections, setShowGlobalSections] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // Queries
  const { data: pageData } = useQuery(GET_PAGE, {
    variables: { id: pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: sectionsData, refetch } = useQuery(GET_SECTIONS, {
    variables: { pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: globalSectionsData } = useQuery(GET_GLOBAL_SECTIONS);

  // Mutations
  const [cloneGlobalSection] = useMutation(CLONE_GLOBAL_SECTION);
  const [updateSection] = useMutation(UPDATE_SECTION);
  const [deleteSection] = useMutation(DELETE_SECTION);

  // Data
  const page = pageData?.wbPage;
  const sections = [...(sectionsData?.wbSections || [])].sort((a: any, b: any) => a.order - b.order);
  const globalSections = globalSectionsData?.wbGlobalSections || [];

  // ==================== HANDLERS ====================

  const openInEditor = (sectionId: string) => {
    router.push(`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/editor?section=${sectionId}`);
  };

  const handleCloneGlobalSection = async (globalSectionId: string, name: string) => {
    if (!confirm(`Section "${name}" verwenden?`)) return;
    try {
      await cloneGlobalSection({
        variables: { globalSectionId, pageId, tenantId: tenant.id },
      });
      alert('✅ Section hinzugefügt!');
      setShowGlobalSections(false);
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = {
      heading: formData.get('heading') as string,
      subheading: formData.get('subheading') as string,
      text: formData.get('text') as string,
      buttonText: formData.get('buttonText') as string,
      buttonLink: formData.get('buttonLink') as string,
    };
    try {
      await updateSection({
        variables: {
          id: editing.id,
          input: { name: formData.get('name') as string, content },
          tenantId: tenant.id,
        },
      });
      alert('✅ Gespeichert!');
      setEditing(null);
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await deleteSection({ variables: { id, tenantId: tenant.id } });
      alert('✅ Gelöscht!');
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  // ==================== RENDER ====================

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href={`/dashboard/website-builder/website-templates/${templateId}`}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
      >
        ← Zurück zum Template
      </Link>

      {/* ==================== PAGE HEADER ==================== */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {page.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
              /{page.slug}
            </p>
            {page.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{page.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/visual`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-cyan-700 hover:to-blue-700 font-semibold text-sm shadow-sm"
            >
              🎨 Visual Editor
            </Link>
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/preview`}
              className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm"
            >
              👁️ Preview
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== SECTIONS HEADER ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sections
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {sections.length} {sections.length === 1 ? 'Section' : 'Sections'} auf dieser Seite
          </p>
        </div>
        <div className="flex gap-2">
          {/* Global Sections */}
          {globalSections.length > 0 && (
            <button
              onClick={() => { setShowGlobalSections(!showGlobalSections); setShowSectionPool(false); }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                showGlobalSections
                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                  : 'bg-gradient-to-r from-cyan-600 to-pink-600 text-white hover:from-cyan-700 hover:to-pink-700 shadow-sm'
              }`}
            >
              🌟 {showGlobalSections ? 'Schließen' : 'Vorgefertigte'}
            </button>
          )}

          {/* Section Pool */}
          <button
            onClick={() => { setShowSectionPool(true); setShowGlobalSections(false); }}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm shadow-sm transition-colors"
          >
            + Section hinzufügen
          </button>
        </div>
      </div>

      {/* ==================== SECTION POOL MODAL ==================== */}
      {showSectionPool && (
        <SectionPool
          pageId={pageId}
          tenantId={tenant.id}
          onCreated={() => refetch()}
          onClose={() => setShowSectionPool(false)}
          mode="modal"
        />
      )}

      {/* ==================== GLOBAL SECTIONS GALLERY ==================== */}
      {showGlobalSections && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🌟 Vorgefertigte Sections
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Professionell gestaltete Sections mit vorgefülltem Content
              </p>
            </div>
            <button
              onClick={() => setShowGlobalSections(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {globalSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalSections.map((gs: any) => (
                <div
                  key={gs.id}
                  className="group border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all"
                >
                  {gs.thumbnailUrl && (
                    <img
                      src={gs.thumbnailUrl}
                      alt={gs.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">{SECTION_ICONS[gs.type] || '📦'}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {gs.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {gs.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full capitalize">
                        {gs.type}
                      </span>
                      <button
                        onClick={() => handleCloneGlobalSection(gs.id, gs.name)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Verwenden
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Keine vorgefertigten Sections verfügbar
            </div>
          )}
        </div>
      )}

      {/* ==================== EDIT FORM ==================== */}
      {editing && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ✏️ Schnell-Bearbeitung: {editing.name}
            </h3>
            <button
              onClick={() => setEditing(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editing.name}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Überschrift</label>
                <input
                  name="heading"
                  type="text"
                  defaultValue={editing.content?.heading}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unterüberschrift</label>
              <input
                name="subheading"
                type="text"
                defaultValue={editing.content?.subheading}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text</label>
              <textarea
                name="text"
                rows={4}
                defaultValue={editing.content?.text}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
                <input
                  name="buttonText"
                  type="text"
                  defaultValue={editing.content?.buttonText}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Link</label>
                <input
                  name="buttonLink"
                  type="text"
                  defaultValue={editing.content?.buttonLink}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                💾 Speichern
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== SECTIONS LIST ==================== */}
      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((section: any, index: number) => (
            <div
              key={section.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border-l-4 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all ${
                SECTION_COLORS[section.type] || 'border-l-gray-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                {/* Left: Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Order Badge */}
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-xs font-mono">
                    {index + 1}
                  </span>

                  {/* Icon + Content */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">{SECTION_ICONS[section.type] || '📦'}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {section.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs capitalize">
                        {section.type}
                      </span>
                      {section.isActive ? (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                          Aktiv
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                          Hidden
                        </span>
                      )}
                    </div>
                    {section.content?.heading && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                        📌 {section.content.heading}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openInEditor(section.id)}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 text-sm font-medium shadow-sm transition-all"
                  >
                    ✨ Editor
                  </button>
                  <button
                    onClick={() => setEditing(section)}
                    className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
                  >
                    ✍️ Quick Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Noch keine Sections
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Füge Sections hinzu, um deine Seite zu gestalten
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowSectionPool(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium shadow-sm"
            >
              + Section aus Pool
            </button>
            {globalSections.length > 0 && (
              <button
                onClick={() => setShowGlobalSections(true)}
                className="bg-gradient-to-r from-cyan-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-pink-700 font-medium shadow-sm"
              >
                🌟 Vorgefertigte
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}