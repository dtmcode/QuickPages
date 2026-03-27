'use client';

import { useCustomerAuth } from '@/contexts/customer-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AccountPage() {
  const { customer, isLoading, isAuthenticated, logout } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('customer_token');
    const tenantSlug = window.location.hostname.split('.')[0];
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    fetch(`${API_URL}/api/public/${tenantSlug}/account/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated]);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      pending: { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
      processing: {
        label: 'In Bearbeitung',
        color: 'bg-blue-100 text-blue-800',
      },
      completed: {
        label: 'Abgeschlossen',
        color: 'bg-green-100 text-green-800',
      },
      cancelled: { label: 'Storniert', color: 'bg-red-100 text-red-800' },
    };
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mein Account</h1>
          <p className="text-gray-600 mt-1">
            Willkommen zurück,{' '}
            <span className="font-medium">
              {customer?.firstName || customer?.email}
            </span>
            !
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="text-sm text-gray-500 hover:text-red-600 transition"
        >
          Abmelden
        </button>
      </div>

      {/* Account Nav */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        <Link
          href="/account"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Bestellungen
        </Link>
        <Link
          href="/account/profile"
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
        >
          Profil
        </Link>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Meine Bestellungen
        </h2>

        {ordersLoading ? (
          <div className="text-center py-12 text-gray-500">
            Bestellungen werden geladen...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Noch keine Bestellungen
            </h3>
            <p className="text-gray-500 mb-6">
              Du hast noch nichts bestellt.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              → Zum Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusLabel(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}