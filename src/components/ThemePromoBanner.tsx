'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  Gamepad2,
  Rocket,
  Palette,
  ChevronRight,
  Coins,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export function ThemePromoBanner({
  lang = 'es',
}: {
  lang?: 'en' | 'es'
}) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDismissed = sessionStorage.getItem('fandi_theme_promo_dismissed')
    if (isDismissed === 'true') {
      setDismissed(true)
    }
  }, [])

  // Auto-hide after September 15, 2026
  const EXPIRATION_TIMESTAMP = new Date('2026-09-15T23:59:59').getTime()
  if (Date.now() > EXPIRATION_TIMESTAMP) {
    return null
  }

  if (!mounted || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('fandi_theme_promo_dismissed', 'true')
  }

  const scrollToGames = () => {
    const el = document.getElementById('games-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="relative p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] glass-panel-heavy border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden animate-spring-scale">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-[70px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-600/15 to-transparent rounded-full blur-[60px] pointer-events-none -ml-20 -mb-20" />

      {/* Header Row */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border border-white/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-fuchsia-200">
                {lang === 'es'
                  ? '✨ ¡Nuevos Juegos y Temas Desbloqueables!'
                  : '✨ New Unlockable Games & Themes!'}
              </h3>
              <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
                {lang === 'es' ? 'NUEVO' : 'NEW'}
              </span>
            </div>
            <p className="text-xs text-zinc-300/90 font-medium leading-relaxed mt-0.5">
              {lang === 'es'
                ? 'Juega los nuevos mini-juegos, colecciona a tus héroes y personaliza la apariencia de Fandi Bank. ¡Al completar los 6 personajes recuperas el 100% de tus monedas + 200 de bono!'
                : 'Play the new mini-games, collect all heroes, and unlock custom bank themes. Completing all 6 heroes refunds 100% of coins + 200 bonus!'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors touch-feedback shrink-0 cursor-pointer"
          title={lang === 'es' ? 'Cerrar' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Showcase Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {/* 1. Smiling Friends Card */}
        <div className="p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/30 flex flex-col justify-between gap-3 hover:border-yellow-400/50 transition-all shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-md">🐸</span>
              <div>
                <h4 className="font-black text-sm text-yellow-300">
                  Smiling Friends Labs
                </h4>
                <p className="text-[11px] text-zinc-400">
                  5 Mini-juegos · 6 Personajes
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-400" /> +200 Bono
            </span>
          </div>

          <p className="text-[11px] text-zinc-300/80 leading-snug">
            {lang === 'es'
              ? 'Tapping, Whack-a-Mole, Trivia y más. Desbloquea a Pim, Charlie y el tema psicodélico.'
              : 'Tapping, Whack-a-Mole, Trivia, and more. Unlock Pim, Charlie, and the psychedelic theme.'}
          </p>

          <button
            onClick={scrollToGames}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20 touch-feedback cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{lang === 'es' ? '¡Jugar Smiling Friends!' : 'Play Smiling Friends!'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Star Wars Card */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col justify-between gap-3 hover:border-cyan-400/50 transition-all shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-md">⚔️</span>
              <div>
                <h4 className="font-black text-sm text-cyan-300">
                  Star Wars: Galactic Arena
                </h4>
                <p className="text-[11px] text-zinc-400">
                  4 Mini-juegos · 6 Hologramas
                </p>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> +200 Bono
            </span>
          </div>

          <p className="text-[11px] text-zinc-300/80 leading-snug">
            {lang === 'es'
              ? 'Trench Run, Falcon Flight, Duelo de Sables y Cantina. Desbloquea a Luke, Vader y el tema global.'
              : 'Trench Run, Falcon Flight, Saber Duel, and Cantina. Unlock Luke, Vader, and the global theme.'}
          </p>

          <button
            onClick={scrollToGames}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 touch-feedback cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>{lang === 'es' ? '¡Jugar Star Wars!' : 'Play Star Wars!'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
