'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, Gift, ShoppingBag, Trophy, Clock } from 'lucide-react'

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
    expTitle: '🧪 Experimental',
    gameTitle: 'Fandi Tap',
    gameDesc: 'Tap as fast as you can! Earn points to redeem for snacks & drinks.',
    tapBtn: 'TAP!',
    points: 'pts',
    rate: 'pts/min',
    maxRate: 'Max 50 pts/min',
    cooldown: 'Cooling down...',
    shopTitle: 'Rewards Shop',
    redeem: 'Redeem',
    notEnough: 'Not enough',
    redeemed: '✓ Redeemed!',
    score: 'Your Score',
    highScore: 'Best',
    combo: 'Combo',
  },
  es: {
    expTitle: '🧪 Experimental',
    gameTitle: 'Fandi Tap',
    gameDesc: '¡Toca lo más rápido que puedas! Gana puntos y cámbialos por snacks y bebidas.',
    tapBtn: '¡TAP!',
    points: 'pts',
    rate: 'pts/min',
    maxRate: 'Máx 50 pts/min',
    cooldown: 'Enfriando...',
    shopTitle: 'Tienda de Premios',
    redeem: 'Canjear',
    notEnough: 'Insuficiente',
    redeemed: '✓ ¡Canjeado!',
    score: 'Tu Puntaje',
    highScore: 'Récord',
    combo: 'Combo',
  }
}

interface ExperimentalTabProps {
  lang: 'en' | 'es'
}

export function ExperimentalTab({ lang }: ExperimentalTabProps) {
  const t = dict[lang]
  
  const [points, setPoints] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [redeemed, setRedeemed] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{id: number; x: number; y: number}[]>([])
  
  // Rate limiting: max 50 pts per minute
  const pointsThisMinute = useRef(0)
  const minuteStart = useRef(Date.now())
  const [rateLimited, setRateLimited] = useState(false)
  const comboTimer = useRef<NodeJS.Timeout | null>(null)
  const rippleId = useRef(0)

  // Load saved points from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fandi_game_points')
    const savedHigh = localStorage.getItem('fandi_game_high')
    if (saved) setPoints(Number(saved))
    if (savedHigh) setHighScore(Number(savedHigh))
  }, [])

  // Save points
  useEffect(() => {
    localStorage.setItem('fandi_game_points', String(points))
    if (points > highScore) {
      setHighScore(points)
      localStorage.setItem('fandi_game_high', String(points))
    }
  }, [points, highScore])

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now()
    
    // Reset minute counter if a minute has passed
    if (now - minuteStart.current >= 60000) {
      minuteStart.current = now
      pointsThisMinute.current = 0
      setRateLimited(false)
    }
    
    // Check rate limit
    if (pointsThisMinute.current >= 50) {
      setRateLimited(true)
      return
    }
    
    // Calculate points: base 1 + combo bonus
    const comboBonus = Math.min(Math.floor(combo / 5), 3) // max +3 bonus from combo
    const earned = 1 + comboBonus
    const actual = Math.min(earned, 50 - pointsThisMinute.current) // don't exceed limit
    
    setPoints(p => p + actual)
    pointsThisMinute.current += actual
    setCombo(c => {
      const newCombo = c + 1
      if (newCombo > maxCombo) setMaxCombo(newCombo)
      return newCombo
    })
    
    // Reset combo after 1.5s of no tapping
    if (comboTimer.current) clearTimeout(comboTimer.current)
    comboTimer.current = setTimeout(() => setCombo(0), 1500)
    
    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = rippleId.current++
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }, [combo, maxCombo])

  const handleRedeem = (reward: Reward) => {
    if (points >= reward.price) {
      setPoints(p => p - reward.price)
      setRedeemed(reward.name)
      setTimeout(() => setRedeemed(null), 3000)
    }
  }

  const ptsRemaining = 50 - pointsThisMinute.current
  const comboColor = combo >= 20 ? 'text-red-400' : combo >= 10 ? 'text-amber-400' : combo >= 5 ? 'text-purple-400' : 'text-zinc-400'

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
      <h2 className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">
        {t.expTitle}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Game Card */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-4">
          <div>
            <h3 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" /> {t.gameTitle}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">{t.gameDesc}</p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.score}</p>
              <p className="text-2xl sm:text-3xl font-black text-purple-400">{points.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.combo}</p>
              <p className={`text-2xl sm:text-3xl font-black ${comboColor}`}>{combo}x</p>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.highScore}</p>
              <p className="text-2xl sm:text-3xl font-black text-zinc-400">{highScore.toLocaleString()}</p>
            </div>
          </div>

          {/* Rate Limit Indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {t.maxRate}</span>
            <span className={`font-bold ${ptsRemaining <= 10 ? 'text-red-400' : 'text-zinc-500'}`}>
              {ptsRemaining} {t.points} left
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${(ptsRemaining / 50) * 100}%` }} />
          </div>

          {/* TAP Button */}
          <button
            onClick={handleTap}
            disabled={rateLimited}
            className={`relative w-full py-8 sm:py-10 rounded-2xl text-2xl sm:text-3xl font-black tracking-wider transition-all active:scale-95 overflow-hidden select-none ${
              rateLimited
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : combo >= 20
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl shadow-red-500/30 hover:from-red-500 hover:to-orange-500'
                : combo >= 10
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-2xl shadow-amber-500/30 hover:from-amber-500 hover:to-yellow-400'
                : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-purple-500/30 hover:from-purple-500 hover:to-fuchsia-500'
            }`}
          >
            {rateLimited ? t.cooldown : t.tapBtn}
            {combo >= 5 && !rateLimited && (
              <span className="absolute top-2 right-3 text-sm font-black opacity-70">+{1 + Math.min(Math.floor(combo / 5), 3)}</span>
            )}
            {/* Ripples */}
            {ripples.map(r => (
              <span
                key={r.id}
                className="absolute w-16 h-16 rounded-full bg-white/30 animate-ping pointer-events-none"
                style={{ left: r.x - 32, top: r.y - 32 }}
              />
            ))}
          </button>
        </div>

        {/* Rewards Shop */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-zinc-200">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> {t.shopTitle}
          </h3>
          
          {redeemed && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-bold text-center animate-in fade-in slide-in-from-top-2">
              {t.redeemed} {redeemed}
            </div>
          )}

          <div className="space-y-2">
            {rewards.map(r => {
              const canAfford = points >= r.price
              return (
                <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{r.emoji}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-200 text-sm truncate block">{r.name}</span>
                      <span className="text-xs text-zinc-500 font-bold">{r.price.toLocaleString()} {t.points}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(r)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                      canAfford
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? t.redeem : t.notEnough}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-xs text-zinc-600">
              <Trophy className="w-3 h-3 inline mr-1" />
              {lang === 'es' ? 'Mejor combo' : 'Best combo'}: {maxCombo}x
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
