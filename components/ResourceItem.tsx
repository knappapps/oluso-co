'use client'

import { useEffect, useState } from 'react'
import { Download, ExternalLink, X } from 'lucide-react'

interface ResourceItemProps {
  title: string
  desc: string
  url?: string
  type: string
}

export default function ResourceItem({ title, desc, url, type }: ResourceItemProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || type !== 'download' || !url || content) return
    setLoading(true)
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => setContent('Unable to load preview. Please use the download button below.'))
      .finally(() => setLoading(false))
  }, [open, type, url, content])

  if (type === 'link' && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <ExternalLink size={14} className="text-gray-400" />
      </a>
    )
  }

  if (type === 'download' && url) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
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
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading preview…</p>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{content}</pre>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end">
                <a
                  href={url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
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

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <Download size={14} className="text-gray-400" />
    </div>
  )
}
