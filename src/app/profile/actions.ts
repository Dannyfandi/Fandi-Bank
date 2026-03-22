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

  let uploadedAvatarUrl: string | undefined = undefined

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    // Use a stable filename per user so re-uploads overwrite cleanly (fixes iPhone issues)
    const fileName = `${user.id}.${fileExt}`
    
    // Convert File to ArrayBuffer for reliable cross-platform upload (fixes iOS Safari)
    const arrayBuffer = await avatarFile.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Determine content type
    const contentType = avatarFile.type || 'image/jpeg'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: true, // Overwrite existing avatar
        contentType: contentType
      })

    if (!uploadError && uploadData) {
       const { data: { publicUrl } } = supabase.storage
         .from('avatars')
         .getPublicUrl(uploadData.path)
       
       // Append cache-busting timestamp so browsers show the new image
       uploadedAvatarUrl = `${publicUrl}?t=${Date.now()}`
    } else {
       console.error("Storage upload error:", uploadError)
    }
  }

  const updateData: Record<string, string> = {
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
