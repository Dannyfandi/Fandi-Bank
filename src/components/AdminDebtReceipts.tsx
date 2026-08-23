'use client'

import { useState } from 'react'
import { User, Receipt, ChevronDown, Search, Check, X } from 'lucide-react'
import { formatCOP } from '@/utils/currency'
import { markDebtPaid, deleteDebt } from '@/app/admin/actions'
import { SubmitButton } from './SubmitButton'

export function AdminDebtReceipts({ debtsByUser, allocations, t }: any) {
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const entries = Object.entries(debtsByUser).map(([uid, group]: any) => ({
    uid,
    username: group.username,
    avatarUrl: group.avatarUrl,
    debts: group.debts,
  }))

  const filtered = entries
    .map((group) => {
      let filteredDebts = group.debts

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchUsername = group.username.toLowerCase().includes(term)

        filteredDebts = filteredDebts.filter((d: any) => {
          const matchDesc = d.description.toLowerCase().includes(term)
          const matchDate = new Date(d.created_at).toLocaleDateString().includes(term)
          return matchDesc || matchDate || matchUsername
        })
      }

      if (startDate || endDate) {
        filteredDebts = filteredDebts.filter((d: any) => {
          const dDate = new Date(d.created_at)
          dDate.setHours(0, 0, 0, 0)

          let passStart = true
          let passEnd = true

          if (startDate) {
            passStart = dDate >= new Date(startDate + 'T00:00:00')
          }
          if (endDate) {
            passEnd = dDate <= new Date(endDate + 'T23:59:59')
          }
          return passStart && passEnd
        })
      }

      return { ...group, debts: filteredDebts }
    })
    .filter((group) => group.debts.length > 0)

  const totalFilteredAmount = filtered.reduce((acc, group) => {
    return (
      acc +
      group.debts.reduce((sum: number, d: any) => sum + Number(d.amount), 0)
    )
  }, 0)

  return (
    <div className="space-y-4 pt-6 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-black flex items-center gap-2.5 text-zinc-100 text-shadow-sm">
          <Receipt className="w-5 h-5 text-purple-400" /> {t.receipts}
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Date Filters */}
          <div className="flex items-center gap-2 glass-panel rounded-2xl px-3 py-1.5 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider shrink-0">
              Desde:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none w-[110px]"
            />
            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider shrink-0">
              Hasta:
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none w-[110px]"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, item, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass-input rounded-2xl text-xs sm:text-sm text-zinc-200"
            />
          </div>
        </div>
      </div>

      {(startDate || endDate || searchTerm) && (
        <div className="glass-panel border-purple-500/30 text-purple-300 px-4 py-3 rounded-2xl flex items-center justify-between shadow-md">
          <span className="text-xs font-bold uppercase tracking-widest">
            Total en filtro:
          </span>
          <span className="font-black text-base sm:text-lg">
            {formatCOP(totalFilteredAmount)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 glass-panel rounded-2xl text-sm">
            No matching receipts found.
          </div>
        ) : (
          filtered.map((group) => (
            <details
              key={group.uid}
              className="glass-panel rounded-3xl overflow-hidden shadow-lg group/userDebts border border-white/10"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-500/30 bg-black flex items-center justify-center shrink-0">
                    {group.avatarUrl ? (
                      <img
                        src={group.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <span className="font-bold text-zinc-100 text-sm sm:text-base">
                    {group.username}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                    {group.debts.length} Total Debts
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-open/userDebts:rotate-180 transition-transform duration-300" />
              </summary>

              <div className="border-t border-white/10 divide-y divide-white/5 bg-black/30">
                {group.debts.map((debt: any) => {
                  const amount = Number(debt.amount)
                  const paid = Number(debt.paid_amount || 0)
                  const debtAllocs =
                    allocations?.filter((a: any) => a.debt_id === debt.id) || []
                  const createdDate = new Date(debt.created_at).toLocaleDateString()

                  return (
                    <div
                      key={debt.id}
                      className="p-3.5 sm:p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-zinc-200 text-xs sm:text-sm">
                            {debt.description}
                          </span>
                          {debt.is_loan && (
                            <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded text-[9px] uppercase tracking-widest font-black">
                              {t.loanBadge}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-500">
                            {t.created}: {createdDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                              debt.status === 'paid'
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                          </span>
                          {debt.status === 'pending' && (
                            <form action={markDebtPaid} className="inline">
                              <input type="hidden" name="debtId" value={debt.id} />
                              <SubmitButton
                                loadingText=".."
                                title="Mark Paid"
                                className="p-1.5 border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-xl transition-colors touch-feedback"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </SubmitButton>
                            </form>
                          )}
                          <form action={deleteDebt} className="inline">
                            <input type="hidden" name="debtId" value={debt.id} />
                            <SubmitButton
                              loadingText=".."
                              title="Delete"
                              className="p-1.5 border border-red-500/30 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl transition-colors touch-feedback"
                            >
                              <X className="w-3.5 h-3.5" />
                            </SubmitButton>
                          </form>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="text-zinc-400">
                          {t.initialLabel}:{' '}
                          <span className="text-zinc-100 font-extrabold">
                            {formatCOP(amount)}
                          </span>
                        </span>
                        <span className="text-zinc-400">
                          {t.paidLabel}:{' '}
                          <span className="text-emerald-400 font-extrabold">
                            {formatCOP(paid)}
                          </span>
                        </span>
                      </div>
                      {debtAllocs.length > 0 && (
                        <details className="mt-2 group/allocs">
                          <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-purple-400 font-black list-none flex items-center gap-1 hover:text-purple-300 touch-feedback select-none">
                            {t.paymentHistory}{' '}
                            <ChevronDown className="w-3 h-3 group-open/allocs:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-2 space-y-1">
                            {debtAllocs.map((alloc: any) => (
                              <div
                                key={alloc.id}
                                className="flex justify-between text-xs text-zinc-300 bg-black/40 p-2 rounded-xl"
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
                })}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  )
}
