// 📂 PFAD: frontend/src/components/website-builder/TemplateEditor.tsx

'use client';

import { useState, useEffect } from 'react';
import { Template, TemplateSettings, UpdateTemplateDto } from '@/types/website-builder.types';
import { templatesApi } from '@/lib/api-client';

interface TemplateEditorProps {
  template: Template;
  onSave?: (updated: Template) => void;
  onClose?: () => void;
}

const DEFAULT_SETTINGS: TemplateSettings = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  spacing: {
    default: 'normal',
  },
};

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Raleway',
  'Nunito',
  'DM Sans',
];

const SPACING_OPTIONS = [
  { value: 'compact', label: 'Kompakt', description: 'Weniger Abstand zwischen Sections' },
  { value: 'normal', label: 'Normal', description: 'Standard-Abstände' },
  { value: 'relaxed', label: 'Großzügig', description: 'Mehr Weißraum' },
];

const PRESET_THEMES = [
  { name: 'Modern Blue', colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' } },
  { name: 'Dark Mode', colors: { primary: '#8b5cf6', secondary: '#6d28d9', accent: '#22d3ee', background: '#0f172a', text: '#f1f5f9' } },
  { name: 'Nature', colors: { primary: '#16a34a', secondary: '#15803d', accent: '#eab308', background: '#fefce8', text: '#1c1917' } },
  { name: 'Coral', colors: { primary: '#f43f5e', secondary: '#e11d48', accent: '#f97316', background: '#fff1f2', text: '#1f2937' } },
  { name: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#a78bfa', background: '#f0f9ff', text: '#0c4a6e' } },
  { name: 'Minimal', colors: { primary: '#18181b', secondary: '#3f3f46', accent: '#a1a1aa', background: '#ffffff', text: '#18181b' } },
];

export function TemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [settings, setSettings] = useState<TemplateSettings>(
    { ...DEFAULT_SETTINGS, ...template.settings }
  );
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'info' | 'presets'>('design');

  useEffect(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...template.settings });
    setName(template.name);
    setDescription(template.description || '');
    setHasChanges(false);
  }, [template]);

  const updateColor = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateFont = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateSpacing = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      spacing: { default: value },
    }));
    setHasChanges(true);
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...preset.colors },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: UpdateTemplateDto = {
        name,
        description: description || undefined,
        settings,
      };
      const updated = await templatesApi.update(template.id, data);
      setHasChanges(false);
      onSave?.(updated);
    } catch (error) {
      alert('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Template bearbeiten</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Speichern...' : hasChanges ? '💾 Änderungen speichern' : '✓ Gespeichert'}
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { id: 'design', label: '🎨 Design' },
            { id: 'info', label: '📋 Info' },
            { id: 'presets', label: '✨ Presets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Colors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Farben</h3>
              <div className="space-y-3">
                {[
                  { key: 'primary', label: 'Primärfarbe' },
                  { key: 'secondary', label: 'Sekundärfarbe' },
                  { key: 'accent', label: 'Akzentfarbe' },
                  { key: 'background', label: 'Hintergrund' },
                  { key: 'text', label: 'Textfarbe' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(settings.colors as any)?.[key] || '#000000'}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                      <input
                        type="text"
                        value={(settings.colors as any)?.[key] || ''}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none p-0 font-mono w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Schriftarten</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Überschriften</label>
                  <select
                    value={settings.fonts?.heading || 'Inter'}
                    onChange={(e) => updateFont('heading', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fließtext</label>
                  <select
                    value={settings.fonts?.body || 'Inter'}
                    onChange={(e) => updateFont('body', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Abstände</h3>
              <div className="space-y-2">
                {SPACING_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      settings.spacing?.default === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="spacing"
                      checked={settings.spacing?.default === option.value}
                      onChange={() => updateSpacing(option.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Kurze Beschreibung des Templates..."
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">ID:</span> <span className="font-mono text-xs">{template.id}</span></p>
              <p><span className="text-gray-500">Erstellt:</span> {new Date(template.createdAt).toLocaleDateString('de-DE')}</p>
              <p><span className="text-gray-500">Aktualisiert:</span> {new Date(template.updatedAt).toLocaleDateString('de-DE')}</p>
              <p><span className="text-gray-500">Standard:</span> {template.isDefault ? '✅ Ja' : '❌ Nein'}</p>
              <p><span className="text-gray-500">Aktiv:</span> {template.isActive ? '✅ Ja' : '❌ Nein'}</p>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Klicke auf ein Preset, um die Farben zu übernehmen.
            </p>
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{preset.name}</span>
                </div>
                <div className="flex gap-2">
                  {Object.values(preset.colors).map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}