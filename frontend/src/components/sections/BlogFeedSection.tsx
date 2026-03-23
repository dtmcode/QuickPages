'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

const GET_POSTS = gql`
  query GetPosts($limit: Int, $status: String) {
    posts(limit: $limit, status: $status) {
      id
      title
      slug
      excerpt
      featuredImage
      publishedAt
      author {
        firstName
        lastName
      }
      category {
        name
      }
    }
  }
`;

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  category?: {
    name: string;
  };
}

interface BlogFeedSectionProps {
  config?: {
    limit?: number;
    title?: string;
    subtitle?: string;
    showAuthor?: boolean;
    showCategory?: boolean;
    showDate?: boolean;
  };
}

export function BlogFeedSection({ config }: BlogFeedSectionProps) {
  const {
    limit = 3,
    title = 'Latest Articles',
    subtitle = 'Stay updated with our latest content',
    showAuthor = true,
    showCategory = true,
    showDate = true,
  } = config || {};

  const { data, loading } = useQuery(GET_POSTS, {
    variables: { limit, status: 'published' },
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

  const posts: Post[] = data?.posts || [];

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden transition-all hover:shadow-lg">
            {post.featuredImage && (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-2">
                {showCategory && post.category && (
                  <Badge variant="secondary">{post.category.name}</Badge>
                )}
                {showDate && post.publishedAt && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>📅</span>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              {showAuthor && post.author && (
                <p className="text-sm text-muted-foreground">
                  By {post.author.firstName} {post.author.lastName}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`}>
                <Button variant="ghost">
                  Read More
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No articles published yet.</p>
        </div>
      )}
    </section>
  );
}