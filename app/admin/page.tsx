'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ShieldAlert, Megaphone, Code, LayoutTemplate } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAIL = 'rknapp@gmail.com'

interface Ad {
  id: string
  sponsor_name: string
  title: string
  description: string
  cta_text: string
  link_url: string
  bg_color: string
  text_color: string
  active: boolean
  display_order: number
  embed_html?: string
}

function parseEmbedHtml(html: string): { sponsor_name: string; link_url: string; title: string } {
  const result = { sponsor_name: '', link_url: '', title: '' }
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const anchor = doc.querySelector('a[href]')
    if (anchor) {
      const href = anchor.getAttribute('href') || ''
      result.link_url = href
      try {
        const url = new URL(href)
        const host = url.hostname.replace('www.', '')
        if (host.includes('homedepot')) result.sponsor_name = 'Home Depot'
        else if (host.includes('lowes')) result.sponsor_name = "Lowe's"
        else result.sponsor_name = host.split('.')[0].replace(/-/g, ' ')
      } catch {}
    }
    const img = doc.querySelector('img[alt]')
    if (img) result.title = img.getAttribute('alt') || ''
    if (!result.title) result.title = doc.body?.textContent?.trim()?.slice(0, 60) || ''
  } catch {}
  return result
}

export default function AdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState('ads')
  const [ads, setAds] = useState<Ad[]>([])
  const [embedMode, setEmbedMode] = useState(false)
  const [embedHtml, setEmbedHtml] = useState('')
  const [parsedFields, setParsedFields] = useState({ sponsor_name: '', link_url: '', title: '' })
  const [embedPreview, setEmbedPreview] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      if (session.user.email !== ADMIN_EMAIL) { router.replace('/dashboard'); return }
      setIsAdmin(true)
      setAuthChecked(true)
    })
  }, [router])

  async function loadAds() {
    const { data } = await supabase.from('ads').select('*').order('display_order')
    setAds((data as Ad[]) || [])
  }

  useEffect(() => { if (isAdmin) loadAds() }, [isAdmin])

  function handleEmbedPaste(html: string) {
    setEmbedHtml(html)
    if (html.trim()) {
      setParsedFields(parseEmbedHtml(html))
      setEmbedPreview(true)
    } else {
      setEmbedPreview(false)
    }
  }

  async function submitEmbedAd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.from('ads').insert({
      sponsor_name: (fd.get('sponsor_name') as string) || parsedFields.sponsor_name || 'Sponsored',
      title: (fd.get('title') as string) || parsedFields.title || 'Sponsored',
      description: '',
      cta_text: '',
      link_url: parsedFields.link_url || '',
      bg_color: '#ffffff',
      text_color: '#000000',
      display_order: parseInt(fd.get('display_order') as string) || 0,
      active: true,
      embed_html: embedHtml,
    })
    if (!error) {
      setEmbedHtml('')
      setParsedFields({ sponsor_name: '', link_url: '', title: '' })
      setEmbedPreview(false)
      setFormKey(k => k + 1)
      loadAds()
    } else alert('Error: ' + error.message)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Checking access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <h1 className="text-xl font-semibold text-gray-800">Access Denied</h1>
        <p className="text-gray-500">This page is restricted to administrators.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your ads here.</p>

        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {['Ads'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${tab === t.toLowerCase() ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Megaphone size={14} />{t}
            </button>
          ))}
        </div>

        {tab === 'ads' && (
          <div className="space-y-6">

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Megaphone size={16} className="text-blue-500" /> Add New Ad
                </h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setEmbedMode(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                    <LayoutTemplate size={12} /> Manual
                  </button>
                  <button onClick={() => setEmbedMode(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${embedMode ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Code size={12} /> Paste HTML
                  </button>
                </div>
              </div>

              {!embedMode && (
                <form key={formKey} onSubmit={async (e) => {
                  e.preventDefault()
                  const f = e.currentTarget as HTMLFormElement
                  const fd = new FormData(f)
                  const { error } = await supabase.from('ads').insert({
                    sponsor_name: fd.get('sponsor_name') as string,
                    title: fd.get('title') as string,
                    description: fd.get('description') as string,
                    cta_text: fd.get('cta_text') as string,
                    link_url: fd.get('link_url') as string,
                    bg_color: fd.get('bg_color') as string,
                    text_color: fd.get('text_color') as string,
                    display_order: parseInt(fd.get('display_order') as string) || 0,
                    active: true,
                  })
                  if (!error) { f.reset(); loadAds() }
                  else alert('Error: ' + error.message)
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Sponsor Name</label>
                    <input name="sponsor_name" required placeholder="e.g. Home Depot" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Headline</label>
                    <input name="title" required placeholder="Short catchy headline" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-500 font-medium">Description</label>
                    <input name="description" required placeholder="One-line description" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">CTA Button Text</label>
                    <input name="cta_text" required defaultValue="Shop now" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Link URL</label>
                    <input name="link_url" required type="url" placeholder="https://..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Background Color</label>
                    <input name="bg_color" required defaultValue="#FFF3E0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Text/Button Color</label>
                    <input name="text_color" required defaultValue="#BF360C" className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">Display Order</label>
                    <input name="display_order" type="number" defaultValue="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add Ad</button>
                  </div>
                </form>
              )}

              {embedMode && (
                <form key={formKey} onSubmit={submitEmbedAd} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Code size={12} /> Paste HTML embed code from Home Depot, Lowe&apos;s, etc.
                    </label>
                    <textarea rows={6} value={embedHtml} onChange={e => handleEmbedPaste(e.target.value)}
                      placeholder={'Paste your affiliate HTML here, e.g.:\n<a href="https://www.homedepot.com/..."><img src="..." alt="Home Depot" /></a>'}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  {embedPreview && (
                    <div className="space-y-3">
                      <div className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-2">Auto-detected — confirm or edit:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Sponsor Name</label>
                            <input name="sponsor_name" defaultValue={parsedFields.sponsor_name} placeholder="e.g. Home Depot"
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Label / Title</label>
                            <input name="title" defaultValue={parsedFields.title} placeholder="Short label for your records"
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Display Order</label>
                            <input name="display_order" type="number" defaultValue="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                          </div>
                          {parsedFields.link_url && (
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-500 font-medium">Detected Link</label>
                              <input readOnly value={parsedFields.link_url}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 text-gray-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Preview:</p>
                        <div className="border border-gray-200 rounded-lg p-3 bg-white overflow-auto"
                          dangerouslySetInnerHTML={{ __html: embedHtml }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="submit" disabled={!embedHtml.trim()}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
                      Save Embed Ad
                    </button>
                    <button type="button" onClick={() => { setEmbedHtml(''); setParsedFields({ sponsor_name: '', link_url: '', title: '' }); setEmbedPreview(false) }}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                      Clear
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">{ads.filter(a => a.active).length} active / {ads.length} total</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {ads.map(ad => (
                  <div key={ad.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: ad.embed_html ? '#f0f9ff' : ad.bg_color, color: ad.embed_html ? '#0369a1' : ad.text_color }}>
                            {ad.sponsor_name}
                          </span>
                          {ad.embed_html && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Code size={10} /> HTML embed
                            </span>
                          )}
                          <span className={ad.active ? 'text-xs text-green-600 font-medium' : 'text-xs text-gray-400'}>
                            {ad.active ? '● Active' : '○ Paused'}
                          </span>
                          <span className="text-xs text-gray-400">Order {ad.display_order}</span>
                        </div>
                        <p className="font-medium text-gray-800 text-sm">{ad.title}</p>
                        {ad.embed_html ? (
                          <div className="mt-2 border border-gray-100 rounded-lg p-2 bg-gray-50 overflow-auto max-h-24"
                            dangerouslySetInnerHTML={{ __html: ad.embed_html }} />
                        ) : (
                          <>
                            <p className="text-xs text-gray-500 mt-0.5">{ad.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400">CTA: &quot;{ad.cta_text}&quot;</span>
                              <a href={ad.link_url} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline truncate max-w-48">{ad.link_url}</a>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={async () => { await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id); loadAds() }}
                          className={ad.active ? 'px-3 py-1 text-xs rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium' : 'px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium'}>
                          {ad.active ? 'Pause' : 'Activate'}
                        </button>
                        <button onClick={async () => { if (!confirm('Delete this ad?')) return; await supabase.from('ads').delete().eq('id', ad.id); loadAds() }}
                          className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {!ads.length && <p className="text-center py-8 text-gray-400 text-sm">No ads yet. Add one above.</p>}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}