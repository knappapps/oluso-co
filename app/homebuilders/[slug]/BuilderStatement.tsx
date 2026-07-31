'use client'

import { useEffect, useState } from 'react'
import { MessageSquareQuote } from 'lucide-react'

interface PublishedStatement {
  body: string
  published_at: string | null
}

export default function BuilderStatement({ builderSlug, builderName }: { builderSlug: string; builderName: string }) {
  const [statement, setStatement] = useState<PublishedStatement | null>(null)

  useEffect(() => {
    let active = true
    fetch('/.netlify/functions/public-builder-statement?slug=' + encodeURIComponent(builderSlug))
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json && json.statement) setStatement(json.statement)
      })
      .catch(() => {})
    return () => { active = false }
  }, [builderSlug])

  if (!statement) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm mb-6">
      <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <MessageSquareQuote size={16} className="text-blue-600" /> Response from {builderName}
      </h2>
      <p className="text-sm text-blue-900 whitespace-pre-wrap">{statement.body}</p>
      {statement.published_at && (
        <p className="text-xs text-blue-500 mt-3">
          Posted {new Date(statement.published_at).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
