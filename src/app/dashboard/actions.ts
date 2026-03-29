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

export async function submitSuggestion(formData: FormData) {
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  
  if (!description) return { error: 'Description is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('user_suggestions')
    .insert({ user_id: user.id, type, description })

  if (error) {
    console.error(error)
    return { error: 'Failed to submit' }
  }

  revalidatePath('/admin')
  return { success: 'Suggestion submitted! 🎉' }
}

export async function rsvpEvent(formData: FormData) {
  const invId = formData.get('invitationId') as string
  const newStatus = formData.get('status') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { data: inv } = await supabase
    .from('event_invitations')
    .select('*, events(*)')
    .eq('id', invId)
    .single()

  if (!inv || inv.user_id !== user.id) return 'Not found'

  // Auto-generate visit request when accepting an event at Mojo Dojo Casa House
  if (inv.status === 'pending' && newStatus === 'accepted') {
    const loc = inv.events.location?.toLowerCase() || ''
    if (loc.includes('mojo') || loc.includes('dojo') || loc.includes('casa') || loc.includes('house')) {
       const eventDateObj = new Date(inv.events.event_date)
       const dateOnly = eventDateObj.toISOString().split('T')[0]
       const timeOnly = eventDateObj.toISOString().split('T')[1].slice(0, 5) // HH:MM

       await supabase.from('visit_requests').insert({
         user_id: user.id,
         visit_date: dateOnly,
         arrival_time: `${timeOnly}:00`,
         stay_status: 'Event',
         status: 'approved',
         event_id: inv.events.id
       })
    }
  }

  // If canceling an accepted invitation near the event
  if (inv.status === 'accepted' && newStatus === 'declined') {
    const eventDate = new Date(inv.events.event_date)
    const now = new Date()
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    // 48h Penalty applies to both events and tied house visits
    if (diffHours >= 0 && diffHours < 48) {
      await supabase.from('debts').insert({
        user_id: user.id,
        amount: 2000,
        description: `Late Cancellation Penalty: ${inv.events.title}`,
        status: 'pending'
      })
    }

    // Delete tied visit request if it exists to cleanly unsync it
    await supabase.from('visit_requests').delete().eq('event_id', inv.events.id).eq('user_id', user.id)
  }

  await supabase.from('event_invitations').update({ status: newStatus }).eq('id', invId)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return null
}

export async function cancelVisitRequest(formData: FormData) {
  const visitId = formData.get('visitId') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  const { data: visit } = await supabase
    .from('visit_requests')
    .select('*')
    .eq('id', visitId)
    .single()

  if (!visit || visit.user_id !== user.id) return 'Not found'

  // Standard standalone visit cancellation 48h penalty
  const visitDateLocal = new Date(`${visit.visit_date}T${visit.arrival_time}-05:00`)
  const now = new Date()
  const diffHours = (visitDateLocal.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours >= 0 && diffHours < 48) {
    await supabase.from('debts').insert({
      user_id: user.id,
      amount: 2000,
      description: `Late Cancellation Penalty: House Visit`,
      status: 'pending'
    })
  }

  if (visit.event_id) {
    // If it was tied to an event, we must decline the event invitation manually to keep state in sync
    // This assumes the penalty fee was already applied above (only 1 fee per event-visit duo!)
    await supabase.from('event_invitations').update({ status: 'declined' }).eq('event_id', visit.event_id).eq('user_id', user.id)
  }

  // Delete the visit request physically
  await supabase.from('visit_requests').delete().eq('id', visitId)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return null
}
