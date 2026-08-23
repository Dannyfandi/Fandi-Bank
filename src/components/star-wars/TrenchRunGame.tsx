'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Rocket, Target, Shield, RotateCcw, Zap } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface Obstacle {
  id: number
  lane: number // 0, 1, 2, 3, 4 (5 lanes)
  y: number // 0% to 100%
  type: 'turret' | 'tie' | 'barrier'
}

export function TrenchRunGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerLane, setPlayerLane] = useState(2) // 5 lanes: 0, 1, 2, 3, 4 (starts center)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [distance, setDistance] = useState(0) // 0 to 100%
  const [lives, setLives] = useState(3)
  const [isPortTargeting, setIsPortTargeting] = useState(false)
  const [targetLock, setTargetLock] = useState(0) // 0 to 100%
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState(0)
  const [evadedCount, setEvadedCount] = useState(0)

  const obsIdRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const lastSpawnRef = useRef(0)
  const earnedRef = useRef(0)
  const evadedRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setPlayerLane(2)
    setObstacles([])
    setDistance(0)
    setLives(3)
    setIsPortTargeting(false)
    setTargetLock(0)
    setGameWon(false)
    setGameOver(false)
    setEarnedCoins(0)
    setEvadedCount(0)
    earnedRef.current = 0
    evadedRef.current = 0
    lastSpawnRef.current = performance.now()
    starWarsAudio.playBlaster()
  }

  const endGame = useCallback(
    (won = false) => {
      setIsPlaying(false)
      setGameOver(!won)
      setGameWon(won)
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (won && onComplete) onComplete()
    },
    [onComplete]
  )

  const moveLeft = () => {
    if (playerLane > 0) {
      setPlayerLane((l) => l - 1)
      starWarsAudio.playBlaster()
    }
  }

  const moveRight = () => {
    if (playerLane < 4) {
      setPlayerLane((l) => l + 1)
      starWarsAudio.playBlaster()
    }
  }

  // Climax targeting lock-on
  useEffect(() => {
    if (!isPlaying || !isPortTargeting || gameWon || gameOver) return

    const lockInterval = setInterval(() => {
      setTargetLock((prev) => {
        const next = prev + 6
        if (next >= 85) {
          starWarsAudio.playKyberChime(880)
        }
        return next > 100 ? 100 : next
      })
    }, 100)

    return () => clearInterval(lockInterval)
  }, [isPlaying, isPortTargeting, gameWon, gameOver])

  const fireTorpedo = () => {
    if (targetLock >= 80) {
      starWarsAudio.playTorpedoExplosion()
      const bonus = 15
      earnedRef.current += bonus
      setEarnedCoins(earnedRef.current)
      onAddCoins(bonus)
      endGame(true)
    } else {
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

  // Animation Loop with 5 lanes and obstacles
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon) return

    let prevTime = performance.now()

    const loop = (time: number) => {
      const delta = (time - prevTime) / 1000
      prevTime = time

      // Progress distance from 0% to 100%
      setDistance((d) => {
        const next = d + delta * 12
        if (next >= 100 && !isPortTargeting) {
          setIsPortTargeting(true)
          setObstacles([])
        }
        return Math.min(100, next)
      })

      // Spawn obstacles if not targeting
      if (!isPortTargeting) {
        // Spawn frequency accelerates as distance increases (600ms down to 350ms)
        const spawnDelay = Math.max(350, 650 - distance * 3)
        if (time - lastSpawnRef.current > spawnDelay) {
          lastSpawnRef.current = time

          const typeRand = Math.random()
          if (typeRand > 0.6) {
            // Laser Barrier Gate: Blocks 3 of 5 lanes, leaving 2 safe lanes
            const safeLane1 = Math.floor(Math.random() * 5)
            const safeLane2 = (safeLane1 + 2) % 5
            for (let l = 0; l < 5; l++) {
              if (l !== safeLane1 && l !== safeLane2) {
                setObstacles((prev) => [
                  ...prev,
                  { id: obsIdRef.current++, lane: l, y: -5, type: 'barrier' },
                ])
              }
            }
          } else {
            // 1-2 Individual Turrets / TIE fighters
            const lane1 = Math.floor(Math.random() * 5)
            const lane2 = Math.random() > 0.5 ? (lane1 + 2) % 5 : -1

            setObstacles((prev) => {
              const items: Obstacle[] = [
                {
                  id: obsIdRef.current++,
                  lane: lane1,
                  y: -5,
                  type: Math.random() > 0.5 ? 'turret' : 'tie',
                },
              ]
              if (lane2 !== -1) {
                items.push({
                  id: obsIdRef.current++,
                  lane: lane2,
                  y: -5,
                  type: 'turret',
                })
              }
              return [...prev, ...items]
            })
          }
        }

        // Update obstacle positions
        setObstacles((prev) => {
          const speed = 75 + distance * 0.3
          const updated = prev
            .map((obs) => ({ ...obs, y: obs.y + speed * delta }))
            .filter((obs) => obs.y <= 105)

          // Check collisions with player (player at y ~82%)
          for (const obs of updated) {
            if (obs.y >= 74 && obs.y <= 90 && obs.lane === playerLane) {
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

          // Count successfully cleared obstacles
          const justPassed = prev.filter((o) => o.y > 90).length
          if (justPassed > 0) {
            evadedRef.current += justPassed
            setEvadedCount(evadedRef.current)
            if (evadedRef.current % 4 === 0 && earnedRef.current < 25) {
              earnedRef.current += 1
              setEarnedCoins(earnedRef.current)
              onAddCoins(1)
            }
          }

          return updated
        })
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying, gameOver, gameWon, isPortTargeting, playerLane, distance, endGame, onAddCoins])

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
              Death Star Trench Run (5 Carriles)
            </h3>
            <p className="text-[10px] text-red-400/70 uppercase tracking-widest font-semibold">
              Esquiva torretas y TIEs en 5 carriles hacia el conducto térmico
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

      {/* Main 5-Lane Trench Arena */}
      <div
        className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950/95 border border-red-500/30 overflow-hidden shadow-inner flex flex-col justify-between p-4"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 30, 86, 0.15) 0%, transparent 80%)',
        }}
      >
        {/* 5 Trench Lanes Division Lines */}
        <div className="absolute inset-0 grid grid-cols-5 divide-x divide-red-500/15 pointer-events-none">
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>

        {/* Perspective Trench Wall Lines */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500/30 via-red-500/60 to-red-500/30 shadow-[0_0_15px_#FF1E56]" />

        {!isPlaying && !gameOver && !gameWon && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-pulse">🚀</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Asalto a la Estrella de la Muerte
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Usa los 5 carriles para esquivar las torretas imperiales, cazas TIE y barreras
              láser. Al 100%, dispara los torpedos de protones.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-red-500/30 touch-feedback"
            >
              Iniciar Carrera en la Trinchera
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {gameWon && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-bounce">💥</span>
            <h4 className="text-xl font-black text-emerald-400">
              ¡Impacto Directo! ¡Estrella Destruida!
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

        {/* Defeat Screen */}
        {gameOver && (
          <div className="m-auto text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-lg sm:text-xl font-black text-red-400">
              Nave Derribada en la Trinchera
            </h4>
            <p className="text-xs text-zinc-300">
              Distancia: <strong className="text-amber-400">{Math.floor(distance)}%</strong> · Monedas:{' '}
              <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-600 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* Active Incoming Obstacles across 5 lanes */}
        {isPlaying &&
          !isPortTargeting &&
          obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute -translate-x-1/2 flex items-center justify-center pointer-events-none"
              style={{
                left: `${obs.lane * 20 + 10}%`,
                top: `${obs.y}%`,
              }}
            >
              {obs.type === 'turret' && (
                <div className="w-9 h-9 rounded-xl bg-red-600/80 border border-red-400 shadow-[0_0_15px_#FF1E56] flex items-center justify-center text-xs">
                  🔴
                </div>
              )}
              {obs.type === 'tie' && (
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-red-500 shadow-[0_0_15px_rgba(255,30,86,0.5)] flex items-center justify-center text-base">
                  👾
                </div>
              )}
              {obs.type === 'barrier' && (
                <div className="w-12 h-6 rounded-lg bg-red-500/70 border-2 border-red-300 shadow-[0_0_20px_#FF1E56] flex items-center justify-center text-[10px] font-black text-white">
                  ⚡⚡
                </div>
              )}
            </div>
          ))}

        {/* Climax Targeting Computer */}
        {isPlaying && isPortTargeting && (
          <div className="m-auto text-center space-y-4 z-10 animate-spring-scale">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center border-2 border-emerald-400 rounded-full animate-pulse shadow-[0_0_30px_#00FF66] bg-black/60">
              <Target className="w-20 h-20 text-emerald-400 animate-spin" />
              <div className="absolute font-black text-sm text-emerald-300">
                {targetLock}%
              </div>
            </div>
            <p className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              {targetLock >= 80 ? '🎯 OBJETIVO BLOQUEADO — ¡DISPARA AHORA!' : 'Alineando torpedo de protones...'}
            </p>
            <button
              onClick={fireTorpedo}
              disabled={targetLock < 40}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all touch-feedback ${
                targetLock >= 80
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-[0_0_35px_#00FF66] animate-bounce'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              🚀 Disparar Torpedos (+15 Coins)
            </button>
          </div>
        )}

        {/* Player X-Wing */}
        {isPlaying && (
          <div
            className="absolute bottom-6 -translate-x-1/2 flex items-center justify-center transition-all duration-100"
            style={{
              left: `${playerLane * 20 + 10}%`,
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/25 border-2 border-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_20px_#00E5FF] backdrop-blur-md">
              🚀
            </div>
          </div>
        )}

        {/* 5-Lane Touch Left/Right Controls */}
        {isPlaying && !isPortTargeting && (
          <div className="absolute inset-x-4 bottom-3 flex justify-between z-20 pointer-events-auto">
            <button
              onClick={moveLeft}
              className="w-24 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-black text-xl flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ◀
            </button>
            <button
              onClick={moveRight}
              className="w-24 h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-black text-xl flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
