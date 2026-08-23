'use client'

import { useState } from 'react'
import { MapPin, CalendarClock } from 'lucide-react'
import { submitVisitRequest } from '@/app/dashboard/actions'
import { SubmitButton } from './SubmitButton'

export function VisitForm() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleDirections = () => {
    window.open(
      'https://www.google.com/maps/dir/?api=1&destination=Calle+33+%2317+-+56,+Bogota,+Colombia',
      '_blank'
    )
  }

  const handleSubmit = async (formData: FormData) => {
    if (loading) return
    setLoading(true)
    setMsg('')
    const err = await submitVisitRequest(formData)
    if (err) setMsg(err)
    else setMsg('Pending for approval ⏳')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              required
              className="w-full px-3 py-2.5 glass-input rounded-2xl text-zinc-100 text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
              ETA
            </label>
            <input
              type="time"
              name="time"
              required
              className="w-full px-3 py-2.5 glass-input rounded-2xl text-zinc-100 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 pl-1 block mb-1">
            Stay Plan
          </label>
          <select
            name="stay"
            required
            className="w-full px-3.5 py-3 glass-input rounded-2xl text-zinc-100 text-xs bg-zinc-900"
          >
            <option value="" className="bg-zinc-900 text-zinc-400">
              Select option...
            </option>
            <option value="I will not stay" className="bg-zinc-900 text-white">
              I will not stay
            </option>
            <option value="I will stay 1 night" className="bg-zinc-900 text-white">
              I will stay 1 night
            </option>
            <option value="I will stay 2+ nights" className="bg-zinc-900 text-white">
              I will stay 2+ nights
            </option>
            <option value="I will 90% stay but not sure" className="bg-zinc-900 text-white">
              I will 90% stay but not sure
            </option>
            <option value="I will 90% go but not sure" className="bg-zinc-900 text-white">
              I will 90% go but not sure
            </option>
          </select>
        </div>

        <SubmitButton
          loadingText="Sending..."
          fallbackLoading={loading}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-fuchsia-400 border border-fuchsia-500/30 font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 transition-all touch-feedback shadow-md"
        >
          <CalendarClock className="w-4 h-4" /> Request Visit
        </SubmitButton>

        {msg && (
          <p
            className={`text-xs text-center font-bold p-2.5 rounded-xl border ${
              msg.includes('🎉') || msg.includes('Pending')
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : 'text-red-400 bg-red-500/15 border-red-500/30'
            }`}
          >
            {msg}
          </p>
        )}
      </form>

      <button
        onClick={handleDirections}
        className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/25 transition-all touch-feedback"
      >
        <MapPin className="w-4 h-4" /> Get Directions
      </button>
    </div>
  )
}
