'use client'

import { useState } from 'react'
import { Palette, Check, Monitor, Gamepad2, X, Sparkles } from 'lucide-react'
import { updateTheme } from '@/app/dashboard/actions'

export function ThemeSettings({
  activeTheme,
  hasSmilingFriends,
  trigger,
}: {
  activeTheme: string
  hasSmilingFriends: boolean
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleThemeChange = async (theme: string) => {
    setIsUpdating(true)
    await updateTheme(theme)
    setIsUpdating(false)
    setOpen(false)
  }

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer flex-1">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-zinc-300 hover:text-white touch-feedback"
          title="Themes"
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-heavy rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-spring-scale border border-white/20">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <Palette className="w-4 h-4 text-purple-400" /> Appearance & Themes
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-3.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Active Theme Engine
              </p>

              {/* Fandi Normal Theme */}
              <button
                disabled={isUpdating}
                onClick={() => handleThemeChange('normal')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all touch-feedback ${
                  activeTheme === 'normal' || !activeTheme
                    ? 'bg-purple-900/30 border-purple-500/60 shadow-lg shadow-purple-900/30'
                    : 'bg-black/40 border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-black text-sm ${
                        activeTheme === 'normal' || !activeTheme
                          ? 'text-purple-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      Luminous Glass
                    </p>
                    <p className="text-[11px] text-zinc-400">Default dark violet glass</p>
                  </div>
                </div>
                {(activeTheme === 'normal' || !activeTheme) && (
                  <Check className="w-5 h-5 text-purple-400" />
                )}
              </button>

              {/* Smiling Friends Theme */}
              <button
                disabled={!hasSmilingFriends || isUpdating}
                onClick={() => handleThemeChange('smiling_friends')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all touch-feedback ${
                  activeTheme === 'smiling_friends'
                    ? 'bg-[#eab308]/20 border-[#eab308]/60 shadow-lg shadow-yellow-500/20'
                    : !hasSmilingFriends
                    ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-black/40 border-white/10 hover:border-[#eab308]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-[#eab308]">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-black text-sm ${
                        activeTheme === 'smiling_friends'
                          ? 'text-[#eab308]'
                          : 'text-zinc-200'
                      }`}
                    >
                      Smiling Friends Labs
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {hasSmilingFriends
                        ? 'Unlocked Reward Theme!'
                        : 'Locked. Defeat the minigame.'}
                    </p>
                  </div>
                </div>
                {activeTheme === 'smiling_friends' && (
                  <Check className="w-5 h-5 text-[#eab308]" />
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> More themes coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
