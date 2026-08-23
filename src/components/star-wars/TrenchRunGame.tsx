'use client'

import { useState, useEffect, useRef } from 'react'
import { Rocket, Shield, RotateCcw, Award, Zap, Flame } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

export function TrenchRunGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [lives, setLives] = useState(3)
  const [distanceMeters, setDistanceMeters] = useState(0)
  const [sectorLevel, setSectorLevel] = useState(1)
  const [earnedCoins, setEarnedCoins] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    lane: 2, // 0 to 4
    playerX: 200,
    lives: 3,
    distance: 0,
    sector: 1,
    obstacles: [] as { id: number; lane: number; y: number; type: number; speed: number }[],
    lastSpawn: 0,
    lastCoinAward: 0,
    earned: 0,
    isRunning: false,
  })

  const animFrameRef = useRef<number | null>(null)

  const startGame = () => {
    stateRef.current = {
      lane: 2,
      playerX: 200,
      lives: 3,
      distance: 0,
      sector: 1,
      obstacles: [],
      lastSpawn: performance.now(),
      lastCoinAward: 0,
      earned: 0,
      isRunning: true,
    }
    setLives(3)
    setDistanceMeters(0)
    setSectorLevel(1)
    setEarnedCoins(0)
    setGameState('playing')
    starWarsAudio.playBlaster()
  }

  const moveLeft = () => {
    if (stateRef.current.lane > 0) {
      stateRef.current.lane -= 1
      starWarsAudio.playBlaster()
    }
  }

  const moveRight = () => {
    if (stateRef.current.lane < 4) {
      stateRef.current.lane += 1
      starWarsAudio.playBlaster()
    }
  }

  // Touch Swipe support
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff > 35) moveRight()
    else if (diff < -35) moveLeft()
    touchStartX.current = null
  }

  // Pure Canvas Endless Physics Loop (60–120 FPS)
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let prevTime = performance.now()
    let obsCounter = 0

    const render = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1)
      prevTime = time

      const s = stateRef.current
      if (!s.isRunning) return

      // Endless distance increment with speed scaling
      const speedMultiplier = 1 + (s.distance / 1200) * 0.4
      s.distance += delta * 65 * speedMultiplier
      const currentMeters = Math.floor(s.distance)
      const currentSector = Math.floor(s.distance / 500) + 1

      if (currentMeters % 10 === 0) {
        setDistanceMeters(currentMeters)
      }
      if (currentSector !== s.sector) {
        s.sector = currentSector
        setSectorLevel(currentSector)
      }

      // Coin milestone every 500 meters
      if (Math.floor(s.distance / 500) > s.lastCoinAward && s.earned < 50) {
        s.lastCoinAward = Math.floor(s.distance / 500)
        s.earned += 2
        setEarnedCoins(s.earned)
        onAddCoins(2)
        starWarsAudio.playKyberChime(750)
      }

      // Dimensions
      const width = canvas.width
      const height = canvas.height
      const laneWidth = width / 5

      // Background Trench corridor
      ctx.fillStyle = '#030712'
      ctx.fillRect(0, 0, width, height)

      // Perspective Grid Lines
      ctx.strokeStyle = 'rgba(255, 30, 86, 0.2)'
      ctx.lineWidth = 1.5
      for (let i = 0; i <= 5; i++) {
        const x = i * laneWidth
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal speed lines
      const lineOffset = (time * (0.2 + speedMultiplier * 0.15)) % 40
      ctx.strokeStyle = 'rgba(255, 30, 86, 0.15)'
      for (let y = lineOffset; y < height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Dynamic Endless Obstacle Spawning
      const spawnInterval = Math.max(280, 850 - (s.sector * 35))
      if (time - s.lastSpawn > spawnInterval) {
        s.lastSpawn = time
        obsCounter++

        if (obsCounter % 3 === 0) {
          // Laser Gate: 3 lanes blocked, 2 safe lanes
          const safe = Math.floor(Math.random() * 4)
          for (let l = 0; l < 5; l++) {
            if (l !== safe && l !== safe + 1) {
              s.obstacles.push({
                id: Math.random(),
                lane: l,
                y: -25,
                type: 2,
                speed: 190 * speedMultiplier,
              })
            }
          }
        } else {
          // Individual Turrets & TIEs
          const l1 = Math.floor(Math.random() * 5)
          s.obstacles.push({
            id: Math.random(),
            lane: l1,
            y: -25,
            type: Math.random() > 0.4 ? 0 : 1,
            speed: (210 + Math.random() * 40) * speedMultiplier,
          })
        }
      }

      // Update & Render Obstacles
      const playerY = height * 0.82
      const targetPlayerX = (s.lane + 0.5) * laneWidth
      s.playerX += (targetPlayerX - s.playerX) * 0.3

      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i]
        obs.y += obs.speed * delta
        const obsX = (obs.lane + 0.5) * laneWidth

        // Draw Obstacle
        if (obs.type === 0) {
          // Imperial Turret
          ctx.fillStyle = '#EF4444'
          ctx.beginPath()
          ctx.arc(obsX, obs.y, 16, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#FFFFFF'
          ctx.lineWidth = 2
          ctx.stroke()
        } else if (obs.type === 1) {
          // TIE Fighter
          ctx.fillStyle = '#1E293B'
          ctx.fillRect(obsX - 16, obs.y - 12, 32, 24)
          ctx.strokeStyle = '#FF1E56'
          ctx.lineWidth = 2
          ctx.strokeRect(obsX - 16, obs.y - 12, 32, 24)
          ctx.fillStyle = '#FF1E56'
          ctx.beginPath()
          ctx.arc(obsX, obs.y, 6, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Laser Barrier
          ctx.fillStyle = '#FF1E56'
          ctx.fillRect(obsX - laneWidth * 0.46, obs.y - 6, laneWidth * 0.92, 12)
          ctx.strokeStyle = '#FFFFFF'
          ctx.strokeRect(obsX - laneWidth * 0.46, obs.y - 6, laneWidth * 0.92, 12)
        }

        // Collision Check
        if (Math.abs(obs.y - playerY) < 22 && Math.abs(obsX - s.playerX) < laneWidth * 0.45) {
          starWarsAudio.playLightsaberClash()
          s.lives -= 1
          setLives(s.lives)
          s.obstacles.splice(i, 1)

          if (s.lives <= 0) {
            s.isRunning = false
            setGameState('over')
            setHighScore((prev) => Math.max(prev, Math.floor(s.distance)))
            if (onComplete) onComplete()
            return
          }
        } else if (obs.y > height + 35) {
          s.obstacles.splice(i, 1)
        }
      }

      // Draw Player X-Wing Ship
      ctx.save()
      ctx.translate(s.playerX, playerY)
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)'
      ctx.strokeStyle = '#00E5FF'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(0, -22)
      ctx.lineTo(20, 16)
      ctx.lineTo(-20, 16)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      // Thrusters
      ctx.fillStyle = '#00E5FF'
      ctx.beginPath()
      ctx.arc(-8, 18, 4, 0, Math.PI * 2)
      ctx.arc(8, 18, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [gameState, onAddCoins, onComplete])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-red-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-red-300 text-shadow-sm flex items-center gap-2">
              Endless Death Star Trench Run
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 uppercase font-mono">
                Sector {sectorLevel}
              </span>
            </h3>
            <p className="text-[10px] text-red-400/70 uppercase tracking-widest font-semibold">
              Supervivencia infinita · 5 carriles · Desliza o toca botones
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
            🚀 {distanceMeters} m
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950 border border-red-500/30 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={380}
          className="w-full h-full object-cover block touch-none"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <span className="text-5xl block animate-pulse">🚀</span>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Supervivencia en la Trinchera
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Sobrevive el mayor tiempo posible por los 5 carriles. La velocidad y las defensas
              aumentan sin límite.
            </p>
            {highScore > 0 && (
              <p className="text-xs font-black text-amber-300">
                🏆 Récord Actual: {highScore} metros
              </p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-red-500/30 touch-feedback"
            >
              Iniciar Carrera Infinita
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-red-400">
              Misión Concluida en Sector {sectorLevel}
            </h4>
            <p className="text-xs text-zinc-300">
              Distancia Final: <strong className="text-amber-400">{distanceMeters} metros</strong> ·
              Monedas Ganadas: <strong className="text-emerald-400">+{earnedCoins} Fandi Coins</strong>
            </p>
            {distanceMeters >= highScore && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                <Award className="w-3.5 h-3.5" /> ¡Nuevo Récord de Distancia!
              </span>
            )}
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-500 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* Left / Right 5-Lane Touch Controls */}
        {gameState === 'playing' && (
          <div className="absolute inset-x-4 bottom-3 flex justify-between z-10 pointer-events-auto">
            <button
              onClick={moveLeft}
              className="w-24 h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white font-black text-xl flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ◀
            </button>
            <button
              onClick={moveRight}
              className="w-24 h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white font-black text-xl flex items-center justify-center touch-feedback backdrop-blur-md"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
