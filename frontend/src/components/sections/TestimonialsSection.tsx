'use client';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    testimonials?: Testimonial[];
    columns?: 1 | 2 | 3;
  };
}

export function TestimonialsSection({ config }: TestimonialsSectionProps) {
  const {
    title = 'What Our Customers Say',
    subtitle = 'Trusted by thousands of customers worldwide',
    testimonials = [],
    columns = 3,
  } = config || {};

  const gridCols = {
    1: 'max-w-3xl mx-auto',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              {/* Rating */}
              {testimonial.rating && (
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-xl">
                      {i < testimonial.rating! ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <p className="mb-6 italic text-muted-foreground">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.avatar ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                    👤
                  </div>
                )}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="py-12 text-center">
          <span className="mb-4 inline-block text-6xl">💬</span>
          <p className="text-muted-foreground">No testimonials yet</p>
        </div>
      )}
    </section>
  );
}