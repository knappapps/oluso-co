'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { WarrantyChecklistItem } from '@/lib/supabase'
import { CheckCircle, Circle, Home, Calendar, ChevronDown, ChevronUp, Plus, X } from 'lucide-react'

const DEFAULT_CHECKLIST: Omit<WarrantyChecklistItem, 'id' | 'user_id' | 'created_at' | 'completed' | 'completed_at'>[] = [
  { item_label: 'Check all exterior caulking and sealants around windows and doors', due_date: null, notes: '30-day inspection' },
  { item_label: 'Inspect grout lines in bathrooms and kitchen for cracking', due_date: null, notes: '30-day inspection' },
  { item_label: 'Test all GFCI outlets (kitchen, baths, garage, exterior)', due_date: null, notes: '30-day inspection' },
  { item_label: 'Run all faucets and check under sinks for leaks', due_date: null, notes: '30-day inspection' },
  { item_label: 'Check that all doors open, close, and latch properly', due_date: null, notes: '30-day inspection' },
  { item_label: 'Inspect drywall for nail pops, cracks, or settling', due_date: null, notes: '11-month inspection' },
  { item_label: 'Check attic insulation coverage and any signs of roof leaks', due_date: null, notes: '11-month inspection' },
  { item_label: 'Test smoke and CO detectors in every room', due_date: null, notes: '11-month inspection' },
  { item_label: 'Inspect foundation exterior for cracks or water staining', due_date: null, notes: '11-month inspection' },
  { item_label: 'Check HVAC filters and service records from builder', due_date: null, notes: '11-month inspection' },
  { item_label: 'Document any sticking windows or improperly sealed frames', due_date: null, notes: '11-month inspection' },
  { item_label: 'Walk entire roof perimeter for lifted shingles or flashing issues', due_date: null, notes: '11-month inspection' },
]

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  '30-day inspection': { label: '30-Day', color: 'bg-blue-100 text-blue-700' },
  '11-month inspection': { label: '11-Month', color: 'bg-orange-100 text-orange-700' },
  'custom': { label: 'Custom', color: 'bg-gray-100 text-gray-600' },
}

export default function ChecklistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WarrantyChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})
  const [addingItem, setAddingItem] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()
      if (!profile) { router.push('/login'); return }
      setUserId(profile.id)
      await loadChecklist(profile.id)
    })
  }, [router])

  async function loadChecklist(uid: string) {
    setLoading(true)
    const { data } = await supabase
      .from('warranty_checklist_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      setItems(data)
    } else {
      await seedDefaultChecklist(uid)
    }
    setLoading(false)
  }

  async function seedDefaultChecklist(uid: string) {
    const toInsert = DEFAULT_CHECKLIST.map(item => ({
      user_id: uid,
      item_label: item.item_label,
      due_date: item.due_date,
      completed: false,
      completed_at: null,
      notes: item.notes,
    }))
    const { data } = await supabase
      .from('warranty_checklist_items')
      .insert(toInsert)
      .select()
    if (data) setItems(data)
  }

  async function toggleItem(item: WarrantyChecklistItem) {
    setSaving(item.id)
    const completed = !item.completed
    const completed_at = completed ? new Date().toISOString() : null
    await supabase
      .from('warranty_checklist_items')
      .update({ completed, completed_at })
      .eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed, completed_at } : i))
    setSaving(null)
  }

  async function addCustomItem() {
    if (!newLabel.trim() || !userId) return
    setSaving('new')
    const { data } = await supabase
      .from('warranty_checklist_items')
      .insert({
        user_id: userId,
        item_label: newLabel.trim(),
        due_date: null,
        completed: false,
        completed_at: null,
        notes: 'custom',
      })
      .select()
      .single()
    if (data) setItems(prev => [...prev, data])
    setNewLabel('')
    setAddingItem(false)
    setSaving(null)
  }

  async function deleteItem(id: string) {
    await supabase.from('warranty_checklist_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const grouped = items.reduce((acc, item) => {
    const key = item.notes || 'custom'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, WarrantyChecklistItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading your checklist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Home size={20} /> Oluso
        </button>
        <span className="text-sm text-gray-500">Warranty Checklist</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Warranty Inspection Checklist</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your 30-day and 11-month inspections. Complete these before your warranty windows close.
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{completedCount} of {totalCount} items complete</span>
            <span className="text-sm font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm font-medium">
              <CheckCircle size={16} /> All items inspected! Your documentation is complete.
            </div>
          )}
        </div>

        {/* Grouped items */}
        {Object.entries(grouped).map(([groupKey, groupItems]) => {
          const meta = CATEGORY_LABELS[groupKey] || CATEGORY_LABELS['custom']
          const groupDone = groupItems.filter(i => i.completed).length
          return (
            <div key={groupKey} className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  <span className="text-xs text-gray-400">{groupDone}/{groupItems.length} done</span>
                </div>
                <Calendar size={14} className="text-gray-300" />
              </div>
              <ul className="divide-y divide-gray-50">
                {groupItems.map(item => (
                  <li key={item.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleItem(item)}
                      disabled={saving === item.id}
                      className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                      {item.completed
                        ? <CheckCircle size={20} className="text-green-500" />
                        : <Circle size={20} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.item_label}
                      </p>
                      {item.completed_at && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Completed {new Date(item.completed_at).toLocaleDateString()}
                        </p>
                      )}
                      {expandedNotes[item.id] && item.notes && item.notes !== 'custom' && (
                        <p className="text-xs text-blue-600 mt-1">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.notes && item.notes !== 'custom' && (
                        <button
                          onClick={() => setExpandedNotes(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className="text-gray-300 hover:text-gray-500"
                        >
                          {expandedNotes[item.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                      {item.notes === 'custom' && (
                        <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {/* Add custom item */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {addingItem ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomItem()}
                placeholder="Describe the item to inspect..."
                autoFocus
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addCustomItem}
                disabled={!newLabel.trim() || saving === 'new'}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button onClick={() => { setAddingItem(false); setNewLabel('') }} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors w-full"
            >
              <Plus size={16} /> Add custom checklist item
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Items are auto-saved. File a claim from your{' '}
          <button onClick={() => router.push('/dashboard')} className="text-blue-500 hover:underline">
            dashboard
          </button>{' '}
          if you find anything.
        </p>
      </main>
    </div>
  )
}
