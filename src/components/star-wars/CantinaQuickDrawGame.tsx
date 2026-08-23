'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Crosshair, Heart, Award, RotateCcw, Zap, Flame } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface BoothTarget {
  id: number
  slotIndex: number // 0 to 5 (6 cantina booths)
  isHostile: boolean
  name: string
  emoji: string
  expiresAt: number
  spawnedAt: number
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
  const [streak, setStreak] = useState(0)
  const [activeTargets, setActiveTargets] = useState<BoothTarget[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const entityIdRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const earnedCoinsRef = useRef(0)
  const neutralizedRef = useRef(0)

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    setActiveTargets([])
    if (intervalRef.current) clearInterval(intervalRef.current)
    setHighScore((prev) => Math.max(prev, neutralizedRef.current))
    if (onComplete) onComplete()
  }, [onComplete])

  const startGame = () => {
    setIsPlaying(true)
    setLives(3)
    setNeutralized(0)
    setStreak(0)
    setActiveTargets([])
    setGameOver(false)
    setEarnedCoins(0)
    earnedCoinsRef.current = 0
    neutralizedRef.current = 0
    starWarsAudio.playBlaster()
  }

  // Spawning characters in 6 cantina booths with accelerating interval & reaction time
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const tick = () => {
      const now = Date.now()
      const currentScore = neutralizedRef.current
      // Progressive reaction window (1500ms down to 450ms)
      const reactionTime = Math.max(450, 1500 - currentScore * 25)
      // Progressive spawn interval (900ms down to 380ms)
      const spawnDelay = Math.max(380, 900 - currentScore * 14)

      const randomSlot = Math.floor(Math.random() * 6)
      const isHostile = Math.random() > 0.3
      const pool = isHostile ? HOSTILES : INNOCENTS
      const chosen = pool[Math.floor(Math.random() * pool.length)]

      const newTarget: BoothTarget = {
        id: entityIdRef.current++,
        slotIndex: randomSlot,
        isHostile: chosen.isHostile,
        name: chosen.name,
        emoji: chosen.emoji,
        expiresAt: now + reactionTime,
        spawnedAt: now,
      }

      setActiveTargets((prev) => {
        const withoutSameSlot = prev.filter(
          (t) => t.slotIndex !== randomSlot && t.expiresAt > now
        )
        return [...withoutSameSlot, newTarget]
      })

      intervalRef.current = setTimeout(tick, spawnDelay)
    }

    intervalRef.current = setTimeout(tick, 600)

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [isPlaying, gameOver])

  // Cleaner loop to check expired hostile targets
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const cleaner = setInterval(() => {
      const now = Date.now()
      setActiveTargets((prev) => {
        const expiredHostiles = prev.filter((t) => t.expiresAt <= now && t.isHostile)
        if (expiredHostiles.length > 0) {
          starWarsAudio.playLightsaberClash()
          setLives((l) => {
            const next = l - expiredHostiles.length
            if (next <= 0) {
              endGame()
              return 0
            }
            return next
          })
          setStreak(0)
        }
        return prev.filter((t) => t.expiresAt > now)
      })
    }, 80)

    return () => clearInterval(cleaner)
  }, [isPlaying, gameOver, endGame])

  // Tap Target Shooter
  const handleShoot = (target: BoothTarget) => {
    starWarsAudio.playBlaster()

    if (target.isHostile) {
      neutralizedRef.current += 1
      const count = neutralizedRef.current
      setNeutralized(count)
      setStreak((s) => s + 1)

      // Award coins every 5 neutralized enemies
      if (count % 5 === 0 && earnedCoinsRef.current < 50) {
        earnedCoinsRef.current += 2
        setEarnedCoins(earnedCoinsRef.current)
        onAddCoins(2)
        starWarsAudio.playKyberChime(880)
      }
    } else {
      // Shot an innocent civilian or droid!
      starWarsAudio.playLightsaberClash()
      setLives((l) => {
        const next = l - 1
        if (next <= 0) {
          endGame()
          return 0
        }
        return next
      })
      setStreak(0)
    }

    setActiveTargets((prev) => prev.filter((t) => t.id !== target.id))
  }

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Crosshair className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-amber-300 text-shadow-sm flex items-center gap-2">
              Mos Eisley Quick-Draw Cantina
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Endless
              </span>
            </h3>
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">
              Dispara solo a enemigos · Se acelera progresivamente
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
          <div className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-black text-amber-300">
            🎯 {neutralized}
          </div>
        </div>
      </div>

      {/* Cantina Arena (6 Interactive Booths) */}
      <div className="relative w-full min-h-[340px] sm:min-h-[380px] rounded-2xl bg-amber-950/30 border border-amber-500/30 p-3 sm:p-4 grid grid-cols-3 gap-2.5 sm:gap-3.5 shadow-inner">
        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 rounded-2xl">
            <span className="text-5xl block animate-bounce">🔫</span>
            <h4 className="text-lg sm:text-xl font-black text-white">Duelo de Cantina Infinito</h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Dispara a cazarrecompensas y soldados antes de que disparen. ¡No le dispares a Jawas ni
              a camareros!
            </p>
            {highScore > 0 && (
              <p className="text-xs font-black text-amber-300">
                🏆 Récord Actual: {highScore} enemigos eliminados
              </p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-amber-500/30 touch-feedback"
            >
              Comenzar Tiro Rápido
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 rounded-2xl animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-amber-400">Fin del Duelo</h4>
            <p className="text-xs text-zinc-300">
              Enemigos Eliminados: <strong className="text-amber-300">{neutralized}</strong> ·
              Monedas Ganadas: <strong className="text-emerald-400">+{earnedCoins} Fandi Coins</strong>
            </p>
            {neutralized >= highScore && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                <Award className="w-3.5 h-3.5" /> ¡Nuevo Récord en la Cantina!
              </span>
            )}
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* 6 Booth Slots */}
        {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
          const target = activeTargets.find((t) => t.slotIndex === slotIdx)

          return (
            <div
              key={slotIdx}
              className="relative rounded-2xl bg-black/50 border border-amber-500/20 flex flex-col items-center justify-center overflow-hidden aspect-square sm:aspect-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-950/20 pointer-events-none" />

              {target && (
                <button
                  onClick={() => handleShoot(target)}
                  className={`w-full h-full p-2 flex flex-col items-center justify-center gap-1.5 touch-feedback cursor-crosshair animate-spring-scale ${
                    target.isHostile
                      ? 'bg-red-500/20 border-2 border-red-500 hover:bg-red-500/30'
                      : 'bg-emerald-500/20 border-2 border-emerald-500 hover:bg-emerald-500/30'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{target.emoji}</span>
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      target.isHostile
                        ? 'bg-red-500 text-white shadow-[0_0_10px_#EF4444]'
                        : 'bg-emerald-500 text-black shadow-[0_0_10px_#10B981]'
                    }`}
                  >
                    {target.name}
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
