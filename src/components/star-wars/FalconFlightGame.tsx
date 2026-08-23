'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, Heart, RotateCcw, Compass } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

interface Asteroid {
  id: number
  x: number // percentage 5% to 95%
  y: number // percentage -10% to 110%
  size: number
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
  const [falconX, setFalconX] = useState(50) // percentage
  const [falconY, setFalconY] = useState(80) // percentage
  const [lives, setLives] = useState(3)
  const [crystalsCollected, setCrystalsCollected] = useState(0)
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [crystals, setCrystals] = useState<Crystal[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [survivalTime, setSurvivalTime] = useState(0)

  const entityIdRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const arenaRef = useRef<HTMLDivElement>(null)
  const earnedCoinsRef = useRef(0)
  const falconPosRef = useRef({ x: 50, y: 80 })
  const lastSpawnTimeRef = useRef(0)
  const lastCrystalTimeRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setFalconX(50)
    setFalconY(80)
    falconPosRef.current = { x: 50, y: 80 }
    setLives(3)
    setCrystalsCollected(0)
    setSurvivalTime(0)
    setAsteroids([])
    setCrystals([])
    setGameOver(false)
    earnedCoinsRef.current = 0
    lastSpawnTimeRef.current = performance.now()
    lastCrystalTimeRef.current = performance.now()
    starWarsAudio.playKyberChime(440)
  }

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (onComplete) onComplete()
  }, [onComplete])

  // Direct Pointer/Touch Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || !arenaRef.current) return
    const rect = arenaRef.current.getBoundingClientRect()
    const xPct = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100))
    falconPosRef.current = { x: xPct, y: yPct }
    setFalconX(xPct)
    setFalconY(yPct)
  }

  // Optimized Game Loop with Guaranteed Open Pathways & Progressive Difficulty
  useEffect(() => {
    if (!isPlaying || gameOver) return

    let prevTime = performance.now()
    let startTime = performance.now()

    const loop = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1)
      prevTime = time

      const elapsed = (time - startTime) / 1000
      setSurvivalTime(Math.floor(elapsed))

      // Progressive difficulty scaling (speed increases from 42 to 85)
      const currentSpeed = Math.min(85, 42 + elapsed * 0.8)
      // Spawn interval decreases from 1100ms down to 600ms
      const spawnInterval = Math.max(600, 1100 - elapsed * 12)

      // Spawn Wave of Asteroids with GUARANTEED OPEN PASSAGE
      if (time - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = time

        // Divide horizontal space into 5 sectors: 0, 1, 2, 3, 4
        // Pick a safe gap (2 consecutive sectors with NO rocks)
        const safeSector = Math.floor(Math.random() * 4) // e.g. safeSector and safeSector+1 are clear
        const newWave: Asteroid[] = []

        for (let sector = 0; sector < 5; sector++) {
          if (sector !== safeSector && sector !== safeSector + 1) {
            // Spawn 1 rock in this sector
            const sectorX = sector * 20 + 5 + Math.random() * 10
            newWave.push({
              id: entityIdRef.current++,
              x: sectorX,
              y: -10,
              size: Math.floor(Math.random() * 16) + 24, // 24px - 40px
              rotation: Math.floor(Math.random() * 360),
            })
          }
        }

        setAsteroids((prev) => [...prev, ...newWave])
      }

      // Spawn Kyber Crystals in safe areas every 1400ms
      if (time - lastCrystalTimeRef.current > 1400) {
        lastCrystalTimeRef.current = time
        const newCrystal: Crystal = {
          id: entityIdRef.current++,
          x: Math.floor(Math.random() * 75) + 12,
          y: -10,
        }
        setCrystals((prev) => [...prev, newCrystal])
      }

      // Move Asteroids & Check collisions with Falcon
      const curFx = falconPosRef.current.x
      const curFy = falconPosRef.current.y

      setAsteroids((prev) => {
        const updated = prev
          .map((a) => ({
            ...a,
            y: a.y + currentSpeed * delta,
            rotation: a.rotation + 45 * delta,
          }))
          .filter((a) => a.y <= 110)

        for (const ast of updated) {
          const dx = Math.abs(ast.x - curFx)
          const dy = Math.abs(ast.y - curFy)
          if (dx < 7.5 && dy < 7.5) {
            // Collision!
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

      // Move Crystals & Check Pickups
      setCrystals((prev) => {
        const updated = prev
          .map((c) => ({ ...c, y: c.y + 40 * delta }))
          .filter((c) => c.y <= 110)

        for (const cry of updated) {
          const dx = Math.abs(cry.x - curFx)
          const dy = Math.abs(cry.y - curFy)
          if (dx < 8.5 && dy < 8.5) {
            starWarsAudio.playKyberChime(880)
            setCrystalsCollected((c) => {
              const next = c + 1
              // Award +1 coin per 2 crystals (capped at 25 coins)
              if (next % 2 === 0 && earnedCoinsRef.current < 25) {
                earnedCoinsRef.current += 1
                onAddCoins(1)
              }
              return next
            })
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
  }, [isPlaying, gameOver, endGame, onAddCoins])

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
              Falcon Flight: Campo de Asteroides
            </h3>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-semibold">
              Desliza suavemente · Dificultad progresiva con rutas abiertas
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
                    ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]'
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

      {/* Main Smooth Interactive Field Canvas */}
      <div
        ref={arenaRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950 border border-blue-500/30 overflow-hidden shadow-inner flex items-center justify-center cursor-crosshair touch-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(0, 229, 255, 0.12) 0%, transparent 80%)',
        }}
      >
        {/* Starfield Speed Lines */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {!isPlaying && !gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale pointer-events-auto">
            <span className="text-5xl block animate-pulse">🛸</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Vuelo del Halcón Milenario
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Toca o arrastra el Halcón Milenario. La velocidad aumentará gradualmente.
              Recolecta cristales Kyber azules sin chocar con los asteroides.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-blue-500/30 touch-feedback"
            >
              Iniciar Vuelo Hiperespacial
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale pointer-events-auto">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-blue-300">
              Impacto en el Cinturón de Asteroides
            </h4>
            <p className="text-xs text-zinc-300">
              Tiempo: <strong className="text-amber-400">{survivalTime}s</strong> · Cristales:{' '}
              <strong className="text-cyan-400">{crystalsCollected}</strong> · Monedas:{' '}
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

        {/* Dynamic Asteroids */}
        {isPlaying &&
          asteroids.map((ast) => (
            <div
              key={ast.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-transform"
              style={{
                left: `${ast.x}%`,
                top: `${ast.y}%`,
                width: `${ast.size}px`,
                height: `${ast.size}px`,
                transform: `translate(-50%, -50%) rotate(${ast.rotation}deg)`,
              }}
            >
              <span style={{ fontSize: `${ast.size * 0.85}px` }}>🪨</span>
            </div>
          ))}

        {/* Floating Kyber Crystals */}
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

        {/* Millennium Falcon Ship */}
        {isPlaying && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-cyan-400/60 flex items-center justify-center text-2xl shadow-[0_0_20px_#00E5FF] bg-blue-950/60 backdrop-blur-md pointer-events-none"
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
          Tiempo: <strong className="text-amber-400">{survivalTime}s</strong>
        </span>
        <span className="text-zinc-400 font-bold">
          Cristales: <strong className="text-cyan-400">{crystalsCollected}</strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoinsRef.current} Coins
        </span>
      </div>
    </div>
  )
}
