// frontend-public\src\app\courses\page.tsx
import { headers } from 'next/headers';
import Link from 'next/link';

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;
const LEVELS: Record<string, string> = { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Experte' };

export default async function CoursesPage() {
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const courses = await fetch(`${api}/api/public/${tenant}/courses`, { next: { revalidate: 60 } })
    .then(r => r.ok ? r.json() : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">🎓 Kurse</h1>
        <p className="text-gray-600 mb-8">Lerne in deinem eigenen Tempo</p>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg">Noch keine Kurse verfügbar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: {
              id: string; slug: string; title: string; shortDescription: string | null;
              thumbnail: string | null; price: number; isFree: boolean; level: string;
              language: string; totalDuration: number | null; requiresMembershipPlanId: string | null;
            }) => (
              <Link key={course.id} href={`/courses/${course.slug}`}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-5xl">🎓</div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{LEVELS[course.level] ?? course.level}</span>
                    <span className="text-xs text-gray-400">{course.language.toUpperCase()}</span>
                    {course.requiresMembershipPlanId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">👑 Membership</span>}
                  </div>
                  <h2 className="font-bold text-lg mb-1 line-clamp-2">{course.title}</h2>
                  {course.shortDescription && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.shortDescription}</p>}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-lg">
                      {course.isFree ? <span className="text-green-600">Kostenlos</span> : fmt(course.price)}
                    </span>
                    {course.totalDuration && (
                      <span className="text-xs text-gray-400">
                        ⏱️ {course.totalDuration >= 60 ? `${Math.floor(course.totalDuration / 60)}h ${course.totalDuration % 60}m` : `${course.totalDuration}m`}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}