'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const username = formData.get('username') as string
  const description = formData.get('description') as string
  const avatar_url = formData.get('avatarUrl') as string

  const { error } = await supabase
    .from('profiles')
    .update({ 
      username: username || '', 
      description: description || '', 
      avatar_url: avatar_url || '' 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update profile:', error)
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}
