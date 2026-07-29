import { createClient } from '@supabase/supabase-js'
import Header from '@/components/Header'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Render on every request so newly ingested news appears without waiting
// for the ISR cache window to expire.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Industry News | Oluso',
  description: 'Daily updates on home warranty law, builder industry trends, and consumer protection news.',
}

type NewsItem = {
  id: string
  source: string
  title: string
  url: string
  published_at: string | null
  summary: string | null
}

export default async function IndustryNewsPage() {
  const { data: items } = await supabaseAdmin
    .from('industry_news')
    .select('id, source, title, url, published_at, summary')
    .order('published_at', { ascending: false })
    .limit(30)

  const newsItems = (items || []) as NewsItem[]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-2">Industry News</h1>
          <p className="text-gray-600 mb-8">
            Daily updates on home warranty law, builder industry trends, and consumer protection news from trusted sources.
          </p>
          <div className="space-y-6">
            {newsItems.length === 0 && (
              <p className="text-gray-500">No news items yet. Check back soon.</p>
            )}
            {newsItems.map(function(item) {
              return (
                <article key={item.id} className="border-b pb-4">
                  <span className="text-xs uppercase tracking-wide text-gray-500">{item.source}</span>
                  <h2 className="text-lg font-semibold mt-1">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.title}
                    </a>
                  </h2>
                  {item.summary && <p className="text-gray-700 mt-1">{item.summary}</p>}
                  {item.published_at && (
                    <time className="text-xs text-gray-400" dateTime={item.published_at}>
                      {new Date(item.published_at).toLocaleDateString()}
                    </time>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
