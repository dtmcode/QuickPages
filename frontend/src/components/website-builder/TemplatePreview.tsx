// 📂 PFAD: frontend/src/components/website-builder/TemplatePreview.tsx

'use client';

import { useState, useMemo } from 'react';
import { Template, Page, Section, TemplateSettings, SectionType } from '@/types/website-builder.types';

interface TemplatePreviewProps {
  template?: Template;
  page?: Page;
  sections?: Section[];
  settings?: TemplateSettings;
  mode?: 'desktop' | 'tablet' | 'mobile';
  onModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  showToolbar?: boolean;
  onSectionClick?: (section: Section) => void;
  selectedSectionId?: string;
  className?: string;
}

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function TemplatePreview({
  template,
  page,
  sections = [],
  settings,
  mode = 'desktop',
  onModeChange,
  showToolbar = true,
  onSectionClick,
  selectedSectionId,
  className = '',
}: TemplatePreviewProps) {
  const [internalMode, setInternalMode] = useState(mode);
  const currentMode = onModeChange ? mode : internalMode;
  const handleModeChange = onModeChange || setInternalMode;

  const effectiveSettings = settings || template?.settings || {};
  const effectiveSections = sections.length > 0 ? sections : page?.sections || [];
  const sortedSections = [...effectiveSections].filter(s => s.isActive).sort((a, b) => a.order - b.order);

  const containerStyle = useMemo(() => ({
    fontFamily: effectiveSettings.fonts?.body || 'Inter, system-ui, sans-serif',
    color: effectiveSettings.colors?.text || '#1f2937',
    backgroundColor: effectiveSettings.colors?.background || '#ffffff',
  }), [effectiveSettings]);

  return (
    <div className={`flex flex-col h-full bg-gray-100 dark:bg-gray-950 ${className}`}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Preview:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {page?.name || template?.name || 'Untitled'}
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleModeChange('desktop')}
              className={`p-2 rounded-md transition-colors ${
                currentMode === 'desktop'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Desktop"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => handleModeChange('tablet')}
              className={`p-2 rounded-md transition-colors ${
                currentMode === 'tablet'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Tablet"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => handleModeChange('mobile')}
              className={`p-2 rounded-md transition-colors ${
                currentMode === 'mobile'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Mobile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-gray-400">
            {sortedSections.length} Sections
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: DEVICE_WIDTHS[currentMode],
            maxWidth: '100%',
            minHeight: '400px',
            ...containerStyle,
          }}
        >
          {sortedSections.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-center">
              <div>
                <div className="text-5xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Keine Sections vorhanden</h3>
                <p className="text-sm text-gray-400">Füge Sections hinzu, um eine Vorschau zu sehen.</p>
              </div>
            </div>
          ) : (
            sortedSections.map((section) => (
              <div
                key={section.id}
                onClick={() => onSectionClick?.(section)}
                className={`relative group transition-all ${
                  onSectionClick ? 'cursor-pointer' : ''
                } ${
                  selectedSectionId === section.id
                    ? 'ring-2 ring-blue-500 ring-inset'
                    : onSectionClick ? 'hover:ring-2 hover:ring-blue-300 hover:ring-inset' : ''
                }`}
              >
                {/* Section Label (on hover) */}
                {onSectionClick && (
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                      {section.name} ({section.type})
                    </span>
                  </div>
                )}

                <PreviewSection
                  section={section}
                  settings={effectiveSettings}
                  isMobile={currentMode === 'mobile'}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION PREVIEW RENDERERS ====================

interface PreviewSectionProps {
  section: Section;
  settings: TemplateSettings;
  isMobile: boolean;
}

function PreviewSection({ section, settings, isMobile }: PreviewSectionProps) {
  const { content, styling, type } = section;
  const primaryColor = settings.colors?.primary || '#3b82f6';
  const headingFont = settings.fonts?.heading || 'inherit';

  const sectionStyle: React.CSSProperties = {
    backgroundColor: styling?.backgroundColor || 'transparent',
    color: styling?.textColor || 'inherit',
    padding: styling?.padding ? `${styling.padding.top || '3rem'} ${styling.padding.right || '1rem'} ${styling.padding.bottom || '3rem'} ${styling.padding.left || '1rem'}` : '3rem 1rem',
  };

  switch (type) {
    case SectionType.HERO:
      return (
        <div style={{ ...sectionStyle, background: styling?.backgroundColor || `linear-gradient(135deg, ${primaryColor}, ${settings.colors?.secondary || '#6366f1'})`, color: '#ffffff', padding: isMobile ? '3rem 1rem' : '5rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 'bold', marginBottom: '1rem', fontFamily: headingFont }}>{content.heading || 'Willkommen'}</h1>
            {content.subheading && <p style={{ fontSize: isMobile ? '1rem' : '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>{content.subheading}</p>}
            {content.buttonText && (
              <span style={{ display: 'inline-block', padding: '0.75rem 2rem', backgroundColor: '#ffffff', color: primaryColor, borderRadius: '0.5rem', fontWeight: 600 }}>
                {content.buttonText}
              </span>
            )}
          </div>
        </div>
      );

    case SectionType.FEATURES:
    case SectionType.SERVICES:
      return (
        <div style={sectionStyle}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {content.title && <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', fontFamily: headingFont }}>{content.title}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {(content.items || []).slice(0, 6).map((item: any, i: number) => (
                <div key={i} style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  {item.icon && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>}
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontFamily: headingFont }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case SectionType.CTA:
      return (
        <div style={{ ...sectionStyle, backgroundColor: styling?.backgroundColor || primaryColor, color: '#ffffff', textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', fontFamily: headingFont }}>{content.heading || 'Bereit?'}</h2>
          {content.subheading && <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>{content.subheading}</p>}
          {content.buttonText && (
            <span style={{ display: 'inline-block', padding: '0.75rem 2rem', backgroundColor: '#ffffff', color: primaryColor, borderRadius: '0.5rem', fontWeight: 600 }}>
              {content.buttonText}
            </span>
          )}
        </div>
      );

    case SectionType.TESTIMONIALS:
      return (
        <div style={sectionStyle}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {content.title && <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', fontFamily: headingFont }}>{content.title}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {(content.testimonials || []).slice(0, 4).map((t: any, i: number) => (
                <div key={i} style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(0,0,0,0.03)', fontStyle: 'italic' }}>
                  <p style={{ marginBottom: '1rem' }}>&ldquo;{t.text}&rdquo;</p>
                  <p style={{ fontWeight: 600, fontStyle: 'normal' }}>— {t.name}{t.role ? `, ${t.role}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case SectionType.CONTACT:
      return (
        <div style={sectionStyle}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', fontFamily: headingFont }}>{content.title || 'Kontakt'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', textAlign: 'left', color: '#9ca3af' }}>Name</div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', textAlign: 'left', color: '#9ca3af' }}>Email</div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', textAlign: 'left', color: '#9ca3af', minHeight: '80px' }}>Nachricht</div>
              <div style={{ padding: '0.75rem', backgroundColor: primaryColor, color: '#ffffff', borderRadius: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Absenden</div>
            </div>
          </div>
        </div>
      );

    case SectionType.FAQ:
      return (
        <div style={sectionStyle}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {content.title && <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', fontFamily: headingFont }}>{content.title}</h2>}
            {(content.faqs || []).map((faq: any, i: number) => (
              <div key={i} style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{faq.question}</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case SectionType.ABOUT:
    case SectionType.TEXT:
      return (
        <div style={sectionStyle}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {content.title && <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', fontFamily: headingFont }}>{content.title}</h2>}
            {(content.description || content.text) && <p style={{ lineHeight: 1.7, opacity: 0.8 }}>{content.description || content.text}</p>}
          </div>
        </div>
      );

    case SectionType.STATS:
      return (
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {content.title && <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', fontFamily: headingFont }}>{content.title}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${Math.min((content.stats || []).length, 4)}, 1fr)`, gap: '2rem' }}>
              {(content.stats || []).map((stat: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: primaryColor }}>{stat.value}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ ...sectionStyle, textAlign: 'center', opacity: 0.5 }}>
          <p style={{ fontSize: '0.875rem' }}>
            [{section.type.toUpperCase()}] {section.name}
          </p>
        </div>
      );
  }
}