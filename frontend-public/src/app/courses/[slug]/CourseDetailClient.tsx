'use client';
// frontend-public\src\app\courses\[slug]\CourseDetailClient.tsx

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

interface Lesson { id: string; title: string; type: string; duration: number | null; isFreePreview: boolean; }
interface Chapter { id: string; title: string; position: number; lessons: Lesson[]; }
interface Course {
  id: string; title: string; slug: string; description: string | null; shortDescription: string | null;
  thumbnail: string | null; price: number; isFree: boolean; level: string; language: string;
  totalDuration: number | null; certificateEnabled: boolean; requiresMembershipPlanId: string | null;
  chapters: Chapter[];
}

export default function CourseDetailClient({ course, tenant }: { course: Course; tenant: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([course.chapters[0]?.id ?? '']));
  const [enrollForm, setEnrollForm] = useState({ email: '', name: '' });
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);

  const totalLessons = course.chapters.reduce((s, ch) => s + ch.lessons.length, 0);
  const LESSON_ICONS: Record<string, string> = { video: '🎥', text: '📝', pdf: '📄', quiz: '✅' };
  const LEVELS: Record<string, string> = { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Experte' };

  const enroll = async () => {
    setEnrollLoading(true);
    try {
      const res = await fetch(`${API}/api/public/${tenant}/courses/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, customerEmail: enrollForm.email, customerName: enrollForm.name }),
      });
      if (res.ok) setEnrollSuccess(true);
    } finally { setEnrollLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{LEVELS[course.level] ?? course.level}</span>
              {course.requiresMembershipPlanId && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">👑 Membership erforderlich</span>}
            </div>
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            {course.shortDescription && <p className="text-gray-600 mb-4">{course.shortDescription}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📚 {course.chapters.length} Kapitel</span>
              <span>🎯 {totalLessons} Lektionen</span>
              {course.totalDuration && <span>⏱️ {course.totalDuration >= 60 ? `${Math.floor(course.totalDuration / 60)}h ${course.totalDuration % 60}m` : `${course.totalDuration}m`}</span>}
              {course.certificateEnabled && <span>🏆 Zertifikat</span>}
            </div>
          </div>
          <div className="md:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-xl" />}
              <div className="text-center">
                <p className="text-3xl font-bold">{course.isFree ? <span className="text-green-600">Kostenlos</span> : fmt(course.price)}</p>
              </div>
              {enrollSuccess ? (
                <div className="text-center py-2">
                  <p className="text-green-600 font-medium">✅ Eingeschrieben!</p>
                  <p className="text-sm text-gray-500">Wir haben dir eine E-Mail geschickt.</p>
                </div>
              ) : showEnroll ? (
                <div className="space-y-3">
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Name *" value={enrollForm.name} onChange={e => setEnrollForm(f => ({ ...f, name: e.target.value }))} />
                  <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="E-Mail *" value={enrollForm.email} onChange={e => setEnrollForm(f => ({ ...f, email: e.target.value }))} />
                  <button onClick={enroll} disabled={!enrollForm.name || !enrollForm.email || enrollLoading}
                    className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50">
                    {enrollLoading ? 'Lädt...' : course.isFree ? '🎓 Jetzt starten' : '💳 Jetzt kaufen'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowEnroll(true)} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-700">
                  {course.isFree ? '🎓 Kostenlos starten' : `💳 Jetzt für ${fmt(course.price)} kaufen`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {course.description && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-3">Über diesen Kurs</h2>
            <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Kursinhalt</h2>
            <p className="text-sm text-gray-500 mt-1">{course.chapters.length} Kapitel · {totalLessons} Lektionen</p>
          </div>
          {[...course.chapters].sort((a, b) => a.position - b.position).map(chapter => (
            <div key={chapter.id} className="border-b last:border-0">
              <button
                onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(chapter.id) ? n.delete(chapter.id) : n.add(chapter.id); return n; })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
              >
                <div>
                  <span className="font-medium">{chapter.title}</span>
                  <span className="text-xs text-gray-400 ml-2">{chapter.lessons.length} Lektionen</span>
                </div>
                <span className="text-gray-400">{expanded.has(chapter.id) ? '▲' : '▼'}</span>
              </button>
              {expanded.has(chapter.id) && (
                <div className="bg-gray-50 divide-y">
                  {chapter.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center gap-3 px-6 py-3">
                      <span>{LESSON_ICONS[lesson.type] ?? '📄'}</span>
                      <span className="flex-1 text-sm">{lesson.title}</span>
                      {lesson.isFreePreview && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vorschau</span>}
                      {lesson.duration && <span className="text-xs text-gray-400">{lesson.duration}m</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}