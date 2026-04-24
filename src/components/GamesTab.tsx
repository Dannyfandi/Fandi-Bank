'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, ShoppingBag, Clock, Target, ArrowLeft, Coins, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { SmilingFriendsGame } from './SmilingFriendsGame'
import { getFandiCoins, syncFandiCoins, requestPrize } from '@/app/dashboard/actions'

interface Reward {
  name: string
  price: number
  emoji: string
}

const rewards: Reward[] = [
  { name: 'Oreo Cookies (4-pack)', price: 2300, emoji: '🍪' },
  { name: 'Gummy Package', price: 3500, emoji: '🍬' },
  { name: 'Crepes & Waffles Ice Cream (800ml)', price: 32900, emoji: '🍨' },
  { name: 'Crepes & Waffles Ice Cream (1.5L)', price: 44900, emoji: '🍦' },
  { name: 'Bacardí Mojito (750ml)', price: 56000, emoji: '🍹' },
  { name: 'Bacardí Zombie (750ml)', price: 59400, emoji: '🧟' },
]

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
    confirmWarn: 'This action cannot be undone. Your coins will be deducted and a request will be sent to admin for approval.',
    confirmBtn: 'Yes, Request Prize',
    cancelBtn: 'Cancel',
    requesting: 'Requesting...',
    syncing: 'Saving...',
    pendingLabel: 'Pending requests',
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
    confirmWarn: 'Esta acción no se puede deshacer. Tus monedas se descontarán y se enviará una solicitud al admin para aprobación.',
    confirmBtn: 'Sí, Solicitar Premio',
    cancelBtn: 'Cancelar',
    requesting: 'Solicitando...',
    syncing: 'Guardando...',
    pendingLabel: 'Solicitudes pendientes',
  }
}

