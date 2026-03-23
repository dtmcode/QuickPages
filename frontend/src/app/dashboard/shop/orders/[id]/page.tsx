'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use } from 'react';
import { useRouter } from 'next/navigation';

const ORDER_QUERY = gql`
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      orderNumber
      customerName
      customerEmail
      customerAddress
      status
      subtotal
      tax
      shipping
      total
      notes
      createdAt
      items {
        id
        productName
        productPrice
        quantity
        total
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, refetch } = useQuery(ORDER_QUERY, { variables: { id } });
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const router = useRouter();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrderStatus({ variables: { id, status: newStatus } });
      refetch();
    } catch (error) {
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Lädt...</div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="text-center py-12">
        <p>Bestellung nicht gefunden</p>
        <Link href="/dashboard/shop/orders">
          <Button className="mt-4">← Zurück zu Bestellungen</Button>
        </Link>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/shop/orders">
            <Button variant="ghost" size="sm">← Zurück</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Bestellung #{order.orderNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Erstellt am {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(order.status)}`}>
            {order.status === 'pending' && 'Ausstehend'}
            {order.status === 'processing' && 'In Bearbeitung'}
            {order.status === 'completed' && 'Abgeschlossen'}
            {order.status === 'cancelled' && 'Storniert'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bestellte Artikel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}x {formatPrice(item.productPrice)}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.total)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Zwischensumme</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Versand</span>
                  <span className="font-medium">
                    {order.shipping === 0 ? 'Kostenlos' : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">MwSt (19%)</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Gesamt</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Anmerkungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {order.customerName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">E-Mail</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {order.customerEmail}
                </div>
              </div>
              {order.customerAddress && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lieferadresse</div>
                  <div className="font-medium text-gray-900 dark:text-white whitespace-pre-line">
                    {order.customerAddress}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status ändern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                fullWidth
                variant={order.status === 'processing' ? 'default' : 'ghost'}
                onClick={() => handleStatusChange('processing')}
                disabled={order.status === 'processing'}
              >
                🔄 In Bearbeitung
              </Button>
              <Button
                fullWidth
                variant={order.status === 'completed' ? 'default' : 'ghost'}
                onClick={() => handleStatusChange('completed')}
                disabled={order.status === 'completed'}
              >
                ✅ Abgeschlossen
              </Button>
              <Button
                fullWidth
                variant={order.status === 'cancelled' ? 'danger' : 'ghost'}
                onClick={() => handleStatusChange('cancelled')}
                disabled={order.status === 'cancelled'}
              >
                ❌ Stornieren
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}