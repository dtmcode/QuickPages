'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $featured: Boolean) {
    products(limit: $limit, featured: $featured) {
      id
      name
      slug
      description
      price
      compareAtPrice
      images
      isFeatured
      category {
        name
      }
    }
  }
`;

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images?: string;
  isFeatured: boolean;
  category?: {
    name: string;
  };
}

interface ProductGridSectionProps {
  config?: {
    limit?: number;
    featuredOnly?: boolean;
    title?: string;
    subtitle?: string;
    showCategory?: boolean;
    showPrice?: boolean;
  };
}

export function ProductGridSection({ config }: ProductGridSectionProps) {
  const {
    limit = 6,
    featuredOnly = true,
    title = 'Featured Products',
    subtitle = 'Discover our best products',
    showCategory = true,
    showPrice = true,
  } = config || {};

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: { limit, featured: featuredOnly },
  });

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </section>
    );
  }

  const products: Product[] = data?.products || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price / 100);
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.images && JSON.parse(product.images).length > 0 ? (
                <Image
                  src={JSON.parse(product.images)[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">🛍️</span>
                </div>
              )}
              {product.isFeatured && (
                <Badge className="absolute left-2 top-2">
                  <span className="mr-1">⭐</span>
                  Featured
                </Badge>
              )}
            </div>
            <CardHeader>
              {showCategory && product.category && (
                <Badge variant="secondary" className="mb-2 w-fit">
                  {product.category.name}
                </Badge>
              )}
              <CardTitle className="line-clamp-1">{product.name}</CardTitle>
              {showPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
              <Link href={`/products/${product.slug}`}>
                <Button className="w-full">
                  <span className="mr-2">🛒</span>
                  View Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No products available yet.</p>
        </div>
      )}
    </section>
  );
}