'use client';
// 📂 PFAD: frontend/src/app/dashboard/support/page.tsx

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'open' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customerName: string;
  customerEmail: string;
  messageCount: number;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  ticketId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isStaff: boolean;
  isInternal: boolean;
  createdAt: string;
}

interface Stats {
  open: number;
  waiting: number;
  resolved: number;
  closed: number;
  urgent: number;
  total: number;
}

// ==================== GRAPHQL ====================
const API_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== STATUS / PRIORITY HELPERS ====================
const STATUS_LABELS: Record<string, string> = { open: 'Offen', waiting: 'Wartend', resolved: 'Gelöst', closed: 'Geschlossen' };
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'Niedrig', normal: 'Normal', high: 'Hoch', urgent: 'Dringend' };
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-800',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${Math.floor(hours / 24)} Tagen`;
}

// ==================== COMPONENT ====================
export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, waiting: 0, resolved: 0, closed: 0, urgent: 0, total: 0 });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTickets = useCallback(async () => {
    try {
      const data = await gql<{ supportTickets: Ticket[]; supportStats: Stats }>(`
        query($status: String) {
          supportTickets(status: $status) {
            id ticketNumber subject status priority customerName customerEmail
            messageCount lastMessage createdAt updatedAt
          }
          supportStats { open waiting resolved closed urgent total }
        }
      `, statusFilter !== 'all' ? { status: statusFilter } : {});
      setTickets(data.supportTickets);
      setStats(data.supportStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setMsgLoading(true);
    try {
      const data = await gql<{ ticketMessages: Message[] }>(
        `query($ticketId: String!) { ticketMessages(ticketId: $ticketId) { id ticketId authorName authorEmail content isStaff isInternal createdAt } }`,
        { ticketId: ticket.id },
      );
      setMessages(data.ticketMessages);
    } catch (err) {
      console.error(err);
    } finally {
      setMsgLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    setSending(true);
    try {
      await gql(
        `mutation($ticketId: String!, $content: String!, $isInternal: Boolean!) {
          replyToTicket(ticketId: $ticketId, content: $content, isInternal: $isInternal) { id }
        }`,
        { ticketId: selectedTicket.id, content: reply, isInternal },
      );
      setReply('');
      setIsInternal(false);
      await openTicket(selectedTicket);
      // Set to waiting after staff reply
      if (!isInternal) await updateStatus(selectedTicket.id, 'waiting');
      showToast('Antwort gesendet');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Fehler', 'error');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await gql(
        `mutation($id: String!, $input: UpdateTicketInput!) { updateSupportTicket(id: $id, input: $input) { id status } }`,
        { id: ticketId, input: { status } },
      );
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => prev ? { ...prev, status: status as Ticket['status'] } : null);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Fehler', 'error');
    }
  };

  const updatePriority = async (ticketId: string, priority: string) => {
    try {
      await gql(
        `mutation($id: String!, $input: UpdateTicketInput!) { updateSupportTicket(id: $id, input: $input) { id priority } }`,
        { id: ticketId, input: { priority } },
      );
      await loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => prev ? { ...prev, priority: priority as Ticket['priority'] } : null);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Fehler', 'error');
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Ticket wirklich löschen?')) return;
    try {
      await gql(`mutation($id: String!) { deleteSupportTicket(id: $id) }`, { id: ticketId });
      if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      await loadTickets();
      showToast('Ticket gelöscht');
    } catch {
      showToast('Fehler beim Löschen', 'error');
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header + Stats */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Support Tickets</h1>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Offen', value: stats.open, color: 'bg-blue-50 border-blue-200 text-blue-800', filter: 'open' },
            { label: 'Wartend', value: stats.waiting, color: 'bg-yellow-50 border-yellow-200 text-yellow-800', filter: 'waiting' },
            { label: 'Gelöst', value: stats.resolved, color: 'bg-green-50 border-green-200 text-green-800', filter: 'resolved' },
            { label: 'Geschlossen', value: stats.closed, color: 'bg-gray-50 border-gray-200 text-gray-600', filter: 'closed' },
            { label: '🚨 Dringend', value: stats.urgent, color: 'bg-red-50 border-red-200 text-red-800', filter: 'urgent' },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setStatusFilter(statusFilter === stat.filter ? 'all' : stat.filter)}
              className={`rounded-xl border p-3 text-left transition-all ${stat.color} ${statusFilter === stat.filter ? 'ring-2 ring-offset-1 ring-current' : 'opacity-80 hover:opacity-100'}`}
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-0.5">{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Ticket List */}
        <div className={`flex flex-col ${selectedTicket ? 'w-80 flex-shrink-0' : 'flex-1'} bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {tickets.length} Tickets {statusFilter !== 'all' && `· ${STATUS_LABELS[statusFilter] || statusFilter}`}
            </span>
            {statusFilter !== 'all' && (
              <button onClick={() => setStatusFilter('all')} className="text-xs text-blue-600 hover:underline">Alle anzeigen</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Keine Tickets gefunden</div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => void openTicket(ticket)}
                  className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                      {ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                          {PRIORITY_LABELS[ticket.priority]}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ticket.customerName}</p>
                  {ticket.lastMessage && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{ticket.lastMessage}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{timeAgo(ticket.updatedAt)}</span>
                    <span className="text-xs text-gray-400">{ticket.messageCount} Nachrichten</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-0">
            {/* Ticket Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">{selectedTicket.ticketNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedTicket.status]}`}>
                      {STATUS_LABELS[selectedTicket.status]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                      {PRIORITY_LABELS[selectedTicket.priority]}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedTicket.customerName} · {selectedTicket.customerEmail}
                  </p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0">×</button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => void updateStatus(selectedTicket.id, e.target.value)}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900"
                >
                  <option value="open">Offen</option>
                  <option value="waiting">Wartend</option>
                  <option value="resolved">Gelöst</option>
                  <option value="closed">Geschlossen</option>
                </select>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => void updatePriority(selectedTicket.id, e.target.value)}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900"
                >
                  <option value="low">Niedrig</option>
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Dringend</option>
                </select>
                <button
                  onClick={() => void deleteTicket(selectedTicket.id)}
                  className="text-xs px-2 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 ml-auto"
                >
                  Löschen
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.isInternal
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                        : msg.isStaff
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${msg.isStaff && !msg.isInternal ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {msg.isInternal ? '🔒 Intern · ' : ''}{msg.authorName}
                        </span>
                        <span className={`text-xs ${msg.isStaff && !msg.isInternal ? 'text-blue-200' : 'text-gray-400'}`}>
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    Interne Notiz (nur für Team sichtbar)
                  </label>
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={isInternal ? 'Interne Notiz...' : 'Antwort an Kunden...'}
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${
                    isInternal ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void sendReply()}
                    disabled={sending || !reply.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sendet...' : isInternal ? 'Notiz speichern' : 'Antworten'}
                  </button>
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => void updateStatus(selectedTicket.id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      ✓ Als gelöst markieren
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}