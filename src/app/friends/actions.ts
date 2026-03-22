'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendFriendRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const username = (formData.get('username') as string).trim()
  if (!username) return

  // Find user by username
  const { data: target } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!target || target.id === user.id) return

  // Check if friendship already exists in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) return // Already exists

  await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: target.id,
    status: 'pending'
  })

  revalidatePath('/friends')
}

export async function respondFriendRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const friendshipId = formData.get('friendshipId') as string
  const status = formData.get('status') as string

  await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id) // Only the receiver can respond

  revalidatePath('/friends')
}

export async function sendFriendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const receiverId = formData.get('receiverId') as string
  const content = formData.get('content') as string
  const sharedDebtIdsRaw = formData.get('sharedDebtIds') as string

  let sharedDebtIds: string[] = []
  if (sharedDebtIdsRaw) {
    try { sharedDebtIds = JSON.parse(sharedDebtIdsRaw) } catch {}
  }

  if (!content.trim() && sharedDebtIds.length === 0) return

  await supabase.from('friend_messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content || (sharedDebtIds.length > 0 ? '📄 Shared transactions' : ''),
    shared_debt_ids: sharedDebtIds
  })

  revalidatePath('/friends')
}
