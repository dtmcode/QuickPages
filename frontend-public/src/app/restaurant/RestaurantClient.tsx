'use client';
// frontend-public\src\app\restaurant\RestaurantClient.tsx

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

interface MenuItem {
  id: string; name: string; description: string | null; price: number;
  isVegan: boolean; isVegetarian: boolean; isSpicy: boolean; isAvailable: boolean;
}
interface MenuCategory { id: string; name: string; items: MenuItem[]; }
interface CartItem { item: MenuItem; quantity: number; notes: string; }
interface Settings {
  dineInEnabled: boolean; pickupEnabled: boolean; deliveryEnabled: boolean;
  minOrderAmount: number | null; deliveryFee: number | null;
}

export default function RestaurantClient({
  menu, settings, tenant,
}: {
  menu: MenuCategory[];
  settings: Settings | null;
  tenant: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in'>('pickup');
  const [step, setStep] = useState<'menu' | 'cart' | 'confirm'>('menu');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', tableId: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(menu[0]?.id ?? '');

  const addToCart = (item: MenuItem) => {
    setCart(c => {
      const ex = c.find(i => i.item.id === item.id);
      if (ex) return c.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { item, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.item.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(c => c.map(i => i.item.id === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.item.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? (settings?.deliveryFee ?? 0) : 0;
  const total = subtotal + deliveryFee;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/public/${tenant}/restaurant/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          customerName: form.name,
          customerEmail: form.email || undefined,
          customerPhone: form.phone || undefined,
          deliveryAddress: orderType === 'delivery' ? form.address : undefined,
          notes: form.notes || undefined,
          paymentMethod: 'cash',
          items: cart.map(i => ({
            menuItemId: i.item.id,
            menuItemName: i.item.name,
            menuItemPrice: i.item.price,
            quantity: i.quantity,
            notes: i.notes || undefined,
          })),
        }),
      });
      if (res.ok) { setSuccess(true); setCart([]); }
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Bestellung eingegangen!</h2>
        <p className="text-gray-600 mb-6">Wir bereiten deine Bestellung vor.</p>
        <button onClick={() => { setSuccess(false); setStep('menu'); }} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700">
          Neue Bestellung
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🍽️ Speisekarte</h1>
          {cart.length > 0 && (
            <button onClick={() => setStep('cart')}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
              🛒 {cartCount} · {fmt(subtotal)}
            </button>
          )}
        </div>

        {/* Order Type */}
        {settings && (
          <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
            {settings.pickupEnabled && (
              <button onClick={() => setOrderType('pickup')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${orderType === 'pickup' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                🏃 Abholung
              </button>
            )}
            {settings.deliveryEnabled && (
              <button onClick={() => setOrderType('delivery')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${orderType === 'delivery' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                🚴 Lieferung {settings.deliveryFee ? `(+${fmt(settings.deliveryFee)})` : ''}
              </button>
            )}
            {settings.dineInEnabled && (
              <button onClick={() => setOrderType('dine_in')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${orderType === 'dine_in' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                🍽️ Vor Ort
              </button>
            )}
          </div>
        )}
      </div>

      {step === 'menu' && (
        <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
          {/* Category Sidebar */}
          <div className="hidden md:flex flex-col gap-1 w-40 shrink-0">
            {menu.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${activeCategory === cat.id ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 space-y-8">
            {menu.filter(cat => cat.items.length > 0).map(cat => (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <h2 className="text-lg font-bold mb-3 pb-2 border-b">{cat.name}</h2>
                <div className="space-y-3">
                  {cat.items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.isVegan && <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">🌱</span>}
                          {item.isVegetarian && !item.isVegan && <span className="text-xs bg-green-50 text-green-600 px-1.5 rounded">🥬</span>}
                          {item.isSpicy && <span className="text-xs">🌶️</span>}
                        </div>
                        {item.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                        <p className="font-bold mt-1">{fmt(item.price)}</p>
                      </div>
                      {item.isAvailable ? (
                        <button onClick={() => addToCart(item)}
                          className="w-9 h-9 bg-primary-600 text-white rounded-full text-xl font-bold hover:bg-primary-700 flex items-center justify-center shrink-0">
                          +
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Nicht verfügbar</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {menu.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🍽️</p>
                <p>Speisekarte wird bald verfügbar sein</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'cart' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <button onClick={() => setStep('menu')} className="text-primary-600 hover:underline text-sm">← Zurück zur Speisekarte</button>
          <h2 className="text-xl font-bold">Deine Bestellung</h2>
          {cart.map(i => (
            <div key={i.item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium">{i.item.name}</p>
                <p className="text-sm text-gray-500">{fmt(i.item.price)} × {i.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(i.item.id, i.quantity - 1)} className="w-8 h-8 bg-gray-100 rounded-full font-bold">−</button>
                <span className="w-6 text-center font-medium">{i.quantity}</span>
                <button onClick={() => updateQty(i.item.id, i.quantity + 1)} className="w-8 h-8 bg-gray-100 rounded-full font-bold">+</button>
              </div>
              <span className="font-bold w-16 text-right">{fmt(i.item.price * i.quantity)}</span>
            </div>
          ))}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between text-sm text-gray-500"><span>Zwischensumme</span><span>{fmt(subtotal)}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between text-sm text-gray-500"><span>Lieferung</span><span>{fmt(deliveryFee)}</span></div>}
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Gesamt</span><span>{fmt(total)}</span></div>
          </div>
          <button onClick={() => setStep('confirm')} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-700">
            Weiter zur Bestellung
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <button onClick={() => setStep('cart')} className="text-primary-600 hover:underline text-sm">← Zurück zum Warenkorb</button>
          <h2 className="text-xl font-bold">Deine Daten</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">E-Mail</label>
              <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefon</label>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            {orderType === 'delivery' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Lieferadresse *</label>
                <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Anmerkungen</label>
              <textarea rows={2} className="mt-1 w-full border rounded-lg px-3 py-2 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between font-bold text-lg">
            <span>Gesamt</span><span>{fmt(total)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={!form.name || loading || (orderType === 'delivery' && !form.address)}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Wird gesendet...' : '🍽️ Jetzt bestellen'}
          </button>
        </div>
      )}
    </div>
  );
}