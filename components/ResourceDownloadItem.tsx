'use client'

import { useState } from 'react'
import { Download, X } from 'lucide-react'

export interface ResourceDownloadItemProps {
  title: string
  desc: string
  url: string
}

export default function ResourceDownloadItem({ title, desc, url }: ResourceDownloadItemProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleOpen() {
    setOpen(true)
    if (content === null) {
      setLoading(true)
      try {
        const res = await fetch(url)
        const text = await res.text()
        setContent(text)
      } catch {
        setContent('Unable to load preview. Use the download button below instead.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer text-left"
      >
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <Download size={14} className="text-gray-400" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {loading ? (
                <p className="text-sm text-gray-400">Loading preview...</p>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{content}</pre>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                Close
              </button>
              <a
                href={url}
                download
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
