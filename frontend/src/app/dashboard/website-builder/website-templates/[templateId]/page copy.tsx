'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const GET_TEMPLATE = gql`
  query GetTemplate($id: String!, $tenantId: String!) {
    wbTemplate(id: $id, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
    }
  }
`;

const GET_PAGES = gql`
  query GetPages($templateId: String!, $tenantId: String!) {
    wbPages(templateId: $templateId, tenantId: $tenantId) {
      id
      name
      slug
      description
      isActive
      isHomepage
      order
    }
  }
`;

const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!, $tenantId: String!) {
    createPage(input: $input, tenantId: $tenantId) {
      id
      name
      slug
    }
  }
`;

const DELETE_PAGE = gql`
  mutation DeletePage($id: String!, $tenantId: String!) {
    deletePage(id: $id, tenantId: $tenantId)
  }
`;

const SET_AS_DEFAULT = gql`
  mutation SetAsDefault($id: String!, $tenantId: String!) {
    setDefaultTemplate(id: $id, tenantId: $tenantId) {
      id
      isDefault
    }
  }
`;

export default function TemplateDetailPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const templateId = params.templateId as string;
  const [showCreatePage, setShowCreatePage] = useState(false);

  const { data: templateData } = useQuery(GET_TEMPLATE, {
    variables: { id: templateId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: pagesData, refetch } = useQuery(GET_PAGES, {
    variables: { templateId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const [createPage] = useMutation(CREATE_PAGE);
  const [deletePage] = useMutation(DELETE_PAGE);
  const [setAsDefault] = useMutation(SET_AS_DEFAULT);

  const template = templateData?.wbTemplate;
  const pages = pagesData?.wbPages || [];

  const handleCreatePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createPage({
        variables: {
          input: {
            templateId,
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            description: formData.get('description') as string,
            isActive: true,
            isHomepage: formData.get('isHomepage') === 'on',
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Page erstellt!');
      setShowCreatePage(false);
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await deletePage({ variables: { id, tenantId: tenant.id } });
      alert('✅ Gelöscht!');
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleSetDefault = async () => {
    try {
      await setAsDefault({ variables: { id: templateId, tenantId: tenant.id } });
      alert('✅ Als Standard gesetzt!');
      window.location.reload();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  if (!template) return <div className="p-8">Lädt...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/dashboard/website-builder/website-templates" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Zurück
      </Link>

      {/* Template Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
            <p className="text-gray-600 mb-4">{template.description || 'Keine Beschreibung'}</p>
            <div className="flex gap-2">
              {template.isActive && <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Aktiv</span>}
              {template.isDefault && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Standard</span>}
            </div>
          </div>
          {!template.isDefault && (
            <button onClick={handleSetDefault} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Als Standard setzen
            </button>
          )}
        </div>
      </div>

      {/* Pages */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pages ({pages.length})</h2>
        <button onClick={() => setShowCreatePage(!showCreatePage)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {showCreatePage ? 'Abbrechen' : '+ Neue Page'}
        </button>
      </div>

      {/* Create Form */}
      {showCreatePage && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Neue Page</h3>
          <form onSubmit={handleCreatePage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input name="name" type="text" required placeholder="z.B. Homepage" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug * (URL)</label>
              <input name="slug" type="text" required placeholder="z.B. home" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <textarea name="description" rows={3} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center">
              <input name="isHomepage" type="checkbox" id="isHomepage" className="mr-2" />
              <label htmlFor="isHomepage" className="text-sm">Als Homepage setzen</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Erstellen</button>
              <button type="button" onClick={() => setShowCreatePage(false)} className="bg-gray-300 px-6 py-2 rounded">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      {pages.length > 0 ? (
        <div className="grid gap-4">
          {pages.map((page: any) => (
            <div key={page.id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold">{page.name}</h3>
                  {page.isHomepage && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Homepage</span>}
                  {page.isActive && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Aktiv</span>}
                </div>
                <p className="text-gray-600 text-sm">/{page.slug}</p>
                <p className="text-gray-500 text-sm mt-1">{page.description}</p>
              </div>
              <div className="flex gap-2">
                {/* ✅ NEU: Visual Editor Button */}
                <Link 
                  href={`/dashboard/website-builder/website-templates/${templateId}/pages/${page.id}/visual`} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
                >
                  🎨 Visual Editor
                </Link>
                <Link href={`/dashboard/website-builder/website-templates/${templateId}/pages/${page.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Bearbeiten
                </Link>
                <Link href={`/dashboard/website-builder/website-templates/${templateId}/pages/${page.id}/preview`} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Preview
                </Link>
                <button onClick={() => handleDeletePage(page.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Keine Pages</h3>
          <p className="text-gray-600 mb-6">Erstelle deine erste Page!</p>
          <button onClick={() => setShowCreatePage(true)} className="bg-green-600 text-white px-8 py-3 rounded hover:bg-green-700">
            Erste Page erstellen
          </button>
        </div>
      )}
    </div>
  );
}