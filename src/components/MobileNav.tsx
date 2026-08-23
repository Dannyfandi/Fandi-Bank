'use client'

import { useState } from 'react'
import {
  Menu,
  X,
  HelpCircle,
  Users,
  User,
  LogOut,
  ShieldAlert,
  Monitor,
  Palette,
  Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import { ThemeSettings } from './ThemeSettings'

export function MobileNav({
  profile,
  isAdminPanel = false,
  t,
}: {
  profile: any
  isAdminPanel?: boolean
  t: any
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sm:hidden flex items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-300 hover:text-white rounded-xl glass-panel touch-feedback transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col animate-in slide-in-from-right-full duration-300">
          <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/30">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Menu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-zinc-400 hover:text-white bg-white/10 rounded-full touch-feedback"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col p-5 space-y-5 overflow-y-auto">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-4 glass-panel rounded-2xl border border-white/15 touch-feedback"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-500/40 bg-black flex items-center justify-center shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-base truncate">
                  {profile?.username || 'Profile'}
                </div>
                <div className="text-xs text-zinc-400 truncate">{profile?.email}</div>
              </div>
            </Link>

            <div className="flex flex-col space-y-1.5">
              <ThemeSettings
                activeTheme={profile?.active_theme || 'normal'}
                hasSmilingFriends={profile?.sf_progress?.unlocked_mains?.length >= 6}
                trigger={
                  <div className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/5 touch-feedback">
                    <Palette className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold">{t.themes || 'Themes'}</span>
                  </div>
                }
              />
              <Link
                href="/faq"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/5 touch-feedback"
              >
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold">{t.faq || 'FAQ'}</span>
              </Link>

              <Link
                href="/friends"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/5 touch-feedback"
              >
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold">{t.friends || 'Friends'}</span>
              </Link>

              <Link
                href="/suggest"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/5 touch-feedback"
              >
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold">{t.suggest || 'Suggest Idea'}</span>
              </Link>

              {profile?.role === 'admin' && !isAdminPanel && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl transition-colors text-amber-400 font-bold uppercase tracking-wider text-xs touch-feedback"
                >
                  <ShieldAlert className="w-5 h-5" /> Admin Panel
                </Link>
              )}

              {isAdminPanel && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 bg-fuchsia-500/15 border border-fuchsia-500/30 rounded-2xl transition-colors text-fuchsia-300 font-bold uppercase tracking-wider text-xs touch-feedback"
                >
                  <Monitor className="w-5 h-5" /> View as User
                </Link>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
              <form action="/auth/signout" method="post">
                <button className="flex w-full items-center gap-3.5 p-3.5 hover:bg-red-500/15 rounded-2xl transition-colors text-red-400 font-bold uppercase tracking-widest text-xs touch-feedback">
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
