import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function IndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth')
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    return redirect('/admin')
  }

  return redirect('/dashboard')
}
