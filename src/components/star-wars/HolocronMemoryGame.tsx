'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, Brain, Award, RotateCcw } from 'lucide-react'
import { starWarsAudio } from '@/utils/starWarsAudio'

const HOLOCRONS = [
  { id: 0, name: 'Jedi Blue', color: '#00E5FF', freq: 440, emoji: '🔷' },
  { id: 1, name: 'Sith Crimson', color: '#FF1E56', freq: 330, emoji: '🔺' },
  { id: 2, name: 'Guardian Green', color: '#00FF66', freq: 550, emoji: '🟢' },
  { id: 3, name: 'Consular Gold', color: '#FFB800', freq: 660, emoji: '⭐' },
]

export function HolocronMemoryGame({
  onAddCoins,
  onComplete,
}: {
  onAddCoins: (amount: number) => void
  onComplete?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [sequence, setSequence] = useState<number[]>([])
  const [userStep, setUserStep] = useState(0)
  const [activeHolocron, setActiveHolocron] = useState<number | null>(null)
  const [isDisplaying, setIsDisplaying] = useState(false)
  const [stage, setStage] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [earnedCoins, setEarnedCoins] = useState(0)

  const earnedRef = useRef(0)

  const startGame = () => {
    setIsPlaying(true)
    setStage(1)
    setGameOver(false)
    setGameWon(false)
    earnedRef.current = 0
    setEarnedCoins(0)
    startRound([Math.floor(Math.random() * 4)])
  }

  const startRound = (newSeq: number[]) => {
    setSequence(newSeq)
    setUserStep(0)
    setIsDisplaying(true)
    playSequence(newSeq)
  }

  const playSequence = async (seq: number[]) => {
    await new Promise((r) => setTimeout(r, 600))
    for (let i = 0; i < seq.length; i++) {
      const holocronIndex = seq[i]
      setActiveHolocron(holocronIndex)
      starWarsAudio.playKyberChime(HOLOCRONS[holocronIndex].freq)
      await new Promise((r) => setTimeout(r, 500))
      setActiveHolocron(null)
      await new Promise((r) => setTimeout(r, 200))
    }
    setIsDisplaying(false)
  }

  const handleHolocronTap = (index: number) => {
    if (!isPlaying || isDisplaying || gameOver || gameWon) return

    setActiveHolocron(index)
    starWarsAudio.playKyberChime(HOLOCRONS[index].freq)
    setTimeout(() => setActiveHolocron(null), 250)

    if (sequence[userStep] === index) {
      // Correct step
      const nextStep = userStep + 1
      if (nextStep === sequence.length) {
        // Stage completed!
        const bonus = 5
        if (earnedRef.current < 35) {
          earnedRef.current += bonus
          setEarnedCoins(earnedRef.current)
          onAddCoins(bonus)
        }

        if (stage >= 7) {
          // Master of the Holocrons!
          setGameWon(true)
          setIsPlaying(false)
          if (onComplete) onComplete()
        } else {
          setStage((s) => s + 1)
          const nextSeq = [...sequence, Math.floor(Math.random() * 4)]
          setTimeout(() => startRound(nextSeq), 800)
        }
      } else {
        setUserStep(nextStep)
      }
    } else {
      // Wrong step
      starWarsAudio.playLightsaberClash()
      setGameOver(true)
      setIsPlaying(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-[28px] glass-panel-heavy border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-4 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-amber-300 text-shadow-sm">
              Holocron Memory Matrix
            </h3>
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">
              Force resonant sequence memory
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-black text-amber-300">
          Nivel {stage}/7
        </div>
      </div>

      {/* Main Interactive Matrix Area */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-950/90 border border-amber-500/20 overflow-hidden shadow-inner flex items-center justify-center p-6">
        {!isPlaying && !gameOver && !gameWon && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-spin">💠</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Desbloquea la Sabiduría Jedi
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Observa y memoriza el patrón de luz de los 4 Holocrones. Repite la secuencia
              exacta.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-amber-500/30 touch-feedback"
            >
              Iniciar Meditación
            </button>
          </div>
        )}

        {gameWon && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <Award className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-black text-amber-300">
              ¡Maestro de la Fuerza!
            </h4>
            <p className="text-xs text-zinc-300">
              Has dominado los 7 niveles del Holocrón. Recompensa:{' '}
              <strong className="text-emerald-400">+{earnedCoins} Coins</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Jugar de Nuevo
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block">⚡</span>
            <h4 className="text-xl font-black text-red-400">
              Perturbación en la Fuerza
            </h4>
            <p className="text-xs text-zinc-300">
              Nivel Alcanzado: <strong className="text-amber-400">{stage}</strong> ·
              Monedas Ganadas: <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* 4 Holocrons Grid */}
        {isPlaying && (
          <div className="grid grid-cols-2 gap-4 w-full max-w-[280px] aspect-square">
            {HOLOCRONS.map((h, i) => {
              const isActive = activeHolocron === i
              return (
                <button
                  key={h.id}
                  disabled={isDisplaying}
                  onClick={() => handleHolocronTap(i)}
                  className={`rounded-3xl border-2 transition-all duration-150 flex flex-col items-center justify-center relative overflow-hidden touch-feedback ${
                    isActive
                      ? 'scale-95 shadow-[0_0_35px_var(--glow)] border-white'
                      : 'bg-black/40 border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                  style={
                    {
                      '--glow': h.color,
                      borderColor: isActive ? '#FFFFFF' : undefined,
                    } as any
                  }
                >
                  <div
                    className={`absolute inset-0 transition-opacity duration-150 ${
                      isActive ? 'opacity-40' : 'opacity-10'
                    }`}
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="text-3xl sm:text-4xl mb-1 relative z-10">
                    {h.emoji}
                  </span>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider relative z-10"
                    style={{ color: h.color }}
                  >
                    {h.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-zinc-400 font-bold">
          Progreso:{' '}
          <strong className="text-amber-400">
            {userStep}/{sequence.length}
          </strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoins} Fandi Coins
        </span>
      </div>
    </div>
  )
}
