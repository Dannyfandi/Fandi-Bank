'use client'

import { useState } from 'react'
import {
  Shield,
  Zap,
  Sparkles,
  Award,
  Lock,
  Unlock,
  Coins,
  Brain,
  Rocket,
  Compass,
  Crosshair,
  RotateCcw,
  Star,
  Send,
  HelpCircle,
} from 'lucide-react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { starWarsAudio } from '@/utils/starWarsAudio'
import { LightsaberDuelGame } from './LightsaberDuelGame'
import { TrenchRunGame } from './TrenchRunGame'
import { FalconFlightGame } from './FalconFlightGame'
import { HolocronMemoryGame } from './HolocronMemoryGame'
import { CantinaQuickDrawGame } from './CantinaQuickDrawGame'
import { syncFandiCoins, updateTheme } from '@/app/dashboard/actions'

export interface StarWarsCharacter {
  id: string
  name: string
  title: string
  image: string
  color: string
  cost: number
  perk: string
  perkDetail: string
  unlocked: boolean
  quote: string
}

const INITIAL_CHARACTERS: StarWarsCharacter[] = [
  {
    id: 'luke',
    name: 'Luke Skywalker',
    title: 'Caballero Jedi',
    image: '/star-wars/luke.svg',
    color: '#00FF66',
    cost: 250,
    perk: 'Aura Verde de Sable de Luz',
    perkDetail: 'Iluminación esmeralda en el balance y tarjetas activas. Toca para encender el sable.',
    unlocked: false,
    quote: 'Soy un Jedi, como mi padre antes que yo.',
  },
  {
    id: 'vader',
    name: 'Darth Vader',
    title: 'Lord Sith',
    image: '/star-wars/vader.svg',
    color: '#FF1E56',
    cost: 450,
    perk: 'Bordes Carmesí Sith & Respiración SFX',
    perkDetail: 'Efecto de sonido de respiración mecánica Sith al tocar las tarjetas.',
    unlocked: false,
    quote: 'Subestimas el poder del Lado Oscuro.',
  },
  {
    id: 'yoda',
    name: 'Master Yoda',
    title: 'Gran Maestro',
    image: '/star-wars/yoda.svg',
    color: '#00E5FF',
    cost: 650,
    perk: 'Widget de Sabiduría Jedi',
    perkDetail: 'Consejos financieros y de paz mental interactivos con la Fuerza.',
    unlocked: false,
    quote: 'Hazlo o no lo hagas, pero no lo intentes.',
  },
  {
    id: 'ahsoka',
    name: 'Ahsoka Tano',
    title: 'Fulcrum',
    image: '/star-wars/ahsoka.svg',
    color: '#FFFFFF',
    cost: 850,
    perk: 'Gestos Rápidos de Doble Sable',
    perkDetail: 'Navegación veloz y fluidos accesos directos táctiles.',
    unlocked: false,
    quote: 'No soy una Jedi.',
  },
  {
    id: 'rez',
    name: 'Commander Rex',
    title: 'Capitán Clon',
    image: '/star-wars/rex.svg',
    color: '#3B82F6',
    cost: 1100,
    perk: 'Acción Rápida Blaster Fast-Pay',
    perkDetail: 'Botón de amortización rápida con sonido de disparo láser.',
    unlocked: false,
    quote: 'La experiencia supera a la suerte.',
  },
  {
    id: 'obiwan',
    name: 'Obi-Wan Kenobi',
    title: 'Maestro Jedi',
    image: '/star-wars/obiwan.svg',
    color: '#FFB800',
    cost: 1400,
    perk: 'Cabecera Flotante del Terreno Alto',
    perkDetail: 'Barra de navegación elevada fija con claridad de la Fuerza.',
    unlocked: false,
    quote: 'La Fuerza estará contigo, siempre.',
  },
]

const YODA_WISDOMS = [
  'Hazlo o no lo hagas, pero no lo intentes.',
  'Paga tus deudas primero, la paz mental llegará.',
  'Paciencia debes tener, joven padawan.',
  'Una deuda saldada es una carga liberada hacia la luz.',
  'El miedo a la pérdida es un camino hacia el lado oscuro.',
]

