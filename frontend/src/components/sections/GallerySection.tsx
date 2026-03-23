'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

interface GallerySectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    images?: GalleryImage[];
    columns?: 2 | 3 | 4;
  };
}

export function GallerySection({ config }: GallerySectionProps) {
  const {
    title = 'Gallery',
    subtitle = 'Explore our work',
    images = [],
    columns = 3,
  } = config || {};

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {images.map((image, index) => (
          <Card
            key={index}
            className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-square">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {image.caption && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                {image.caption}
              </div>
            )}
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="py-12 text-center">
          <span className="mb-4 inline-block text-6xl">🖼️</span>
          <p className="text-muted-foreground">No images yet</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt}
              fill
              className="object-contain"
            />
            <button
              className="absolute right-4 top-4 text-4xl text-white"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}