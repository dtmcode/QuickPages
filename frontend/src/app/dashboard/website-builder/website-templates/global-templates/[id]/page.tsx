// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/global-templates/[id]/page.tsx

'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const GET_GLOBAL_TEMPLATE = gql`
  query GetGlobalTemplate($id: String!) {
    wbGlobalTemplate(id: $id) {
      id
      name
      description
      category
      thumbnailUrl
      isPremium
      previewUrl
      demoUrl
      settings
      createdAt
    }
  }
`;

const CLONE_GLOBAL_TEMPLATE = gql`
  mutation CloneGlobalTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) {
      id
      name
      description
      pages {
        id
        name
        slug
      }
    }
  }
`;

export default function GlobalTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useAuth();
  const templateId = params.id as string;

  const { data, loading } = useQuery(GET_GLOBAL_TEMPLATE, {
    variables: { id: templateId },
  });

  const [cloneTemplate, { loading: cloning }] = useMutation(CLONE_GLOBAL_TEMPLATE);

  const template = data?.wbGlobalTemplate;

  const handleClone = async () => {
    if (!confirm(`Template "${template.name}" verwenden und anpassen?`)) return;

    try {
      const result = await cloneTemplate({
        variables: {
          globalTemplateId: templateId,
          tenantId: tenant.id,
        },
      });

      alert('✅ Template erfolgreich erstellt!');
      router.push(`/dashboard/website-builder/website-templates/${result.data.cloneGlobalTemplate.id}`);
    } catch (error: any) {
      console.error('Clone error:', error);
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Lädt Template...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Template nicht gefunden</h2>
          <Link href="/dashboard/website-builder/website-templates/global-templates" className="text-blue-600 hover:underline">
            ← Zurück zur Galerie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/dashboard/website-builder/website-templates/global-templates" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Zurück zur Galerie
      </Link>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold">{template.name}</h1>
              {template.isPremium && (
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-bold">
                  ⭐ Premium
                </span>
              )}
            </div>
            {template.category && (
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm font-semibold mb-4">
                {template.category}
              </span>
            )}
            <p className="text-lg text-white/90 max-w-3xl">{template.description}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleClone}
            disabled={cloning}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cloning ? '⏳ Wird erstellt...' : '✨ Template verwenden'}
          </button>
          {template.demoUrl && (
            <a
              href={template.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur text-white px-8 py-3 rounded-lg hover:bg-white/20 transition font-semibold"
            >
              👁️ Live Demo ansehen
            </a>
          )}
        </div>
      </div>

      {template.thumbnailUrl && (
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Vorschau</h2>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {template.settings && Object.keys(template.settings).length > 0 && (
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎨 Enthaltene Funktionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.settings.colors && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Farbschema</h3>
                <div className="flex gap-2">
                  {Object.entries(template.settings.colors).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: value }}
                      />
                      <p className="text-xs mt-1 text-gray-600">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {template.settings.fonts && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Schriftarten</h3>
                <ul className="space-y-1">
                  {Object.entries(template.settings.fonts).map(([key, value]: [string, any]) => (
                    <li key={key} className="text-sm">
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="font-bold text-lg mb-2">Was passiert beim Verwenden?</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Das Template wird in deinen Account kopiert</li>
              <li>✅ Du kannst alle Inhalte frei anpassen</li>
              <li>✅ Alle Seiten und Sections werden übernommen</li>
              <li>✅ Das Original-Template bleibt unverändert</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}