// 📂 PFAD: frontend/src/components/website-builder/SectionCard.tsx

'use client';

import { Section, SectionType } from '@/types/website-builder.types';

interface SectionCardProps {
  section: Section;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  compact?: boolean;
}

const SECTION_ICONS: Record<string, string> = {
  [SectionType.HERO]: '🎯',
  [SectionType.FEATURES]: '⭐',
  [SectionType.ABOUT]: '📖',
  [SectionType.SERVICES]: '🛠️',
  [SectionType.GALLERY]: '🖼️',
  [SectionType.TESTIMONIALS]: '💬',
  [SectionType.TEAM]: '👥',
  [SectionType.PRICING]: '💰',
  [SectionType.CTA]: '🎪',
  [SectionType.CONTACT]: '📧',
  [SectionType.FAQ]: '❓',
  [SectionType.BLOG]: '📰',
  [SectionType.STATS]: '📊',
  [SectionType.VIDEO]: '🎬',
  [SectionType.TEXT]: '📝',
  [SectionType.HTML]: '🧩',
  [SectionType.CUSTOM]: '⚙️',
};

const SECTION_COLORS: Record<string, string> = {
  [SectionType.HERO]: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  [SectionType.FEATURES]: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  [SectionType.CTA]: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  [SectionType.CONTACT]: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  [SectionType.PRICING]: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
};

export function SectionCard({
  section,
  isSelected = false,
  isDragging = false,
  onClick,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  compact = false,
}: SectionCardProps) {
  const icon = SECTION_ICONS[section.type] || '📦';
  const colorClass = SECTION_COLORS[section.type] || 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700';
  const heading = section.content?.heading || section.content?.title || section.name;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
            : `${colorClass} hover:shadow-md`
        } ${isDragging ? 'opacity-50 scale-95' : ''} ${!section.isActive ? 'opacity-50' : ''}`}
      >
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{section.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{section.type}</p>
        </div>
        {!section.isActive && (
          <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
            Hidden
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/30'
          : `${colorClass} hover:shadow-lg hover:-translate-y-0.5`
      } ${isDragging ? 'opacity-50 scale-95 rotate-1' : ''} ${!section.isActive ? 'opacity-50' : ''}`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{section.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{section.type}</span>
          </div>
        </div>

        {/* Order Badge */}
        <span className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600 font-mono">
          #{section.order + 1}
        </span>
      </div>

      {/* Preview Content */}
      {heading && heading !== section.name && (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-3">
          {heading}
        </p>
      )}

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onToggleVisibility && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/50 dark:hover:bg-gray-800/50"
            title={section.isActive ? 'Verbergen' : 'Anzeigen'}
          >
            {section.isActive ? '👁️' : '🙈'}
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-800/50"
            title="Duplizieren"
          >
            📋
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-white/50 dark:hover:bg-gray-800/50"
            title="Löschen"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}