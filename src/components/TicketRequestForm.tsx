'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { submitTicketRequest } from '@/app/dashboard/actions'

export function TicketRequestForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    const errorMsg = await submitTicketRequest(formData)
    setLoading(false)
    if (errorMsg) {
      setMessage(errorMsg)
    } else {
      setMessage('Request submitted successfully!')
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-fuchsia-950/30 border border-fuchsia-500/20 rounded-xl text-sm text-fuchsia-200/90 leading-relaxed shadow-inner">
        <strong className="text-fuchsia-400 block mb-2 text-base">How it works:</strong>
        Request Fandi to secure your concert ticket in presale! When you're ready to pay it back, you will owe the original presale price <strong>PLUS 50% of the difference</strong> between the presale price and the current (more expensive) ticket price. 
        <br/><br/>
        <em className="text-fuchsia-300">Example: If I buy it for $100k, and it now costs $200k, you pay me $100k + $50k = <strong>$150k</strong> instead of the full $200k! 🎟️</em>
      </div>
      
      <form action={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Name</label>
          <input
            name="eventName"
            type="text"
            required
            placeholder="e.g. Estereo Picnic 2026"
            className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
          />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Date(s)</label>
          <input
            name="eventDate"
            type="text"
            required
            placeholder="e.g. Oct 12-14, Friday only"
            className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
          />
          <p className="mt-1 text-[10px] text-zinc-500 px-1">Helps me buy the exact right days!</p>
        </div>

        <button
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-500/20 text-zinc-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Ticket className="w-5 h-5" />
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
        {message && (
          <p className={`text-sm text-center font-bold ${message.includes('success') ? 'text-purple-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
