'use client'

import { useState } from 'react'
import {
  Shield,
  Zap,
  Sparkles,
  Award,
  Lock,
  Unlock,
  CheckCircle,
  Brain,
  Rocket,
  Compass,
  Crosshair,
  RotateCcw,
  Star,
  Send,
  Eye,
  Layers,
} from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { starWarsAudio } from '@/utils/starWarsAudio'
import { LightsaberDuelGame } from './LightsaberDuelGame'
import { TrenchRunGame } from './TrenchRunGame'
import { FalconFlightGame } from './FalconFlightGame'
import { HolocronMemoryGame } from './HolocronMemoryGame'
import { CantinaQuickDrawGame } from './CantinaQuickDrawGame'
import { syncFandiCoins } from '@/app/dashboard/actions'

interface Character {
  id: string
  name: string
  title: string
  avatar: string
  color: string
  perk: string
  perkDetail: string
  unlocked: boolean
  quote: string
}

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'luke',
    name: 'Luke Skywalker',
    title: 'Jedi Knight',
    avatar: '⚔️',
    color: '#00FF66',
    perk: 'Green Lightsaber Accent Glow',
    perkDetail: 'Enables emerald vector illumination around active debts and navigation.',
    unlocked: true, // starts unlocked as hero
    quote: 'I am a Jedi, like my father before me.',
  },
  {
    id: 'vader',
    name: 'Darth Vader',
    title: 'Dark Lord of the Sith',
    avatar: '🦹‍♂️',
    color: '#FF1E56',
    perk: 'Sith Red Borders & Breathing SFX',
    perkDetail: 'Tapping cards triggers mechanical Sith respirator breath and crimson edge aura.',
    unlocked: false,
    quote: 'You underestimate the power of the Dark Side.',
  },
  {
    id: 'yoda',
    name: 'Master Yoda',
    title: 'Grand Master',
    avatar: '🧙‍♂️',
    color: '#00E5FF',
    perk: 'Jedi Wisdom Daily Tip Widget',
    perkDetail: 'Interactive holographic daily advice for debt repayment and financial Force.',
    unlocked: false,
    quote: 'Do or do not. There is no try.',
  },
  {
    id: 'ahsoka',
    name: 'Ahsoka Tano',
    title: 'Fulcrum',
    avatar: '🗡️',
    color: '#FFFFFF',
    perk: 'Dual-Wielding Swipe Gestures',
    perkDetail: 'Fast dual gesture shortcuts to swipe between debts and payments seamlessly.',
    unlocked: false,
    quote: 'I am no Jedi.',
  },
  {
    id: 'rez',
    name: 'Commander Rez',
    title: 'Clone Captain',
    avatar: '🎖️',
    color: '#3B82F6',
    perk: 'Blaster-Speed Fast-Pay Action',
    perkDetail: 'One-tap QuickPay shortcut with blaster SFX for rapid debt amortization.',
    unlocked: false,
    quote: 'Good soldiers follow orders. Great soldiers question them.',
  },
  {
    id: 'obiwan',
    name: 'Obi-Wan Kenobi',
    title: 'Jedi Master',
    avatar: '🧘‍♂️',
    color: '#FFB800',
    perk: 'High-Ground Sticky Navigation Header',
    perkDetail: 'Permanent elevated navigation bar with Force clarity floating above content.',
    unlocked: false,
    quote: 'The Force will be with you, always.',
  },
]

const YODA_WISDOMS = [
  'Do or do not. There is no try.',
  'Pay your debts first, peace of mind follows.',
  'Patience you must have, young padawan.',
  'A debt repaid is a burden lifted into the light.',
  'Fear of loss is a path to the dark side.',
]

