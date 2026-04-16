// frontend-public\src\app\courses\[slug]\page.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await headers();
  const tenant = h.get('x-tenant') || 'demo';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const course = await fetch(`${api}/api/public/${tenant}/courses/${slug}`, { next: { revalidate: 60 } })
    .then(r => r.ok ? r.json() : null);

  if (!course) notFound();

  return <CourseDetailClient course={course} tenant={tenant} />;
}