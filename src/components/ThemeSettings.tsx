'use client'

import { useState } from 'react'
import { Palette, Check, Monitor, Gamepad2, X, Sparkles, Zap } from 'lucide-react'
import { updateTheme } from '@/app/dashboard/actions'

export function ThemeSettings({
  activeTheme,
  hasSmilingFriends,
  hasStarWars = true,
  trigger,
}: {
  activeTheme: string
  hasSmilingFriends: boolean
  hasStarWars?: boolean
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
                <Palette className="w-4 h-4 text-purple-400" /> Temas y Apariencia
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Motor de Temas Activo
              </p>

              {/* 1. Fandi Normal Theme */}
              <button
                disabled={isUpdating}
                onClick={() => handleThemeChange('normal')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all touch-feedback ${
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
                    <p className="text-[11px] text-zinc-400">Violeta oscuro y neón</p>
                  </div>
                </div>
                {(activeTheme === 'normal' || !activeTheme) && (
                  <Check className="w-5 h-5 text-purple-400" />
                )}
              </button>

              {/* 2. Star Wars Edition */}
              <button
                disabled={!hasStarWars || isUpdating}
                onClick={() => handleThemeChange('star_wars')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all touch-feedback ${
                  activeTheme === 'star_wars'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                    : !hasStarWars
                    ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-black/40 border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_#00E5FF]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-black text-sm ${
                        activeTheme === 'star_wars' ? 'text-cyan-300' : 'text-zinc-200'
                      }`}
                    >
                      Star Wars Edition
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {hasStarWars
                        ? 'Espacio profundo y Kyber neón'
                        : 'Desbloquea los 6 hologramas'}
                    </p>
                  </div>
                </div>
                {activeTheme === 'star_wars' && (
                  <Check className="w-5 h-5 text-cyan-400" />
                )}
              </button>

              {/* 3. Smiling Friends Theme */}
              <button
                disabled={!hasSmilingFriends || isUpdating}
                onClick={() => handleThemeChange('smiling_friends')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all touch-feedback ${
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
                        ? 'Tema amarillo psicodélico'
                        : 'Desbloquea los 6 personajes'}
                    </p>
                  </div>
                </div>
                {activeTheme === 'smiling_friends' && (
                  <Check className="w-5 h-5 text-[#eab308]" />
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Nuevos temas próximamente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
