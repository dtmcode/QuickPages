'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NAVIGATIONS_QUERY = gql`
  query Navigations {
    navigations {
      id
      name
      location
      description
      isActive
      items {
        id
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_NAVIGATION = gql`
  mutation DeleteNavigation($id: String!) {
    deleteNavigation(id: $id)
  }
`;

const CREATE_NAVIGATION = gql`
  mutation CreateNavigation($input: CreateNavigationInput!) {
    createNavigation(input: $input) {
      id
      name
      location
    }
  }
`;

export default function NavigationListPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNavName, setNewNavName] = useState('');
  const [newNavLocation, setNewNavLocation] = useState('header');

  const { data, loading, refetch } = useQuery(NAVIGATIONS_QUERY);
  const [deleteNavigation] = useMutation(DELETE_NAVIGATION);
  const [createNavigation, { loading: creating }] = useMutation(CREATE_NAVIGATION);

  const navigations = data?.navigations || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Navigation "${name}" wirklich löschen?`)) return;

    try {
      await deleteNavigation({ variables: { id } });
      alert('✅ Navigation gelöscht!');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Löschen');
    }
  };

  const handleCreate = async () => {
    if (!newNavName) {
      alert('Bitte Namen eingeben');
      return;
    }

    try {
      await createNavigation({
        variables: {
          input: {
            name: newNavName,
            location: newNavLocation,
            isActive: true,
          },
        },
      });
      alert('✅ Navigation erstellt!');
      setShowCreateModal(false);
      setNewNavName('');
      setNewNavLocation('header');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Erstellen');
    }
  };

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      header: '📱 Header',
      footer: '📄 Footer',
      sidebar: '📋 Sidebar',
      mobile: '📱 Mobile Menu',
    };
    return labels[location] || location;
  };

  if (loading) {
    return <div className="text-center py-12">Lädt Navigationen...</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📍 Navigation Manager
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Verwalte deine Menüs und Navigation
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            ➕ Neue Navigation
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">
                  Navigation Locations
                </h3>
                <p className="text-sm text-cyan-800 dark:text-cyan-300">
                  Erstelle verschiedene Menüs für unterschiedliche Bereiche deiner Website:
                  Header (Hauptmenü), Footer (Fußzeile), Sidebar (Seitenleiste), oder Mobile Menu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigations List */}
        {navigations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Noch keine Navigation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Erstelle deine erste Navigation
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                ➕ Navigation erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {navigations.map((nav: any) => (
              <Card key={nav.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {nav.name}
                        {!nav.isActive && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            Inaktiv
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getLocationLabel(nav.location)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {nav.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {nav.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        📋 {nav.items?.length || 0} Menu Items
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(nav.updatedAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Link href={`/dashboard/website-builder/navigation/${nav.id}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">
                          ✏️ Bearbeiten
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(nav.id, nav.name)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Neue Navigation erstellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newNavName}
                  onChange={(e) => setNewNavName(e.target.value)}
                  placeholder="z.B. Hauptmenü"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <select
                  value={newNavLocation}
                  onChange={(e) => setNewNavLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="header">📱 Header</option>
                  <option value="footer">📄 Footer</option>
                  <option value="sidebar">📋 Sidebar</option>
                  <option value="mobile">📱 Mobile Menu</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewNavName('');
                    setNewNavLocation('header');
                  }}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? 'Erstellt...' : 'Erstellen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}