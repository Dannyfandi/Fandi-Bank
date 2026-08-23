'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { submitTicketRequest } from '@/app/dashboard/actions'
import { SubmitButton } from './SubmitButton'

export function TicketRequestForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function onSubmit(formData: FormData) {
    if (loading) return
    setLoading(true)
    setMessage('')
    const errorMsg = await submitTicketRequest(formData)
    setLoading(false)
    if (errorMsg) {
      setMessage(errorMsg)
    } else {
      setMessage('Pending for approval ⏳')
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-fuchsia-950/40 border border-fuchsia-500/25 rounded-2xl text-xs sm:text-sm text-fuchsia-200/90 leading-relaxed shadow-inner">
        <strong className="text-fuchsia-400 block mb-1.5 text-sm sm:text-base font-bold">
          How it works:
        </strong>
        Request Fandi to secure your concert ticket in presale! When you&apos;re ready to pay it back, you will owe the original presale price <strong>PLUS 50% of the difference</strong> between the presale price and the current (more expensive) ticket price.
        <br />
        <br />
        <em className="text-fuchsia-300">
          Example: If I buy it for $100k, and it now costs $200k, you pay me $100k + $50k = <strong>$150k</strong> instead of the full $200k! 🎟️
        </em>
      </div>

      <form action={onSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
            Event Name
          </label>
          <input
            name="eventName"
            type="text"
            required
            placeholder="e.g. Estereo Picnic 2026"
            className="w-full px-4 py-3 glass-input rounded-2xl text-zinc-100 placeholder-zinc-500 text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
            Event Date(s)
          </label>
          <input
            name="eventDate"
            type="text"
            required
            placeholder="e.g. Oct 12-14, Friday only"
            className="w-full px-4 py-3 glass-input rounded-2xl text-zinc-100 placeholder-zinc-500 text-sm"
          />
          <p className="mt-1 text-[10px] text-zinc-500 px-1 font-medium">
            Helps verify exact dates and ticket batches!
          </p>
        </div>

        <SubmitButton
          className="w-full py-3.5 px-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-500/25 text-white font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 transition-all touch-feedback disabled:opacity-50"
          loadingText="Submitting..."
        >
          <Ticket className="w-4 h-4" />
          Submit Request
        </SubmitButton>

        {message && (
          <p
            className={`text-xs text-center font-bold p-2.5 rounded-xl border ${
              message.includes('Pending') || message.includes('success')
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
