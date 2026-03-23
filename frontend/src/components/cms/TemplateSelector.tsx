'use client';

import { useState } from 'react';
import { pageTemplates, PageTemplate } from '@/lib/templates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TemplateSelectorProps {
  onSelect: (template: PageTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);

  const categories = [
    { id: 'all', name: 'Alle', icon: '📦' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'info', name: 'Information', icon: 'ℹ️' },
    { id: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
    { id: 'other', name: 'Andere', icon: '🔧' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? pageTemplates
    : pageTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📄 Template auswählen
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Wähle ein Template oder starte mit einer leeren Seite
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id
                    ? 'ring-2 ring-cyan-500'
                    : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-0">
                  {/* Preview */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                    <span className="text-6xl">{template.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {selectedTemplate?.id === template.id && (
                        <span className="text-cyan-500">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400">
                Keine Templates in dieser Kategorie
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTemplate ? (
                <span>
                  Template <strong>{selectedTemplate.name}</strong> ausgewählt
                </span>
              ) : (
                'Wähle ein Template aus'
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Abbrechen
              </Button>
              <Button
                onClick={() => selectedTemplate && onSelect(selectedTemplate)}
                disabled={!selectedTemplate}
              >
                Template verwenden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}