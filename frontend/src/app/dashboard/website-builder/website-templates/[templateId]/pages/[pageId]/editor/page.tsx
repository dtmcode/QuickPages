'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import RichTextEditor from '@/components/editor/RichTextEditor';

const GET_SECTION = gql`
  query GetSection($id: String!, $tenantId: String!) {
    wbSection(id: $id, tenantId: $tenantId) {
      id
      name
      type
      content
      pageId
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

export default function RichTextEditorPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;
  const sectionId = searchParams.get('section');

  const [editorContent, setEditorContent] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    heading: '',
    subheading: '',
    buttonText: '',
    buttonLink: '',
  });

  const { data: sectionData, loading } = useQuery(GET_SECTION, {
    variables: { id: sectionId, tenantId: tenant?.id },
    skip: !sectionId || !tenant?.id,
  });

  const [updateSection] = useMutation(UPDATE_SECTION);

  const section = sectionData?.wbSection;

  // Load section data
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || '',
        heading: section.content?.heading || '',
        subheading: section.content?.subheading || '',
        buttonText: section.content?.buttonText || '',
        buttonLink: section.content?.buttonLink || '',
      });
      setEditorContent(section.content?.text || '');
    }
  }, [section]);

  const handleSave = async () => {
    if (!section) return;

    const content = {
      ...section.content,
      heading: formData.heading,
      subheading: formData.subheading,
      text: editorContent,
      buttonText: formData.buttonText,
      buttonLink: formData.buttonLink,
    };

    try {
      await updateSection({
        variables: {
          id: section.id,
          input: { name: formData.name, content },
          tenantId: tenant.id,
        },
      });
      alert('✅ Gespeichert!');
      // Zurück zur Main Page
      router.push(`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`);
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Lädt...</div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Section nicht gefunden</h2>
          <Link
            href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`}
            className="text-blue-600 hover:underline"
          >
            ← Zurück
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`}
              className="text-blue-600 hover:underline"
            >
              ← Zurück
            </Link>
            <div>
              <h1 className="text-3xl font-bold">✨ Rich Text Editor</h1>
              <p className="text-gray-600">Bearbeite: {section.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            💾 Speichern
          </button>
        </div>

        {/* Editor Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Basic Fields */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Section Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Überschrift</label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unterüberschrift</label>
                <input
                  type="text"
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="z.B. Mehr erfahren"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Link</label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="z.B. /kontakt"
                />
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Content</label>
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Schreibe hier deinen Text..."
            />
          </div>

          {/* Save Button (Bottom) */}
          <div className="mt-8 flex justify-end gap-4">
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </Link>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              💾 Speichern
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tipps:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Nutze die Toolbar für Formatierungen (Fett, Kursiv, Überschriften)</li>
            <li>• Füge Bilder, Links und YouTube Videos ein</li>
            <li>• Verwende Listen für bessere Struktur</li>
            <li>• Achte auf gute Lesbarkeit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}