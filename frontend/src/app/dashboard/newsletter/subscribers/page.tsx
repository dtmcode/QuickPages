'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const SUBSCRIBERS_QUERY = gql`
  query NewsletterSubscribers($status: String, $search: String, $limit: Int, $offset: Int) {
    newsletterSubscribers(status: $status, search: $search, limit: $limit, offset: $offset) {
      id
      email
      firstName
      lastName
      status
      tags
      subscribedAt
      confirmedAt
      createdAt
    }
    subscriberStats {
      total
      active
      pending
      unsubscribed
    }
    subscriberTags
  }
`;

const CREATE_SUBSCRIBER = gql`
  mutation CreateSubscriber($input: CreateSubscriberInput!) {
    createSubscriber(input: $input) {
      id
      email
      status
    }
  }
`;

const DELETE_SUBSCRIBER = gql`
  mutation DeleteSubscriber($id: String!) {
    deleteSubscriber(id: $id)
  }
`;

const UPDATE_SUBSCRIBER = gql`
  mutation UpdateSubscriber($id: String!, $input: UpdateSubscriberInput!) {
    updateSubscriber(id: $id, input: $input) {
      id
      status
    }
  }
`;

export default function SubscribersPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newTags, setNewTags] = useState('');

  const { data, loading, refetch } = useQuery(SUBSCRIBERS_QUERY, {
    variables: {
      status: statusFilter || undefined,
      search: searchTerm || undefined,
      limit: 50,
    },
  });

  const [createSubscriber, { loading: creating }] = useMutation(CREATE_SUBSCRIBER);
  const [deleteSubscriber] = useMutation(DELETE_SUBSCRIBER);
  const [updateSubscriber] = useMutation(UPDATE_SUBSCRIBER);

  const subscribers = data?.newsletterSubscribers || [];
  const stats = data?.subscriberStats || { total: 0, active: 0, pending: 0, unsubscribed: 0 };

  const handleCreate = async () => {
    if (!newEmail) {
      alert('Bitte Email eingeben');
      return;
    }

    try {
      await createSubscriber({
        variables: {
          input: {
            email: newEmail,
            firstName: newFirstName || undefined,
            lastName: newLastName || undefined,
            tags: newTags ? newTags.split(',').map(t => t.trim()) : [],
            source: 'manual',
          },
        },
      });
      
      alert('✅ Subscriber hinzugefügt!');
      setShowAddModal(false);
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewTags('');
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fehler beim Erstellen';
      alert('❌ ' + message);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Subscriber ${email} wirklich löschen?`)) {
      return;
    }

    try {
      await deleteSubscriber({ variables: { id } });
      alert('✅ Gelöscht!');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Löschen');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubscriber({
        variables: {
          id,
          input: { status: newStatus },
        },
      });
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Aktualisieren');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'unsubscribed': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      case 'bounced': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '✅ Aktiv';
      case 'pending': return '⏳ Ausstehend';
      case 'unsubscribed': return '🚫 Abgemeldet';
      case 'bounced': return '⚠️ Bounce';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📧 Newsletter Subscribers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Email-Liste
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          ➕ Subscriber hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Aktiv</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Ausstehend</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Abgemeldet</div>
            <div className="text-3xl font-bold text-gray-600 mt-2">
              {stats.unsubscribed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Suche nach Email oder Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="pending">Ausstehend</option>
              <option value="unsubscribed">Abgemeldet</option>
              <option value="bounced">Bounce</option>
            </select>
            <Button variant="ghost" onClick={() => refetch()}>
              🔄 Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Liste ({subscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Keine Subscribers gefunden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Erstellt
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {sub.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {sub.firstName || sub.lastName
                          ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {sub.tags && sub.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {sub.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {sub.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'active')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            ✅ Aktivieren
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'unsubscribed')}
                            className="text-orange-600 hover:text-orange-800 text-sm"
                          >
                            🚫 Abmelden
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2"
                        >
                          🗑️ Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Neuer Subscriber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="subscriber@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vorname
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Max"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nachname
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Mustermann"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (komma-getrennt)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="customer, vip"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreate} disabled={creating} fullWidth>
                  {creating ? 'Erstellt...' : '✅ Hinzufügen'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
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