export function GamesTab({ lang, initialProgress, initialCoins = 0, initialVersion = 0 }: { lang: 'en' | 'es', initialProgress?: any, initialCoins?: number, initialVersion?: number }) {
  const t = dict[lang]
  
  const [menu, setMenu] = useState<'main' | 'fandi-tap' | 'mole-whack' | 'smiling-friends'>('main')
  
  // Cloud-synced coins
  const [dbCoins, setDbCoins] = useState(initialCoins)
  const [pendingCoins, setPendingCoins] = useState(0)  // buffer: not yet sent to server
  const syncVersion = useRef(initialVersion)
  const isSyncing = useRef(false)
  const [syncIndicator, setSyncIndicator] = useState(false)
  
  // Confirmation modal
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestMsg, setRequestMsg] = useState('')

  // Total visible coins = what's confirmed in DB + what's pending locally
  const totalCoins = dbCoins + pendingCoins

  // Load coins from server on mount (in case SSR data is stale)
  useEffect(() => {
    getFandiCoins().then(({ coins, version }) => {
      setDbCoins(coins)
      syncVersion.current = version
    })
  }, [])

  // Sync buffer to server every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      flushCoins()
    }, 15000)

    // Also sync on page unload
    const handleBeforeUnload = () => {
      flushCoins()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flushCoins = useCallback(async () => {
    // Grab current pending and reset immediately so new earnings go to next batch
    let toSync = 0
    setPendingCoins(prev => {
      toSync = prev
      return 0
    })

    if (toSync <= 0 || isSyncing.current) {
      if (toSync > 0) setPendingCoins(prev => prev + toSync) // put them back
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
        // Version mismatch or error — coins are still in DB, refresh state
        setDbCoins(result.coins)
        syncVersion.current = result.version
        // Don't put coins back since they were likely already counted from another device
      }
    } catch {
      // Network error: put coins back in pending buffer for next cycle
      setPendingCoins(prev => prev + toSync)
    } finally {
      isSyncing.current = false
      setTimeout(() => setSyncIndicator(false), 1000)
    }
  }, [])

  const addPoints = useCallback((p: number) => {
    setPendingCoins(prev => prev + p)
  }, [])

  // Prize request flow
  const handleRequestPrize = async (reward: Reward) => {
    setIsRequesting(true)
    setRequestMsg('')

    // First flush any pending coins so DB is up to date
    await flushCoins()

    const result = await requestPrize(reward.name, reward.price)
    
    if (result.success) {
      setDbCoins(result.newCoins ?? (dbCoins - reward.price))
      setRequestMsg('✅ ' + (lang === 'es' ? '¡Solicitud enviada! El admin revisará tu pedido.' : 'Request sent! Admin will review your order.'))
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
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
      <div className="flex items-center gap-4 mb-6">
        {menu !== 'main' && (
          <button onClick={() => { flushCoins(); setMenu('main') }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.gamesTitle}
        </h2>
        {syncIndicator && (
          <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> {t.syncing}
          </span>
        )}
      </div>

      {menu === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Smiling Friends (Newest) */}
          <button onClick={() => setMenu('smiling-friends')} className="group relative overflow-hidden rounded-3xl aspect-[4/3] border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#eab308]/40 to-black hover:border-[#eab308]/50 transition-all hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
             <span className="text-6xl mb-4 group-hover:scale-110 transition-transform block">😁</span>
             <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-red-400 text-center">Smiling Friends Labs</h3>
          </button>
          
          {/* Mole Whack */}
          <button onClick={() => setMenu('mole-whack')} className="group relative overflow-hidden rounded-3xl aspect-[4/3] border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-900/40 to-black hover:border-amber-500/50 transition-all hover:scale-[1.02]">
             <Target className="w-16 h-16 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{t.game2}</h3>
          </button>
          
          {/* Fandi Tap */}
          <button onClick={() => setMenu('fandi-tap')} className="group relative overflow-hidden rounded-3xl aspect-[4/3] border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-900/40 to-black hover:border-purple-500/50 transition-all hover:scale-[1.02]">
             <Zap className="w-16 h-16 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">{t.game1}</h3>
          </button>

          {/* Rewards Shop */}
          <div className="p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-4 lg:col-span-3 sm:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-zinc-200">
                <ShoppingBag className="w-5 h-5 text-emerald-400" /> {t.shopTitle}
              </h3>
              <div className="text-xl font-black text-emerald-400 flex items-center gap-2">
                 <Coins className="w-5 h-5" />
                 {totalCoins.toLocaleString()} <span className="text-xs text-zinc-500 uppercase">Fandi Coins</span>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {rewards.map(r => {
                const canAfford = totalCoins >= r.price
                return (
                  <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{r.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-200 text-xs truncate block">{r.name}</span>
                        <span className="text-[10px] text-emerald-500/70 font-bold">{r.price.toLocaleString()} Fandi Coins</span>
                      </div>
                    </div>
                    <button
                      onClick={() => canAfford && setConfirmReward(r)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                        canAfford ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? t.redeem : t.notEnough}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {menu === 'fandi-tap' && <FandiTap gameTitle={t.game1} tapBtn={t.tapBtn} cooldown={t.cooldown} maxRate={t.maxRate} pointsLabel={t.points} scoreLabel={t.score} comboLabel={t.combo} highScoreLabel={t.highScore} points={totalCoins} addPoints={addPoints} />}
      
      {menu === 'mole-whack' && <MoleWhack gameTitle={t.game2} scoreLabel={t.score} pointsLabel={t.points} points={totalCoins} addPoints={addPoints} />}

      {menu === 'smiling-friends' && <SmilingFriendsGame initialProgress={initialProgress} lang={lang} />}

      {/* Confirmation Modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> {t.confirmTitle}
              </h3>
              <button onClick={() => { setConfirmReward(null); setRequestMsg('') }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {requestMsg ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-200 font-bold">{requestMsg}</p>
                </div>
              ) : (
                <>
                  <div className="text-center p-4 bg-black/30 rounded-xl border border-white/5">
                    <span className="text-4xl block mb-2">{confirmReward.emoji}</span>
                    <p className="font-black text-white text-lg">{confirmReward.name}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-1">{confirmReward.price.toLocaleString()} Fandi Coins</p>
                  </div>

                  <p className="text-sm text-zinc-300 text-center">
                    {t.confirmMsg} <strong className="text-emerald-400">{confirmReward.price.toLocaleString()}</strong> Fandi Coins {t.confirmOn} <strong>{confirmReward.name}</strong>?
                  </p>
                  <p className="text-xs text-zinc-500 text-center">
                    {t.confirmWarn}
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setConfirmReward(null); setRequestMsg('') }} 
                      disabled={isRequesting}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
                    >
                      {t.cancelBtn}
                    </button>
                    <button 
                      onClick={() => handleRequestPrize(confirmReward)}
                      disabled={isRequesting}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isRequesting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t.requesting}</>
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

// ---------------------------------------------------- //
// Fandi Tap Subcomponent
// ---------------------------------------------------- //

function FandiTap({ gameTitle, tapBtn, cooldown, maxRate, pointsLabel, scoreLabel, comboLabel, highScoreLabel, points, addPoints }: any) {
  const [combo, setCombo] = useState(0)
  const [ripples, setRipples] = useState<any[]>([])
  
  const pointsThisMinute = useRef(0)
  const minuteStart = useRef(Date.now())
  const [rateLimited, setRateLimited] = useState(false)
  const comboTimer = useRef<NodeJS.Timeout | null>(null)
  const rippleId = useRef(0)

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now()
    if (now - minuteStart.current >= 60000) {
      minuteStart.current = now; pointsThisMinute.current = 0; setRateLimited(false)
    }
    if (pointsThisMinute.current >= 50) {
      setRateLimited(true); return
    }
    
    const comboBonus = Math.min(Math.floor(combo / 5), 3)
    const earned = 1 + comboBonus
    const actual = Math.min(earned, 50 - pointsThisMinute.current)
    
    addPoints(actual)
    pointsThisMinute.current += actual
    setCombo(c => c + 1)
    
    if (comboTimer.current) clearTimeout(comboTimer.current)
    comboTimer.current = setTimeout(() => setCombo(0), 1500)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const id = rippleId.current++
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }, [combo, addPoints])

  const ptsRemaining = 50 - pointsThisMinute.current
  const comboColor = combo >= 20 ? 'text-red-400' : combo >= 10 ? 'text-amber-400' : combo >= 5 ? 'text-purple-400' : 'text-zinc-400'

  return (
    <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-6 animate-in zoom-in-95 duration-300 mt-2">
      <h3 className="font-black text-xl text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 flex items-center justify-center gap-2">
        <Zap className="w-5 h-5 text-purple-500" /> {gameTitle}
      </h3>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-4 rounded-xl bg-black/30 border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{scoreLabel}</p>
          <p className="text-3xl font-black text-purple-400">{points.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-black/30 border border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{comboLabel}</p>
          <p className={`text-3xl font-black ${comboColor}`}>{combo}x</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {maxRate}</span>
        <span className={`font-bold ${ptsRemaining <= 10 ? 'text-red-400' : 'text-zinc-500'}`}>{ptsRemaining} {pointsLabel}</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${(ptsRemaining / 50) * 100}%` }} />
      </div>
      <button onClick={handleTap} disabled={rateLimited} className={`relative w-full py-12 rounded-2xl text-3xl font-black tracking-wider transition-all active:scale-95 overflow-hidden select-none ${rateLimited ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : combo >= 20 ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl shadow-red-500/30 hover:from-red-500 hover:to-orange-500' : combo >= 10 ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-2xl shadow-amber-500/30 hover:from-amber-500 hover:to-yellow-400' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-purple-500/30 hover:from-purple-500 hover:to-fuchsia-500'}`}>
        {rateLimited ? cooldown : tapBtn}
        {combo >= 5 && !rateLimited && <span className="absolute top-2 right-3 text-sm font-black opacity-70">+{1 + Math.min(Math.floor(combo / 5), 3)}</span>}
        {ripples.map(r => <span key={r.id} className="absolute w-16 h-16 rounded-full bg-white/30 animate-ping pointer-events-none" style={{ left: r.x - 32, top: r.y - 32 }} />)}
      </button>
    </div>
  )
}

// ---------------------------------------------------- //
// Mole Whack Subcomponent
// ---------------------------------------------------- //

function MoleWhack({ gameTitle, scoreLabel, pointsLabel, points, addPoints }: any) {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false))
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.floor(Math.random() * 9)
      setMoles(prev => {
        const next = [...prev]
        next[id] = true
        return next
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setMoles(prev => {
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
      setMoles(prev => {
        const next = [...prev]
        next[idx] = false
        return next
      })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-6 animate-in zoom-in-95 duration-300 mt-2">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" /> {gameTitle}
        </h3>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{scoreLabel}</p>
          <p className="text-2xl font-black text-amber-400">{points.toLocaleString()} <span className="text-xs">{pointsLabel}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 aspect-square max-w-[280px] mx-auto bg-black border border-white/5 p-4 rounded-2xl shadow-inner">
        {moles.map((isMole, i) => (
          <button
            key={i}
            onMouseDown={(e) => { e.preventDefault(); whack(i) }}
            className={`w-full h-full rounded-full transition-all duration-75 active:scale-90 shadow-inner flex items-center justify-center ${isMole ? 'bg-amber-600 hover:bg-amber-500 animate-in zoom-in spin-in-12' : 'bg-zinc-800'}`}
          >
            {isMole && <span className="text-2xl drop-shadow-lg">🐸</span>}
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Natural rate limit: ~50 coins/min</p>
    </div>
  )
}
