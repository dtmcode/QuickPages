'use client';
// frontend\src\app\dashboard\local-store\page.tsx

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Store, Plus, Trash2, Pencil, QrCode,
  Package, Tag, Clock, Loader2, CheckCircle,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_SETTINGS = gql`query { localStoreSettings { id storeType pickupEnabled deliveryEnabled pickupSlotDuration maxOrdersPerSlot minOrderAmount cashOnPickupEnabled cardOnPickupEnabled onlinePaymentEnabled } }`;
const UPDATE_SETTINGS = gql`mutation UpdateLocalStoreSettings($input: UpdateLocalStoreSettingsInput!) { updateLocalStoreSettings(input: $input) { id } }`;
const GET_PRODUCTS = gql`query { localProducts { products { id name slug price unit stock isAvailable isOrganic isRegional isFeatured categoryId } total } }`;
const CREATE_PRODUCT = gql`mutation CreateLocalProduct($input: CreateLocalProductInput!) { createLocalProduct(input: $input) { id name } }`;
const UPDATE_PRODUCT = gql`mutation UpdateLocalProduct($id: ID!, $input: UpdateLocalProductInput!) { updateLocalProduct(id: $id, input: $input) { id } }`;
const DELETE_PRODUCT = gql`mutation DeleteLocalProduct($id: ID!) { deleteLocalProduct(id: $id) }`;
const GET_DEALS = gql`query { localDeals { deals { id title discountType discountValue startsAt endsAt isActive } total } }`;
const CREATE_DEAL = gql`mutation CreateLocalDeal($input: CreateLocalDealInput!) { createLocalDeal(input: $input) { id } }`;
const DELETE_DEAL = gql`mutation DeleteLocalDeal($id: ID!) { deleteLocalDeal(id: $id) }`;
const GET_ORDERS = gql`query LocalOrders($status: String) { localOrders(status: $status) { orders { id orderNumber orderType customerName status total pickupDate pickupCode createdAt } total } }`;
const UPDATE_ORDER_STATUS = gql`mutation UpdateLocalOrderStatus($id: ID!, $input: UpdateLocalOrderStatusInput!) { updateLocalOrderStatus(id: $id, input: $input) { id status } }`;
const CONFIRM_PICKUP = gql`mutation ConfirmLocalOrderPickup($orderId: ID!, $pickupCode: String!) { confirmLocalOrderPickup(orderId: $orderId, pickupCode: $pickupCode) }`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-blue-100 text-blue-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
  ready:     'bg-green-100 text-green-800',
  picked_up: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
};
const STATUS_LABELS: Record<string, string> = {
  pending:'Ausstehend', confirmed:'Bestätigt', ready:'Bereit', picked_up:'Abgeholt', cancelled:'Storniert',
};

