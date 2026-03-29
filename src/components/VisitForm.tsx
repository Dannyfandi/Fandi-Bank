'use client'

import { useState } from 'react'
import { MapPin, CalendarClock, CheckCircle } from 'lucide-react'
import { submitVisitRequest } from '@/app/dashboard/actions'
import { SubmitButton } from './SubmitButton'

export function VisitForm() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleDirections = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=Calle+33+%2317+-+56,+Bogota,+Colombia", "_blank")
  }

  const handleSubmit = async (formData: FormData) => {
    if (loading) return // prevent double-submit
    setLoading(true)
    setMsg('')
    const err = await submitVisitRequest(formData)
    if (err) setMsg(err)
    else setMsg('Pending for approval ⏳')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
       <form action={handleSubmit} className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
             <input type="date" name="date" required className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" />
           </div>
           <div>
             <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">ETA</label>
             <input type="time" name="time" required className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" />
           </div>
         </div>
         <div>
           <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stay Plan</label>
           <select name="stay" required className="mt-1 w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50">
             <option value="">Select option...</option>
             <option value="I will not stay">I will not stay</option>
             <option value="I will stay 1 night">I will stay 1 night</option>
             <option value="I will stay 2+ nights">I will stay 2+ nights</option>
             <option value="I will 90% stay but not sure">I will 90% stay but not sure</option>
             <option value="I will 90% go but not sure">I will 90% go but not sure</option>
           </select>
         </div>
         <SubmitButton loadingText="Sending..." fallbackLoading={loading} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-fuchsia-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
           <CalendarClock className="w-4 h-4" /> Request Visit
         </SubmitButton>
         {msg && <p className={`text-sm text-center font-bold ${msg.includes('🎉') ? 'text-purple-400' : 'text-red-400'}`}>{msg}</p>}
       </form>

       <button onClick={handleDirections} className="w-full py-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 text-black font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 transition-all active:scale-[0.98]">
         <MapPin className="w-5 h-5" /> Get Directions
       </button>
    </div>
  )
}
