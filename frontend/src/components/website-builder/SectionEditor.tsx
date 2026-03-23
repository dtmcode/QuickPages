/**
 * Section Editor Component
 * Rechte Sidebar für Content-Bearbeitung
 */

'use client';

import { useState, useEffect } from 'react';
import { Section, SectionContent, UpdateSectionDto } from '@/types/website-builder.types';
import { sectionsApi } from '@/lib/api-client';

interface SectionEditorProps {
  section: Section;
  onClose: () => void;
}

export function SectionEditor({ section, onClose }: SectionEditorProps) {
  const [content, setContent] = useState<SectionContent>(section.content);
  const [name, setName] = useState(section.name);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(section.content);
    setName(section.name);
    setHasChanges(false);
  }, [section]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await sectionsApi.update(section.id, {
        name,
        content,
      });
      setHasChanges(false);
    } catch (error) {
      alert('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Section bearbeiten</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setHasChanges(true);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Speichern...' : hasChanges ? '💾 Speichern' : '✓ Gespeichert'}
          </button>
        </div>
      </div>

      {/* Content Fields */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Hero Fields */}
          {(section.type === 'hero' || section.type === 'cta') && (
            <>
              <FormField
                label="Überschrift"
                value={content.heading || ''}
                onChange={(value) => updateContent('heading', value)}
              />
              <FormField
                label="Unterüberschrift"
                value={content.subheading || ''}
                onChange={(value) => updateContent('subheading', value)}
                multiline
              />
              <FormField
                label="Button Text"
                value={content.buttonText || ''}
                onChange={(value) => updateContent('buttonText', value)}
              />
              <FormField
                label="Button Link"
                value={content.buttonLink || ''}
                onChange={(value) => updateContent('buttonLink', value)}
              />
              <FormField
                label="Hintergrundbild URL"
                value={content.backgroundImage || ''}
                onChange={(value) => updateContent('backgroundImage', value)}
              />
            </>
          )}

          {/* Text/About Fields */}
          {(section.type === 'text' || section.type === 'about') && (
            <>
              <FormField
                label="Titel"
                value={content.title || ''}
                onChange={(value) => updateContent('title', value)}
              />
              <FormField
                label="Untertitel"
                value={content.subtitle || ''}
                onChange={(value) => updateContent('subtitle', value)}
              />
              <FormField
                label="Beschreibung"
                value={content.description || content.text || ''}
                onChange={(value) => updateContent('description', value)}
                multiline
                rows={6}
              />
            </>
          )}

          {/* Features/Services Fields */}
          {(section.type === 'features' || section.type === 'services') && (
            <>
              <FormField
                label="Titel"
                value={content.title || ''}
                onChange={(value) => updateContent('title', value)}
              />
              <FormField
                label="Untertitel"
                value={content.subtitle || ''}
                onChange={(value) => updateContent('subtitle', value)}
              />
              <ItemsEditor
                label="Items"
                items={content.items || []}
                onChange={(items) => updateContent('items', items)}
              />
            </>
          )}

          {/* Video Fields */}
          {section.type === 'video' && (
            <>
              <FormField
                label="Video URL"
                value={content.videoUrl || ''}
                onChange={(value) => updateContent('videoUrl', value)}
                placeholder="https://youtube.com/..."
              />
              <FormField
                label="Poster Image URL"
                value={content.videoPoster || ''}
                onChange={(value) => updateContent('videoPoster', value)}
              />
            </>
          )}

          {/* HTML Fields */}
          {section.type === 'html' && (
            <FormField
              label="HTML Code"
              value={content.html || ''}
              onChange={(value) => updateContent('html', value)}
              multiline
              rows={10}
              placeholder="<div>Ihr HTML hier</div>"
            />
          )}

          {/* Gallery */}
          {section.type === 'gallery' && (
            <>
              <FormField
                label="Titel"
                value={content.title || ''}
                onChange={(value) => updateContent('title', value)}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bilder</label>
                <p className="text-xs text-gray-500">
                  Hinweis: Gallery Editor noch nicht implementiert. Nutze JSON Editor.
                </p>
              </div>
            </>
          )}
        </div>

        {/* JSON Editor (Advanced) */}
        <details className="mt-6">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Advanced: JSON Editor
          </summary>
          <textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                setContent(JSON.parse(e.target.value));
                setHasChanges(true);
              } catch (err) {
                // Invalid JSON
              }
            }}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            rows={10}
          />
        </details>
      </div>
    </div>
  );
}

// ==================== FORM FIELD ====================

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

function FormField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={rows}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// ==================== ITEMS EDITOR ====================

interface ItemsEditorProps {
  label: string;
  items: Array<{ id?: string; title?: string; description?: string; icon?: string }>;
  onChange: (items: Array<{ id: string; title: string; description: string; icon?: string }>) => void;
}

function ItemsEditor({ label, items, onChange }: ItemsEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
        title: 'Neues Item',
        description: 'Beschreibung',
      },
    ]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          onClick={addItem}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Item hinzufügen
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
              <button
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Löschen
              </button>
            </div>

            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Titel"
              className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
            />

            <textarea
              value={item.description || ''}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="Beschreibung"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              rows={2}
            />

            <input
              type="text"
              value={item.icon || ''}
              onChange={(e) => updateItem(index, 'icon', e.target.value)}
              placeholder="Icon (optional)"
              className="w-full px-2 py-1 border border-gray-300 rounded mt-2 text-sm"
            />
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Noch keine Items vorhanden
          </p>
        )}
      </div>
    </div>
  );
}
