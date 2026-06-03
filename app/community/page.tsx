import Header from '@/components/Header'
import { MapPin, Users, AlertCircle, Share2, Download, CheckCircle, Mail, UserPlus } from 'lucide-react'

const SHARED_ISSUES = [
  { title:'Foundation Crack in Garage', category:'Structural', severity:'Critical', desc:'Multiple homes in the community are experiencing foundation cracks appearing in the garage area near the expansion joints.', date:'Dec 15, 2024', contributor:'J.S.', status:'Open' },
  { title:'HVAC Condensate Drain Backup', category:'HVAC', severity:'High', desc:'Condensate drain lines backing up causing water damage in attic insulation. Affects units in buildings 3-7.', date:'Jan 8, 2025', contributor:'M.R.', status:'In Progress' },
  { title:'Exterior Paint Peeling — South Facing', category:'Exterior', severity:'Medium', desc:'Paint peeling on south-facing walls within 18 months of move-in. Builder warranty covers exterior paint for 2 years.', date:'Nov 20, 2024', contributor:'T.K.', status:'Waiting on Builder' },
]

const CATEGORIES = [
  {name:'Structural',count:23,color:'bg-blue-500',pct:'75%'},
  {name:'Plumbing',count:16,color:'bg-teal-500',pct:'55%'},
  {name:'HVAC',count:12,color:'bg-amber-500',pct:'40%'},
  {name:'Electrical',count:10,color:'bg-green-500',pct:'33%'},
  {name:'Exterior',count:7,color:'bg-purple-500',pct:'23%'},
]
const SEVERITIES = [
  {name:'Critical',count:8,color:'bg-red-500',pct:'30%'},
  {name:'High',count:14,color:'bg-orange-500',pct:'50%'},
  {name:'Medium',count:19,color:'bg-amber-500',pct:'65%'},
  {name:'Low',count:27,color:'bg-green-500',pct:'90%'},
]

export default function Community() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Community" />

      {/* Hero */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy-600 flex items-center gap-2 mb-2">🏘 Oakwood Estates</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />Austin, TX 78745</span>
                <span className="flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full"><Users className="w-4 h-4" />47 Members</span>
                <span className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full"><AlertCircle className="w-4 h-4" />12 Active Issues</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-600"><Share2 className="w-4 h-4" /> Invite Neighbors</button>
              <button className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white"><Download className="w-4 h-4" /> Export Summary</button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Charts */}
        <div>
          <h2 className="text-xl font-bold text-navy-600 mb-4">Community Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-600">Issues by Category</h3>
                <span className="text-gray-300">●</span>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map(c=>(
                  <div key={c.name} className="flex items-center gap-3">
                    <div className={`h-3 rounded-full ${c.color}`} style={{width:c.pct}}></div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">{c.name} ({c.count})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-600">Issues by Severity</h3>
                <span className="text-gray-300">📊</span>
              </div>
              <div className="space-y-3">
                {SEVERITIES.map(s=>(
                  <div key={s.name} className="flex items-center gap-3">
                    <div className={`h-3 rounded-full ${s.color}`} style={{width:s.pct}}></div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">{s.name} ({s.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shared Issues */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-600">Shared Community Issues</h2>
              <p className="text-sm text-gray-500">Issues that neighbors have chosen to share with the community</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg">All Shared</button>
              <button className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white">My Contributions</button>
            </div>
          </div>
          <div className="card mb-4">
            <div className="grid md:grid-cols-4 gap-3">
              {['All Categories','All Statuses','All Severities'].map(p=><select key={p} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>{p}</option></select>)}
              <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply Filters</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {SHARED_ISSUES.map((issue,i)=>(
              <div key={i} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-600">{issue.title}</h3>
                  <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-full">{issue.severity}</span>
                </div>
                <div className="text-teal-600 text-sm font-medium mb-2">{issue.category}</div>
                <p className="text-gray-600 text-sm mb-4">{issue.desc}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className={`px-2 py-1 rounded-full font-medium ${issue.status==='Open'?'bg-blue-100 text-blue-700':issue.status==='In Progress'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>{issue.status}</span>
                  <span>{issue.date}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">👤</div>
                  Contributed by {issue.contributor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinate */}
        <div>
          <h2 className="text-xl font-bold text-navy-600 mb-4">Coordinate with Your Community</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Recommended Steps', color: 'text-teal-600', bullets: ['Document all issues with photos and descriptions','Share anonymized details with your community','Use ClaimGuard to track follow-up responses','Escalate through community if individual requests fail'] },
              { icon: Mail, title: 'Contact Builder as a Group', color: 'text-amber-500', desc: 'Use this pre-formatted message when reaching out to your builder as a community:', action: 'Copy Group Message' },
              { icon: UserPlus, title: 'Invite Your Neighbors', color: 'text-teal-600', desc: 'Share this link with your neighbors so they can join the community and contribute their warranty issues:', action: 'Copy Invite Link' },
            ].map(c=>(
              <div key={c.title} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                  <h3 className="font-semibold text-navy-600">{c.title}</h3>
                </div>
                {c.bullets && <ul className="space-y-2">{c.bullets.map(b=><li key={b} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />{b}</li>)}</ul>}
                {c.desc && <><p className="text-sm text-gray-600 mb-3">{c.desc}</p><button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 w-full">{c.action}</button></>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}