'use client';
// 📂 PFAD: frontend-public/src/app/support/page.tsx

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Message {
  id: string;
  authorName: string;
  content: string;
  isStaff: boolean;
  createdAt: string;
}

interface TicketStatus {
  ticket: {
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  };
  messages: Message[];
}

type View = 'menu' | 'create' | 'track' | 'success' | 'ticket';

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  waiting: 'Antwort ausstehend',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

export default function SupportPage() {
  const [tenantSlug, setTenantSlug] = useState('demo');
  const [view, setView] = useState<View>('menu');
  const [createdToken, setCreatedToken] = useState('');
  const [createdNumber, setCreatedNumber] = useState('');
  const [trackToken, setTrackToken] = useState('');
  const [ticketData, setTicketData] = useState<TicketStatus | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    message: '',
    priority: 'normal',
  });

useEffect(() => {
  const slug = document.documentElement.dataset.tenant || 
               window.location.hostname.split('.')[0] || 
               'demo';
  setTenantSlug(slug);
}, []);

  const submitTicket = async () => {
    if (!form.customerName || !form.customerEmail || !form.subject || !form.message) {
      setError('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/public/${tenantSlug}/support/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success: boolean; ticketNumber: string; token: string };
      if (!res.ok) throw new Error('Fehler beim Senden');
      setCreatedToken(data.token);
      setCreatedNumber(data.ticketNumber);
      setView('success');
    } catch {
      setError('Ticket konnte nicht erstellt werden. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const trackTicket = async () => {
    if (!trackToken.trim()) { setError('Bitte Token eingeben.'); return; }
    setTracking(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/public/${tenantSlug}/support/ticket/${trackToken}`);
      if (!res.ok) throw new Error('Ticket nicht gefunden');
      const data = await res.json() as TicketStatus;
      setTicketData(data);
      setView('ticket');
    } catch {
      setError('Ticket nicht gefunden. Bitte prüfe deinen Token.');
    } finally {
      setTracking(false);
    }
  };

  const sendReply = async () => {
    if (!ticketData || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/public/${tenantSlug}/support/ticket/${trackToken}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: ticketData.ticket.ticketNumber,
          authorEmail: '',
          content: replyContent,
        }),
      });
      setReplyContent('');
      await trackTicket();
    } catch {
      setError('Antwort konnte nicht gesendet werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `vor ${hours} Std.`;
    return `vor ${Math.floor(diff / 60000)} Min.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🎫
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500 mt-2">Wie können wir dir helfen?</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* ===== MENU ===== */}
        {view === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => { setView('create'); setError(''); }}
              className="w-full bg-white rounded-2xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">✉️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Neues Ticket erstellen</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Schildere dein Problem — wir melden uns schnell</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </button>

            <button
              onClick={() => { setView('track'); setError(''); }}
              className="w-full bg-white rounded-2xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">🔍</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Ticket-Status prüfen</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Bestehende Anfrage verfolgen & antworten</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </button>
          </div>
        )}

        {/* ===== CREATE FORM ===== */}
        {view === 'create' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setView('menu')} className="text-sm text-blue-600 hover:underline">← Zurück</button>
              <h2 className="font-semibold text-gray-900">Neues Ticket</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="max@beispiel.de"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betreff <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kurze Beschreibung des Problems"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Niedrig</option>
                <option value="normal">Normal</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht <span className="text-red-500">*</span></label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Beschreibe dein Problem so detailliert wie möglich..."
              />
            </div>

            <button
              onClick={() => void submitTicket()}
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Wird gesendet...' : 'Ticket absenden'}
            </button>
          </div>
        )}

        {/* ===== SUCCESS ===== */}
        {view === 'success' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket erstellt!</h2>
            <p className="text-gray-500 mb-6">Wir haben deine Anfrage erhalten und melden uns so schnell wie möglich.</p>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-blue-700 font-medium mb-1">Ticket-Nummer</p>
              <p className="text-xl font-bold text-blue-900">{createdNumber}</p>
              <p className="text-xs text-blue-600 mt-2">
                Speichere diesen Token um deinen Status zu verfolgen:
              </p>
              <p className="font-mono text-sm bg-white rounded-lg p-2 mt-1 text-gray-700 break-all">{createdToken}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setTrackToken(createdToken); setView('track'); }}
                className="flex-1 py-2.5 border border-blue-300 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-50"
              >
                Status verfolgen
              </button>
              <button
                onClick={() => { setView('menu'); setForm({ customerName: '', customerEmail: '', subject: '', message: '', priority: 'normal' }); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                Neues Ticket
              </button>
            </div>
          </div>
        )}

        {/* ===== TRACK ===== */}
        {view === 'track' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => { setView('menu'); setError(''); }} className="text-sm text-blue-600 hover:underline">← Zurück</button>
              <h2 className="font-semibold text-gray-900">Ticket verfolgen</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dein Token</label>
              <input
                type="text"
                value={trackToken}
                onChange={(e) => setTrackToken(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dein Ticket-Token"
              />
            </div>
            <button
              onClick={() => void trackTicket()}
              disabled={tracking}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {tracking ? 'Sucht...' : 'Ticket anzeigen'}
            </button>
          </div>
        )}

        {/* ===== TICKET VIEW ===== */}
        {view === 'ticket' && ticketData && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Ticket Info */}
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => { setView('track'); setError(''); }} className="text-sm text-blue-600 hover:underline">← Zurück</button>
              </div>
              <div className="flex items-start justify-between gap-3 mt-2">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{ticketData.ticket.ticketNumber}</p>
                  <h2 className="font-semibold text-gray-900">{ticketData.ticket.subject}</h2>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[ticketData.ticket.status]}`}>
                  {STATUS_LABELS[ticketData.ticket.status] || ticketData.ticket.status}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {ticketData.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.isStaff
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${msg.isStaff ? 'text-gray-500' : 'text-blue-100'}`}>
                        {msg.isStaff ? 'Support Team' : 'Du'}
                      </span>
                      <span className={`text-xs ${msg.isStaff ? 'text-gray-400' : 'text-blue-200'}`}>
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            {ticketData.ticket.status !== 'closed' && ticketData.ticket.status !== 'resolved' && (
              <div className="p-4 border-t border-gray-100 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deine Antwort..."
                />
                <button
                  onClick={() => void sendReply()}
                  disabled={submitting || !replyContent.trim()}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sendet...' : 'Antworten'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}