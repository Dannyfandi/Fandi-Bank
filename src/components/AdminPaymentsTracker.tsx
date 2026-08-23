'use client'

import { useState } from 'react'
import { Wallet, Undo2, X, AlertOctagon, ChevronDown, Search } from 'lucide-react'
import { formatCOP } from '@/utils/currency'
import { SubmitButton } from './SubmitButton'
import { reversePayment } from '@/app/admin/actions'

export function AdminPaymentsTracker({
  payments,
  allocations,
  users,
}: {
  payments: any[]
  allocations: any[]
  users: any[]
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [searchUser, setSearchUser] = useState('')

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.username || u.email]))

  const enrichedPayments = payments
    .map((p) => {
      const paymentAllocs = allocations.filter((a) => a.payment_id === p.id)
      return {
        ...p,
        username: userMap[p.user_id] || 'Unknown User',
        allocations: paymentAllocs,
      }
    })
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  const filteredPayments = enrichedPayments.filter((p) =>
    p.username.toLowerCase().includes(searchUser.toLowerCase())
  )

  return (
    <details className="space-y-4 group/adminpayments glass-panel rounded-[28px] p-4 sm:p-6 border border-white/10 shadow-xl">
      <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <h3 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2.5 text-shadow-sm">
          <Wallet className="w-5 h-5 text-emerald-400" /> Historial de Pagos
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {filteredPayments.length}
          </span>
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por usuario..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-3.5 py-2 glass-input rounded-2xl text-xs text-zinc-200"
            />
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-400 group-open/adminpayments:rotate-180 transition-transform duration-300 shrink-0" />
        </div>
      </summary>

      <div className="pt-3 space-y-3">
        {filteredPayments.length === 0 ? (
          <p className="text-zinc-500 text-xs py-4 text-center">
            No se encontraron pagos registrados.
          </p>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-black/45 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-all shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-100 text-xs sm:text-sm truncate">
                      {p.username}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-emerald-400">
                    +{formatCOP(p.total_amount)}
                  </p>
                  {p.description && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Reverse Payment Button / Confirmation */}
              <div className="self-end sm:self-auto">
                {confirmId === p.id ? (
                  <div className="flex items-center gap-2 p-2 bg-red-950/50 border border-red-500/30 rounded-xl">
                    <span className="text-[10px] text-red-300 font-bold">
                      ¿Revertir pago?
                    </span>
                    <form action={reversePayment}>
                      <input type="hidden" name="paymentId" value={p.id} />
                      <SubmitButton
                        loadingText=".."
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Sí
                      </SubmitButton>
                    </form>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 touch-feedback flex items-center gap-1.5 text-xs font-bold"
                    title="Revertir Pago"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Revertir</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </details>
  )
}
