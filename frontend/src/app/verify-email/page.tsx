'use client';
// 📂 PFAD: frontend/src/app/verify-email/page.tsx

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import Link from 'next/link';

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      success
      message
    }
  }
`;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Kein Verifizierungs-Token gefunden.');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await verifyEmail({ variables: { input: { token } } });
        if (data?.verifyEmail?.success) {
          setStatus('success');
          setMessage(data.verifyEmail.message);
          // Nach 3 Sekunden zum Dashboard
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">E-Mail wird verifiziert...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">E-Mail bestätigt!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">Du wirst in 3 Sekunden weitergeleitet...</p>
            <Link
              href="/dashboard"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center"
            >
              Zum Dashboard →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifizierung fehlgeschlagen</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center"
              >
                Zum Dashboard
              </Link>
              <p className="text-sm text-gray-500">
                Im Dashboard kannst du eine neue Verifizierungs-Email anfordern.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}