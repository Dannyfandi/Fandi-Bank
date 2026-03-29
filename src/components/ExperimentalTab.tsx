'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, Gift, ShoppingBag, Trophy, Clock, Target, Lightbulb, Gamepad2, ArrowLeft } from 'lucide-react'
import { submitSuggestion } from '@/app/dashboard/actions'
import { SubmitButton } from './SubmitButton'

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
    expTitle: '🧪 Experimental HQ',
    back: 'Back',
    pointsSys: 'Points System',
    pointsDesc: 'Play mini-games to earn points & redeem rewards.',
    suggFeat: 'Suggest Feature',
    suggFeatDesc: 'Have an idea? Tell us!',
    suggGame: 'Suggest Game',
    suggGameDesc: 'Want a new mini-game? Recommend it.',
    game1: 'Fandi Tap',
    game2: 'Mole Whack',
    shopTitle: 'Rewards Shop',
    redeem: 'Redeem',
    notEnough: 'Not enough',
    redeemed: '✓ Redeemed!',
    score: 'Your Score',
    highScore: 'Best',
    combo: 'Combo',
    tapBtn: 'TAP!',
    cooldown: 'Cooling down...',
    maxRate: 'Max 50 pts/min',
    points: 'pts',
    submitSugg: 'Submit Suggestion',
  },
  es: {
    expTitle: '🧪 Labs Experimental',
    back: 'Volver',
    pointsSys: 'Sistema de Puntos',
    pointsDesc: 'Juega mini-juegos para ganar puntos y canjear premios.',
    suggFeat: 'Sugerir Función',
    suggFeatDesc: '¿Tienes una idea? ¡Dínosla!',
    suggGame: 'Sugerir Juego',
    suggGameDesc: '¿Quieres un nuevo mini-juego? Recomiéndalo.',
    game1: 'Fandi Tap',
    game2: 'Aplastatop',
    shopTitle: 'Tienda de Premios',
    redeem: 'Canjear',
    notEnough: 'Insuficiente',
    redeemed: '✓ ¡Canjeado!',
    score: 'Tu Puntaje',
    highScore: 'Récord',
    combo: 'Combo',
    tapBtn: '¡TAP!',
    cooldown: 'Enfriando...',
    maxRate: 'Máx 50 pts/min',
    points: 'pts',
    submitSugg: 'Enviar Sugerencia',
  }
}

