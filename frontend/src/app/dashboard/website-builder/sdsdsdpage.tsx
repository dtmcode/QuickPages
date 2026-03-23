'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const DASHBOARD_STATS = gql`
  query DashboardStats($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      name
      isDefault
      isActive
      thumbnailUrl
      createdAt
    }
  }
`;

export default function WebsiteBuilderDashboard() {
  const { tenant } = useAuth();

  const { data, loading } = useQuery(DASHBOARD_STATS, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const templates = data?.wbTemplates || [];
  const activeTemplates = templates.filter((t: any) => t.isActive);
  const defaultTemplate = templates.find((t: any) => t.isDefault);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="text-center">Lädt...</div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎨 Website Builder</h1>
        <p className="text-gray-600">Erstelle professionelle Websites mit Templates, Pages und Sections</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Templates */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Templates</p>
              <p className="text-4xl font-bold mt-1">{templates.length}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">📄</div>
          </div>
          <Link href="/dashboard/website-builder/website-templates" className="text-sm text-blue-100 hover:text-white">
            Alle ansehen →
          </Link>
        </div>

        {/* Active Templates */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">Aktive Templates</p>
              <p className="text-4xl font-bold mt-1">{activeTemplates.length}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">✅</div>
          </div>
          <p className="text-sm text-green-100">{templates.length - activeTemplates.length} inaktiv</p>
        </div>

        {/* Default Template */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-100 text-sm font-medium">Standard Template</p>
              <p className="text-xl font-bold mt-1 line-clamp-1">{defaultTemplate?.name || 'Nicht gesetzt'}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">⭐</div>
          </div>
          {defaultTemplate && (
            <Link href={`/dashboard/website-builder/website-templates/${defaultTemplate.id}`} className="text-sm text-purple-100 hover:text-white">
              Öffnen →
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-orange-100 text-sm font-medium">Quick Start</p>
              <p className="text-xl font-bold mt-1">Jetzt erstellen</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-lg p-3">➕</div>
          </div>
          <Link href="/dashboard/website-builder/website-templates" className="text-sm text-orange-100 hover:text-white">
            Neues Template →
          </Link>
        </div>
      </div>

      {/* Recent Templates */}
      {templates.length > 0 ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📋 Deine Templates</h2>
            <Link href="/dashboard/website-builder/website-templates" className="text-blue-600 hover:text-blue-700 font-medium">
              Alle ansehen →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.slice(0, 6).map((template: any) => (
              <Link
                key={template.id}
                href={`/dashboard/website-builder/website-templates/${template.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 group"
              >
                {template.thumbnailUrl ? (
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center text-4xl">
                    🎨
                  </div>
                )}
                <h3 className="text-lg font-semibold group-hover:text-blue-600 transition mb-2">{template.name}</h3>
                <div className="flex gap-2">
                  {template.isDefault && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">⭐ Standard</span>}
                  {template.isActive && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">✓ Aktiv</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold mb-2">Willkommen beim Website Builder!</h3>
          <p className="text-gray-600 mb-8">Erstelle dein erstes Template</p>
          <Link href="/dashboard/website-builder/website-templates" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
            Erstes Template erstellen
          </Link>
        </div>
      )}

      {/* Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h3 className="text-xl font-bold mb-4">🚀 So geht's:</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-semibold mb-1">Template erstellen</h4>
              <p className="text-sm text-gray-600">Basis für deine Website</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-semibold mb-1">Pages hinzufügen</h4>
              <p className="text-sm text-gray-600">Homepage, About, Contact...</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-semibold mb-1">Sections erstellen</h4>
              <p className="text-sm text-gray-600">Hero, Features, CTA...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}