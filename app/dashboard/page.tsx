'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { PlusCircle, MapPin, Calendar, User, Eye, Edit2, CheckCircle, AlertTriangle, Clock, BarChart2, Bell, FileText, PauseCircle, PlayCircle } from 'lucide-react'

const CLAIMS = [
  { id:1, title:'Kitchen Faucet Leak', category:'Plumbing', status:'In Progress', severity:'High', desc:'The kitchen faucet has been leaking for two weeks. Water damage is spreading under the sink cabinet.', location:'Kitchen', date:'Jan 15, 2025', builder:'John Smith - ABC Builders', nextFollowup:'Jan 22, 2025' },
  { id:2, title:'Foundation Crack in Garage', category:'Structural', status:'Overdue', severity:'Critical', desc:'Visible crack running along the east wall of the garage foundation, approximately 8 inches long.', location:'Garage', date:'Dec 15, 2024', builder:'John Smith - ABC Builders', nextFollowup:'Jan 10, 2025' },
  { id:3, title:'HVAC Not Cooling Master Bedroom', category:'HVAC', status:'Waiting on Builder', severity:'Medium', desc:'Master bedroom remains 5-8 degrees warmer than thermostat setting despite multiple adjustments.', location:'Master Bedroom', date:'Jan 20, 2025', builder:'Mike Torres - Climate Pro', nextFollowup:'Jan 28, 2025' },
]

const SEVERITIES: Record<string,string> = { Critical:'bg-red-100 text-red-700', High:'bg-orange-100 text-orange-700', Medium:'bg-amber-100 text-amber-700', Low:'bg-green-100 text-green-700' }
const STATUSES: Record<string,string> = { 'In Progress':'badge-progress', 'Overdue':'badge-high', 'Resolved':'badge-resolved', 'Waiting on Builder':'badge-medium', 'Draft':'bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full' }

export default function Dashboard() {
  const [showNew, setShowNew] = useState(false)
  const [automationPaused, setAutomationPaused] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All Categories')
  const [filterSev, setFilterSev] = useState('All Severities')

  const filtered = CLAIMS.filter(c =>
    (filterCat === 'All Categories' || c.category === filterCat) &&
    (filterSev === 'All Severities' || c.severity === filterSev) &&
    (search === '' || c.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy-600">Claims Dashboard</h1>
                <p className="text-gray-500 text-sm">Track and manage your home warranty claims</p>
              </div>
              <button onClick={() => setShowNew(true)} className="btn-amber flex items-center gap-2 text-sm py-2 px-4">
                <PlusCircle className="w-4 h-4" /> New Claim
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[{icon:AlertTriangle,label:'Open Claims',value:'2',color:'text-blue-500'},{icon:CheckCircle,label:'Resolved',value:'8',color:'text-green-500'},{icon:AlertTriangle,label:'Overdue',value:'3',color:'text-red-500'},{icon:Clock,label:'Avg. Resolution',value:'14 days',color:'text-teal-500'}].map(s=>(
                <div key={s.label} className="card flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-500 text-xs"><s.icon className={`w-4 h-4 ${s.color}`} />{s.label}</div>
                  <div className="text-2xl font-bold text-navy-600">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="card mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {['All Categories','Plumbing','Structural','HVAC','Electrical','Exterior'].map(o=><option key={o}>{o}</option>)}
                </select>
                <select value={filterSev} onChange={e=>setFilterSev(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {['All Severities','Critical','High','Medium','Low'].map(o=><option key={o}>{o}</option>)}
                </select>
                <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="2026-06-02" />
                <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="2026-06-02" />
              </div>
              <div className="flex gap-2">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search claims..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600">Search</button>
                <button onClick={()=>setFilterSev('Critical')} className="border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50">Overdue</button>
                <button onClick={()=>setFilterCat('All Categories')} className="border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-50">Waiting on Builder</button>
              </div>
            </div>

            {/* Claim Cards */}
            <div className="space-y-4 mb-8">
              {filtered.map(claim=>(
                <div key={claim.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-navy-600 text-lg">{claim.title}</h3>
                      <span className="text-teal-600 text-sm font-medium">{claim.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUSES[claim.status] || 'bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full'}`}>{claim.status}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${SEVERITIES[claim.severity] || 'bg-gray-100 text-gray-600'}`}>{claim.severity}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{claim.desc}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{claim.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{claim.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{claim.builder}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />Next follow-up: {claim.nextFollowup}</span>
                    <div className="flex gap-2">
                      <button className="btn-amber text-xs py-1.5 px-3 flex items-center gap-1"><Eye className="w-3 h-3" /> View Details</button>
                      <button className="border border-gray-200 text-gray-600 text-xs py-1.5 px-3 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Edit2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
              {['Claims by Category','Severity Distribution'].map(t=>(
                <div key={t} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-navy-600">{t}</h3>
                    <BarChart2 className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t} chart</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 space-y-4">
            <div className="card">
              <div className="text-xs text-gray-400 text-center mb-1">Sponsored</div>
              <div className="text-sm font-medium text-navy-600 text-center">Quality Home Improvement Products</div>
            </div>
            <div className="card bg-teal-600 text-white">
              <div className="font-bold mb-1">Upgrade to Premium</div>
              <p className="text-teal-100 text-sm mb-3">Get AI-powered follow-ups, executive contacts, and remove ads.</p>
              <button className="bg-white text-teal-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-50 w-full">Learn More</button>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 font-medium mb-1">Current Plan</div>
              <div className="text-lg font-bold text-navy-600">Free</div>
              <div className="text-xs text-gray-400 mb-3">Renews Jan 1, 2025</div>
              <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 w-full">Manage Subscription</button>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold text-navy-600"><Bell className="w-4 h-4 text-teal-600" /> Notifications</div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-teal-600" /></div>
                <div>
                  <p className="text-gray-700 text-xs">Builder responded to your Kitchen Faucet Leak claim</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 font-semibold text-navy-600 mb-3"><FileText className="w-4 h-4 text-teal-600" /> Follow-up Template</div>
              <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 w-full">Edit Default Template</button>
            </div>
            <div className="card">
              <div className="font-semibold text-navy-600 mb-3">Automation Controls</div>
              <button onClick={() => setAutomationPaused(!automationPaused)} className={`flex items-center gap-2 w-full justify-center text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${automationPaused ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                <PauseCircle className="w-4 h-4" /> {automationPaused ? 'Automation Paused' : 'Pause All Automation'}
              </button>
              {automationPaused && (
                <button onClick={() => setAutomationPaused(false)} className="flex items-center gap-2 w-full justify-center text-sm font-semibold px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 mt-2 transition-colors">
                  <PlayCircle className="w-4 h-4" /> Resume All Automation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Claim Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-navy-600 mb-6">New Warranty Claim</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Kitchen Faucet Leak" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select className="w-full border border-gray-200 rounded-lg px-4 py-3"><option>Plumbing</option><option>Structural</option><option>HVAC</option><option>Electrical</option><option>Exterior</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Severity</label><select className="w-full border border-gray-200 rounded-lg px-4 py-3"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Room / Location</label><input className="w-full border border-gray-200 rounded-lg px-4 py-3" placeholder="Kitchen" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-3" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Describe the issue..." /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowNew(false)} className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600">Create Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}