'use client';
// 📂 PFAD: frontend/src/app/verify-email/page.tsx

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) { success message }
  }
`;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION);

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Kein Verifizierungs-Token gefunden.'); return; }
    const verify = async () => {
      try {
        const { data } = await verifyEmail({ variables: { input: { token } } });
        if (data?.verifyEmail?.success) {
          setStatus('success');
          setMessage(data.verifyEmail.message);
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          setStatus('error');
          setMessage('Verifizierung fehlgeschlagen.');
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verifizierung fehlgeschlagen.');
      }
    };
    void verify();
  }, [token, verifyEmail, router]);

  if (status === 'loading') {
    return (
      <AuthLayout title="E-Mail wird verifiziert…" subtitle="Bitte warte einen Moment.">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verifizierung läuft…</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout title="E-Mail bestätigt! ✅" subtitle={message}>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <p className="text-green-700 dark:text-green-400 text-sm">Du wirst in 3 Sekunden weitergeleitet…</p>
          </div>
          <Link href="/dashboard"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm text-center transition">
            Zum Dashboard →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verifizierung fehlgeschlagen" subtitle={message}>
      <div className="space-y-4">
        <div className="text-center text-5xl py-4">❌</div>
        <Link href="/dashboard"
          className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm text-center transition">
          Zum Dashboard
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Im Dashboard kannst du eine neue Verifizierungs-Email anfordern.
        </p>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}