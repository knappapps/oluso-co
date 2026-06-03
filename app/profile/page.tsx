'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { Edit2, User, Users, LogOut, Bell } from 'lucide-react'

function ProfileContent() {
const [editing, setEditing] = useState(false)
const [notifications, setNotifications] = useState<Record<string,boolean>>({ email: true, sms: false, weekly: true })

return (
<div className="min-h-screen bg-gray-50">
<Header currentPage="Profile" />
<section className="bg-gradient-to-r from-teal-600 to-teal-400 py-12 px-4 text-center text-white">
<h1 className="text-3xl font-bold mb-2">Your Profile & Community</h1>
<p className="text-teal-100">Manage your account settings, notification preferences, and connect with your neighborhood community.</p>
</section>
<div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
<div className="card flex flex-col items-center text-center">
<div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-3"><User className="w-10 h-10 text-teal-600" /></div>
<div className="font-bold text-navy-600 text-lg mb-1">Sarah Johnson</div>
<div className="text-sm text-gray-500 mb-4">sarah.johnson@email.com</div>
<button className="btn-amber text-sm py-2 px-4 w-full">View My Claims</button>
</div>
<div className="card md:col-span-2">
<div className="flex items-center justify-between mb-4">
<h2 className="font-bold text-navy-600 text-lg">Profile Information</h2>
<button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-amber-500 text-sm font-medium hover:text-amber-600"><Edit2 className="w-4 h-4" /> {editing ? 'Save' : 'Edit Profile'}</button>
</div>
<div className="grid grid-cols-2 gap-4">
{[{label:'Full Name',value:'Sarah Johnson'},{label:'Phone Number',value:'(555) 123-4567'},{label:'Address',value:'1234 Oak Street, Austin, TX 78701'},{label:'Builder Name',value:'Prestige Homes LLC'},{label:'Warranty Start',value:'March 1, 2024'},{label:'Warranty End',value:'March 1, 2025'}].map(f=>(
<div key={f.label}>
<label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
{editing ? <input defaultValue={f.value} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /> : <div className="text-sm text-navy-600 font-medium">{f.value}</div>}
</div>
))}
</div>
</div>
<div className="card md:col-span-3">
<h2 className="font-bold text-navy-600 text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-teal-600" /> Community Membership</h2>
<div className="grid md:grid-cols-3 gap-4">
<div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
<div className="font-semibold text-teal-700 mb-1">Oakwood Estates</div>
<div className="text-xs text-gray-500 mb-3">Austin, TX 78745 · 47 members</div>
<button className="border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 w-full flex items-center justify-center gap-1"><LogOut className="w-3 h-3" /> Leave Community</button>
</div>
<div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
<Users className="w-8 h-8 text-gray-300 mb-2" />
<div className="text-sm text-gray-500 mb-2">Join an existing community</div>
<button className="bg-teal-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-teal-700 w-full">Join Community</button>
</div>
<div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
<Users className="w-8 h-8 text-gray-300 mb-2" />
<div className="text-sm text-gray-500 mb-2">Create a new neighborhood community</div>
<button className="bg-amber-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-amber-600 w-full">Create Community</button>
</div>
</div>
</div>
<div className="card md:col-span-3">
<h2 className="font-bold text-navy-600 text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-teal-600" /> Notification Preferences</h2>
<div className="grid md:grid-cols-3 gap-4">
{[
{ key: 'email', label: 'Email Notifications', desc: 'Follow-up reminders and builder responses' },
{ key: 'sms', label: 'SMS Notifications', desc: 'Urgent alerts and deadline reminders' },
{ key: 'weekly', label: 'Weekly Summary', desc: 'Weekly digest of all claim activity' },
].map(n => (
<div key={n.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
<div><div className="font-medium text-navy-600 text-sm">{n.label}</div><div className="text-xs text-gray-500">{n.desc}</div></div>
<button onClick={() => setNotifications(prev => ({...prev, [n.key]: !prev[n.key]}))} className={`w-10 h-6 rounded-full transition-colors ${notifications[n.key] ? 'bg-teal-500' : 'bg-gray-200'}`}>
<div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${notifications[n.key] ? 'translate-x-4' : 'translate-x-0'}`} />
</button>
</div>
))}
</div>
</div>
</div>
</div>
)
}

export default function Profile() {
  return <AuthGuard><ProfileContent /></AuthGuard>
}
