'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { Users, Crown, DollarSign, TrendingDown, Search, Edit2, Key, Trash2, PlusCircle, Download, Shield, Wrench } from 'lucide-react'

const USERS = [
  { name:'Sarah Mitchell', email:'sarah.m@email.com', role:'Homeowner', community:'Oakwood Estates', lastLogin:'Jan 15, 2025' },
  { name:'James Park', email:'james.p@email.com', role:'Admin', community:'Cedar Ridge', lastLogin:'Jan 20, 2025' },
  { name:'Maria Torres', email:'m.torres@email.com', role:'Homeowner', community:'Willow Oaks', lastLogin:'Dec 28, 2024' },
]
const TESTIMONIALS = [
  { name:'Alex Chen', community:'Willow Oaks', quote:'ClaimGuard helped me get 14 issues resolved before year one.', outcome:'Repairs completed 3x faster', status:'Published' },
  { name:'Jamie Lee', community:'Cedar Ridge', quote:'The automated follow-ups saved me hours every month.', outcome:'Builder responded within 48hrs', status:'Draft' },
]
const RESOURCES = [
  { name:'John Smith, VP Operations', type:'Executive Contact', location:'Austin, TX', desc:'Senior executive for escalation', visibility:'Premium Only' },
  { name:"First-Time Buyer's Warranty Guide", type:'Guide', location:'Texas', desc:'Comprehensive guide for new homeowners', visibility:'All Users' },
]
const CONTACTS = [
  { builder:'Horizon Homes', contact:'Robert Chen', role:'Regional Director', email:'r.chen@horizonhomes.com', phone:'(512) 555-0147' },
  { builder:'Prestige Homes LLC', contact:'Diana Walsh', role:'Warranty Manager', email:'d.walsh@prestighomes.com', phone:'(512) 555-0293' },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [routingMode, setRoutingMode] = useState('landing')
  const [flags, setFlags] = useState({ aiMessaging: true, premiumResources: true, communityFeatures: true })
  const [userSearch, setUserSearch] = useState('')

  const tabs = ['overview','users','content','contacts','analytics','settings']

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Dashboard" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Wrench className="w-5 h-5 text-amber-600" /></div>
          <div><h1 className="text-2xl font-bold text-navy-600">Admin Console</h1><p className="text-gray-500 text-sm">Platform management and monitoring</p></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab===t ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t}</button>
          ))}
          <div className="ml-auto flex gap-2">
            <button className={`border px-3 py-1.5 rounded-lg text-sm ${routingMode==='landing'?'border-teal-500 text-teal-600 bg-teal-50':'border-gray-200 text-gray-600'}`} onClick={()=>setRoutingMode('landing')}>View as Free</button>
            <button className={`border px-3 py-1.5 rounded-lg text-sm ${routingMode==='premium'?'border-amber-500 text-amber-600 bg-amber-50':'border-gray-200 text-gray-600'}`} onClick={()=>setRoutingMode('premium')}>View as Premium</button>
          </div>
        </div>

        {/* Revenue & Growth */}
        {(activeTab==='overview'||activeTab==='analytics') && (
          <div className="space-y-6 mb-6">
            <h2 className="text-lg font-bold text-navy-600">Revenue & Growth Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {icon:Users,label:'Total Active Users',value:'2,847',change:'+12% from last month',color:'text-teal-500',pos:true},
                {icon:Crown,label:'Premium Subscribers',value:'486',change:'+8% from last month',color:'text-amber-500',pos:true},
                {icon:DollarSign,label:'Monthly Recurring Revenue',value:'$4,860',change:'+15% from last month',color:'text-green-500',pos:true},
                {icon:TrendingDown,label:'Monthly Churn Rate',value:'2.3%',change:'-0.5% from last month',color:'text-red-500',pos:false},
              ].map(m=>(
                <div key={m.label} className="card">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-2"><m.icon className={`w-4 h-4 ${m.color}`}/>{m.label}</div>
                  <div className="text-2xl font-bold text-navy-600 mb-1">{m.value}</div>
                  <div className={`text-xs ${m.pos?'text-green-600':'text-red-500'}`}>{m.change}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[{title:'Signups Over Time'},{title:'Premium Subscription Growth'}].map(c=>(
                <div key={c.title} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-navy-600">{c.title}</h3>
                    <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"><option>Last 30 days</option><option>Last 3 months</option><option>Last year</option></select>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">{c.title} chart will render here</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{label:'Total Claims',value:'12,847'},{label:'Open Claims',value:'3,241'},{label:'Closed Claims',value:'9,606'},{label:'Avg. Resolution Time',value:'14 days'}].map(s=>(
                <div key={s.label} className="card"><div className="text-xs text-gray-500 mb-1">{s.label}</div><div className="text-xl font-bold text-navy-600">{s.value}</div></div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        {activeTab==='overview' && (
          <div className="card mb-6">
            <h2 className="font-bold text-navy-600 mb-1">Activity log</h2>
            <p className="text-sm text-gray-500 mb-4">Review recent admin and system activities across the workspace.</p>
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <input type="date" placeholder="Start date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input type="date" placeholder="End date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>All users</option><option>Jane Admin</option></select>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>All types</option><option>Login</option><option>Settings change</option><option>User edit</option></select>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Results</span>
              <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Download className="w-4 h-4" /> Export</button>
            </div>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3 text-gray-500 font-medium">Timestamp</th><th className="text-left px-4 py-3 text-gray-500 font-medium">User</th><th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th></tr></thead>
                <tbody>
                  {[{ts:'2025-01-15 14:32',user:'Jane Admin',action:'Updated global settings'},
                    {ts:'2025-01-15 13:10',user:'System',action:'Automated follow-up sent to 14 builders'},
                    {ts:'2025-01-14 09:45',user:'Jane Admin',action:'Added new Premium resource'},
                  ].map((row,i)=>(
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{row.ts}</td>
                      <td className="px-4 py-3 font-medium text-navy-600">{row.user}</td>
                      <td className="px-4 py-3 text-gray-600">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab==='users' && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy-600 text-lg">User Management</h2>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search by name or email..." className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm" /></div>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>All Roles</option><option>Admin</option><option>Homeowner</option></select>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm"><option>All Plans</option><option>Free</option><option>Premium</option></select>
              <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center gap-1"><Search className="w-4 h-4" /> Search</button>
            </div>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Name','Email','Role','Community','Last Login','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {USERS.filter(u=>!userSearch||u.name.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u,i)=>(
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-navy-600">{u.name}</td>
                      <td className="px-4 py-3 text-teal-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.role}</td>
                      <td className="px-4 py-3 text-gray-600">{u.community}</td>
                      <td className="px-4 py-3 text-gray-400">{u.lastLogin}</td>
                      <td className="px-4 py-3"><div className="flex gap-2"><button className="text-teal-600 hover:text-teal-700"><Edit2 className="w-4 h-4" /></button><button className="text-gray-400 hover:text-gray-600"><Key className="w-4 h-4" /></button><button className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Management */}
        {activeTab==='content' && (
          <div className="space-y-6">
            {/* Testimonials */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-navy-600 text-lg">Testimonial Management</h2>
                <button className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Add Testimonial</button>
              </div>
              <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['Name','Community','Quote','Outcome','Status','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}</tr></thead>
              <tbody>{TESTIMONIALS.map((t,i)=><tr key={i} className="border-t border-gray-100"><td className="px-4 py-3 font-medium">{t.name}</td><td className="px-4 py-3 text-gray-500">{t.community}</td><td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.quote}</td><td className="px-4 py-3 text-gray-600">{t.outcome}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${t.status==='Published'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{t.status}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button className="text-teal-600"><Edit2 className="w-4 h-4" /></button><button className="text-red-400"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>
            </div>
            {/* Resources */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-navy-600 text-lg">Premium Resource Management</h2>
                <button className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Add Resource</button>
              </div>
              <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['Name','Type','Location','Description','Visibility','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}</tr></thead>
              <tbody>{RESOURCES.map((r,i)=><tr key={i} className="border-t border-gray-100"><td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3 text-gray-500">{r.type}</td><td className="px-4 py-3 text-gray-500">{r.location}</td><td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.desc}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${r.visibility==='Premium Only'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>{r.visibility}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button className="text-teal-600"><Edit2 className="w-4 h-4" /></button><button className="text-red-400"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>
            </div>
          </div>
        )}

        {/* Contacts */}
        {activeTab==='contacts' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy-600 text-lg">Builder Executive Contacts Library</h2>
              <div className="flex gap-2">
                <button className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Download className="w-4 h-4" /> Import CSV</button>
                <button className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center gap-1"><PlusCircle className="w-4 h-4" /> Add Contact</button>
              </div>
            </div>
            <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['Builder','Contact Name','Role','Email','Phone','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}</tr></thead>
            <tbody>{CONTACTS.map((c,i)=><tr key={i} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 font-medium">{c.builder}</td><td className="px-4 py-3">{c.contact}</td><td className="px-4 py-3 text-gray-500">{c.role}</td><td className="px-4 py-3 text-teal-600">{c.email}</td><td className="px-4 py-3 text-gray-600">{c.phone}</td><td className="px-4 py-3"><div className="flex gap-2"><button className="text-teal-600"><Edit2 className="w-4 h-4" /></button><button className="text-red-400"><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>
          </div>
        )}

        {/* Settings */}
        {activeTab==='settings' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-bold text-navy-600 text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-teal-600" /> Global Settings</h2>
              <div className="space-y-4">
                {[{key:'aiMessaging',label:'AI Messaging',desc:'Enable AI-powered follow-up generation'},{key:'premiumResources',label:'Premium Resources',desc:'Gate resource library for premium users'},{key:'communityFeatures',label:'Community Features',desc:'Enable neighborhood visibility features'}].map(s=>(
                  <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><div className="font-medium text-navy-600 text-sm">{s.label}</div><div className="text-xs text-gray-500">{s.desc}</div></div>
                    <input type="checkbox" checked={flags[s.key as keyof typeof flags]} onChange={e=>setFlags(f=>({...f,[s.key]:e.target.checked}))} className="w-4 h-4 accent-teal-600" />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h2 className="font-bold text-navy-600 text-lg mb-4">Routing & Ad Settings</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Routing Mode</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={routingMode==='landing'} onChange={()=>setRoutingMode('landing')} className="accent-teal-600" /><span className="text-sm">Show public landing first</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={routingMode==='login'} onChange={()=>setRoutingMode('login')} className="accent-teal-600" /><span className="text-sm">Direct to internal login</span></label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Partner ID</label>
                <input placeholder="Enter partner tracking ID" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <button className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"><Shield className="w-4 h-4" /> Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}