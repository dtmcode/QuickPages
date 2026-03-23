'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface PublicComment {
  id: string;
  author_name: string;
  author_website: string | null;
  content: string;
  is_pinned: boolean;
  created_at: string;
  replies: PublicComment[];
}

interface BlogCommentsProps {
  tenant: string;
  postId: string;
}

// ==================== COMPONENT ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function BlogComments({ tenant, postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);

  // New comment form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reply state
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/public/${tenant}/comments/${postId}`);
      if (!res.ok) throw new Error('Fehler');
      const data: PublicComment[] = await res.json();
      setComments(data);
    } catch {
      console.error('Kommentare konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [tenant, postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitComment = async (parentId?: string) => {
    const body = parentId
      ? { authorName: name, authorEmail: email, content: replyContent, parentId }
      : { authorName: name, authorEmail: email, content };

    if (!name || !email || !(parentId ? replyContent : content)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/${tenant}/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Fehler beim Absenden');
      setSuccessMsg('Kommentar eingereicht! Er wird nach Prüfung angezeigt.');
      if (parentId) {
        setReplyContent('');
        setReplyTo(null);
      } else {
        setContent('');
      }
      loadComments();
    } catch {
      setSuccessMsg('Fehler beim Absenden des Kommentars.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  // ==================== HELPERS ====================
  const initials = (authorName: string) =>
    authorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tagen`;
  };

  // ==================== RENDER COMMENT ====================
  const renderComment = (comment: PublicComment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className={`py-4 ${comment.is_pinned ? 'bg-yellow-50 -mx-2 px-2 rounded-lg' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
            {initials(comment.author_name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {comment.author_website ? (
                <a href={comment.author_website} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 text-sm hover:underline">
                  {comment.author_name}
                </a>
              ) : (
                <span className="font-semibold text-gray-900 text-sm">{comment.author_name}</span>
              )}
              <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
              {comment.is_pinned && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">📌</span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>

            {/* Reply button - max 2 levels */}
            {depth < 2 && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs text-gray-400 hover:text-blue-600 mt-2"
              >
                Antworten
              </button>
            )}

            {/* Inline reply form */}
            {replyTo === comment.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Antwort schreiben..."
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitComment(comment.id)}
                    disabled={!replyContent || !name || !email || submitting}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Antworten
                  </button>
                  <button onClick={() => setReplyTo(null)} className="px-3 py-1 text-xs text-gray-500 hover:underline">
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto" />
      </div>
    );
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Kommentare ({comments.length})
      </h3>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-blue-50 text-blue-700 text-sm rounded-lg px-4 py-3 mb-4">
          {successMsg}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Kommentar schreiben</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name *"
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail *"
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ihr Kommentar..."
          className="w-full border rounded-lg px-3 py-2 text-sm bg-white resize-none"
          rows={3}
        />
        <button
          onClick={() => submitComment()}
          disabled={!name || !email || !content || submitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Wird gesendet...' : 'Absenden'}
        </button>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Noch keine Kommentare. Seien Sie der Erste!
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((c) => renderComment(c))}
        </div>
      )}
    </section>
  );
}