'use client'

import { useState } from 'react'
import { Landmark } from 'lucide-react'
import { submitLoanRequest } from '@/app/dashboard/actions'

export function LoanRequestForm() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (formData: FormData) => {
    if (loading) return
    setLoading(true)
    const err = await submitLoanRequest(formData)
    if (err) setMsg(err)
    else setMsg('Pending for approval ⏳')
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-xl text-sm text-amber-200/90 leading-relaxed shadow-inner">
        <strong className="text-amber-400 block mb-2 text-base">Fandi Bank Loans:</strong>
        Need extra cash? Request up to <strong>$500.000 COP</strong>! 
        <br/><br/>
        <em className="text-amber-300 relative z-10">Note: Loans automatically accrue a simple <strong>0.051% daily interest</strong> based strictly on the original principal. No interest-over-interest!</em>
      </div>
      
      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount (COP)</label>
        <input name="amount" type="number" required placeholder="Max 500000" max="500000" min="1000" className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
      </div>
      
      <button disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-zinc-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
        <Landmark className="w-5 h-5" /> {loading ? 'Requesting...' : 'Request Loan'}
      </button>
      {msg && <p className={`text-sm text-center font-bold ${msg.includes('🎉') ? 'text-purple-400' : 'text-red-400'}`}>{msg}</p>}
    </form>
  )
}
