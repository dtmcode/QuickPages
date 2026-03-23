/**
 * Pages List Component
 * Zeigt alle Pages eines Templates und ermöglicht CRUD
 */

'use client';

import { useState } from 'react';
import { Page, CreatePageDto, UpdatePageDto } from '@/types/website-builder.types';

interface PagesListProps {
  templateId: string;
  pages: Page[];
  selectedPage: Page | null;
  onSelectPage: (page: Page) => void;
  onCreatePage: (data: CreatePageDto) => Promise<Page>;
  onUpdatePage: (id: string, data: UpdatePageDto) => Promise<Page>;
  onDeletePage: (id: string) => Promise<void>;
}

export function PagesList({
  templateId,
  pages,
  selectedPage,
  onSelectPage,
  onCreatePage,
  onUpdatePage,
  onDeletePage,
}: PagesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Pages</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        {sortedPages.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Noch keine Pages vorhanden
          </div>
        ) : (
          <div className="p-2">
            {sortedPages.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelectPage(page)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  selectedPage?.id === page.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {page.name}
                      </span>
                      {page.isHomepage && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Home
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">/{page.slug}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {page.sections?.length || 0} Sections
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPage(page);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePageModal
          templateId={templateId}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreatePage}
        />
      )}

      {/* Edit Modal */}
      {editingPage && (
        <EditPageModal
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onUpdate={onUpdatePage}
          onDelete={onDeletePage}
        />
      )}
    </div>
  );
}

// ==================== CREATE PAGE MODAL ====================

interface CreatePageModalProps {
  templateId: string;
  onClose: () => void;
  onCreate: (data: CreatePageDto) => Promise<Page>;
}

function CreatePageModal({ templateId, onClose, onCreate }: CreatePageModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      alert('Bitte Name und Slug eingeben');
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        templateId,
        name,
        slug,
        isActive: true,
      });
      onClose();
    } catch (error) {
      alert('Fehler beim Erstellen: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Neue Page erstellen</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Home"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. home"
              required
            />
            <p className="text-xs text-gray-500 mt-1">URL: /dashboard/{slug}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Erstellen...' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== EDIT PAGE MODAL ====================

interface EditPageModalProps {
  page: Page;
  onClose: () => void;
  onUpdate: (id: string, data: UpdatePageDto) => Promise<Page>;
  onDelete: (id: string) => Promise<void>;
}

function EditPageModal({ page, onClose, onUpdate, onDelete }: EditPageModalProps) {
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    try {
      await onUpdate(page.id, { name, slug });
      onClose();
    } catch (error) {
      alert('Fehler beim Aktualisieren');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Page "${page.name}" wirklich löschen?`)) return;

    setIsDeleting(true);
    try {
      await onDelete(page.id);
      onClose();
    } catch (error) {
      alert('Fehler beim Löschen');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Page bearbeiten</h2>

        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? 'Löschen...' : 'Löschen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
