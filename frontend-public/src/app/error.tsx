// 📂 PFAD: frontend-public/src/app/error.tsx

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Etwas ist schiefgelaufen
        </h2>
        <p className="text-gray-600 mb-6">
          Beim Laden dieser Seite ist ein Fehler aufgetreten. 
          Bitte versuche es erneut.
        </p>
        {error.message && process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-xs bg-gray-100 p-4 rounded-lg mb-6 overflow-auto max-h-32">
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
          <a>
         {/*    href=&quot;/&quot;
            className=&quot;px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium&quot; */}
          
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}