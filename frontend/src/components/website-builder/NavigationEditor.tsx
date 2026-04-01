// 📂 PFAD: frontend/src/components/website-builder/NavigationEditor.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';

// ==================== GRAPHQL ====================

const GET_NAVIGATIONS = gql`
  query GetNavigations {
    navigations {
      id name location isActive
      items {
        id label type url pageId order openInNewTab parentId
        children { id label type url pageId order openInNewTab parentId }
      }
    }
  }
`;

const CREATE_NAVIGATION = gql`
  mutation CreateNavigation($input: CreateNavigationInput!) {
    createNavigation(input: $input) { id name location isActive }
  }
`;

const UPDATE_NAVIGATION = gql`
  mutation UpdateNavigation($id: String!, $input: UpdateNavigationInput!) {
    updateNavigation(id: $id, input: $input) { id name location isActive }
  }
`;

const DELETE_NAVIGATION = gql`
  mutation DeleteNavigation($id: String!) {
    deleteNavigation(id: $id)
  }
`;

const CREATE_NAV_ITEM = gql`
  mutation CreateNavigationItem($navigationId: String!, $input: CreateNavigationItemInput!) {
    createNavigationItem(navigationId: $navigationId, input: $input) {
      id label type url order openInNewTab parentId
    }
  }
`;

const UPDATE_NAV_ITEM = gql`
  mutation UpdateNavigationItem($itemId: String!, $input: UpdateNavigationItemInput!) {
    updateNavigationItem(itemId: $itemId, input: $input) {
      id label type url order openInNewTab parentId
    }
  }
`;

const DELETE_NAV_ITEM = gql`
  mutation DeleteNavigationItem($itemId: String!) {
    deleteNavigationItem(itemId: $itemId)
  }
`;

const REORDER_NAV_ITEMS = gql`
  mutation ReorderNavigationItems($navigationId: String!, $itemOrders: [ItemOrderInput!]!) {
    reorderNavigationItems(navigationId: $navigationId, itemOrders: $itemOrders)
  }
`;

// ==================== TYPES ====================

interface NavItem {
  id: string;
  label: string;
  type: string;
  url?: string;
  pageId?: string;
  order: number;
  openInNewTab: boolean;
  parentId?: string;
  children?: NavItem[];
}

interface Navigation {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  items?: NavItem[];
}

// ==================== HELPERS ====================

const LOCATION_LABELS: Record<string, string> = {
  header: '🔝 Header',
  footer: '⬇️ Footer',
  sidebar: '◀️ Sidebar',
  mobile: '📱 Mobile',
};

const TYPE_LABELS: Record<string, string> = {
  custom: 'Eigene URL',
  page: 'WB-Seite',
  external: 'Externer Link',
};

// ==================== ITEM FORM ====================

