'use client'

import { useState } from 'react'
import {
  Receipt,
  CreditCard,
  Wallet,
  ChevronDown,
  AlertTriangle,
  Calendar,
  Copy,
  Check,
} from 'lucide-react'
import { formatCOP } from '@/utils/currency'
import { DebtSearch } from '@/components/DebtSearch'
import { AnimatedNumber } from '@/components/AnimatedNumber'

interface DashboardClientProps {
  profile: any
  debts: any[]
  allocations: any[]
  totalOwed: number
  credits: number
  score: number
  isSuspended: boolean
  lang: 'en' | 'es'
  interestMap: Record<string, number>
}

const dict = {
  en: {
    score: 'Score:',
    suspendedHeader: 'ACCOUNT SUSPENDED',
    suspendedBody: 'You have a debt that is over 180 days past due. Your Fandi Bank privileges are suspended.',
    myDebts: 'My Debts',
    totalOwed: 'Total Owed Pending',
    creditBonus: 'Credit Balance',
    noDebts: 'No debts currently registered!',
    loanBdg: 'Loan',
    paymentHistory: 'Payment History',
    initial: 'Initial Amount',
    interest: 'Accrued Interest',
    paid: 'Paid to Date',
    paidStatus: 'Paid',
    pendingStatus: 'Pending',
    quickPay: 'Quick Pay (Copy Nequi)',
    quickPayDone: 'Nequi key copied!',
    created: 'Created',
  },
  es: {
    score: 'Puntos:',
    suspendedHeader: 'CUENTA SUSPENDIDA',
    suspendedBody: 'Tienes una deuda con más de 180 días de retraso. Tus privilegios en Fandi Bank están suspendidos.',
    myDebts: 'Mis Deudas',
    totalOwed: 'Total Pendiente',
    creditBonus: 'Saldo a Favor',
    noDebts: '¡No tienes deudas pendientes!',
    loanBdg: 'Préstamo',
    paymentHistory: 'Historial de Pagos',
    initial: 'Monto Inicial',
    interest: 'Interés Acumulado',
    paid: 'Total Pagado',
    paidStatus: 'Pagado',
    pendingStatus: 'Pendiente',
    quickPay: 'Pago Rápido (Copiar Nequi)',
    quickPayDone: '¡Llave Nequi copiada!',
    created: 'Fecha',
  },
}

