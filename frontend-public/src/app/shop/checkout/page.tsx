'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', zipCode: '', country: 'Deutschland', notes: '',
  });

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

  const shipping = total >= 5000 ? 0 : 499;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    router.push('/shop/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const tenantSlug = window.location.hostname.split('.')[0];

      const res = await fetch(`${API_URL}/api/public/${tenantSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerAddress: `${formData.address}, ${formData.zipCode} ${formData.city}, ${formData.country}`,
          notes: formData.notes,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity,
          })),
          subtotal: total,
          shipping,
          total: finalTotal,
        }),
      });

      const data = await res.json();
      clearCart();
      router.push(`/shop/order-success?orderNumber=${data.orderNumber}`);
    } catch {
      alert('Fehler beim Bestellen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/shop/cart" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">← Zurück zum Warenkorb</Link>
      <h1 className="text-3xl font-bold mb-8">Kasse</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Kontaktinformationen</h2>
              <input type="email" required placeholder="E-Mail *" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="Vorname *" value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" required placeholder="Nachname *" value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Lieferadresse</h2>
              <input type="text" required placeholder="Straße und Hausnummer *" value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="PLZ *" value={formData.zipCode}
                  onChange={e => setFormData({...formData, zipCode: e.target.value})}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" required placeholder="Stadt *" value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea rows={3} placeholder="Anmerkungen (optional)" value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4">Bestellung ({items.length} Artikel)</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Versand</span><span>{shipping === 0 ? 'Kostenlos' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Gesamt</span><span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50">
              {loading ? 'Wird bearbeitet...' : 'Zahlungspflichtig bestellen'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">inkl. MwSt.</p>
          </div>
        </div>
      </form>
    </div>
  );
}