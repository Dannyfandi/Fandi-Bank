'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Zap,
  ShoppingBag,
  Clock,
  Target,
  ArrowLeft,
  Coins,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { SmilingFriendsGame } from './SmilingFriendsGame'
import { getFandiCoins, syncFandiCoins, requestPrize } from '@/app/dashboard/actions'
import { AnimatedNumber } from './AnimatedNumber'

interface Reward {
  name: string
  price: number
  emoji: string
}

const dict = {
  en: {
    gamesTitle: '🕹️ Games & Rewards',
    pointsDesc: 'Play mini-games to earn Fandi Coins & redeem rewards.',
    game1: 'Fandi Tap',
    game2: 'Mole Whack',
    shopTitle: 'Rewards Shop',
    redeem: 'Request',
    notEnough: 'Not enough',
    score: 'Your Coins',
    highScore: 'Best',
    combo: 'Combo',
    tapBtn: 'TAP!',
    cooldown: 'Cooling down...',
    maxRate: 'Max 50 coins/min',
    points: 'coins',
    confirmTitle: 'Confirm Prize Request',
    confirmMsg: 'Are you sure you want to spend',
    confirmOn: 'on',
    confirmWarn:
      'This action cannot be undone. Your coins will be deducted and a request will be sent to admin for approval.',
    confirmBtn: 'Yes, Request Prize',
    cancelBtn: 'Cancel',
    requesting: 'Requesting...',
    syncing: 'Saving...',
    rwdOreo: 'Oreo Cookies (4-pack)',
    rwdGummy: 'Gummy Package',
    rwdMarlboro: 'Media Marlboro Rojo',
    rwdLucky: 'Media Lucky Sandía',
    rwdIce800: 'C&W Ice Cream (800ml)',
    rwdIce15: 'C&W Ice Cream (1.5L)',
    rwdMojito: 'Bacardí Mojito (750ml)',
    rwdZombie: 'Bacardí Zombie (750ml)',
  },
  es: {
    gamesTitle: '🕹️ Juegos y Premios',
    pointsDesc: 'Juega mini-juegos para ganar Fandi Coins y canjear premios.',
    game1: 'Fandi Tap',
    game2: 'Aplastatop',
    shopTitle: 'Tienda de Premios',
    redeem: 'Solicitar',
    notEnough: 'Insuficiente',
    score: 'Tus Coins',
    highScore: 'Récord',
    combo: 'Combo',
    tapBtn: '¡TAP!',
    cooldown: 'Enfriando...',
    maxRate: 'Máx 50 coins/min',
    points: 'coins',
    confirmTitle: 'Confirmar Solicitud',
    confirmMsg: '¿Seguro que quieres gastar',
    confirmOn: 'en',
    confirmWarn:
      'Esta acción no se puede deshacer. Tus monedas se descontarán y se enviará una solicitud al admin para aprobación.',
    confirmBtn: 'Sí, Solicitar Premio',
    cancelBtn: 'Cancelar',
    requesting: 'Solicitando...',
    syncing: 'Guardando...',
    rwdOreo: 'Galletas Oreo (paq. de 4)',
    rwdGummy: 'Paquete de Gomas',
    rwdMarlboro: 'Media Marlboro Rojo',
    rwdLucky: 'Media Lucky Sandía',
    rwdIce800: 'Helado C&W (800ml)',
    rwdIce15: 'Helado C&W (1.5L)',
    rwdMojito: 'Bacardí Mojito (750ml)',
    rwdZombie: 'Bacardí Zombie (750ml)',
  },
}