function ItemForm({
  item,
  onSave,
  onCancel,
}: {
  item?: Partial<NavItem>;
  onSave: (data: Partial<NavItem>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<NavItem>>({
    label: '',
    type: 'custom',
    url: '',
    openInNewTab: false,
    ...item,
  });

  const inp: React.CSSProperties = {
    width: '100%', background: '#0d1117', border: '1px solid #30363d',
    borderRadius: 6, color: '#c9d1d9', padding: '8px 10px',
    fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', color: '#8b949e',
    marginBottom: 4, fontWeight: 600,
  };

  return (
    <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, padding: 14, marginBottom: 8 }}>
      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>Label</label>
        <input style={inp} value={form.label || ''} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="z.B. Startseite" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>Typ</label>
        <select style={{ ...inp }} value={form.type || 'custom'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={lbl}>URL</label>
        <input style={inp} value={form.url || ''} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="z.B. /kontakt oder https://..." />
      </div>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          id="newTab"
          checked={form.openInNewTab || false}
          onChange={e => setForm(p => ({ ...p, openInNewTab: e.target.checked }))}
          style={{ cursor: 'pointer' }}
        />
        <label htmlFor="newTab" style={{ ...lbl, marginBottom: 0, cursor: 'pointer' }}>In neuem Tab öffnen</label>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onSave(form)}
          style={{ flex: 1, background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
        >
          ✓ Speichern
        </button>
        <button
          onClick={onCancel}
          style={{ flex: 1, background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

// ==================== NAV ITEM ROW ====================

function NavItemRow({
  item,
  navigationId,
  onUpdate,
  onDelete,
  depth = 0,
}: {
  item: NavItem;
  navigationId: string;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [updateItem] = useMutation(UPDATE_NAV_ITEM);
  const [createItem] = useMutation(CREATE_NAV_ITEM);

  const handleSave = async (data: Partial<NavItem>) => {
    await updateItem({ variables: { itemId: item.id, input: { label: data.label, type: data.type, url: data.url, openInNewTab: data.openInNewTab } } });
    setEditing(false);
    onUpdate();
  };

  const handleAddChild = async (data: Partial<NavItem>) => {
    await createItem({ variables: { navigationId, input: { label: data.label, type: data.type || 'custom', url: data.url, openInNewTab: data.openInNewTab || false, order: (item.children?.length || 0), parentId: item.id } } });
    setAddingChild(false);
    onUpdate();
  };

  const C = { border: '#21262d', text: '#c9d1d9', muted: '#6e7681', accent: '#58a6ff' };

  return (
    <div style={{ marginLeft: depth * 20 }}>
      {editing ? (
        <ItemForm item={item} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', marginBottom: 4, background: '#161b22', border: `1px solid ${C.border}`, borderRadius: 6 }}>
          <span style={{ color: '#3d444d', fontSize: '0.8rem', userSelect: 'none' }}>⠿</span>
          <span style={{ flex: 1, fontSize: '0.8rem', color: C.text, fontWeight: 500 }}>{item.label}</span>
          <span style={{ fontSize: '0.65rem', color: C.muted, background: '#0d1117', borderRadius: 3, padding: '2px 5px' }}>{item.url || item.type}</span>
          {item.openInNewTab && <span title="Neuer Tab" style={{ fontSize: '0.65rem', color: C.accent }}>↗</span>}
          {depth === 0 && (
            <button onClick={() => setAddingChild(true)} title="Untermenü hinzufügen"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.75rem', padding: '2px 4px' }}>
              +sub
            </button>
          )}
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.75rem', padding: '2px 4px' }}>✎</button>
          <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', fontSize: '0.75rem', padding: '2px 4px' }}>✕</button>
        </div>
      )}

      {addingChild && (
        <div style={{ marginLeft: 20 }}>
          <ItemForm onSave={handleAddChild} onCancel={() => setAddingChild(false)} />
        </div>
      )}

      {item.children?.map(child => (
        <NavItemRow key={child.id} item={child} navigationId={navigationId} onUpdate={onUpdate} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  );
}

// ==================== NAVIGATION PANEL ====================

function NavigationPanel({ nav, onUpdate }: { nav: Navigation; onUpdate: () => void }) {
  const [addingItem, setAddingItem] = useState(false);
  const [editingNav, setEditingNav] = useState(false);
  const [createItem] = useMutation(CREATE_NAV_ITEM);
  const [deleteItem] = useMutation(DELETE_NAV_ITEM);
  const [updateNav] = useMutation(UPDATE_NAVIGATION);
  const [deleteNav] = useMutation(DELETE_NAVIGATION);
  const [navName, setNavName] = useState(nav.name);

  const C = { panel: '#161b22', border: '#21262d', muted: '#6e7681', accent: '#58a6ff', text: '#c9d1d9' };

  const handleAddItem = async (data: Partial<NavItem>) => {
    await createItem({ variables: { navigationId: nav.id, input: { label: data.label, type: data.type || 'custom', url: data.url, openInNewTab: data.openInNewTab || false, order: nav.items?.length || 0 } } });
    setAddingItem(false);
    onUpdate();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Item löschen?')) return;
    await deleteItem({ variables: { itemId: id } });
    onUpdate();
  };

  const handleUpdateNav = async () => {
    await updateNav({ variables: { id: nav.id, input: { name: navName } } });
    setEditingNav(false);
    onUpdate();
  };

  const handleDeleteNav = async () => {
    if (!confirm(`Navigation "${nav.name}" löschen? Alle Items werden entfernt.`)) return;
    await deleteNav({ variables: { id: nav.id } });
    onUpdate();
  };

  const items = nav.items?.filter(i => !i.parentId) || [];

  return (
    <div style={{ marginBottom: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {editingNav ? (
          <>
            <input
              value={navName}
              onChange={e => setNavName(e.target.value)}
              style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 5, color: '#c9d1d9', padding: '5px 8px', fontSize: '0.8rem', outline: 'none' }}
            />
            <button onClick={handleUpdateNav} style={{ background: '#238636', border: 'none', borderRadius: 5, color: '#fff', padding: '5px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>✓</button>
            <button onClick={() => setEditingNav(false)} style={{ background: 'none', border: '1px solid #30363d', borderRadius: 5, color: C.muted, padding: '5px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.accent }}>{LOCATION_LABELS[nav.location] || nav.location}</span>
            <span style={{ flex: 1, fontSize: '0.8rem', color: C.text }}>{nav.name}</span>
            <span style={{ fontSize: '0.65rem', color: nav.isActive ? '#3fb950' : C.muted }}>{nav.isActive ? '● aktiv' : '○ inaktiv'}</span>
            <button onClick={() => setEditingNav(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.75rem' }}>✎</button>
            <button onClick={handleDeleteNav} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', fontSize: '0.75rem' }}>✕</button>
          </>
        )}
      </div>

      {/* Items */}
      <div style={{ padding: '10px 12px' }}>
        {items.length === 0 && <p style={{ color: C.muted, fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>Noch keine Items</p>}
        {items.map(item => (
          <NavItemRow key={item.id} item={item} navigationId={nav.id} onUpdate={onUpdate} onDelete={handleDeleteItem} />
        ))}

        {addingItem ? (
          <ItemForm onSave={handleAddItem} onCancel={() => setAddingItem(false)} />
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            style={{ width: '100%', marginTop: 8, padding: '7px', background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 6, color: C.muted, fontSize: '0.78rem', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            + Item hinzufügen
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

interface NavigationEditorProps {
  onClose?: () => void;
}

export function NavigationEditor({ onClose }: NavigationEditorProps) {
  const { tenant } = useAuth();
  const [creatingNav, setCreatingNav] = useState(false);
  const [newNavName, setNewNavName] = useState('');
  const [newNavLocation, setNewNavLocation] = useState('header');

  const { data, loading, refetch } = useQuery(GET_NAVIGATIONS, {
    skip: !tenant?.id,
  });

  const [createNav] = useMutation(CREATE_NAVIGATION);

  const navigations: Navigation[] = data?.navigations || [];

  const handleCreateNav = async () => {
    if (!newNavName.trim()) return;
    await createNav({ variables: { input: { name: newNavName, location: newNavLocation, isActive: true } } });
    setCreatingNav(false);
    setNewNavName('');
    refetch();
  };

  const C = { bg: '#010409', panel: '#161b22', border: '#21262d', text: '#c9d1d9', muted: '#6e7681', accent: '#58a6ff' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      {/* Top Bar */}
      <div style={{ height: 52, background: C.panel, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '5px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>
            ← Zurück
          </button>
        )}
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3' }}>🧭 Navigation Editor</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setCreatingNav(true)}
          style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
        >
          + Navigation erstellen
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {/* Create Nav Form */}
        {creatingNav && (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Neue Navigation</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: 4, fontWeight: 600 }}>Name</label>
                <input
                  value={newNavName}
                  onChange={e => setNewNavName(e.target.value)}
                  placeholder="z.B. Hauptmenü"
                  style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '8px 10px', fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: 4, fontWeight: 600 }}>Position</label>
                <select
                  value={newNavLocation}
                  onChange={e => setNewNavLocation(e.target.value)}
                  style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', padding: '8px 10px', fontSize: '0.8rem', boxSizing: 'border-box', outline: 'none' }}
                >
                  {Object.entries(LOCATION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateNav} style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Erstellen</button>
              <button onClick={() => setCreatingNav(false)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>Abbrechen</button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: C.muted, padding: '4rem' }}>⟳ Lade Navigationen...</div>}

        {!loading && navigations.length === 0 && (
          <div style={{ textAlign: 'center', color: C.muted, padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.4 }}>🧭</div>
            <p style={{ fontSize: '0.9rem' }}>Noch keine Navigationen. Erstelle eine oben.</p>
          </div>
        )}

        {navigations.map(nav => (
          <NavigationPanel key={nav.id} nav={nav} onUpdate={refetch} />
        ))}
      </div>
    </div>
  );
}