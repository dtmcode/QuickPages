// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/global-templates/page.tsx

'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

const GET_ALL_GLOBAL_TEMPLATES = gql`
  query GetAllGlobalTemplates {
    wbGlobalTemplates {
      id
      name
      description
      category
      thumbnailUrl
      isPremium
      previewUrl
      demoUrl
    }
  }
`;

const CLONE_GLOBAL_TEMPLATE = gql`
  mutation CloneGlobalTemplate($globalTemplateId: String!, $tenantId: String!) {
    cloneGlobalTemplate(globalTemplateId: $globalTemplateId, tenantId: $tenantId) {
      id
      name
    }
  }
`;

export default function GlobalTemplatesGalleryPage() {
  const { tenant } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading } = useQuery(GET_ALL_GLOBAL_TEMPLATES);
  const [cloneTemplate, { loading: cloning }] = useMutation(CLONE_GLOBAL_TEMPLATE);

  const templates = data?.wbGlobalTemplates || [];

  const filteredTemplates = templates.filter((template: any) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...new Set(templates.map((t: any) => t.category).filter(Boolean))];

  const handleClone = async (templateId: string, templateName: string) => {
    if (!confirm(`Template "${templateName}" verwenden und anpassen?`)) return;
    
    try {
      const result = await cloneTemplate({
        variables: {
          globalTemplateId: templateId,
          tenantId: tenant.id,
        },
      });
      
      alert('✅ Template erfolgreich erstellt!');
      window.location.href = `/dashboard/website-builder/website-templates/${result.data.cloneGlobalTemplate.id}`;
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
      <div className="mb-8">
        <Link href="/dashboard/website-builder/website-templates" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Zurück zu deinen Templates
        </Link>
        <h1 className="text-4xl font-bold mb-2">🌟 Template Galerie</h1>
        <p className="text-gray-600 text-lg">Wähle eine professionelle Vorlage als Startpunkt</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Templates durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'Alle' : category}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredTemplates.map((template: any) => (
  <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
    {template.thumbnailUrl && (
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={template.thumbnailUrl} 
          alt={template.name} 
          className="w-full h-full object-cover hover:scale-105 transition duration-300" 
        />
      </div>
    )}

    <div className="p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold">{template.name}</h3>
        {template.isPremium && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold whitespace-nowrap ml-2">
            ⭐ Premium
          </span>
        )}
      </div>

      {template.category && (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mb-3">
          {template.category}
        </span>
      )}

      <p className="text-gray-600 mb-4 line-clamp-3">{template.description}</p>

      <div className="flex gap-2">
        {/* ✅ NEU: Link zur Detail-Seite */}
        <Link 
          href={`/dashboard/website-builder/website-templates/global-templates/${template.id}`}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-center text-sm font-semibold"
        >
          📄 Details
        </Link>
        
        {template.demoUrl && (
          <a 
            href={template.demoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-center text-sm"
          >
            👁️ Demo
          </a>
        )}
      </div>

      {/* ✅ Verwenden Button separat */}
      <button
        onClick={() => handleClone(template.id, template.name)}
        disabled={cloning}
        className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition text-sm disabled:opacity-50 font-semibold"
      >
        {cloning ? 'Wird erstellt...' : '✨ Template verwenden'}
      </button>
    </div>
  </div>
))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Keine Templates gefunden</h3>
          <p className="text-gray-600 mb-6">Versuche einen anderen Suchbegriff oder eine andere Kategorie</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        {filteredTemplates.length} von {templates.length} Templates
      </div>
    </div>
  );
}