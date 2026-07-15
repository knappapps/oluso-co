import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export interface User {
    id: string
    auth_id: string | null
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
    warranty_year: number | null
    plan: 'free' | 'basic' | 'pro'
    role: 'admin' | 'user' | null
    onboarding_complete: boolean
    created_at: string
    notification_prefs: Record<string, boolean> | null
    subscribed_alerts: boolean | null
    slug: string | null
}

export interface Builder {
    id: string
    name: string
    company: string | null
    email: string | null
    state: string | null
    response_time_avg_hours: number | null
    total_claims: number
    resolved_claims: number
}

export interface Claim {
    id: string
    user_id: string
    builder_id: string | null
    title: string
    description: string | null
    category: string
    severity: string
    status: string
    email_thread_address: string | null
    builder_email: string | null
    builder_name: string | null
    created_at: string
    first_response_at: string | null
    resolved_at: string | null
    deleted_at: string | null
    defect_location: string | null
    defect_sub_category: string | null
    estimated_repair_cost: number | null
    warranty_year: number | null
    public_story: boolean | null
    response_deadline: string | null
    days_to_first_response: number | null
    builder_accepted: boolean | null
    resolution_notes: string | null
    attachments?: Attachment[]
    messages?: Message[]
}

export interface ClaimEvent {
    id: string
    claim_id: string
    event_type: string
    actor: string
    metadata: Record<string, unknown> | null
    created_at: string
}

export interface WarrantyChecklistItem {
    id: string
    user_id: string
    item_label: string
    due_date: string | null
    completed: boolean
    completed_at: string | null
    notes: string | null
    created_at: string
}

export interface DataSubscription {
    id: string
    buyer_name: string
    buyer_email: string
    api_key: string
    plan: 'basic' | 'premium' | 'enterprise'
    active: boolean
    created_at: string
    last_accessed_at: string | null
}

export interface Message {
    id: string
    claim_id: string
    direction: 'outbound' | 'inbound'
    from_email: string
    to_email: string
    subject: string | null
    body: string | null
    sent_at: string
}

export interface Attachment {
    id: string
    claim_id: string
    file_name: string
    file_path: string
    file_size: number | null
    file_type: string | null
    storage_bucket: string
    uploaded_at: string
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function getProfile(authId: string): Promise<User | null> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()
    return data
}
