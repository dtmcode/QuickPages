'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const NAVIGATION_QUERY = gql`
  query Navigation($id: String!) {
    navigation(id: $id) {
      id
      name
      location
      description
      isActive
      items {
        id
        label
        type
        url
        pageId
        postId
        categoryId
        order
        icon
        openInNewTab
        parentId
        children {
          id
          label
          type
          url
          order
          icon
          openInNewTab
        }
      }
    }
  }
`;

const CREATE_NAV_ITEM = gql`
  mutation CreateNavigationItem($navigationId: String!, $input: CreateNavigationItemInput!) {
    createNavigationItem(navigationId: $navigationId, input: $input) {
      id
      label
    }
  }
`;

const UPDATE_NAV_ITEM = gql`
  mutation UpdateNavigationItem($itemId: String!, $input: UpdateNavigationItemInput!) {
    updateNavigationItem(itemId: $itemId, input: $input) {
      id
      label
    }
  }
`;

const DELETE_NAV_ITEM = gql`
  mutation DeleteNavigationItem($itemId: String!) {
    deleteNavigationItem(itemId: $itemId)
  }
`;

const UPDATE_NAVIGATION = gql`
  mutation UpdateNavigation($id: String!, $input: UpdateNavigationInput!) {
    updateNavigation(id: $id, input: $input) {
      id
      name
    }
  }
`;

const PAGES_QUERY = gql`
  query Pages {
    pages(limit: 100) {
      id
      title
      slug
    }
  }
`;

const POSTS_QUERY = gql`
  query Posts {
    posts(limit: 100) {
      id
      title
      slug
    }
  }
