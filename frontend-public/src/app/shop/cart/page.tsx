'use client';

import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

  const shipping = total >= 5000 ? 0 : 499;
  const grandTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Dein Warenkorb ist leer</h2>
          <Link href="/shop" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            → Zum Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">🛒 Warenkorb ({itemCount})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} pro Stück</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100">−</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100">+</button>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700">Entfernen</button>
              </div>
            </div>
          ))}
          <div className="text-right">
            <button onClick={() => { if (confirm('Warenkorb leeren?')) clearCart(); }}
              className="text-sm text-gray-500 hover:text-red-500">🗑️ Warenkorb leeren</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Bestellübersicht</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Zwischensumme</span><span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Versand</span>
              <span>{shipping === 0 ? <span className="text-green-600">Kostenlos</span> : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-500">Noch {formatPrice(5000 - total)} bis zum kostenlosen Versand</p>
            )}
          </div>
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Gesamt</span><span>{formatPrice(grandTotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">inkl. MwSt.</p>
          </div>
          <Link href="/shop/checkout"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            Zur Kasse →
          </Link>
          <Link href="/shop"
            className="block w-full text-center py-3 rounded-lg border mt-2 hover:bg-gray-50 transition">
            ← Weiter einkaufen
          </Link>
        </div>
      </div>
    </div>
  );
}