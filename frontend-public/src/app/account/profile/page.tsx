// 📂 frontend-public/src/app/account/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/customer-auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProfilePage() {
  const { customer, isLoading, isAuthenticated, logout } = useCustomerAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/profile');
    }
    if (customer) {
      setForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email,
      });
    }
  }, [isLoading, isAuthenticated, customer, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('customer_token');
      const tenantSlug = window.location.hostname.split('.')[0];
      const res = await fetch(`${API_URL}/api/public/${tenantSlug}/account/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      if (!res.ok) throw new Error('Fehler beim Speichern');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Änderungen konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mein Account</h1>
          <p className="text-gray-500 mt-1 text-sm">{customer?.email}</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="text-sm text-gray-400 hover:text-red-600 transition-colors"
        >
          Abmelden
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        <Link
          href="/account"
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          Bestellungen
        </Link>
        <Link
          href="/account/profile"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Profil
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profilangaben</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>✓</span> Änderungen gespeichert
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vorname</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-colors"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nachname</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-colors"
                placeholder="Mustermann"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">E-Mail-Adresse kann nicht geändert werden</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}