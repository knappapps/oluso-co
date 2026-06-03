'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Users, FileText, Building2, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, RefreshCw, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAIL = 'rknapp@gmail.com';

interface User { id: string; name: string; email: string; builder_name: string; city: string; state: string; plan: string; onboarding_complete: boolean; created_at: string; }
interface Claim { id: string; title: string; category: string; severity: string; status: string; created_at: string; resolved_at: string | null; first_response_at: string | null; user_id: string; builder_id: string; email_thread_address: string; users?: { name: string; email: string }; builders?: { name: string }; }
interface Builder { id: string; name: string; }
interface Stats { totalUsers: number; totalClaims: number; openClaims: number; resolvedClaims: number; criticalClaims: number; totalMessages: number; avgResponseDays: number | null; }

const SEVERITY_COLOR: Record<string, string> = { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' };
const STATUS_COLOR: Record<string, string> = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', awaiting_builder: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700', closed: 'bg-gray-100 text-gray-600' };

function exportCSV(data: object[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => JSON.stringify((r as Record<string,unknown>)[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}><Icon size={20} /></div>
      <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<'overview' | 'users' | 'claims' | 'builders' | 'messages'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [messages, setMessages] = useState<{ id: string; claim_id: string; direction: string; from_email: string; subject: string; sent_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimFilter, setClaimFilter] = useState('all');
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  // ── Admin guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      if (session.user.email !== ADMIN_EMAIL) { router.replace('/dashboard'); return; }
      setIsAdmin(true);
      setAuthChecked(true);
    });
  }, [router]);

  async function loadAll() {
    setLoading(true);
    const [usersRes, claimsRes, buildersRes, messagesRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('claims').select('*, users(name, email), builders(name)').order('created_at', { ascending: false }),
      supabase.from('builders').select('*').order('name'),
      supabase.from('messages').select('id, claim_id, direction, from_email, subject, sent_at').order('sent_at', { ascending: false }).limit(100),
    ]);
    const u = usersRes.data || [];
    const c = claimsRes.data || [];
    const b = buildersRes.data || [];
    const m = messagesRes.data || [];
    setUsers(u as User[]); setClaims(c as Claim[]); setBuilders(b as Builder[]); setMessages(m);
    const resolved = c.filter(cl => cl.resolved_at && cl.first_response_at);
    const totalResponseDays = resolved.reduce((sum, cl) => sum + (new Date(cl.first_response_at!).getTime() - new Date(cl.created_at).getTime()) / 86400000, 0);
    setStats({ totalUsers: u.length, totalClaims: c.length, openClaims: c.filter(cl => cl.status === 'open').length, resolvedClaims: c.filter(cl => cl.status === 'resolved' || cl.status === 'closed').length, criticalClaims: c.filter(cl => cl.severity === 'critical').length, totalMessages: m.length, avgResponseDays: resolved.length ? Math.round((totalResponseDays / resolved.length) * 10) / 10 : null });
    setLoading(false);
  }

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  const builderScorecard = builders.map(b => {
    const bClaims = claims.filter(c => c.builder_id === b.id);
    const bResolved = bClaims.filter(c => c.resolved_at && c.first_response_at);
    const avgDays = bResolved.length ? Math.round(bResolved.reduce((sum, c) => sum + (new Date(c.first_response_at!).getTime() - new Date(c.created_at).getTime()) / 86400000, 0) / bResolved.length * 10) / 10 : null;
    return { name: b.name, total: bClaims.length, critical: bClaims.filter(c => c.severity === 'critical').length, resolved: bResolved.length, avgDays, resolveRate: bClaims.length ? Math.round((bClaims.filter(c => c.status === 'resolved' || c.status === 'closed').length / bClaims.length) * 100) : 0 };
  }).filter(b => b.total > 0).sort((a, b) => b.total - a.total);

  const filteredClaims = claimFilter === 'all' ? claims : claims.filter(c => c.status === claimFilter);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'claims', label: `Claims (${claims.length})`, icon: FileText },
    { id: 'builders', label: 'Builders', icon: Building2 },
    { id: 'messages', label: `Messages (${messages.length})`, icon: MessageSquare },
  ] as const;

  // Show nothing while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Checking access...</p>
      </div>
    );
  }

  // Double-check — should never reach here due to redirect, but safety net
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <h1 className="text-xl font-semibold text-gray-800">Access Denied</h1>
        <p className="text-gray-500">This page is restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time data from Supabase</p>
          </div>
          <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-20 text-gray-400">Loading data from Supabase...</div>}

        {!loading && tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
              <StatCard icon={FileText} label="Total Claims" value={stats.totalClaims} color="bg-indigo-100 text-indigo-600" />
              <StatCard icon={Clock} label="Open Claims" value={stats.openClaims} color="bg-yellow-100 text-yellow-600" />
              <StatCard icon={CheckCircle} label="Resolved" value={stats.resolvedClaims} color="bg-green-100 text-green-600" />
              <StatCard icon={AlertTriangle} label="Critical" value={stats.criticalClaims} color="bg-red-100 text-red-600" />
              <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} color="bg-purple-100 text-purple-600" />
            </div>
            {stats.avgResponseDays !== null && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500 mb-1">Avg. Builder First Response</p>
                <p className="text-3xl font-bold text-orange-600">{stats.avgResponseDays} days</p>
                <p className="text-xs text-gray-400 mt-1">Based on {claims.filter(c => c.first_response_at).length} claims with recorded responses</p>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Recent Claims</h3>
                <button onClick={() => setTab('claims')} className="text-xs text-blue-600 hover:underline">View all →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {claims.slice(0, 8).map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-gray-400 text-xs">{(c as Claim & { users?: {name:string} }).users?.name} · {(c as Claim & { builders?: {name:string} }).builders?.name} · {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLOR[c.severity] || 'bg-gray-100 text-gray-600'}`}>{c.severity}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
                {!claims.length && <p className="text-center py-8 text-gray-400 text-sm">No claims yet.</p>}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">All Users ({users.length})</h3>
              <button onClick={() => exportCSV(users, 'oluso-users.csv')} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"><Download size={12} /> Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>{['Name','Email','Builder','City/State','Plan','Onboarding','Joined'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.builder_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.city ? `${u.city}, ${u.state}` : '—'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{u.plan || 'free'}</span></td>
                      <td className="px-4 py-3">{u.onboarding_complete ? <span className="text-green-600 text-xs">✓ Done</span> : <span className="text-gray-400 text-xs">Pending</span>}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!users.length && <p className="text-center py-12 text-gray-400">No users yet.</p>}
            </div>
          </div>
        )}

        {!loading && tab === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {['all','open','in_progress','awaiting_builder','resolved','escalated','closed'].map(s => (
                  <button key={s} onClick={() => setClaimFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${claimFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {s === 'all' ? `All (${claims.length})` : `${s.replace(/_/g, ' ')} (${claims.filter(c => c.status === s).length})`}
                  </button>
                ))}
              </div>
              <button onClick={() => exportCSV(claims.map(c => ({...c, user: (c as Claim & {users?:{name:string}}).users?.name, builder: (c as Claim & {builders?:{name:string}}).builders?.name})), 'oluso-claims.csv')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"><Download size={12} /> Export CSV</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="divide-y divide-gray-100">
                {filteredClaims.map(c => (
                  <div key={c.id}>
                    <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setExpandedClaim(expandedClaim === c.id ? null : c.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{c.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(c as Claim & {users?:{name:string}}).users?.name} · {(c as Claim & {builders?:{name:string}}).builders?.name} · {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLOR[c.severity]}`}>{c.severity}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status]}`}>{c.status.replace(/_/g,' ')}</span>
                        {expandedClaim === c.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    {expandedClaim === c.id && (
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Email thread:</span> {c.email_thread_address || '—'}</p>
                        <p><span className="font-medium">Category:</span> {c.category}</p>
                        <p><span className="font-medium">First response:</span> {c.first_response_at ? new Date(c.first_response_at).toLocaleString() : 'None yet'}</p>
                        <p><span className="font-medium">Resolved:</span> {c.resolved_at ? new Date(c.resolved_at).toLocaleString() : 'Not resolved'}</p>
                        <p className="text-xs text-gray-400">Claim ID: {c.id}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!filteredClaims.length && <p className="text-center py-12 text-gray-400">No claims match this filter.</p>}
            </div>
          </div>
        )}

        {!loading && tab === 'builders' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => exportCSV(builderScorecard, 'oluso-builder-scorecard.csv')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"><Download size={12} /> Export Scorecard CSV</button>
            </div>
            {builderScorecard.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                <p>No claim data yet. Builder scorecards will appear once homeowners file claims.</p>
              </div>
            )}
            <div className="grid gap-4">
              {builderScorecard.map(b => (
                <div key={b.name} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">{b.name}</h3>
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-500">{b.total} claims</span>
                      {b.critical > 0 && <span className="text-red-600 font-medium">{b.critical} critical</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Resolve Rate</p>
                      <p className={`text-xl font-bold ${b.resolveRate >= 70 ? 'text-green-600' : b.resolveRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{b.resolveRate}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Avg Response</p>
                      <p className="text-xl font-bold text-gray-800">{b.avgDays !== null ? `${b.avgDays}d` : '—'}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Resolved</p>
                      <p className="text-xl font-bold text-gray-800">{b.resolved}/{b.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">All Tracked Builders ({builders.length})</h3></div>
              <div className="divide-y divide-gray-50">
                {builders.map(b => {
                  const count = claims.filter(c => c.builder_id === b.id).length;
                  return (
                    <div key={b.id} className="px-5 py-3 flex items-center justify-between text-sm">
                      <span className="text-gray-800">{b.name}</span>
                      <span className="text-gray-400">{count} {count === 1 ? 'claim' : 'claims'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Email Activity ({messages.length})</h3>
              <button onClick={() => exportCSV(messages, 'oluso-messages.csv')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"><Download size={12} /> Export CSV</button>
            </div>
            <div className="divide-y divide-gray-50">
              {messages.map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{m.subject || '(no subject)'}</p>
                    <p className="text-xs text-gray-400">{m.from_email} · Claim {m.claim_id.slice(0,8)}...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.direction === 'inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{m.direction}</span>
                    <span className="text-gray-400 text-xs">{new Date(m.sent_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!messages.length && <p className="text-center py-12 text-gray-400">No messages yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
