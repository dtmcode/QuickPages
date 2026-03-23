'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

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

// ✅ Global Sections Query
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

const CREATE_SECTION = gql`
  mutation CreateSection($input: CreateSectionInput!, $tenantId: String!) {
    createSection(input: $input, tenantId: $tenantId) {
      id
      name
    }
  }
`;

// ✅ Clone Global Section Mutation
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

const SECTION_TYPES = [
  { value: 'hero', label: '🦸 Hero' },
  { value: 'features', label: '⭐ Features' },
  { value: 'about', label: 'ℹ️ About' },
  { value: 'services', label: '🔧 Services' },
  { value: 'gallery', label: '🖼️ Gallery' },
  { value: 'testimonials', label: '💬 Testimonials' },
  { value: 'team', label: '👥 Team' },
  { value: 'pricing', label: '💰 Pricing' },
  { value: 'cta', label: '📢 CTA' },
  { value: 'contact', label: '📧 Contact' },
  { value: 'faq', label: '❓ FAQ' },
  { value: 'stats', label: '📊 Stats' },
  { value: 'video', label: '🎥 Video' },
  { value: 'text', label: '📝 Text' },
  { value: 'html', label: '💻 HTML' },
];

export default function PageEditorPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;
  
  const [showCreate, setShowCreate] = useState(false);
  const [showGlobalSections, setShowGlobalSections] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: pageData } = useQuery(GET_PAGE, {
    variables: { id: pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: sectionsData, refetch } = useQuery(GET_SECTIONS, {
    variables: { pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: globalSectionsData } = useQuery(GET_GLOBAL_SECTIONS);

  const [createSection] = useMutation(CREATE_SECTION);
  const [cloneGlobalSection] = useMutation(CLONE_GLOBAL_SECTION);
  const [updateSection] = useMutation(UPDATE_SECTION);
  const [deleteSection] = useMutation(DELETE_SECTION);

  const page = pageData?.wbPage;
  const sections = sectionsData?.wbSections || [];
  const globalSections = globalSectionsData?.wbGlobalSections || [];

  // ✅ Editor Navigation für Sections
  const openInEditor = (sectionId: string) => {
    router.push(`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/editor?section=${sectionId}`);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createSection({
        variables: {
          input: {
            pageId,
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            order: sections.length,
            isActive: true,
            content: {},
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Section erstellt!');
      setShowCreate(false);
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleCloneGlobalSection = async (globalSectionId: string, name: string) => {
    if (!confirm(`Section "${name}" verwenden?`)) return;
    try {
      await cloneGlobalSection({
        variables: {
          globalSectionId,
          pageId,
          tenantId: tenant.id,
        },
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

  if (!page) return <div className="p-8">Lädt...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href={`/dashboard/website-builder/website-templates/${templateId}`} className="text-blue-600 hover:underline mb-4 inline-block">
        ← Zurück
      </Link>

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{page.name}</h1>
            <p className="text-gray-600 mb-2">/{page.slug}</p>
            <p className="text-gray-500">{page.description}</p>
          </div>
          <div className="flex gap-3">
            {/* ✅ Visual Editor Button */}
            <Link 
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/visual`} 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 font-semibold"
            >
              🎨 Visual Editor
            </Link>
           
            {/* ✅ Preview Button */}
            <Link 
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/preview`} 
              className="bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700"
            >
              👁️ Preview
            </Link>
          </div>
        </div>
      </div>

      {/* Sections Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sections ({sections.length})</h2>
        <div className="flex gap-3">
          {/* ✅ Global Sections Button */}
          <button 
            onClick={() => setShowGlobalSections(!showGlobalSections)} 
            className="bg-gradient-to-r from-cyan-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-cyan-700 hover:to-pink-700 font-semibold"
          >
            {showGlobalSections ? 'Abbrechen' : '🌟 Vorgefertigte Section'}
          </button>
          <button 
            onClick={() => setShowCreate(!showCreate)} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {showCreate ? 'Abbrechen' : '+ Neue Section'}
          </button>
        </div>
      </div>

      {/* ✅ Global Sections Gallery */}
      {showGlobalSections && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">🌟 Vorgefertigte Sections</h3>
          {globalSections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalSections.map((globalSection: any) => (
                <div key={globalSection.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  {globalSection.thumbnailUrl && (
                    <img src={globalSection.thumbnailUrl} alt={globalSection.name} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold mb-1">{globalSection.name}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{globalSection.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {SECTION_TYPES.find(t => t.value === globalSection.type)?.label || globalSection.type}
                      </span>
                      <button
                        onClick={() => handleCloneGlobalSection(globalSection.id, globalSection.name)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
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
              <p>Keine vorgefertigten Sections verfügbar</p>
            </div>
          )}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Neue Section</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" type="text" required placeholder="Hero Section" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select name="type" required className="w-full border rounded px-3 py-2">
                {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Erstellen</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-300 px-6 py-2 rounded">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Section bearbeiten</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="name" type="text" defaultValue={editing.name} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Überschrift</label>
              <input name="heading" type="text" defaultValue={editing.content?.heading} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unterüberschrift</label>
              <input name="subheading" type="text" defaultValue={editing.content?.subheading} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea name="text" rows={4} defaultValue={editing.content?.text} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input name="buttonText" type="text" defaultValue={editing.content?.buttonText} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Link</label>
              <input name="buttonLink" type="text" defaultValue={editing.content?.buttonLink} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Speichern</button>
              <button type="button" onClick={() => setEditing(null)} className="bg-gray-300 px-6 py-2 rounded">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      {sections.length > 0 ? (
        <div className="grid gap-4">
          {sections.map((section: any) => (
            <div key={section.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{section.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {SECTION_TYPES.find(t => t.value === section.type)?.label || section.type}
                    </span>
                    {section.isActive && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Aktiv</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {section.content?.heading && <p>📌 {section.content.heading}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* ✅ Mit Editor bearbeiten Button */}
                  <button 
                    onClick={() => openInEditor(section.id)} 
                    className="bg-cyan-400 text-white px-4 py-2 rounded hover:bg-cyan-700 flex items-center gap-2"
                  >
                    <span>✨</span>
                    <span>Mit Editor bearbeiten</span>
                  </button>
                  {/* ✅ Bearbeiten Button */}
                  <button onClick={() => setEditing(section)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    ✍️ Schnell Bearbeiten
                  </button>
                  {/* ✅ Löschen Button */}
                  <button onClick={() => handleDelete(section.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                   🗑️ Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Keine Sections</h3>
          <button onClick={() => setShowCreate(true)} className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700">
            Erste Section erstellen
          </button>
        </div>
      )}
    </div>
  );
}