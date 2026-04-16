'use client';
// frontend-public\src\app\membership\MembershipClient.tsx

import { useState } from 'react';

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;
const INTERVAL: Record<string, string> = { monthly: 'Monat', yearly: 'Jahr', lifetime: 'einmalig' };

interface Plan {
  id: string; name: string; price: number; interval: string;
  description: string | null; features: string[] | null; stripePriceId: string | null;
}

export default function MembershipClient({ plans, tenant }: { plans: Plan[]; tenant: string }) {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [form, setForm] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subscribe = async () => {
    if (!selected) return;
    setLoading(true);
    // Wenn Stripe vorhanden → Checkout starten, sonst manueller Flow
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${API}/api/public/${tenant}/membership/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selected.id, customerEmail: form.email, customerName: form.name }),
      });
      setSuccess(true);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <div className="text-6xl mb-4">👑</div>
        <h2 className="text-2xl font-bold mb-2">Willkommen!</h2>
        <p className="text-gray-600">Du erhältst in Kürze eine Bestätigungs-E-Mail.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">👑 Membership</h1>
          <p className="text-gray-600">Wähle deinen Plan und erhalte Zugang zu exklusiven Inhalten</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">👑</p>
            <p>Noch keine Mitgliedschaftspläne verfügbar</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelected(plan)}
                  className={`bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all border-2 ${
                    selected?.id === plan.id ? 'border-primary-600 shadow-md' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    {selected?.id === plan.id && <span className="text-primary-600">✓</span>}
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{fmt(plan.price)}</span>
                    <span className="text-gray-500 text-sm ml-1">/ {INTERVAL[plan.interval] ?? plan.interval}</span>
                  </div>
                  {plan.description && <p className="text-sm text-gray-600 mb-4">{plan.description}</p>}
                  {(plan.features ?? []).length > 0 && (
                    <ul className="space-y-2">
                      {(plan.features ?? []).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {selected && (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-4">
                <h3 className="font-bold text-lg">Mitglied werden: {selected.name}</h3>
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">E-Mail *</label>
                  <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <button
                  onClick={subscribe}
                  disabled={!form.name || !form.email || loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Lädt...' : `👑 Für ${fmt(selected.price)}/${INTERVAL[selected.interval] ?? selected.interval} abonnieren`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}