export function DashboardClient({
  debts,
  allocations,
  totalOwed,
  credits,
  isSuspended,
  lang,
  interestMap,
}: DashboardClientProps) {
  const t = dict[lang] || dict.es
  const [filteredDebts, setFilteredDebts] = useState(debts)
  const [copied, setCopied] = useState(false)
  const llavez = 'dannyfandi.3@gmail.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(llavez)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Suspended Alert */}
      {isSuspended && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 sm:p-6 flex items-start gap-3.5 shadow-2xl shadow-red-500/20 animate-pulse">
          <AlertTriangle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-red-400 tracking-tight">
              {t.suspendedHeader}
            </h2>
            <p className="text-red-200/90 mt-1 font-medium text-sm leading-relaxed">
              {t.suspendedBody}
            </p>
          </div>
        </div>
      )}

      {/* Hero Card: Total Owed with Animated Number */}
      <div className="p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] glass-panel-heavy relative overflow-hidden shadow-2xl animate-spring-fade-in border border-white/15">
        {/* Glow & Watermark */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-10 pointer-events-none">
          <Wallet className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-black text-zinc-400 uppercase tracking-widest text-shadow-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-purple-400" /> {t.totalOwed}
            </span>
            {credits > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 text-[11px] font-bold text-purple-300">
                <CreditCard className="w-3.5 h-3.5" /> {t.creditBonus}: {formatCOP(credits)}
              </span>
            )}
          </div>

          <div className="mt-1 mb-4">
            <p
              className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-shadow-lg ${
                totalOwed > 0
                  ? 'text-rose-300 drop-shadow-[0_0_25px_rgba(244,63,94,0.7)]'
                  : 'text-emerald-300 drop-shadow-[0_0_25px_rgba(52,211,153,0.7)]'
              }`}
            >
              <AnimatedNumber value={totalOwed} formatAsCurrency={true} duration={900} />
            </p>
          </div>

          {/* Quick Pay Action Button */}
          {totalOwed > 0 && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <button
                onClick={handleCopy}
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-black font-black tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-purple-500/30 text-sm touch-feedback"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t.quickPayDone : t.quickPay}
              </button>
              {copied && (
                <span className="text-purple-300 text-xs font-semibold px-2 animate-in fade-in">
                  {llavez}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debts Collapsible Accordion (Closed by default on load) */}
      <details className="group/debts glass-panel rounded-[28px] p-5 sm:p-6 shadow-xl border border-white/10">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-100 text-shadow-sm flex items-center gap-2">
                {t.myDebts}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-bold">
                  {filteredDebts.length}
                </span>
              </h2>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-400 group-open/debts:rotate-180 transition-transform duration-300" />
        </summary>

        {/* Search */}
        <div className="mt-5 mb-4">
          <DebtSearch debts={debts} onFilter={setFilteredDebts} lang={lang} />
        </div>

        {/* List of debts with staggered animation */}
        <div className="space-y-3 pt-1">
          {filteredDebts.length === 0 ? (
            <div className="p-8 border border-white/5 rounded-2xl text-center text-zinc-400 bg-black/20 text-sm">
              {t.noDebts}
            </div>
          ) : (
            filteredDebts.map((debt, index) => {
              const amount = Number(debt.amount)
              const interest = interestMap[debt.id] || 0
              const paid = Number(debt.paid_amount || 0)
              const debtAllocs = allocations?.filter((a) => a.debt_id === debt.id) || []
              const createdDate = new Date(debt.created_at).toLocaleDateString()

              return (
                <div
                  key={debt.id}
                  style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
                  className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/30 transition-all shadow-md group animate-spring-fade-in"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h3 className="font-bold text-zinc-100 text-sm sm:text-base truncate">
                        {debt.description}
                      </h3>
                      {debt.is_loan && (
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] uppercase tracking-widest font-black shrink-0">
                          {t.loanBdg}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-black rounded-full border shrink-0 ${
                        debt.status === 'paid'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 mb-3 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-medium">
                      {t.created}: {createdDate}
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 p-3 bg-black/25 rounded-xl border border-white/5 mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">
                        {t.initial}
                      </p>
                      <p className="text-zinc-100 font-extrabold text-xs sm:text-sm">
                        {formatCOP(amount)}
                      </p>
                    </div>
                    {interest > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-amber-400/90 font-bold mb-0.5">
                          {t.interest}
                        </p>
                        <p className="text-amber-300 font-extrabold text-xs sm:text-sm">
                          +{formatCOP(interest)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">
                        {t.paid}
                      </p>
                      <p className="text-emerald-400 font-extrabold text-xs sm:text-sm">
                        {formatCOP(paid)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Allocations Collapsible */}
                  {debtAllocs.length > 0 && (
                    <details className="pt-2 border-t border-white/5 group/details text-xs">
                      <summary className="cursor-pointer text-zinc-400 hover:text-purple-300 font-bold list-none flex items-center justify-center gap-1.5 py-1 uppercase tracking-wider touch-feedback">
                        <span>{t.paymentHistory}</span>
                        <ChevronDown className="w-3.5 h-3.5 group-open/details:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {debtAllocs.map((alloc) => (
                          <div
                            key={alloc.id}
                            className="flex justify-between items-center text-zinc-300 bg-black/40 p-2 rounded-lg text-xs"
                          >
                            <span>
                              {new Date(
                                alloc.payments?.created_at || alloc.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span className="font-bold text-emerald-400">
                              +{formatCOP(alloc.allocated_amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )
            })
          )}
        </div>
      </details>
    </div>
  )
}
