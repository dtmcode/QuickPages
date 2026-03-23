// 📂 PFAD: frontend-public/src/app/not-found.tsx

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Seite nicht gefunden
        </h2>
        <p className="text-gray-600 mb-6">
          Die gesuchte Seite existiert leider nicht oder wurde verschoben.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Zur Startseite
          </Link>
          <Link
            href="/blog"
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Blog ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}