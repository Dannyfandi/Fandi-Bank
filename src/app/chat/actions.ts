'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const content = formData.get('content') as string
  const receiverId = formData.get('receiverId') as string
  
  if (!content || !receiverId) return 'Invalid payload'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Unauthorized'

  await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content
  })

  // Revalidate both views so it appears instantly for both
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return null
}