export function StarWarsArena({
  initialCoins = 250,
  initialVersion = 0,
}: {
  initialCoins?: number
  initialVersion?: number
}) {
  const [coins, setCoins] = useState(initialCoins)
  const [coinVersion, setCoinVersion] = useState(initialVersion)
  const [characters, setCharacters] = useState<StarWarsCharacter[]>(INITIAL_CHARACTERS)
  const [activeGame, setActiveGame] = useState<
    'duel' | 'trench' | 'falcon' | 'holocron' | 'cantina'
  >('duel')
  const [yodaWisdom, setYodaWisdom] = useState(YODA_WISDOMS[0])
  const [fastPaySuccess, setFastPaySuccess] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<StarWarsCharacter | null>(null)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const unlockedCount = characters.filter((c) => c.unlocked).length
  const allUnlocked = unlockedCount === 6

  // Coin Handler with Server Sync
  const handleAddCoins = async (amount: number) => {
    const nextCoins = coins + amount
    const nextVersion = coinVersion + 1
    setCoins(nextCoins)
    setCoinVersion(nextVersion)
    try {
      await syncFandiCoins(nextCoins, nextVersion)
    } catch {
      // offline fallback
    }
  }

  // Spend Coins to Unlock Character
  const handleUnlockWithCoins = async (charId: string) => {
    const target = characters.find((c) => c.id === charId)
    if (!target || target.unlocked) return
    if (coins < target.cost) return

    const nextCoins = coins - target.cost
    const nextVersion = coinVersion + 1
    setCoins(nextCoins)
    setCoinVersion(nextVersion)
    await syncFandiCoins(nextCoins, nextVersion)

    const updated = characters.map((c) =>
      c.id === charId ? { ...c, unlocked: true } : c
    )
    setCharacters(updated)
    setSelectedCharacter(updated.find((c) => c.id === charId) || null)
    starWarsAudio.playKyberChime(880)

    if (updated.every((c) => c.unlocked)) {
      await updateTheme('star_wars')
    }
  }

  // Admin Sandbox Quick Unlock All
  const handleUnlockAll = async () => {
    const updated = characters.map((c) => ({ ...c, unlocked: true }))
    setCharacters(updated)
    starWarsAudio.playLightsaberIgnite()
    await updateTheme('star_wars')
  }

  const handleResetCharacters = () => {
    setCharacters(INITIAL_CHARACTERS)
    setSelectedCharacter(null)
  }

  const handleCharacterClick = (c: StarWarsCharacter) => {
    setSelectedCharacter(c)
    if (c.unlocked) {
      if (c.id === 'vader') starWarsAudio.playVaderBreath()
      else if (c.id === 'luke') starWarsAudio.playLightsaberIgnite()
      else if (c.id === 'rez') starWarsAudio.playBlaster()
      else starWarsAudio.playKyberChime(660)
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
      <div className="p-6 sm:p-8 rounded-[32px] glass-panel-heavy border border-cyan-500/40 shadow-2xl relative overflow-hidden bg-slate-950/90">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/15 rounded-full blur-[100px] pointer-events-none" />

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
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 text-shadow-md">
              Fandi Bank: Star Wars Edition
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Juega los mini-juegos, gana Fandi Coins y desbloquea los 6 hologramas misteriosos.
            </p>
          </div>

          {/* Credits Counter Card */}
          <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex items-center gap-4 shrink-0 shadow-lg shadow-cyan-950/60">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_#00E5FF]">
              💎
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-cyan-400">
                Tus Fandi Coins
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
                  Ya puedes activarlo en Apariencia y Temas en todo el banco.
                </p>
              </div>
            </div>
            <button
              onClick={() => updateTheme('star_wars')}
              className="text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl bg-cyan-400 text-black shadow-md hover:bg-cyan-300 transition-colors touch-feedback"
            >
              Aplicar Tema Ahora
            </button>
          </div>
        )}
      </div>

      {/* 2. Character Vault (Mystery Holograms with Image Support) */}
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
          {characters.map((c, idx) => {
            const isSelected = selectedCharacter?.id === c.id
            const canAfford = coins >= c.cost
            const hasImgError = imgErrors[c.id]

            return (
              <button
                key={c.id}
                onClick={() => handleCharacterClick(c)}
                className={`p-3 rounded-2xl glass-panel border transition-all text-left flex flex-col justify-between relative overflow-hidden touch-feedback ${
                  c.unlocked
                    ? isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                      : 'border-white/15 bg-slate-950/60 hover:border-white/30'
                    : 'border-white/5 bg-black/60 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Character Image / Secret Silhouette */}
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-black/50 relative flex items-center justify-center border border-white/10">
                  {c.unlocked ? (
                    !hasImgError ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        onError={() => setImgErrors((prev) => ({ ...prev, [c.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-black text-2xl"
                        style={{ color: c.color }}
                      >
                        ⚔️
                      </div>
                    )
                  ) : (
                    /* Encrypted Silhouette */
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/80 p-2 text-center">
                      <Lock className="w-6 h-6 text-zinc-600 mb-1 animate-pulse" />
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        Holograma #{idx + 1}
                      </span>
                    </div>
                  )}

                  {/* Lock / Unlock status pill */}
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md">
                    {c.unlocked ? (
                      <Unlock className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* Character Name or Encrypted Title */}
                <div>
                  <h4 className="font-black text-xs text-zinc-100 truncate">
                    {c.unlocked ? c.name : '??? Encriptado'}
                  </h4>
                  <p className="text-[9px] font-bold text-zinc-500 truncate">
                    {c.unlocked ? c.title : `${c.cost} Coins`}
                  </p>
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

        {/* Selected Character / Unlock Action Drawer */}
        {selectedCharacter && (
          <div
            className="p-4 sm:p-6 rounded-2xl glass-panel border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-spring-scale"
            style={{
              borderColor: selectedCharacter.unlocked
                ? `${selectedCharacter.color}50`
                : 'rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center border shadow-lg shrink-0 bg-black"
                style={{
                  borderColor: selectedCharacter.unlocked
                    ? selectedCharacter.color
                    : '#475569',
                }}
              >
                {selectedCharacter.unlocked ? (
                  !imgErrors[selectedCharacter.id] ? (
                    <img
                      src={selectedCharacter.image}
                      alt={selectedCharacter.name}
                      onError={() =>
                        setImgErrors((prev) => ({
                          ...prev,
                          [selectedCharacter.id]: true,
                        }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">⚔️</span>
                  )
                ) : (
                  <Lock className="w-8 h-8 text-zinc-600" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-base text-zinc-100">
                    {selectedCharacter.unlocked
                      ? selectedCharacter.name
                      : 'Holograma Encriptado (???)'}
                  </h4>
                  {selectedCharacter.unlocked && (
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
                  )}
                </div>

                <p className="text-xs text-zinc-300 mt-1">
                  {selectedCharacter.unlocked
                    ? selectedCharacter.perkDetail
                    : `Desbloquea este holograma legendario por ${selectedCharacter.cost} Fandi Coins para revelar su verdadera identidad y recompensa.`}
                </p>

                {selectedCharacter.unlocked && (
                  <p className="text-[11px] italic text-zinc-400 mt-1">
                    "{selectedCharacter.quote}"
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex items-center gap-2">
              {!selectedCharacter.unlocked ? (
                <button
                  onClick={() => handleUnlockWithCoins(selectedCharacter.id)}
                  disabled={coins < selectedCharacter.cost}
                  className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all touch-feedback flex items-center gap-2 shadow-lg ${
                    coins >= selectedCharacter.cost
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/25'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Coins className="w-4 h-4" /> Desbloquear ({selectedCharacter.cost} Coins)
                </button>
              ) : (
                <>
                  {selectedCharacter.id === 'yoda' && (
                    <button
                      onClick={getNewYodaWisdom}
                      className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all touch-feedback flex items-center gap-1.5"
                    >
                      <Brain className="w-4 h-4" /> Consejo Jedi
                    </button>
                  )}
                  {selectedCharacter.id === 'rez' && (
                    <button
                      onClick={handleFastPayDemo}
                      className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-black uppercase tracking-wider transition-all touch-feedback flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Test Fast-Pay Blaster
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Yoda Wisdom Message */}
        {selectedCharacter?.id === 'yoda' && selectedCharacter.unlocked && (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-center animate-spring-scale">
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
            <span>Holocron Matrix (100 Lvl)</span>
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

        {/* Active Game Stage */}
        <div className="pt-2">
          {activeGame === 'duel' && <LightsaberDuelGame onAddCoins={handleAddCoins} />}
          {activeGame === 'trench' && <TrenchRunGame onAddCoins={handleAddCoins} />}
          {activeGame === 'falcon' && <FalconFlightGame onAddCoins={handleAddCoins} />}
          {activeGame === 'holocron' && <HolocronMemoryGame onAddCoins={handleAddCoins} />}
          {activeGame === 'cantina' && <CantinaQuickDrawGame onAddCoins={handleAddCoins} />}
        </div>
      </div>
    </div>
  )
}
