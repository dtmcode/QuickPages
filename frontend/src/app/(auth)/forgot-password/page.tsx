'use client';
// 📂 PFAD: frontend/src/app/forgot-password/page.tsx

import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) { success message }
  }
`;

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword({ variables: { input: { email } } }).catch(() => {});
    setSent(true); // Immer Erfolg zeigen (Security: kein User-Enumeration)
  };

  if (sent) {
    return (
      <AuthLayout title="E-Mail gesendet 📬" subtitle="Prüfe deinen Posteingang — auch den Spam-Ordner.">
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400">
            Falls ein Account mit <strong>{email}</strong> existiert, wurde ein Reset-Link gesendet. Der Link ist 1 Stunde gültig.
          </div>
          <Link href="/login"
            className="block w-full py-3 border border-border hover:border-blue-400 text-foreground font-semibold rounded-xl text-sm text-center transition hover:bg-blue-50 dark:hover:bg-blue-950/20">
            ← Zurück zum Login
          </Link>
          <button onClick={() => setSent(false)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition">
            Erneut senden
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Passwort zurücksetzen"
      subtitle="Gib deine E-Mail-Adresse ein — wir schicken dir einen Reset-Link."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputCls}
            placeholder="deine@email.de"
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading || !email}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Wird gesendet…</> : 'Reset-Link senden →'}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-blue-600 hover:underline">← Zurück zum Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}