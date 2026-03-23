'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface BookingService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  price: number;
  color: string;
  max_bookings_per_slot: number;
  requires_confirmation: boolean;
  is_active: boolean;
}

interface Appointment {
  id: string;
  service_id: string;
  service_name: string;
  service_color: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_notes: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  duration_minutes: number;
  created_at: string;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BookingSettings {
  timezone: string;
  minNoticeHours: number;
  maxAdvanceDays: number;
  slotIntervalMinutes: number;
  confirmationEmailEnabled: boolean;
  reminderEmailHours: number;
  cancellationPolicy: string | null;
  bookingPageTitle: string | null;
  bookingPageDescription: string | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ==================== GRAPHQL HELPER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ==================== DAY NAMES ====================
const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// ==================== COMPONENT ====================
export default function BookingDashboardPage() {
  const [tab, setTab] = useState<'appointments' | 'services' | 'availability' | 'settings'>('appointments');
  const [toast, setToast] = useState<Toast | null>(null);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  // Services State
  const [services, setServices] = useState<BookingService[]>([]);
  const [editingService, setEditingService] = useState<Partial<BookingService> | null>(null);

  // Availability State
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '17:00',
      isActive: i >= 1 && i <= 5,
    }))
  );

  // Settings State
  const [settings, setSettings] = useState<BookingSettings>({
    timezone: 'Europe/Berlin',
    minNoticeHours: 24,
    maxAdvanceDays: 60,
    slotIntervalMinutes: 30,
    confirmationEmailEnabled: true,
    reminderEmailHours: 24,
    cancellationPolicy: null,
    bookingPageTitle: null,
    bookingPageDescription: null,
  });

  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== LOAD DATA ====================
  const loadAppointments = useCallback(async () => {
    try {
      const data = await gqlRequest<{ bookingAppointments: Appointment[] }>(`
        query($status: String) {
          bookingAppointments(status: $status) {
            id service_id service_name service_color customer_name customer_email
            customer_phone customer_notes date start_time end_time status duration_minutes created_at
          }
        }
      `, statusFilter !== 'all' ? { status: statusFilter } : {});
      setAppointments(data.bookingAppointments);
    } catch (err) {
      console.error('Fehler beim Laden der Termine:', err);
    }
  }, [statusFilter]);

  const loadServices = useCallback(async () => {
    try {
      const data = await gqlRequest<{ bookingServices: BookingService[] }>(`
        query {
          bookingServices {
            id name slug description duration_minutes buffer_minutes price color
            max_bookings_per_slot requires_confirmation is_active
          }
        }
      `);
      setServices(data.bookingServices);
    } catch (err) {
      console.error('Fehler beim Laden der Services:', err);
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    try {
      const data = await gqlRequest<{ bookingAvailability: AvailabilitySlot[] }>(`
        query { bookingAvailability { dayOfWeek startTime endTime isActive } }
      `);
      if (data.bookingAvailability.length > 0) {
        setAvailability(data.bookingAvailability);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Verfügbarkeit:', err);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await gqlRequest<{ bookingSettings: BookingSettings }>(`
        query {
          bookingSettings {
            timezone minNoticeHours maxAdvanceDays slotIntervalMinutes
            confirmationEmailEnabled reminderEmailHours cancellationPolicy
            bookingPageTitle bookingPageDescription
          }
        }
      `);
      if (data.bookingSettings) setSettings(data.bookingSettings);
    } catch (err) {
      console.error('Fehler beim Laden der Einstellungen:', err);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadAppointments(), loadServices(), loadAvailability(), loadSettings()]);
      setLoading(false);
    };
    loadAll();
  }, [loadAppointments, loadServices, loadAvailability, loadSettings]);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, loadAppointments]);

  // ==================== ACTIONS ====================
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      await gqlRequest(`
        mutation($id: String!, $status: String!) {
          updateAppointmentStatus(appointmentId: $id, status: $status) { id status }
        }
      `, { id, status });
      showToast(`Status auf "${status}" geändert`);
      loadAppointments();
    } catch {
      showToast('Fehler beim Aktualisieren', 'error');
    }
  };

  const saveService = async () => {
    if (!editingService?.name || !editingService.duration_minutes) return;
    try {
      if (editingService.id) {
        await gqlRequest(`
          mutation($id: String!, $input: UpdateBookingServiceInput!) {
            updateBookingService(serviceId: $id, input: $input) { id }
          }
        `, {
          id: editingService.id,
          input: {
            name: editingService.name,
            description: editingService.description || null,
            durationMinutes: editingService.duration_minutes,
            bufferMinutes: editingService.buffer_minutes || 0,
            price: editingService.price || 0,
            color: editingService.color || '#3b82f6',
            requiresConfirmation: editingService.requires_confirmation || false,
          },
        });
      } else {
        await gqlRequest(`
          mutation($input: CreateBookingServiceInput!) {
            createBookingService(input: $input) { id }
          }
        `, {
          input: {
            name: editingService.name,
            durationMinutes: editingService.duration_minutes,
            description: editingService.description || null,
            bufferMinutes: editingService.buffer_minutes || 0,
            price: editingService.price || 0,
            color: editingService.color || '#3b82f6',
            requiresConfirmation: editingService.requires_confirmation || false,
          },
        });
      }
      showToast(editingService.id ? 'Service aktualisiert' : 'Service erstellt');
      setEditingService(null);
      loadServices();
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Service wirklich löschen?')) return;
    try {
      await gqlRequest(`mutation($id: String!) { deleteBookingService(serviceId: $id) }`, { id });
      showToast('Service gelöscht');
      loadServices();
    } catch {
      showToast('Fehler beim Löschen', 'error');
    }
  };

  const saveAvailability = async () => {
    try {
      await gqlRequest(`
        mutation($slots: [AvailabilitySlotInput!]!) {
          setBookingAvailability(slots: $slots) { dayOfWeek startTime endTime isActive }
        }
      `, { slots: availability });
      showToast('Verfügbarkeit gespeichert');
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const saveSettings = async () => {
    try {
      await gqlRequest(`
        mutation($input: BookingSettingsInput!) {
          updateBookingSettings(input: $input) { timezone }
        }
      `, { input: settings });
      showToast('Einstellungen gespeichert');
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  // ==================== STATUS HELPERS ====================
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Terminbuchung</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([
            ['appointments', 'Termine'],
            ['services', 'Services'],
            ['availability', 'Verfügbarkeit'],
            ['settings', 'Einstellungen'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== TERMINE TAB ==================== */}
      {tab === 'appointments' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled', 'no_show'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'Alle' : s}
              </button>
            ))}
          </div>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Termine gefunden</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: apt.service_color }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{apt.customer_name}</p>
                        <p className="text-sm text-gray-500">{apt.customer_email}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {apt.service_name} &middot; {apt.date} &middot; {apt.start_time}–{apt.end_time}
                        </p>
                        {apt.customer_notes && (
                          <p className="text-sm text-gray-400 mt-1">{apt.customer_notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(apt.status)}
                    </div>
                  </div>
                  {/* Actions */}
                  {apt.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                      >
                        Bestätigen
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        Stornieren
                      </button>
                    </div>
                  )}
                  {apt.status === 'confirmed' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        Erledigt
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'no_show')}
                        className="px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                      >
                        Nicht erschienen
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        Stornieren
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== SERVICES TAB ==================== */}
      {tab === 'services' && (
        <div className="space-y-4">
          <button
            onClick={() =>
              setEditingService({
                name: '',
                duration_minutes: 30,
                buffer_minutes: 0,
                price: 0,
                color: '#3b82f6',
                requires_confirmation: false,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + Neuer Service
          </button>

          {/* Service Editor Modal */}
          {editingService && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-lg">
                {editingService.id ? 'Service bearbeiten' : 'Neuer Service'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="z.B. Haarschnitt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dauer (Min.)</label>
                  <input
                    type="number"
                    value={editingService.duration_minutes || 30}
                    onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puffer (Min.)</label>
                  <input
                    type="number"
                    value={editingService.buffer_minutes || 0}
                    onChange={(e) => setEditingService({ ...editingService, buffer_minutes: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preis (Cent)</label>
                  <input
                    type="number"
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
                  <input
                    type="color"
                    value={editingService.color || '#3b82f6'}
                    onChange={(e) => setEditingService({ ...editingService, color: e.target.value })}
                    className="w-16 h-10 border rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingService.requires_confirmation || false}
                    onChange={(e) => setEditingService({ ...editingService, requires_confirmation: e.target.checked })}
                  />
                  <label className="text-sm text-gray-700">Bestätigung erforderlich</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveService} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Speichern
                </button>
                <button onClick={() => setEditingService(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: svc.color }} />
                  <h3 className="font-semibold text-gray-900">{svc.name}</h3>
                  {!svc.is_active && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Inaktiv</span>
                  )}
                </div>
                {svc.description && <p className="text-sm text-gray-500 mb-2">{svc.description}</p>}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{svc.duration_minutes} Min. {svc.buffer_minutes > 0 && `(+${svc.buffer_minutes} Min. Puffer)`}</p>
                  {svc.price > 0 && <p>{(svc.price / 100).toFixed(2)} &euro;</p>}
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => setEditingService(svc)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== AVAILABILITY TAB ==================== */}
      {tab === 'availability' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border divide-y">
            {availability.map((slot, idx) => (
              <div key={slot.dayOfWeek} className="flex items-center gap-4 p-4">
                <label className="flex items-center gap-2 w-32">
                  <input
                    type="checkbox"
                    checked={slot.isActive}
                    onChange={(e) => {
                      const updated = [...availability];
                      updated[idx] = { ...updated[idx], isActive: e.target.checked };
                      setAvailability(updated);
                    }}
                  />
                  <span className="text-sm font-medium">{DAY_NAMES[slot.dayOfWeek]}</span>
                </label>
                {slot.isActive && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => {
                        const updated = [...availability];
                        updated[idx] = { ...updated[idx], startTime: e.target.value };
                        setAvailability(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => {
                        const updated = [...availability];
                        updated[idx] = { ...updated[idx], endTime: e.target.value };
                        setAvailability(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}
                {!slot.isActive && <span className="text-sm text-gray-400">Geschlossen</span>}
              </div>
            ))}
          </div>
          <button onClick={saveAvailability} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Verfügbarkeit speichern
          </button>
        </div>
      )}

      {/* ==================== SETTINGS TAB ==================== */}
      {tab === 'settings' && (
        <div className="bg-white rounded-lg border p-6 space-y-4 max-w-2xl">
          <h3 className="font-semibold text-lg">Buchungs-Einstellungen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seitentitel</label>
              <input
                type="text"
                value={settings.bookingPageTitle || ''}
                onChange={(e) => setSettings({ ...settings, bookingPageTitle: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Online Terminbuchung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorlaufzeit (Std.)</label>
              <input
                type="number"
                value={settings.minNoticeHours}
                onChange={(e) => setSettings({ ...settings, minNoticeHours: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. Vorlauf (Tage)</label>
              <input
                type="number"
                value={settings.maxAdvanceDays}
                onChange={(e) => setSettings({ ...settings, maxAdvanceDays: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slot-Intervall (Min.)</label>
              <input
                type="number"
                value={settings.slotIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, slotIntervalMinutes: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erinnerung (Std. vorher)</label>
              <input
                type="number"
                value={settings.reminderEmailHours}
                onChange={(e) => setSettings({ ...settings, reminderEmailHours: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={settings.bookingPageDescription || ''}
              onChange={(e) => setSettings({ ...settings, bookingPageDescription: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stornierungsrichtlinie</label>
            <textarea
              value={settings.cancellationPolicy || ''}
              onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <button onClick={saveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Einstellungen speichern
          </button>
        </div>
      )}
    </div>
  );
}