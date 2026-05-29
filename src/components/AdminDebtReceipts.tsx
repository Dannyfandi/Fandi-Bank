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

  // Convert object to array for filtering
  const entries = Object.entries(debtsByUser).map(([uid, group]: any) => ({
    uid,
    username: group.username,
    avatarUrl: group.avatarUrl,
    debts: group.debts
  }))

  const filtered = entries.map(group => {
    let filteredDebts = group.debts

    // Apply text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchUsername = group.username.toLowerCase().includes(term)
      
      filteredDebts = filteredDebts.filter((d: any) => {
        const matchDesc = d.description.toLowerCase().includes(term)
        const matchDate = new Date(d.created_at).toLocaleDateString().includes(term)
        return matchDesc || matchDate || matchUsername // Keep all debts if username matches, else only matching debts
      })
    }

    // Apply date range filter (only keeps debts created within range)
    if (startDate || endDate) {
      filteredDebts = filteredDebts.filter((d: any) => {
        const dDate = new Date(d.created_at)
        // Reset time for fair comparison
        dDate.setHours(0, 0, 0, 0)
        
        let passStart = true
        let passEnd = true
        
        if (startDate) {
          const sDate = new Date(startDate)
          // Adjust for timezone issues by using local date parsing if needed, but standard string is usually ok
          // Best to just compare YYYY-MM-DD
          sDate.setHours(0,0,0,0)
          sDate.setDate(sDate.getDate() + 1) // basic timezone fix
          passStart = dDate >= new Date(startDate + 'T00:00:00')
        }
        if (endDate) {
          passEnd = dDate <= new Date(endDate + 'T23:59:59')
        }
        return passStart && passEnd
      })
    }

    return { ...group, debts: filteredDebts }
  }).filter(group => group.debts.length > 0)

  // Calculate total of filtered debts (initial amount)
  const totalFilteredAmount = filtered.reduce((acc, group) => {
    return acc + group.debts.reduce((sum: number, d: any) => sum + Number(d.amount), 0)
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-6 sm:pt-8 mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <Receipt className="w-5 h-5 text-zinc-500" /> {t.receipts}
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2 py-1 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest shrink-0">Desde:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-xs text-zinc-200 outline-none w-[110px]" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest shrink-0">Hasta:</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-xs text-zinc-200 outline-none w-[110px]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
        </div>
      </div>

      {(startDate || endDate || searchTerm) && (
        <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-2xl flex items-center justify-between">
           <span className="text-xs font-bold uppercase tracking-widest">Total en filtro:</span>
           <span className="font-black text-lg">{formatCOP(totalFilteredAmount)}</span>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-zinc-500 border border-white/10 rounded-2xl bg-zinc-900/10">No matches found.</div>
        ) : (
          filtered.map(group => (
            <details key={group.uid} className="border border-white/10 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] overflow-hidden shadow-lg group/userDebts">
              <summary className="cursor-pointer list-none flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/20 bg-black flex items-center justify-center shrink-0">
                    {group.avatarUrl ? (
                      <img src={group.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <span className="font-bold text-zinc-200">{group.username}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-full">{group.debts.length} debts</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-open/userDebts:rotate-180 transition-transform" />
              </summary>

              <div className="border-t border-white/10 divide-y divide-white/5">
                {group.debts.map((debt: any) => {
                  const amount = Number(debt.amount)
                  const paid = Number(debt.paid_amount || 0)
                  const interest = Number(debt.interest_override || 0) // Placeholder logic to match layout structure
                  const debtAllocs = allocations?.filter((a: any) => a.debt_id === debt.id) || []
                  const createdDate = new Date(debt.created_at).toLocaleDateString()

                  return (
                    <div key={debt.id} className="p-3 sm:p-4 hover:bg-white/5 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-zinc-200 text-sm">{debt.description}</span>
                          {debt.is_loan && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] uppercase tracking-widest font-black">{t.loanBadge}</span>}
                          <span className="text-[10px] text-zinc-600">{t.created}: {createdDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${debt.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {debt.status === 'paid' ? t.paidStatus : t.pendingStatus}
                          </span>
                          {debt.status === 'pending' && (
                            <form action={markDebtPaid} className="inline"><input type="hidden" name="debtId" value={debt.id} /><SubmitButton loadingText=".." title="Mark Paid" className="p-1.5 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-colors"><Check className="w-3 h-3" /></SubmitButton></form>
                          )}
                          <form action={deleteDebt} className="inline"><input type="hidden" name="debtId" value={debt.id} /><SubmitButton loadingText=".." title="Delete" className="p-1.5 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><X className="w-3 h-3" /></SubmitButton></form>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs">
                         <span className="text-zinc-500">{t.initialLabel}: <span className="text-zinc-300">{formatCOP(amount)}</span></span>
                         <span className="text-zinc-500">{t.paidLabel}: <span className="text-zinc-300">{formatCOP(paid)}</span></span>
                      </div>
                      {debtAllocs.length > 0 && (
                        <details className="mt-2 group/allocs">
                          <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-purple-500 font-bold list-none flex items-center gap-1 hover:text-purple-400">
                            {t.paymentHistory} <ChevronDown className="w-2.5 h-2.5 group-open/allocs:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-2 space-y-1">
                            {debtAllocs.map((alloc: any) => (
                              <div key={alloc.id} className="flex justify-between text-xs text-zinc-400 bg-black/20 p-1.5 rounded">
                                <span>{new Date(alloc.payments?.created_at || alloc.created_at).toLocaleDateString()}</span>
                                <span className="font-bold text-purple-400">+{formatCOP(alloc.allocated_amount)}</span>
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
