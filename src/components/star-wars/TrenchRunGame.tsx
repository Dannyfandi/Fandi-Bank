'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Rocket, Target, Zap, Shield, RotateCcw } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface Obstacle {
  id: number
  lane: number // 0 = Left, 1 = Center, 2 = Right
  y: number // 0% to 100%
}

export function TrenchRunGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerLane, setPlayerLane] = useState(1) // 0: Left, 1: Center, 2: Right
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [distance, setDistance] = useState(0)
  const [lives, setLives] = useState(3)
  const [isPortTargeting, setIsPortTargeting] = useState(false)
  const [targetLock, setTargetLock] = useState(0) // 0 to 100%
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState(0)

  const obsIdRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastSpawnRef = useRef(Date.now())
  const earnedRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setPlayerLane(1)
    setObstacles([])
    setDistance(0)
    setLives(3)
    setIsPortTargeting(false)
    setTargetLock(0)
    setGameWon(false)
    setGameOver(false)
    setEarnedCoins(0)
    earnedRef.current = 0
    lastSpawnRef.current = Date.now()
    starWarsAudio.playBlaster()
  }

  const endGame = useCallback(
    (won = false) => {
      setIsPlaying(false)
      setGameOver(!won)
      setGameWon(won)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (won && onComplete) onComplete()
    },
    [onComplete]
  )

  // Move left or right
  const moveLeft = () => {
    if (playerLane > 0) {
      setPlayerLane((l) => l - 1)
      starWarsAudio.playBlaster()
    }
  }

  const moveRight = () => {
    if (playerLane < 2) {
      setPlayerLane((l) => l + 1)
      starWarsAudio.playBlaster()
    }
  }

  // Target lock-on pulse when approaching exhaust port
  useEffect(() => {
    if (!isPlaying || !isPortTargeting || gameWon || gameOver) return

    const lockInterval = setInterval(() => {
      setTargetLock((prev) => {
        const next = prev + 5
        if (next >= 100) {
          starWarsAudio.playKyberChime(880)
        }
        return next > 100 ? 100 : next
      })
    }, 100)

    return () => clearInterval(lockInterval)
  }, [isPlaying, isPortTargeting, gameWon, gameOver])

  // Fire Proton Torpedoes
  const fireTorpedo = () => {
    if (targetLock >= 80) {
      starWarsAudio.playTorpedoExplosion()
      const bonus = 20
      earnedRef.current += bonus
      setEarnedCoins(earnedRef.current)
      onAddCoins(bonus)
      endGame(true)
    } else {
      // Missed shot
      starWarsAudio.playBlaster()
      setLives((l) => {
        if (l <= 1) {
          endGame(false)
          return 0
        }
        return l - 1
      })
    }
  }

  // Game animation loop
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return

    let prevTime = performance.now()

    const loop = (time: number) => {
      const delta = (time - prevTime) / 1000
      prevTime = time

      // Progress distance
      setDistance((d) => {
        const nextD = d + delta * 20
        if (nextD >= 100 && !isPortTargeting) {
          setIsPortTargeting(true)
          setObstacles([])
        }
        return nextD
      })

      // Spawn obstacles if not targeting exhaust port
      if (!isPortTargeting) {
        if (time - lastSpawnRef.current > 750) {
          lastSpawnRef.current = time
          const randomLane = Math.floor(Math.random() * 3)
          setObstacles((prev) => [
            ...prev,
            { id: obsIdRef.current++, lane: randomLane, y: 0 },
          ])
        }

        // Update obstacle positions
        setObstacles((prev) => {
          const updated = prev
            .map((obs) => ({ ...obs, y: obs.y + delta * 85 }))
            .filter((obs) => obs.y <= 100)

          // Check collisions with player (player is at y = 85%)
          for (const obs of updated) {
            if (obs.y >= 75 && obs.y <= 92 && obs.lane === playerLane) {
              // Collision!
              starWarsAudio.playLightsaberClash()
              setLives((l) => {
                const nextL = l - 1
                if (nextL <= 0) {
                  endGame(false)
                  return 0
                }
                return nextL
              })
              return prev.filter((o) => o.id !== obs.id)
            }
          }

          // Economy reward every 5 cleared obstacles
          return updated
        })
      }

      animationFrameRef.current = requestAnimationFrame(loop)
    }

    animationFrameRef.current = requestAnimationFrame(loop)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPlaying, gameOver, gameWon, isPortTargeting, playerLane, endGame])

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-red-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-red-300 text-shadow-sm">
              Death Star Trench Run
            </h3>
            <p className="text-[10px] text-red-400/70 uppercase tracking-widest font-semibold">
              Dodge laser turrets & strike exhaust port
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Shield
                key={heart}
                className={`w-4 h-4 transition-colors ${
                  heart <= lives
                    ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-black text-red-300">
            🎯 {Math.min(100, Math.floor(distance))}%
          </div>
        </div>
      </div>

      {/* Main Trench Corridor View */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950/90 border border-red-500/20 overflow-hidden shadow-inner flex flex-col justify-between p-4">
        {/* 3 Trench Track Lanes */}
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-red-500/10 pointer-events-none">
          <div />
          <div />
          <div />
        </div>

        {!isPlaying && !gameOver && !gameWon && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block">🚀</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Ataque a la Estrella de la Muerte
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Esquiva las torretas del cañón imperial y dispara los torpedos de protones
              en el conducto térmico.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-red-500/30 touch-feedback"
            >
              Iniciar Vuelo
            </button>
          </div>
        )}

        {/* Game Won Strike Scene */}
        {gameWon && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-bounce">💥</span>
            <h4 className="text-xl font-black text-emerald-400">
              ¡Impacto Directo! Estrella Destruida!
            </h4>
            <p className="text-xs text-zinc-300">
              Recompensa de la Alianza: <strong className="text-emerald-400">+{earnedCoins} Fandi Coins</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Repetir Misión
            </button>
          </div>
        )}

        {/* Game Over Scene */}
        {gameOver && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-lg sm:text-xl font-black text-red-400">
              X-Wing Derribado
            </h4>
            <p className="text-xs text-zinc-300">
              Monedas Ganadas: <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-600 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* Active Laser Turrets / Obstacles */}
        {isPlaying &&
          !isPortTargeting &&
          obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute w-12 h-8 -translate-x-1/2 flex items-center justify-center transition-all duration-75"
              style={{
                left: `${obs.lane * 33.33 + 16.66}%`,
                top: `${obs.y}%`,
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 border border-red-400 shadow-[0_0_15px_#FF1E56] flex items-center justify-center text-xs">
                🔴
              </div>
            </div>
          ))}

        {/* Climax Targeting Computer Scene */}
        {isPlaying && isPortTargeting && (
          <div className="m-auto text-center space-y-4 z-10 animate-spring-scale">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center border-2 border-emerald-400 rounded-full animate-pulse shadow-[0_0_25px_#00FF66]">
              <Target className="w-16 h-16 text-emerald-400 animate-spin" />
              <div className="absolute font-black text-xs text-emerald-300">
                {targetLock}%
              </div>
            </div>
            <p className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              {targetLock >= 80 ? '🎯 OBJETIVO FIJADO — DISPARA!' : 'Fijando blanco térmico...'}
            </p>
            <button
              onClick={fireTorpedo}
              disabled={targetLock < 50}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all touch-feedback ${
                targetLock >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_30px_#00FF66] animate-bounce'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              🚀 Disparar Torpedos (+20 Coins)
            </button>
          </div>
        )}

        {/* Player X-Wing */}
        {isPlaying && (
          <div
            className="absolute bottom-6 w-14 h-14 -translate-x-1/2 flex items-center justify-center transition-all duration-150"
            style={{
              left: `${playerLane * 33.33 + 16.66}%`,
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_20px_#00E5FF]">
              🚀
            </div>
          </div>
        )}

        {/* Mobile Left / Right Touch Controls */}
        {isPlaying && !isPortTargeting && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between z-20 pointer-events-auto">
            <button
              onClick={moveLeft}
              className="w-20 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-black text-lg flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ◀
            </button>
            <button
              onClick={moveRight}
              className="w-20 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-black text-lg flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
