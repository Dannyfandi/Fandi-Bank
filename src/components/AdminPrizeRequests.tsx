'use client'

import { Gift, CheckCircle, XCircle } from 'lucide-react'
import { updatePrizeRequestStatus } from '@/app/admin/actions'
import { SubmitButton } from './SubmitButton'

interface PrizeRequest {
  id: string
  user_id: string
  item_name: string
  cost: number
  status: string
  created_at: string
  profiles?: { username?: string; email?: string }
}

export function AdminPrizeRequests({ requests }: { requests: PrizeRequest[] }) {
  const pending = requests.filter((r) => r.status === 'pending')

  if (requests.length === 0) return null

  return (
    <details
      open={pending.length > 0}
      className="p-4 sm:p-6 rounded-[28px] glass-panel border border-white/10 shadow-xl space-y-4"
    >
      <summary className="cursor-pointer list-none flex items-center justify-between select-none">
        <h3 className="font-black text-base sm:text-lg flex items-center gap-2.5 text-emerald-400 text-shadow-sm">
          <Gift className="w-5 h-5" /> Solicitudes de Premios
          {pending.length > 0 && (
            <span className="ml-2 px-2.5 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
              {pending.length} pendientes
            </span>
          )}
        </h3>
      </summary>

      {pending.length > 0 && (
        <div className="space-y-3 pt-2">
          {pending.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex-1 min-w-0">
                <p className="font-black text-zinc-100 text-sm sm:text-base">
                  {req.item_name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  <span className="text-amber-400 font-bold">
                    {req.cost.toLocaleString()} Fandi Coins
                  </span>
                  {' · '}
                  <span className="text-zinc-200 font-semibold">
                    {req.profiles?.username ||
                      req.profiles?.email ||
                      req.user_id.slice(0, 8)}
                  </span>
                  {' · '}
                  <span className="text-zinc-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={updatePrizeRequestStatus}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="approved" />
                  <SubmitButton className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 touch-feedback">
                    <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                  </SubmitButton>
                </form>
                <form action={updatePrizeRequestStatus}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <SubmitButton className="px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 touch-feedback">
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </details>
  )
}
