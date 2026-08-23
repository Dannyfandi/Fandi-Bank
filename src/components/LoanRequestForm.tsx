'use client'

import { useState } from 'react'
import { Landmark } from 'lucide-react'
import { submitLoanRequest } from '@/app/dashboard/actions'
import { SubmitButton } from './SubmitButton'

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
      <div className="p-4 bg-amber-950/40 border border-amber-500/25 rounded-2xl text-xs sm:text-sm text-amber-200/90 leading-relaxed shadow-inner">
        <strong className="text-amber-400 block mb-1.5 text-sm sm:text-base font-bold">
          Fandi Bank Loans:
        </strong>
        Need extra cash? Request up to <strong>$500.000 COP</strong>!
        <br />
        <br />
        <em className="text-amber-300 relative z-10">
          Note: Loans automatically accrue a simple <strong>0.051% daily interest</strong> based strictly on the original principal. No interest-over-interest!
        </em>
      </div>

      <div>
        <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
          Amount (COP)
        </label>
        <input
          name="amount"
          type="number"
          required
          placeholder="Max 500000"
          max="500000"
          min="1000"
          className="w-full px-4 py-3 glass-input rounded-2xl text-zinc-100 placeholder-zinc-500 text-sm"
        />
      </div>

      <SubmitButton
        loadingText="Requesting..."
        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 transition-all touch-feedback shadow-lg shadow-amber-600/25"
      >
        <Landmark className="w-4 h-4" /> Request Loan
      </SubmitButton>

      {msg && (
        <p
          className={`text-xs text-center font-bold p-2.5 rounded-xl border ${
            msg.includes('🎉') || msg.includes('Pending')
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'text-red-400 bg-red-500/15 border-red-500/30'
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  )
}
