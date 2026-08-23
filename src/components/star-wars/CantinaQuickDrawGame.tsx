'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Crosshair, Heart, ShieldAlert, Award, RotateCcw } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface BoothTarget {
  id: number
  slotIndex: number // 0 to 5 (6 cantina booths)
  isHostile: boolean
  name: string
  emoji: string
  expiresAt: number
}

const HOSTILES = [
  { name: 'Greedo', emoji: '🦎', isHostile: true },
  { name: 'Imperial Trooper', emoji: '🪖', isHostile: true },
  { name: 'Bounty Hunter', emoji: '🎯', isHostile: true },
  { name: 'Trandoshan', emoji: '🐊', isHostile: true },
]

const INNOCENTS = [
  { name: 'Jawa Trader', emoji: '🧥', isHostile: false },
  { name: 'Protocol Droid', emoji: '🤖', isHostile: false },
  { name: 'Bartender', emoji: '🍸', isHostile: false },
]

export function CantinaQuickDrawGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [lives, setLives] = useState(3)
  const [neutralized, setNeutralized] = useState(0)
  const [activeTargets, setActiveTargets] = useState<BoothTarget[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)

  const entityIdRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const earnedCoinsRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setLives(3)
    setNeutralized(0)
    setTimeLeft(45)
    setActiveTargets([])
    setGameOver(false)
    earnedCoinsRef.current = 0
    starWarsAudio.playBlaster()
  }

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    setActiveTargets([])
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (onComplete) onComplete()
  }, [onComplete])

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || gameOver) return

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, gameOver, endGame])

  // Spawning characters in 6 cantina booths
  useEffect(() => {
    if (!isPlaying || gameOver) return

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const randomSlot = Math.floor(Math.random() * 6)
      const isHostile = Math.random() > 0.35
      const pool = isHostile ? HOSTILES : INNOCENTS
      const chosen = pool[Math.floor(Math.random() * pool.length)]

      const newTarget: BoothTarget = {
        id: entityIdRef.current++,
        slotIndex: randomSlot,
        isHostile: chosen.isHostile,
        name: chosen.name,
        emoji: chosen.emoji,
        expiresAt: now + (isHostile ? 1200 : 1500),
      }

      setActiveTargets((prev) => {
        const withoutSameSlot = prev.filter(
          (t) => t.slotIndex !== randomSlot && t.expiresAt > now
        )
        return [...withoutSameSlot, newTarget]
      })
    }, 800)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, gameOver])

  // Clear expired targets
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const cleaner = setInterval(() => {
      const now = Date.now()
      setActiveTargets((prev) => {
        const expiredHostiles = prev.filter((t) => t.expiresAt <= now && t.isHostile)
        if (expiredHostiles.length > 0) {
          // Missed shooting a hostile enemy
          setLives((l) => {
            const next = l - expiredHostiles.length
            if (next <= 0) {
              endGame()
              return 0
            }
            return next
          })
        }
        return prev.filter((t) => t.expiresAt > now)
      })
    }, 120)

    return () => clearInterval(cleaner)
  }, [isPlaying, gameOver, endGame])

  const handleShoot = (target: BoothTarget, e: React.MouseEvent) => {
    e.stopPropagation()
    starWarsAudio.playBlaster()

    // Remove hit target
    setActiveTargets((prev) => prev.filter((t) => t.id !== target.id))

    if (target.isHostile) {
      // Correct shot!
      setNeutralized((n) => n + 1)
      if (earnedCoinsRef.current < 40) {
        earnedCoinsRef.current += 2
        onAddCoins(2)
      }
    } else {
      // Friendly fire penalty!
      starWarsAudio.playLightsaberClash()
      setLives((l) => {
        const next = l - 1
        if (next <= 0) {
          endGame()
          return 0
        }
        return next
      })
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-orange-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-300">
            <Crosshair className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-orange-300 text-shadow-sm">
              Cantina Quick-Draw
            </h3>
            <p className="text-[10px] text-orange-400/70 uppercase tracking-widest font-semibold">
              Neutralize bounty hunters; spare innocent patrons
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 transition-colors ${
                  heart <= lives
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-xs font-black text-orange-300">
            ⏳ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Main Cantina Booths Stage */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950/95 border border-orange-500/20 overflow-hidden shadow-inner flex items-center justify-center p-4">
        {!isPlaying && !gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block">🍸</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Cantina de Mos Eisley
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Dispara rápidamente a los cazarrecompensas hostiles. Cuidado: no dispares a los
              droides ni a los clientes inocentes.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-orange-500/30 touch-feedback"
            >
              Entrar a la Cantina
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <Award className="w-12 h-12 text-orange-400 mx-auto" />
            <h4 className="text-xl font-black text-zinc-100">
              Tiroteo Finalizado!
            </h4>
            <p className="text-xs text-zinc-300">
              Hostiles Neutralizados: <strong className="text-orange-400">{neutralized}</strong> ·
              Monedas: <strong className="text-emerald-400">+{earnedCoinsRef.current}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Jugar de Nuevo
            </button>
          </div>
        )}

        {/* 6 Cantina Booths Grid */}
        {isPlaying && (
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm h-full p-2">
            {[0, 1, 2, 3, 4, 5].map((slot) => {
              const target = activeTargets.find((t) => t.slotIndex === slot)
              return (
                <div
                  key={slot}
                  className="rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner"
                >
                  {target ? (
                    <button
                      onClick={(e) => handleShoot(target, e)}
                      className={`w-full h-full flex flex-col items-center justify-center animate-spring-scale touch-feedback ${
                        target.isHostile
                          ? 'bg-red-950/40 border-2 border-red-500/50 shadow-[0_0_20px_rgba(255,30,86,0.4)]'
                          : 'bg-emerald-950/30 border border-emerald-500/30'
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl drop-shadow-md">
                        {target.emoji}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-full ${
                          target.isHostile
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {target.isHostile ? 'HOSTIL' : 'INOCENTE'}
                      </span>
                    </button>
                  ) : (
                    <div className="text-zinc-800 font-black text-xs">🚪</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-zinc-400 font-bold">
          Neutralizados: <strong className="text-orange-400">{neutralized}</strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoinsRef.current} Fandi Coins
        </span>
      </div>
    </div>
  )
}
