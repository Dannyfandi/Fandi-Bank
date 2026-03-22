import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  
  if (!q) return NextResponse.json({ users: [] })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ users: [] })

  // Search by partial username match (case-insensitive)
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, description')
    .ilike('username', `%${q}%`)
    .neq('id', user.id)
    .limit(10)

  return NextResponse.json({ users: users || [] })
}
