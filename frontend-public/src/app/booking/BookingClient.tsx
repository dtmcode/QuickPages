'use client';
// 📂 PFAD: frontend-public/src/app/booking/BookingClient.tsx

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
  requires_confirmation: boolean;
}

interface BookingSettings {
  title: string | null;
  description: string | null;
  cancellationPolicy: string | null;
  timezone: string;
}

interface AvailableDate {
  date: string;
  available: boolean;
  slotsCount: number;
}

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

type Step = 'service' | 'date' | 'slot' | 'form' | 'success';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ==================== HELPERS ====================
function formatPrice(cents: number): string {
  if (cents === 0) return 'Kostenlos';
  return `${(cents / 100).toFixed(2)} €`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ==================== COMPONENT ====================
export default function BookingClient({ tenantSlug }: { tenantSlug: string }) {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<BookingService[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerNotes: '',
  });

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== LOAD ====================
  useEffect(() => {
    const load = async () => {
      try {
        const [svcRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/public/${tenantSlug}/booking/services`),
          fetch(`${API_URL}/api/public/${tenantSlug}/booking/settings`),
        ]);
        const [svcData, settingsData] = await Promise.all([
          svcRes.json() as Promise<BookingService[]>,
          settingsRes.json() as Promise<BookingSettings>,
        ]);
        setServices(svcData);
        setSettings(settingsData);
      } catch {
        setError('Buchungssystem konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenantSlug]);

  const loadDates = useCallback(async (serviceId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/public/${tenantSlug}/booking/dates?serviceId=${serviceId}`,
      );
      const data = await res.json() as AvailableDate[];
      setAvailableDates(data);
    } catch {
      setError('Verfügbare Termine konnten nicht geladen werden.');
    }
  }, [tenantSlug]);

  const loadSlots = useCallback(async (serviceId: string, date: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/public/${tenantSlug}/booking/slots?serviceId=${serviceId}&date=${date}`,
      );
      const data = await res.json() as Slot[];
      setSlots(data);
    } catch {
      setError('Zeitslots konnten nicht geladen werden.');
    } finally {
      setSlotsLoading(false);
    }
  }, [tenantSlug]);

  // ==================== ACTIONS ====================
  const selectService = async (svc: BookingService) => {
    setSelectedService(svc);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep('date');
    await loadDates(svc.id);
  };

  const selectDate = async (date: string) => {
    if (!selectedService) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('slot');
    await loadSlots(selectedService.id, date);
  };

  const selectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const submitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    if (!form.customerName || !form.customerEmail) {
      setError('Bitte Name und E-Mail angeben.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/public/${tenantSlug}/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone || undefined,
          customerNotes: form.customerNotes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { message: string };
        throw new Error(err.message);
      }

      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Buchung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== CALENDAR ====================
  const availableSet = new Set(
    availableDates.filter((d) => d.available).map((d) => d.date),
  );

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    let firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    // Monday-first: shift Sunday from 0 to 6
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const today = new Date().toISOString().slice(0, 10);
    const cells: (string | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }),
    ];

    const prevMonth = () => {
      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
      else setCalendarMonth(m => m - 1);
    };
    const nextMonth = () => {
      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
      else setCalendarMonth(m => m + 1);
    };

    const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('de-DE', {
      month: 'long', year: 'numeric',
    });

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            ‹
          </button>
          <span className="font-semibold text-gray-900 capitalize">{monthName}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, idx) => {
            if (!date) return <div key={idx} />;
            const isAvailable = availableSet.has(date);
            const isPast = date < today;
            const isSelected = date === selectedDate;

            return (
              <button
                key={date}
                disabled={!isAvailable || isPast}
                onClick={() => void selectDate(date)}
                className={`
                  aspect-square rounded-xl text-sm font-medium transition-all
                  ${isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : isAvailable && !isPast
                    ? 'hover:bg-blue-50 text-gray-900 hover:text-blue-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {parseInt(date.split('-')[2])}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ==================== PROGRESS BAR ====================
  const steps: Step[] = ['service', 'date', 'slot', 'form', 'success'];
  const stepLabels = ['Service', 'Datum', 'Uhrzeit', 'Kontakt', 'Fertig'];
  const currentStepIdx = steps.indexOf(step);

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error && step === 'service') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {settings?.title ?? 'Termin buchen'}
          </h1>
          {settings?.description && (
            <p className="text-gray-500">{settings.description}</p>
          )}
        </div>

        {/* Progress */}
        {step !== 'success' && (
          <div className="flex items-center justify-center mb-10 gap-0">
            {stepLabels.slice(0, -1).map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`flex flex-col items-center`}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${idx < currentStepIdx ? 'bg-blue-600 text-white' :
                      idx === currentStepIdx ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                      'bg-gray-200 text-gray-400'}
                  `}>
                    {idx < currentStepIdx ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 ${idx === currentStepIdx ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 2 && (
                  <div className={`w-12 h-0.5 mb-5 mx-1 transition-all ${idx < currentStepIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && step !== 'service' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ===== STEP: SERVICE ===== */}
        {step === 'service' && (
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Keine buchbaren Services verfügbar.
              </div>
            ) : (
              services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => void selectService(svc)}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: svc.color }}
                    >
                      {svc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {svc.name}
                        </h3>
                        <span className="text-sm font-medium text-gray-600 ml-2">
                          {formatPrice(svc.price)}
                        </span>
                      </div>
                      {svc.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{svc.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{svc.duration_minutes} Minuten</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-xl">›</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* ===== STEP: DATE ===== */}
        {step === 'date' && selectedService && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep('service')} className="text-sm text-blue-600 hover:underline">
                ← Zurück
              </button>
              <span className="text-sm text-gray-500">
                {selectedService.name} · {selectedService.duration_minutes} Min.
              </span>
            </div>
            {renderCalendar()}
          </div>
        )}

        {/* ===== STEP: SLOT ===== */}
        {step === 'slot' && selectedService && selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep('date')} className="text-sm text-blue-600 hover:underline">
                ← Zurück
              </button>
              <span className="text-sm text-gray-500">{formatDate(selectedDate)}</span>
            </div>

            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-400">Keine Zeitslots für diesen Tag verfügbar.</p>
                <button onClick={() => setStep('date')} className="mt-3 text-sm text-blue-600 hover:underline">
                  Anderen Tag wählen
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Uhrzeit wählen</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      disabled={!slot.available}
                      onClick={() => selectSlot(slot)}
                      className={`
                        py-2.5 px-3 rounded-xl text-sm font-medium transition-all border
                        ${slot.available
                          ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-gray-700 cursor-pointer'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'}
                      `}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP: FORM ===== */}
        {step === 'form' && selectedService && selectedDate && selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setStep('slot')} className="text-sm text-blue-600 hover:underline">
                ← Zurück
              </button>
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl p-4 text-white mb-2"
              style={{ backgroundColor: selectedService.color }}
            >
              <p className="font-semibold">{selectedService.name}</p>
              <p className="text-sm opacity-90 mt-0.5">
                {formatDate(selectedDate)} · {selectedSlot.startTime} – {selectedSlot.endTime}
              </p>
              <p className="text-sm opacity-80">{formatPrice(selectedService.price)}</p>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Deine Kontaktdaten</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max Mustermann"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="max@beispiel.de"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Besondere Wünsche oder Hinweise..."
                />
              </div>

              <button
                onClick={() => void submitBooking()}
                disabled={submitting || !form.customerName || !form.customerEmail}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Wird gebucht...' : 'Termin jetzt buchen'}
              </button>

              {selectedService.requires_confirmation && (
                <p className="text-xs text-gray-400 text-center">
                  Dieser Termin bedarf einer Bestätigung durch den Anbieter.
                </p>
              )}
            </div>

            {settings?.cancellationPolicy && (
              <p className="text-xs text-gray-400 text-center px-4">
                {settings.cancellationPolicy}
              </p>
            )}
          </div>
        )}

        {/* ===== STEP: SUCCESS ===== */}
        {step === 'success' && selectedService && selectedDate && selectedSlot && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Termin gebucht!</h2>
            <p className="text-gray-500 mb-6">
              {selectedService.requires_confirmation
                ? 'Dein Termin wartet auf Bestätigung. Du erhältst eine E-Mail.'
                : 'Dein Termin ist bestätigt. Du erhältst eine Bestätigungs-E-Mail.'}
            </p>

            <div
              className="rounded-2xl p-5 text-white max-w-sm mx-auto mb-8"
              style={{ backgroundColor: selectedService.color }}
            >
              <p className="font-bold text-lg">{selectedService.name}</p>
              <p className="opacity-90 mt-1">{formatDate(selectedDate)}</p>
              <p className="opacity-90">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
            </div>

            <button
              onClick={() => {
                setStep('service');
                setSelectedService(null);
                setSelectedDate(null);
                setSelectedSlot(null);
                setForm({ customerName: '', customerEmail: '', customerPhone: '', customerNotes: '' });
              }}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Weiteren Termin buchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}