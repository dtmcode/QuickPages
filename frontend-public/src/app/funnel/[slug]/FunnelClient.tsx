'use client';
// frontend-public\src\app\funnel\[slug]\FunnelClient.tsx

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FunnelStep {
  id: string; title: string; stepType: string; position: number;
  nextStepId: string | null; content: unknown;
}
interface Funnel {
  id: string; name: string; slug: string; conversionGoal: string;
  steps: FunnelStep[];
}

export default function FunnelClient({ funnel, tenant }: { funnel: Funnel; tenant: string }) {
  const steps = [...funnel.steps].sort((a, b) => a.position - b.position);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form, setForm] = useState({ email: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const step = steps[currentIndex];
  if (!step) return null;

  const isLast = currentIndex >= steps.length - 1;
  const isOptin = step.stepType === 'optin';
  const isThankyou = step.stepType === 'thankyou';

  const submit = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/public/${tenant}/funnel/${funnel.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          customerEmail: form.email || undefined,
          customerName: form.name || undefined,
          utmSource: new URLSearchParams(window.location.search).get('utm_source') ?? undefined,
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') ?? undefined,
        }),
      });
    } finally { setLoading(false); }

    if (isLast) { setDone(true); return; }
    setCurrentIndex(i => i + 1);
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Vielen Dank!</h2>
        <p className="text-gray-600">Du wirst in Kürze von uns hören.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      {/* Progress */}
      {steps.length > 1 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200">
          <div className="h-full bg-primary-600 transition-all" style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }} />
        </div>
      )}

      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {isThankyou ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-gray-600">Vielen Dank! Wir freuen uns auf dich.</p>
              <button onClick={submit} disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50">
                {loading ? 'Lädt...' : 'Weiter →'}
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold">{step.title}</h2>
              </div>

              {isOptin && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input className="mt-1 w-full border rounded-xl px-4 py-3" placeholder="Dein Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">E-Mail *</label>
                    <input type="email" className="mt-1 w-full border rounded-xl px-4 py-3" placeholder="deine@email.de" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading || (isOptin && !form.email)}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Lädt...' : isLast ? '✅ Absenden' : 'Weiter →'}
              </button>

              {currentIndex > 0 && (
                <button onClick={() => setCurrentIndex(i => i - 1)} className="w-full text-sm text-gray-400 hover:text-gray-600">
                  ← Zurück
                </button>
              )}
            </>
          )}
        </div>

        {steps.length > 1 && (
          <p className="text-center text-xs text-gray-400 mt-4">Schritt {currentIndex + 1} von {steps.length}</p>
        )}
      </div>
    </div>
  );
}