'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when menu is open on iOS / mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const menuModal = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col h-[100dvh] w-screen overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Row with Safe Area for Notch / Dynamic Island */}
      <div className="px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center border-b border-white/10 bg-zinc-950/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
            Menu
          </span>
          {profile?.role === 'admin' && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Admin
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-zinc-200 transition-all touch-feedback cursor-pointer"
          aria-label="Cerrar Menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Menu Items - min-h-0 is essential for WebKit/iOS flexbox */}
      <div className="flex-1 min-h-0 flex flex-col p-5 space-y-4 overflow-y-auto overscroll-contain">
        {/* User Profile Summary */}
        <Link
          href="/profile"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3.5 p-4 glass-panel rounded-2xl border border-white/15 touch-feedback bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 bg-black flex items-center justify-center shrink-0 shadow-lg">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white text-base truncate">
              {profile?.username || 'Profile'}
            </div>
            <div className="text-xs text-zinc-400 truncate">{profile?.email}</div>
          </div>
        </Link>

        {/* Navigation Options List */}
        <div className="flex flex-col space-y-2">
          <ThemeSettings
            activeTheme={profile?.active_theme || 'normal'}
            hasSmilingFriends={profile?.sf_progress?.unlocked_mains?.length >= 6}
            trigger={
              <div className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/10 touch-feedback cursor-pointer">
                <Palette className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold">{t.themes || 'Themes'}</span>
              </div>
            }
          />

          <Link
            href="/faq"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/10 touch-feedback"
          >
            <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{t.faq || 'FAQ'}</span>
          </Link>

          <Link
            href="/friends"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/10 touch-feedback"
          >
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <span className="text-sm font-semibold">{t.friends || 'Friends'}</span>
          </Link>

          <Link
            href="/suggest"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 p-3.5 hover:bg-white/10 rounded-2xl transition-colors text-zinc-200 glass-panel border border-white/10 touch-feedback"
          >
            <Lightbulb className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-sm font-semibold">{t.suggest || 'Suggest Idea'}</span>
          </Link>

          {profile?.role === 'admin' && !isAdminPanel && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl transition-colors text-amber-300 font-bold uppercase tracking-wider text-xs touch-feedback"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" /> Admin Panel
            </Link>
          )}

          {isAdminPanel && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3.5 p-3.5 bg-fuchsia-500/15 border border-fuchsia-500/40 rounded-2xl transition-colors text-fuchsia-200 font-bold uppercase tracking-wider text-xs touch-feedback"
            >
              <Monitor className="w-5 h-5 shrink-0 text-fuchsia-400" /> View as User
            </Link>
          )}
        </div>

        {/* Logout Section with Safe Area Bottom */}
        <div className="mt-auto pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3.5 p-3.5 hover:bg-red-500/15 rounded-2xl transition-colors text-red-400 font-bold uppercase tracking-widest text-xs touch-feedback cursor-pointer border border-transparent hover:border-red-500/30">
              <LogOut className="w-5 h-5 shrink-0" /> {t.logout || 'Logout'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="sm:hidden flex items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-300 hover:text-white rounded-xl glass-panel touch-feedback transition-colors cursor-pointer"
        aria-label="Open Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && mounted && createPortal(menuModal, document.body)}
    </div>
  )
}