export function StarWarsArena({
  initialCoins = 150,
  initialVersion = 0,
}: {
  initialCoins?: number
  initialVersion?: number
}) {
  const [coins, setCoins] = useState(initialCoins)
  const [coinVersion, setCoinVersion] = useState(initialVersion)
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS)
  const [activeGame, setActiveGame] = useState<
    'duel' | 'trench' | 'falcon' | 'holocron' | 'cantina'
  >('duel')
  const [yodaWisdom, setYodaWisdom] = useState(YODA_WISDOMS[0])
  const [fastPaySuccess, setFastPaySuccess] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    INITIAL_CHARACTERS[0]
  )

  const unlockedCount = characters.filter((c) => c.unlocked).length
  const allUnlocked = unlockedCount === 6

  // Coin handler with Supabase sync
  const handleAddCoins = async (amount: number) => {
    const nextCoins = coins + amount
    const nextVersion = coinVersion + 1
    setCoins(nextCoins)
    setCoinVersion(nextVersion)
    try {
      await syncFandiCoins(nextCoins, nextVersion)
    } catch {
      // Offline fallback
    }
  }

  // Character unlock triggers on minigame completion
  const handleGameComplete = () => {
    // Unlock next character in sequence if locked
    setCharacters((prev) => {
      const nextLockedIndex = prev.findIndex((c) => !c.unlocked)
      if (nextLockedIndex !== -1) {
        const updated = [...prev]
        updated[nextLockedIndex] = { ...updated[nextLockedIndex], unlocked: true }
        starWarsAudio.playKyberChime(880)
        return updated
      }
      return prev
    })
  }

  // Admin Sandbox Controls
  const handleUnlockAll = () => {
    setCharacters((prev) => prev.map((c) => ({ ...c, unlocked: true })))
    starWarsAudio.playLightsaberIgnite()
  }

  const handleResetCharacters = () => {
    setCharacters(INITIAL_CHARACTERS)
  }

  const handleCharacterClick = (c: Character) => {
    setSelectedCharacter(c)
    if (c.id === 'vader') {
      starWarsAudio.playVaderBreath()
    } else if (c.id === 'luke') {
      starWarsAudio.playLightsaberIgnite()
    } else if (c.id === 'rez') {
      starWarsAudio.playBlaster()
    } else {
      starWarsAudio.playKyberChime(660)
    }
  }

  const getNewYodaWisdom = () => {
    starWarsAudio.playKyberChime(550)
    const random = YODA_WISDOMS[Math.floor(Math.random() * YODA_WISDOMS.length)]
    setYodaWisdom(random)
  }

  const handleFastPayDemo = () => {
    starWarsAudio.playBlaster()
    setFastPaySuccess(true)
    setTimeout(() => setFastPaySuccess(false), 2500)
  }

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Star Wars Galactic Header */}
      <div className="p-6 sm:p-8 rounded-[32px] glass-panel-heavy border border-cyan-500/40 shadow-2xl relative overflow-hidden bg-slate-950/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 shadow-[0_0_10px_#00E5FF]">
                <Zap className="w-3 h-3 animate-pulse" /> Sandbox Mode (Admin Only)
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                AUREBESH // 0x77A
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-400 text-shadow-md">
              Fandi Bank: Star Wars Edition
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Desbloquea los 6 hologramas galácticos para liberar el tema global de Star Wars.
            </p>
          </div>

          {/* Credits Counter Card */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-4 shrink-0 shadow-lg shadow-cyan-950/50">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_#00E5FF]">
              💎
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-cyan-400">
                Créditos Galácticos
              </p>
              <p className="text-2xl sm:text-3xl font-black text-cyan-200">
                <AnimatedNumber value={coins} formatAsCurrency={false} />
              </p>
            </div>
          </div>
        </div>

        {/* Global Theme Unlocked Alert Banner */}
        {allUnlocked && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-emerald-950/80 to-purple-950/80 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center justify-between animate-spring-scale">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400 text-black flex items-center justify-center font-black text-lg animate-bounce">
                ⚔️
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base text-cyan-200">
                  ¡Tema Global Star Wars Desbloqueado!
                </h4>
                <p className="text-xs text-zinc-300">
                  Los 6 personajes han alcanzado la maestría de la Fuerza.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-cyan-400 text-black shadow-md">
              Activo
            </span>
          </div>
        )}
      </div>

      {/* 2. Character Vault (6 Holographic Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Bóveda de Hologramas ({unlockedCount}/6)
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUnlockAll}
              className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider transition-all touch-feedback"
            >
              Desbloquear Todos (Admin)
            </button>
            <button
              onClick={handleResetCharacters}
              className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-black uppercase tracking-wider transition-all touch-feedback"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 6 Character Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {characters.map((c) => {
            const isSelected = selectedCharacter?.id === c.id
            return (
              <button
                key={c.id}
                onClick={() => handleCharacterClick(c)}
                className={`p-3.5 rounded-2xl glass-panel border transition-all text-left flex flex-col justify-between relative overflow-hidden touch-feedback ${
                  c.unlocked
                    ? isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                      : 'border-white/10 bg-slate-950/40 hover:border-white/30'
                    : 'border-white/5 bg-black/40 opacity-50'
                }`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl sm:text-3xl">{c.avatar}</span>
                  {c.unlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                </div>

                <div>
                  <h4 className="font-black text-xs text-zinc-100 truncate">{c.name}</h4>
                  <p className="text-[9px] font-bold text-zinc-500 truncate">{c.title}</p>
                </div>

                {/* Perk Glow Line */}
                <div
                  className="w-full h-1 rounded-full mt-2"
                  style={{ backgroundColor: c.unlocked ? c.color : '#334155' }}
                />
              </button>
            )
          })}
        </div>

        {/* Selected Character Perk Details Card */}
        {selectedCharacter && (
          <div
            className="p-4 sm:p-5 rounded-2xl glass-panel border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-spring-scale"
            style={{
              borderColor: `${selectedCharacter.color}50`,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl border shadow-lg"
                style={{
                  backgroundColor: `${selectedCharacter.color}20`,
                  borderColor: selectedCharacter.color,
                  boxShadow: `0 0 15px ${selectedCharacter.color}60`,
                }}
              >
                {selectedCharacter.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm sm:text-base text-zinc-100">
                    {selectedCharacter.name}
                  </h4>
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      color: selectedCharacter.color,
                      borderColor: `${selectedCharacter.color}50`,
                      backgroundColor: `${selectedCharacter.color}15`,
                    }}
                  >
                    {selectedCharacter.perk}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {selectedCharacter.perkDetail}
                </p>
                <p className="text-[11px] italic text-zinc-400 mt-1">
                  "{selectedCharacter.quote}"
                </p>
              </div>
            </div>

            {/* Interactive Perk Actions */}
            <div className="shrink-0">
              {selectedCharacter.id === 'yoda' && selectedCharacter.unlocked && (
                <button
                  onClick={getNewYodaWisdom}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all touch-feedback flex items-center gap-1.5"
                >
                  <Brain className="w-4 h-4" /> Consejo Jedi
                </button>
              )}
              {selectedCharacter.id === 'rez' && selectedCharacter.unlocked && (
                <button
                  onClick={handleFastPayDemo}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all touch-feedback flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Test Fast-Pay Blaster
                </button>
              )}
            </div>
          </div>
        )}

        {/* Yoda Wisdom Display */}
        {selectedCharacter?.id === 'yoda' && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center animate-spring-scale">
            <p className="text-xs text-cyan-300 font-serif italic">"{yodaWisdom}"</p>
          </div>
        )}

        {/* Fast Pay Success Toast */}
        {fastPaySuccess && (
          <div className="p-3 rounded-2xl bg-blue-950/80 border border-blue-400 text-center text-xs font-black text-blue-300 animate-spring-scale shadow-[0_0_20px_#3B82F6]">
            ⚡ ¡Pago Instantáneo Blaster Ejecutado con Éxito!
          </div>
        )}
      </div>

      {/* 3. Minigames Suite Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-zinc-200 tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Arena de Mini-Juegos (5 Desafíos)
          </h3>
        </div>

        {/* 5 Game Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => setActiveGame('duel')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'duel'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">⚔️</span>
            <span>Lightsaber Duel</span>
          </button>

          <button
            onClick={() => setActiveGame('trench')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'trench'
                ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(255,30,86,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">🚀</span>
            <span>Trench Run</span>
          </button>

          <button
            onClick={() => setActiveGame('falcon')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'falcon'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">🛸</span>
            <span>Falcon Flight</span>
          </button>

          <button
            onClick={() => setActiveGame('holocron')}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'holocron'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">💠</span>
            <span>Holocron Matrix</span>
          </button>

          <button
            onClick={() => setActiveGame('cantina')}
            className={`col-span-2 sm:col-span-1 p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1.5 border touch-feedback ${
              activeGame === 'cantina'
                ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl">🍸</span>
            <span>Cantina Quick-Draw</span>
          </button>
        </div>

        {/* Render Active Game */}
        <div className="pt-2">
          {activeGame === 'duel' && (
            <LightsaberDuelGame
              onAddCoins={handleAddCoins}
              onComplete={handleGameComplete}
            />
          )}
          {activeGame === 'trench' && (
            <TrenchRunGame
              onAddCoins={handleAddCoins}
              onComplete={handleGameComplete}
            />
          )}
          {activeGame === 'falcon' && (
            <FalconFlightGame
              onAddCoins={handleAddCoins}
              onComplete={handleGameComplete}
            />
          )}
          {activeGame === 'holocron' && (
            <HolocronMemoryGame
              onAddCoins={handleAddCoins}
              onComplete={handleGameComplete}
            />
          )}
          {activeGame === 'cantina' && (
            <CantinaQuickDrawGame
              onAddCoins={handleAddCoins}
              onComplete={handleGameComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
