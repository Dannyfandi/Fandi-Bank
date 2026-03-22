'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitTicketRequest(formData: FormData) {
  const eventName = formData.get('eventName') as string
  const eventDate = formData.get('eventDate') as string
  if (!eventName) return 'Event name is required'
  const fullEventName = eventDate ? `${eventName} (Date: ${eventDate})` : eventName

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'Unauthorized'

  const { error } = await supabase
    .from('ticket_requests')
    .insert({ user_id: user.id, event_name: fullEventName })

  if (error) {
    console.error(error)
    return 'Failed to submit request'
  }

  revalidatePath('/dashboard')
  return null
}

export async function submitVisitRequest(formData: FormData) {
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const stay = formData.get('stay') as string
  
  if (!date || !time || !stay) return 'All fields required'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { error } = await supabase
    .from('visit_requests')
    .insert({ user_id: user.id, visit_date: date, arrival_time: time, stay_status: stay })

  if (error) {
    console.error(error)
    return 'Failed to submit'
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return null
}

export async function submitLoanRequest(formData: FormData) {
  const amount = Number(formData.get('amount'))
  if (isNaN(amount) || amount <= 0 || amount > 500000) return 'Invalid amount. Max is 500,000 COP.'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { error } = await supabase.from('loan_requests').insert({ user_id: user.id, amount })
  if (error) return 'Failed to submit'
  
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return null
}
