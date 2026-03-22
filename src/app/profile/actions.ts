'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // CRITICAL: Do NOT throw Error — it crashes iOS Safari. Use redirect instead.
  if (!user) return redirect('/auth')

  const username = formData.get('username') as string
  const description = formData.get('description') as string
  const avatarFile = formData.get('avatarFile') as File | null

  let uploadedAvatarUrl: string | undefined = undefined

  if (avatarFile && avatarFile.size > 0) {
    // Normalize extension — iOS sometimes sends .heic or weird names
    let fileExt = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(fileExt)) {
      fileExt = 'jpg'
    }
    // Use a stable filename per user so re-uploads overwrite cleanly
    const fileName = `${user.id}.${fileExt}`
    
    // Convert File to ArrayBuffer for reliable cross-platform upload (fixes iOS Safari)
    const arrayBuffer = await avatarFile.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Determine content type — fall back to jpeg if iOS doesn't send one
    const contentType = avatarFile.type || 'image/jpeg'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType
      })

    if (!uploadError && uploadData) {
       const { data: { publicUrl } } = supabase.storage
         .from('avatars')
         .getPublicUrl(uploadData.path)
       uploadedAvatarUrl = `${publicUrl}?t=${Date.now()}`
    } else {
       console.error("Storage upload error:", uploadError)
       // Don't crash — just skip avatar update
    }
  }

  const updateData: Record<string, string> = {
    username: username || '',
    description: description || ''
  }

  if (uploadedAvatarUrl) {
    updateData.avatar_url = uploadedAvatarUrl
  }

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}
