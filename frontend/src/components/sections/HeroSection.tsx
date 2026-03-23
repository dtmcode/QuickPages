'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface HeroSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
    style?: 'fullscreen' | 'split';
  };
}

export function HeroSection({ config }: HeroSectionProps) {
  const {
    title = 'Welcome to Our Platform',
    subtitle = 'Build something amazing today',
    ctaText = 'Get Started',
    ctaLink = '#',
    backgroundImage,
    style = 'fullscreen',
  } = config || {};

  if (style === 'split') {
    return (
      <section className="container mx-auto px-4 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
            <a href={ctaLink}>
              <Button size="lg">
                {ctaText}
                <span className="ml-2">→</span>
              </Button>
            </a>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            {backgroundImage ? (
              <Image
                src={backgroundImage}
                alt="Hero"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Hero Image</p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-[600px] items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mb-8 text-xl text-white/90">{subtitle}</p>
        <a href={ctaLink}>
          <Button size="lg" variant="secondary">
            {ctaText}
            <span className="ml-2">→</span>
          </Button>
        </a>
      </div>
    </section>
  );
}