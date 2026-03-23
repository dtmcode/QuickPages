'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const GET_PAGE_WITH_SECTIONS = gql`
  query GetPageWithSections($id: String!, $tenantId: String!) {
    wbPage(id: $id, tenantId: $tenantId) {
      id
      name
      slug
      description
    }
    wbSections(pageId: $id, tenantId: $tenantId) {
      id
      name
      type
      order
      isActive
      content
      styling
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

const UPDATE_SECTION_ORDER = gql`
  mutation UpdateSectionOrder($id: String!, $input: UpdateSectionInput!, $tenantId: String!) {
    updateSection(id: $id, input: $input, tenantId: $tenantId) {
      id
      order
    }
  }
`;

const DELETE_SECTION = gql`
  mutation DeleteSection($id: String!, $tenantId: String!) {
    deleteSection(id: $id, tenantId: $tenantId)
  }
`;

// Sortable Section Component
function SortableSection({ section, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderSectionPreview = () => {
    const { content, type } = section;

    switch (type) {
      case 'hero':
        return (
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6 rounded-lg">
            <div className="text-center">
              {content?.heading && <h1 className="text-4xl font-bold mb-2">{content.heading}</h1>}
              {content?.subheading && <p className="text-xl mb-4 opacity-90">{content.subheading}</p>}
              {content?.text && <div className="prose prose-invert mx-auto mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: content.text }} />}
              {content?.buttonText && (
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold">
                  {content.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="bg-gray-50 py-12 px-6 rounded-lg">
            {content?.heading && <h2 className="text-3xl font-bold text-center mb-6">{content.heading}</h2>}
            {content?.items && (
              <div className="grid grid-cols-3 gap-4">
                {content.items.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow">
                    {item.icon && <div className="text-2xl mb-2">{item.icon}</div>}
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="bg-white py-8 px-6 rounded-lg">
            {content?.heading && <h2 className="text-2xl font-bold mb-4">{content.heading}</h2>}
            {content?.text && <div className="prose max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: content.text }} />}
          </div>
        );

      case 'cta':
        return (
          <div className="bg-blue-600 text-white py-8 px-6 rounded-lg text-center">
            {content?.heading && <h2 className="text-3xl font-bold mb-2">{content.heading}</h2>}
            {content?.text && <p className="text-lg mb-4 opacity-90">{content.text}</p>}
            {content?.buttonText && (
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold">
                {content.buttonText}
              </button>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="bg-gray-50 py-8 px-6 rounded-lg">
            {content?.heading && <h2 className="text-2xl font-bold text-center mb-2">{content.heading}</h2>}
            {content?.subheading && <p className="text-center text-gray-600 mb-4">{content.subheading}</p>}
            <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
              <div className="space-y-3">
                <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2 text-sm" />
                <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2 text-sm" />
                <textarea placeholder="Nachricht" rows={3} className="w-full border rounded px-3 py-2 text-sm" />
                <button className="w-full bg-blue-600 text-white py-2 rounded">Senden</button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 py-8 px-6 rounded-lg text-center">
            <p className="text-gray-600">Section: {type}</p>
            <p className="text-sm text-gray-500">{section.name}</p>
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white p-2 rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Section Preview */}
      <div className="border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden transition cursor-pointer">
        {renderSectionPreview()}
      </div>

      {/* Hover Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(section);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Wirklich löschen?')) onDelete(section.id);
          }}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          🗑️
        </button>
      </div>

      {/* Section Label */}
      <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition">
        {section.name} ({section.type})
      </div>
    </div>
  );
}

export default function VisualEditorPage() {
  const { tenant } = useAuth();
  const params = useParams();
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;

  const [sections, setSections] = useState<any[]>([]);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const { data, refetch } = useQuery(GET_PAGE_WITH_SECTIONS, {
    variables: { id: pageId, tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const [updateSection] = useMutation(UPDATE_SECTION);
  const [updateSectionOrder] = useMutation(UPDATE_SECTION_ORDER);
  const [deleteSection] = useMutation(DELETE_SECTION);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const page = data?.wbPage;
  const fetchedSections = data?.wbSections || [];

  useEffect(() => {
    if (fetchedSections.length > 0) {
      const sorted = [...fetchedSections].sort((a, b) => a.order - b.order);
      setSections(sorted);
    }
  }, [fetchedSections]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update order in backend
      try {
        await Promise.all(
          newSections.map((section, index) =>
            updateSectionOrder({
              variables: {
                id: section.id,
                input: { order: index },
                tenantId: tenant.id,
              },
            })
          )
        );
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSection({ variables: { id, tenantId: tenant.id } });
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const content = {
      ...editingSection.content,
      heading: formData.get('heading') as string,
      subheading: formData.get('subheading') as string,
      text: formData.get('text') as string,
      buttonText: formData.get('buttonText') as string,
      buttonLink: formData.get('buttonLink') as string,
    };

    try {
      await updateSection({
        variables: {
          id: editingSection.id,
          input: { content },
          tenantId: tenant.id,
        },
      });
      alert('✅ Gespeichert!');
      setEditingSection(null);
      refetch();
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  };

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  if (!page) return <div className="p-8">Lädt...</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}`}
              className="text-white hover:text-gray-300"
            >
              ← Zurück
            </Link>
            <div className="text-white">
              <h1 className="text-xl font-bold">{page.name}</h1>
              <p className="text-sm text-gray-400">Visual Editor</p>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-4 py-2 rounded ${deviceMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`px-4 py-2 rounded ${deviceMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-4 py-2 rounded ${deviceMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              📱 Mobile
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              📝 Section Editor
            </Link>
            <Link
              href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}/preview`}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              👁️ Preview
            </Link>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex items-start justify-center p-8">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
          style={{ width: getDeviceWidth(), maxWidth: '100%' }}
        >
          {sections.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 p-4">
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onEdit={setEditingSection}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="py-20 text-center text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <p>Keine Sections vorhanden</p>
              <Link
                href={`/dashboard/website-builder/website-templates/${templateId}/pages/${pageId}`}
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Sections erstellen →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Section bearbeiten</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Überschrift</label>
                <input
                  name="heading"
                  type="text"
                  defaultValue={editingSection.content?.heading}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unterüberschrift</label>
                <input
                  name="subheading"
                  type="text"
                  defaultValue={editingSection.content?.subheading}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <textarea
                  name="text"
                  rows={4}
                  defaultValue={editingSection.content?.text}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <input
                    name="buttonText"
                    type="text"
                    defaultValue={editingSection.content?.buttonText}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <input
                    name="buttonLink"
                    type="text"
                    defaultValue={editingSection.content?.buttonLink}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}