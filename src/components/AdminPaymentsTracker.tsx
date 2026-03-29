'use client'

import { useState } from 'react'
import { Wallet, Undo2, X, AlertOctagon } from 'lucide-react'
import { formatCOP } from '@/utils/currency'
import { SubmitButton } from './SubmitButton'
import { reversePayment } from '@/app/admin/actions'

export function AdminPaymentsTracker({
  payments,
  allocations,
  users
}: {
  payments: any[]
  allocations: any[]
  users: any[]
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Map users
  const userMap = Object.fromEntries(users.map(u => [u.id, u.username || u.email]))

  // Enrich payments
  const enrichedPayments = payments.map(p => {
    const paymentAllocs = allocations.filter(a => a.payment_id === p.id)
    return {
      ...p,
      username: userMap[p.user_id] || 'Unknown User',
      allocations: paymentAllocs
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-emerald-400" /> All Payments
      </h3>
      
      {enrichedPayments.length === 0 && <p className="text-sm text-zinc-500">No payments found.</p>}

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {enrichedPayments.map(p => {
          const isConfirming = confirmId === p.id
          
          return (
            <div key={p.id} className="p-4 border border-emerald-500/20 rounded-2xl bg-zinc-900/30 backdrop-blur-[40px] relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-zinc-200">{p.username}</h4>
                  <p className="text-[10px] text-zinc-500">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400">+{formatCOP(p.total_amount)}</p>
                </div>
              </div>

              {p.allocations.length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-emerald-500/80 hover:text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                    View Allocations ({p.allocations.length})
                  </summary>
                  <div className="mt-2 p-2 bg-black/40 rounded-lg space-y-1">
                    {p.allocations.map((a: any) => (
                      <div key={a.id} className="flex justify-between text-zinc-400">
                        <span className="truncate pr-2">↳ Debt: ...{a.debt_id.slice(-6)}</span>
                        <span className="shrink-0">{formatCOP(a.allocated_amount)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="mt-3 flex justify-end">
                {isConfirming ? (
                  <div className="flex gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-200">
                    <button 
                      onClick={() => setConfirmId(null)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <form action={reversePayment} className="flex-1">
                      <input type="hidden" name="paymentId" value={p.id} />
                      <SubmitButton 
                        loadingText="Reversing..."
                        className="w-full py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-500 font-black tracking-widest uppercase rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" /> Confirm Reverse
                      </SubmitButton>
                    </form>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmId(p.id)}
                    className="px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-emerald-500/60 hover:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" /> Reverse Payment
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
