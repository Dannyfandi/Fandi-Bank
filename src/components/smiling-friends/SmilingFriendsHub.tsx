'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Award,
  Lock,
  Unlock,
  Coins,
  RotateCcw,
  Zap,
  CheckCircle,
  Brain,
  Timer,
  Heart,
} from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { updateSmilingFriendsProgress, syncFandiCoins, updateTheme } from '@/app/dashboard/actions'

const MAINS = [
  {
    id: 'mrfrog',
    name: 'Mr. Frog',
    title: 'Celebridad Psicótica',
    url: '/characters/mrfrog.jpg',
    color: '#22c55e',
    cost: 300,
    quote: 'Hola, soy el Sr. Rana. Este es mi programa. Me como el bicho.',
  },
  {
    id: 'mrboss',
    name: 'Mr. Boss',
    title: 'CEO de Smiling Friends',
    url: '/characters/mrboss.jpg',
    color: '#eab308',
    cost: 500,
    quote: '¡Solo son negocios, muchachos! ¡Todo está bien!',
  },
  {
    id: 'alan',
    name: 'Alan',
    title: 'Especialista en Queso',
    url: '/characters/alan.jpg',
    color: '#06b6d4',
    cost: 700,
    quote: 'Solo quería mi pedazo de queso.',
  },
  {
    id: 'pim',
    name: 'Pim Pimling',
    title: 'Agente de Sonrisas',
    url: '/characters/pim.jpg',
    color: '#ec4899',
    cost: 900,
    quote: '¡Amo a los niños, amo sonreír, amo la vida!',
  },
  {
    id: 'charlie',
    name: 'Charlie Dompler',
    title: 'Realista y Amigo',
    url: '/characters/charlie.jpg',
    color: '#f97316',
    cost: 1100,
    quote: 'Mira Pim, creo que esto no va a terminar bien.',
  },
  {
    id: 'glep',
    name: 'Glep',
    title: 'Pequeño Sabio',
    url: '/characters/glep.gif',
    color: '#8b5cf6',
    cost: 1300,
    quote: 'Gibberish alien sounds *slurp*',
  },
]

