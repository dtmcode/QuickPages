'use client';
// frontend\src\app\dashboard\restaurant\page.tsx

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Utensils, Plus, Pencil, Trash2, QrCode,
  ChefHat, ShoppingBag, Clock, Loader2, CheckCircle,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_SETTINGS = gql`query { restaurantSettings { id dineInEnabled pickupEnabled deliveryEnabled deliveryFee minOrderAmount estimatedPickupTime estimatedDeliveryTime cashEnabled cardOnPickupEnabled onlinePaymentEnabled } }`;
const UPDATE_SETTINGS = gql`mutation UpdateRestaurantSettings($input: UpdateRestaurantSettingsInput!) { updateRestaurantSettings(input: $input) { id } }`;
const GET_TABLES = gql`query { restaurantTables { tables { id number name capacity qrCode isActive } total } }`;
const CREATE_TABLE = gql`mutation CreateRestaurantTable($input: CreateRestaurantTableInput!) { createRestaurantTable(input: $input) { id number } }`;
const DELETE_TABLE = gql`mutation DeleteRestaurantTable($id: ID!) { deleteRestaurantTable(id: $id) }`;
const GET_CATEGORIES = gql`query { menuCategories { categories { id name slug position isActive } total } }`;
const CREATE_CATEGORY = gql`mutation CreateMenuCategory($input: CreateMenuCategoryInput!) { createMenuCategory(input: $input) { id name } }`;
const DELETE_CATEGORY = gql`mutation DeleteMenuCategory($id: ID!) { deleteMenuCategory(id: $id) }`;
const GET_ITEMS = gql`query MenuItems($categoryId: ID) { menuItems(categoryId: $categoryId) { items { id name price isAvailable isVegan isVegetarian isPopular position categoryId } total } }`;
const CREATE_ITEM = gql`mutation CreateMenuItem($input: CreateMenuItemInput!) { createMenuItem(input: $input) { id name } }`;
const DELETE_ITEM = gql`mutation DeleteMenuItem($id: ID!) { deleteMenuItem(id: $id) }`;
const GET_ORDERS = gql`query FoodOrders($status: String) { foodOrders(status: $status) { orders { id orderNumber orderType customerName status subtotal total createdAt tableId } total } }`;
const UPDATE_ORDER_STATUS = gql`mutation UpdateFoodOrderStatus($id: ID!, $input: UpdateFoodOrderStatusInput!) { updateFoodOrderStatus(id: $id, input: $input) { id status } }`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-blue-100 text-blue-800',
  accepted:  'bg-yellow-100 text-yellow-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready:     'bg-green-100 text-green-800',
  on_the_way:'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  new:'Neu', accepted:'Angenommen', preparing:'In Zubereitung',
  ready:'Fertig', on_the_way:'Unterwegs', delivered:'Geliefert', cancelled:'Storniert',
};

// ─── Tab Component ────────────────────────────────────────────────────────────

