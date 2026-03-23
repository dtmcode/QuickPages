'use client';

import { useQuery, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const GET_PAGE = gql`
  query GetPage($id: String!, $tenantId: String!) {
    wbPage(id: $id, tenantId: $tenantId) {
      id
      name
      slug
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

export default function PreviewPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;

  const { data: pageData } = useQuery(GET_PAGE, {
    variables: { id: pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: sectionsData } = useQuery(GET_SECTIONS, {
    variables: { pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const page = pageData?.wbPage;
  const sections = sectionsData?.wbSections || [];

  const renderSection = (section: any) => {
    const { content } = section;
    switch (section.type) {
      case 'hero':
        return (
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div className="max-w-5xl mx-auto px-4 text-center">
              {content.heading && <h1 className="text-5xl font-bold mb-4">{content.heading}</h1>}
              {content.subheading && <p className="text-xl mb-8">{content.subheading}</p>}
              {content.buttonText && (
                <a href={content.buttonLink || '#'} className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                  {content.buttonText}
                </a>
              )}
            </div>
          </section>
        );
      case 'features':
        return (
          <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
              {content.heading && <h2 className="text-4xl font-bold text-center mb-12">{content.heading}</h2>}
              {content.items && (
                <div className="grid md:grid-cols-3 gap-8">
                  {content.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      case 'cta':
        return (
          <section className="bg-blue-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              {content.heading && <h2 className="text-3xl font-bold mb-4">{content.heading}</h2>}
              {content.text && <p className="text-lg mb-8">{content.text}</p>}
              {content.buttonText && (
                <a href={content.buttonLink || '#'} className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
                  {content.buttonText}
                </a>
              )}
            </div>
          </section>
        );
      case 'text':
        return (
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              {content.heading && <h2 className="text-3xl font-bold mb-6">{content.heading}</h2>}
              {content.text && <div className="prose max-w-none">{content.text}</div>}
            </div>
          </section>
        );
      case 'contact':
        return (
          <section className="py-16 bg-gray-50">
            <div className="max-w-2xl mx-auto px-4">
              {content.heading && <h2 className="text-3xl font-bold text-center mb-8">{content.heading}</h2>}
              <form className="bg-white p-8 rounded-lg shadow">
                <div className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full border rounded px-4 py-2" />
                  <input type="email" placeholder="Email" className="w-full border rounded px-4 py-2" />
                  <textarea placeholder="Nachricht" rows={4} className="w-full border rounded px-4 py-2" />
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    {content.buttonText || 'Senden'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        );
      default:
        return (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-gray-100 p-8 rounded">
                <p className="text-gray-600">Section: {section.type}</p>
                <p className="text-sm text-gray-500">{section.name}</p>
              </div>
            </div>
          </section>
        );
    }
  };

  if (!page) return <div className="p-8">Lädt...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Header */}
      <div className="sticky top-0 bg-gray-900 text-white px-4 py-3 flex justify-between items-center z-50 shadow">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`} className="bg-white text-gray-900 px-4 py-1 rounded hover:bg-gray-100">
            ← Zurück
          </Link>
          <span className="text-sm">👁️ Preview: <strong>{page.name}</strong></span>
        </div>
        <div className="text-sm text-gray-400">{sections.length} Sections</div>
      </div>

      {/* Content */}
      {sections.length > 0 ? (
        <div>
          {sections
            .filter((s: any) => s.isActive)
            .sort((a: any, b: any) => a.order - b.order)
            .map((section: any) => <div key={section.id}>{renderSection(section)}</div>)}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold mb-2">Keine Sections</h2>
            <p className="text-gray-600 mb-6">Füge Sections hinzu</p>
            <Link href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`} className="bg-blue-600 text-white px-6 py-2 rounded inline-block">
              Sections hinzufügen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
