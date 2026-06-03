'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'

const posts = [
  {
    slug: 'understanding-builder-warranty',
    title: 'Understanding Your New Home Builder Warranty',
    excerpt: 'Most new home warranties have strict timelines. Here is what you need to know about what is covered and for how long — before your clock runs out.',
    date: 'May 28, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'documenting-construction-defects',
    title: 'How to Document Construction Defects Effectively',
    excerpt: 'Photos, timestamps, and written records are your most powerful tools. Learn the right way to document every defect before contacting your builder.',
    date: 'May 15, 2026',
    category: 'Documentation'
  },
  {
    slug: 'builder-response-times',
    title: 'What Builder Response Times Tell You About Accountability',
    excerpt: 'The data on how long builders take to respond to warranty claims reveals patterns that homeowners should know about before they buy.',
    date: 'April 30, 2026',
    category: 'Data & Insights'
  },
  {
    slug: 'when-to-escalate',
    title: 'When and How to Escalate a Warranty Claim',
    excerpt: 'When your builder stops responding or drags their feet, there are specific steps you can take to escalate — without burning bridges.',
    date: 'April 14, 2026',
    category: 'Strategy'
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm mb-3">
              <BookOpen size={16} /> Blog
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Homeowner Resources</h1>
            <p className="text-gray-500">Guides, insights, and strategies for navigating builder warranty claims.</p>
          </div>

          <div className="space-y-6">
            {posts.map(post => (
              <article key={post.slug} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                <button className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Read more <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}