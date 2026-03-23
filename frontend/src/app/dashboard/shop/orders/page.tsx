'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ORDERS_QUERY = gql`
  query GetOrders {
    orders {
      orders {
        id
        orderNumber
        customerName
        customerEmail
        status
        total
        createdAt
      }
      total
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

export default function OrdersPage() {
  const { data, loading, refetch } = useQuery(ORDERS_QUERY);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    };
    return labels[status] || status;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus({ variables: { id, status: newStatus } });
      refetch();
    } catch (error) {
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  const getTotalRevenue = () => {
    if (!data?.orders.orders) return 0;
    return data.orders.orders
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, order: any) => sum + order.total, 0);
  };

  const getStatusCount = (status: string) => {
    if (!data?.orders.orders) return 0;
    return data.orders.orders.filter((o: any) => o.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Bestellungen</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Verwalte deine Shop-Bestellungen
          </p>
        </div>
      </div>

      {loading && <div className="text-center py-12">Lädt...</div>}

      {data && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {data.orders.total}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Ausstehend</div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {getStatusCount('pending')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">In Bearbeitung</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {getStatusCount('processing')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Umsatz</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {formatPrice(getTotalRevenue())}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          {data.orders.total === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Noch keine Bestellungen
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sobald Kunden bestellen, erscheinen sie hier
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Alle Bestellungen ({data.orders.total})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Bestellnummer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Kunde
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Betrag
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.orders.orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.customerName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatPrice(order.total)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}
                            >
                              <option value="pending">Ausstehend</option>
                              <option value="processing">In Bearbeitung</option>
                              <option value="completed">Abgeschlossen</option>
                              <option value="cancelled">Storniert</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/shop/orders/${order.id}`)}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}