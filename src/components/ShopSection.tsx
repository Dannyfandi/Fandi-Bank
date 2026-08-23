'use client'

import { useState } from 'react'
import { ShoppingBag, Coins, ChevronDown, CheckCircle, AlertTriangle, X, Loader2, Sparkles } from 'lucide-react'
import { HappyShop } from './HappyShop'
import { AnimatedNumber } from './AnimatedNumber'
import { requestPrize } from '@/app/dashboard/actions'

interface Reward {
  name: string
  price: number
  emoji: string
}

const REWARDS_I18N = {
  es: [
    { name: 'Galletas Oreo (paq. de 4)', price: 2300, emoji: '🍪' },
    { name: 'Paquete de Gomas', price: 3500, emoji: '🍬' },
    { name: 'Media Marlboro Rojo', price: 7000, emoji: '🚬' },
    { name: 'Media Lucky Sandía', price: 7000, emoji: '🚬' },
    { name: 'Helado C&W (800ml)', price: 32900, emoji: '🍨' },
    { name: 'Helado C&W (1.5L)', price: 44900, emoji: '🍦' },
    { name: 'Bacardí Mojito (750ml)', price: 56000, emoji: '🍹' },
    { name: 'Bacardí Zombie (750ml)', price: 59400, emoji: '🧟' },
  ],
  en: [
    { name: 'Oreo Cookies (4-pack)', price: 2300, emoji: '🍪' },
    { name: 'Gummy Package', price: 3500, emoji: '🍬' },
    { name: 'Media Marlboro Rojo', price: 7000, emoji: '🚬' },
    { name: 'Media Lucky Sandía', price: 7000, emoji: '🚬' },
    { name: 'C&W Ice Cream (800ml)', price: 32900, emoji: '🍨' },
    { name: 'C&W Ice Cream (1.5L)', price: 44900, emoji: '🍦' },
    { name: 'Bacardí Mojito (750ml)', price: 56000, emoji: '🍹' },
    { name: 'Bacardí Zombie (750ml)', price: 59400, emoji: '🧟' },
  ],
}

export function ShopSection({
  userCoins = 0,
  lang = 'es',
}: {
  userCoins?: number
  lang?: 'en' | 'es'
}) {
  const rewards = REWARDS_I18N[lang] || REWARDS_I18N.es
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestMsg, setRequestMsg] = useState('')

  const handleRequestPrize = async (reward: Reward) => {
    setIsRequesting(true)
    setRequestMsg('')

    const result = await requestPrize(reward.name, reward.price)

    if (result.success) {
      setRequestMsg(
        '✅ ' +
          (lang === 'es'
            ? '¡Solicitud enviada! El admin revisará tu pedido.'
            : 'Request sent! Admin will review your order.')
      )
    } else {
      setRequestMsg('❌ ' + (result.message || 'Error al procesar'))
    }

    setIsRequesting(false)
    setTimeout(() => {
      setConfirmReward(null)
      setRequestMsg('')
    }, 2500)
  }

  return (
    <div id="shop-section" className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent text-shadow-sm">
              {lang === 'es' ? 'Tienda & Recompensas' : 'Shop & Rewards'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              {lang === 'es'
                ? 'Canjea tus Fandi Coins por premios o productos exclusivos'
                : 'Redeem your Fandi Coins for prizes or exclusive items'}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl glass-panel border border-emerald-500/30 flex items-center gap-2 self-start sm:self-auto">
          <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">
              Fandi Coins
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-300 leading-none">
              <AnimatedNumber value={userCoins} duration={600} formatAsCurrency={false} />
            </span>
          </div>
        </div>
      </div>

      {/* 1. The Happy Shop (Joints & Custom Deals) */}
      <HappyShop userCoins={userCoins} />

      {/* 2. Fandi Bank General Rewards Catalog */}
      <details open className="group/shop glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-zinc-100 text-shadow-sm flex items-center gap-2">
                {lang === 'es' ? 'Catálogo de Recompensas Fandi' : 'Fandi Rewards Catalog'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {lang === 'es' ? 'Canjea directamente con monedas' : 'Redeem directly with coins'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-400 group-open/shop:rotate-180 transition-transform duration-300" />
        </summary>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar pt-2">
          {rewards.map((r) => {
            const canAfford = userCoins >= r.price
            return (
              <div
                key={r.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-emerald-500/30 transition-all gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{r.emoji}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-zinc-100 text-xs sm:text-sm truncate block">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {r.price.toLocaleString()} Fandi Coins
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && setConfirmReward(r)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 touch-feedback ${
                    canAfford
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer'
                      : 'bg-zinc-800/40 text-zinc-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? (lang === 'es' ? 'Pedir' : 'Redeem') : (lang === 'es' ? 'Faltan coins' : 'Not enough')}
                </button>
              </div>
            )
          })}
        </div>
      </details>

      {/* Confirmation Modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-spring-scale">
          <div className="w-full max-w-sm glass-panel-heavy rounded-3xl p-6 border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-3xl">{confirmReward.emoji}</span>
              <button
                onClick={() => {
                  setConfirmReward(null)
                  setRequestMsg('')
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-white bg-white/10 touch-feedback"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">
                {lang === 'es' ? 'Confirmar Pedido' : 'Confirm Prize Request'}
              </h3>
              <p className="text-xs text-zinc-300">
                {lang === 'es'
                  ? `¿Deseas canjear "${confirmReward.name}" por ${confirmReward.price} Fandi Coins?`
                  : `Redeem "${confirmReward.name}" for ${confirmReward.price} coins?`}
              </p>
            </div>

            {requestMsg && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30">
                {requestMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmReward(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 font-bold text-xs hover:bg-white/5 touch-feedback"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={() => handleRequestPrize(confirmReward)}
                disabled={isRequesting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider shadow-lg touch-feedback flex items-center justify-center gap-1.5"
              >
                {isRequesting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{lang === 'es' ? 'Confirmar' : 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
