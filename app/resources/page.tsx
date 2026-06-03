'use client'

import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { ExternalLink, Download, Phone, Scale } from 'lucide-react'

const resources = [
  {
    category: 'Legal',
    icon: Scale,
    items: [
      { title: 'Utah New Home Warranty Act', desc: 'State law governing builder warranties in Utah', type: 'link' },
      { title: 'NAHB Arbitration Program', desc: 'National homebuilder dispute resolution', type: 'link' },
      { title: 'Sample Demand Letter Template', desc: 'Template for formal written demands', type: 'download' },
    ]
  },
  {
    category: 'Expert Contacts',
    icon: Phone,
    items: [
      { title: 'Utah Division of Occupational & Professional Licensing', desc: 'File complaints against licensed contractors', type: 'link' },
      { title: 'Better Business Bureau', desc: 'File builder complaints publicly', type: 'link' },
    ]
  },
]

export default function ResourcesPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-500 text-sm mt-1">Tools, templates, and contacts for navigating warranty disputes</p>
          </div>

          <div className="space-y-6">
            {resources.map(({ category, icon: Icon, items }) => (
              <div key={category} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon size={16} className="text-blue-600" /> {category}
                </h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      {item.type === 'link' ? <ExternalLink size={14} className="text-gray-400" /> : <Download size={14} className="text-gray-400" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}