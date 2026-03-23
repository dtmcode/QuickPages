'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface Comment {
  id: string;
  post_id: string;
  post_title: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  author_website: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  is_pinned: boolean;
  created_at: string;
  reply_count: number;
}

interface CommentCounts {
  pending: number;
  approved: number;
  spam: number;
  trash: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ==================== GRAPHQL HELPER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== COMPONENT ====================
export default function CommentsDashboardPage() {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'spam' | 'trash'>('pending');
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState<CommentCounts>({ pending: 0, approved: 0, spam: 0, trash: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadComments = useCallback(async () => {
    try {
      const data = await gqlRequest<{
        comments: Comment[];
        commentCounts: CommentCounts;
      }>(`
        query($status: String!) {
          comments(status: $status) {
            id post_id post_title parent_id author_name author_email author_website
            content status is_pinned created_at reply_count
          }
          commentCounts { pending approved spam trash }
        }
      `, { status: statusTab });
      setComments(data.comments);
      setCounts(data.commentCounts);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ==================== ACTIONS ====================
  const moderateComment = async (id: string, action: string) => {
    try {
      await gqlRequest(`
        mutation($id: String!, $action: String!) {
          moderateComment(commentId: $id, action: $action) { id status }
        }
      `, { id, action });
      showToast(`Kommentar: ${action}`);
      loadComments();
    } catch {
      showToast('Fehler beim Moderieren', 'error');
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      await gqlRequest(`
        mutation($id: String!, $pinned: Boolean!) {
          pinComment(commentId: $id, pinned: $pinned) { id is_pinned }
        }
      `, { id, pinned: !isPinned });
      showToast(isPinned ? 'Pin entfernt' : 'Kommentar angepinnt');
      loadComments();
    } catch {
      showToast('Fehler', 'error');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Kommentar endgültig löschen?')) return;
    try {
      await gqlRequest(`mutation($id: String!) { deleteComment(commentId: $id) }`, { id });
      showToast('Kommentar gelöscht');
      loadComments();
    } catch {
      showToast('Fehler beim Löschen', 'error');
    }
  };

  // ==================== HELPERS ====================
  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tagen`;
  };

  const tabs: Array<{ key: 'pending' | 'approved' | 'spam' | 'trash'; label: string }> = [
    { key: 'pending', label: 'Ausstehend' },
    { key: 'approved', label: 'Genehmigt' },
    { key: 'spam', label: 'Spam' },
    { key: 'trash', label: 'Papierkorb' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Kommentar-Moderation</h1>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                statusTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  statusTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Keine Kommentare in dieser Kategorie</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg border p-4 ${
                comment.is_pinned ? 'ring-2 ring-yellow-300' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                  {initials(comment.author_name)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{comment.author_name}</span>
                    <span className="text-xs text-gray-400">{comment.author_email}</span>
                    {comment.is_pinned && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📌 Angepinnt</span>
                    )}
                    {comment.parent_id && (
                      <span className="text-xs text-gray-400">↩ Antwort</span>
                    )}
                  </div>

                  {/* Post Reference */}
                  <p className="text-xs text-gray-400 mt-0.5">
                    zu: {comment.post_title} &middot; {timeAgo(comment.created_at)}
                  </p>

                  {/* Content */}
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-3 pt-2 border-t">
                    {statusTab === 'pending' && (
                      <>
                        <button onClick={() => moderateComment(comment.id, 'approve')} className="text-xs text-green-600 hover:underline">
                          Genehmigen
                        </button>
                        <button onClick={() => moderateComment(comment.id, 'spam')} className="text-xs text-orange-600 hover:underline">
                          Spam
                        </button>
                        <button onClick={() => moderateComment(comment.id, 'trash')} className="text-xs text-red-600 hover:underline">
                          Ablehnen
                        </button>
                      </>
                    )}
                    {statusTab === 'approved' && (
                      <>
                        <button onClick={() => togglePin(comment.id, comment.is_pinned)} className="text-xs text-yellow-600 hover:underline">
                          {comment.is_pinned ? 'Pin entfernen' : 'Anpinnen'}
                        </button>
                        <button onClick={() => moderateComment(comment.id, 'spam')} className="text-xs text-orange-600 hover:underline">
                          Spam
                        </button>
                        <button onClick={() => moderateComment(comment.id, 'trash')} className="text-xs text-red-600 hover:underline">
                          Papierkorb
                        </button>
                      </>
                    )}
                    {statusTab === 'spam' && (
                      <>
                        <button onClick={() => moderateComment(comment.id, 'approve')} className="text-xs text-green-600 hover:underline">
                          Wiederherstellen
                        </button>
                        <button onClick={() => deleteComment(comment.id)} className="text-xs text-red-600 hover:underline">
                          Endgültig löschen
                        </button>
                      </>
                    )}
                    {statusTab === 'trash' && (
                      <>
                        <button onClick={() => moderateComment(comment.id, 'approve')} className="text-xs text-green-600 hover:underline">
                          Wiederherstellen
                        </button>
                        <button onClick={() => deleteComment(comment.id)} className="text-xs text-red-600 hover:underline">
                          Endgültig löschen
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}