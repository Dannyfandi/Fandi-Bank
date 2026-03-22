'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const username = formData.get('username') as string
  const description = formData.get('description') as string
  const avatarFile = formData.get('avatarFile') as File | null

  // Process potential file upload
  let uploadedAvatarUrl: string | undefined = undefined

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    // Generate a unique file name using user.id and timestamp
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    // Upload the raw image file directly to the Supabase "avatars" bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false // We use unique names so we don't need upsert
      })

    if (!uploadError && uploadData) {
       // Retrieve the permanent public URL for the newly uploaded Image
       const { data: { publicUrl } } = supabase.storage
         .from('avatars')
         .getPublicUrl(uploadData.path)
       
       uploadedAvatarUrl = publicUrl
    } else {
       console.error("Storage upload error:", uploadError)
    }
  }

  // Construct our update object (only overwrite Avatar if a new picture was successfully uploaded)
  const updateData: any = {
    username: username || '',
    description: description || ''
  }

  if (uploadedAvatarUrl) {
    updateData.avatar_url = uploadedAvatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update profile:', error)
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}
