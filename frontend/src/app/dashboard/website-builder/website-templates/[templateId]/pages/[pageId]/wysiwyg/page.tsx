// 📂 PFAD: frontend/src/app/dashboard/website-builder/website-templates/[templateId]/pages/[pageId]/wysiwyg/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { WysiwygEditor } from '@/components/website-builder/WysiwygEditor';

export default function WysiwygEditorPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const templateId = params.templateId as string;

  if (!pageId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#010409', color: '#c9d1d9', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#e6edf3' }}>Ungültige Seite</h2>
          <p style={{ color: '#6e7681' }}>Keine pageId gefunden.</p>
        </div>
      </div>
    );
  }

  return <WysiwygEditor pageId={pageId} templateId={templateId} />;
}