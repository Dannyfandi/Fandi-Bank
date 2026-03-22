'use client'

import { useState } from 'react'
import { Calculator, Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { formatCOP } from '@/utils/currency'

const dict = {
  en: {
    title: 'Loan Simulator',
    subtitle: 'Estimate your loan costs before applying.',
    amount: 'Loan Amount (COP)',
    startDate: 'Starting Date',
    duration: 'Estimated Pay Time',
    days: 'days',
    calculate: 'Calculate',
    results: 'Simulation Results',
    principal: 'Principal',
    totalInterest: 'Total Interest (0.051%/day)',
    totalPayment: 'Total to Pay',
    daily: 'Daily Interest',
    durations: [
      { label: '15 days', value: 15 },
      { label: '30 days', value: 30 },
      { label: '60 days', value: 60 },
      { label: '90 days', value: 90 },
      { label: '120 days', value: 120 },
      { label: '180 days', value: 180 },
    ]
  },
  es: {
    title: 'Simulador de Préstamo',
    subtitle: 'Estima los costos de tu préstamo antes de aplicar.',
    amount: 'Monto del Préstamo (COP)',
    startDate: 'Fecha de Inicio',
    duration: 'Tiempo Estimado de Pago',
    days: 'días',
    calculate: 'Calcular',
    results: 'Resultado de Simulación',
    principal: 'Capital',
    totalInterest: 'Interés Total (0.051%/día)',
    totalPayment: 'Total a Pagar',
    daily: 'Interés Diario',
    durations: [
      { label: '15 días', value: 15 },
      { label: '30 días', value: 30 },
      { label: '60 días', value: 60 },
      { label: '90 días', value: 90 },
      { label: '120 días', value: 120 },
      { label: '180 días', value: 180 },
    ]
  }
}

interface LoanSimulatorProps {
  lang: 'en' | 'es'
}

export function LoanSimulator({ lang }: LoanSimulatorProps) {
  const t = dict[lang]
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState(30)
  const [showResult, setShowResult] = useState(false)

  const principal = Number(amount) || 0
  const dailyRate = 0.00051 // 0.051%
  const dailyInterest = principal * dailyRate
  const totalInterest = dailyInterest * days
  const totalPayment = principal + totalInterest

  return (
    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
      <h3 className="font-bold flex items-center gap-2 text-emerald-400 mb-1 text-sm sm:text-base">
        <Calculator className="w-4 h-4" /> {t.title}
      </h3>
      <p className="text-xs text-zinc-500 mb-4">{t.subtitle}</p>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1 block">{t.amount}</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setShowResult(false) }}
              placeholder="100000"
              max={500000}
              className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1 block">{t.duration}</label>
          <div className="flex flex-wrap gap-2">
            {t.durations.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => { setDays(d.value); setShowResult(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  days === d.value
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-transparent text-zinc-500 border-white/10 hover:text-zinc-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowResult(true)}
          disabled={!principal || principal > 500000}
          className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-xl text-sm transition-colors border border-emerald-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> {t.calculate}
        </button>
      </div>

      {showResult && principal > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-black/30 border border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs uppercase tracking-widest font-bold text-emerald-400">{t.results}</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.principal}</p>
              <p className="text-sm font-bold text-zinc-200">{formatCOP(principal)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.daily}</p>
              <p className="text-sm font-bold text-amber-400">{formatCOP(dailyInterest)}/{t.days === 'días' ? 'día' : 'day'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.totalInterest}</p>
              <p className="text-sm font-bold text-amber-500">{formatCOP(totalInterest)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{t.totalPayment}</p>
              <p className="text-lg font-black text-emerald-400">{formatCOP(totalPayment)}</p>
            </div>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min((totalInterest / principal) * 100 * 10, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 text-center">
            {((totalInterest / principal) * 100).toFixed(2)}% interest over {days} {t.days}
          </p>
        </div>
      )}
    </div>
  )
}