export function GamesTab({
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
  const t = dict[lang] || dict.es

  const rewards: Reward[] = [
    { name: t.rwdOreo, price: 2300, emoji: '🍪' },
    { name: t.rwdGummy, price: 3500, emoji: '🍬' },
    { name: t.rwdMarlboro, price: 7000, emoji: '🚬' },
    { name: t.rwdLucky, price: 7000, emoji: '🚬' },
    { name: t.rwdIce800, price: 32900, emoji: '🍨' },
    { name: t.rwdIce15, price: 44900, emoji: '🍦' },
    { name: t.rwdMojito, price: 56000, emoji: '🍹' },
    { name: t.rwdZombie, price: 59400, emoji: '🧟' },
  ]

  const [menu, setMenu] = useState<'main' | 'fandi-tap' | 'mole-whack' | 'smiling-friends'>('main')

  // Cloud-synced coins
  const [dbCoins, setDbCoins] = useState(initialCoins)
  const [pendingCoins, setPendingCoins] = useState(0)
  const syncVersion = useRef(initialVersion)
  const isSyncing = useRef(false)
  const [syncIndicator, setSyncIndicator] = useState(false)

  // Confirmation modal
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestMsg, setRequestMsg] = useState('')

  const totalCoins = dbCoins + pendingCoins

  useEffect(() => {
    getFandiCoins().then(({ coins, version }) => {
      setDbCoins(coins)
      syncVersion.current = version
    })
  }, [])

  const flushCoins = useCallback(async () => {
    let toSync = 0
    setPendingCoins((prev) => {
      toSync = prev
      return 0
    })

    if (toSync <= 0 || isSyncing.current) {
      if (toSync > 0) setPendingCoins((prev) => prev + toSync)
      return
    }

    isSyncing.current = true
    setSyncIndicator(true)

    try {
      const result = await syncFandiCoins(toSync, syncVersion.current)
      if (result.ok) {
        setDbCoins(result.coins)
        syncVersion.current = result.version
      } else {
        setDbCoins(result.coins)
        syncVersion.current = result.version
      }
    } catch {
      setPendingCoins((prev) => prev + toSync)
    } finally {
      isSyncing.current = false
      setTimeout(() => setSyncIndicator(false), 1000)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      flushCoins()
    }, 15000)

    const handleBeforeUnload = () => {
      flushCoins()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [flushCoins])

  const addPoints = useCallback((p: number) => {
    setPendingCoins((prev) => prev + p)
  }, [])

  const handleRequestPrize = async (reward: Reward) => {
    setIsRequesting(true)
    setRequestMsg('')

    await flushCoins()
    const result = await requestPrize(reward.name, reward.price)

    if (result.success) {
      setDbCoins(result.newCoins ?? dbCoins - reward.price)
      setRequestMsg(
        '✅ ' +
          (lang === 'es'
            ? '¡Solicitud enviada! El admin revisará tu pedido.'
            : 'Request sent! Admin will review your order.')
      )
    } else {
      setRequestMsg('❌ ' + result.message)
    }

    setIsRequesting(false)
    setTimeout(() => {
      setConfirmReward(null)
      setRequestMsg('')
    }, 2500)
  }

  return (
    <div id="games-section" className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 space-y-6">
      {/* Header with Coin Count-Up */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {menu !== 'main' && (
            <button
              onClick={() => {
                flushCoins()
                setMenu('main')
              }}
              className="p-2 glass-panel hover:bg-white/10 rounded-xl transition-colors text-zinc-300 touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent text-shadow-sm">
              {lang === 'es' ? 'Juegos y Temas' : 'Games & Themes'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              {lang === 'es'
                ? 'Juega en los mundos temáticos y desbloquea temas exclusivos'
                : 'Play in themed worlds and unlock exclusive themes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {syncIndicator && (
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> {t.syncing}
            </span>
          )}
          <div className="px-4 py-2 rounded-2xl glass-panel border border-yellow-500/30 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
                Fandi Coins
              </span>
              <span className="text-base sm:text-lg font-black text-yellow-300 leading-none">
                <AnimatedNumber value={totalCoins} duration={600} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {menu === 'main' && (
        <div className="space-y-6">
          {/* Horizontal Swiping Carousel for Themed Games */}
          <div className="snap-carousel gap-4 pb-2 pt-1">
            {/* 1. Smiling Friends Dedicated World */}
            <Link
              href="/games/smiling-friends"
              className="w-[280px] sm:w-[320px] shrink-0 group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-[#eab308]/30 via-black/60 to-black border border-[#eab308]/40 hover:border-[#eab308]/70 transition-all touch-feedback flex flex-col items-center text-center justify-center aspect-[4/3] shadow-xl"
            >
              <div className="absolute inset-0 bg-[#eab308]/5 group-hover:bg-[#eab308]/10 transition-colors" />
              <span className="text-5xl sm:text-6xl mb-3 group-hover:scale-110 transition-transform block animate-bounce">
                🐸
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#eab308] text-shadow-sm">
                Smiling Friends Labs
              </h3>
              <p className="text-[11px] text-yellow-200/80 font-medium mt-1">
                {lang === 'es' ? '5 Mini-juegos · 6 Personajes · Tema Global' : '5 Minigames · 6 Characters · Global Theme'}
              </p>
            </Link>

            {/* 2. Star Wars Edition */}
            <Link
              href="/games/star-wars"
              className="w-[280px] sm:w-[320px] shrink-0 group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-cyan-900/35 via-black/60 to-black border border-cyan-500/40 hover:border-cyan-400 transition-all touch-feedback flex flex-col items-center text-center justify-center aspect-[4/3] shadow-xl"
            >
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
              <span className="text-5xl sm:text-6xl mb-3 group-hover:scale-110 transition-transform block animate-pulse">
                ⚔️
              </span>
              <h3 className="text-lg sm:text-xl font-black text-cyan-300 text-shadow-sm">
                Star Wars Edition
              </h3>
              <p className="text-[11px] text-cyan-200/80 font-medium mt-1">
                {lang === 'es' ? 'Trinchera · Halcón · Duelo de Sables · Cantina' : 'Trench Run · Falcon Flight · Saber Duel · Cantina'}
              </p>
            </Link>
          </div>
        </div>
      )}

      {menu === 'fandi-tap' && (
        <FandiTap
          gameTitle={t.game1}
          tapBtn={t.tapBtn}
          cooldown={t.cooldown}
          maxRate={t.maxRate}
          pointsLabel={t.points}
          scoreLabel={t.score}
          comboLabel={t.combo}
          highScoreLabel={t.highScore}
          points={totalCoins}
          addPoints={addPoints}
        />
      )}

      {menu === 'mole-whack' && (
        <MoleWhack
          gameTitle={t.game2}
          scoreLabel={t.score}
          pointsLabel={t.points}
          points={totalCoins}
          addPoints={addPoints}
        />
      )}

      {/* Keep Smiling Friends mounted so progress stays intact */}
      <div className={menu === 'smiling-friends' ? '' : 'hidden'}>
        <SmilingFriendsGame
          initialProgress={initialProgress}
          lang={lang}
          addPoints={addPoints}
        />
      </div>

      {/* Confirmation Modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel-heavy rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-spring-scale border border-white/20">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> {t.confirmTitle}
              </h3>
              <button
                onClick={() => {
                  setConfirmReward(null)
                  setRequestMsg('')
                }}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {requestMsg ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-100 font-bold">{requestMsg}</p>
                </div>
              ) : (
                <>
                  <div className="text-center p-4 bg-black/40 rounded-2xl border border-white/10">
                    <span className="text-4xl block mb-2">{confirmReward.emoji}</span>
                    <p className="font-black text-white text-lg">{confirmReward.name}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-1">
                      {confirmReward.price.toLocaleString()} Fandi Coins
                    </p>
                  </div>

                  <p className="text-sm text-zinc-200 text-center leading-relaxed">
                    {t.confirmMsg}{' '}
                    <strong className="text-emerald-400">
                      {confirmReward.price.toLocaleString()}
                    </strong>{' '}
                    Fandi Coins {t.confirmOn} <strong>{confirmReward.name}</strong>?
                  </p>
                  <p className="text-xs text-zinc-400 text-center leading-normal">
                    {t.confirmWarn}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setConfirmReward(null)
                        setRequestMsg('')
                      }}
                      disabled={isRequesting}
                      className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors touch-feedback"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => handleRequestPrize(confirmReward)}
                      disabled={isRequesting}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 touch-feedback shadow-lg shadow-emerald-600/30"
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> {t.requesting}
                        </>
                      ) : (
                        t.confirmBtn
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FandiTap({
  gameTitle,
  tapBtn,
  cooldown,
  maxRate,
  pointsLabel,
  scoreLabel,
  comboLabel,
  points,
  addPoints,
}: any) {
  const [combo, setCombo] = useState(0)
  const [ripples, setRipples] = useState<any[]>([])

  const pointsThisMinute = useRef(0)
  const minuteStart = useRef(0)
  const [rateLimited, setRateLimited] = useState(false)
  const comboTimer = useRef<NodeJS.Timeout | null>(null)
  const rippleId = useRef(0)

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const now = Date.now()
      if (minuteStart.current === 0 || now - minuteStart.current >= 60000) {
        minuteStart.current = now
        pointsThisMinute.current = 0
        setRateLimited(false)
      }
      if (pointsThisMinute.current >= 50) {
        setRateLimited(true)
        return
      }

      const comboBonus = Math.min(Math.floor(combo / 5), 3)
      const earned = 1 + comboBonus
      const actual = Math.min(earned, 50 - pointsThisMinute.current)

      addPoints(actual)
      pointsThisMinute.current += actual
      setCombo((c) => c + 1)

      if (comboTimer.current) clearTimeout(comboTimer.current)
      comboTimer.current = setTimeout(() => setCombo(0), 1500)

      const rect = e.currentTarget.getBoundingClientRect()
      const id = rippleId.current++
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
    },
    [combo, addPoints]
  )

  const ptsRemaining = 50 - pointsThisMinute.current
  const comboColor =
    combo >= 20
      ? 'text-red-400'
      : combo >= 10
      ? 'text-amber-400'
      : combo >= 5
      ? 'text-purple-400'
      : 'text-zinc-400'

  return (
    <div className="max-w-md mx-auto p-6 rounded-[28px] glass-panel-heavy border border-white/10 shadow-2xl space-y-5 animate-spring-scale mt-2">
      <h3 className="font-black text-xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 flex items-center justify-center gap-2">
        <Zap className="w-5 h-5 text-purple-400" /> {gameTitle}
      </h3>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            {scoreLabel}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">
            {points.toLocaleString()}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            {comboLabel}
          </p>
          <p className={`text-2xl sm:text-3xl font-black ${comboColor}`}>{combo}x</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {maxRate}
        </span>
        <span
          className={`font-bold ${
            ptsRemaining <= 10 ? 'text-red-400' : 'text-zinc-400'
          }`}
        >
          {ptsRemaining} {pointsLabel}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${(ptsRemaining / 50) * 100}%` }}
        />
      </div>
      <button
        onClick={handleTap}
        disabled={rateLimited}
        className={`relative w-full py-10 rounded-2xl text-2xl sm:text-3xl font-black tracking-wider transition-all touch-feedback overflow-hidden select-none ${
          rateLimited
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            : combo >= 20
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl shadow-red-500/30'
            : combo >= 10
            ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-2xl shadow-amber-500/30'
            : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-purple-500/30'
        }`}
      >
        {rateLimited ? cooldown : tapBtn}
        {combo >= 5 && !rateLimited && (
          <span className="absolute top-2 right-3 text-xs font-black opacity-80">
            +{1 + Math.min(Math.floor(combo / 5), 3)}
          </span>
        )}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute w-16 h-16 rounded-full bg-white/30 animate-ping pointer-events-none"
            style={{ left: r.x - 32, top: r.y - 32 }}
          />
        ))}
      </button>
    </div>
  )
}

function MoleWhack({
  gameTitle,
  scoreLabel,
  pointsLabel,
  points,
  addPoints,
}: any) {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false))
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.floor(Math.random() * 9)
      setMoles((prev) => {
        const next = [...prev]
        next[id] = true
        return next
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setMoles((prev) => {
          const next = [...prev]
          next[id] = false
          return next
        })
      }, 800)
    }, 1200)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const whack = (idx: number) => {
    if (moles[idx]) {
      addPoints(1)
      setMoles((prev) => {
        const next = [...prev]
        next[idx] = false
        return next
      })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-[28px] glass-panel-heavy border border-white/10 shadow-2xl space-y-5 animate-spring-scale mt-2">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" /> {gameTitle}
        </h3>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            {scoreLabel}
          </p>
          <p className="text-2xl font-black text-amber-400">
            {points.toLocaleString()}{' '}
            <span className="text-xs">{pointsLabel}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 aspect-square max-w-[280px] mx-auto bg-black/60 border border-white/10 p-4 rounded-2xl shadow-inner">
        {moles.map((isMole, i) => (
          <button
            key={i}
            onMouseDown={(e) => {
              e.preventDefault()
              whack(i)
            }}
            className={`w-full h-full rounded-2xl transition-all duration-75 touch-feedback shadow-inner flex items-center justify-center ${
              isMole
                ? 'bg-amber-600 hover:bg-amber-500 animate-in zoom-in spin-in-12'
                : 'bg-zinc-900/60 border border-white/5'
            }`}
          >
            {isMole && <span className="text-2xl drop-shadow-lg">🐸</span>}
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
        Rate limit: ~50 coins/min
      </p>
    </div>
  )
}
