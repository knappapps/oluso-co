import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

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
,
  {
    slug: 'preparing-for-your-30-day-walkthrough',
    title: 'How to Prepare for Your 30-Day New Home Walkthrough',
    excerpt: 'The 30-day walkthrough is your first formal chance to document defects with your builder present. Here is how to make the most of it.',
    date: 'May 31, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'understanding-utah-new-home-warranty-act',
    title: 'The Utah New Home Warranty Act: What Every Buyer Needs to Know',
    excerpt: 'Utah state law provides specific warranty protections for new home buyers. Most homeowners do not know what the law requires or how to use it.',
    date: 'June 4, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'common-mistakes-new-homeowners-make-with-warranty-claims',
    title: 'The 7 Most Common Warranty Claim Mistakes New Homeowners Make',
    excerpt: 'Most homeowners leave warranty coverage on the table. These are the mistakes that cost them their claims — and how to avoid every one.',
    date: 'June 11, 2026',
    category: 'Strategy'
  },
  {
    slug: 'hvac-warranty-claims-new-construction',
    title: 'HVAC Warranty Claims in New Construction: What Is Covered and When',
    excerpt: 'HVAC issues are among the most expensive defects in new homes. Understanding what your warranty covers and for how long can save you thousands.',
    date: 'June 18, 2026',
    category: 'Documentation'
  },
  {
    slug: 'using-community-data-to-evaluate-builders',
    title: 'How to Use Community Warranty Data to Evaluate a Builder Before You Buy',
    excerpt: 'The warranty claims filed by existing homeowners in a subdivision tell you more about a builder than any sales brochure. Here is how to read them.',
    date: 'June 25, 2026',
    category: 'Data & Insights'
  },
  {
    slug: 'roof-exterior-warranty-claims',
    title: 'Roof and Exterior Warranty Claims: What New Homeowners Often Miss',
    excerpt: 'Roof leaks, siding gaps, and drainage issues often go unnoticed until they cause serious damage. Here is what your warranty covers on the exterior of your home and how to catch problems early.',
    date: 'June 2, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'writing-warranty-claim-emails-that-get-responses',
    title: 'How to Write a Warranty Claim Email That Actually Gets a Response',
    excerpt: 'The way you write a warranty claim email can be the difference between a fast resolution and weeks of silence. Here is a structure that works.',
    date: 'June 9, 2026',
    category: 'Documentation'
  },
  {
    slug: 'average-cost-common-construction-defects',
    title: 'The Average Cost of Common New Construction Defects',
    excerpt: 'Some warranty defects are inexpensive nuisances. Others can cost tens of thousands of dollars if left unaddressed. Here is what the data shows about typical repair costs.',
    date: 'June 16, 2026',
    category: 'Data & Insights'
  },
  {
    slug: 'hiring-an-attorney-for-warranty-disputes',
    title: 'Should You Hire an Attorney for a Warranty Dispute? How to Decide',
    excerpt: 'Not every warranty dispute needs a lawyer. Here is a practical framework for deciding when legal help is worth the cost — and when it is not.',
    date: 'June 23, 2026',
    category: 'Strategy'
  },
  {
    slug: 'foundation-settling-vs-structural-defect',
    title: 'Foundation Settling vs. Structural Defect: How to Tell the Difference',
    excerpt: 'Not every foundation crack is a red flag, but some are. Here is how to distinguish normal settling from a genuine structural warranty issue.',
    date: 'June 30, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'does-your-builder-warranty-transfer-when-you-sell',
    title: 'Does Your Builder Warranty Transfer When You Sell Your Home?',
    excerpt: 'If you sell your home before your builder warranty expires, the remaining coverage may or may not transfer to the new owner. Here is what buyers and sellers both need to know.',
    date: 'July 7, 2026',
    category: 'Warranty Guide'
  },
  {
    slug: 'building-a-warranty-claim-folder',
    title: 'How to Build a Warranty Claim Folder Your Builder Can Not Dispute',
    excerpt: 'A disorganized pile of texts and photos will not hold up when a builder disputes your claim. Here is how to build a claim folder that leaves no room for argument.',
    date: 'July 10, 2026',
    category: 'Documentation'
  },
  {
    slug: 'seasonal-patterns-in-warranty-claims',
    title: 'Seasonal Patterns in Warranty Claims: When Most Defects Get Reported',
    excerpt: 'Warranty claims are not evenly distributed throughout the year. Understanding seasonal patterns can help you know when to look more closely for defects in your own home.',
    date: 'July 13, 2026',
    category: 'Data & Insights'
  }
]

export const metadata: Metadata = {
  title: 'Warranty Resources & Guides | Oluso Blog',
  description: 'Builder warranty guides, documentation tips, and claim strategies for Utah new homeowners. Learn how to protect your investment.',
  openGraph: {
    title: 'Warranty Resources & Guides | Oluso Blog',
    description: 'Guides and strategies for navigating new home builder warranty claims.',
    url: 'https://oluso.co/blog',
    siteName: 'Oluso',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Warranty Resources & Guides | Oluso Blog' },
}
export default function BlogPage() {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return (
    <div className="min-h-screen bg-gray-50">
      <Header publicNav />
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
            {sortedPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <article className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                <span className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Read more <ArrowRight size={14} />
                </span>
              </article>
            </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
