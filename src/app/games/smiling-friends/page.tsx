import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Gamepad2, Sparkles } from 'lucide-react'
import { cookies } from 'next/headers'
import { SmilingFriendsHub } from '@/components/smiling-friends/SmilingFriendsHub'

export default async function SmilingFriendsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value || 'es'
  const lang = (langCookie === 'en' ? 'en' : 'es') as 'en' | 'es'

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, sf_progress, active_theme, fandi_coins, coin_sync_version')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#100D04] text-zinc-100 p-4 sm:p-6 md:p-8 font-sans pb-24 relative overflow-hidden">
      {/* Background artwork softened with glowing blobs */}
      <img
        src="/sf_bg.jpg"
        alt=""
        className="fixed inset-0 w-full h-full object-cover blur-[14px] opacity-40 scale-105 pointer-events-none"
      />
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-yellow-500/30">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 hover:text-yellow-300 transition-colors touch-feedback"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Tablero
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" /> Smiling Friends World
            </span>
          </div>
        </div>

        {/* Master Smiling Friends Hub */}
        <SmilingFriendsHub
          lang={lang}
          initialProgress={profile?.sf_progress}
          initialCoins={profile?.fandi_coins || 0}
          initialVersion={profile?.coin_sync_version || 0}
        />
      </div>
    </div>
  )
}
