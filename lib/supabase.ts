import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  builder_name: string | null
  community_name: string | null
  warranty_start: string | null
  warranty_end: string | null
  plan: 'free' | 'basic' | 'pro'
  created_at: string
}

export interface Builder {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  region: string | null
  state: string | null
  response_time_avg_hours: number | null
  total_claims: number
  resolved_claims: number
  created_at: string
}

export interface Claim {
  id: string
  user_id: string
  builder_id: string | null
  title: string
  description: string | null
  category: 'structural' | 'water' | 'electrical' | 'hvac' | 'plumbing' | 'cosmetic' | 'landscaping' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'awaiting_builder' | 'resolved' | 'escalated' | 'closed'
  email_thread_address: string | null
  builder_email: string | null
  created_at: string
  first_response_at: string | null
  resolved_at: string | null
  resolution_days: number | null
  builder?: Builder
  messages?: Message[]
}

export interface Message {
  id: string
  claim_id: string
  direction: 'outbound' | 'inbound'
  from_email: string
  to_email: string
  subject: string | null
  body: string | null
  message_id: string | null
  in_reply_to: string | null
  sent_at: string
}
