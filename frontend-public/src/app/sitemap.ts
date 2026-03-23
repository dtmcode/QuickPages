// 📂 PFAD: frontend-public/src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getAPI } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant') || 'demo';
  const host = headersList.get('host') || 'localhost:3002';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const api = getAPI(tenantSlug);

  // Statische Seiten
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Dynamische Blog Posts
  try {
    const posts = await api.getPosts();
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    staticPages.push(...postPages);
  } catch {
    // Blog posts nicht verfügbar
  }

  // Dynamische Produkte
  try {
    const products = await api.getProducts();
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt || product.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    staticPages.push(...productPages);
  } catch {
    // Produkte nicht verfügbar
  }

  // CMS Seiten
  try {
    const pages = await api.getPages();
    const cmsPages: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt || page.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
    staticPages.push(...cmsPages);
  } catch {
    // CMS Seiten nicht verfügbar
  }

  // Website Builder Seiten
  try {
    const wbPages = await api.getWbPages();
    const builderPages: MetadataRoute.Sitemap = wbPages
      .filter((p) => !p.isHomepage)
      .map((page) => ({
        url: `${baseUrl}/p/${page.slug}`,
        lastModified: new Date(page.updatedAt || page.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    staticPages.push(...builderPages);
  } catch {
    // WB Seiten nicht verfügbar
  }

  return staticPages;
}