const STORE_TYPES: Record<string, string> = {
  market:'Markt', pharmacy:'Apotheke', florist:'Florist', bakery:'Bäckerei',
  butcher:'Metzgerei', kiosk:'Kiosk', farm:'Hof', other:'Sonstiges',
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={() => onChange(!checked)} className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-muted'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 border-b mb-4">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data, loading } = useQuery(GET_SETTINGS);
  const [update] = useMutation(UPDATE_SETTINGS);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const s = data?.localStoreSettings;

  if (loading || !s) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  const val = (key: string) => key in form ? form[key] : s[key];

  const save = async () => {
    await update({ variables: { input: form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <Card>
        <CardHeader><CardTitle className="text-sm">Store-Typ</CardTitle></CardHeader>
        <CardContent>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={(val('storeType') as string) ?? 'other'}
            onChange={e => setForm(f => ({ ...f, storeType: e.target.value }))}
          >
            {Object.entries(STORE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Abholung & Lieferung</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle checked={!!val('pickupEnabled')} onChange={v => setForm(f => ({ ...f, pickupEnabled: v }))} label="Abholung aktiviert" />
          <Toggle checked={!!val('deliveryEnabled')} onChange={v => setForm(f => ({ ...f, deliveryEnabled: v }))} label="Lieferung aktiviert" />
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm">Slot-Dauer (Min)</span>
            <input type="number" className="w-20 border rounded px-2 py-1 text-sm text-right" value={(val('pickupSlotDuration') as number) ?? ''} onChange={e => setForm(f => ({ ...f, pickupSlotDuration: parseInt(e.target.value) || null }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Max. Bestellungen/Slot</span>
            <input type="number" className="w-20 border rounded px-2 py-1 text-sm text-right" value={(val('maxOrdersPerSlot') as number) ?? ''} onChange={e => setForm(f => ({ ...f, maxOrdersPerSlot: parseInt(e.target.value) || null }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Mindestbestellwert (Cent)</span>
            <input type="number" className="w-24 border rounded px-2 py-1 text-sm text-right" value={(val('minOrderAmount') as number) ?? ''} onChange={e => setForm(f => ({ ...f, minOrderAmount: parseInt(e.target.value) || null }))} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Zahlungsarten</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle checked={!!val('cashOnPickupEnabled')} onChange={v => setForm(f => ({ ...f, cashOnPickupEnabled: v }))} label="Bar bei Abholung" />
          <Toggle checked={!!val('cardOnPickupEnabled')} onChange={v => setForm(f => ({ ...f, cardOnPickupEnabled: v }))} label="Karte bei Abholung" />
          <Toggle checked={!!val('onlinePaymentEnabled')} onChange={v => setForm(f => ({ ...f, onlinePaymentEnabled: v }))} label="Online-Zahlung" />
        </CardContent>
      </Card>
      <Button onClick={save} disabled={Object.keys(form).length === 0}>
        {saved ? <><CheckCircle className="h-4 w-4 mr-2" />Gespeichert</> : 'Speichern'}
      </Button>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const { data, loading, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', unit: 'Stück', stock: '', isUnlimited: true, isOrganic: false, isRegional: false });

  const products = data?.localProducts?.products ?? [];

  const save = async () => {
    await createProduct({ variables: { input: { name: form.name, price: Math.round(parseFloat(form.price) * 100), unit: form.unit, stock: form.isUnlimited ? null : parseInt(form.stock), isUnlimited: form.isUnlimited, isOrganic: form.isOrganic, isRegional: form.isRegional } } });
    await refetch();
    setModal(false);
    setForm({ name: '', price: '', unit: 'Stück', stock: '', isUnlimited: true, isOrganic: false, isRegional: false });
  };

  const toggleAvailable = async (id: string, isAvailable: boolean) => {
    await updateProduct({ variables: { id, input: { isAvailable: !isAvailable } } });
    await refetch();
  };

  const del = async (id: string) => {
    if (!confirm('Produkt löschen?')) return;
    await deleteProduct({ variables: { id } });
    await refetch();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{products.length} Produkte</p>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" />Produkt hinzufügen</Button>
      </div>
      <div className="space-y-2">
        {products.map((p: { id: string; name: string; price: number; unit: string; stock: number | null; isAvailable: boolean; isOrganic: boolean; isRegional: boolean; isUnlimited: boolean }) => (
          <div key={p.id} className={`flex items-center justify-between p-3 border rounded-lg bg-card ${!p.isAvailable ? 'opacity-60' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{p.name}</span>
                {p.isOrganic && <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">🌿 Bio</span>}
                {p.isRegional && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded">📍 Regional</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {fmt(p.price)} / {p.unit}
                {!p.isUnlimited && p.stock !== null && ` · ${p.stock} verfügbar`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAvailable(p.id, p.isAvailable)} className={`text-xs px-2 py-1 rounded ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.isAvailable ? 'Verfügbar' : 'Nicht verf.'}
              </button>
              <button onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-center py-12 text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-3" /><p>Noch keine Produkte</p></div>}
      </div>
      <Modal open={modal} title="Neues Produkt" onClose={() => setModal(false)}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium">Name *</label><input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Preis (€) *</label><input type="number" step="0.01" className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Einheit</label><input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg, Stück, Bund..." /></div>
          </div>
          <Toggle checked={form.isUnlimited} onChange={v => setForm(f => ({ ...f, isUnlimited: v }))} label="Unbegrenzt verfügbar" />
          {!form.isUnlimited && <div><label className="text-sm font-medium">Lagerbestand</label><input type="number" className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>}
          <div className="flex gap-4">
            <Toggle checked={form.isOrganic} onChange={v => setForm(f => ({ ...f, isOrganic: v }))} label="Bio" />
            <Toggle checked={form.isRegional} onChange={v => setForm(f => ({ ...f, isRegional: v }))} label="Regional" />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setModal(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={!form.name || !form.price}>Erstellen</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────

function DealsTab() {
  const { data, loading, refetch } = useQuery(GET_DEALS);
  const [createDeal] = useMutation(CREATE_DEAL);
  const [deleteDeal] = useMutation(DELETE_DEAL);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', discountType: 'percent', discountValue: '', startsAt: '', endsAt: '' });

  const deals = data?.localDeals?.deals ?? [];

  const save = async () => {
    await createDeal({ variables: { input: { title: form.title, discountType: form.discountType, discountValue: form.discountType === 'fixed' ? Math.round(parseFloat(form.discountValue) * 100) : parseInt(form.discountValue), startsAt: new Date(form.startsAt), endsAt: new Date(form.endsAt) } } });
    await refetch();
    setModal(false);
    setForm({ title: '', discountType: 'percent', discountValue: '', startsAt: '', endsAt: '' });
  };

  const del = async (id: string) => {
    if (!confirm('Deal löschen?')) return;
    await deleteDeal({ variables: { id } });
    await refetch();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{deals.length} Aktionen</p>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" />Aktion erstellen</Button>
      </div>
      <div className="space-y-2">
        {deals.map((d: { id: string; title: string; discountType: string; discountValue: number; startsAt: string; endsAt: string; isActive: boolean }) => (
          <div key={d.id} className={`flex items-center justify-between p-3 border rounded-lg bg-card ${!d.isActive ? 'opacity-60' : ''}`}>
            <div>
              <p className="font-medium text-sm">{d.title}</p>
              <p className="text-xs text-muted-foreground">
                {d.discountType === 'percent' ? `${d.discountValue}% Rabatt` : `${fmt(d.discountValue)} Rabatt`}
                {' · '}{new Date(d.startsAt).toLocaleDateString('de-DE')} – {new Date(d.endsAt).toLocaleDateString('de-DE')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.isActive ? 'Aktiv' : 'Inaktiv'}</span>
              <button onClick={() => del(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
        {deals.length === 0 && <div className="text-center py-12 text-muted-foreground"><Tag className="h-10 w-10 mx-auto mb-3" /><p>Noch keine Aktionen</p></div>}
      </div>
      <Modal open={modal} title="Neue Aktion" onClose={() => setModal(false)}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium">Titel *</label><input className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Typ</label>
              <select className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                <option value="percent">Prozent</option>
                <option value="fixed">Festbetrag</option>
              </select>
            </div>
            <div><label className="text-sm font-medium">{form.discountType === 'percent' ? 'Prozent (%)' : 'Betrag (€)'}</label><input type="number" step={form.discountType === 'percent' ? '1' : '0.01'} className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Von</label><input type="date" className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Bis</label><input type="date" className="w-full border rounded px-3 py-2 mt-1 text-sm" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} /></div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setModal(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={!form.title || !form.discountValue || !form.startsAt || !form.endsAt}>Erstellen</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pickupModal, setPickupModal] = useState<{ open: boolean; orderId: string }>({ open: false, orderId: '' });
  const [pickupCode, setPickupCode] = useState('');
  const { data, loading, refetch } = useQuery(GET_ORDERS, { variables: { status: statusFilter }, pollInterval: 30000 });
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);
  const [confirmPickup] = useMutation(CONFIRM_PICKUP);

  const orders = data?.localOrders?.orders ?? [];

  const advance = async (id: string, currentStatus: string) => {
    const nextMap: Record<string, string> = { pending: 'confirmed', confirmed: 'ready' };
    const next = nextMap[currentStatus];
    if (!next) return;
    await updateStatus({ variables: { id, input: { status: next } } });
    await refetch();
  };

  const doConfirmPickup = async () => {
    await confirmPickup({ variables: { orderId: pickupModal.orderId, pickupCode } });
    setPickupModal({ open: false, orderId: '' });
    setPickupCode('');
    await refetch();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[undefined, 'pending', 'confirmed', 'ready', 'picked_up'].map(s => (
          <button key={String(s)} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
            {s === undefined ? 'Alle' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {orders.map((o: { id: string; orderNumber: string; orderType: string; customerName: string; status: string; total: number; pickupDate: string | null; pickupCode: string | null; createdAt: string | null }) => (
          <div key={o.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">#{o.orderNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[o.status] ?? 'bg-gray-100'}`}>{STATUS_LABELS[o.status] ?? o.status}</span>
                <span className="text-xs text-muted-foreground">{o.orderType === 'pickup' ? '🏃 Abholung' : '🚴 Lieferung'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{o.customerName}</p>
              {o.pickupDate && <p className="text-xs text-muted-foreground">📅 {o.pickupDate}</p>}
              {o.pickupCode && <p className="text-xs font-mono text-primary">Code: {o.pickupCode}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{fmt(o.total)}</span>
              {(o.status === 'pending' || o.status === 'confirmed') && (
                <Button size="sm" onClick={() => advance(o.id, o.status)}>
                  {o.status === 'pending' ? 'Bestätigen' : 'Fertig'}
                </Button>
              )}
              {o.status === 'ready' && o.pickupCode && (
                <Button size="sm" onClick={() => setPickupModal({ open: true, orderId: o.id })}>
                  <QrCode className="h-4 w-4 mr-1" />Code prüfen
                </Button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-center py-12 text-muted-foreground"><Clock className="h-10 w-10 mx-auto mb-3" /><p>Keine Bestellungen</p></div>}
      </div>
      <Modal open={pickupModal.open} title="Abholcode bestätigen" onClose={() => setPickupModal({ open: false, orderId: '' })}>
        <div>
          <label className="text-sm font-medium">Code eingeben</label>
          <input className="w-full border rounded px-3 py-2 mt-1 text-sm font-mono uppercase tracking-widest" value={pickupCode} onChange={e => setPickupCode(e.target.value.toUpperCase())} placeholder="ABC123" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setPickupModal({ open: false, orderId: '' })}>Abbrechen</Button>
          <Button onClick={doConfirmPickup} disabled={!pickupCode}>Bestätigen</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LocalStorePage() {
  const [tab, setTab] = useState('orders');
  const tabs = [
    { key: 'orders',   label: '📦 Bestellungen' },
    { key: 'products', label: '🥕 Produkte' },
    { key: 'deals',    label: '🏷️ Aktionen' },
    { key: 'settings', label: '⚙️ Einstellungen' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Store className="h-7 w-7" />
        <div>
          <h1 className="text-2xl font-bold">Lokaler Handel</h1>
          <p className="text-sm text-muted-foreground">Produkte, Aktionen &amp; Abholbestellungen</p>
        </div>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'orders'   && <OrdersTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'deals'    && <DealsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}