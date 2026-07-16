import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog'
import { homebuilders } from '@/lib/homebuilders-data'
import { stateResources } from '@/lib/state-resources'
import { createClient } from '@supabase/supabase-js'

const baseUrl = 'https://oluso.co'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

function nameToSlug(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
      { path: '', priority: 1, freq: 'weekly' as const },
      { path: '/blog', priority: 0.9, freq: 'daily' as const },
      { path: '/builders', priority: 0.7, freq: 'weekly' as const },
      { path: '/checklist', priority: 0.6, freq: 'monthly' as const },
      { path: '/community', priority: 0.6, freq: 'weekly' as const },
        { path: '/community/directory', priority: 0.5, freq: 'weekly' as const },
      { path: '/homebuilders', priority: 0.6, freq: 'monthly' as const },
      { path: '/pricing', priority: 0.6, freq: 'monthly' as const },
      { path: '/resources', priority: 0.6, freq: 'monthly' as const },
      { path: '/resources/states', priority: 0.5, freq: 'monthly' as const },
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

  const homebuilderRoutes: MetadataRoute.Sitemap = homebuilders.map(h => ({
        url: `${baseUrl}/homebuilders/${h.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
  }))

  const stateRoutes: MetadataRoute.Sitemap = stateResources.map(s => ({
        url: `${baseUrl}/resources/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
  }))

  let builderRoutes: MetadataRoute.Sitemap = []
      let communityRoutes: MetadataRoute.Sitemap = []

          try {
                const { data: builderRows } = await supabaseAdmin
                  .from('builders')
                  .select('slug')
                  .not('slug', 'is', null)

      builderRoutes = (builderRows || []).map(b => ({
              url: `${baseUrl}/builders/${b.slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.6,
      }))

      const { data: claimRows } = await supabaseAdmin
                  .from('claims')
                  .select('users!inner(community_name)')
                  .eq('public_story', true)

      const communityNames = Array.from(
              new Set(
                        (claimRows || [])
                          .map((row: any) => row.users?.community_name)
                          .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0)
                      )
            )

      communityRoutes = communityNames.map(name => ({
              url: `${baseUrl}/community/${nameToSlug(name)}`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.5,
      }))
          } catch (err) {
                console.error('sitemap: failed to load dynamic builder/community routes', err)
          }

  return [
        ...staticRoutes,
        ...blogRoutes,
        ...homebuilderRoutes,
        ...stateRoutes,
        ...builderRoutes,
        ...communityRoutes,
      ]
}
