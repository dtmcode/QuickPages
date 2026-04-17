'use client';
// 📂 PFAD: frontend/src/app/register/page.tsx

import { useState, Suspense } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user { id email firstName lastName role }
      tenant { id name slug package }
      accessToken
      refreshToken
    }
  }
`;

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

function RegisterForm() {
  const searchParams = useSearchParams();
  const selectedPackage = searchParams.get('package') ?? 'website_micro';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Bitte akzeptiere die Nutzungsbedingungen.');
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            email,
            password,
            firstName,
            lastName,
            companyName,
            package: selectedPackage, // ✅ Paket aus URL mitschicken
          },
        },
      });

      login(
        data.register.accessToken,
        data.register.refreshToken,
        data.register.user,
        data.register.tenant,
      );

      // Nach Registrierung → Onboarding mit Paket-Kontext
      router.push(`/onboarding?package=${selectedPackage}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.replace('ApolloError: ', ''));
      } else {
        setError('Registrierung fehlgeschlagen');
      }
    }
  };

  return (
    <AuthLayout
      title="Account erstellen"
      subtitle="Starte deine 14-tägige kostenlose Testphase"
      selectedPackage={selectedPackage}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <span className="mt-0.5 flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Firmenname *</label>
          <input
            type="text"
            required
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className={inputCls}
            placeholder="Mustermann GmbH"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Vorname *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className={inputCls}
              placeholder="Max"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nachname *</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className={inputCls}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">E-Mail-Adresse *</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputCls}
            placeholder="max@firma.de"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Passwort *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`${inputCls} pr-12`}
              placeholder="Mindestens 8 Zeichen"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs transition"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p className="text-xs text-red-500 mt-1">Mindestens 8 Zeichen</p>
          )}
        </div>

        {/* AGB */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border text-blue-600 flex-shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Ich akzeptiere die{' '}
            <Link href="/agb" className="text-blue-600 hover:underline">Nutzungsbedingungen</Link>
            {' '}und die{' '}
            <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !companyName || !email || !password || !agreed}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Wird registriert…
            </>
          ) : (
            'Account erstellen →'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Schon registriert?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Jetzt anmelden
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}