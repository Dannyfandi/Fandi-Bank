'use client'

import { useState } from 'react'
import { Sparkles, Coins, DollarSign, CheckCircle, Loader2, AlertCircle, Flame } from 'lucide-react'
import { orderHappyShopWithLoan, orderHappyShopWithCoins } from '@/app/dashboard/actions'
import { formatCOP } from '@/utils/currency'

interface JointProduct {
  id: string
  name: string
  subtitle: string
  emoji: string
  options: {
    label: string
    quantity: number
    priceCOP: number
    priceCoins: number
  }[]
}

const PRODUCTS: JointProduct[] = [
  {
    id: 'small',
    name: 'Joint Pequeño (Personal)',
    subtitle: 'Tamaño compacto, pegada suave y perfecta',
    emoji: '🌿',
    options: [
      { label: '1 Unidad', quantity: 1, priceCOP: 3000, priceCoins: 3000 },
      { label: '2 Unidades (Promo)', quantity: 2, priceCOP: 5000, priceCoins: 5000 },
    ],
  },
  {
    id: 'big',
    name: 'Joint Grande (King Size)',
    subtitle: 'Tamaño extra grande para compartir o sesión intensa',
    emoji: '🔥',
    options: [
      { label: '1 Unidad', quantity: 1, priceCOP: 6000, priceCoins: 6000 },
      { label: '2 Unidades (Promo)', quantity: 2, priceCOP: 10000, priceCoins: 10000 },
    ],
  },
]

export function HappyShop({ userCoins = 0 }: { userCoins?: number }) {
  const [selectedProduct, setSelectedProduct] = useState<JointProduct>(PRODUCTS[0])
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'loan' | 'coins'>('loan')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeOption = selectedProduct.options[selectedOptionIdx]

  const handleOrder = async () => {
    setLoading(true)
    setStatusMsg(null)

    try {
      if (paymentMethod === 'loan') {
        const res = await orderHappyShopWithLoan(
          `${selectedProduct.name} (${activeOption.label})`,
          activeOption.priceCOP
        )
        if (res.success) {
          setStatusMsg({ type: 'success', text: '✅ ' + res.message })
        } else {
          setStatusMsg({ type: 'error', text: '❌ ' + (res.message || 'Error al procesar') })
        }
      } else {
        if (userCoins < activeOption.priceCoins) {
          setStatusMsg({
            type: 'error',
            text: `❌ No tienes suficientes Fandi Coins (Necesitas ${activeOption.priceCoins})`,
          })
          setLoading(false)
          return
        }

        const res = await orderHappyShopWithCoins(
          `${selectedProduct.name} (${activeOption.label})`,
          activeOption.priceCoins
        )
        if (res.success) {
          setStatusMsg({ type: 'success', text: '✅ ¡Pedido realizado con tus Fandi Coins!' })
        } else {
          setStatusMsg({ type: 'error', text: '❌ ' + (res.message || 'Error al procesar') })
        }
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: '❌ Error: ' + (e?.message || 'Error inesperado') })
    } finally {
      setLoading(false)
      setTimeout(() => setStatusMsg(null), 4500)
    }
  }

  return (
    <div className="p-5 sm:p-7 rounded-[32px] glass-panel-heavy border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6 bg-gradient-to-b from-emerald-950/20 via-black/50 to-emerald-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/40">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 text-shadow-sm">
                The Happy Shop
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Premium
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Compra con tus Fandi Coins o agrégalo a tu cuenta como préstamo.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-2 self-start sm:self-auto">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-300">
            Saldo: <strong className="text-emerald-300 font-black">{userCoins} Coins</strong>
          </span>
        </div>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRODUCTS.map((prod) => {
          const isSelected = selectedProduct.id === prod.id

          return (
            <div
              key={prod.id}
              onClick={() => {
                setSelectedProduct(prod)
                setSelectedOptionIdx(0)
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer touch-feedback relative overflow-hidden flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{prod.emoji}</span>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-zinc-100">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{prod.subtitle}</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
              </div>

              {/* Quantity Options within selected */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {prod.options.map((opt, oIdx) => {
                  const isOptSelected = isSelected && selectedOptionIdx === oIdx

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(prod)
                        setSelectedOptionIdx(oIdx)
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isOptSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-xs font-black text-white">{opt.label}</p>
                      <p className="text-[11px] font-bold text-emerald-300">
                        {formatCOP(opt.priceCOP)}
                      </p>
                      <p className="text-[9px] text-zinc-400">o {opt.priceCoins} Coins</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Payment Method Selector & Checkout Card */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-black/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
              Método de Pago
            </span>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('loan')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border touch-feedback ${
                  paymentMethod === 'loan'
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-md'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Préstamo / Deuda ({formatCOP(activeOption.priceCOP)})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('coins')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border touch-feedback ${
                  paymentMethod === 'coins'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Fandi Coins ({activeOption.priceCoins} 🪙)</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block">
              Total a pagar
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">
              {paymentMethod === 'loan'
                ? formatCOP(activeOption.priceCOP)
                : `${activeOption.priceCoins} Coins`}
            </span>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-spring-scale ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 touch-feedback disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Flame className="w-4 h-4" />
          )}
          <span>
            {paymentMethod === 'loan'
              ? `Pedir y Cargar ${formatCOP(activeOption.priceCOP)} como Deuda`
              : `Pedir con ${activeOption.priceCoins} Fandi Coins`}
          </span>
        </button>
      </div>
    </div>
  )
}
