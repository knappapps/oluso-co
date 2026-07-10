'use client'

export default function AndroidInstallPrompt({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-gray-900">Install Oluso</p>
          <button onClick={onDismiss} aria-label="Close" className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none">&times;</button>
        </div>
        <p className="mt-2 text-sm text-gray-600">Add Oluso to your home screen for quick, full-screen access anytime.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onDismiss} className="flex-1 rounded-lg border border-gray-300 text-gray-700 py-2 text-sm font-medium hover:bg-gray-50">Not now</button>
          <button onClick={onInstall} className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Install</button>
        </div>
      </div>
    </div>
  )
}
