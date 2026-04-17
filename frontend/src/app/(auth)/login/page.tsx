'use client';
// 📂 PFAD: frontend/src/app/login/page.tsx

import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user { id email firstName lastName role }
      tenant { id name slug package }
      accessToken
      refreshToken
    }
  }
`;

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });
      login(
        data.login.accessToken,
        data.login.refreshToken,
        data.login.user,
        data.login.tenant,
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.replace('ApolloError: ', ''));
      } else {
        setError('Anmeldung fehlgeschlagen');
      }
    }
  };

  return (
    <AuthLayout
      title="Willkommen zurück"
      subtitle="Melde dich mit deinem Account an"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <span className="mt-0.5 flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputCls}
            placeholder="deine@email.de"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Passwort
            </label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 transition">
              Vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`${inputCls} pr-12`}
              placeholder="Dein Passwort"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs transition"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Wird angemeldet…
            </>
          ) : (
            'Anmelden →'
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">Noch kein Account?</span>
          </div>
        </div>

        <Link
          href="/register"
          className="w-full py-3 px-4 border border-border hover:border-blue-400 text-foreground font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
          Kostenlos registrieren
        </Link>
      </form>
    </AuthLayout>
  );
}