'use client'

import { useState } from 'react'
import {
  Sparkles,
  RotateCcw,
  Unlock,
  CheckCircle,
  Gamepad2,
  Rocket,
  Palette,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import {
  unlockSmilingFriendsAdmin,
  resetSmilingFriends,
  unlockStarWarsAdmin,
  resetStarWarsProgress,
  updateTheme,
} from '@/app/dashboard/actions'

export function AdminThemeManager({
  currentTheme = 'normal',
  hasSmilingFriends = false,
}: {
  currentTheme?: string
  hasSmilingFriends?: boolean
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const handleAction = async (actionName: string, fn: () => Promise<void>) => {
    try {
      setLoadingAction(actionName)
      setMsg('')
      await fn()
      setMsg('✅ ¡Acción completada con éxito!')
    } catch (e: any) {
      setMsg('❌ Error: ' + (e?.message || 'Fallo en la operación'))
    } finally {
      setLoadingAction(null)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="p-5 sm:p-7 rounded-[32px] glass-panel-heavy border border-purple-500/30 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Gestor de Temas y Progreso (Admin Suite)
            </h3>
            <p className="text-xs text-zinc-400">
              Desbloquea, resetea o cambia instantáneamente los temas de la app para pruebas.
            </p>
          </div>
        </div>

        {msg && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30 animate-spring-scale self-start sm:self-auto">
            {msg}
          </span>
        )}
      </div>

      {/* Theme Quick Switcher */}
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest font-black text-zinc-400">
          🎨 Cambio Rápido de Tema Activo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleAction('theme_normal', () => updateTheme('normal'))}
            disabled={loadingAction !== null}
            className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-between touch-feedback ${
              currentTheme === 'normal'
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>💎</span>
              <span>Luminous Glass (Normal)</span>
            </div>
            {currentTheme === 'normal' && <CheckCircle className="w-4 h-4 text-purple-400" />}
          </button>

          <button
            onClick={() => handleAction('theme_sf', () => updateTheme('smiling_friends'))}
            disabled={loadingAction !== null}
            className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-between touch-feedback ${
              currentTheme === 'smiling_friends'
                ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🐸</span>
              <span>Smiling Friends</span>
            </div>
            {currentTheme === 'smiling_friends' && <CheckCircle className="w-4 h-4 text-yellow-400" />}
          </button>

          <button
            onClick={() => handleAction('theme_sw', () => updateTheme('star_wars'))}
            disabled={loadingAction !== null}
            className={`p-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-between touch-feedback ${
              currentTheme === 'star_wars'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>⚔️</span>
              <span>Star Wars Edition</span>
            </div>
            {currentTheme === 'star_wars' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Two Hub Cards: Smiling Friends & Star Wars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Smiling Friends Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-yellow-950/20 border border-yellow-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐸</span>
              <div>
                <h4 className="font-black text-sm text-yellow-300">
                  Smiling Friends Controls
                </h4>
                <p className="text-[10px] text-zinc-400">
                  6 Personajes · 5 Mini-juegos
                </p>
              </div>
            </div>

            <Link
              href="/games/smiling-friends"
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400/30 transition-colors flex items-center gap-1"
            >
              <Gamepad2 className="w-3 h-3" /> Abrir Mundo
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleAction('unlock_sf', unlockSmilingFriendsAdmin)}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md touch-feedback"
            >
              {loadingAction === 'unlock_sf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
              Desbloquear Todo
            </button>

            <button
              onClick={() => handleAction('reset_sf', resetSmilingFriends)}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 touch-feedback"
            >
              {loadingAction === 'reset_sf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Resetear Progreso
            </button>
          </div>
        </div>

        {/* Star Wars Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <h4 className="font-black text-sm text-cyan-300">
                  Star Wars Edition Controls
                </h4>
                <p className="text-[10px] text-zinc-400">
                  6 Héroes · 4 Mini-juegos · Tema Global
                </p>
              </div>
            </div>

            <Link
              href="/admin/sandbox/star-wars"
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/30 transition-colors flex items-center gap-1"
            >
              <Rocket className="w-3 h-3" /> Abrir Sandbox
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleAction('unlock_sw', unlockStarWarsAdmin)}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md touch-feedback"
            >
              {loadingAction === 'unlock_sw' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
              Desbloquear Tema
            </button>

            <button
              onClick={() => handleAction('reset_sw', resetStarWarsProgress)}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 touch-feedback"
            >
              {loadingAction === 'reset_sw' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Resetear Star Wars
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
