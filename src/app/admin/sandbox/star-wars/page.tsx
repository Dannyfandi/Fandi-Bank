import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Sparkles } from 'lucide-react'
import { StarWarsArena } from '@/components/star-wars/StarWarsArena'

export default async function StarWarsSandboxPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, fandi_coins, coin_sync_version')
    .eq('id', user.id)
    .single()

  // Strict Deployment Rule: ONLY accessible to Admins in sandbox
  if (profile?.role !== 'admin') {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#05070E] text-zinc-100 p-4 sm:p-6 md:p-8 font-sans pb-24 relative overflow-hidden">
      {/* Background Starfield and Galactic Aura */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 100px 150px, #00E5FF, rgba(0,0,0,0)), radial-gradient(1px 1px at 250px 280px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 400px 320px, #FFB800, rgba(0,0,0,0))',
          backgroundSize: '550px 550px',
        }}
      />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-cyan-500/30">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300 hover:text-cyan-200 transition-colors touch-feedback"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin Sandbox
            </span>
          </div>
        </div>

        {/* Master Star Wars Arena Component */}
        <StarWarsArena
          initialCoins={profile?.fandi_coins || 0}
          initialVersion={profile?.coin_sync_version || 0}
        />
      </div>
    </div>
  )
}
