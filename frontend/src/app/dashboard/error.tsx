// 📂 PFAD: frontend/src/app/dashboard/error.tsx

'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🔧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Dashboard-Fehler
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Beim Laden dieser Dashboard-Seite ist ein Fehler aufgetreten.
        </p>
        {error.message && process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-xs bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6 overflow-auto max-h-32 border border-red-200 dark:border-red-800">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Erneut versuchen
          </button>
          <a
            href="/dashboard"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
          >
            Zum Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}