'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MEDIA_FILES_QUERY = gql`
  query MediaFiles($type: String, $folder: String, $search: String, $limit: Int) {
    mediaFiles(type: $type, folder: $folder, search: $search, limit: $limit) {
      id
      filename
      originalFilename
      mimeType
      fileSize
      type
      url
      thumbnailUrl
      alt
      title
      folder
      tags
      width
      height
      createdAt
    }
    mediaFolders
  }
`;

const UPLOAD_MEDIA = gql`
  mutation UploadMedia($file: Upload!, $folder: String, $alt: String, $title: String) {
    uploadMedia(file: $file, folder: $folder, alt: $alt, title: $title) {
      id
      url
    }
  }
`;

const UPDATE_MEDIA = gql`
  mutation UpdateMedia($id: String!, $input: UpdateMediaInput!) {
    updateMedia(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: String!) {
    deleteMedia(id: $id)
  }
`;

export default function MediaLibraryPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, loading, refetch } = useQuery(MEDIA_FILES_QUERY, {
    variables: {
      type: typeFilter || undefined,
      folder: folderFilter || undefined,
      search: searchTerm || undefined,
      limit: 100,
    },
  });

  const [uploadMedia, { loading: uploading }] = useMutation(UPLOAD_MEDIA);
  const [updateMedia] = useMutation(UPDATE_MEDIA);
  const [deleteMedia] = useMutation(DELETE_MEDIA);

  const files = data?.mediaFiles || [];
  const folders = data?.mediaFolders || [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    for (const file of Array.from(uploadedFiles)) {
      try {
        await uploadMedia({
          variables: {
            file,
            folder: folderFilter || 'general',
          },
        });
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Fehler beim Upload von ${file.name}`);
      }
    }

    refetch();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`"${filename}" wirklich löschen?`)) return;

    try {
      await deleteMedia({ variables: { id } });
      alert('✅ Datei gelöscht!');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Löschen');
    }
  };

  const handleEdit = (file: any) => {
    setSelectedFile(file);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedFile) return;

    try {
      await updateMedia({
        variables: {
          id: selectedFile.id,
          input: {
            alt: selectedFile.alt,
            title: selectedFile.title,
            folder: selectedFile.folder,
          },
        },
      });
      alert('✅ Gespeichert!');
      setShowEditModal(false);
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Speichern');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    alert('✅ URL kopiert!');
  };

  if (loading) {
    return <div className="text-center py-12">Lädt Media Library...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🖼️ Media Library
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Bilder, Videos und Dateien
          </p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Files'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Suche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Alle Typen</option>
              <option value="image">Bilder</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Dokumente</option>
            </select>
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Alle Ordner</option>
              {folders.map((folder: string) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🔲
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                📋
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Noch keine Dateien
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Lade deine erste Datei hoch
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              📤 Jetzt hochladen
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file: any) => (
            <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative group">
                {file.type === 'image' ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.alt || file.originalFilename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {file.type === 'video' ? '🎥' : 
                     file.type === 'audio' ? '🎵' : 
                     file.type === 'document' ? '📄' : '📦'}
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.url)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="URL kopieren"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => handleEdit(file)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.originalFilename)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.originalFilename}>
                  {file.originalFilename}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.fileSize)}
                  {file.width && ` • ${file.width}x${file.height}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Typ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Größe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file: any) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                        {file.type === 'image' ? (
                          <img
                            src={file.thumbnailUrl || file.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {file.type === 'video' ? '🎥' : 
                             file.type === 'audio' ? '🎵' : 
                             file.type === 'document' ? '📄' : '📦'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.originalFilename}
                      </p>
                      {file.alt && (
                        <p className="text-xs text-gray-500">{file.alt}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(file.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="text-sm text-cyan-600 hover:text-cyan-800"
                      >
                        🔗
                      </button>
                      <button
                        onClick={() => handleEdit(file)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(file.id, file.originalFilename)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>📝 Datei bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {selectedFile.type === 'image' ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.alt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {selectedFile.type === 'video' ? '🎥' : 
                     selectedFile.type === 'audio' ? '🎵' : 
                     selectedFile.type === 'document' ? '📄' : '📦'}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dateiname</label>
                  <input
                    type="text"
                    value={selectedFile.originalFilename}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Titel</label>
                  <input
                    type="text"
                    value={selectedFile.title || ''}
                    onChange={(e) => setSelectedFile({ ...selectedFile, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Alt Text (SEO)</label>
                  <input
                    type="text"
                    value={selectedFile.alt || ''}
                    onChange={(e) => setSelectedFile({ ...selectedFile, alt: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ordner</label>
                  <input
                    type="text"
                    value={selectedFile.folder || ''}
                    onChange={(e) => setSelectedFile({ ...selectedFile, folder: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">URL:</span>
                    <button
                      onClick={() => copyUrl(selectedFile.url)}
                      className="text-cyan-600 hover:text-cyan-800"
                    >
                      Kopieren
                    </button>
                  </div>
                  <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded break-all">
                    {window.location.origin}{selectedFile.url}
                  </code>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Größe:</span>
                      <div className="font-medium">{formatFileSize(selectedFile.fileSize)}</div>
                    </div>
                    {selectedFile.width && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Abmessungen:</span>
                        <div className="font-medium">{selectedFile.width}x{selectedFile.height}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveEdit} fullWidth>
                  💾 Speichern
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}