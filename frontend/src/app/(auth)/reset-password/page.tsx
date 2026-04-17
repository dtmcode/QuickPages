'use client';
// 📂 PFAD: frontend/src/app/reset-password/page.tsx

import { useState, Suspense } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) { success message }
  }
`;

const inputCls = 'w-full px-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  if (!token) {
    return (
      <AuthLayout title="Ungültiger Link" subtitle="Dieser Reset-Link ist ungültig oder abgelaufen.">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <p className="text-muted-foreground text-sm">Bitte fordere einen neuen Reset-Link an.</p>
          <Link href="/forgot-password"
            className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition">
            Neuen Link anfordern
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Passwort geändert!" subtitle="Du kannst dich jetzt mit deinem neuen Passwort anmelden.">
        <div className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <Link href="/login"
            className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition">
            Zum Login →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben.'); return; }
    if (newPassword !== confirmPassword) { setError('Die Passwörter stimmen nicht überein.'); return; }
    try {
      await resetPassword({ variables: { input: { token, newPassword } } });
      setSuccess(true);
    } catch {
      setError('Fehler. Der Link ist möglicherweise abgelaufen.');
    }
  };

  return (
    <AuthLayout title="Neues Passwort" subtitle="Gib dein neues Passwort ein.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Neues Passwort</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} required minLength={8}
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className={`${inputCls} pr-12`} placeholder="Mindestens 8 Zeichen" />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Passwort bestätigen</label>
          <input type={showPassword ? 'text' : 'password'} required minLength={8}
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className={`${inputCls} ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : ''}`}
            placeholder="Passwort wiederholen" />
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
          )}
        </div>
        <button type="submit" disabled={loading || !newPassword || !confirmPassword}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Wird gespeichert…</> : 'Passwort zurücksetzen'}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-blue-600 hover:underline">← Zurück zum Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}