function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; icon?: React.ReactNode }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 border-b mb-4">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === t.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data, loading } = useQuery(GET_SETTINGS);
  const [update] = useMutation(UPDATE_SETTINGS);
  const [saved, setSaved] = useState(false);
  const s = data?.restaurantSettings;

  const [form, setForm] = useState<Record<string, boolean | number | null>>({});

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;
  if (!s) return null;

  const val = (key: string, fallback: boolean | number | null) => key in form ? form[key] : (s[key] ?? fallback);

  const save = async () => {
    await update({ variables: { input: form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Row = ({ label, field, type = 'toggle' }: { label: string; field: string; type?: 'toggle' | 'number' }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm">{label}</span>
      {type === 'toggle' ? (
        <Toggle
          checked={!!val(field, false)}
          onChange={v => setForm(f => ({ ...f, [field]: v }))}
          label=""
        />
      ) : (
        <input
          type="number"
          className="w-24 border rounded px-2 py-1 text-sm text-right"
          value={(val(field, 0) as number) ?? ''}
          onChange={e => setForm(f => ({ ...f, [field]: parseInt(e.target.value) || 0 }))}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <Card>
        <CardHeader><CardTitle className="text-sm">Bestellmethoden</CardTitle></CardHeader>
        <CardContent>
          <Row label="Vor-Ort essen (Dine-In)" field="dineInEnabled" />
          <Row label="Abholung" field="pickupEnabled" />
          <Row label="Lieferung" field="deliveryEnabled" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Zeiten & Gebühren (in Cent)</CardTitle></CardHeader>
        <CardContent>
          <Row label="Liefergebühr (Cent)" field="deliveryFee" type="number" />
          <Row label="Mindestbestellwert (Cent)" field="minOrderAmount" type="number" />
          <Row label="Abholzeit (Minuten)" field="estimatedPickupTime" type="number" />
          <Row label="Lieferzeit (Minuten)" field="estimatedDeliveryTime" type="number" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Zahlungsarten</CardTitle></CardHeader>
        <CardContent>
          <Row label="Bar" field="cashEnabled" />
          <Row label="Karte bei Abholung" field="cardOnPickupEnabled" />
          <Row label="Online-Zahlung" field="onlinePaymentEnabled" />
        </CardContent>
      </Card>
      <Button onClick={save} disabled={Object.keys(form).length === 0}>
        {saved ? <><CheckCircle className="h-4 w-4 mr-2" />Gespeichert</> : 'Speichern'}
      </Button>
    </div>
  );
}

// ─── Tables Tab ───────────────────────────────────────────────────────────────

function TablesTab() {
  const { data, loading, refetch } = useQuery(GET_TABLES);
  const [createTable] = useMutation(CREATE_TABLE);
  const [deleteTable] = useMutation(DELETE_TABLE);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ number: '', name: '', capacity: 4 });

  const tables = data?.restaurantTables?.tables ?? [];

  const save = async () => {
    await createTable({ variables: { input: form } });
    await refetch();
    setModal(false);
    setForm({ number: '', name: '', capacity: 4 });
  };

  const del = async (id: string) => {
    if (!confirm('Tisch löschen?')) return;
    await deleteTable({ variables: { id } });
    await refetch();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{tables.length} Tische</p>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" />Tisch hinzufügen</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((t: { id: string; number: string; name: string | null; capacity: number; qrCode: string | null; isActive: boolean }) => (
          <div key={t.id} className={`border rounded-lg p-4 text-center space-y-2 ${!t.isActive ? 'opacity-50' : ''}`}>
            <p className="text-2xl font-bold">#{t.number}</p>
            {t.name && <p className="text-xs text-muted-foreground">{t.name}</p>}
            <p className="text-xs text-muted-foreground">{t.capacity} Plätze</p>
            {t.qrCode && (
              <div className="flex justify-center">
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <button onClick={() => del(t.id)} className="text-xs text-destructive hover:underline">Löschen</button>
          </div>
        ))}
      </div>
      <Modal open={modal} title="Neuer Tisch" onClose={() => setModal(false)}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Tisch-Nummer *</label>
            <input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="1, 2, A1..." />
          </div>
          <div>
            <label className="text-sm font-medium">Name (optional)</label>
            <input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Terrasse, Fensterplatz..." />
          </div>
          <div>
            <label className="text-sm font-medium">Kapazität</label>
            <input type="number" min={1} className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 2 }))} />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setModal(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={!form.number}>Erstellen</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

function MenuTab() {
  const { data: catData, loading: catLoading, refetch: catRefetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [createItem] = useMutation(CREATE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: itemData, refetch: itemRefetch } = useQuery(GET_ITEMS, { variables: { categoryId: selectedCat }, skip: !selectedCat });

  const [catModal, setCatModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [itemForm, setItemForm] = useState({ name: '', price: '', categoryId: selectedCat ?? '', isVegan: false, isVegetarian: false });

  const categories = catData?.menuCategories?.categories ?? [];
  const items = itemData?.menuItems?.items ?? [];

  const saveCategory = async () => {
    await createCategory({ variables: { input: catForm } });
    await catRefetch();
    setCatModal(false);
    setCatForm({ name: '', description: '' });
  };

  const saveItem = async () => {
    await createItem({ variables: { input: { ...itemForm, price: Math.round(parseFloat(itemForm.price) * 100), categoryId: selectedCat } } });
    await itemRefetch();
    setItemModal(false);
    setItemForm({ name: '', price: '', categoryId: selectedCat ?? '', isVegan: false, isVegetarian: false });
  };

  const delCat = async (id: string) => {
    if (!confirm('Kategorie löschen?')) return;
    await deleteCategory({ variables: { id } });
    if (selectedCat === id) setSelectedCat(null);
    await catRefetch();
  };

  const delItem = async (id: string) => {
    if (!confirm('Gericht löschen?')) return;
    await deleteItem({ variables: { id } });
    await itemRefetch();
  };

  if (catLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="flex gap-6">
      {/* Kategorien */}
      <div className="w-56 shrink-0 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Kategorien</span>
          <button onClick={() => setCatModal(true)} className="text-primary hover:underline text-xs">+ Neu</button>
        </div>
        {categories.map((c: { id: string; name: string; isActive: boolean }) => (
          <div
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${selectedCat === c.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <span className="truncate">{c.name}</span>
            <button
              onClick={e => { e.stopPropagation(); void delCat(c.id); }}
              className={`opacity-0 hover:opacity-100 group-hover:opacity-100 ml-1 ${selectedCat === c.id ? 'text-primary-foreground' : 'text-destructive'}`}
            >
              ×
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-xs text-muted-foreground">Noch keine Kategorien</p>}
      </div>

      {/* Gerichte */}
      <div className="flex-1">
        {!selectedCat ? (
          <div className="text-center py-12 text-muted-foreground">
            <ChefHat className="h-10 w-10 mx-auto mb-3" />
            <p>Kategorie auswählen</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{items.length} Gerichte</p>
              <Button size="sm" onClick={() => setItemModal(true)}><Plus className="h-4 w-4 mr-1" />Gericht</Button>
            </div>
            <div className="space-y-2">
              {items.map((item: { id: string; name: string; price: number; isAvailable: boolean; isVegan: boolean; isVegetarian: boolean; isPopular: boolean }) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      {item.isVegan && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">🌱 Vegan</span>}
                      {item.isVegetarian && !item.isVegan && <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">🥬 Vegetarisch</span>}
                      {item.isPopular && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">⭐ Beliebt</span>}
                    </div>
                    {!item.isAvailable && <span className="text-xs text-destructive">Nicht verfügbar</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{fmt(item.price)}</span>
                    <button onClick={() => delItem(item.id)} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Noch keine Gerichte</p>}
            </div>
          </div>
        )}
      </div>

      {/* Kategorie Modal */}
      <Modal open={catModal} title="Neue Kategorie" onClose={() => setCatModal(false)}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Vorspeisen, Hauptgerichte..." />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setCatModal(false)}>Abbrechen</Button>
          <Button onClick={saveCategory} disabled={!catForm.name}>Erstellen</Button>
        </div>
      </Modal>

      {/* Gericht Modal */}
      <Modal open={itemModal} title="Neues Gericht" onClose={() => setItemModal(false)}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Preis (€) *</label>
            <input type="number" step="0.01" className="w-full border rounded px-3 py-2 mt-1 text-sm" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="flex gap-4">
            <Toggle checked={itemForm.isVegan} onChange={v => setItemForm(f => ({ ...f, isVegan: v }))} label="Vegan" />
            <Toggle checked={itemForm.isVegetarian} onChange={v => setItemForm(f => ({ ...f, isVegetarian: v }))} label="Vegetarisch" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setItemModal(false)}>Abbrechen</Button>
          <Button onClick={saveItem} disabled={!itemForm.name || !itemForm.price}>Erstellen</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data, loading, refetch } = useQuery(GET_ORDERS, { variables: { status: statusFilter }, pollInterval: 30000 });
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);

  const orders = data?.foodOrders?.orders ?? [];

  const next: Record<string, string> = {
    new: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'delivered',
  };

  const advance = async (id: string, currentStatus: string) => {
    const nextStatus = next[currentStatus];
    if (!nextStatus) return;
    await updateStatus({ variables: { id, input: { status: nextStatus } } });
    await refetch();
  };

  const filterBtns = [
    { label: 'Alle', value: undefined },
    { label: 'Neu', value: 'new' },
    { label: 'Angenommen', value: 'accepted' },
    { label: 'Zubereitung', value: 'preparing' },
    { label: 'Fertig', value: 'ready' },
  ];

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {filterBtns.map(b => (
          <button
            key={String(b.value)}
            onClick={() => setStatusFilter(b.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === b.value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            {b.label}
          </button>
        ))}
        <button onClick={() => refetch()} className="ml-auto text-xs text-muted-foreground hover:text-foreground">↻ Aktualisieren</button>
      </div>

      <div className="space-y-2">
        {orders.map((o: { id: string; orderNumber: string; orderType: string; customerName: string; status: string; subtotal: number; total: number; tableId: string | null; createdAt: string | null }) => (
          <div key={o.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">#{o.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[o.status] ?? 'bg-gray-100'}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {o.orderType === 'dine_in' ? `🍽️ Tisch ${o.tableId ?? ''}` : o.orderType === 'pickup' ? '🏃 Abholung' : '🚴 Lieferung'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{o.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{fmt(o.total)}</span>
              {next[o.status] && (
                <Button size="sm" onClick={() => advance(o.id, o.status)}>
                  → {STATUS_LABELS[next[o.status]]}
                </Button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3" />
            <p>Keine Bestellungen</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RestaurantPage() {
  const [tab, setTab] = useState('orders');

  const tabs = [
    { key: 'orders',   label: 'Bestellungen', icon: <ShoppingBag className="h-4 w-4" /> },
    { key: 'menu',     label: 'Speisekarte',   icon: <ChefHat className="h-4 w-4" /> },
    { key: 'tables',   label: 'Tische',        icon: <QrCode className="h-4 w-4" /> },
    { key: 'settings', label: 'Einstellungen', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Utensils className="h-7 w-7" />
        <div>
          <h1 className="text-2xl font-bold">Restaurant</h1>
          <p className="text-sm text-muted-foreground">Menü, Tische &amp; Bestellungen verwalten</p>
        </div>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'orders'   && <OrdersTab />}
      {tab === 'menu'     && <MenuTab />}
      {tab === 'tables'   && <TablesTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}