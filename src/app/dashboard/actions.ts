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

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function unlockSmilingFriendsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const allMains = ['mrfrog', 'mrboss', 'alan', 'pim', 'charlie', 'glep']
  await supabase.from('profiles').update({
    sf_progress: { unlocked_mains: allMains, randoms_smiled: 6 },
    active_theme: 'smiling_friends'
  }).eq('id', user.id)

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/games/smiling-friends')
}

export async function unlockStarWarsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  await supabase.from('profiles').update({
    active_theme: 'star_wars'
  }).eq('id', user.id)

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/admin/sandbox/star-wars')
}

export async function resetStarWarsProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  await supabase.from('profiles').update({
    active_theme: 'normal'
  }).eq('id', user.id)

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/admin/sandbox/star-wars')
}

export async function updateTheme(themeStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('profiles').update({ active_theme: themeStr }).eq('id', user.id)

  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
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
    .gte('fandi_coins', cost)

  if (deductError) return { success: false, message: 'Failed to deduct coins' }

  // Create the prize request
  const { error: insertError } = await supabase
    .from('prize_requests')
    .insert({ user_id: user.id, item_name: itemName, cost, status: 'pending' })

  if (insertError) {
    await supabase.from('profiles').update({ fandi_coins: currentCoins }).eq('id', user.id)
    return { success: false, message: 'Failed to create request' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, message: 'Prize requested!', newCoins }
}

export async function orderHappyShopWithLoan(itemName: string, amountCOP: number) {
  if (!itemName || amountCOP <= 0) return { success: false, message: 'Invalid order' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { error } = await supabase.from('debts').insert({
    user_id: user.id,
    description: `Happy Shop - ${itemName}`,
    amount: amountCOP,
    status: 'pending',
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, message: '¡Pedido agregado a tu saldo como préstamo!' }
}

export async function orderHappyShopWithCoins(itemName: string, coinCost: number) {
  return requestPrize(`Happy Shop - ${itemName}`, coinCost)
}

export async function claimThemeRefund(themeType: 'star_wars' | 'smiling_friends') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('fandi_coins, coin_sync_version, sf_progress')
    .eq('id', user.id)
    .single()

  if (!profile) return { success: false, message: 'Profile not found' }

  // Check if refund already claimed in progress
  const progress = profile.sf_progress || {}
  const refundKey = `refund_claimed_${themeType}`
  if (progress[refundKey]) {
    return { success: false, message: 'Recompensa ya reclamada' }
  }

  const bonusAmount = themeType === 'star_wars' ? 4900 : 5000
  const nextCoins = (profile.fandi_coins || 0) + bonusAmount
  const nextVersion = (profile.coin_sync_version || 0) + 1

  progress[refundKey] = true

  await supabase
    .from('profiles')
    .update({
      fandi_coins: nextCoins,
      coin_sync_version: nextVersion,
      sf_progress: progress,
    })
    .eq('id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, coins: nextCoins, message: `¡Reembolso total + 200 monedas otorgado! (+${bonusAmount} Coins)` }
}

export async function suggestUserEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  const title = (formData.get('title') as string) || 'Evento Sugerido'
  const price = (formData.get('price') as string) || '0'
  const dateMode = (formData.get('dateMode') as string) || 'single'
  const dateSingle = formData.get('dateSingle') as string
  const dateStart = formData.get('dateStart') as string
  const dateEnd = formData.get('dateEnd') as string
  const timeSlots = formData.getAll('timeSlots') as string[]
  const location = (formData.get('location') as string) || 'Lugar por definir'
  const photoUrl = (formData.get('photoUrl') as string) || ''
  const invitedUsers = formData.getAll('invitedUsers') as string[]

  let dateDisplay = ''
  if (dateMode === 'range' && dateStart && dateEnd) {
    dateDisplay = `${dateStart} al ${dateEnd}`
  } else if (dateSingle) {
    dateDisplay = dateSingle
  } else {
    dateDisplay = new Date().toISOString().split('T')[0]
  }

  const timeSlotsText = timeSlots.length > 0 ? timeSlots.join(', ') : 'Cualquier horario'
  const formattedLocation = `📍 ${location} | ⏰ Horarios: ${timeSlotsText} | 💰 Est: $${Number(price).toLocaleString('es-CO')}`

  const { data: event, error: evtErr } = await supabase
    .from('events')
    .insert({
      title: `✨ [Sugerido] ${title}`,
      event_date: dateSingle ? `${dateSingle}T12:00:00` : new Date().toISOString(),
      location: formattedLocation,
      poster_url: photoUrl || null,
    })
    .select('id')
    .single()

  if (evtErr || !event) {
    return { success: false, message: 'Error creando el evento sugerido' }
  }

  // Invite creator as accepted
  const invites = [
    {
      event_id: event.id,
      user_id: user.id,
      status: 'accepted',
    },
  ]

  // Invite selected friends
  invitedUsers.forEach((uid) => {
    if (uid !== user.id) {
      invites.push({
        event_id: event.id,
        user_id: uid,
        status: 'pending',
      })
    }
  })

  await supabase.from('event_invitations').insert(invites)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, message: '¡Evento sugerido e invitaciones enviadas a tus amigos!' }
}
