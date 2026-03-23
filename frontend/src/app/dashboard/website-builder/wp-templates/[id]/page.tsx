/**
 * Dashboard Page: Template Detail & Page Editor
 * Path: /dashboard/website-builder/templates/[id]
 */

'use client';

import { useState } from 'react';
import { useTemplate, usePages, useSections } from '@/lib/hooks';
import { Page, Section, SectionType } from '@/types/website-builder.types';
import { SectionEditor } from '@/components/website-builder/SectionEditor';
import { PagesList } from '@/components/website-builder/PagesList';
import { SectionsList } from '@/components/website-builder/SectionsList';

interface TemplateEditorPageProps {
  params: {
    id: string;
  };
}

export default function TemplateEditorPage({ params }: TemplateEditorPageProps) {
  const { template, isLoading, error } = useTemplate(params.id);
  const { pages, createPage, updatePage, deletePage } = usePages(params.id);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error || 'Template nicht gefunden'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-gray-600 text-sm mt-1">
              {pages.length} Pages • {selectedPage?.sections?.length || 0} Sections
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Vorschau
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Veröffentlichen
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Pages */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <PagesList
            templateId={params.id}
            pages={pages}
            selectedPage={selectedPage}
            onSelectPage={setSelectedPage}
            onCreatePage={createPage}
            onUpdatePage={updatePage}
            onDeletePage={deletePage}
          />
        </div>

        {/* Center: Sections Editor */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedPage ? (
            <SectionsList
              page={selectedPage}
              selectedSection={selectedSection}
              onSelectSection={setSelectedSection}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg">Wähle eine Page aus</p>
                <p className="text-sm mt-2">
                  oder erstelle eine neue Page um loszulegen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Section Editor */}
        <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto">
          {selectedSection ? (
            <SectionEditor
              section={selectedSection}
              onClose={() => setSelectedSection(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 p-6">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <p className="text-sm">Wähle eine Section zum Bearbeiten</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
