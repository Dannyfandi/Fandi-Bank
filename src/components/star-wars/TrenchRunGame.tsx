'use client'

import { useState, useEffect, useRef } from 'react'
import { Rocket, Target, Shield, RotateCcw, Zap } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

export function TrenchRunGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'targeting' | 'won' | 'over'>('idle')
  const [lives, setLives] = useState(3)
  const [distanceDisplay, setDistanceDisplay] = useState(0)
  const [earnedCoins, setEarnedCoins] = useState(0)
  const [targetLock, setTargetLock] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    lane: 2, // 0 to 4
    targetLaneX: 2,
    playerX: 0.5,
    lives: 3,
    distance: 0,
    obstacles: [] as { id: number; lane: number; y: number; type: number }[],
    lastSpawn: 0,
    earned: 0,
    targetLock: 0,
    isRunning: false,
    isTargeting: false,
  })

  const animFrameRef = useRef<number | null>(null)

  const startGame = () => {
    stateRef.current = {
      lane: 2,
      targetLaneX: 2,
      playerX: 0.5,
      lives: 3,
      distance: 0,
      obstacles: [],
      lastSpawn: performance.now(),
      earned: 0,
      targetLock: 0,
      isRunning: true,
      isTargeting: false,
    }
    setLives(3)
    setDistanceDisplay(0)
    setEarnedCoins(0)
    setTargetLock(0)
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

  // Proton Torpedo Fire Action
  const fireTorpedo = () => {
    if (stateRef.current.targetLock >= 75) {
      starWarsAudio.playTorpedoExplosion()
      const bonus = 15
      stateRef.current.earned += bonus
      setEarnedCoins(stateRef.current.earned)
      onAddCoins(bonus)
      stateRef.current.isRunning = false
      setGameState('won')
      if (onComplete) onComplete()
    } else {
      starWarsAudio.playBlaster()
      stateRef.current.lives -= 1
      setLives(stateRef.current.lives)
      if (stateRef.current.lives <= 0) {
        stateRef.current.isRunning = false
        setGameState('over')
      }
    }
  }

  // High Performance Canvas Rendering & Physics Loop (60-120 FPS)
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'targeting') return

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

      // Update distance
      s.distance = Math.min(100, s.distance + delta * 14)
      if (Math.floor(s.distance) % 5 === 0) {
        setDistanceDisplay(Math.floor(s.distance))
      }

      // Check Targeting Climax Trigger
      if (s.distance >= 100 && !s.isTargeting) {
        s.isTargeting = true
        s.obstacles = []
        setGameState('targeting')
      }

      // Canvas Dimensions
      const width = canvas.width
      const height = canvas.height
      const laneWidth = width / 5

      // Clear & Draw 3D Perspective Trench Corridor
      ctx.fillStyle = '#030712'
      ctx.fillRect(0, 0, width, height)

      // Perspective Grid Lines
      ctx.strokeStyle = 'rgba(255, 30, 86, 0.18)'
      ctx.lineWidth = 1.5
      for (let i = 0; i <= 5; i++) {
        const x = i * laneWidth
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal Wireframe Speed Lines
      const offset = (time * 0.25) % 40
      ctx.strokeStyle = 'rgba(255, 30, 86, 0.12)'
      for (let y = offset; y < height; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Spawn Obstacles across 5 lanes if not targeting
      if (!s.isTargeting) {
        const spawnInterval = Math.max(380, 750 - s.distance * 3.5)
        if (time - s.lastSpawn > spawnInterval) {
          s.lastSpawn = time
          obsCounter++

          if (obsCounter % 4 === 0) {
            // Laser Barrier Gate: 3 lanes blocked, 2 safe adjacent lanes
            const safe = Math.floor(Math.random() * 4)
            for (let l = 0; l < 5; l++) {
              if (l !== safe && l !== safe + 1) {
                s.obstacles.push({ id: Math.random(), lane: l, y: -20, type: 2 })
              }
            }
          } else {
            // 1-2 Individual Turrets / TIEs
            const l1 = Math.floor(Math.random() * 5)
            s.obstacles.push({
              id: Math.random(),
              lane: l1,
              y: -20,
              type: Math.random() > 0.5 ? 0 : 1,
            })
          }
        }

        // Update & Render Obstacles
        const obsSpeed = (height * 0.55) + s.distance * 1.8
        const playerY = height * 0.82
        const playerTargetX = (s.lane + 0.5) * laneWidth

        // Smooth ship lerp
        s.playerX += (playerTargetX - s.playerX) * 0.25

        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i]
          obs.y += obsSpeed * delta

          const obsX = (obs.lane + 0.5) * laneWidth
          const obsRadius = 16

          // Draw Obstacle
          if (obs.type === 0) {
            // Imperial Turret
            ctx.fillStyle = '#EF4444'
            ctx.beginPath()
            ctx.arc(obsX, obs.y, obsRadius, 0, Math.PI * 2)
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
            ctx.fillRect(obsX - laneWidth * 0.45, obs.y - 6, laneWidth * 0.9, 12)
            ctx.strokeStyle = '#FFFFFF'
            ctx.strokeRect(obsX - laneWidth * 0.45, obs.y - 6, laneWidth * 0.9, 12)
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
              return
            }
          } else if (obs.y > height + 30) {
            s.obstacles.splice(i, 1)
            // Coin bonus
            if (s.earned < 20 && Math.random() < 0.25) {
              s.earned += 1
              setEarnedCoins(s.earned)
              onAddCoins(1)
            }
          }
        }

        // Draw Player X-Wing Ship
        ctx.save()
        ctx.translate(s.playerX, playerY)
        // Wings
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
        // Thrusters Glow
        ctx.fillStyle = '#00E5FF'
        ctx.beginPath()
        ctx.arc(-8, 18, 4, 0, Math.PI * 2)
        ctx.arc(8, 18, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else {
        // Targeting Computer Mode
        s.targetLock = Math.min(100, s.targetLock + delta * 28)
        setTargetLock(Math.floor(s.targetLock))

        // Draw Targeting Computer Reticle on Canvas
        const cx = width / 2
        const cy = height / 2
        ctx.strokeStyle = s.targetLock >= 75 ? '#00FF66' : '#00E5FF'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(cx, cy, 45, 0, Math.PI * 2)
        ctx.stroke()

        // Rotating Crosshairs
        ctx.beginPath()
        ctx.moveTo(cx - 60, cy)
        ctx.lineTo(cx + 60, cy)
        ctx.moveTo(cx, cy - 60)
        ctx.lineTo(cx, cy + 60)
        ctx.stroke()
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [gameState, onAddCoins, onComplete])

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-red-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-red-300 text-shadow-sm">
              Death Star Trench Run (Canvas 60fps)
            </h3>
            <p className="text-[10px] text-red-400/70 uppercase tracking-widest font-semibold">
              5 carriles · Renderizado por hardware sin caídas de frames
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
            🎯 {distanceDisplay}%
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950 border border-red-500/30 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={380}
          className="w-full h-full object-cover block"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <span className="text-5xl block animate-pulse">🚀</span>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Asalto a la Estrella de la Muerte
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Usa los 5 carriles para esquivar las defensas imperiales. Al 100%, dispara los
              torpedos de protones.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-red-500/30 touch-feedback"
            >
              Iniciar Carrera (5 Carriles)
            </button>
          </div>
        )}

        {/* Targeting Computer Overlay */}
        {gameState === 'targeting' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale">
            <div className="p-3 bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl animate-pulse shadow-[0_0_25px_#00FF66]">
              <Target className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-black text-emerald-300 mt-1 uppercase">
                {targetLock >= 75 ? '🎯 ¡DISPARA AHORA!' : `Fijando blanco: ${targetLock}%`}
              </p>
            </div>
            <button
              onClick={fireTorpedo}
              disabled={targetLock < 30}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all touch-feedback shadow-lg ${
                targetLock >= 75
                  ? 'bg-emerald-400 text-black shadow-emerald-400/50 animate-bounce'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              🚀 Disparar Torpedos (+15 Coins)
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale">
            <span className="text-5xl block animate-bounce">💥</span>
            <h4 className="text-xl font-black text-emerald-400">
              ¡Estrella de la Muerte Destruida!
            </h4>
            <p className="text-xs text-zinc-300">
              Monedas Ganadas: <strong className="text-emerald-400">+{earnedCoins} Fandi Coins</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Repetir Misión
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-lg sm:text-xl font-black text-red-400">
              Nave Destruida en la Trinchera
            </h4>
            <p className="text-xs text-zinc-300">
              Distancia: <strong className="text-amber-400">{distanceDisplay}%</strong> · Monedas:{' '}
              <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
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
