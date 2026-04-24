'use client'

import { useState } from 'react'
import { Gift, CheckCircle, XCircle, Clock, Coins } from 'lucide-react'
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
  const pending = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  if (requests.length === 0) return null

  return (
    <div className="mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/30 backdrop-blur-[40px] border border-white/10 shadow-xl">
      <h3 className="font-bold text-base flex items-center gap-2 text-emerald-400 mb-4">
        <Gift className="w-5 h-5" /> Prize Requests
        {pending.length > 0 && (
          <span className="ml-2 px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full uppercase tracking-widest">
            {pending.length} pending
          </span>
        )}
      </h3>

      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          {pending.map(req => (
            <div key={req.id} className="p-4 rounded-xl bg-amber-900/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-100 text-sm">{req.item_name}</p>
                <p className="text-xs text-zinc-400">
                  <span className="text-amber-400 font-bold">{req.cost.toLocaleString()} Fandi Coins</span>
                  {' · '}
                  {req.profiles?.username || req.profiles?.email || req.user_id.slice(0, 8)}
                  {' · '}
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={updatePrizeRequestStatus}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="approved" />
                  <SubmitButton className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </SubmitButton>
                </form>
                <form action={updatePrizeRequestStatus}>
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <SubmitButton className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-zinc-500 font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors list-none flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> History ({resolved.length})
          </summary>
          <div className="mt-3 space-y-2">
            {resolved.slice(0, 20).map(req => (
              <div key={req.id} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-zinc-300 text-xs truncate">{req.item_name}</p>
                  <p className="text-[10px] text-zinc-500">{req.profiles?.username || req.user_id.slice(0, 8)} · {req.cost.toLocaleString()} coins</p>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${
                  req.status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
