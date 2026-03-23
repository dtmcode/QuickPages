'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UnsubscribePage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: GraphQL Mutation für Unsubscribe
      // Für jetzt simulieren wir es
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Fehler beim Abmelden. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">✅ Erfolgreich abgemeldet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl">📭</div>
            <p className="text-gray-600 dark:text-gray-400">
              Du wurdest erfolgreich von unserem Newsletter abgemeldet.
            </p>
            <p className="text-sm text-gray-500">
              Du erhältst keine weiteren Newsletter von uns.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">📧 Newsletter abmelden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Möchtest du dich wirklich von unserem Newsletter abmelden?</p>
            <p className="text-sm mt-2">
              Du erhältst dann keine weiteren Newsletter von uns.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUnsubscribe}
              disabled={loading}
              variant="danger"
              fullWidth
            >
              {loading ? 'Wird abgemeldet...' : '🚫 Ja, abmelden'}
            </Button>
            <Button
              onClick={() => window.close()}
              variant="ghost"
              fullWidth
            >
              ← Abbrechen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}