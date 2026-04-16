'use client';
// frontend-public\src\app\local-store\LocalStoreClient.tsx

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

interface Product {
  id: string; name: string; price: number; unit: string;
  stock: number | null; isUnlimited: boolean; isOrganic: boolean;
  isRegional: boolean; description: string | null;
}
interface Slot { id: string; dayOfWeek: number; startTime: string; endTime: string; maxOrders: number; }
interface CartItem { product: Product; quantity: number; }
interface Settings { pickupEnabled: boolean; deliveryEnabled: boolean; minOrderAmount: number | null; }

export default function LocalStoreClient({
  products, settings, slots, tenant,
}: {
  products: Product[]; settings: Settings | null; slots: Slot[]; tenant: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'shop' | 'checkout'>('shop');
  const [form, setForm] = useState({ name: '', email: '', phone: '', pickupDate: '', slotId: '', notes: '' });
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const addToCart = (product: Product) => {
    setCart(c => {
      const ex = c.find(i => i.product.id === product.id);
      if (ex) return c.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(c => c.filter(i => i.product.id !== id));
    else setCart(c => c.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const minOk = !settings?.minOrderAmount || subtotal >= settings.minOrderAmount;

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/public/${tenant}/local-store/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          customerName: form.name,
          customerEmail: form.email || undefined,
          customerPhone: form.phone || undefined,
          pickupSlotId: form.slotId || undefined,
          pickupDate: form.pickupDate || undefined,
          notes: form.notes || undefined,
          paymentMethod: 'cash_on_pickup',
          items: cart.map(i => ({
            localProductId: i.product.id,
            productName: i.product.name,
            productPrice: i.product.price,
            unit: i.product.unit,
            quantity: i.quantity,
          })),
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setSuccess(order.pickupCode ?? 'OK');
        setCart([]);
      }
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Bestellung eingegangen!</h2>
        {success !== 'OK' && (
          <div className="bg-gray-100 rounded-xl p-4 my-4">
            <p className="text-sm text-gray-600 mb-1">Dein Abholcode:</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{success}</p>
          </div>
        )}
        <p className="text-gray-600 mb-6">Zeige diesen Code bei der Abholung vor.</p>
        <button onClick={() => { setSuccess(null); setStep('shop'); }} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">
          Neue Bestellung
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🏪 Online-Shop</h1>
          {cart.length > 0 && (
            <button onClick={() => setStep('checkout')}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium">
              🛒 {cartCount} · {fmt(subtotal)}
            </button>
          )}
        </div>
      </div>

      {step === 'shop' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => {
              const inCart = cart.find(i => i.product.id === p.id);
              return (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium">{p.name}</span>
                        {p.isOrganic && <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">🌿 Bio</span>}
                        {p.isRegional && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded">📍</span>}
                      </div>
                      {p.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div>
                      <span className="font-bold">{fmt(p.price)}</span>
                      <span className="text-xs text-gray-500 ml-1">/ {p.unit}</span>
                      {!p.isUnlimited && p.stock !== null && p.stock <= 5 && (
                        <span className="block text-xs text-orange-500">Noch {p.stock} verfügbar</span>
                      )}
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(p.id, inCart.quantity - 1)} className="w-8 h-8 bg-gray-100 rounded-full font-bold">−</button>
                        <span className="w-5 text-center font-medium">{inCart.quantity}</span>
                        <button onClick={() => updateQty(p.id, inCart.quantity + 1)} className="w-8 h-8 bg-primary-600 text-white rounded-full font-bold">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="w-9 h-9 bg-primary-600 text-white rounded-full text-xl font-bold hover:bg-primary-700">+</button>
                    )}
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📦</p>
                <p>Keine Produkte verfügbar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <button onClick={() => setStep('shop')} className="text-primary-600 hover:underline text-sm">← Zurück</button>
          <h2 className="text-xl font-bold">Bestellung abschließen</h2>

          {/* Order Type */}
          {settings && (
            <div className="flex gap-2">
              {settings.pickupEnabled && (
                <button onClick={() => setOrderType('pickup')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${orderType === 'pickup' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                  🏃 Abholung
                </button>
              )}
              {settings.deliveryEnabled && (
                <button onClick={() => setOrderType('delivery')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${orderType === 'delivery' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                  🚴 Lieferung
                </button>
              )}
            </div>
          )}

          {/* Cart summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            {cart.map(i => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span>{i.product.name} × {i.quantity} {i.product.unit}</span>
                <span className="font-medium">{fmt(i.product.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t"><span>Gesamt</span><span>{fmt(subtotal)}</span></div>
            {settings?.minOrderAmount && !minOk && (
              <p className="text-xs text-orange-500">Mindestbestellwert: {fmt(settings.minOrderAmount)}</p>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div><label className="text-sm font-medium">Name *</label><input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">E-Mail</label><input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Telefon</label><input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>

            {orderType === 'pickup' && slots.length > 0 && (
              <div>
                <label className="text-sm font-medium">Abhol-Zeitfenster</label>
                <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.slotId} onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}>
                  <option value="">Bitte wählen</option>
                  {slots.map((s: Slot) => (
                    <option key={s.id} value={s.id}>{DAYS[s.dayOfWeek]} {s.startTime}–{s.endTime}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={placeOrder}
            disabled={!form.name || loading || !minOk}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Wird gesendet...' : '✅ Jetzt bestellen'}
          </button>
        </div>
      )}
    </div>
  );
}