export function SmilingFriendsHub({
  lang,
  initialProgress,
  initialCoins = 0,
  initialVersion = 0,
}: {
  lang: 'en' | 'es'
  initialProgress?: any
  initialCoins?: number
  initialVersion?: number
}) {
  const [coins, setCoins] = useState(initialCoins)
  const [coinVersion, setCoinVersion] = useState(initialVersion)
  const [unlockedMains, setUnlockedMains] = useState<string[]>(
    initialProgress?.unlocked_mains || []
  )
  const [selectedCharacter, setSelectedCharacter] = useState<any>(MAINS[0])
  const [activeGame, setActiveGame] = useState<'math' | 'cheer' | 'mole'>('math')

  // Math game state
  const [mathA, setMathA] = useState(12)
  const [mathB, setMathB] = useState(8)
  const [mathOp, setMathOp] = useState('+')
  const [mathChoices, setMathChoices] = useState<number[]>([20, 18, 22, 24])
  const [mathScore, setMathScore] = useState(0)
  const [mathTimer, setMathTimer] = useState(15)
  const [mathActive, setMathActive] = useState(false)
  const [mathOver, setMathOver] = useState(false)

  // Cheer clicker state
  const [cheerCount, setCheerCount] = useState(0)
  const [cheerTarget, setCheerTarget] = useState(25)
  const [cheerTimeLeft, setCheerTimeLeft] = useState(10)
  const [cheerActive, setCheerActive] = useState(false)
  const [cheerOver, setCheerOver] = useState(false)

  // Mole whack state
  const [moleGrid, setMoleGrid] = useState<number | null>(null)
  const [moleScore, setMoleScore] = useState(0)
  const [moleActive, setMoleActive] = useState(false)
  const [moleOver, setMoleOver] = useState(false)
  const [moleTimer, setMoleTimer] = useState(20)

  const unlockedCount = unlockedMains.length
  const allUnlocked = unlockedCount === 6

  const handleAddCoins = async (amount: number) => {
    const nextCoins = coins + amount
    const nextVersion = coinVersion + 1
    setCoins(nextCoins)
    setCoinVersion(nextVersion)
    try {
      await syncFandiCoins(nextCoins, nextVersion)
    } catch {
      // fallback
    }
  }

  // Spend Coins to Unlock Character
  const handleUnlockCharacter = async (charId: string) => {
    const target = MAINS.find((m) => m.id === charId)
    if (!target || unlockedMains.includes(charId)) return
    if (coins < target.cost) return

    const nextCoins = coins - target.cost
    const nextVersion = coinVersion + 1
    setCoins(nextCoins)
    setCoinVersion(nextVersion)
    await syncFandiCoins(nextCoins, nextVersion)

    const nextUnlocked = [...unlockedMains, charId]
    setUnlockedMains(nextUnlocked)

    const fd = new FormData()
    fd.append('newlyUnlocked', charId)
    await updateSmilingFriendsProgress(fd)

    if (nextUnlocked.length >= 6) {
      await updateTheme('smiling_friends')
    }
  }

  // Math Minigame Generator
  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 40) + 10
    const b = Math.floor(Math.random() * 25) + 5
    const op = Math.random() > 0.5 ? '+' : '-'
    const correct = op === '+' ? a + b : a - b
    const f1 = correct + Math.floor(Math.random() * 5) + 1
    const f2 = Math.max(1, correct - (Math.floor(Math.random() * 4) + 1))
    const f3 = correct + (Math.random() > 0.5 ? 10 : -10)
    const options = Array.from(new Set([correct, f1, f2, f3])).sort(
      () => Math.random() - 0.5
    )

    setMathA(a)
    setMathB(b)
    setMathOp(op)
    setMathChoices(options)
  }

  const startMathGame = () => {
    setMathScore(0)
    setMathTimer(15)
    setMathActive(true)
    setMathOver(false)
    generateMathQuestion()
  }

  useEffect(() => {
    if (!mathActive || mathOver) return
    const t = setInterval(() => {
      setMathTimer((prev) => {
        if (prev <= 1) {
          setMathOver(true)
          setMathActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [mathActive, mathOver])

  const handleMathAnswer = (val: number) => {
    const correct = mathOp === '+' ? mathA + mathB : mathA - mathB
    if (val === correct) {
      const nextScore = mathScore + 1
      setMathScore(nextScore)
      handleAddCoins(2)
      generateMathQuestion()
    } else {
      setMathTimer((t) => Math.max(0, t - 2))
    }
  }

  // Cheer Clicker Logic
  const startCheerGame = () => {
    setCheerCount(0)
    setCheerTarget(Math.floor(Math.random() * 15) + 25)
    setCheerTimeLeft(10)
    setCheerActive(true)
    setCheerOver(false)
  }

  useEffect(() => {
    if (!cheerActive || cheerOver) return
    const t = setInterval(() => {
      setCheerTimeLeft((prev) => {
        if (prev <= 1) {
          setCheerOver(true)
          setCheerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [cheerActive, cheerOver])

  const handleCheerTap = () => {
    if (!cheerActive || cheerOver) return
    const nextCount = cheerCount + 1
    setCheerCount(nextCount)
    if (nextCount >= cheerTarget) {
      handleAddCoins(15)
      setCheerOver(true)
      setCheerActive(false)
    }
  }

  // Mole Whack Logic
  const startMoleGame = () => {
    setMoleScore(0)
    setMoleTimer(20)
    setMoleActive(true)
    setMoleOver(false)
  }

  useEffect(() => {
    if (!moleActive || moleOver) return
    const timerInt = setInterval(() => {
      setMoleTimer((t) => {
        if (t <= 1) {
          setMoleOver(true)
          setMoleActive(false)
          setMoleGrid(null)
          return 0
        }
        return t - 1
      })
    }, 1000)

    const moleInt = setInterval(() => {
      setMoleGrid(Math.floor(Math.random() * 9))
    }, 850)

    return () => {
      clearInterval(timerInt)
      clearInterval(moleInt)
    }
  }, [moleActive, moleOver])

  const handleMoleHit = (idx: number) => {
    if (moleGrid === idx) {
      setMoleScore((s) => s + 1)
      handleAddCoins(2)
      setMoleGrid(null)
    }
  }

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header Card */}
      <div className="p-6 sm:p-8 rounded-[32px] glass-panel-heavy border border-yellow-500/40 shadow-2xl relative overflow-hidden bg-yellow-950/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_#eab308]">
                <Sparkles className="w-3 h-3" /> Smiling Friends HQ
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 text-shadow-md">
              Smiling Friends Labs & Games
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              Desbloquea a los 6 trabajadores de Smiling Friends para liberar el tema psicodélico global.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-yellow-950/50 border border-yellow-500/40 flex items-center gap-4 shrink-0 shadow-lg shadow-yellow-950/60">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_#eab308]">
              🪙
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-yellow-400">
                Tus Fandi Coins
              </p>
              <p className="text-2xl sm:text-3xl font-black text-yellow-200">
                <AnimatedNumber value={coins} formatAsCurrency={false} />
              </p>
            </div>
          </div>
        </div>

        {allUnlocked && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-950/90 via-amber-950/90 to-orange-950/90 border-2 border-yellow-400/60 shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-between animate-spring-scale">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-lg animate-bounce">
                🐸
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base text-yellow-200">
                  ¡Tema Smiling Friends Desbloqueado!
                </h4>
                <p className="text-xs text-zinc-300">
                  Los 6 personajes están listos en tu panel.
                </p>
              </div>
            </div>
            <button
              onClick={() => updateTheme('smiling_friends')}
              className="text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl bg-yellow-400 text-black shadow-md hover:bg-yellow-300 transition-colors touch-feedback"
            >
              Activar Tema
            </button>
          </div>
        )}
      </div>

      {/* 2. Character Vault with Real Photos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Bóveda de Personajes ({unlockedCount}/6)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {MAINS.map((char) => {
            const isUnlocked = unlockedMains.includes(char.id)
            const isSelected = selectedCharacter?.id === char.id

            return (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`p-3 rounded-2xl glass-panel border transition-all text-left flex flex-col justify-between relative overflow-hidden touch-feedback ${
                  isUnlocked
                    ? isSelected
                      ? 'border-yellow-400 bg-yellow-950/40 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                      : 'border-white/15 bg-black/40 hover:border-white/30'
                    : 'border-white/5 bg-black/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-black relative flex items-center justify-center border border-white/10">
                  <img
                    src={char.url}
                    alt={char.name}
                    className={`w-full h-full object-cover transition-all ${
                      !isUnlocked ? 'grayscale blur-[2px] opacity-50' : ''
                    }`}
                  />
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md">
                    {isUnlocked ? (
                      <Unlock className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-500" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs text-zinc-100 truncate">
                    {isUnlocked ? char.name : '??? Bloqueado'}
                  </h4>
                  <p className="text-[9px] font-bold text-zinc-400 truncate">
                    {isUnlocked ? char.title : `${char.cost} Coins`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Character Card */}
        {selectedCharacter && (
          <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-yellow-500/30 bg-black/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-spring-scale">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-yellow-400/60 shrink-0 bg-black shadow-lg">
                <img
                  src={selectedCharacter.url}
                  alt={selectedCharacter.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-black text-base text-zinc-100">
                  {selectedCharacter.name}
                </h4>
                <p className="text-xs text-yellow-400 font-bold">
                  {selectedCharacter.title}
                </p>
                <p className="text-xs italic text-zinc-300 mt-1">
                  "{selectedCharacter.quote}"
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {!unlockedMains.includes(selectedCharacter.id) ? (
                <button
                  onClick={() => handleUnlockCharacter(selectedCharacter.id)}
                  disabled={coins < selectedCharacter.cost}
                  className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all touch-feedback flex items-center gap-2 shadow-lg ${
                    coins >= selectedCharacter.cost
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 shadow-yellow-500/25'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Coins className="w-4 h-4" /> Desbloquear ({selectedCharacter.cost} Coins)
                </button>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Desbloqueado
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Minigames Suite */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Mini-Juegos de Smiling Friends
          </h3>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setActiveGame('math')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'math'
                ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400'
            }`}
          >
            <span className="text-xl">🐸</span>
            <span>Cálculo Sr. Rana</span>
          </button>

          <button
            onClick={() => setActiveGame('cheer')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'cheer'
                ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400'
            }`}
          >
            <span className="text-xl">🌸</span>
            <span>Alegría de Pim</span>
          </button>

          <button
            onClick={() => setActiveGame('mole')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'mole'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400'
            }`}
          >
            <span className="text-xl">🔨</span>
            <span>Glep Aplastatop</span>
          </button>
        </div>

        {/* Active Game Stage */}
        <div className="pt-2">
          {/* Game 1: Math */}
          {activeGame === 'math' && (
            <div className="p-6 rounded-3xl glass-panel-heavy border border-green-500/30 bg-black/60 text-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-green-400">🐸 Reto de Cálculo</span>
                <span className="px-2.5 py-1 rounded-full bg-green-950/80 text-green-300 font-bold">
                  ⏳ {mathTimer}s
                </span>
              </div>

              {!mathActive && !mathOver && (
                <div className="py-6 space-y-3">
                  <span className="text-5xl block animate-bounce">🐸</span>
                  <h4 className="text-lg font-black text-white">
                    ¡Resuelve rápido antes de que se acabe el tiempo!
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Cada respuesta correcta te da +2 Fandi Coins y nuevas operaciones.
                  </p>
                  <button
                    onClick={startMathGame}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Empezar Reto
                  </button>
                </div>
              )}

              {mathActive && (
                <div className="py-4 space-y-4">
                  <div className="text-3xl sm:text-4xl font-black text-green-300">
                    {mathA} {mathOp} {mathB} = ?
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    {mathChoices.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleMathAnswer(opt)}
                        className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-green-500/20 active:scale-95 border border-white/20 text-white font-black text-lg touch-feedback"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mathOver && (
                <div className="py-6 space-y-3 animate-spring-scale">
                  <h4 className="text-xl font-black text-green-400">
                    ¡Tiempo Terminado!
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Aciertos: <strong className="text-green-300">{mathScore}</strong>
                  </p>
                  <button
                    onClick={startMathGame}
                    className="px-6 py-2.5 bg-green-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game 2: Cheer Clicker */}
          {activeGame === 'cheer' && (
            <div className="p-6 rounded-3xl glass-panel-heavy border border-pink-500/30 bg-black/60 text-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-pink-400">🌸 Alegría Explosiva de Pim</span>
                <span className="px-2.5 py-1 rounded-full bg-pink-950/80 text-pink-300 font-bold">
                  ⏳ {cheerTimeLeft}s
                </span>
              </div>

              {!cheerActive && !cheerOver && (
                <div className="py-6 space-y-3">
                  <span className="text-5xl block animate-pulse">🌸</span>
                  <h4 className="text-lg font-black text-white">
                    ¡Toca lo más rápido que puedas para animar al cliente!
                  </h4>
                  <button
                    onClick={startCheerGame}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Iniciar Taps
                  </button>
                </div>
              )}

              {cheerActive && (
                <div className="py-4 space-y-4">
                  <button
                    onClick={handleCheerTap}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 text-white font-black text-4xl shadow-[0_0_30px_#ec4899] active:scale-90 transition-transform mx-auto flex items-center justify-center touch-feedback"
                  >
                    ¡TAP!
                  </button>
                  <p className="text-sm font-black text-pink-300">
                    {cheerCount} / {cheerTarget} Taps
                  </p>
                </div>
              )}

              {cheerOver && (
                <div className="py-6 space-y-3 animate-spring-scale">
                  <h4 className="text-xl font-black text-pink-400">
                    {cheerCount >= cheerTarget
                      ? '¡Cliente Feliz! (+15 Coins)'
                      : '¡Casi lo logras!'}
                  </h4>
                  <button
                    onClick={startCheerGame}
                    className="px-6 py-2.5 bg-pink-500 text-white font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Intentar de Nuevo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game 3: Mole Whack */}
          {activeGame === 'mole' && (
            <div className="p-6 rounded-3xl glass-panel-heavy border border-purple-500/30 bg-black/60 text-center space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-purple-400">🔨 Aplastatop de Glep</span>
                <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-bold">
                  ⏳ {moleTimer}s · Golpes: {moleScore}
                </span>
              </div>

              {!moleActive && !moleOver && (
                <div className="py-6 space-y-3">
                  <span className="text-5xl block animate-spin">🔨</span>
                  <h4 className="text-lg font-black text-white">
                    ¡Golpea a Glep cuando asome la cabeza!
                  </h4>
                  <button
                    onClick={startMoleGame}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Empezar
                  </button>
                </div>
              )}

              {moleActive && (
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto py-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleMoleHit(slot)}
                      className={`h-20 rounded-2xl flex items-center justify-center text-3xl border transition-all touch-feedback ${
                        moleGrid === slot
                          ? 'bg-purple-600 border-purple-300 shadow-[0_0_20px_#8b5cf6] scale-105'
                          : 'bg-black/50 border-white/10'
                      }`}
                    >
                      {moleGrid === slot ? '👾' : '🕳️'}
                    </button>
                  ))}
                </div>
              )}

              {moleOver && (
                <div className="py-6 space-y-3 animate-spring-scale">
                  <h4 className="text-xl font-black text-purple-400">
                    ¡Fin del Juego!
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Golpes Totales: <strong className="text-purple-300">{moleScore}</strong>
                  </p>
                  <button
                    onClick={startMoleGame}
                    className="px-6 py-2.5 bg-purple-500 text-white font-black uppercase text-xs rounded-2xl shadow-lg touch-feedback"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
