import Header from '@/components/Header'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'

const POSTS = [
  { slug:'how-to-document-warranty-claims', title:'How to Document Warranty Claims Like a Pro', excerpt:'Most homeowners lose warranty battles not because they were wrong — but because they had no paper trail. Here is the exact process we recommend from day one.', date:'May 28, 2026', author:'Oluso Team', category:'Guides', readTime:'5 min read', featured:true },
  { slug:'builder-accountability-tips', title:'5 Ways to Hold Your Builder Accountable Without Going to Court', excerpt:'Before attorneys get involved, these five escalation strategies have helped hundreds of homeowners get repairs done during their warranty window.', date:'May 15, 2026', author:'Ryan K.', category:'Strategy', readTime:'7 min read', featured:false },
  { slug:'community-power-warranty', title:'Why Your Neighbors Are Your Biggest Warranty Asset', excerpt:'When 12 homeowners in Oakwood Estates coordinated their foundation claims together, their builder responded in 10 days. Alone, they had waited months.', date:'May 3, 2026', author:'Oluso Team', category:'Community', readTime:'4 min read', featured:false },
  { slug:'hvac-warranty-window', title:'HVAC Issues: What Falls Under Warranty and When to File', excerpt:'HVAC is one of the most contested warranty categories. We break down what is typically covered, what is not, and when your window closes.', date:'Apr 22, 2026', author:'Guest Author', category:'Category Guides', readTime:'6 min read', featured:false },
  { slug:'photography-claims', title:'How to Photograph Warranty Issues for Maximum Impact', excerpt:'A blurry cell phone photo rarely moves a builder. Learn the angles, lighting, and metadata practices that make your documentation undeniable.', date:'Apr 10, 2026', author:'Oluso Team', category:'Tips', readTime:'3 min read', featured:false },
  { slug:'texas-warranty-law', title:'Texas Warranty Law: What Every New Homeowner Must Know', excerpt:'Texas has specific construction defect statutes that affect your rights and timelines. Here is a plain-English breakdown of what applies to you.', date:'Mar 28, 2026', author:'Legal Partner', category:'Legal', readTime:'8 min read', featured:false },
]

const CATEGORIES = ['All','Guides','Strategy','Community','Category Guides','Tips','Legal']

export default function Blog() {
  const featured = POSTS[0]
  const rest = POSTS.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Blog" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-600 to-teal-600 py-16 px-4 text-white text-center" style={{background:'linear-gradient(135deg, #1E3A5F, #0D9488)'}}>
        <h1 className="text-4xl font-bold mb-3">The Oluso Blog</h1>
        <p className="text-teal-100 text-lg max-w-xl mx-auto">Warranty strategy, builder accountability, and community success stories for new homeowners.</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat=>(
            <button key={cat} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat==='All' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600'}`}>{cat}</button>
          ))}
        </div>

        {/* Featured post */}
        <div className="card mb-8 md:flex gap-6">
          <div className="md:w-2/5 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center min-h-48 mb-4 md:mb-0">
            <div className="text-6xl">📋</div>
          </div>
          <div className="md:w-3/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">Featured</span>
              <span className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"><Tag className="w-3 h-3" />{featured.category}</span>
            </div>
            <h2 className="text-2xl font-bold text-navy-600 mb-3">{featured.title}</h2>
            <p className="text-gray-600 mb-4">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{featured.date}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{featured.author}</span>
              <span>{featured.readTime}</span>
            </div>
            <Link href={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors">
              Read Article <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Post grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post=>(
            <article key={post.slug} className="card flex flex-col">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-36 flex items-center justify-center mb-4 text-4xl">
                {post.category==='Strategy'?'🎯':post.category==='Community'?'🏘':post.category==='Legal'?'⚖️':post.category==='Tips'?'📸':'🔧'}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"><Tag className="w-3 h-3" />{post.category}</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
              <h3 className="font-bold text-navy-600 mb-2 flex-1">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
              </div>
              <Link href={`/blog/${post.slug}`} className="mt-4 border border-teal-200 text-teal-600 text-sm font-medium py-2 rounded-lg text-center hover:bg-teal-50 transition-colors flex items-center justify-center gap-1">
                Read More <ArrowRight className="w-3 h-3" />
              </Link>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-teal-600 rounded-2xl p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Stay ahead of your warranty window.</h2>
          <p className="text-teal-100 mb-6">Get new guides and builder accountability tips delivered to your inbox. No spam — just useful info when it matters.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com" className="flex-1 border-0 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">Subscribe</button>
          </div>
        </div>
      </div>

      <footer className="bg-navy-600 text-white py-8 px-4 text-center" style={{background:'#1E3A5F'}}>
        <div className="text-sm text-gray-300">© 2026 Oluso Home. Built for new-home owners who deserve a calmer warranty experience.</div>
      </footer>
    </div>
  )
}