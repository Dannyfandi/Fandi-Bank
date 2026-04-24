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
  if (!user) throw new Error('Unauthorized')

  const { data: inv } = await supabase
    .from('event_invitations')
    .select('*, events(*)')
    .eq('id', invId)
    .single()

  if (!inv || inv.user_id !== user.id) throw new Error('Not found')

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
}

export async function cancelVisitRequest(formData: FormData) {
  const visitId = formData.get('visitId') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: visit } = await supabase
    .from('visit_requests')
    .select('*')
    .eq('id', visitId)
    .single()

  if (!visit || visit.user_id !== user.id) throw new Error('Not found')

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
}

export async function updateSmilingFriendsProgress(formData: FormData) {
  const randomsSmiled = parseInt(formData.get('randomsSmiled') as string || '0', 10)
  const newlyUnlocked = formData.get('newlyUnlocked') as string | null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('sf_progress, active_theme').eq('id', user.id).single()
  const progress = profile?.sf_progress || { unlocked_mains: [], randoms_smiled: 0 }
  
  progress.randoms_smiled = randomsSmiled
  let themeUnlocked = false

  if (newlyUnlocked && !progress.unlocked_mains.includes(newlyUnlocked)) {
     progress.unlocked_mains.push(newlyUnlocked)
     
     if (progress.unlocked_mains.length >= 6) {
        themeUnlocked = true
     }
  }

  const updates: any = { sf_progress: progress }
  if (themeUnlocked) updates.active_theme = 'smiling_friends'
  await supabase.from('profiles').update(updates).eq('id', user.id)

  // Force layout re-render so the theme applies immediately without manual refresh
  if (themeUnlocked) {
    revalidatePath('/', 'layout')
  }
}

export async function resetSmilingFriends() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  await supabase.from('profiles').update({
    sf_progress: { unlocked_mains: [], randoms_smiled: 0 },
    active_theme: 'normal'
  }).eq('id', user.id)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function updateTheme(themeStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('profiles').update({ active_theme: themeStr }).eq('id', user.id)

  revalidatePath('/', 'layout')
}

// -------------------------------------------------------
// Fandi Coins: Cloud Sync (version-gated to prevent dupes)
// -------------------------------------------------------

export async function getFandiCoins(): Promise<{ coins: number, version: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { coins: 0, version: 0 }

  const { data } = await supabase
    .from('profiles')
    .select('fandi_coins, coin_sync_version')
    .eq('id', user.id)
    .single()

  return {
    coins: data?.fandi_coins || 0,
    version: data?.coin_sync_version || 0,
  }
}

export async function syncFandiCoins(delta: number, expectedVersion: number): Promise<{ coins: number, version: number, ok: boolean }> {
  if (delta <= 0) return { coins: 0, version: expectedVersion, ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { coins: 0, version: 0, ok: false }

  // Read current state
  const { data: profile } = await supabase
    .from('profiles')
    .select('fandi_coins, coin_sync_version')
    .eq('id', user.id)
    .single()

  if (!profile) return { coins: 0, version: 0, ok: false }

  // Version mismatch = this batch was already processed (duplicate request)
  if (profile.coin_sync_version !== expectedVersion) {
    return { coins: profile.fandi_coins, version: profile.coin_sync_version, ok: false }
  }

  const newCoins = (profile.fandi_coins || 0) + delta
  const newVersion = expectedVersion + 1

  // Conditional write: only one writer wins per version
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ fandi_coins: newCoins, coin_sync_version: newVersion })
    .eq('id', user.id)
    .eq('coin_sync_version', expectedVersion)

  if (updateError) {
    // Race condition: another request got there first
    const { data: fresh } = await supabase.from('profiles').select('fandi_coins, coin_sync_version').eq('id', user.id).single()
    return { coins: fresh?.fandi_coins || 0, version: fresh?.coin_sync_version || 0, ok: false }
  }

  return { coins: newCoins, version: newVersion, ok: true }
}

// -------------------------------------------------------
// Prize Requests
// -------------------------------------------------------

export async function requestPrize(itemName: string, cost: number): Promise<{ success: boolean, message: string, newCoins?: number }> {
  if (!itemName || cost <= 0) return { success: false, message: 'Invalid request' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  // Read current coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('fandi_coins')
    .eq('id', user.id)
    .single()

  const currentCoins = profile?.fandi_coins || 0
  if (currentCoins < cost) {
    return { success: false, message: 'Not enough Fandi Coins' }
  }

  // Deduct coins atomically
  const newCoins = currentCoins - cost
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ fandi_coins: newCoins })
    .eq('id', user.id)
    .gte('fandi_coins', cost) // safety: only deduct if still enough

  if (deductError) return { success: false, message: 'Failed to deduct coins' }

  // Create the prize request
  const { error: insertError } = await supabase
    .from('prize_requests')
    .insert({ user_id: user.id, item_name: itemName, cost, status: 'pending' })

  if (insertError) {
    // Refund if insert failed
    await supabase.from('profiles').update({ fandi_coins: currentCoins }).eq('id', user.id)
    return { success: false, message: 'Failed to create request' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, message: 'Prize requested!', newCoins }
}
