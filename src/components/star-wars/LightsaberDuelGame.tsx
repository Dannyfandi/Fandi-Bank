'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Zap, Heart, ShieldAlert, Award, RotateCcw } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface Target {
  id: number
  x: number
  y: number
  type: 'sith' | 'jedi'
  expiresAt: number
  color: string
}

export function LightsaberDuelGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [targets, setTargets] = useState<Target[]>([])
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([])
  const [gameOver, setGameOver] = useState(false)

  const targetIdRef = useRef(0)
  const sparkIdRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const earnedCoinsRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setLives(3)
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setTargets([])
    setGameOver(false)
    earnedCoinsRef.current = 0
    starWarsAudio.playLightsaberIgnite()
  }

  // 60-Second hard game timer
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
  }, [isPlaying, gameOver])

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    setTargets([])
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (onComplete) onComplete()
  }, [onComplete])

  // Spawning logic with dynamic acceleration
  useEffect(() => {
    if (!isPlaying || gameOver) return

    // Interval decreases from 900ms down to 180ms as score increases
    const currentInterval = Math.max(180, 900 - score * 20)

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      // Lifetime scales from 800ms down to 550ms
      const lifetime = Math.max(550, 850 - score * 8)

      const colors = ['#FF1E56', '#00E5FF', '#00FF66', '#9900FF']
      const chosenColor = colors[Math.floor(Math.random() * colors.length)]

      const newTarget: Target = {
        id: targetIdRef.current++,
        x: Math.floor(Math.random() * 75) + 10,
        y: Math.floor(Math.random() * 70) + 12,
        type: Math.random() > 0.3 ? 'sith' : 'jedi',
        expiresAt: now + lifetime,
        color: chosenColor,
      }

      setTargets((prev) => {
        // Hard limit of 10 concurrent active targets
        const filtered = prev.filter((t) => t.expiresAt > now)
        if (filtered.length < 10) {
          return [...filtered, newTarget]
        }
        return filtered
      })
    }, currentInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, score, gameOver])

  // Check expired targets (misses)
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const cleaner = setInterval(() => {
      const now = Date.now()
      setTargets((prev) => {
        const expired = prev.filter((t) => t.expiresAt <= now)
        if (expired.length > 0) {
          // Missed targets
          setCombo(0)
          setLives((l) => {
            const nextL = l - expired.length
            if (nextL <= 0) {
              endGame()
              return 0
            }
            return nextL
          })
        }
        return prev.filter((t) => t.expiresAt > now)
      })
    }, 100)

    return () => clearInterval(cleaner)
  }, [isPlaying, gameOver, endGame])

  // Parry Target Click Handler
  const handleParry = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation()
    starWarsAudio.playLightsaberClash()

    // Add Spark effect
    const rect = e.currentTarget.getBoundingClientRect()
    const sparkId = sparkIdRef.current++
    setSparks((prev) => [
      ...prev,
      { id: sparkId, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ])
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== sparkId))
    }, 400)

    // Remove hit target
    setTargets((prev) => prev.filter((t) => t.id !== target.id))

    const newScore = score + 1
    const newCombo = combo + 1
    setScore(newScore)
    setCombo(newCombo)

    // Award +2 coins (capped around ~40 coins per game session)
    if (earnedCoinsRef.current < 40) {
      earnedCoinsRef.current += 2
      onAddCoins(2)
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-cyan-300 text-shadow-sm">
              Lightsaber Duel (Duelo de Sables)
            </h3>
            <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-semibold">
              Parry flashing sabers within 0.6s
            </p>
          </div>
        </div>

        {/* Lives & Time */}
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

          <div className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-black text-cyan-300">
            ⏳ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Main Interactive Duel Arena Canvas */}
      <div
        className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950/80 border border-cyan-500/20 overflow-hidden shadow-inner flex items-center justify-center"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.08) 0%, transparent 70%)',
        }}
      >
        {!isPlaying && !gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-bounce">⚔️</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Listo para el Duelo Jedi?
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Toca los sables de luz antes de que desaparezcan. Cada parada exitosa suma
              monedas galácticas.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-cyan-500/30 touch-feedback"
            >
              Comenzar Duelo
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <Award className="w-12 h-12 text-yellow-400 mx-auto" />
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Duelo Finalizado!
            </h4>
            <p className="text-xs text-zinc-300">
              Paradas: <strong className="text-cyan-400">{score}</strong> · Monedas
              Ganadas: <strong className="text-emerald-400">+{earnedCoinsRef.current}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Jugar de Nuevo
            </button>
          </div>
        )}

        {/* Active Flashing Sabers */}
        {isPlaying &&
          targets.map((target) => (
            <button
              key={target.id}
              onClick={(e) => handleParry(target, e)}
              className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform active:scale-90 animate-spring-scale"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Outer pulsing blade aura */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
                style={{ backgroundColor: target.color }}
              />
              {/* Blade Core */}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: target.color,
                  boxShadow: `0 0 20px ${target.color}`,
                }}
              >
                <Zap className="w-6 h-6 text-white drop-shadow" />
              </div>
            </button>
          ))}

        {/* Spark Clash Particles */}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute pointer-events-none text-xl animate-ping font-black text-yellow-300"
            style={{ left: spark.x, top: spark.y }}
          >
            ⚡
          </div>
        ))}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-zinc-400 font-bold">
          Paradas: <strong className="text-cyan-400">{score}</strong>
        </span>
        <span className="text-zinc-400 font-bold">
          Combo: <strong className="text-amber-400">{combo}x</strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoinsRef.current} Coins
        </span>
      </div>
    </div>
  )
}
