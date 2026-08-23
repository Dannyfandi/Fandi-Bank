'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, Heart, RotateCcw, Compass } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface Asteroid {
  id: number
  x: number
  y: number
  size: number
  speed: number
  rotation: number
}

interface Crystal {
  id: number
  x: number
  y: number
}

export function FalconFlightGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [falconX, setFalconX] = useState(50) // percentage 10% to 90%
  const [falconY, setFalconY] = useState(80) // percentage
  const [lives, setLives] = useState(3)
  const [crystalsCollected, setCrystalsCollected] = useState(0)
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [crystals, setCrystals] = useState<Crystal[]>([])
  const [gameOver, setGameOver] = useState(false)

  const entityIdRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const arenaRef = useRef<HTMLDivElement>(null)
  const earnedCoinsRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setFalconX(50)
    setFalconY(80)
    setLives(3)
    setCrystalsCollected(0)
    setAsteroids([])
    setCrystals([])
    setGameOver(false)
    earnedCoinsRef.current = 0
    starWarsAudio.playKyberChime(440)
  }

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (onComplete) onComplete()
  }, [onComplete])

  // Touch / Drag handler for smooth mobile steering
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !arenaRef.current) return
    const rect = arenaRef.current.getBoundingClientRect()
    const xPct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.max(20, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100))
    setFalconX(xPct)
    setFalconY(yPct)
  }

  // Main game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return

    let prevTime = performance.now()
    let lastAsteroidSpawn = 0
    let lastCrystalSpawn = 0

    const loop = (time: number) => {
      const delta = (time - prevTime) / 1000
      prevTime = time

      // Spawn Asteroids every 600ms
      if (time - lastAsteroidSpawn > 600) {
        lastAsteroidSpawn = time
        const newAst: Asteroid = {
          id: entityIdRef.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: -10,
          size: Math.floor(Math.random() * 24) + 26,
          speed: Math.floor(Math.random() * 40) + 55,
          rotation: Math.floor(Math.random() * 360),
        }
        setAsteroids((prev) => [...prev, newAst])
      }

      // Spawn Kyber Crystals every 1200ms
      if (time - lastCrystalSpawn > 1200) {
        lastCrystalSpawn = time
        const newCry: Crystal = {
          id: entityIdRef.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: -10,
        }
        setCrystals((prev) => [...prev, newCry])
      }

      // Move Asteroids & Check collisions
      setAsteroids((prev) => {
        const updated = prev
          .map((a) => ({ ...a, y: a.y + a.speed * delta, rotation: a.rotation + 40 * delta }))
          .filter((a) => a.y <= 110)

        for (const ast of updated) {
          const dx = Math.abs(ast.x - falconX)
          const dy = Math.abs(ast.y - falconY)
          if (dx < 9 && dy < 9) {
            // Collision with asteroid!
            starWarsAudio.playLightsaberClash()
            setLives((l) => {
              const next = l - 1
              if (next <= 0) {
                endGame()
                return 0
              }
              return next
            })
            return prev.filter((a) => a.id !== ast.id)
          }
        }
        return updated
      })

      // Move Crystals & Check pickups
      setCrystals((prev) => {
        const updated = prev
          .map((c) => ({ ...c, y: c.y + 45 * delta }))
          .filter((c) => c.y <= 110)

        for (const cry of updated) {
          const dx = Math.abs(cry.x - falconX)
          const dy = Math.abs(cry.y - falconY)
          if (dx < 10 && dy < 10) {
            // Picked up crystal!
            starWarsAudio.playKyberChime(880)
            setCrystalsCollected((c) => c + 1)
            if (earnedCoinsRef.current < 35) {
              earnedCoinsRef.current += 1
              onAddCoins(1)
            }
            return prev.filter((c) => c.id !== cry.id)
          }
        }
        return updated
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying, gameOver, falconX, falconY, endGame, onAddCoins])

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-blue-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-blue-300 text-shadow-sm">
              Asteroid Field Navigation (Falcon Flight)
            </h3>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-semibold">
              Drag Millennium Falcon & collect Kyber crystals
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
                    ? 'text-blue-400 fill-blue-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-black text-blue-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-300" /> {crystalsCollected}
          </div>
        </div>
      </div>

      {/* Main Interactive Field View */}
      <div
        ref={arenaRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950 border border-blue-500/20 overflow-hidden shadow-inner flex items-center justify-center cursor-crosshair touch-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(0, 150, 255, 0.12) 0%, transparent 80%)',
        }}
      >
        {!isPlaying && !gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale pointer-events-auto">
            <span className="text-5xl block animate-pulse">🛸</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Campo de Asteroides de Hoth
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Desliza el Halcón Milenario para esquivar los asteroides y recolectar cristales
              Kyber azules.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-blue-500/30 touch-feedback"
            >
              Iniciar Vuelo
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale pointer-events-auto">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-blue-300">
              Impacto con Asteroide!
            </h4>
            <p className="text-xs text-zinc-300">
              Cristales Recolectados: <strong className="text-cyan-400">{crystalsCollected}</strong> · Monedas:{' '}
              <strong className="text-emerald-400">+{earnedCoinsRef.current}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* Asteroids */}
        {isPlaying &&
          asteroids.map((ast) => (
            <div
              key={ast.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              style={{
                left: `${ast.x}%`,
                top: `${ast.y}%`,
                width: `${ast.size}px`,
                height: `${ast.size}px`,
                transform: `translate(-50%, -50%) rotate(${ast.rotation}deg)`,
              }}
            >
              <span style={{ fontSize: `${ast.size * 0.8}px` }}>🪨</span>
            </div>
          ))}

        {/* Kyber Crystals */}
        {isPlaying &&
          crystals.map((cry) => (
            <div
              key={cry.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-bounce pointer-events-none"
              style={{
                left: `${cry.x}%`,
                top: `${cry.y}%`,
              }}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-400/40 border border-cyan-300 shadow-[0_0_15px_#00E5FF] flex items-center justify-center text-xs">
                💎
              </div>
            </div>
          ))}

        {/* Millennium Falcon */}
        {isPlaying && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center text-2xl shadow-[0_0_20px_#00E5FF] bg-blue-950/40 backdrop-blur-md pointer-events-none transition-all duration-75"
            style={{
              left: `${falconX}%`,
              top: `${falconY}%`,
            }}
          >
            🛸
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-zinc-400 font-bold">
          Cristales: <strong className="text-cyan-400">{crystalsCollected}</strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoinsRef.current} Fandi Coins
        </span>
      </div>
    </div>
  )
}
