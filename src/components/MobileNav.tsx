'use client'
import { useState } from 'react'
import { Menu, X, HelpCircle, Users, User, LogOut, ShieldAlert, Monitor } from 'lucide-react'
import Link from 'next/link'

export function MobileNav({ 
  profile, 
  isAdminPanel = false,
  t 
}: { 
  profile: any,
  isAdminPanel?: boolean,
  t: any 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sm:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-2 text-zinc-400 hover:text-white transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in slide-in-from-right-full duration-300">
          <div className="p-4 flex justify-end border-b border-white/10">
            <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-col p-6 space-y-6">
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 bg-black flex items-center justify-center shrink-0">
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-6 h-6 text-zinc-500" />
                 )}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{profile?.username || 'Profile'}</div>
                <div className="text-sm text-zinc-400">{profile?.email}</div>
              </div>
            </Link>

            <div className="flex flex-col space-y-2">
              <Link href="/faq" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors text-zinc-200">
                <HelpCircle className="w-5 h-5 text-emerald-400" /> {t.faq || 'FAQ'}
              </Link>
              
              <Link href="/friends" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors text-zinc-200">
                <Users className="w-5 h-5 text-purple-400" /> {t.friends || 'Friends'}
              </Link>

              {profile?.role === 'admin' && !isAdminPanel && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl transition-colors text-amber-500 font-bold uppercase tracking-widest text-sm">
                   <ShieldAlert className="w-5 h-5" /> Admin Panel
                </Link>
              )}

              {isAdminPanel && (
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl transition-colors text-fuchsia-400 font-bold uppercase tracking-widest text-sm">
                   <Monitor className="w-5 h-5" /> View as User
                </Link>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
              <form action="/auth/signout" method="post">
                <button className="flex w-full items-center gap-4 p-4 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 font-bold uppercase tracking-widest text-sm">
                  <LogOut className="w-5 h-5" /> {t.logout || 'Logout'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