export function ExperimentalTab({ lang }: { lang: 'en' | 'es' }) {
  const t = dict[lang]
  
  const [menu, setMenu] = useState<'main' | 'points' | 'fandi-tap' | 'mole-whack' | 'suggest-feature' | 'suggest-game'>('main')
  const [points, setPoints] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [suggMsg, setSuggMsg] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('fandi_game_points')
    const savedHigh = localStorage.getItem('fandi_game_high')
    if (saved) setPoints(Number(saved))
    if (savedHigh) setHighScore(Number(savedHigh))
  }, [])

  useEffect(() => {
    localStorage.setItem('fandi_game_points', String(points))
    if (points > highScore) {
      setHighScore(points)
      localStorage.setItem('fandi_game_high', String(points))
    }
  }, [points, highScore])

  const addPoints = (p: number) => setPoints(prev => prev + p)

  const handleSuggestion = async (formData: FormData) => {
    const res = await submitSuggestion(formData)
    if (res?.success) setSuggMsg(res.success)
    if (res?.error) setSuggMsg(res.error)
    setTimeout(() => {setSuggMsg(''); setMenu('main')}, 2000)
  }

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
      <div className="flex items-center gap-4 mb-6">
        {menu !== 'main' && (
          <button onClick={() => setMenu(menu === 'fandi-tap' || menu === 'mole-whack' ? 'points' : 'main')} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {t.expTitle}
        </h2>
      </div>

      {menu === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => setMenu('points')} className="text-left p-6 sm:p-8 rounded-3xl bg-emerald-900/20 hover:bg-emerald-900/30 border border-emerald-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
            <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-black text-zinc-100">{t.pointsSys}</h3>
            <p className="text-sm text-emerald-200/60 mt-2">{t.pointsDesc}</p>
          </button>
          <button onClick={() => setMenu('suggest-feature')} className="text-left p-6 sm:p-8 rounded-3xl bg-blue-900/20 hover:bg-blue-900/30 border border-blue-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all" />
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-black text-zinc-100">{t.suggFeat}</h3>
            <p className="text-sm text-blue-200/60 mt-2">{t.suggFeatDesc}</p>
          </button>
          <button onClick={() => setMenu('suggest-game')} className="text-left p-6 sm:p-8 rounded-3xl bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full group-hover:bg-purple-500/20 transition-all" />
            <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-black text-zinc-100">{t.suggGame}</h3>
            <p className="text-sm text-purple-200/60 mt-2">{t.suggGameDesc}</p>
          </button>
        </div>
      )}

      {(menu === 'suggest-feature' || menu === 'suggest-game') && (
        <form action={handleSuggestion} className="max-w-xl p-6 sm:p-8 border border-white/10 bg-zinc-900/40 backdrop-blur-[40px] rounded-3xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <input type="hidden" name="type" value={menu === 'suggest-feature' ? 'feature' : 'game'} />
          <h3 className="text-xl font-black text-white">{menu === 'suggest-feature' ? t.suggFeat : t.suggGame}</h3>
          <textarea name="description" rows={4} required placeholder="Describe your idea in detail..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-purple-500 outline-none resize-none" />
          <SubmitButton className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-xl text-white font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)]">{t.submitSugg}</SubmitButton>
          {suggMsg && <p className="text-sm text-purple-400 font-bold text-center mt-2">{suggMsg}</p>}
        </form>
      )}

      {menu === 'points' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setMenu('fandi-tap')} className="group relative overflow-hidden rounded-3xl aspect-[4/3] border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-900/40 to-black hover:border-purple-500/50 transition-all hover:scale-[1.02]">
             <Zap className="w-16 h-16 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">{t.game1}</h3>
          </button>
          <button onClick={() => setMenu('mole-whack')} className="group relative overflow-hidden rounded-3xl aspect-[4/3] border border-white/10 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-900/40 to-black hover:border-amber-500/50 transition-all hover:scale-[1.02]">
             <Target className="w-16 h-16 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{t.game2}</h3>
          </button>
          <div className="p-6 rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-4 lg:col-span-1 sm:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-zinc-200">
                <ShoppingBag className="w-5 h-5 text-emerald-400" /> {t.shopTitle}
              </h3>
              <div className="text-xl font-black text-emerald-400">{points.toLocaleString()} <span className="text-xs text-zinc-500 uppercase">{t.points}</span></div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {rewards.map(r => {
                const canAfford = points >= r.price
                return (
                  <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{r.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-zinc-200 text-xs truncate block">{r.name}</span>
                        <span className="text-[10px] text-zinc-500 font-bold">{r.price.toLocaleString()} {t.points}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (canAfford) {
                          setPoints(prev => prev - r.price)
                          alert('Redeemed: ' + r.name + '! Inform admin to receive it.')
                        }
                      }}
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

      {menu === 'fandi-tap' && <FandiTap gameTitle={t.game1} tapBtn={t.tapBtn} cooldown={t.cooldown} maxRate={t.maxRate} pointsLabel={t.points} scoreLabel={t.score} comboLabel={t.combo} highScoreLabel={t.highScore} points={points} addPoints={addPoints} />}
      
      {menu === 'mole-whack' && <MoleWhack gameTitle={t.game2} scoreLabel={t.score} pointsLabel={t.points} points={points} addPoints={addPoints} />}
      
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
    // Spawns a mole every ~1.2s. Keeps it for 800ms.
    // Max earning rate naturally limits to ~50 pts/min since 60s / 1.2s = 50.
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
      <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Natural rate limit: ~50 pts/min</p>
    </div>
  )
}
