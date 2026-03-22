'use client'

import { useState } from 'react'
import { Receipt, CreditCard, Wallet, ChevronDown, Star, AlertTriangle, User, Calendar, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { formatCOP } from '@/utils/currency'
import { DebtSearch } from '@/components/DebtSearch'

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
    creditBonus: 'Credit',
    noDebts: 'No debts!',
    loanBdg: 'Loan',
    paymentHistory: 'Payment History',
    initial: 'Initial',
    interest: 'Interest',
    paid: 'Paid',
    paidStatus: 'paid',
    pendingStatus: 'pending',
    logout: 'Log Out',
    quickPay: 'Quick Pay (Copy Nequi Key)',
    quickPayDone: 'Key copied! Go to your bank app.',
    showDebts: 'Show All Debts',
    created: 'Created',
  },
  es: {
    score: 'Puntos:',
    suspendedHeader: 'CUENTA SUSPENDIDA',
    suspendedBody: 'Tienes una deuda con más de 180 días de retraso. Tus privilegios en Fandi Bank están suspendidos.',
    myDebts: 'Mis Deudas',
    totalOwed: 'Total Pendiente',
    creditBonus: 'Crédito',
    noDebts: '¡No hay deudas!',
    loanBdg: 'Préstamo',
    paymentHistory: 'Historial',
    initial: 'Inicial',
    interest: 'Interés',
    paid: 'Pagado',
    paidStatus: 'pagado',
    pendingStatus: 'pendiente',
    logout: 'Salir',
    quickPay: 'Pago Rápido (Copiar Llave Nequi)',
    quickPayDone: '¡Llave copiada! Ve a tu app bancaria.',
    showDebts: 'Ver Todas las Deudas',
    created: 'Creado',
  }
}

export function DashboardClient({ profile, debts, allocations, totalOwed, credits, score, isSuspended, lang, interestMap }: DashboardClientProps) {
  const t = dict[lang]
  const [filteredDebts, setFilteredDebts] = useState(debts)
  const [copied, setCopied] = useState(false)
  const llavez = "dannyfandi.3@gmail.com"

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
    <>
      {isSuspended && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-950/80 border-2 border-red-500 rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-2xl shadow-red-500/20 animate-[pulse_2s_ease-in-out_infinite]">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-red-500 tracking-tighter">{t.suspendedHeader}</h2>
            <p className="text-red-200 mt-1 font-medium text-sm">{t.suspendedBody}</p>
          </div>
        </div>
      )}

      {/* Total Owed Card */}
      <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-2xl shadow-purple-900/20 mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10">
          <Wallet className="w-20 h-20 sm:w-32 sm:h-32 text-purple-500" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 relative z-10">{t.totalOwed}</p>
        <p className={`text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter relative z-10 ${totalOwed > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
          {totalOwed === 0 ? '$0' : formatCOP(totalOwed)}
        </p>
        {credits > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-widest">{t.creditBonus}: {formatCOP(credits)}</span>
          </div>
        )}
        
        {/* QuickPay Button */}
        {totalOwed > 0 && (
          <div className="mt-4 relative z-10">
            <button 
              onClick={handleCopy}
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-black font-black tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.quickPayDone : t.quickPay}
            </button>
            {copied && (
              <p className="text-purple-400 text-xs text-center sm:text-left font-medium animate-in fade-in slide-in-from-top-2 mt-2">
                {llavez}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Debts Collapsible Section */}
      <details open className="group/debts">
        <summary className="cursor-pointer list-none flex items-center gap-3 mb-4">
          <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          <h2 className="text-xl sm:text-2xl font-bold">{t.myDebts}</h2>
          <span className="text-xs text-zinc-500 font-bold ml-1">({filteredDebts.length})</span>
          <ChevronDown className="w-4 h-4 text-zinc-500 ml-auto group-open/debts:rotate-180 transition-transform" />
        </summary>

        {/* Search */}
        <div className="mb-4">
          <DebtSearch debts={debts} onFilter={setFilteredDebts} lang={lang} />
        </div>

        <div className="space-y-3">
          {filteredDebts.length === 0 ? (
            <div className="p-8 sm:p-12 border border-zinc-800/50 rounded-3xl text-center text-zinc-500 bg-zinc-900/10">
              {t.noDebts}
            </div>
          ) : (
            filteredDebts.map(debt => {
              const amount = Number(debt.amount)
              const interest = interestMap[debt.id] || 0
              const paid = Number(debt.paid_amount || 0)
              const debtAllocs = allocations?.filter(a => a.debt_id === debt.id) || []
              const createdDate = new Date(debt.created_at).toLocaleDateString()

              return (
                <div key={debt.id} className="p-4 sm:p-5 border border-white/5 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[20px] hover:border-purple-500/30 transition-all shadow-lg group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-zinc-200 text-sm sm:text-base">{debt.description}</h3>
                      {debt.is_loan && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[10px] uppercase tracking-widest font-black">{t.loanBdg}</span>}
                    </div>
                    <span className={`px-2 sm:px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border shrink-0 ${
                      debt.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span className="text-[11px] text-zinc-500 font-medium">{t.created}: {createdDate}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t.initial}</p>
                      <p className="text-zinc-300 font-medium text-sm">{formatCOP(amount)}</p>
                    </div>
                    {interest > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-bold mb-1">{t.interest}</p>
                        <p className="text-amber-500 font-medium text-sm">+{formatCOP(interest)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{t.paid}</p>
                      <p className="text-zinc-300 font-medium text-sm">{formatCOP(paid)}</p>
                    </div>
                  </div>

                  {debtAllocs.length > 0 && (
                    <details className="pt-3 border-t border-zinc-800/50 group/details text-sm">
                      <summary className="cursor-pointer text-zinc-400 hover:text-purple-400 font-bold list-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                        {t.paymentHistory} <ChevronDown className="w-3 h-3 group-open/details:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-3 space-y-2">
                        {debtAllocs.map(alloc => (
                          <div key={alloc.id} className="flex justify-between items-center text-zinc-400 bg-black/20 p-2 rounded-lg text-xs sm:text-sm">
                            <span>{new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}</span>
                            <span className="font-medium text-emerald-400">+{formatCOP(alloc.allocated_amount)}</span>
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
    </>
  )
}
