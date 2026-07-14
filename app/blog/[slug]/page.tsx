import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { getPostBySlug, getAllSlugs, blogPosts } from '@/lib/blog'
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: `${post.title} | Oluso Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date
    }
  }
}

function renderContent(content: string): string {
    return content
      .split('\n')
      .map(rawLine => {
              const line = rawLine.trim()
              if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">${line.slice(3)}</h2>`
              }
              if (line.startsWith('**') && line.endsWith('**') && line.length >= 4) {
                        const inner = line.slice(2, -2)
                        return `<p class="font-semibold text-gray-900 mt-4 mb-1">${inner}</p>`
              }
              if (line.startsWith('- ')) {
                        return `<li class="text-gray-700 ml-4 list-disc">${line.slice(2)}</li>`
              }
              if (line === '') {
                        return '<br />'
              }
              return `<p class="text-gray-700 leading-relaxed mb-3">${line}</p>`
      })
      .join('\n')
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const currentIndex = blogPosts.findIndex(p => p.slug === params.slug)
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-white">
      <Header publicNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { '@type': 'Organization', name: 'Oluso' },
            publisher: { '@type': 'Organization', name: 'Oluso' },
            mainEntityOfPage: `https://oluso.co/blog/${params.slug}`,
          }),
        }}
      />

      <main className="pt-24 max-w-2xl mx-auto px-4 pb-12">
        <Link href="/blog" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-8">
          <ArrowLeft size={14} /> All articles
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar size={12} /> {post.date}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} /> {post.readMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="border-t border-gray-100 mb-8" />

        <article
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        <div className="mt-12 bg-blue-600 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-white mb-2">Start documenting your warranty claims</h3>
          <p className="text-blue-100 text-sm mb-4">
            Free to use. Timestamped. Permanent record.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6 gap-4">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="group flex-1">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                <ArrowLeft size={12} /> Previous
              </p>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {prevPost.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}

          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="group flex-1 text-right">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1 justify-end">
                Next <ArrowRight size={12} />
              </p>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {nextPost.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </main>
    </div>
  )
}
