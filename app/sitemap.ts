import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog'

const baseUrl = 'https://oluso.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1, freq: 'weekly' as const },
    { path: '/blog', priority: 0.9, freq: 'daily' as const },
    { path: '/builders', priority: 0.7, freq: 'weekly' as const },
    { path: '/checklist', priority: 0.6, freq: 'monthly' as const },
    { path: '/community', priority: 0.6, freq: 'weekly' as const },
    { path: '/homebuilders', priority: 0.6, freq: 'monthly' as const },
    { path: '/pricing', priority: 0.6, freq: 'monthly' as const },
    { path: '/resources', priority: 0.6, freq: 'monthly' as const },
    { path: '/login', priority: 0.3, freq: 'yearly' as const },
    { path: '/signup', priority: 0.5, freq: 'yearly' as const },
  ].map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }))

  const blogRoutes: MetadataRoute.Sitemap = getAllSlugs().map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}
