'use client'

import { useState, useRef } from 'react'
import { Brain, Award, RotateCcw } from 'lucide-react'
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
  const [highScore, setHighScore] = useState(1)
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
    // Speed increases slightly at higher levels for snappy play
    const stepDuration = Math.max(260, 480 - Math.min(seq.length * 6, 200))
    const pauseDuration = Math.max(120, 200 - Math.min(seq.length * 4, 80))

    await new Promise((r) => setTimeout(r, 500))
    for (let i = 0; i < seq.length; i++) {
      const holocronIndex = seq[i]
      setActiveHolocron(holocronIndex)
      starWarsAudio.playKyberChime(HOLOCRONS[holocronIndex].freq)
      await new Promise((r) => setTimeout(r, stepDuration))
      setActiveHolocron(null)
      await new Promise((r) => setTimeout(r, pauseDuration))
    }
    setIsDisplaying(false)
  }

  const handleHolocronTap = (index: number) => {
    if (!isPlaying || isDisplaying || gameOver || gameWon) return

    setActiveHolocron(index)
    starWarsAudio.playKyberChime(HOLOCRONS[index].freq)
    setTimeout(() => setActiveHolocron(null), 200)

    if (sequence[userStep] === index) {
      // Correct step
      const nextStep = userStep + 1
      if (nextStep === sequence.length) {
        // Stage completed!
        const nextStage = stage + 1
        setStage(nextStage)
        if (nextStage > highScore) setHighScore(nextStage)

        // Award +2 coins every 2 stages up to 30 coins
        if (nextStage % 2 === 0 && earnedRef.current < 30) {
          earnedRef.current += 2
          setEarnedCoins(earnedRef.current)
          onAddCoins(2)
        }

        if (nextStage >= 100) {
          // Ultimate Grand Master Level 100 reached!
          setGameWon(true)
          setIsPlaying(false)
          if (onComplete) onComplete()
        } else {
          const nextSeq = [...sequence, Math.floor(Math.random() * 4)]
          setTimeout(() => startRound(nextSeq), 650)
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
              Holocron Memory Matrix (Hasta Nivel 100)
            </h3>
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">
              Desafío de memoria Jedi de 100 niveles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500">
            Récord: Lvl {highScore}
          </span>
          <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-black text-amber-300">
            Nivel {stage}/100
          </div>
        </div>
      </div>

      {/* Main Altar View with Ancient Temple Background */}
      <div
        className="relative w-full h-84 sm:h-96 rounded-2xl bg-slate-950/95 border border-amber-500/30 overflow-hidden shadow-inner flex items-center justify-center p-6"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255, 184, 0, 0.12) 0%, transparent 80%)',
        }}
      >
        {/* Ancient Altar Temple Glyphs Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none text-6xl">
          🏛️
        </div>

        {!isPlaying && !gameOver && !gameWon && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <span className="text-5xl block animate-spin">💠</span>
            <h4 className="text-lg sm:text-xl font-black text-zinc-100">
              Desafío de la Matriz Holocrón
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Memoriza la secuencia y repite los patrones. Cada nivel añade una nota a la
              melodía de la Fuerza hasta el nivel 100.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg shadow-amber-500/30 touch-feedback"
            >
              Iniciar Meditación de 100 Niveles
            </button>
          </div>
        )}

        {gameWon && (
          <div className="text-center p-6 space-y-3 z-10 animate-spring-scale">
            <Award className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-black text-amber-300">
              ¡NIVEL 100 ALCANZADO! Gran Maestro de la Orden!
            </h4>
            <p className="text-xs text-zinc-300">
              Has logrado una hazaña legendaria. Recompensa:{' '}
              <strong className="text-emerald-400">+{earnedCoins} Fandi Coins</strong>
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
              Secuencia Interrumpida
            </h4>
            <p className="text-xs text-zinc-300">
              Nivel Alcanzado: <strong className="text-amber-400">Lvl {stage}</strong> ·
              Monedas:{' '}
              <strong className="text-emerald-400">+{earnedCoins}</strong>
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs tracking-wider rounded-2xl shadow-lg touch-feedback flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
            </button>
          </div>
        )}

        {/* 4 Holocrons Interactive Altar */}
        {isPlaying && (
          <div className="grid grid-cols-2 gap-4 w-full max-w-[280px] aspect-square relative z-10">
            {HOLOCRONS.map((h, i) => {
              const isActive = activeHolocron === i
              return (
                <button
                  key={h.id}
                  disabled={isDisplaying}
                  onClick={() => handleHolocronTap(i)}
                  className={`rounded-3xl border-2 transition-all duration-100 flex flex-col items-center justify-center relative overflow-hidden touch-feedback ${
                    isActive
                      ? 'scale-95 shadow-[0_0_40px_var(--glow)] border-white'
                      : 'bg-black/50 border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                  }`}
                  style={
                    {
                      '--glow': h.color,
                      borderColor: isActive ? '#FFFFFF' : undefined,
                    } as any
                  }
                >
                  <div
                    className={`absolute inset-0 transition-opacity duration-100 ${
                      isActive ? 'opacity-50' : 'opacity-10'
                    }`}
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="text-3xl sm:text-4xl mb-1 relative z-10 drop-shadow">
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
          Paso Actual:{' '}
          <strong className="text-amber-400">
            {userStep}/{sequence.length}
          </strong>
        </span>
        <span className="text-emerald-400 font-black">
          +{earnedCoins} Coins
        </span>
      </div>
    </div>
  )
}
