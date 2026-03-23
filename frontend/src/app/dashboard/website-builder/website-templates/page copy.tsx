// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/page.tsx

'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

const GET_TEMPLATES = gql`
  query GetTemplates($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

// ✅ NEU: Lade 3 Global Templates als Preview
const GET_GLOBAL_TEMPLATES_PREVIEW = gql`
  query GetGlobalTemplatesPreview {
    wbGlobalTemplates(limit: 3) {
      id
      name
      description
      category
      thumbnailUrl
      isPremium
    }
  }
`;

const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!, $tenantId: String!) {
    createTemplate(input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
    }
  }
`;

const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: String!, $input: UpdateTemplateInput!, $tenantId: String!) {
    updateTemplate(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      updatedAt
    }
  }
`;

const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: String!, $tenantId: String!) {
    deleteTemplate(id: $id, tenantId: $tenantId)
  }
`;

export default function TemplatesListPage() {
  const { tenant } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data, loading, refetch } = useQuery(GET_TEMPLATES, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  // ✅ NEU: Lade Global Templates
  const { data: globalData, loading: globalLoading } = useQuery(GET_GLOBAL_TEMPLATES_PREVIEW);

  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [updateTemplate] = useMutation(UPDATE_TEMPLATE);
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE);

  const templates = data?.wbTemplates || [];
  const globalTemplates = globalData?.wbGlobalTemplates || [];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createTemplate({
        variables: {
          input: {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            thumbnailUrl: formData.get('thumbnailUrl') as string,
            isActive: true,
            isDefault: false,
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Template erstellt!');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateTemplate({
        variables: {
          id: editingTemplate.id,
          input: {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            thumbnailUrl: formData.get('thumbnailUrl') as string,
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Template aktualisiert!');
      setEditingTemplate(null);
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await deleteTemplate({
        variables: { id, tenantId: tenant.id },
      });
      alert('✅ Template gelöscht!');
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Lädt Templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Website Templates</h1>
          <p className="text-gray-600 mt-1">{templates.length} Template{templates.length !== 1 ? 's' : ''} vorhanden</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          {showForm ? 'Abbrechen' : '+ Neues Template'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Neues Template erstellen</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" type="text" required placeholder="z.B. Business Template" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <textarea name="description" rows={3} placeholder="Beschreibe dein Template..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input name="thumbnailUrl" type="text" placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Template erstellen
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingTemplate && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Template bearbeiten</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" type="text" required defaultValue={editingTemplate.name} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <textarea name="description" rows={3} defaultValue={editingTemplate.description} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input name="thumbnailUrl" type="text" defaultValue={editingTemplate.thumbnailUrl} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Speichern
              </button>
              <button type="button" onClick={() => setEditingTemplate(null)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((template: any) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              {template.thumbnailUrl && (
                <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{template.description || 'Keine Beschreibung'}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs ${template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {template.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
                {template.isDefault && <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Standard</span>}
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/website-builder/website-templates/${template.id}`} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm text-center">
                  Öffnen
                </Link>
                <button onClick={() => setEditingTemplate(template)} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm">
                  Bearbeiten
                </button>
                <button onClick={() => handleDelete(template.id)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm">
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mb-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Keine Templates vorhanden</h3>
          <p className="text-gray-600 mb-6">Erstelle dein erstes Template, um loszulegen!</p>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Erstes Template erstellen
          </button>
        </div>
      )}

      {/* ==================== ✅ NEU: GLOBAL TEMPLATES SECTION ==================== */}
      {!globalLoading && globalTemplates.length > 0 && (
        <div className="border-t pt-12 mt-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">🌟 Beliebte Vorlagen</h2>
              <p className="text-gray-600">Starte mit einem professionellen Template</p>
            </div>
            <Link 
              href="/dashboard/website-builder/website-templates/global-templates" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold"
            >
              Alle Vorlagen ansehen →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {globalTemplates.map((template: any) => (
              <div key={template.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md hover:shadow-xl transition p-6 border-2 border-purple-200">
                {template.thumbnailUrl && (
                  <div className="mb-4 aspect-video bg-white rounded-lg overflow-hidden shadow">
                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  {template.isPremium && (
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
                      ⭐ Premium
                    </span>
                  )}
                </div>
                {template.category && (
                  <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold mb-3">
                    {template.category}
                  </span>
                )}
                <p className="text-gray-700 mb-4 line-clamp-2">{template.description}</p>
                <Link 
                  href={`/dashboard/website-builder/website-templates/global-templates/${template.id}`}
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition text-center font-semibold"
                >
                  Vorlage verwenden
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ WENN KEINE GLOBAL TEMPLATES */}
      {!globalLoading && globalTemplates.length === 0 && (
        <div className="border-t pt-12 mt-12 text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">Keine globalen Vorlagen verfügbar</h3>
          <p className="text-gray-600">Derzeit sind keine fertigen Templates verfügbar.</p>
        </div>
      )}
    </div>
  );
}