`;

export default function NavigationBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const navId = params.id as string;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [itemLabel, setItemLabel] = useState('');
  const [itemType, setItemType] = useState('custom');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPageId, setItemPageId] = useState('');
  const [itemPostId, setItemPostId] = useState('');
  const [itemIcon, setItemIcon] = useState('');
  const [itemOpenInNewTab, setItemOpenInNewTab] = useState(false);
  const [itemParentId, setItemParentId] = useState('');

  const { data, loading, refetch } = useQuery(NAVIGATION_QUERY, {
    variables: { id: navId },
  });

  const { data: pagesData } = useQuery(PAGES_QUERY);
  const { data: postsData } = useQuery(POSTS_QUERY);

  const [createNavItem, { loading: creating }] = useMutation(CREATE_NAV_ITEM);
  const [updateNavItem, { loading: updating }] = useMutation(UPDATE_NAV_ITEM);
  const [deleteNavItem] = useMutation(DELETE_NAV_ITEM);
  const [updateNavigation] = useMutation(UPDATE_NAVIGATION);

  const navigation = data?.navigation;
  const pages = pagesData?.pages || [];
  const posts = postsData?.posts || [];
  const items = navigation?.items?.filter((item: any) => !item.parentId) || [];

  const resetForm = () => {
    setItemLabel('');
    setItemType('custom');
    setItemUrl('');
    setItemPageId('');
    setItemPostId('');
    setItemIcon('');
    setItemOpenInNewTab(false);
    setItemParentId('');
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setItemLabel(item.label);
    setItemType(item.type);
    setItemUrl(item.url || '');
    setItemPageId(item.pageId || '');
    setItemPostId(item.postId || '');
    setItemIcon(item.icon || '');
    setItemOpenInNewTab(item.openInNewTab);
    setItemParentId(item.parentId || '');
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!itemLabel) {
      alert('Bitte Label eingeben');
      return;
    }

    const input: any = {
      label: itemLabel,
      type: itemType,
      icon: itemIcon || undefined,
      openInNewTab: itemOpenInNewTab,
      parentId: itemParentId || undefined,
    };

    if (itemType === 'custom' || itemType === 'external') {
      input.url = itemUrl;
    } else if (itemType === 'page') {
      input.pageId = itemPageId;
    } else if (itemType === 'post') {
      input.postId = itemPostId;
    }

    try {
      if (editingItem) {
        await updateNavItem({
          variables: {
            itemId: editingItem.id,
            input,
          },
        });
        alert('✅ Menu Item aktualisiert!');
      } else {
        await createNavItem({
          variables: {
            navigationId: navId,
            input: {
              ...input,
              order: items.length,
            },
          },
        });
        alert('✅ Menu Item hinzugefügt!');
      }

      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Speichern');
    }
  };

  const handleDelete = async (itemId: string, label: string) => {
    if (!confirm(`Menu Item "${label}" wirklich löschen?`)) return;

    try {
      await deleteNavItem({ variables: { itemId } });
      alert('✅ Menu Item gelöscht!');
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Löschen');
    }
  };

  const toggleActive = async () => {
    try {
      await updateNavigation({
        variables: {
          id: navId,
          input: {
            isActive: !navigation.isActive,
          },
        },
      });
      refetch();
    } catch (error) {
      alert('❌ Fehler beim Aktualisieren');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      page: '📄',
      post: '📝',
      custom: '🔗',
      external: '🌐',
      category: '🏷️',
    };
    return icons[type] || '🔗';
  };

  if (loading) {
    return <div className="text-center py-12">Lädt Navigation...</div>;
  }

  if (!navigation) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Navigation nicht gefunden
        </h3>
        <Link href="/dashboard/cms/navigation">
          <Button>← Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/cms/navigation">
              <Button variant="ghost" size="sm">← Zurück zur Übersicht</Button>
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {navigation.name}
              </h1>
              <button
                onClick={toggleActive}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  navigation.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {navigation.isActive ? '✓ Aktiv' : '○ Inaktiv'}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Location: {navigation.location}
            </p>
          </div>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            ➕ Menu Item hinzufügen
          </Button>
        </div>

        {/* Menu Items */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Noch keine Menu Items
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Füge dein erstes Menu Item hinzu
              </p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                ➕ Menu Item hinzufügen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Menu Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.id}>
                    {/* Parent Item */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.type === 'custom' || item.type === 'external' ? item.url : item.type}
                            {item.openInNewTab && ' • Neues Fenster'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.label)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Child Items */}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-12 mt-2 space-y-2">
                        {item.children.map((child: any) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getTypeIcon(child.type)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {child.icon && <span className="mr-2">{child.icon}</span>}
                                  {child.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {child.type === 'custom' || child.type === 'external' ? child.url : child.type}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(child)}
                                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(child.id, child.label)}
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>
                {editingItem ? '✏️ Menu Item bearbeiten' : '➕ Menu Item hinzufügen'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={itemLabel}
                    onChange={(e) => setItemLabel(e.target.value)}
                    placeholder="z.B. Home"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Typ
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="custom">🔗 Custom Link</option>
                    <option value="page">📄 Page</option>
                    <option value="post">📝 Post</option>
                    <option value="external">🌐 External URL</option>
                  </select>
                </div>
              </div>

              {/* URL Input for custom/external */}
              {(itemType === 'custom' || itemType === 'external') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL *
                  </label>
                  <input
                    type="text"
                    value={itemUrl}
                    onChange={(e) => setItemUrl(e.target.value)}
                    placeholder="https://example.com oder /about"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Page Select */}
              {itemType === 'page' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Page *
                  </label>
                  <select
                    value={itemPageId}
                    onChange={(e) => setItemPageId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Wähle eine Page</option>
                    {pages.map((page: any) => (
                      <option key={page.id} value={page.id}>
                        {page.title} (/{page.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Post Select */}
              {itemType === 'post' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post *
                  </label>
                  <select
                    value={itemPostId}
                    onChange={(e) => setItemPostId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Wähle einen Post</option>
                    {posts.map((post: any) => (
                      <option key={post.id} value={post.id}>
                        {post.title} (/blog/{post.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (Optional)
                  </label>
                  <input
                    type="text"
                    value={itemIcon}
                    onChange={(e) => setItemIcon(e.target.value)}
                    placeholder="🏠"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Item (Optional)
                  </label>
                  <select
                    value={itemParentId}
                    onChange={(e) => setItemParentId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Kein Parent (Top Level)</option>
                    {items.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  checked={itemOpenInNewTab}
                  onChange={(e) => setItemOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <label htmlFor="openInNewTab" className="text-sm text-gray-700 dark:text-gray-300">
                  In neuem Tab öffnen
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={creating || updating}
                  className="flex-1"
                >
                  {creating || updating ? 'Speichert...' : editingItem ? 'Aktualisieren' : 'Hinzufügen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}