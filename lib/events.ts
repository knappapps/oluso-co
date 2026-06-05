// Item 4: lib/events.ts
// Central utility for logging claim_events audit trail.
// Call logEvent() from any page or function to record timestamped actions.
import { supabase } from '@/lib/supabase'

export type EventType =
  | 'claim_created'
    | 'message_sent'
      | 'builder_replied'
        | 'builder_first_reply'
          | 'status_changed'
            | 'escalated'
              | 'photo_uploaded'
                | 'resolved'
                  | 'reopened'
                    | 'checklist_item_checked'
                      | 'warranty_milestone_alert'

                      export interface LogEventParams {
                        claim_id: string
                          event_type: EventType
                            event_data?: Record<string, unknown>
                              actor?: string
                              }

                              /**
                               * Log a claim event to the audit trail.
                                * Fire-and-forget safe — errors are caught and logged, not thrown.
                                 */
                                 export async function logEvent(params: LogEventParams): Promise<void> {
                                   try {
                                       const { error } = await supabase
                                             .from('claim_events')
                                                   .insert({
                                                           claim_id: params.claim_id,
                                                                   event_type: params.event_type,
                                                                           event_data: params.event_data || {},
                                                                                   actor: params.actor || null,
                                                                                           created_at: new Date().toISOString()
                                                                                                 })

                                                                                                     if (error) {
                                                                                                           console.error('[logEvent] Supabase insert error:', error.message)
                                                                                                               }
                                                                                                                 } catch (err) {
                                                                                                                     console.error('[logEvent] Unexpected error:', err)
                                                                                                                       }
                                                                                                                       }
                                                                                                                       
                                                                                                                       /**
                                                                                                                        * Fetch the full event timeline for a claim, ordered chronologically.
                                                                                                                         */
                                                                                                                         export async function getClaimTimeline(claimId: string) {
                                                                                                                           const { data, error } = await supabase
                                                                                                                               .from('claim_events')
                                                                                                                                   .select('*')
                                                                                                                                       .eq('claim_id', claimId)
                                                                                                                                           .order('created_at', { ascending: true })
                                                                                                                                           
                                                                                                                                             if (error) {
                                                                                                                                                 console.error('[getClaimTimeline] Error:', error.message)
                                                                                                                                                     return []
                                                                                                                                                       }
                                                                                                                                                       
                                                                                                                                                         return data || []
                                                                                                                                                         }
                                                                                                                                                         
                                                                                                                                                         /**
                                                                                                                                                          * Human-readable label for each event type.
                                                                                                                                                           */
                                                                                                                                                           export const EVENT_LABELS: Record<EventType, string> = {
                                                                                                                                                             claim_created: 'Claim filed',
                                                                                                                                                               message_sent: 'Message sent to builder',
                                                                                                                                                                 builder_replied: 'Builder responded',
                                                                                                                                                                   builder_first_reply: 'Builder first response',
                                                                                                                                                                     status_changed: 'Status updated',
                                                                                                                                                                       escalated: 'Claim escalated',
                                                                                                                                                                         photo_uploaded: 'Photo attached',
                                                                                                                                                                           resolved: 'Claim resolved',
                                                                                                                                                                             reopened: 'Claim reopened',
                                                                                                                                                                               checklist_item_checked: 'Warranty checklist item checked',
                                                                                                                                                                                 warranty_milestone_alert: 'Warranty milestone alert sent'
                                                                                                                                                                                 }
                                                                                                                                                                                 
                                                                                                                                                                                 /**
                                                                                                                                                                                  * Color coding for event types — used in timeline UI.
                                                                                                                                                                                   */
                                                                                                                                                                                   export const EVENT_COLORS: Record<EventType, string> = {
                                                                                                                                                                                     claim_created: 'bg-blue-100 text-blue-700',
                                                                                                                                                                                       message_sent: 'bg-indigo-100 text-indigo-700',
                                                                                                                                                                                         builder_replied: 'bg-green-100 text-green-700',
                                                                                                                                                                                           builder_first_reply: 'bg-emerald-100 text-emerald-700',
                                                                                                                                                                                             status_changed: 'bg-yellow-100 text-yellow-700',
                                                                                                                                                                                               escalated: 'bg-red-100 text-red-700',
                                                                                                                                                                                                 photo_uploaded: 'bg-purple-100 text-purple-700',
                                                                                                                                                                                                   resolved: 'bg-green-100 text-green-800',
                                                                                                                                                                                                     reopened: 'bg-orange-100 text-orange-700',
                                                                                                                                                                                                       checklist_item_checked: 'bg-teal-100 text-teal-700',
                                                                                                                                                                                                         warranty_milestone_alert: 'bg-pink-100 text-pink-700'
                                                                                                                                                                                                         }
