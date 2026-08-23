'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Heart, RotateCcw, Compass } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

export function FalconFlightGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [lives, setLives] = useState(3)
  const [crystalsCount, setCrystalsCount] = useState(0)
  const [survivalSecs, setSurvivalSecs] = useState(0)
  const [earnedCoins, setEarnedCoins] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)

  const stateRef = useRef({
    falconX: 200,
    falconY: 300,
    targetX: 200,
    targetY: 300,
    lives: 3,
    crystals: 0,
    survivalTime: 0,
    asteroids: [] as { x: number; y: number; size: number; rot: number; speed: number }[],
    crystalItems: [] as { x: number; y: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    lastSpawn: 0,
    lastCrystal: 0,
    earned: 0,
    isRunning: false,
  })

  const startGame = () => {
    stateRef.current = {
      falconX: 200,
      falconY: 300,
      targetX: 200,
      targetY: 300,
      lives: 3,
      crystals: 0,
      survivalTime: 0,
      asteroids: [],
      crystalItems: [],
      particles: [],
      lastSpawn: performance.now(),
      lastCrystal: performance.now(),
      earned: 0,
      isRunning: true,
    }
    setLives(3)
    setCrystalsCount(0)
    setSurvivalSecs(0)
    setEarnedCoins(0)
    setGameState('playing')
    starWarsAudio.playKyberChime(440)
  }

  // Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isRunning || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    stateRef.current.targetX = (e.clientX - rect.left) * scaleX
    stateRef.current.targetY = (e.clientY - rect.top) * scaleY
  }

  // Pure Canvas 60fps Loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let prevTime = performance.now()
    let startTime = performance.now()

    const render = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1)
      prevTime = time

      const s = stateRef.current
      if (!s.isRunning) return

      const elapsed = (time - startTime) / 1000
      s.survivalTime = Math.floor(elapsed)
      setSurvivalSecs(s.survivalTime)

      const width = canvas.width
      const height = canvas.height

      // Clear & Draw Starfield Space
      ctx.fillStyle = '#05070E'
      ctx.fillRect(0, 0, width, height)

      // Star Parallax
      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)'
      for (let i = 0; i < 20; i++) {
        const starX = (i * 37 + (time * 0.05)) % width
        const starY = (i * 53 + (time * 0.15)) % height
        ctx.fillRect(starX, starY, 1.5, 1.5)
      }

      // Smooth Falcon movement toward pointer
      s.falconX += (s.targetX - s.falconX) * 0.25
      s.falconY += (s.targetY - s.falconY) * 0.25
      s.falconX = Math.max(25, Math.min(width - 25, s.falconX))
      s.falconY = Math.max(30, Math.min(height - 30, s.falconY))

      // Progressive Speed & Density
      const currentSpeed = Math.min(180, 80 + elapsed * 2.2)
      const spawnInterval = Math.max(650, 1200 - elapsed * 15)

      // Guaranteed Open Passageway Asteroid Spawning
      if (time - s.lastSpawn > spawnInterval) {
        s.lastSpawn = time
        const numSectors = 5
        const sectorWidth = width / numSectors
        const safeSector = Math.floor(Math.random() * (numSectors - 1)) // 2 clear sectors guaranteed

        for (let sec = 0; sec < numSectors; sec++) {
          if (sec !== safeSector && sec !== safeSector + 1) {
            const rockX = sec * sectorWidth + (Math.random() * (sectorWidth - 20)) + 10
            s.asteroids.push({
              x: rockX,
              y: -30,
              size: Math.floor(Math.random() * 12) + 22,
              rot: Math.random() * Math.PI * 2,
              speed: currentSpeed + (Math.random() * 20 - 10),
            })
          }
        }
      }

      // Spawn Kyber Crystals
      if (time - s.lastCrystal > 1300) {
        s.lastCrystal = time
        s.crystalItems.push({
          x: Math.random() * (width - 60) + 30,
          y: -20,
        })
      }

      // Draw & Update Crystals
      for (let i = s.crystalItems.length - 1; i >= 0; i--) {
        const cry = s.crystalItems[i]
        cry.y += 90 * delta

        // Draw Crystal
        ctx.fillStyle = '#00E5FF'
        ctx.beginPath()
        ctx.arc(cry.x, cry.y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Pickup Check
        const dist = Math.hypot(cry.x - s.falconX, cry.y - s.falconY)
        if (dist < 26) {
          starWarsAudio.playKyberChime(880)
          s.crystals += 1
          setCrystalsCount(s.crystals)

          // Spawn sparkle particles
          for (let p = 0; p < 6; p++) {
            s.particles.push({
              x: cry.x,
              y: cry.y,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80,
              life: 0.35,
            })
          }

          if (s.crystals % 2 === 0 && s.earned < 25) {
            s.earned += 1
            setEarnedCoins(s.earned)
            onAddCoins(1)
          }

          s.crystalItems.splice(i, 1)
        } else if (cry.y > height + 20) {
          s.crystalItems.splice(i, 1)
        }
      }

      // Draw & Update Asteroids
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const ast = s.asteroids[i]
        ast.y += ast.speed * delta
        ast.rot += delta * 1.5

        ctx.save()
        ctx.translate(ast.x, ast.y)
        ctx.rotate(ast.rot)
        ctx.fillStyle = '#475569'
        ctx.strokeStyle = '#94A3B8'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(0, 0, ast.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Collision Check
        const dist = Math.hypot(ast.x - s.falconX, ast.y - s.falconY)
        if (dist < ast.size + 14) {
          starWarsAudio.playLightsaberClash()
          s.lives -= 1
          setLives(s.lives)
          s.asteroids.splice(i, 1)

          if (s.lives <= 0) {
            s.isRunning = false
            setGameState('over')
            if (onComplete) onComplete()
            return
          }
        } else if (ast.y > height + 40) {
          s.asteroids.splice(i, 1)
        }
      }

      // Draw Sparkle Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i]
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.life -= delta
        if (p.life <= 0) {
          s.particles.splice(i, 1)
        } else {
          ctx.fillStyle = `rgba(0, 229, 255, ${p.life * 2.5})`
          ctx.fillRect(p.x, p.y, 3, 3)
        }
      }

      // Draw Millennium Falcon Ship
      ctx.save()
      ctx.translate(s.falconX, s.falconY)
      // Hull
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
      ctx.strokeStyle = '#00E5FF'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(0, 0, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // Cockpit
      ctx.fillStyle = '#00E5FF'
      ctx.beginPath()
      ctx.arc(14, -6, 5, 0, Math.PI * 2)
      ctx.fill()
      // Mandibles
      ctx.fillStyle = '#00E5FF'
      ctx.fillRect(-6, -24, 4, 10)
      ctx.fillRect(2, -24, 4, 10)
      // Engine Glow
      ctx.fillStyle = '#00E5FF'
      ctx.beginPath()
      ctx.arc(0, 16, 8, 0, Math.PI)
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
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-blue-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-blue-300 text-shadow-sm">
              Falcon Flight: Asteroides (Canvas 60fps)
            </h3>
            <p className="text-[10px] text-blue-400/70 uppercase tracking-widest font-semibold">
              Rutas abiertas garantizadas · Recolección de cristales sin tirones
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
            <Sparkles className="w-3 h-3 text-cyan-300" /> {crystalsCount}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950 border border-blue-500/30 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={380}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="w-full h-full object-cover block cursor-crosshair touch-none"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 pointer-events-auto">
            <span className="text-5xl block animate-pulse">🛸</span>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Vuelo del Halcón Milenario
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Arrastra suavemente para esquivar los asteroides y recolectar cristales Kyber.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-blue-500/30 touch-feedback"
            >
              Iniciar Vuelo Hiperespacial
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale pointer-events-auto">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-blue-300">
              Impacto en el Cinturón de Asteroides
            </h4>
            <p className="text-xs text-zinc-300">
              Tiempo: <strong className="text-amber-400">{survivalSecs}s</strong> · Cristales:{' '}
              <strong className="text-cyan-400">{crystalsCount}</strong> · Monedas:{' '}
              <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-zinc-400 font-bold">
          Tiempo: <strong className="text-amber-400">{survivalSecs}s</strong>
        </span>
        <span className="text-zinc-400 font-bold">
          Cristales: <strong className="text-cyan-400">{crystalsCount}</strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoins} Coins
        </span>
      </div>
    </div>
  )
}
