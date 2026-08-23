'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Heart, RotateCcw, Compass, Award } from 'lucide-react'
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
  const [highScoreSecs, setHighScoreSecs] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)

  // Phantom Joystick State
  const [joystickTouch, setJoystickTouch] = useState<{
    active: boolean
    originX: number
    originY: number
    currentX: number
    currentY: number
  }>({
    active: false,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
  })

  const stateRef = useRef({
    falconX: 200,
    falconY: 260,
    targetVx: 0,
    targetVy: 0,
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
    pointerActive: false,
    lastPointerX: 0,
    lastPointerY: 0,
  })

  const startGame = () => {
    stateRef.current = {
      falconX: 200,
      falconY: 260,
      targetVx: 0,
      targetVy: 0,
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
      pointerActive: false,
      lastPointerX: 0,
      lastPointerY: 0,
    }
    setLives(3)
    setCrystalsCount(0)
    setSurvivalSecs(0)
    setEarnedCoins(0)
    setGameState('playing')
    starWarsAudio.playKyberChime(440)
  }

  // Phantom Joystick Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stateRef.current.isRunning) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    stateRef.current.pointerActive = true
    stateRef.current.lastPointerX = e.clientX
    stateRef.current.lastPointerY = e.clientY

    setJoystickTouch({
      active: true,
      originX: px,
      originY: py,
      currentX: px,
      currentY: py,
    })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current
    if (!s.isRunning || !s.pointerActive) return

    const deltaX = (e.clientX - s.lastPointerX) * 1.3
    const deltaY = (e.clientY - s.lastPointerY) * 1.3
    s.lastPointerX = e.clientX
    s.lastPointerY = e.clientY

    s.falconX = Math.max(25, Math.min(375, s.falconX + deltaX))
    s.falconY = Math.max(35, Math.min(345, s.falconY + deltaY))

    const rect = e.currentTarget.getBoundingClientRect()
    setJoystickTouch((prev) => ({
      ...prev,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    }))
  }

  const handlePointerUp = () => {
    stateRef.current.pointerActive = false
    setJoystickTouch((prev) => ({ ...prev, active: false }))
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

      // Space Background
      ctx.fillStyle = '#05070E'
      ctx.fillRect(0, 0, width, height)

      // Star Parallax
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)'
      for (let i = 0; i < 24; i++) {
        const starX = (i * 37 + time * 0.04) % width
        const starY = (i * 53 + time * 0.12) % height
        ctx.fillRect(starX, starY, 1.5, 1.5)
      }

      // Progressive speed scaling
      const currentSpeed = Math.min(190, 75 + elapsed * 2.0)
      const spawnInterval = Math.max(700, 1300 - elapsed * 14)

      // Smooth Spaced Asteroid Rows (guaranteeing 2 clear lanes)
      if (time - s.lastSpawn > spawnInterval) {
        s.lastSpawn = time
        const numSectors = 5
        const sectorWidth = width / numSectors
        const safeSector = Math.floor(Math.random() * (numSectors - 1))

        for (let sec = 0; sec < numSectors; sec++) {
          if (sec !== safeSector && sec !== safeSector + 1) {
            const rockX = sec * sectorWidth + Math.random() * (sectorWidth - 20) + 10
            s.asteroids.push({
              x: rockX,
              y: -30,
              size: Math.floor(Math.random() * 10) + 20,
              rot: Math.random() * Math.PI * 2,
              speed: currentSpeed + (Math.random() * 16 - 8),
            })
          }
        }
      }

      // Spawn Kyber Crystals
      if (time - s.lastCrystal > 3200) {
        s.lastCrystal = time
        s.crystalItems.push({
          x: Math.random() * (width - 60) + 30,
          y: -20,
        })
      }

      // Update & Render Asteroids
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const ast = s.asteroids[i]
        ast.y += ast.speed * delta
        ast.rot += delta * 1.5

        ctx.save()
        ctx.translate(ast.x, ast.y)
        ctx.rotate(ast.rot)
        ctx.fillStyle = '#334155'
        ctx.strokeStyle = '#64748B'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(0, 0, ast.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Collision with Falcon
        const dist = Math.hypot(ast.x - s.falconX, ast.y - s.falconY)
        if (dist < ast.size / 2 + 18) {
          starWarsAudio.playLightsaberClash()
          s.lives -= 1
          setLives(s.lives)
          s.asteroids.splice(i, 1)

          if (s.lives <= 0) {
            s.isRunning = false
            setGameState('over')
            setHighScoreSecs((prev) => Math.max(prev, s.survivalTime))
            if (onComplete) onComplete()
            return
          }
        } else if (ast.y > height + 40) {
          s.asteroids.splice(i, 1)
        }
      }

      // Update & Render Kyber Crystals
      for (let i = s.crystalItems.length - 1; i >= 0; i--) {
        const cry = s.crystalItems[i]
        cry.y += 100 * delta

        ctx.fillStyle = '#00E5FF'
        ctx.shadowColor = '#00E5FF'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(cry.x, cry.y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Collect Crystal
        const dist = Math.hypot(cry.x - s.falconX, cry.y - s.falconY)
        if (dist < 26) {
          starWarsAudio.playKyberChime(880)
          s.crystals += 1
          setCrystalsCount(s.crystals)
          s.earned += 1
          setEarnedCoins(s.earned)
          onAddCoins(1)
          s.crystalItems.splice(i, 1)
        } else if (cry.y > height + 20) {
          s.crystalItems.splice(i, 1)
        }
      }

      // Draw Millennium Falcon Ship
      ctx.save()
      ctx.translate(s.falconX, s.falconY)
      // Body
      ctx.fillStyle = '#E2E8F0'
      ctx.strokeStyle = '#94A3B8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      // Cockpit on the right
      ctx.fillStyle = '#00E5FF'
      ctx.beginPath()
      ctx.arc(16, -10, 5, 0, Math.PI * 2)
      ctx.fill()
      // Blue hyperdrive engine glow
      ctx.fillStyle = '#00E5FF'
      ctx.shadowColor = '#00E5FF'
      ctx.shadowBlur = 12
      ctx.fillRect(-14, 20, 28, 4)
      ctx.shadowBlur = 0
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [gameState, onAddCoins, onComplete])

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-cyan-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-cyan-300 text-shadow-sm flex items-center gap-2">
              Millennium Falcon: Phantom Flight
            </h3>
            <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-semibold">
              Joystick Fantasma · Arrastra en cualquier zona sin tapar la nave
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
          <div className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-black text-cyan-300">
            ⏱️ {survivalSecs}s · 💎 {crystalsCount}
          </div>
        </div>
      </div>

      {/* Main Interactive Touch Area */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-inner flex items-center justify-center touch-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={380}
          className="w-full h-full object-cover block"
        />

        {/* Luminous Holographic Phantom Joystick Overlay */}
        {joystickTouch.active && (
          <div
            className="absolute pointer-events-none transition-opacity duration-150"
            style={{
              left: joystickTouch.originX,
              top: joystickTouch.originY,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Outer Ring */}
            <div className="w-20 h-20 rounded-full border-2 border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center backdrop-blur-xs">
              {/* Inner Thumb Knob */}
              <div
                className="w-8 h-8 rounded-full bg-cyan-400 border border-white shadow-[0_0_10px_#00E5FF]"
                style={{
                  transform: `translate(${Math.max(
                    -25,
                    Math.min(25, joystickTouch.currentX - joystickTouch.originX)
                  )}px, ${Math.max(
                    -25,
                    Math.min(25, joystickTouch.currentY - joystickTouch.originY)
                  )}px)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <span className="text-5xl block animate-bounce">🛸</span>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Vuelo con Joystick Fantasma
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Toca y desliza en cualquier parte de la pantalla (abajo o a los lados). Tu dedo no
              obstruirá la nave.
            </p>
            {highScoreSecs > 0 && (
              <p className="text-xs font-black text-cyan-300">
                🏆 Récord: Sobrevivido {highScoreSecs} segundos
              </p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-cyan-500/30 touch-feedback"
            >
              Iniciar Despegue
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-spring-scale">
            <span className="text-5xl block">💥</span>
            <h4 className="text-xl font-black text-cyan-300">Nave Destruida</h4>
            <p className="text-xs text-zinc-300">
              Tiempo Sobrevivido: <strong className="text-cyan-400">{survivalSecs} segundos</strong> ·
              Cristales Kyber: <strong className="text-amber-400">{crystalsCount}</strong>
            </p>
            {survivalSecs >= highScoreSecs && (
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                <Award className="w-3.5 h-3.5" /> ¡Nuevo Récord de Vuelo!
              </span>
            )}
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
