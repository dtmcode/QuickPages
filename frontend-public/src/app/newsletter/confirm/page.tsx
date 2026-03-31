// 📂 frontend-public/src/app/newsletter/confirm/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const tenant = searchParams.get('tenant');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token || !tenant) { setStatus('error'); return; }
    fetch(`${API_URL}/api/public/${tenant}/newsletter/confirm?token=${token}`, { method: 'POST' })
      .then(res => setStatus(res.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, [token, tenant]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Wird bestätigt...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Anmeldung bestätigt!</h1>
            <p className="text-gray-500 text-sm">Du bist jetzt im Newsletter eingetragen.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Fehler</h1>
            <p className="text-gray-500 text-sm">Der Link ist ungültig oder abgelaufen.</p>
          </>
        )}
      </div>
    </div>
  );
}