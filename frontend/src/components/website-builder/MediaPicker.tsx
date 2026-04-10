'use client';

import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const MEDIA_FILES_QUERY = gql`
  query MediaPickerFiles($type: String, $search: String) {
    mediaFiles(type: $type, search: $search, limit: 50) {
      id url thumbnailUrl originalFilename fileSize width height
    }
  }
`;

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  type?: 'image' | 'video' | 'all';
}

export function MediaPicker({ onSelect, onClose, type = 'image' }: MediaPickerProps) {
  const [search, setSearch] = useState('');

  const C = {
    bg: '#010409',
    panel: '#161b22',
    border: '#21262d',
    text: '#c9d1d9',
    muted: '#6e7681',
    accent: '#58a6ff',
  };

  const { data, loading } = useQuery(MEDIA_FILES_QUERY, {
    variables: {
      type: type === 'all' ? undefined : type,
      search: search || undefined,
    },
  });

  const files: any[] = data?.mediaFiles || [];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          width: '90%', maxWidth: 800, maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e6edf3', flex: 1 }}>
            🖼️ Bild auswählen
          </span>
          <input
            type="text"
            placeholder="🔍 Suche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.text, padding: '6px 10px', fontSize: '0.8rem', outline: 'none', width: 200,
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.2rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {loading && (
            <div style={{ textAlign: 'center', color: C.muted, padding: '3rem' }}>
              ⟳ Lädt...
            </div>
          )}

          {!loading && files.length === 0 && (
            <div style={{ textAlign: 'center', color: C.muted, padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📁</div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Keine Bilder gefunden.<br />
                Lade zuerst Bilder in die Media Library hoch.
              </p>
            </div>
          )}

          {!loading && files.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 8,
            }}>
              {files.map((file: any) => (
                <div
                  key={file.id}
                  onClick={() => { onSelect(file.url); onClose(); }}
                  style={{
                    aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                    cursor: 'pointer', border: `2px solid ${C.border}`,
                    background: '#0d1117', position: 'relative',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                >
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.originalFilename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                    padding: '16px 6px 6px',
                  }}>
                    <p style={{
                      fontSize: '0.6rem', color: '#c9d1d9', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {file.originalFilename}
                    </p>
                    {file.width && (
                      <p style={{ fontSize: '0.55rem', color: C.muted, margin: 0 }}>
                        {file.width}×{file.height} · {formatFileSize(file.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.72rem', color: C.muted }}>
            {files.length} {files.length === 1 ? 'Bild' : 'Bilder'}
          </span>
          <a
            href="/dashboard/media"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.72rem', color: C.accent, textDecoration: 'none' }}
          >
            Media Library öffnen ↗
          </a>
        </div>
      </div>
    </div>
  );
}